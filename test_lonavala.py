"""
Test Lonavala_Input_0.tif directly through the Attention U-Net.
This replicates exactly what the training/test pipeline does.

Usage:
  python test_lonavala.py <path_to_Lonavala_Input_0.tif>

Example:
  python test_lonavala.py "C:/Users/Admin/Downloads/Lonavala_Input_0.tif"
"""

import sys, os, io, base64
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

# ── Model path ────────────────────────────────────────────────────────────────
MODEL_DIR  = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'model')
UNET_PATH  = os.path.join(MODEL_DIR, 'attention_unet_dice_ce_best.pth')

CLASS_NAMES = ['Not Suitable', 'Moderately Suitable', 'Suitable']
CLASS_RGBA  = [(17,24,39,220), (234,179,8,220), (22,163,74,220)]  # black, yellow, green

# ── Architecture ──────────────────────────────────────────────────────────────
import torch.nn as nn

class DoubleConv(nn.Module):
    def __init__(self, i, o):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(i,o,3,padding=1), nn.BatchNorm2d(o), nn.ReLU(inplace=True),
            nn.Conv2d(o,o,3,padding=1), nn.BatchNorm2d(o), nn.ReLU(inplace=True))
    def forward(self, x): return self.conv(x)

class AttentionGate(nn.Module):
    def __init__(self, Fg, Fl, Fi):
        super().__init__()
        self.W_g = nn.Sequential(nn.Conv2d(Fg,Fi,1), nn.BatchNorm2d(Fi))
        self.W_x = nn.Sequential(nn.Conv2d(Fl,Fi,1), nn.BatchNorm2d(Fi))
        self.psi = nn.Sequential(nn.Conv2d(Fi,1,1),  nn.BatchNorm2d(1), nn.Sigmoid())
    def forward(self, g, x):
        return x * self.psi(F.relu(self.W_g(g) + self.W_x(x), inplace=True))

class AttentionUNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.enc1=DoubleConv(11,32);  self.enc2=DoubleConv(32,64)
        self.enc3=DoubleConv(64,128); self.enc4=DoubleConv(128,256)
        self.pool=nn.MaxPool2d(2,2)
        self.bottleneck=DoubleConv(256,512)
        self.att4=AttentionGate(256,256,128); self.att3=AttentionGate(128,128,64)
        self.att2=AttentionGate(64,64,32);    self.att1=AttentionGate(32,32,16)
        self.up4=nn.ConvTranspose2d(512,256,2,2); self.dec4=DoubleConv(512,256)
        self.up3=nn.ConvTranspose2d(256,128,2,2); self.dec3=DoubleConv(256,128)
        self.up2=nn.ConvTranspose2d(128,64,2,2);  self.dec2=DoubleConv(128,64)
        self.up1=nn.ConvTranspose2d(64,32,2,2);   self.dec1=DoubleConv(64,32)
        self.final=nn.Conv2d(32,3,1)
    def forward(self, x):
        e1=self.enc1(x); e2=self.enc2(self.pool(e1))
        e3=self.enc3(self.pool(e2)); e4=self.enc4(self.pool(e3))
        b=self.bottleneck(self.pool(e4))
        d4=self.up4(b);  d4=self.dec4(torch.cat([d4,self.att4(d4,e4)],1))
        d3=self.up3(d4); d3=self.dec3(torch.cat([d3,self.att3(d3,e3)],1))
        d2=self.up2(d3); d2=self.dec2(torch.cat([d2,self.att2(d2,e2)],1))
        d1=self.up1(d2); d1=self.dec1(torch.cat([d1,self.att1(d1,e1)],1))
        return self.final(d1)


