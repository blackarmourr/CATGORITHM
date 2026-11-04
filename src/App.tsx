import { Routes, Route, Navigate } from 'react-router-dom'
import CalculatorPage from './pages/CalculatorPage'
import CustomCampaignPage from './pages/CustomCampaignPage'
import ProposalPage from './pages/ProposalPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEnquiries from './pages/admin/AdminEnquiries'
import AdminCampaigns from './pages/admin/AdminCampaigns'
import AdminFleet from './pages/admin/AdminFleet'
import AdminPricing from './pages/admin/AdminPricing'
import PWAInstallBanner from './components/PWAInstallPrompt'

export default function App() {
  return (
    <>
      <Routes>
        {/* Primary Sales Calculator Pitch Page */}
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/calculator" element={<Navigate to="/" replace />} />
        <Route path="/custom-campaign" element={<CustomCampaignPage />} />
        <Route path="/custom" element={<Navigate to="/custom-campaign" replace />} />
        <Route path="/proposal" element={<ProposalPage />} />
        <Route path="/proposals" element={<Navigate to="/proposal" replace />} />
        <Route path="/campaigns" element={<Navigate to="/admin/campaigns" replace />} />

        {/* Direct, frictionless access to Admin, Pipeline, Quotations & Campaigns (No Login Required) */}
        <Route path="/admin/login" element={<Navigate to="/admin/enquiries" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="proposal" element={<ProposalPage />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="fleet" element={<AdminFleet />} />
          <Route path="pricing" element={<AdminPricing />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PWAInstallBanner />
    </>
  )
}
