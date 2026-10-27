import { Routes, Route, Navigate } from 'react-router-dom'
import CalculatorPage from './pages/CalculatorPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEnquiries from './pages/admin/AdminEnquiries'
import AdminFleet from './pages/admin/AdminFleet'
import AdminPricing from './pages/admin/AdminPricing'
import { useAdminStore } from './stores/adminStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CalculatorPage />} />
      <Route path="/calculator" element={<Navigate to="/" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="fleet" element={<AdminFleet />} />
        <Route path="pricing" element={<AdminPricing />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
