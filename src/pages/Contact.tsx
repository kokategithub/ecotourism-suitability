import { motion } from 'framer-motion'
import { FiPhone, FiMapPin, FiMail } from 'react-icons/fi'
import { GiLeafSwirl } from 'react-icons/gi'
import Footer from '../components/Footer'

const team = [
  { name: 'Darshana Mahajan',  phone: '8806323050' },
  { name: 'Rucha Boraste',     phone: '9699637607' },
  { name: 'Sakshi Kokate',     phone: '9049048883' },
  { name: 'Mayuri Khairnar',   phone: '9503729706' },
]

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
} as const

export default function Contact() {
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
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiPhone size={22} style={{ color: '#4ade80' }} />
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
          Contact Us
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
          Reach out to the team behind the EcoTourism Suitability Prediction System
        </motion.p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

        {/* College */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          style={{
            background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)', padding: '24px 28px',
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 18,
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #0f2d1a, #14532d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GiLeafSwirl size={24} style={{ color: '#4ade80' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Institution
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 3 }}>
              K.K.Wagh Institute of Engineering Education & Research
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiMapPin size={13} style={{ color: '#9ca3af' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6b7280' }}>
                Nashik, Maharashtra · Department of Computer Engineering · TY(B) — PID 27
              </span>
            </div>
          </div>
        </motion.div>

        {/* Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.45 }}
          style={{
            background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)', padding: '20px 28px',
            marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16,
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, color: '#fff' }}>M</span>
          </div>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
              Project Guide
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, color: '#111827' }}>
              Prof. M. P. Mahajan
            </div>
          </div>
        </motion.div>

        {/* Team heading */}
        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 14 }}>
          Team Members
        </div>

        {/* Team cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -3, boxShadow: '0 10px 28px rgba(34,197,94,0.13)' }}
              style={{
                background: '#fff', borderRadius: 16, border: '1.5px solid #e5e7eb',
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
                transition: 'box-shadow 0.2s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(34,197,94,0.3)',
              }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18, color: '#fff' }}>
                  {member.name[0]}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 5 }}>
                  {member.name}
                </div>
                <a
                  href={`tel:${member.phone}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'Inter, sans-serif', fontSize: 13,
                    color: '#22c55e', fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  <FiPhone size={12} />
                  {member.phone}
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Email placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            borderRadius: 16, border: '1px solid #bbf7d0',
            padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14,
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: '#fff', border: '1.5px solid #bbf7d0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiMail size={16} style={{ color: '#22c55e' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#16a34a', marginBottom: 2 }}>
              Department of Computer Engineering
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151' }}>
              K.K.Wagh Institute of Engineering Education & Research, Nashik — 422003
            </div>
          </div>
        </motion.div>

      </div>

      <Footer />
    </motion.div>
  )
}
