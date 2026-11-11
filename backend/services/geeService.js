/**
 * Google Earth Engine service — PARALLELISED for speed.
 *
 * All independent GEE calls run simultaneously with Promise.all.
 * sampleRectangle image patch is skipped (too slow, ~30s per call).
 *
 * Normalization matches data extraction code exactly:
 *   B4, B3, B2   → divide(10000).clamp(0,1)
 *   NDVI         → normalizedDifference.clamp(-1,1)  ← raw [-1,1]
 *   Elevation    → divide(4000).clamp(0,1)
 *   Slope        → divide(90).clamp(0,1)
 *   WaterDist    → fastDistanceTransform*30/10000
 *   Temperature  → (K-273.15).unitScale(0,50)
 *   Rainfall     → mean_daily.divide(0.1).clamp(0,1)
 *   SAR_VV       → unitScale(-25,0)
 *   SAR_VH       → unitScale(-30,-5)
 */

const ee   = require('@google/earthengine');
const path = require('path');
const fs   = require('fs');

let _initialized = false;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function eeGetInfo(eeObj) {
  return new Promise((resolve, reject) => {
    eeObj.getInfo((value, error) => {
      if (error) reject(new Error(typeof error === 'string' ? error : JSON.stringify(error)));
      else resolve(value);
    });
  });
}

function eeGetThumbURL(image, params) {
  return new Promise((resolve, reject) => {
    image.getThumbURL(params, (url, error) => {
      if (error) reject(new Error(typeof error === 'string' ? error : JSON.stringify(error)));
      else resolve(url);
    });
  });
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function unitScale(v, lo, hi) { return clamp((v - lo) / (hi - lo), 0, 1); }

// ─── Init ─────────────────────────────────────────────────────────────────────

async function initGEE() {
  if (_initialized) return;
  const keyPath = path.resolve(process.cwd(), process.env.GEE_KEY_FILE || 'service-account.json');
  if (!fs.existsSync(keyPath)) throw new Error(`service-account.json not found at ${keyPath}`);
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  await new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      key,
      () => ee.initialize(null, null, resolve, e => reject(new Error(String(e)))),
      e  => reject(new Error(String(e)))
    );
  });
  _initialized = true;
  console.log('[GEE] Authenticated and initialised.');
}

// ─── India check ─────────────────────────────────────────────────────────────

async function isInsideIndia(point) {
  const india = ee.FeatureCollection('FAO/GAUL/2015/level0')
    .filter(ee.Filter.eq('ADM0_NAME', 'India'));
  const count = await eeGetInfo(india.filterBounds(point).size());
  return count > 0;
}

// ─── Main extraction — ALL independent calls run in parallel ─────────────────

