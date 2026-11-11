import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertCircle, FiCheckCircle, FiSearch, FiWifi, FiWifiOff } from 'react-icons/fi'
import { GiLeafSwirl, GiWaterDrop, GiRaining, GiEarthAmerica } from 'react-icons/gi'
import { MdTerrain, MdLandscape, MdThermostat, MdFactory, MdMyLocation } from 'react-icons/md'
import { TbMountain } from 'react-icons/tb'
import { WiThermometer, WiRaindrops } from 'react-icons/wi'
import { callPredict, checkHealth } from '../services/predictionApi'
import type { PredictionResult, PredictionExplanation } from '../types/prediction'
import { factors } from '../data/factors'

import { MapContainer, TileLayer, Marker, Popup, useMap, ImageOverlay } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const LOADING_STEPS = [
  'Fetching satellite and environmental data...',
  'Analyzing terrain & elevation...',
  'Processing weather data...',
  'Calculating NDVI & water distance...',
  'Running suitability model...',
]

const iconMap: Record<string, React.ReactNode> = {
  vegetation:  <GiLeafSwirl size={20} />,
  slope:       <MdTerrain size={20} />,
  elevation:   <TbMountain size={20} />,
  water:       <GiWaterDrop size={20} />,
  rainfall:    <GiRaining size={20} />,
  temperature: <MdThermostat size={20} />,
  soil:        <GiEarthAmerica size={20} />,
  landcover:   <MdLandscape size={20} />,
  human:       <MdFactory size={20} />,
}

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.flyTo([lat, lng], 12, { duration: 1.2 }) }, [lat, lng, map])
  return null
}

