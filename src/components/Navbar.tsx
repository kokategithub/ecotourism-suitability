import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi'
import { TbMountain } from 'react-icons/tb'

const navLinks = ['Home', 'Predict', 'Contact', 'About']

const linkToPath: Record<string, string> = {
  Home: '/',
  Predict: '/predict',
  Contact: '/contact',
  About: '/about',
}

interface NavbarProps {
  darkMode: boolean
  onToggleDark: () => void
}

export default function Navbar({ darkMode, onToggleDark }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const active = navLinks.find((link) => linkToPath[link] === location.pathname) ?? 'Home'

  const handleNav = (link: string) => {
    navigate(linkToPath[link])
    setMobileOpen(false)
  }

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: '#0f2d1a',
        borderBottom: '1px solid rgba(34,197,94,0.1)',
      }}
    >
      <div style={{ width: '100%', padding: '0 24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 58, width: '100%' }}>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '1.5px solid #22c55e',
              }}
            >
              <TbMountain size={18} style={{ color: '#4ade80' }} />
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
                EcoTourism
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#4ade80' }}>
                Suitability Prediction
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1" style={{ flex: 1, justifyContent: 'center' }}>
            {navLinks.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => handleNav(link)}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '13.5px',
                  color: active === link ? '#22c55e' : 'rgba(255,255,255,0.8)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  position: 'relative',
                  transition: 'color 0.15s',
                }}
              >
                {link}
                {active === link && (
                  <motion.div
                    layoutId="underline"
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      left: 0,
                      right: 0,
                      width: '55%',
                      height: 2,
                      background: '#22c55e',
                      borderRadius: 2,
                      margin: '0 auto',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
            <button
              type="button"
              onClick={onToggleDark}
              aria-label="Toggle theme"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                borderRadius: 99,
                background: darkMode ? 'rgba(147,197,253,0.12)' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${darkMode ? 'rgba(147,197,253,0.3)' : 'rgba(255,255,255,0.15)'}`,
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s',
              }}
            >
              <FiSun size={13} style={{ color: darkMode ? 'rgba(255,255,255,0.3)' : '#fbbf24', transition: 'color 0.2s' }} />
              <FiMoon size={13} style={{ color: darkMode ? '#93c5fd' : 'rgba(255,255,255,0.25)', transition: 'color 0.2s' }} />
            </button>

            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ borderTop: '1px solid rgba(34,197,94,0.12)', padding: '8px 16px 12px' }}>
          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => handleNav(link)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                padding: '9px 12px',
                borderRadius: 8,
                background: active === link ? 'rgba(34,197,94,0.1)' : 'none',
                color: active === link ? '#22c55e' : 'rgba(255,255,255,0.8)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}