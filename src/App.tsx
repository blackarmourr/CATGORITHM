import { Routes, Route, Navigate } from 'react-router-dom'
import CalculatorPage from './pages/CalculatorPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEnquiries from './pages/admin/AdminEnquiries'
import AdminFleet from './pages/admin/AdminFleet'
import AdminPricing from './pages/admin/AdminPricing'

export default function App() {
  return (
    <Routes>
      {/* Primary Sales Calculator Pitch Page */}
      <Route path="/" element={<CalculatorPage />} />
      <Route path="/calculator" element={<Navigate to="/" replace />} />

      {/* Direct, frictionless access to Admin, Pipeline & Quotations (No Login Required) */}
      <Route path="/admin/login" element={<Navigate to="/admin/enquiries" replace />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="fleet" element={<AdminFleet />} />
        <Route path="pricing" element={<AdminPricing />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
