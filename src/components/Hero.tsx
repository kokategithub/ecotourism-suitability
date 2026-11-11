import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GiLeafSwirl } from 'react-icons/gi'
import { MdTerrain } from 'react-icons/md'
import { WiCloud } from 'react-icons/wi'
import { RiBrainLine } from 'react-icons/ri'

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=90',
    label: 'Dense Forest',
    location: 'Western Ghats, India',
  },
  {
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=90',
    label: 'Mountain Valleys',
    location: 'Himachal Pradesh, India',
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90',
    label: 'Hill Stations',
    location: 'Maharashtra, India',
  },
  {
    url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&q=90',
    label: 'Wildlife Reserves',
    location: 'Central India',
  },
  {
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=90',
    label: 'River Valleys',
    location: 'Northeast India',
  },
]

const features = [
  { id: 'env', icon: <GiLeafSwirl size={22} />, label: 'Environment\nAnalysis' },
  { id: 'terrain', icon: <MdTerrain size={22} />, label: 'Terrain\nMapping' },
  { id: 'weather', icon: <WiCloud size={28} />, label: 'Weather\nData' },
  { id: 'ai', icon: <RiBrainLine size={22} />, label: 'Deep Learning\nModel' },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length)
    }, 4000)

    return () => window.clearInterval(id)
  }, [])

  const navigate = useNavigate()

  return (
    <section style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', minHeight: 600 }}>
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${heroImages[current].url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,18,10,0.55) 0%, rgba(5,18,10,0.72) 60%, rgba(5,18,10,0.92) 100%)' }} />

      <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
        {heroImages.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background: i === current ? '#22c55e' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s',
              padding: 0,
            }}
          />
        ))}
      </div>

      <motion.div
        key={`badge-${current}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          position: 'absolute',
          bottom: 100,
          right: 32,
          zIndex: 10,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(34,197,94,0.4)',
          borderRadius: 10,
          padding: '8px 14px',
        }}
      >
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#4ade80', fontWeight: 600, marginBottom: 2 }}>
          📍 {heroImages[current].label}
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
          {heroImages[current].location}
        </div>
      </motion.div>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            color: '#ffffff',
            margin: '0 0 16px',
            lineHeight: 1.15,
            maxWidth: 800,
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          Terrain Suitability Mapping
          <br />
          <span style={{ color: '#4ade80' }}>for Eco-Tourism</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            color: 'rgba(255,255,255,0.80)',
            maxWidth: 580,
            lineHeight: 1.7,
            margin: '0 0 36px',
          }}
        >
          Using satellite imagery, deep learning, and real-time geospatial data to identify the best eco-tourism locations across India.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.05, boxShadow: '0 8px 28px rgba(34,197,94,0.5)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/predict')}
            style={{
              padding: '13px 28px',
              borderRadius: 12,
              border: 'none',
              background: '#22c55e',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(34,197,94,0.4)',
            }}
          >
            🔍 Try the Prediction Tool
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {features.map((feature) => (
            <div
              key={feature.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.09)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999,
                padding: '9px 14px',
                color: '#ffffff',
              }}
            >
              <span style={{ color: '#4ade80' }}>{feature.icon}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, whiteSpace: 'pre-line' }}>{feature.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}