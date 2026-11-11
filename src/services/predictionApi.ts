/**
 * Frontend API service — calls POST /api/predict
 * Never puts GEE credentials here. Credentials live only on the backend.
 */

import type { ApiPredictResponse, PredictionResult } from '../types/prediction'

const API_BASE = '/api'

export interface PredictOptions {
  onProgress?: (message: string) => void
}

export async function callPredict(
  lat: number,
  lng: number,
  options: PredictOptions = {},
): Promise<PredictionResult> {
  const { onProgress } = options

  onProgress?.('Validating coordinates...')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180000)

  let response: Response

  try {
    response = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
      signal: controller.signal,
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. GEE is taking too long — please try again.')
    }
    throw new Error('Failed to connect to backend. Make sure the server is running.')
  } finally {
    clearTimeout(timeoutId)
  }

  const json: ApiPredictResponse = await response.json()

  if (!json.success || !json.data) {
    throw new Error(json.error ?? 'Prediction failed. Please try again.')
  }

  const { rawFeatures, prediction, satelliteImage, segmentationImage } = json.data

  onProgress?.('Building result...')

  const result: PredictionResult = {
    lat,
    lng,
    label: prediction.category ?? 'Unknown',
    class_id: prediction.class_id ?? null,
    score: prediction.score,
    elevation: rawFeatures.Elevation,
    temperature: rawFeatures.Temperature,
    rainfall: rawFeatures.Rainfall,
    ndvi: rawFeatures.NDVI,
    slope: rawFeatures.Slope,
    waterDistance: rawFeatures.WaterDistance,
    sarVV: rawFeatures.SAR_VV,
    sarVH: rawFeatures.SAR_VH,
    satelliteImage: satelliteImage ?? null,
    segmentationImage: segmentationImage ?? null,
    explanation: prediction.explanation ?? null,
    modelAvailable: prediction.modelAvailable,
    modelStatus: prediction.modelStatus,
  }

  return result
}

export async function checkHealth(): Promise<{ gee: boolean; model: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    const json = await res.json()
    return { gee: json.gee ?? false, model: json.model ?? false }
  } catch {
    return { gee: false, model: false }
  }
}
