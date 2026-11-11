"""
EcoTourism Suitability Model — Training Script (3-class RF fallback)

Classes match Attention U-Net mask encoding:
  0 = Not Suitable        (BLACK)
  1 = Moderately Suitable (YELLOW)
  2 = Suitable            (GREEN)

Score weights: 0→0.0, 1→0.5, 2→1.0

HOW TO RUN:
    python backend/model/train_model.py
"""

import os
import numpy as np
import joblib
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score

MODEL_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(MODEL_DIR, 'ecotourism_model.pkl')
LABELS_PATH = os.path.join(MODEL_DIR, 'class_labels.pkl')

FEATURE_NAMES = [
    'B4', 'B3', 'B2', 'NDVI', 'Slope',
    'Elevation', 'WaterDistance', 'Temperature', 'Rainfall',
    'SAR_VV', 'SAR_VH'
]

# 3 classes — matches Attention U-Net
CLASS_NAMES   = ['Not Suitable', 'Moderately Suitable', 'Suitable']
CLASS_WEIGHTS = [0.0, 0.5, 1.0]


def generate_synthetic_data(n_samples=1500, random_state=42):
    np.random.seed(random_state)

    def nr(lo, hi, size):
        return np.random.uniform(lo, hi, size).astype(np.float32)

    n = n_samples
    n2 = n // 3   # Suitable
    n1 = n // 3   # Moderately Suitable
    n0 = n - n2 - n1  # Not Suitable (split into sub-types)

    # ── Class 2: SUITABLE (GREEN) ─────────────────────────────────────────────
    # Dense forest, hill stations, wildlife reserves
    # High NDVI, moderate elevation, near water, high rainfall, cool temp
    c2 = {
        'B4':           nr(0.02, 0.09, n2),
        'B3':           nr(0.03, 0.12, n2),
        'B2':           nr(0.02, 0.09, n2),
        'NDVI':         nr(0.55, 0.95, n2),   # dense green vegetation
        'Slope':        nr(0.00, 0.25, n2),   # gentle
        'Elevation':    nr(0.10, 0.65, n2),   # 400-2600m
        'WaterDistance':nr(0.00, 0.35, n2),   # near water
        'Temperature':  nr(0.24, 0.58, n2),   # 12-29°C
        'Rainfall':     nr(0.55, 1.00, n2),   # 1650-3000+ mm/yr
        'SAR_VV':       nr(0.55, 0.90, n2),
        'SAR_VH':       nr(0.50, 0.85, n2),
    }

    # ── Class 1: MODERATELY SUITABLE (YELLOW) ────────────────────────────────
    # Moderate vegetation, scrublands near hills, seasonal water bodies
    c1 = {
        'B4':           nr(0.07, 0.20, n1),
        'B3':           nr(0.08, 0.22, n1),
        'B2':           nr(0.06, 0.18, n1),
        'NDVI':         nr(0.22, 0.55, n1),   # moderate vegetation
        'Slope':        nr(0.05, 0.42, n1),
        'Elevation':    nr(0.04, 0.70, n1),
        'WaterDistance':nr(0.10, 0.60, n1),
        'Temperature':  nr(0.30, 0.72, n1),   # 15-36°C
        'Rainfall':     nr(0.18, 0.58, n1),   # 540-1740 mm/yr
        'SAR_VV':       nr(0.35, 0.68, n1),
        'SAR_VH':       nr(0.30, 0.62, n1),
    }

    # ── Class 0: NOT SUITABLE (BLACK) ────────────────────────────────────────
    # 4 sub-types from real training regions
    n0a = n0 // 4  # desert/arid (Jaisalmer, Barmer, Rann of Kutch)
    n0b = n0 // 4  # urban/industrial (Ahmedabad, Bhiwandi, Pimpri-Chinchwad)
    n0c = n0 // 4  # polluted urban rivers (Mithi, Musi, Yamuna urban stretch)
    n0d = n0 - n0a - n0b - n0c  # quarry/ravine (Nashik quarry, Chambal)

    # (a) Desert
    ns_a = {
        'B4':           nr(0.28, 0.55, n0a),
        'B3':           nr(0.30, 0.57, n0a),
        'B2':           nr(0.25, 0.50, n0a),
        'NDVI':         nr(0.00, 0.10, n0a),  # bare sand
        'Slope':        nr(0.00, 0.06, n0a),
        'Elevation':    nr(0.03, 0.14, n0a),
        'WaterDistance':nr(0.65, 1.00, n0a),
        'Temperature':  nr(0.62, 0.95, n0a),  # 31-47°C
        'Rainfall':     nr(0.00, 0.06, n0a),  # <180 mm/yr
        'SAR_VV':       nr(0.08, 0.32, n0a),
        'SAR_VH':       nr(0.06, 0.28, n0a),
    }
    # (b) Urban/industrial
    ns_b = {
        'B4':           nr(0.14, 0.40, n0b),
        'B3':           nr(0.16, 0.42, n0b),
        'B2':           nr(0.12, 0.37, n0b),
        'NDVI':         nr(0.00, 0.12, n0b),  # concrete/impervious
        'Slope':        nr(0.00, 0.05, n0b),
        'Elevation':    nr(0.00, 0.10, n0b),
        'WaterDistance':nr(0.05, 0.55, n0b),
        'Temperature':  nr(0.48, 0.82, n0b),  # urban heat
        'Rainfall':     nr(0.10, 0.88, n0b),  # variable — Mumbai=high, Ahmedabad=low
        'SAR_VV':       nr(0.48, 0.82, n0b),  # high urban backscatter
        'SAR_VH':       nr(0.42, 0.74, n0b),
    }
    # (c) Polluted urban rivers — near water, very low NDVI, urban setting
    ns_c = {
        'B4':           nr(0.09, 0.24, n0c),
        'B3':           nr(0.10, 0.26, n0c),
        'B2':           nr(0.08, 0.22, n0c),
        'NDVI':         nr(0.00, 0.10, n0c),  # bare polluted banks
        'Slope':        nr(0.00, 0.04, n0c),  # flat river plains
        'Elevation':    nr(0.00, 0.06, n0c),
        'WaterDistance':nr(0.00, 0.12, n0c),  # ON the river
        'Temperature':  nr(0.45, 0.78, n0c),
        'Rainfall':     nr(0.20, 0.92, n0c),  # high rainfall ok, but urban river
        'SAR_VV':       nr(0.38, 0.76, n0c),
        'SAR_VH':       nr(0.32, 0.68, n0c),
    }
    # (d) Quarry/ravine
    ns_d = {
        'B4':           nr(0.20, 0.50, n0d),
        'B3':           nr(0.22, 0.52, n0d),
        'B2':           nr(0.18, 0.46, n0d),
        'NDVI':         nr(0.00, 0.08, n0d),
        'Slope':        nr(0.22, 0.80, n0d),
        'Elevation':    nr(0.02, 0.28, n0d),
        'WaterDistance':nr(0.28, 0.92, n0d),
        'Temperature':  nr(0.38, 0.82, n0d),
        'Rainfall':     nr(0.06, 0.48, n0d),
        'SAR_VV':       nr(0.12, 0.52, n0d),
        'SAR_VH':       nr(0.10, 0.44, n0d),
    }

    c0 = {f: np.concatenate([ns_a[f], ns_b[f], ns_c[f], ns_d[f]]) for f in FEATURE_NAMES}

    all_labels = np.concatenate([
        np.full(n2, 2),   # Suitable
        np.full(n1, 1),   # Moderately Suitable
        np.full(n0, 0),   # Not Suitable
    ])
    X = np.column_stack([
        np.concatenate([c2[f], c1[f], c0[f]]) for f in FEATURE_NAMES
    ]).astype(np.float32)

    idx = np.random.permutation(len(all_labels))
    print(f"[train] Generated {len(all_labels)} samples.")
    print(f"[train] Class distribution: { {CLASS_NAMES[i]: int((all_labels==i).sum()) for i in range(3)} }")
    return X[idx], all_labels[idx].astype(np.int32)


