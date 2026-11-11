import { motion } from 'framer-motion'
import { MdOutlineEco } from 'react-icons/md'

// Region images — verified correct content per label
const regionImages = [
  {
    // Mahabaleshwar — green misty hills
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80',
    label: 'Mahabaleshwar',
  },
  {
    // Western Ghats — dense green forest valley
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    label: 'Western Ghats',
  },
  {
    // River/water body — replacing Urban Region with a river landscape
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80',
    label: 'River Region',
  },
  {
    // Thar Desert — sand dunes
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80',
    label: 'Thar Desert',
  },
  {
    // Hill Station — mountain peaks with clouds
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    label: 'Hill Station',
  },
  {
    // Forest Region — tall dense trees
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
    label: 'Forest Region',
  },
]

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const, delay },
  },
})

export default function IntroSection() {
  return (
    <section id="intro-section" style={{ background: '#f3f4f6' }}>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — INTRODUCTION (dark green full-width)
      ══════════════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2d1a 0%, #14532d 60%, #166534 100%)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Text — full width on top */}
          <motion.div
            variants={fadeUp(0)} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ marginBottom: 40 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)',
              borderRadius: 99, padding: '5px 14px', marginBottom: 18,
            }}>
              <MdOutlineEco size={14} style={{ color: '#4ade80' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#4ade80', fontWeight: 600 }}>
                Introduction
              </span>
            </div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              color: '#fff', margin: '0 0 18px', lineHeight: 1.2,
            }}>
              Mapping India's Best<br />
              <span style={{ color: '#4ade80' }}>Eco-Tourism Destinations</span>
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.78)',
              lineHeight: 1.8, margin: '0 0 24px', maxWidth: 700,
            }}>
              Eco-tourism development requires careful selection of suitable sites to balance
              tourism growth with environmental conservation. This project leverages
              <strong style={{ color: '#4ade80' }}> satellite imagery</strong>,
              <strong style={{ color: '#4ade80' }}> Digital Elevation Models (DEM)</strong>, and
              vegetation indices like <strong style={{ color: '#4ade80' }}>NDVI</strong> to efficiently
              analyze terrain characteristics across India.
            </p>
          </motion.div>

          {/* Images — straight horizontal line below text */}
          <motion.div
            variants={fadeUp(0.2)} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}
          >
            {regionImages.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.04, y: -4 }}
                style={{
                  borderRadius: 12, overflow: 'hidden',
                  height: 180, flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)', position: 'relative',
                }}
              >
                <img src={img.url} alt={img.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=70' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)',
                }} />
                <span style={{
                  position: 'absolute', bottom: 8, left: 10,
                  fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: '#fff',
                }}>{img.label}</span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — PROBLEM STATEMENT
      ══════════════════════════════════════════════════════ */}
      <div style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(220,38,38,0.06)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(220,38,38,0.04)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>

          {/* Header */}
          <motion.div
            variants={fadeUp()} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ marginBottom: 56 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 3, background: '#dc2626', borderRadius: 2 }} />
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                color: '#dc2626', letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>The Challenge</span>
            </div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#fff',
              margin: '0 0 14px',
            }}>
              Problem Statement
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 15,
              color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
              maxWidth: 560, margin: 0,
            }}>
              Traditional eco-tourism assessment methods are inadequate for India's scale.
              An automated, satellite-driven approach is essential.
            </p>
          </motion.div>

          {/* 4 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
            {[
              {
                number: '01',
                title: 'Time Consuming',
                desc: 'Manual field surveys take months to cover even small geographic areas, making large-scale assessment impractical.',
                accent: '#ef4444',
              },
              {
                number: '02',
                title: 'High Cost',
                desc: 'Field investigations demand significant expenditure on travel, logistics, and expert analysis — resources often unavailable.',
                accent: '#f97316',
              },
              {
                number: '03',
                title: 'Limited Coverage',
                desc: 'Conventional methods cannot scale across India\'s 3.28 million km² terrain, leaving vast regions unassessed.',
                accent: '#f59e0b',
              },
              {
                number: '04',
                title: 'No Real-time Data',
                desc: 'Static assessments miss seasonal vegetation, rainfall, and climate changes that directly affect eco-tourism suitability.',
                accent: '#22c55e',
              },
            ].map(({ number, title, desc, accent }, i) => (
              <motion.div
                key={number}
                custom={i} variants={fadeUp(i * 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -8, boxShadow: `0 20px 48px rgba(0,0,0,0.4)` }}
                style={{
                  borderRadius: 18, padding: '32px 26px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative', overflow: 'hidden',
                  transition: 'box-shadow 0.25s, transform 0.25s',
                }}
              >
                {/* Large background number */}
                <div style={{
                  position: 'absolute', top: -10, right: 16,
                  fontFamily: 'Inter, sans-serif', fontWeight: 900,
                  fontSize: 80, color: 'rgba(255,255,255,0.04)',
                  lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                }}>
                  {number}
                </div>
                {/* Accent top bar */}
                <div style={{
                  width: 36, height: 4, borderRadius: 2,
                  background: accent, marginBottom: 20,
                }} />
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 800,
                  fontSize: 16, color: '#fff', marginBottom: 12,
                }}>
                  {title}
                </div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 13.5,
                  color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
                }}>
                  {desc}
                </div>
                {/* Bottom accent dot */}
                <div style={{
                  position: 'absolute', bottom: 20, right: 20,
                  width: 8, height: 8, borderRadius: '50%', background: accent,
                  opacity: 0.7,
                }} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — OUR SOLUTION
      ══════════════════════════════════════════════════════ */}
      <div style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <motion.div
            variants={fadeUp()} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ marginBottom: 56 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 3, background: '#16a34a', borderRadius: 2 }} />
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                color: '#16a34a', letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>The Solution</span>
            </div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#111827',
              margin: '0 0 14px',
            }}>
              Our Solution
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 15,
              color: '#6b7280', lineHeight: 1.75, maxWidth: 560, margin: 0,
            }}>
              An end-to-end pipeline combining real-time satellite data and deep learning
              to classify any location in India accurately within seconds.
            </p>
          </motion.div>

          {/* 3 solution cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 28 }}>
            {[
              {
                num: '01',
                accent: '#16a34a',
                title: 'Real-time Satellite Data',
                desc: 'Fetches live data from Sentinel-1, Sentinel-2, SRTM DEM, ERA5 climate, and JRC water datasets via Google Earth Engine for any coordinate in India.',
                tag: 'Google Earth Engine',
              },
              {
                num: '02',
                accent: '#0284c7',
                title: '11-Band Feature Extraction',
                desc: 'Extracts NDVI, RGB bands, elevation, slope, water distance, temperature, rainfall, and SAR backscatter — all normalized to match the training pipeline.',
                tag: 'Geospatial Analysis',
              },
              {
                num: '03',
                accent: '#7c3aed',
                title: 'Attention U-Net Segmentation',
                desc: 'Pixel-level classification using a trained Attention U-Net on 980 patches across 118 Indian regions. Each pixel is classified as Suitable, Moderate, or Not Suitable.',
                tag: 'Deep Learning',
              },
            ].map(({ num, accent, title, desc, tag }, i) => (
              <motion.div
                key={num}
                variants={fadeUp(i * 0.12)} initial="hidden" whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -6, boxShadow: `0 20px 48px ${accent}18` }}
                style={{
                  borderRadius: 18, padding: '32px 28px',
                  border: '1px solid #e5e7eb', background: '#fafafa',
                  position: 'relative', overflow: 'hidden',
                  transition: 'box-shadow 0.25s, transform 0.25s',
                }}
              >
                {/* Ghost number */}
                <div style={{
                  position: 'absolute', top: -12, right: 18,
                  fontFamily: 'Inter, sans-serif', fontWeight: 900,
                  fontSize: 90, color: `${accent}10`, lineHeight: 1,
                  userSelect: 'none', pointerEvents: 'none',
                }}>{num}</div>
                {/* Accent bar */}
                <div style={{ width: 32, height: 4, borderRadius: 2, background: accent, marginBottom: 20 }} />
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 12 }}>
                  {title}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#6b7280', lineHeight: 1.75, marginBottom: 20 }}>
                  {desc}
                </div>
                <span style={{
                  display: 'inline-block', fontFamily: 'Inter, sans-serif',
                  fontSize: 11, fontWeight: 700, color: accent,
                  background: `${accent}12`, borderRadius: 6, padding: '4px 10px',
                  letterSpacing: '0.05em',
                }}>
                  {tag}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Model performance banner */}
          <motion.div
            variants={fadeUp(0.3)} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{
              borderRadius: 20, overflow: 'hidden',
              background: 'linear-gradient(135deg, #0f2d1a 0%, #14532d 60%, #166534 100%)',
              display: 'grid', gridTemplateColumns: '1fr auto',
              alignItems: 'center', gap: 32,
              padding: '36px 40px',
            }}
          >
            {/* Left */}
            <div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 800,
                fontSize: 18, color: '#fff', marginBottom: 6,
              }}>
                Model Performance
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                Attention U-Net · 980 patches · 118 regions of India
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              {[
                { label: 'Accuracy',   value: '92.79%', color: '#4ade80' },
                { label: 'Mean IoU',   value: '52.53%', color: '#86efac' },
                { label: 'Dice Score', value: '64.74%', color: '#bbf7d0' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'Inter, sans-serif', fontWeight: 900,
                    fontSize: 28, color, lineHeight: 1, marginBottom: 4,
                  }}>{value}</div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 11,
                    color: 'rgba(255,255,255,0.5)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS (timeline style)
      ══════════════════════════════════════════════════════ */}
      <div style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            variants={fadeUp()} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <span style={{
              display: 'inline-block', fontFamily: 'Inter, sans-serif',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              color: '#0284c7', textTransform: 'uppercase', marginBottom: 8,
            }}>
              🔄 The Process
            </span>
            <h2 style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 800,
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#111827', margin: 0,
            }}>
              How It Works
            </h2>
          </motion.div>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                step: '01', color: '#22c55e', title: 'Enter Location',
                desc: 'User enters latitude/longitude coordinates or searches a place name anywhere in India.',
                side: 'left',
              },
              {
                step: '02', color: '#0284c7', title: 'Satellite Data Fetch',
                desc: 'Google Earth Engine fetches live Sentinel-1/2, SRTM DEM, ERA5 climate, and JRC water data for that location.',
                side: 'right',
              },
              {
                step: '03', color: '#7c3aed', title: 'Feature Extraction',
                desc: '11 geospatial features are extracted: RGB bands, NDVI, elevation, slope, water distance, temperature, rainfall, and SAR.',
                side: 'left',
              },
              {
                step: '04', color: '#dc2626', title: 'AI Prediction',
                desc: 'The Attention U-Net model processes the 11-band patch and produces pixel-level segmentation — green, yellow, or black.',
                side: 'right',
              },
              {
                step: '05', color: '#16a34a', title: 'Map Visualization',
                desc: 'The segmentation overlay is displayed on real Sentinel-2 satellite imagery on the interactive Leaflet map.',
                side: 'left',
              },
            ].map(({ step, color, title, desc, side }, i) => (
              <motion.div
                key={step}
                variants={fadeUp(i * 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true }}
                style={{
                  display: 'flex',
                  flexDirection: side === 'right' ? 'row-reverse' : 'row',
                  gap: 24, alignItems: 'center', marginBottom: 16,
                  paddingLeft: side === 'right' ? '10%' : 0,
                  paddingRight: side === 'left' ? '10%' : 0,
                }}
              >
                {/* Step circle — number only */}
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                  background: `${color}18`, border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 800, color }}>{step}</span>
                </div>

                {/* Content */}
                <motion.div
                  whileHover={{ boxShadow: `0 8px 28px ${color}18` }}
                  style={{
                    flex: 1, borderRadius: 14, padding: '18px 22px',
                    background: '#fafafa', border: `1.5px solid ${color}30`,
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 5 }}>
                    {title}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#6b7280', lineHeight: 1.65 }}>
                    {desc}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — DEVELOPED BY
      ══════════════════════════════════════════════════════ */}
      <div style={{
        padding: '80px 24px 80px',
        background: 'linear-gradient(135deg, #0f2d1a 0%, #14532d 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            variants={fadeUp()} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 3, background: '#4ade80', borderRadius: 2 }} />
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                color: '#4ade80', letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>Team Eco</span>
              <div style={{ width: 40, height: 3, background: '#4ade80', borderRadius: 2 }} />
            </div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 800,
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#fff', margin: 0,
            }}>
              Developed By
            </h2>
          </motion.div>

          {/* Team cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { name: 'Darshana Mahajan', initial: 'D', color: '#22c55e', role: 'Team Leader' },
              { name: 'Rucha Boraste',    initial: 'R', color: '#4ade80', role: 'Team Member' },
              { name: 'Sakshi Kokate',    initial: 'S', color: '#86efac', role: 'Team Member' },
              { name: 'Mayuri Khairnar',  initial: 'M', color: '#bbf7d0', role: 'Team Member' },
            ].map(({ name, initial, color, role }, i) => (
              <motion.div
                key={name}
                variants={fadeUp(i * 0.1)} initial="hidden" whileInView="visible" viewport={{ once: true }}
                whileHover={{ y: -6, boxShadow: '0 16px 36px rgba(0,0,0,0.4)' }}
                style={{
                  borderRadius: 16, padding: '28px 18px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)', transition: 'box-shadow 0.2s',
                  position: 'relative',
                }}
              >
                {/* Leader badge */}
                {role === 'Team Leader' && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#22c55e', borderRadius: 6,
                    padding: '2px 8px',
                    fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 700, color: '#fff',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>Leader</div>
                )}
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', margin: '0 auto 14px',
                  background: `linear-gradient(135deg, ${color}40, ${color}80)`,
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 24, color,
                }}>
                  {initial}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>
                  {name}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: color, fontWeight: 600 }}>
                  {role}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
