import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import {
  Bus, LayoutDashboard, Users,
  Tag, ChevronRight, Calculator, ArrowLeft, Layers, FileText
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { to: '/admin/enquiries?tab=enquiries', label: 'Pipeline Leads', icon: Users, exact: false },
  { to: '/admin/enquiries?tab=quotations', label: 'Sent Quotations', icon: FileText, exact: false },
  { to: '/admin/fleet', label: 'Fleet & Routes', icon: Bus, exact: false },
  { to: '/admin/campaigns', label: 'Campaigns', icon: Layers, exact: false },
  { to: '/admin', label: 'Revenue Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/pricing', label: 'Pricing Rules', icon: Tag, exact: false },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <img
            src="./catgorithm-logo.png"
            alt="Catgorithm"
            className="h-7 w-auto object-contain filter brightness-110"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <p className="text-white font-bold text-sm">Catgorithm</p>
            <p className="text-white/40 text-xs">Sales & Ops Hub</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1.5">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-accent/20 text-white border border-accent/30 hover:bg-accent/30 transition-all mb-4"
        >
          <Calculator size={16} className="text-accent" />
          <span>Open Sales Calculator</span>
        </Link>

        <p className="text-[10px] uppercase font-bold tracking-wider text-white/40 px-3 pb-1">
          Management
        </p>

        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-xs font-bold">SH</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Sales Head</p>
            <p className="text-white/40 text-[10px]">Catgorithm Kollam</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-primary-light flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-[#080B12] border-r border-white/10 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-56 bg-[#080B12] border-r border-white/10 z-50 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-border h-14 flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 text-secondary-text hover:text-primary-text rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronRight size={18} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-accent bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Sales Pitch Calculator</span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary-text font-medium hidden sm:block">Kollam Screen Fleet</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-3 sm:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>

        {/* ── Mobile Bottom Navigation Bar (Persistent 1-Tap Access) ── */}
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-1 py-1.5 shadow-lg flex items-center justify-around text-[10px] font-bold"
        >
          <Link
            to="/"
            className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-accent p-1"
          >
            <Calculator size={18} />
            <span>Calculator</span>
          </Link>

          <Link
            to="/admin/enquiries?tab=enquiries"
            className={`flex flex-col items-center gap-0.5 p-1 ${
              location.pathname === '/admin/enquiries' && location.search.includes('tab=enquiries')
                ? 'text-accent'
                : 'text-gray-500 hover:text-accent'
            }`}
          >
            <Users size={18} />
            <span>Pipeline</span>
          </Link>

          <Link
            to="/admin/enquiries?tab=quotations"
            className={`flex flex-col items-center gap-0.5 p-1 ${
              location.pathname === '/admin/enquiries' && location.search.includes('tab=quotations')
                ? 'text-amber-600'
                : 'text-gray-500 hover:text-accent'
            }`}
          >
            <FileText size={18} />
            <span>Quotes</span>
          </Link>

          <Link
            to="/admin/fleet"
            className={`flex flex-col items-center gap-0.5 p-1 ${
              location.pathname === '/admin/fleet' ? 'text-emerald-600' : 'text-gray-500 hover:text-accent'
            }`}
          >
            <Bus size={18} />
            <span>Fleet</span>
          </Link>

          <Link
            to="/admin/campaigns"
            className={`flex flex-col items-center gap-0.5 p-1 ${
              location.pathname === '/admin/campaigns' ? 'text-purple-600' : 'text-gray-500 hover:text-accent'
            }`}
          >
            <Layers size={18} />
            <span>Campaigns</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
