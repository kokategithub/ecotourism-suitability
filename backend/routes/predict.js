/**
 * POST /api/predict
 *
 * 1. Validate coordinates
 * 2. Check India boundary
 * 3. Extract GEE features + satellite image
 * 4. Run ML model (or return model-not-connected response)
 * 5. Return structured JSON
 */

const express  = require('express');
const NodeCache = require('node-cache');
const { validatePredictRequest } = require('../middleware/validate');
const { extractFeatures }        = require('../services/geeService');
const { predictSuitability }     = require('../services/predictionService');

const router = express.Router();

// Simple in-memory cache: 30-minute TTL, keyed by "lat|lng|date"
const cache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });

function cacheKey(lat, lng) {
  const today = new Date().toISOString().slice(0, 10);
  return `${lat.toFixed(4)}|${lng.toFixed(4)}|${today}`;
}

router.post('/', validatePredictRequest, async (req, res) => {
  const { lat, lng } = req.coords;

  // ── 1. Check cache ────────────────────────────────────────────────────────
  const key    = cacheKey(lat, lng);
  const cached = cache.get(key);
  if (cached) {
    console.log(`[predict] Cache hit for ${key}`);
    return res.json({ success: true, cached: true, data: cached });
  }

  try {
    // ── 2. Extract features via GEE ────────────────────────────────────────
    console.log(`[predict] Processing lat=${lat}, lng=${lng}`);
    const { rawFeatures, modelFeatures, satelliteImage, imagePatch } =
      await extractFeatures(lat, lng);

    // ── 3. Run ML model ────────────────────────────────────────────────────
    const prediction = await predictSuitability(modelFeatures, imagePatch, rawFeatures);

    // ── 4. Build response ──────────────────────────────────────────────────
    const responseData = {
      location: { latitude: lat, longitude: lng },
      satelliteImage,
      segmentationImage: prediction.segmentationImage ?? null,
      rawFeatures,
      modelFeatures,
      prediction,
    };

    cache.set(key, responseData);

    return res.json({ success: true, cached: false, data: responseData });

  } catch (err) {
    // ── Known user-facing errors ───────────────────────────────────────────
    if (err.code === 'OUTSIDE_INDIA') {
      return res.status(422).json({ success: false, error: err.message });
    }
    if (err.code === 'NO_S2_IMAGE') {
      return res.status(422).json({ success: false, error: err.message });
    }

    // ── Unexpected errors — never expose stack/credentials ─────────────────
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    const errStack = err instanceof Error ? err.stack : '';
    console.error('[predict] Unexpected error:', errMsg, errStack);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your request. Please try again.',
    });
  }
});

module.exports = router;
