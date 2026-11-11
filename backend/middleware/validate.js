function validatePredictRequest(req, res, next) {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, error: 'latitude and longitude are required.' });
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ success: false, error: 'latitude and longitude must be numeric.' });
  }
  if (lat < -90 || lat > 90) {
    return res.status(400).json({ success: false, error: 'latitude must be between -90 and 90.' });
  }
  if (lng < -180 || lng > 180) {
    return res.status(400).json({ success: false, error: 'longitude must be between -180 and 180.' });
  }

  req.coords = { lat, lng };
  next();
}

module.exports = { validatePredictRequest };