def train():
    print("=" * 60)
    print("EcoTourism — 3-Class RF Training")
    print("Classes: 0=Not Suitable | 1=Moderately Suitable | 2=Suitable")
    print("=" * 60)

    X, y = generate_synthetic_data(n_samples=1500)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n[train] Train: {len(X_train)} | Test: {len(X_test)}")

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=14,
        min_samples_split=3,
        min_samples_leaf=2,
        max_features='sqrt',
        class_weight='balanced',
        random_state=42,
        n_jobs=-1,
    )
    print("\n[train] Training...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    print(f"\n[train] Test Accuracy: {acc*100:.1f}%")
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES))

    cv = cross_val_score(model, X, y, cv=5)
    print(f"[train] CV: {cv.mean():.4f} ± {cv.std():.4f}")

    # Feature importance
    print("\n[train] Feature Importance:")
    for name, imp in sorted(zip(FEATURE_NAMES, model.feature_importances_), key=lambda x: -x[1]):
        print(f"  {name:15s} {imp:.4f}  {'█' * int(imp*40)}")

    joblib.dump(model, MODEL_PATH)
    joblib.dump(CLASS_NAMES, LABELS_PATH)
    print(f"\n[train] ✅ Saved: {MODEL_PATH}")

    # Spot checks
    checks = [
        ('Mahabaleshwar (Suitable)',    [0.05,0.06,0.04,0.72,0.08,0.34,0.45,0.44,0.77,0.62,0.58]),
        ('Jaisalmer (Not Suitable)',    [0.35,0.30,0.28,0.05,0.02,0.06,0.95,0.75,0.04,0.20,0.18]),
        ('Mithi River (Not Suitable)',  [0.12,0.14,0.11,0.05,0.01,0.001,0.02,0.60,0.80,0.55,0.45]),
        ('Deccan Plateau (Moderate)',   [0.10,0.12,0.09,0.32,0.18,0.15,0.40,0.58,0.30,0.42,0.38]),
    ]
    print("\n[train] Spot checks:")
    for label, feats in checks:
        f = np.array([feats])
        proba  = model.predict_proba(f)[0]
        pred   = int(np.argmax(proba))
        score  = sum(CLASS_WEIGHTS[i]*proba[i] for i in range(3))
        print(f"  {label}: {CLASS_NAMES[pred]} (score={score:.3f})")


if __name__ == '__main__':
    train()
