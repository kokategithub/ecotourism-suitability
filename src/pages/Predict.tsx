import { motion } from 'framer-motion'
import PredictionDashboard from '../components/PredictionDashboard'
import Footer from '../components/Footer'
import { GiEarthAmerica } from 'react-icons/gi'
import { MdTerrain, MdThermostat } from 'react-icons/md'
import { TbBrain } from 'react-icons/tb'
import { WiDaySunny } from 'react-icons/wi'

const heroFeatures = [
  { icon: <GiEarthAmerica size={28} />, label: 'Environment\nFriendly' },
  { icon: <MdTerrain size={28} />,      label: 'Terrain\nAnalysis' },
  { icon: <WiDaySunny size={28} />,     label: 'Weather\nData' },
  { icon: <TbBrain size={28} />,        label: 'Deep Learning\nModel' },
]

export default function Predict() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{ background: '#f3f4f6', minHeight: '100vh' }}
    >
      {/* ── Hero ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #0a1f0e 0%, #14532d 60%, #1a6b38 100%)',
          padding: '56px 40px 64px',
          minHeight: 200,
        }}
      >
        {/* mountain silhouette overlay */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='rgba(0,0,0,0.18)' d='M0,224L80,202.7C160,181,320,139,480,154.7C640,171,800,245,960,256C1120,267,1280,213,1360,186.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z'/%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
            backgroundPosition: 'bottom',
            opacity: 0.5,
          }}
        />

        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          {/* Left: title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              color: '#ffffff', margin: '0 0 12px', lineHeight: 1.2,
            }}>
              AI Powered<br />Ecotourism<br />
              <span style={{ color: '#4ade80' }}>Suitability Prediction</span>
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 14,
              color: 'rgba(255,255,255,0.65)', margin: 0, maxWidth: 340,
            }}>
              Enter any location to check its suitability for ecotourism using deep learning and geospatial analysis.
            </p>
          </motion.div>

          {/* Right: feature icons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}
          >
            {heroFeatures.map((f, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#4ade80',
                }}>
                  {f.icon}
                </div>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                  color: 'rgba(255,255,255,0.75)', textAlign: 'center', whiteSpace: 'pre-line',
                }}>
                  {f.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Dashboard ── */}
      <PredictionDashboard />

      <Footer />
    </motion.div>
  )
}