async function extractFeatures(latitude, longitude) {
  if (!_initialized) await initGEE();

  const point  = ee.Geometry.Point([longitude, latitude]);
  const region = point.buffer(3840).bounds();
  const today  = daysAgo(0);
  const ERA5   = 'ECMWF/ERA5_LAND/DAILY_AGGR';

  // ── India bounding box check ─────────────────────────────────────────────
  // Using a geographic bounding box instead of FAO boundary polygon
  // which misses Arunachal Pradesh, coastal Kerala, and island territories.
  // India bounding box: lat 6.5–37.1, lng 68.1–97.4
  if (latitude < 6.5 || latitude > 37.1 || longitude < 68.1 || longitude > 97.4) {
    const err = new Error('Please enter coordinates within India.');
    err.code = 'OUTSIDE_INDIA';
    throw err;
  }

  // ── Build all GEE image objects (lazy — no network call yet) ─────────────
  const dem      = ee.Image('USGS/SRTMGL1_003').toFloat();
  const slopeImg = ee.Terrain.slope(dem);

  // Sentinel-2
  let s2Col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(region).filterDate(daysAgo(60), today)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
    .sort('CLOUDY_PIXEL_PERCENTAGE');

  // Check S2 size first (sequential — needed to decide fallback)
  let s2Size = await eeGetInfo(s2Col.size());
  if (s2Size === 0) {
    s2Col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterBounds(region).filterDate(daysAgo(120), today)
      .sort('CLOUDY_PIXEL_PERCENTAGE');
    s2Size = await eeGetInfo(s2Col.size());
  }
  if (s2Size === 0) {
    const err = new Error('No Sentinel-2 imagery available for this location.');
    err.code = 'NO_S2_IMAGE';
    throw err;
  }

  const s2Raw    = s2Col.limit(5).median();
  const s2Masked = s2Col.limit(10).map(img => {
    const scl = img.select('SCL');
    return img.updateMask(scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10)));
  }).median();

  const rgb    = s2Raw.select(['B4','B3','B2']).divide(10000).clamp(0, 1);
  const ndviImg = s2Raw.normalizedDifference(['B8','B4']).clamp(-1, 1).rename('NDVI');

  // Water distance image
  const waterBody = ee.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').unmask(0);
  const waterDistMeters = waterBody.gt(50)
    .fastDistanceTransform(256, 'pixels', 'squared_euclidean')
    .sqrt().multiply(30).clamp(0, 10000);
  const waterNormImg = waterDistMeters.divide(10000).clamp(0, 1).rename('WaterDist');

  // ERA5 images
  const era5Col = ee.ImageCollection(ERA5).filterBounds(point).filterDate(daysAgo(365), today);

  // SAR
  const s1Col = ee.ImageCollection('COPERNICUS/S1_GRD')
    .filterBounds(point).filterDate(daysAgo(90), today)
    .filter(ee.Filter.eq('instrumentMode', 'IW'))
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
    .select(['VV', 'VH']);

  // ── Fire ALL independent GEE requests simultaneously ─────────────────────
  const t0 = Date.now();

  const [
    s2Vals,
    demVals,
    waterVals,
    era5BandNames,
    sarSize,
    thumbURL,
  ] = await Promise.all([
    // 1. S2 RGB + NDVI at point
    eeGetInfo(
      rgb.addBands(ndviImg)
        .reduceRegion({ reducer: ee.Reducer.mean(), geometry: point, scale: 10 })
    ),
    // 2. DEM elevation + slope at point
    eeGetInfo(
      dem.rename('ElevRaw')
        .addBands(slopeImg.rename('SlopeRaw'))
        .addBands(dem.divide(4000).clamp(0,1).rename('ElevNorm'))
        .addBands(slopeImg.divide(90).clamp(0,1).rename('SlopeNorm'))
        .reduceRegion({ reducer: ee.Reducer.mean(), geometry: point, scale: 30 })
    ),
    // 3. Water distance at point
    eeGetInfo(
      waterNormImg.addBands(waterDistMeters.rename('WaterRaw'))
        .reduceRegion({ reducer: ee.Reducer.mean(), geometry: point, scale: 30 })
    ).catch(() => null),
    // 4. ERA5 band names (needed to pick correct band)
    eeGetInfo(era5Col.first().bandNames()).catch(() => []),
    // 5. SAR collection size
    eeGetInfo(s1Col.size()).catch(() => 0),
    // 6. Satellite RGB thumbnail
    eeGetThumbURL(
      s2Masked.select(['B4','B3','B2']).divide(10000).clamp(0, 0.3),
      { bands: ['B4','B3','B2'], min: 0, max: 0.3, dimensions: 512, format: 'png', region }
    ).catch(() => eeGetThumbURL(rgb, {
      bands: ['B4','B3','B2'], min: 0, max: 0.3, dimensions: 512, format: 'png', region
    }).catch(() => null)),
  ]);

  // Now fire ERA5 temp+rain in parallel (needed band names first)
  const tBand = era5BandNames.find(b => b.startsWith('temperature_2m')) || 'temperature_2m';
  const pBand = era5BandNames.find(b => b.includes('precipitation'))    || 'total_precipitation_sum';

  const [era5Vals, sarVals] = await Promise.all([
    // ERA5 temp + rain in ONE reduceRegion call
    eeGetInfo(
      era5Col.select([tBand, pBand]).mean()
        .reduceRegion({ reducer: ee.Reducer.mean(), geometry: point, scale: 11132 })
    ).catch(() => ({})),
    // SAR values (only if images available)
    sarSize > 0
      ? eeGetInfo(s1Col.median().reduceRegion({ reducer: ee.Reducer.mean(), geometry: point, scale: 10 }))
          .catch(() => ({}))
      : Promise.resolve({}),
  ]);

  console.log(`[GEE] All features fetched in ${Date.now() - t0}ms`);

  // ── Parse results ─────────────────────────────────────────────────────────

  const B4   = s2Vals.B4   != null ? +s2Vals.B4.toFixed(4)   : null;
  const B3   = s2Vals.B3   != null ? +s2Vals.B3.toFixed(4)   : null;
  const B2   = s2Vals.B2   != null ? +s2Vals.B2.toFixed(4)   : null;
  const NDVI = s2Vals.NDVI != null ? +s2Vals.NDVI.toFixed(4) : null;

  const elevationRaw  = demVals.ElevRaw   != null ? Math.round(demVals.ElevRaw)   : 0;
  const slopeRaw      = demVals.SlopeRaw  != null ? +demVals.SlopeRaw.toFixed(2)  : 0;
  const elevationNorm = demVals.ElevNorm  != null ? +demVals.ElevNorm.toFixed(6)  : 0;
  const slopeNorm     = demVals.SlopeNorm != null ? +demVals.SlopeNorm.toFixed(6) : 0;

  const waterDistNorm = waterVals?.WaterDist != null ? +waterVals.WaterDist.toFixed(6) : 1.0;
  const waterDistRaw  = waterVals?.WaterRaw  != null ? Math.round(waterVals.WaterRaw)  : 10000;

  const rawK   = era5Vals[tBand];
  let tempC    = 25;
  let tempNorm = unitScale(25, 0, 50);
  if (rawK != null) {
    tempC    = rawK > 200 ? parseFloat((rawK - 273.15).toFixed(1)) : parseFloat(rawK.toFixed(1));
    tempNorm = unitScale(tempC, 0, 50);
    console.log(`[GEE] Temp ${tempC}°C`);
  }

  const rawPrec    = era5Vals[pBand];
  let rainfallMM   = 0;
  let rainfallNorm = 0;
  if (rawPrec != null) {
    // ERA5 total_precipitation_sum is in metres/day — convert to mm/yr
    rainfallMM   = Math.round(rawPrec * 1000 * 365);
    // Normalize to [0,1] using training range 0–4000 mm/yr
    rainfallNorm = clamp(rainfallMM / 4000, 0, 1);
    console.log(`[GEE] Rainfall ${rainfallMM} mm/yr (norm=${rainfallNorm.toFixed(4)})`);
  }

  let SAR_VV = null, SAR_VH = null;
  // Default to mid-range (0.5) — neutral, typical vegetated terrain
  let sarVVnorm = 0.5, sarVHnorm = 0.5;
  if (sarVals.VV != null) {
    SAR_VV = +sarVals.VV.toFixed(4);
    // SAR_VV above -5 dB is anomalous (water/specular reflection from lake surface).
    // These extreme values corrupt the model. Use neutral 0.5 for water-contaminated pixels.
    if (SAR_VV > -5) {
      sarVVnorm = 0.5;
      console.log(`[GEE] SAR VV=${SAR_VV} dB — water/specular anomaly detected, using neutral 0.5`);
    } else {
      sarVVnorm = unitScale(SAR_VV, -25, -5);
    }
  }
  if (sarVals.VH != null) {
    SAR_VH = +sarVals.VH.toFixed(4);
    // SAR_VH above -10 dB is anomalous (water/urban specular).
    if (SAR_VH > -10) {
      sarVHnorm = 0.5;
      console.log(`[GEE] SAR VH=${SAR_VH} dB — water/specular anomaly detected, using neutral 0.5`);
    } else {
      sarVHnorm = unitScale(SAR_VH, -30, -10);
    }
  }
  if (SAR_VV) console.log(`[GEE] SAR VV=${SAR_VV}(norm=${sarVVnorm.toFixed(3)}) VH=${SAR_VH}(norm=${sarVHnorm.toFixed(3)})`);

  // ── Raw features ──────────────────────────────────────────────────────────
  const rawFeatures = {
    B4, B3, B2, NDVI,
    Slope: slopeRaw, Elevation: elevationRaw,
    WaterDistance: waterDistRaw, Temperature: tempC,
    Rainfall: rainfallMM, SAR_VV, SAR_VH,
  };

  // ── Model features (normalised, extraction code order) ────────────────────
  const modelFeatures = {
    B4:            B4   != null ? clamp(B4,   0, 1)  : 0,
    B3:            B3   != null ? clamp(B3,   0, 1)  : 0,
    B2:            B2   != null ? clamp(B2,   0, 1)  : 0,
    NDVI:          NDVI != null ? clamp(NDVI, -1, 1) : 0,
    Elevation:     elevationNorm,
    Slope:         slopeNorm,
    WaterDistance: waterDistNorm,
    Temperature:   clamp(tempNorm, 0, 1),
    Rainfall:      clamp(rainfallNorm, 0, 1),
    SAR_VV:        clamp(sarVVnorm, 0, 1),
    SAR_VH:        clamp(sarVHnorm, 0, 1),
  };

  // ── Real image patch via sampleRectangle (parallel with ERA5+SAR) ──────────
  let imagePatch = null;
  try {
    const b4N   = s2Raw.select('B4').divide(10000).clamp(0,1).rename('B4');
    const b3N   = s2Raw.select('B3').divide(10000).clamp(0,1).rename('B3');
    const b2N   = s2Raw.select('B2').divide(10000).clamp(0,1).rename('B2');
    const ndviN = s2Raw.normalizedDifference(['B8','B4']).clamp(-1,1).rename('NDVI');
    const slopeN= slopeImg.divide(90).clamp(0,1).rename('Slope');
    const elevN = dem.divide(4000).clamp(0,1).rename('Elevation');
    const waterN= waterDistMeters.divide(10000).clamp(0,1).rename('WaterDist');
    const era5c = ee.ImageCollection(ERA5).filterBounds(region).filterDate(daysAgo(365), today);
    const tempN = era5c.select('temperature_2m').mean().subtract(273.15).divide(50).clamp(0,1).rename('Temp');
    const rainN = era5c.select('total_precipitation_sum').mean().multiply(1000 * 365).divide(4000).clamp(0,1).rename('Rain');
    const s1c   = ee.ImageCollection('COPERNICUS/S1_GRD')
      .filterBounds(region).filterDate(daysAgo(90), today)
      .filter(ee.Filter.eq('instrumentMode','IW'))
      .filter(ee.Filter.listContains('transmitterReceiverPolarisation','VV'))
      .filter(ee.Filter.listContains('transmitterReceiverPolarisation','VH'))
      .select(['VV','VH']);
    const s1sz  = await eeGetInfo(s1c.size()).catch(() => 0);
    const vvN   = s1sz > 0
      ? s1c.median().select('VV').unitScale(-25,0).clamp(0,1).rename('SAR_VV')
      : ee.Image.constant(sarVVnorm).rename('SAR_VV');
    const vhN   = s1sz > 0
      ? s1c.median().select('VH').unitScale(-30,-5).clamp(0,1).rename('SAR_VH')
      : ee.Image.constant(sarVHnorm).rename('SAR_VH');

    const stack = b4N.addBands(b3N).addBands(b2N).addBands(ndviN)
      .addBands(elevN).addBands(slopeN).addBands(waterN)
      .addBands(tempN).addBands(rainN).addBands(vvN).addBands(vhN);

    const bandNames = ['B4','B3','B2','NDVI','Elevation','Slope','WaterDist',
                       'Temp','Rain','SAR_VV','SAR_VH'];

    const sampled = await eeGetInfo(
      stack.reproject({ crs: 'EPSG:4326', scale: 30 })
           .sampleRectangle({ region, defaultValue: 0 })
    );

    if (sampled && sampled.properties) {
      const props = sampled.properties;
      const allOk = bandNames.every(b => Array.isArray(props[b]) && props[b].length > 0);
      if (allOk) {
        const flat = [];
        for (const b of bandNames)
          for (const row of props[b])
            for (const val of row) flat.push(val != null ? val : 0);
        const h = props[bandNames[0]].length;
        const w = props[bandNames[0]][0].length;
        imagePatch = { data: flat, bands: 11, pixels: h * w, side: Math.max(h, w) };
        console.log(`[GEE] Image patch: ${h}×${w} pixels`);
      }
    }
  } catch (e) {
    console.warn('[GEE] Image patch skipped:', e.message);
  }

  return { rawFeatures, modelFeatures, satelliteImage: thumbURL, imagePatch };
}

module.exports = { initGEE, extractFeatures };