def run_test(tif_path):
    print(f'\n{"="*60}')
    print(f'Testing: {os.path.basename(tif_path)}')
    print(f'{"="*60}')

    # ── 1. Read the .tif file ─────────────────────────────────────────────
    try:
        import rasterio
        with rasterio.open(tif_path) as src:
            image = src.read().astype(np.float32)  # (11, H, W)
        print(f'[✓] Loaded: shape={image.shape}, dtype=float32')
    except ImportError:
        print('[!] rasterio not installed. Installing...')
        os.system('pip install rasterio -q')
        import rasterio
        with rasterio.open(tif_path) as src:
            image = src.read().astype(np.float32)

    print(f'    Min={image.min():.4f}  Max={image.max():.4f}')
    print(f'    Band stats:')
    band_names = ['B4','B3','B2','NDVI','Slope','Elev','WaterDist','Temp','Rainfall','SAR_VV','SAR_VH']
    for i, name in enumerate(band_names):
        b = image[i]
        print(f'      {name:12s}: min={b.min():.3f}  max={b.max():.3f}  mean={b.mean():.3f}')

    # ── 2. Load model ─────────────────────────────────────────────────────
    model = AttentionUNet()
    state = torch.load(UNET_PATH, map_location='cpu', weights_only=True)
    model.load_state_dict(state)
    model.eval()
    print(f'\n[✓] Model loaded: {UNET_PATH}')

    # ── 3. Prepare tensor (resize to 256×256 if needed) ──────────────────
    _, H, W = image.shape
    if H != 256 or W != 256:
        # Resize each band
        resized = np.zeros((11, 256, 256), dtype=np.float32)
        for b in range(11):
            from PIL import Image as PILImg
            band_img = PILImg.fromarray(image[b])
            resized[b] = np.array(band_img.resize((256, 256), PILImg.BILINEAR))
        image = resized
        print(f'[!] Resized to 256×256')

    tensor = torch.from_numpy(image).unsqueeze(0)  # (1,11,256,256)
    print(f'[✓] Tensor shape: {tuple(tensor.shape)}')

    # ── 4. Run inference ──────────────────────────────────────────────────
    with torch.no_grad():
        logits = model(tensor)                        # (1,3,256,256)
        probs  = F.softmax(logits, dim=1)             # (1,3,256,256)
        pred   = torch.argmax(probs, dim=1)[0].numpy()  # (256,256)
        mean_p = probs[0].mean(dim=(1,2)).numpy()     # (3,)

    print(f'\n[✓] Inference done!')
    print(f'    Mean probabilities:')
    for i, name in enumerate(CLASS_NAMES):
        bar = '█' * int(mean_p[i] * 30)
        print(f'      {name:22s}: {mean_p[i]:.4f}  {bar}')

    score    = float(sum([0.0, 0.5, 1.0][i] * mean_p[i] for i in range(3)))
    pred_cls = CLASS_NAMES[int(np.argmax(mean_p))]

    print(f'\n    Predicted class : {pred_cls}')
    print(f'    Suitability score: {score:.4f}')

    # ── 5. Pixel distribution ─────────────────────────────────────────────
    print(f'\n    Pixel distribution:')
    total = pred.size
    for i, name in enumerate(CLASS_NAMES):
        count = int((pred == i).sum())
        pct   = count / total * 100
        bar   = '█' * int(pct / 2)
        print(f'      {name:22s}: {count:6d} px ({pct:5.1f}%)  {bar}')

    # ── 6. Save segmentation PNG ──────────────────────────────────────────
    rgba = np.zeros((256, 256, 4), dtype=np.uint8)
    for cls_id, color in enumerate(CLASS_RGBA):
        rgba[pred == cls_id] = color

    out_path = tif_path.replace('.tif', '_segmentation.png')
    Image.fromarray(rgba, 'RGBA').save(out_path)
    print(f'\n[✓] Segmentation saved: {out_path}')

    # ── 7. Save RGB preview ───────────────────────────────────────────────
    r = np.clip(image[0] * 255, 0, 255).astype(np.uint8)  # B4
    g = np.clip(image[1] * 255, 0, 255).astype(np.uint8)  # B3
    b = np.clip(image[2] * 255, 0, 255).astype(np.uint8)  # B2
    rgb_img = Image.fromarray(np.stack([r,g,b], axis=2), 'RGB')
    rgb_path = tif_path.replace('.tif', '_rgb.png')
    rgb_img.save(rgb_path)
    print(f'[✓] RGB preview saved: {rgb_path}')

    print(f'\n{"="*60}')
    print(f'RESULT: {pred_cls} (score={score:.4f})')
    print(f'{"="*60}\n')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python test_lonavala.py <path_to_tif>')
        print('Example: python test_lonavala.py "C:/path/to/Lonavala_Input_0.tif"')
        sys.exit(1)

    tif_path = sys.argv[1]
    if not os.path.exists(tif_path):
        print(f'File not found: {tif_path}')
        sys.exit(1)

    run_test(tif_path)
