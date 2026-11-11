import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Rectangle, ImageOverlay } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { legendItems } from '../data/factors'
import type { PredictionResult } from '../types/prediction'

// Fix bundler-broken default Leaflet icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Pan/zoom to new location when result updates — zoom to the region bounds
function MapController({ lat, lng, bounds }: { lat: number; lng: number; bounds: [[number, number], [number, number]] | null }) {
  const map = useMap()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (bounds) {
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 })
    } else {
      map.flyTo([lat, lng], 12, { duration: 1.2 })
    }
  }, [lat, lng, bounds, map])
  return null
}

// Canvas heatmap overlay — 3-class suitability gradient rings
function HeatmapOverlay({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()

  useEffect(() => {
    // Outer = Not Suitable (dark), middle = Moderately Suitable (yellow), inner = Suitable (green)
    const rings = [
      { color: '#1f2937', opacity: 0.22, mult: 1.35 },  // Not Suitable — dark
      { color: '#ca8a04', opacity: 0.30, mult: 1.00 },  // Moderately Suitable — yellow
      { color: '#16a34a', opacity: 0.45, mult: 0.60 },  // Suitable — green
    ]

    const BASE_RADIUS = 20000
    const circles = rings.map(({ color, opacity, mult }) =>
      L.circle([lat, lng], {
        radius: BASE_RADIUS * mult,
        stroke: false,
        fillColor: color,
        fillOpacity: opacity,
        interactive: false,
        bubblingMouseEvents: false,
      }).addTo(map),
    )
    return () => circles.forEach((c) => c.remove())
  }, [lat, lng, map])

  return null
}

// GEE uses a 3840m buffer around the point — compute the lat/lng bounds for ImageOverlay
function getImageBounds(lat: number, lng: number): [[number, number], [number, number]] {
  // 3840 metres in degrees (approximate, good enough for the overlay)
  const mPerDegLat = 111320
  const mPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180)
  const deltaLat = 3840 / mPerDegLat
  const deltaLng = 3840 / mPerDegLng
  return [
    [lat - deltaLat, lng - deltaLng], // SW corner
    [lat + deltaLat, lng + deltaLng], // NE corner
  ]
}

interface MapSectionProps {
  result: PredictionResult | null
  defaultLat: number
  defaultLng: number
  satelliteImage?:    string | null
  segmentationImage?: string | null
}

export default function MapSection({ result, defaultLat, defaultLng, satelliteImage, segmentationImage }: MapSectionProps) {
  const lat = result?.lat ?? defaultLat
  const lng = result?.lng ?? defaultLng

  const classLabel = result?.label ?? ''
  const classColor =
    classLabel === 'Suitable'            ? '#16a34a' :
    classLabel === 'Moderately Suitable' ? '#eab308' :
    classLabel === 'Not Suitable'        ? '#111827' :
    '#ef4444'
  const classFillOpacity =
    classLabel === 'Suitable'            ? 0.18 :
    classLabel === 'Moderately Suitable' ? 0.22 :
    classLabel === 'Not Suitable'        ? 0.28 :
    0.08

  const showSatOverlay  = !!(result && satelliteImage)
  const showSegOverlay  = !!(result && segmentationImage)
  const imageBounds     = (showSatOverlay || showSegOverlay) ? getImageBounds(lat, lng) : null
  const regionBounds    = result ? getImageBounds(result.lat, result.lng) : null

  return (
    <div className="relative w-full" style={{ height: '400px' }}>
      <MapContainer
        center={[lat, lng]}
        zoom={10}
        style={{ height: '100%', width: '100%', background: '#e8f4e8' }}
        zoomControl
        scrollWheelZoom
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; <a href="https://www.esri.com">Esri</a>'
          maxZoom={19}
          errorTileUrl="https://tile.opentopomap.org/{z}/{x}/{y}.png"
        />

        {/* GEE Sentinel-2 satellite image underneath */}
        {showSatOverlay && imageBounds && (
          <ImageOverlay
            url={satelliteImage!}
            bounds={imageBounds}
            opacity={1}
            zIndex={400}
          />
        )}

        {/* Attention U-Net segmentation overlay — green/yellow/black on top of satellite */}
        {showSegOverlay && imageBounds && (
          <ImageOverlay
            url={segmentationImage!}
            bounds={imageBounds}
            opacity={0.62}
            zIndex={500}
          />
        )}

        {/* Region bounding box — color matches predicted class */}
        {regionBounds && (
          <Rectangle
            bounds={regionBounds}
            pathOptions={{
              color: classColor,
              weight: 3,
              opacity: 1,
              fillColor: classColor,
              fillOpacity: showSegOverlay ? 0 : classFillOpacity,
            }}
          />
        )}

        {/* Heatmap circles only before any prediction */}
        {!result && <HeatmapOverlay lat={lat} lng={lng} />}

        <Marker position={[lat, lng]}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', lineHeight: 1.6, minWidth: 160 }}>
              <div style={{
                fontWeight: 800, fontSize: 13, marginBottom: 4,
                color: classLabel === 'Suitable' ? '#16a34a' :
                       classLabel === 'Moderately Suitable' ? '#b45309' :
                       classLabel === 'Not Suitable' ? '#111827' : '#374151'
              }}>
                {result ? (
                  <>
                    {classLabel === 'Suitable' ? '🟢' :
                     classLabel === 'Moderately Suitable' ? '🟡' :
                     classLabel === 'Not Suitable' ? '⚫' : '📍'}{' '}
                    {result.label}
                  </>
                ) : 'Selected Location'}
              </div>
              <div style={{ color: '#6b7280', fontSize: 11 }}>
                {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
              </div>
              {result && (
                <>
                  <div style={{ color: '#374151', marginTop: 3 }}>
                    Score: <strong>{result.score != null ? result.score.toFixed(2) : 'N/A'}</strong>
                  </div>
                  <div style={{ color: '#374151' }}>
                    Elevation: <strong>{result.elevation} m</strong>
                  </div>
                  <div style={{ color: '#374151' }}>
                    Temp: <strong>{result.temperature}°C</strong> · Rain: <strong>{result.rainfall} mm/yr</strong>
                  </div>
                </>
              )}
            </div>
          </Popup>
        </Marker>

        <MapController lat={lat} lng={lng} bounds={regionBounds} />
      </MapContainer>

      {/* Suitability Legend — floats over bottom-right of map */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '10px 12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          minWidth: '172px',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: '7px',
          }}
        >
          Suitability Index
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {legendItems.map((item) => {
            const isActive = result && (
              (item.level === 'suitable'     && classLabel === 'Suitable') ||
              (item.level === 'moderate'     && classLabel === 'Moderately Suitable') ||
              (item.level === 'not-suitable' && classLabel === 'Not Suitable')
            )
            return (
              <div key={item.level} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '3px 6px', borderRadius: 6,
                background: isActive ? `${item.color}18` : 'transparent',
                border: isActive ? `1.5px solid ${item.color}60` : '1.5px solid transparent',
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: item.color, flexShrink: 0,
                  boxShadow: isActive ? `0 0 6px ${item.color}` : 'none',
                }} />
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? '#111827' : '#374151',
                }}>
                  {item.label}
                </span>
                {isActive && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: item.color }}>
                    ◀
                  </span>
                )}
              </div>
            )
          })}
        </div>
        {/* Layers toggle icon */}
        <div
          style={{
            marginTop: '8px',
            paddingTop: '6px',
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