export default function PredictionDashboard() {
  const [tab, setTab] = useState<'coordinates' | 'search'>('coordinates')
  const [lat, setLat] = useState('17.9252')
  const [lng, setLng] = useState('73.6581')
  const [place, setPlace] = useState('')

  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<{ gee: boolean; model: boolean } | null>(null)

  const [result, setResult] = useState<PredictionResult | null>(null)
  const [predicted, setPredicted] = useState(false)
  const [segImage, setSegImage] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([17.9252, 73.6581])
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => { checkHealth().then(setHealth) }, [])

  useEffect(() => {
    if (!loading) return
    let index = 0
    setLoadingStep(LOADING_STEPS[0])
    const timer = window.setInterval(() => {
      index = (index + 1) % LOADING_STEPS.length
      setLoadingStep(LOADING_STEPS[index])
    }, 2200)
    return () => window.clearInterval(timer)
  }, [loading])

  useEffect(() => { setMapReady(true) }, [])

  const geocodePlace = async (placeName: string): Promise<{ lat: number; lng: number }> => {
    const queries = [
      placeName,
      `${placeName}, India`,
      `${placeName.replace(/\b(dam|lake|river|falls|fort|beach|valley|peak|reserve|national park|sanctuary)\b/gi, '').trim()}, India`,
    ]
    for (const query of queries) {
      if (!query.trim() || query.trim() === ', India') continue
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } },
      )
      const data = await res.json()
      if (data?.length > 0) return { lat: Number(data[0].lat), lng: Number(data[0].lon) }
    }
    throw new Error(`Could not find "${placeName}" in India.`)
  }

  const handlePredict = async () => {
    let la = Number(lat)
    let lo = Number(lng)

    if (tab === 'search') {
      if (!place.trim()) { setError('Please enter a place name.'); return }
      setLoading(true); setError(null); setSegImage(null); setLoadingStep('Searching for location...')
      try {
        const coords = await geocodePlace(place.trim())
        la = coords.lat; lo = coords.lng
        setLat(la.toFixed(4)); setLng(lo.toFixed(4))
      } catch (err) {
        setLoading(false); setLoadingStep('')
        setError(err instanceof Error ? err.message : 'Geocoding failed.')
        return
      }
    }

    if (Number.isNaN(la) || Number.isNaN(lo)) { setError('Please enter valid numeric coordinates.'); return }
    if (la < -90 || la > 90)   { setError('Latitude must be between -90 and 90.'); return }
    if (lo < -180 || lo > 180) { setError('Longitude must be between -180 and 180.'); return }

    setLoading(true); setError(null); setSegImage(null)

    try {
      const data = await callPredict(la, lo, { onProgress: (msg) => setLoadingStep(msg) })
      setResult(data)
      setSegImage(data.segmentationImage ?? null)
      setPredicted(true)
      setMapCenter([la, lo])
      checkHealth().then(setHealth)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred.')
    } finally {
      setLoading(false); setLoadingStep('')
    }
  }

  const classLabel = result?.label ?? ''
  const scoreColor =
    classLabel === 'Suitable'            ? '#16a34a' :
    classLabel === 'Moderately Suitable' ? '#ca8a04' :
    classLabel === 'Not Suitable'        ? '#374151' : '#6b7280'

  const resultBg =
    classLabel === 'Suitable'            ? 'linear-gradient(135deg,#16a34a,#22c55e)' :
    classLabel === 'Moderately Suitable' ? 'linear-gradient(135deg,#ca8a04,#eab308)' :
    classLabel === 'Not Suitable'        ? 'linear-gradient(135deg,#374151,#4b5563)' :
    'linear-gradient(135deg,#9ca3af,#d1d5db)'

  const explanation = result?.explanation as PredictionExplanation | null | undefined

  // Overlay bounds: small ~3.8km box (matches GEE 3840m buffer)
  // 0.0345° ≈ 3840m at India's latitude
  const D = 0.0345
  const overlayBounds: [[number, number],[number,number]] = [
    [mapCenter[0] - D, mapCenter[1] - D],
    [mapCenter[0] + D, mapCenter[1] + D],
  ]

  return (
    <section style={{ background: '#f3f4f6', padding: '24px 20px 48px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Status bar ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <StatusBadge ok={health?.gee   ?? false} label="GEE"   okText="Connected"    failText="Disconnected" />
          <StatusBadge ok={health?.model ?? false} label="Model" okText="Connected" failText="Not loaded" />
        </div>

        {/* ── Main 2-column grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: 16, alignItems: 'start' }}>

          {/* ─── LEFT: Input ─── */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdMyLocation size={16} color="#16a34a" /> Input Location
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['coordinates', 'search'] as const).map((v) => (
                <button key={v} type="button" onClick={() => setTab(v)} style={{
                  flex: 1, border: 'none', borderRadius: 999, padding: '8px 0',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  background: tab === v ? '#16a34a' : '#f3f4f6',
                  color:      tab === v ? '#fff'    : '#374151',
                  transition: 'all 0.15s',
                }}>
                  {v === 'coordinates' ? 'Coordinates' : 'Search Place'}
                </button>
              ))}
            </div>

            {tab === 'coordinates' ? (
              <>
                <InputField label="Latitude"  value={lat} onChange={setLat} />
                <InputField label="Longitude" value={lng} onChange={setLng} />
              </>
            ) : (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Place name</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #d1d5db', borderRadius: 10, background: '#fff', padding: '0 10px' }}>
                  <FiSearch color="#9ca3af" size={14} />
                  <input
                    value={place} onChange={(e) => setPlace(e.target.value)}
                    placeholder="e.g. Lonavala" onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
                    style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 0', fontSize: 13 }}
                  />
                </div>
              </div>
            )}

            <button type="button" onClick={handlePredict} disabled={loading} style={{
              width: '100%', border: 'none', borderRadius: 10, padding: '11px 0',
              fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#86efac' : '#16a34a', color: '#fff',
              boxShadow: '0 4px 14px rgba(22,163,74,0.3)', marginTop: 4, marginBottom: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading
                ? <><GiLeafSwirl size={14} style={{ animation: 'spin 1s linear infinite' }} /> Predicting...</>
                : <><FiSearch size={14} /> Predict Suitability</>}
            </button>

            {/* How it works */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 4 }}>💡 How it works?</div>
              <p style={{ fontSize: 11.5, color: '#374151', margin: 0, lineHeight: 1.6 }}>
                Our model analyzes 9 different environmental and meteorological factors to predict the ecotourism suitability of the given location.
              </p>
            </div>

            {error && (
              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
                <FiAlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {loading && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#ecfdf5', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <GiLeafSwirl size={14} color="#16a34a" />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#166534' }}>{loadingStep}</span>
                </div>
                <div style={{ height: 5, background: '#dcfce7', borderRadius: 999, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: '100%' }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                    style={{ height: '100%', background: '#22c55e' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT: Results + Map ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <AnimatePresence mode="wait">
              {predicted && result ? (
                <motion.div key="result" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Prediction Result</div>

                  {/* Suitability banner */}
                  <div style={{ background: resultBg, borderRadius: 16, padding: '14px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GiLeafSwirl size={22} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{classLabel}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>
                        Suitability Score&nbsp;<strong style={{ color: '#fff' }}>{result.score != null ? result.score.toFixed(2) : '—'}</strong>&nbsp;/ 1.00
                      </div>
                    </div>
                  </div>

                  {/* Metric row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                    <MetricCard icon={<TbMountain size={16} />} label="Elevation"    value={`${result.elevation ?? 0} m`} />
                    <MetricCard icon={<WiThermometer size={18} />} label="Temperature" value={`${result.temperature ?? 0}°C`} />
                    <MetricCard icon={<WiRaindrops size={18} />} label="Rainfall"    value={`${result.rainfall ?? 0} mm/year`} />
                  </div>

                  {/* ── Explanation panel ── */}
                  {explanation && (
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '14px 16px', marginBottom: 12 }}>
                      {/* Summary */}
                      <div style={{ fontSize: 12.5, color: '#374151', marginBottom: 12, lineHeight: 1.7 }}>
                        <span style={{ fontWeight: 700, color: '#16a34a' }}>Why this result?</span>&nbsp;
                        {explanation.summary}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: explanation.negative_factors.length > 0 ? '1fr 1fr' : '1fr', gap: 12 }}>
                        {/* Favorable factors */}
                        {explanation.positive_factors.length > 0 && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                              <FiCheckCircle size={14} color="#16a34a" />
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>Favorable Factors</span>
                            </div>
                            {explanation.positive_factors.map((f, i) => (
                              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                                <div style={{ width: 3, borderRadius: 2, background: '#16a34a', flexShrink: 0, alignSelf: 'stretch' }} />
                                <span style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.5 }}>{f}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Negative factors */}
                        {explanation.negative_factors.length > 0 && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                              <FiAlertCircle size={14} color="#dc2626" />
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>Limiting Factors</span>
                            </div>
                            {explanation.negative_factors.map((f, i) => (
                              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                                <div style={{ width: 3, borderRadius: 2, background: '#dc2626', flexShrink: 0, alignSelf: 'stretch' }} />
                                <span style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.5 }}>{f}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Moderate factors */}
                      {explanation.moderate_factors.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <span style={{ fontSize: 14 }}>⚠️</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Moderate Factors</span>
                          </div>
                          {explanation.moderate_factors.map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                              <div style={{ width: 3, borderRadius: 2, background: '#eab308', flexShrink: 0, alignSelf: 'stretch' }} />
                              <span style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.5 }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13, marginBottom: 4 }}>
                  <MdMyLocation size={28} style={{ marginBottom: 8, color: '#d1d5db' }} />
                  <div>Enter coordinates and click <strong style={{ color: '#374151' }}>Predict Suitability</strong> to see results</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Map with segmentation overlay ── */}
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: 340, position: 'relative' }}>
              {mapReady && (
                <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    attribution="© Google Maps" maxZoom={20}
                  />
                  <MapFlyTo lat={mapCenter[0]} lng={mapCenter[1]} />

                  {predicted && (
                    <>
                      {/* Segmentation PNG overlaid on map at exact GEE bounds */}
                      {segImage && (
                        <ImageOverlay
                          url={segImage}
                          bounds={overlayBounds}
                          opacity={0.80}
                          className="seg-overlay-256"
                        />
                      )}
                      <Marker position={mapCenter}>
                        <Popup>
                          <strong>{classLabel || 'Result'}</strong><br />
                          {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}<br />
                          Score: {result?.score?.toFixed(2) ?? '—'}
                        </Popup>
                      </Marker>
                    </>
                  )}
                </MapContainer>
              )}

              {/* Legend overlay */}
              <div style={{
                position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
                background: 'rgba(255,255,255,0.95)', borderRadius: 10,
                padding: '8px 12px', border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: 12,
              }}>
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>Suitability Index</div>
                {[
                  { color: '#16a34a', label: 'Suitable',             active: classLabel === 'Suitable' },
                  { color: '#eab308', label: 'Moderately Suitable',  active: classLabel === 'Moderately Suitable' },
                  { color: '#111827', label: 'Not Suitable',         active: classLabel === 'Not Suitable' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <span style={{ width: 11, height: 11, borderRadius: '50%', background: item.color, display: 'inline-block', flexShrink: 0, outline: item.active ? `2px solid ${item.color}` : 'none', outlineOffset: 1 }} />
                    <span style={{ color: '#374151', fontWeight: item.active ? 700 : 400 }}>{item.label}</span>
                    {item.active && <span style={{ marginLeft: 2, fontSize: 10 }}>◀</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Factor Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.45 }}
          style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '20px', marginTop: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <GiLeafSwirl size={16} style={{ color: '#22c55e' }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Factors Considered</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 10 }}>
            {factors.map((factor, i) => (
              <motion.div
                key={factor.id}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.35 }}
                whileHover={{ y: -4, boxShadow: '0 8px 20px rgba(34,197,94,0.15)' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 6px', border: '1.5px solid #e5e7eb', borderRadius: 12, background: '#fff', cursor: 'pointer', transition: 'all 0.18s' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {iconMap[factor.id]}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 11.5, color: '#374151', lineHeight: 1.2 }}>{factor.title}</div>
                  <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>{factor.subtitle}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}

/* ── Reusable sub-components ── */

function StatusBadge({ ok, label, okText, failText }: { ok: boolean; label: string; okText: string; failText: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', borderRadius: 999, padding: '5px 12px', border: '1px solid #e5e7eb', fontSize: 12, fontWeight: 600, color: '#374151', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      {ok ? <FiWifi size={12} color="#16a34a" /> : <FiWifiOff size={12} color="#dc2626" />}
      <span style={{ color: '#9ca3af' }}>{label}:</span>
      <span style={{ color: ok ? '#16a34a' : '#dc2626' }}>{ok ? okText : failText}</span>
    </div>
  )
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #d1d5db', borderRadius: 10, background: '#fff', padding: '0 10px' }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>⊕</span>
        <input value={value} onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', padding: '9px 0', fontSize: 13 }} />
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 12, fontWeight: 600 }}>{icon} {label}</div>
      <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800, color: '#111827' }}>{value}</div>
    </div>
  )
}
