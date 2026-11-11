import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function MainLayout() {
  const [darkMode, setDarkMode] = useState(false)

  // Apply dark class to <html> so all pages respond via CSS
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div style={{ minHeight: '100vh', transition: 'background 0.3s, color 0.3s' }}>
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
      <Outlet />
    </div>
  )
}
