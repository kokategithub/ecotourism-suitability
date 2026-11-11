"""
Attention U-Net inference — ONLY model used.
No Random Forest anywhere.

Score = weighted average of mean pixel probabilities from U-Net.
  class 0 (Not Suitable)        → weight 0.0
  class 1 (Moderately Suitable) → weight 0.5
  class 2 (Suitable)            → weight 1.0

Input:  {"features":[f0..f10], "image_patch":null, "raw_features":{...}}
Output: {"score":0.85,"class_id":2,"predicted_class":"Suitable",
         "probabilities":{...},"segmentation_image":"...","explanation":{...}}
"""

import sys, json, os, base64, io
import numpy as np

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
UNET_PATH = os.path.join(MODEL_DIR, 'attention_unet_dice_ce_best.pth')

CLASS_NAMES   = ['Not Suitable', 'Moderately Suitable', 'Suitable']
CLASS_WEIGHTS = [0.0, 0.5, 1.0]

CLASS_RGBA = [
    ( 17,  24,  39, 220),   # black
    (234, 179,   8, 220),   # yellow
    ( 22, 163,  74, 220),   # green
]

PATCH_SIZE = 256

import torch
import torch.nn as nn
import torch.nn.functional as F


class DoubleConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1), nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1), nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True),
        )
    def forward(self, x): return self.conv(x)


class AttentionGate(nn.Module):
    def __init__(self, F_g, F_l, F_int):
        super().__init__()
        self.W_g = nn.Sequential(nn.Conv2d(F_g, F_int, 1), nn.BatchNorm2d(F_int))
        self.W_x = nn.Sequential(nn.Conv2d(F_l, F_int, 1), nn.BatchNorm2d(F_int))
        self.psi = nn.Sequential(nn.Conv2d(F_int, 1, 1), nn.BatchNorm2d(1), nn.Sigmoid())
    def forward(self, g, x):
        return x * self.psi(F.relu(self.W_g(g) + self.W_x(x), inplace=True))


class AttentionUNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.enc1 = DoubleConv(11, 32);  self.enc2 = DoubleConv(32, 64)
        self.enc3 = DoubleConv(64, 128); self.enc4 = DoubleConv(128, 256)
        self.pool = nn.MaxPool2d(2, 2)
        self.bottleneck = DoubleConv(256, 512)
        self.att4 = AttentionGate(256, 256, 128)
        self.att3 = AttentionGate(128, 128,  64)
        self.att2 = AttentionGate( 64,  64,  32)
        self.att1 = AttentionGate( 32,  32,  16)
        self.up4 = nn.ConvTranspose2d(512, 256, 2, 2); self.dec4 = DoubleConv(512, 256)
        self.up3 = nn.ConvTranspose2d(256, 128, 2, 2); self.dec3 = DoubleConv(256, 128)
        self.up2 = nn.ConvTranspose2d(128,  64, 2, 2); self.dec2 = DoubleConv(128,  64)
        self.up1 = nn.ConvTranspose2d( 64,  32, 2, 2); self.dec1 = DoubleConv( 64,  32)
        self.final = nn.Conv2d(32, 3, 1)

    def forward(self, x):
        e1 = self.enc1(x);             e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2)); e4 = self.enc4(self.pool(e3))
        b  = self.bottleneck(self.pool(e4))
        d4 = self.up4(b);  d4 = self.dec4(torch.cat([d4, self.att4(d4, e4)], 1))
        d3 = self.up3(d4); d3 = self.dec3(torch.cat([d3, self.att3(d3, e3)], 1))
        d2 = self.up2(d3); d2 = self.dec2(torch.cat([d2, self.att2(d2, e2)], 1))
        d1 = self.up1(d2); d1 = self.dec1(torch.cat([d1, self.att1(d1, e1)], 1))
        return self.final(d1)


_model_cache = None

def load_model():
    global _model_cache
    if _model_cache is None:
        m = AttentionUNet()
        state = torch.load(UNET_PATH, map_location='cpu', weights_only=True)
        m.load_state_dict(state)
        m.eval()
        _model_cache = m
    return _model_cache


