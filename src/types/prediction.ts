// 3-class suitability
export type SuitabilityClass = 'Suitable' | 'Moderately Suitable' | 'Not Suitable'

export const CLASS_COLOR: Record<SuitabilityClass, string> = {
  Suitable: '#16a34a',
  'Moderately Suitable': '#ca8a04',
  'Not Suitable': '#1f2937',
}

export const CLASS_BG: Record<SuitabilityClass, string> = {
  Suitable: '#f0fdf4',
  'Moderately Suitable': '#fefce8',
  'Not Suitable': '#f1f5f9',
}

export const CLASS_BORDER: Record<SuitabilityClass, string> = {
  Suitable: '#bbf7d0',
  'Moderately Suitable': '#fde68a',
  'Not Suitable': '#cbd5e1',
}

export interface PredictionExplanation {
  summary: string
  positive_factors: string[]
  negative_factors: string[]
  moderate_factors: string[]
  feature_values: {
    ndvi: number
    elevation_m: number
    slope_deg: number
    water_dist_km: number
    temperature_c: number
    rainfall_mm: number
  }
}

export interface PredictionResult {
  label: string
  class_id: number | null
  score: number | null
  elevation: number
  temperature: number
  rainfall: number
  lat: number
  lng: number
  ndvi?: number | null
  slope?: number | null
  waterDistance?: number | null
  sarVV?: number | null
  sarVH?: number | null
  satelliteImage?: string | null
  segmentationImage?: string | null
  explanation?: PredictionExplanation | null
  modelAvailable?: boolean
  modelStatus?: string
}

export interface RawFeatures {
  B4: number | null
  B3: number | null
  B2: number | null
  NDVI: number | null
  Slope: number
  Elevation: number
  WaterDistance: number
  Temperature: number
  Rainfall: number
  SAR_VV: number | null
  SAR_VH: number | null
}

export interface ModelFeatures {
  B4: number
  B3: number
  B2: number
  NDVI: number
  Slope: number
  Elevation: number
  WaterDistance: number
  Temperature: number
  Rainfall: number
  SAR_VV: number
  SAR_VH: number
}

export interface Prediction {
  score: number | null
  category: string | null
  class_id: number | null
  modelAvailable: boolean
  modelStatus?: string
  featureVector?: number[]
  classProbabilities?: Record<string, number>
  explanation?: PredictionExplanation | null
}

export interface ApiPredictResponse {
  success: boolean
  cached?: boolean
  error?: string
  data?: {
    location: { latitude: number; longitude: number }
    satelliteImage: string
    segmentationImage: string | null
    rawFeatures: RawFeatures
    modelFeatures: ModelFeatures
    prediction: Prediction
  }
}

export interface TabType { id: 'coordinates' | 'search'; label: string }
export interface FactorCard { id: string; icon: string; title: string; subtitle: string }
export type SuitabilityLevel = 'suitable' | 'moderate' | 'not-suitable'

export interface SuitabilityLegendItem {
  level: SuitabilityLevel
  label: string
  color: string
  dot: string
}
