import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../stores/adminStore'
import {
  Bus, LayoutDashboard, Users, Settings, LogOut,
  Tag, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Users, exact: false },
  { to: '/admin/fleet', label: 'Fleet', icon: Bus, exact: false },
  { to: '/admin/pricing', label: 'Pricing', icon: Tag, exact: false },
]

export default function AdminLayout() {
  const logout = useAdminStore((s) => s.logout)
  const adminName = useAdminStore((s) => s.adminName)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

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
            <p className="text-white/40 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
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

      {/* User + logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-xs font-bold">{adminName[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{adminName}</p>
            <p className="text-white/40 text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-red-400 text-xs font-medium rounded-xl hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
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
        <header className="bg-white border-b border-border h-14 flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 text-secondary-text hover:text-primary-text rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronRight size={18} className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
          <h1 className="text-sm font-semibold text-primary-text">Catgorithm Admin</h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-accent text-xs font-bold">{adminName[0]}</span>
            </div>
            <span className="text-xs text-secondary-text hidden sm:block">{adminName}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
