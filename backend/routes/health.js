/**
 * GET /api/health
 * Health check — used by frontend and monitoring.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Use global singleton to survive any require() caching issues
if (global._appState === undefined) {
  global._appState = { geeReady: false, modelReady: false };
}

// Check model file directly at request time — no stale state
const MODEL_PATH = path.resolve(__dirname, '../model/attention_unet_dice_ce_best.pth');

function setGeeReady(v) {
  global._appState.geeReady = v;
  console.log(`[health] geeReady = ${v}`);
}

function setModelReady(v) {
  global._appState.modelReady = v;
}

router.get('/', (_req, res) => {
  const modelExists = fs.existsSync(MODEL_PATH);
  res.json({
    success: true,
    gee:     global._appState.geeReady,
    model:   modelExists,
    time:    new Date().toISOString(),
  });
});

module.exports = { router, setGeeReady, setModelReady };
