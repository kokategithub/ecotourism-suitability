import { motion } from 'framer-motion'
import { GiLeafSwirl } from 'react-icons/gi'

export default function Footer() {
  return (
    <footer
      style={{
        background: '#14532d',
        marginTop: 20,
        minHeight: 52,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.65)',
            margin: 0,
          }}
        >
          © 2024 EcoTourism Suitability Prediction System | Built for a Sustainable Future
        </p>

        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <GiLeafSwirl size={14} style={{ color: '#4ade80' }} />
        </motion.div>
      </div>
    </footer>
  )
}
