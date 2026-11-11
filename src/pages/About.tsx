import { motion } from 'framer-motion'
import { GiLeafSwirl } from 'react-icons/gi'
import { FiTarget, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { RiBrainLine } from 'react-icons/ri'
import Footer from '../components/Footer'

const team = [
  { name: 'Darshana', role: 'Team Member' },
  { name: 'Rucha',    role: 'Team Member' },
  { name: 'Sakshi',   role: 'Team Member' },
  { name: 'Mayuri',   role: 'Team Member' },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' as const },
  }),
} as const

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{ background: '#f3f4f6', minHeight: '100vh' }}
    >
      {/* ── Hero banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f2d1a 0%, #14532d 60%, #166534 100%)',
          padding: '52px 24px 48px',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}
        >
          <div
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)',
              border: '2px solid #22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <GiLeafSwirl size={26} style={{ color: '#4ade80' }} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 800,
            fontSize: '2rem', color: '#ffffff', margin: '0 0 10px',
          }}
        >
          About the Project
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: 14,
            color: 'rgba(255,255,255,0.7)', margin: 0,
          }}
        >
          Terrain Suitability Mapping for Eco-Tourism Development Using Satellite Imaging
        </motion.p>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>

        {/* Introduction */}
        <motion.div
          custom={0} variants={cardVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          style={{
            background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)', padding: '28px 32px', marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GiLeafSwirl size={18} style={{ color: '#22c55e' }} />
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 17, color: '#111827', margin: 0 }}>
              Introduction
            </h2>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.75, color: '#374151', margin: 0 }}>
            Eco-tourism development requires careful selection of suitable sites to balance tourism
            growth with environmental conservation. Traditional methods are time-consuming, costly,
            and limited in geographic coverage. This project leverages <strong>satellite imagery</strong>,
            <strong> Digital Elevation Models (DEM)</strong>, and vegetation indices like <strong>NDVI</strong>
            to efficiently analyze terrain and vegetation characteristics. By integrating these datasets
            with a deep learning <strong>Attention U-Net</strong> model, land areas are automatically
            classified into suitability categories — providing accurate, data-driven guidance for
            sustainable eco-tourism planning across India.
          </p>
        </motion.div>

        {/* Problem Statement */}
        <motion.div
          custom={1} variants={cardVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          style={{
            background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)', padding: '28px 32px', marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiAlertCircle size={17} style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 17, color: '#111827', margin: 0 }}>
              Problem Statement
            </h2>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.75, color: '#374151', margin: 0 }}>
            Traditional terrain suitability assessments depend on <strong>manual surveys and field
            investigations</strong> — methods that are time-consuming, expensive, and difficult to
            scale across large geographic areas. There is a need for an efficient, automated approach
            that can analyze key terrain characteristics such as <strong>elevation, slope, vegetation
            cover, proximity to water bodies, temperature, and rainfall</strong> to determine which
            areas are genuinely suitable for eco-tourism development — without requiring physical
            ground surveys.
          </p>
        </motion.div>

        {/* Solution */}
        <motion.div
          custom={2} variants={cardVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          style={{
            background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)', padding: '28px 32px', marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiCheckCircle size={17} style={{ color: '#22c55e' }} />
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 17, color: '#111827', margin: 0 }}>
              Our Solution
            </h2>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.75, color: '#374151', margin: '0 0 16px' }}>
            We built an end-to-end AI-powered web platform that allows anyone to enter coordinates
            of any location in India and instantly receive a suitability prediction for eco-tourism.
            The system:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Fetches live satellite data via Google Earth Engine (Sentinel-1, Sentinel-2, SRTM DEM, ERA5, JRC Surface Water)',
              'Extracts 11 geospatial features: RGB bands, NDVI, slope, elevation, water distance, temperature, rainfall, and SAR backscatter',
              'Runs an Attention U-Net deep learning model trained on 980 image patches across 118 geographic regions of India',
              'Returns a pixel-wise suitability classification: Suitable, Partially Suitable, or Not Suitable',
              'Displays the result on an interactive map with the actual satellite imagery of the region overlaid',
            ].map((point, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11, color: '#16a34a',
                }}>
                  {i + 1}
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, lineHeight: 1.65, color: '#374151', margin: 0 }}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Model Info */}
        <motion.div
          custom={3} variants={cardVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            borderRadius: 20, border: '1px solid #bbf7d0',
            boxShadow: '0 4px 20px rgba(34,197,94,0.08)', padding: '28px 32px', marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(34,197,94,0.2)',
            }}>
              <RiBrainLine size={18} style={{ color: '#22c55e' }} />
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 17, color: '#14532d', margin: 0 }}>
              Model & Dataset
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Architecture',   value: 'Attention U-Net (PyTorch)' },
              { label: 'Input',          value: '11-channel geospatial patches (256×256)' },
              { label: 'Output',         value: '3-class pixel-wise segmentation' },
              { label: 'Dataset',        value: '980 patches · 118 regions across India' },
              { label: 'Training split', value: '82 regions / 682 patches' },
              { label: 'Test accuracy',  value: '94.15% | IoU: 58.02% | Dice: 70.22%' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.7)', borderRadius: 12,
                padding: '12px 16px', border: '1px solid #bbf7d0',
              }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: '#16a34a', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: 600, color: '#14532d' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          custom={4} variants={cardVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          style={{
            background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)', padding: '28px 32px', marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiTarget size={17} style={{ color: '#22c55e' }} />
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 17, color: '#111827', margin: 0 }}>
              Developed By
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -4, boxShadow: '0 10px 24px rgba(34,197,94,0.15)' }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 10, padding: '20px 12px', borderRadius: 14,
                  border: '1.5px solid #e5e7eb', background: '#fafafa',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff' }}>
                    {member.name[0]}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: '#111827' }}>
                    {member.name}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>
                    {member.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Guide */}
          <div style={{
            marginTop: 18, padding: '14px 20px', borderRadius: 12,
            background: '#f9fafb', border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #0f2d1a, #14532d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, color: '#4ade80' }}>M</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                Guided By
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: '#111827' }}>
                Prof. M. P. Mahajan
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6b7280' }}>
                K.K.Wagh Institute of Engineering Education & Research, Nashik · TY(B) — PID 27
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      <Footer />
    </motion.div>
  )
}
