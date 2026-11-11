import type { FactorCard, SuitabilityLegendItem } from '../types/prediction';

export const factors: FactorCard[] = [
  {
    id: 'vegetation',
    icon: 'vegetation',
    title: 'Vegetation',
    subtitle: '(NDVI)',
  },
  {
    id: 'slope',
    icon: 'slope',
    title: 'Slope',
    subtitle: '(Terrain)',
  },
  {
    id: 'elevation',
    icon: 'elevation',
    title: 'Elevation',
    subtitle: '(DEM)',
  },
  {
    id: 'water',
    icon: 'water',
    title: 'Water Proximity',
    subtitle: '(Distance)',
  },
  {
    id: 'rainfall',
    icon: 'rainfall',
    title: 'Rainfall',
    subtitle: '(Precipitation)',
  },
  {
    id: 'temperature',
    icon: 'temperature',
    title: 'Temperature',
    subtitle: '(Climate)',
  },
  {
    id: 'soil',
    icon: 'soil',
    title: 'Soil Moisture',
    subtitle: '(Moisture)',
  },
  {
    id: 'landcover',
    icon: 'landcover',
    title: 'Land Cover',
    subtitle: '(LULC)',
  },
  {
    id: 'human',
    icon: 'human',
    title: 'Human Impact',
    subtitle: '(Built-up)',
  },
];

export const legendItems: SuitabilityLegendItem[] = [
  { level: 'suitable',     label: 'Suitable',             color: '#16a34a', dot: '🟢' },
  { level: 'moderate',     label: 'Moderately Suitable',  color: '#ca8a04', dot: '🟡' },
  { level: 'not-suitable', label: 'Not Suitable',         color: '#1f2937', dot: '⚫' },
];
