/**
 * TRAINING DATASET EXPORT — Google Earth Engine Script
 *
 * Run this in the GEE Code Editor: https://code.earthengine.google.com/
 * DO NOT use this for live website prediction.
 * For live prediction, see: backend/services/geeService.js
 *
 * Original script by: kokatesonali27
 */

// ── 1. India boundary ────────────────────────────────────────────────────────
var india = ee.FeatureCollection("FAO/GAUL/2015/level0")
  .filter(ee.Filter.eq('ADM0_NAME', 'India'));

// ── 2. Region ─────────────────────────────────────────────────────────────────
var regionBox = ee.Geometry.Rectangle([73.62, 17.88, 73.72, 17.98]);

// ── 3. Intersect with India ───────────────────────────────────────────────────
var selectedRegion = india.geometry().intersection(regionBox);

// ── 4. Generate fixed random points ──────────────────────────────────────────
var points = ee.FeatureCollection.randomPoints({
  region: selectedRegion,
  points: 50,
  seed: 42   // Keep fixed for reproducibility
});

// ── 5. Sentinel-2 ────────────────────────────────────────────────────────────
var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(selectedRegion)
  .filterDate('2024-01-01', '2024-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
  .median();

// ── 5B. Sentinel-1 SAR ───────────────────────────────────────────────────────
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(selectedRegion)
  .filterDate('2024-01-01', '2024-12-31')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .median();

// Normalize VV: -25 dB to 0 dB
var sar_vv = s1.select('VV').unitScale(-25, 0).clamp(0, 1).rename('SAR_VV').toFloat();
// Normalize VH: -30 dB to -5 dB
var sar_vh = s1.select('VH').unitScale(-30, -5).clamp(0, 1).rename('SAR_VH').toFloat();

// ── 6. RGB ────────────────────────────────────────────────────────────────────
var rgb = s2.select(['B4','B3','B2']).divide(10000).clamp(0,1)
  .rename(['B4','B3','B2']).toFloat();

// ── 7. NDVI ───────────────────────────────────────────────────────────────────
var ndvi = s2.normalizedDifference(['B8','B4'])
  .unitScale(-1, 1).clamp(0, 1).rename('NDVI').toFloat();

// ── 8. DEM + Slope + Water Distance ──────────────────────────────────────────
var dem       = ee.Image("USGS/SRTMGL1_003").toFloat();
var elevation = dem.divide(4000).clamp(0, 1).rename('Elevation');
var slope     = ee.Terrain.slope(dem).divide(90).clamp(0, 1).rename('Slope');

var water         = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select('occurrence').unmask(0);
var waterMask     = water.gt(50).selfMask();
var maxDistMeters = 10000;
var waterDistance = ee.Image(1).cumulativeCost({
  source: waterMask, maxDistance: maxDistMeters
}).unmask(maxDistMeters).divide(maxDistMeters).clamp(0, 1).rename('WaterDistance').toFloat();

// ── 9. Meteorological ────────────────────────────────────────────────────────
var era5 = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")
  .filterBounds(selectedRegion)
  .filterDate('2024-01-01', '2024-12-31')
  .mean();

// Temperature (K → °C → normalize 0-50°C)
var temperature = era5.select('temperature_2m')
  .subtract(273.15).unitScale(0, 50).clamp(0, 1).rename('Temperature').toFloat();

// Rainfall
var rainfall = era5.select('total_precipitation_sum')
  .divide(0.1).clamp(0, 1).rename('Rainfall').toFloat();

// ── 10. Stack 11 bands ────────────────────────────────────────────────────────
// Order: B4, B3, B2, NDVI, Slope, Elevation, WaterDistance, Temperature, Rainfall, SAR_VV, SAR_VH
var finalImage = rgb
  .addBands(ndvi)
  .addBands(slope)
  .addBands(elevation)
  .addBands(waterDistance)
  .addBands(temperature)
  .addBands(rainfall)
  .addBands(sar_vv)
  .addBands(sar_vh)
  .toFloat();

// ── 11. Export ────────────────────────────────────────────────────────────────
var startIndex = 0;
var endIndex   = 49;

var pointList = points.toList(50);
for (var i = startIndex; i <= endIndex; i++) {
  var point = ee.Feature(pointList.get(i));
  var patch = point.geometry().buffer(3840).bounds();
  Map.addLayer(patch, {color: 'yellow'}, 'Patch ' + i);
  Export.image.toDrive({
    image:           finalImage,
    description:     'TerrainPatch_' + i,
    folder:          'Suitable',
    fileNamePrefix:  'terrain_patch_' + i,
    region:          patch,
    dimensions:      "256x256",
    crs:             'EPSG:3857',
    maxPixels:       1e13,
  });
}
