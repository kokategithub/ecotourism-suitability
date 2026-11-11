# Model Directory

Place your trained ML model file here.

## Supported formats

| Format | Filename | How to load |
|--------|----------|-------------|
| ONNX | `ecotourism_model.onnx` | `onnxruntime-node` |
| TensorFlow.js | `model.json` + `*.bin` | `@tensorflow/tfjs-node` |
| Keras H5 | `ecotourism_model.h5` | Python microservice or tfjs converter |
| scikit-learn joblib | `ecotourism_model.pkl` | Python microservice |

## Feature vector order (must match training)

The backend always passes features in this exact order:

```
['B4', 'B3', 'B2', 'NDVI', 'Slope', 'Elevation', 'WaterDistance', 'Temperature', 'Rainfall', 'SAR_VV', 'SAR_VH']
```

See `backend/config/suitability.js` → `FEATURE_NAMES`.

## Connecting the model

Once you place your model file here, open `backend/services/predictionService.js`
and uncomment the appropriate inference block (ONNX or TF.js).

The backend health endpoint (`GET /api/health`) will automatically show
`"model": true` once the file is detected.
