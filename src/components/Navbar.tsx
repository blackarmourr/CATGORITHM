import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bus, Menu, X, Calculator, ChevronRight } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  const isCalc = location.pathname === '/calculator'

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#080B12]/95 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="Catgorithm Home">
            <img
              src="./catgorithm-logo.png"
              alt="Catgorithm"
              className="h-8 w-auto object-contain filter brightness-110"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-white font-bold text-lg tracking-tight">
              Catgorithm
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-white bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>
            <Link
              to="/calculator"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCalc
                  ? 'text-white bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Calculator
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {!isCalc && (
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors duration-200"
              >
                <Calculator size={15} />
                Calculate Campaign
                <ChevronRight size={14} />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-[#080B12]/98 backdrop-blur-xl border-b border-white/10 md:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/"
                className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/calculator"
                className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Calculator
              </Link>
              <div className="pt-2">
                <Link
                  to="/calculator"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <Calculator size={15} />
                  Calculate Your Campaign
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
