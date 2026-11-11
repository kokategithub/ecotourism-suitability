import { motion } from 'framer-motion'
import {
  GiLeafSwirl,
  GiWaterDrop,
  GiRaining,
  GiEarthAmerica,
} from 'react-icons/gi'
import { MdTerrain, MdLandscape, MdThermostat, MdFactory } from 'react-icons/md'
import { TbMountain } from 'react-icons/tb'
import { factors } from '../data/factors'

const iconMap: Record<string, React.ReactNode> = {
  vegetation:  <GiLeafSwirl size={19} />,
  slope:       <MdTerrain size={19} />,
  elevation:   <TbMountain size={19} />,
  water:       <GiWaterDrop size={19} />,
  rainfall:    <GiRaining size={19} />,
  temperature: <MdThermostat size={19} />,
  soil:        <GiEarthAmerica size={19} />,
  landcover:   <MdLandscape size={19} />,
  human:       <MdFactory size={19} />,
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
}

export default function FactorCards() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        marginTop: 16,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          padding: '20px 20px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <GiLeafSwirl size={17} style={{ color: '#22c55e', flexShrink: 0 }} />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: '#111827',
            }}
          >
            Factors Considered
          </span>
        </div>

        {/* 9 cards in one row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 1fr)',
            gap: 10,
          }}
        >
          {factors.map((factor) => (
            <motion.div
              key={factor.id}
              variants={item}
              whileHover={{ y: -4, boxShadow: '0 8px 20px rgba(34,197,94,0.14)' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '12px 8px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 12,
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {iconMap[factor.id]}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 11.5,
                    color: '#374151',
                    lineHeight: 1.2,
                  }}
                >
                  {factor.title}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 10.5,
                    color: '#9ca3af',
                    marginTop: 2,
                  }}
                >
                  {factor.subtitle}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