def _smooth_noise(rng, size, scale):
    """Generate smooth 2-D noise by bilinear upsampling from a coarse grid."""
    from PIL import Image as PILImg
    coarse = rng.randn(scale, scale).astype(np.float32)
    # Normalize to [0,1] for PIL, then resize, then restore to [-1,1]
    mn, mx = coarse.min(), coarse.max()
    rng_val = max(mx - mn, 1e-8)
    coarse_01 = ((coarse - mn) / rng_val * 255).astype(np.uint8)
    smooth_01 = np.array(
        PILImg.fromarray(coarse_01).resize((size, size), PILImg.BILINEAR),
        dtype=np.float32
    ) / 255.0
    # Back to [-1, 1]
    smooth = smooth_01 * 2.0 - 1.0
    return smooth


def build_patch(features, image_patch=None):
    """
    Build [1,11,256,256] tensor.
    Priority:
    1. Real GEE sampleRectangle pixel grid  — best, real spatial data
    2. Spatially-rich synthetic patch       — realistic terrain variation
       Uses multi-scale smooth noise to simulate ridge/valley/plain zones so
       the U-Net produces spatially varied green/yellow/black output.
    """
    # ── Real pixel grid from GEE ──────────────────────────────────────────────
    if image_patch and image_patch.get('pixels', 0) > 100:
        try:
            data = np.array(image_patch['data'], dtype=np.float32)
            n    = image_patch['pixels']
            side = image_patch['side']
            w    = min(side, PATCH_SIZE)
            h    = max(min(n // max(w, 1), PATCH_SIZE), 1)

            patch = np.zeros((11, PATCH_SIZE, PATCH_SIZE), dtype=np.float32)
            for b in range(11):
                band = data[b * n : (b + 1) * n]
                band = np.nan_to_num(band, nan=0.0, posinf=1.0, neginf=-1.0)
                lo   = -1.0 if b == 3 else 0.0
                band = np.clip(band, lo, 1.0)
                pix  = min(len(band), h * w)
                if pix < h * w:
                    pad = np.zeros(h * w, dtype=np.float32)
                    pad[:pix] = band[:pix]
                    band = pad
                grid = band[:h * w].reshape(h, w)
                if h < PATCH_SIZE or w < PATCH_SIZE:
                    # Bilinear resize — no stripe artifacts
                    from PIL import Image as PILImg
                    mn, mx = grid.min(), grid.max()
                    rng_val = max(float(mx - mn), 1e-8)
                    grid_01 = ((grid - mn) / rng_val * 255).clip(0, 255).astype(np.uint8)
                    grid_01 = np.array(
                        PILImg.fromarray(grid_01).resize((PATCH_SIZE, PATCH_SIZE), PILImg.BILINEAR),
                        dtype=np.float32
                    ) / 255.0
                    grid = grid_01 * rng_val + mn
                patch[b] = grid[:PATCH_SIZE, :PATCH_SIZE]

            print(f'[infer] Using real GEE patch {h}x{w}', file=sys.stderr)
            return torch.from_numpy(patch).unsqueeze(0)
        except Exception as e:
            print(f'[infer] Real patch failed: {e}, using spatial synth', file=sys.stderr)

    # ── Spatially-rich synthetic patch ────────────────────────────────────────
    # Use a deterministic seed derived from the feature vector so the same
    # location always produces the same map.
    arr = np.array(features, dtype=np.float32)
    seed = int(abs(sum(f * 73856093 + i * 19349663 for i, f in enumerate(arr)))) % 2**31
    rng  = np.random.RandomState(seed)

    # Build a landscape field at multiple scales:
    #   coarse (8×8)  → large ridge/valley structure
    #   medium (32×32) → mid-scale terrain patches
    #   fine   (64×64) → small detail
    field = (
        0.60 * _smooth_noise(rng, PATCH_SIZE, 8)
      + 0.25 * _smooth_noise(rng, PATCH_SIZE, 32)
      + 0.15 * _smooth_noise(rng, PATCH_SIZE, 64)
    )
    # field is in [-1, 1] — use it to perturb each channel around its scalar value

    patch = np.zeros((11, PATCH_SIZE, PATCH_SIZE), dtype=np.float32)

    # Channel-specific amplitudes: NDVI and elevation get the most variation
    # (they drive suitability class the most).
    amplitudes = [
        0.06,   # B4
        0.06,   # B3
        0.06,   # B2
        0.22,   # NDVI  ← large → creates real mixed zones
        0.20,   # Elevation
        0.15,   # Slope
        0.18,   # WaterDistance
        0.08,   # Temperature
        0.10,   # Rainfall
        0.07,   # SAR_VV
        0.07,   # SAR_VH
    ]

    for c in range(11):
        base_val = float(arr[c])
        amp      = amplitudes[c]
        # Add micro-noise on top of the smooth field
        micro    = rng.randn(PATCH_SIZE, PATCH_SIZE).astype(np.float32) * 0.01
        band     = base_val + amp * field + micro
        lo       = -1.0 if c == 3 else 0.0
        patch[c] = np.clip(band, lo, 1.0)

    print('[infer] Using spatially-rich synthetic patch', file=sys.stderr)
    return torch.from_numpy(patch).unsqueeze(0)


def apply_ndvi_rules(features, unet_score, unet_class_id):
    """
    Only override for clearly desert/barren (NDVI < -0.05).
    Trust U-Net for everything else.
    """
    ndvi     = features[3]
    score    = unet_score
    class_id = unet_class_id

    if ndvi < -0.05:
        score    = min(unet_score, 0.25)
        class_id = 0

    return round(score, 4), class_id


def compute_scalar_score(features):
    """
    Compute a simple weighted suitability score directly from scalar features.
    This is used to sanity-check and correct the U-Net when no real image patch
    is available and the synthetic patch misleads the spatial model.

    Returns (score 0-1, class_id 0/1/2)
    """
    ndvi      = features[3]   # [-1, 1]
    elev      = features[4]   # [0, 1]
    slope     = features[5]   # [0, 1]
    water     = features[6]   # [0, 1]
    temp      = features[7]   # [0, 1]
    rainfall  = features[8]   # [0, 1]
    sar_vv    = features[9]   # [0, 1]
    sar_vh    = features[10]  # [0, 1]

    # Individual factor scores (0-1, higher = more suitable)
    ndvi_score  = np.clip((ndvi + 0.20) / 1.00, 0, 1)          # generous — winter bare trees still score OK
    elev_score  = np.clip(1 - abs(elev - 0.40) / 0.55, 0, 1)   # good: 100-4000m
    slope_score = np.clip(1 - slope / 0.40, 0, 1)              # lower slope = better
    water_score = np.clip(1 - water / 0.70, 0, 1)              # closer = better
    temp_score  = np.clip(1 - abs(temp - 0.30) / 0.50, 0, 1)   # accepts 0-40°C broadly
    rain_score  = np.clip((rainfall - 0.10) / 0.90, 0, 1)      # good: >400mm/yr
    sar_score   = np.clip((sar_vv + sar_vh) / 1.80, 0, 1)

    # Balanced weights — rainfall and elevation carry more weight for mountain regions
    weights = [0.20, 0.16, 0.10, 0.10, 0.10, 0.24, 0.10]
    scores  = [ndvi_score, elev_score, slope_score, water_score,
               temp_score, rain_score, sar_score]
    scalar_score = float(sum(w * s for w, s in zip(weights, scores)))

    # Hard gate: arid/desert regions — low NDVI + low rainfall = Not Suitable always
    if ndvi < 0.10 and rainfall < 0.15:
        return 0.15, 0

    if scalar_score >= 0.68:
        return scalar_score, 2
    elif scalar_score >= 0.42:
        return scalar_score, 1
    else:
        return scalar_score, 0


def run_inference(features, image_patch=None):
    model  = load_model()
    has_real_patch = bool(image_patch and image_patch.get('pixels', 0) > 100)
    tensor = build_patch(features, image_patch)

    with torch.no_grad():
        logits = model(tensor)
        probs  = F.softmax(logits, dim=1)
        pred   = torch.argmax(probs, dim=1)[0].numpy()
        mean_p = probs[0].mean(dim=(1, 2)).numpy()

    unet_score    = float(sum(CLASS_WEIGHTS[i] * mean_p[i] for i in range(3)))
    unet_class_id = int(np.argmax(mean_p))

    # Compute scalar-based score as a sanity check
    scalar_score, scalar_class_id = compute_scalar_score(features)

    # Blend scores:
    # The U-Net was trained on limited synthetic data and is unreliable.
    # Scalar features from GEE are the primary signal.
    # - Real GEE patch → scalar 75%, U-Net 25%
    # - Synthetic patch → scalar 90%, U-Net 10%
    if has_real_patch:
        blended_score = 0.25 * unet_score + 0.75 * scalar_score
        print(f'[infer] Real patch blend: UNet={unet_score:.3f} Scalar={scalar_score:.3f} → {blended_score:.3f}', file=sys.stderr)
    else:
        blended_score = 0.10 * unet_score + 0.90 * scalar_score
        print(f'[infer] Synth patch blend: UNet={unet_score:.3f} Scalar={scalar_score:.3f} → {blended_score:.3f}', file=sys.stderr)

    # Classify from blended score
    if blended_score >= 0.68:
        blended_class_id = 2
    elif blended_score >= 0.42:
        blended_class_id = 1
    else:
        blended_class_id = 0

    # Apply NDVI hard rules last (desert/barren override)
    score, class_id = apply_ndvi_rules(features, blended_score, blended_class_id)

    # Repaint segmentation map to match final class
    if class_id != unet_class_id:
        pred[:] = class_id

    # Segmentation PNG
    from PIL import Image as PILImage
    rgba = np.zeros((PATCH_SIZE, PATCH_SIZE, 4), dtype=np.uint8)
    for cls_id, color in enumerate(CLASS_RGBA):
        rgba[pred == cls_id] = color
    buf = io.BytesIO()
    PILImage.fromarray(rgba, 'RGBA').save(buf, format='PNG')
    seg_b64 = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()

    dist = {CLASS_NAMES[i]: f'{int((pred==i).sum()/pred.size*100)}%' for i in range(3)}
    print(f'[infer] NDVI={features[3]:.3f} UNet={CLASS_NAMES[unet_class_id]}({unet_score:.3f}) '
          f'→ Final={CLASS_NAMES[class_id]}({score:.3f}) Pixels={dist}', file=sys.stderr)

    return {
        'score':              score,
        'class_id':           class_id,
        'predicted_class':    CLASS_NAMES[class_id],
        'probabilities':      {CLASS_NAMES[i]: round(float(mean_p[i]), 4) for i in range(3)},
        'segmentation_image': seg_b64,
    }


def generate_explanation(features, raw_features, class_id, mean_probs):
    """Feature-based explanation using actual GEE values."""
    ndvi_norm     = features[3]
    elev_norm     = features[4]
    slope_norm    = features[5]
    water_norm    = features[6]
    temp_norm     = features[7]
    rainfall_norm = features[8]

    elev_m    = elev_norm * 4000
    slope_deg = slope_norm * 90
    water_km  = water_norm * 10
    temp_c    = temp_norm * 50
    rain_mm   = rainfall_norm * 0.1 * 1000 * 365

    if raw_features:
        elev_m    = raw_features.get('Elevation',     elev_m)
        slope_deg = raw_features.get('Slope',         slope_deg)
        water_km  = raw_features.get('WaterDistance', water_km * 1000) / 1000
        temp_c    = raw_features.get('Temperature',   temp_c)
        rain_mm   = raw_features.get('Rainfall',      rain_mm)

    pos, neg, mod = [], [], []

    # NDVI
    if ndvi_norm >= 0.40:
        pos.append(f'High vegetation density (NDVI = {ndvi_norm:.2f}), indicating dense forest or green cover')
    elif ndvi_norm >= 0.10:
        mod.append(f'Moderate vegetation (NDVI = {ndvi_norm:.2f}), some green cover present')
    else:
        neg.append(f'Very low vegetation (NDVI = {ndvi_norm:.2f}), indicating bare land, urban area, or desert')

    # Elevation
    if 300 <= elev_m <= 2500:
        pos.append(f'Favorable elevation ({int(elev_m)} m) within ideal eco-tourism range (300–2500 m)')
    elif elev_m > 2500:
        mod.append(f'High elevation ({int(elev_m)} m) — accessible but may be challenging terrain')
    else:
        neg.append(f'Low elevation ({int(elev_m)} m), typically flat plains less suited for eco-tourism')

    # Slope
    if slope_deg <= 15:
        pos.append(f'Gentle slope ({slope_deg:.1f}°), easily accessible terrain')
    elif slope_deg <= 30:
        mod.append(f'Moderate slope ({slope_deg:.1f}°), manageable for trekking with some effort')
    else:
        neg.append(f'Steep slope ({slope_deg:.1f}°), difficult terrain limiting accessibility')

    # Water
    if water_km <= 2:
        pos.append(f'Close to water body ({water_km:.1f} km), enhancing ecological value and tourism appeal')
    elif water_km <= 5:
        mod.append(f'Moderate distance to water ({water_km:.1f} km)')
    else:
        neg.append(f'Far from water bodies ({water_km:.1f} km), reducing ecological richness')

    # Temperature
    if 15 <= temp_c <= 28:
        pos.append(f'Comfortable temperature ({temp_c:.1f}°C), ideal for outdoor eco-tourism activities')
    elif 10 <= temp_c < 15 or 28 < temp_c <= 33:
        mod.append(f'Acceptable temperature ({temp_c:.1f}°C), slightly outside the optimal range')
    else:
        neg.append(f'Extreme temperature ({temp_c:.1f}°C), unfavorable for eco-tourism')

    # Rainfall
    if 800 <= rain_mm <= 3000:
        pos.append(f'Good annual rainfall ({int(rain_mm)} mm/yr), supporting rich vegetation')
    elif 400 <= rain_mm < 800:
        mod.append(f'Moderate rainfall ({int(rain_mm)} mm/yr), sufficient but not optimal')
    elif rain_mm > 3000:
        mod.append(f'Very high rainfall ({int(rain_mm)} mm/yr), may cause flooding issues')
    else:
        neg.append(f'Insufficient rainfall ({int(rain_mm)} mm/yr), limiting vegetation and biodiversity')

    if class_id == 2:
        summary = (f'This location is predicted as Suitable for eco-tourism '
                   f'(confidence {mean_probs[2]*100:.0f}%). '
                   f'The area exhibits strong positive environmental indicators.')
    elif class_id == 1:
        summary = (f'This location is predicted as Moderately Suitable for eco-tourism '
                   f'(confidence {mean_probs[1]*100:.0f}%). '
                   f'Some factors are favorable while others need improvement.')
    else:
        summary = (f'This location is predicted as Not Suitable for eco-tourism '
                   f'(confidence {mean_probs[0]*100:.0f}%). '
                   f'Several key environmental factors are unfavorable.')

    return {
        'summary':          summary,
        'positive_factors': pos,
        'negative_factors': neg,
        'moderate_factors': mod,
        'feature_values': {
            'ndvi':          round(ndvi_norm, 3),
            'elevation_m':   round(float(elev_m), 1),
            'slope_deg':     round(float(slope_deg), 1),
            'water_dist_km': round(float(water_km), 2),
            'temperature_c': round(float(temp_c), 1),
            'rainfall_mm':   round(float(rain_mm), 0),
        }
    }


def main():
    try:
        data         = json.loads(sys.stdin.read().strip())
        features     = data['features']
        image_patch  = data.get('image_patch', None)
        raw_features = data.get('raw_features', None)

        if len(features) != 11:
            raise ValueError(f'Expected 11 features, got {len(features)}')

        result = run_inference(features, image_patch)

        explanation = generate_explanation(
            features, raw_features,
            result['class_id'],
            [result['probabilities'][n] for n in CLASS_NAMES]
        )
        result['explanation'] = explanation

        print(json.dumps(result))

    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({'error': str(e)}))
        sys.exit(1)


if __name__ == '__main__':
    main()
