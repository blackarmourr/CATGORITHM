import { Link } from 'react-router-dom'
import CustomBusSelector from '../components/customCalculator/CustomBusSelector'
import CustomDurationSelector from '../components/customCalculator/CustomDurationSelector'
import DaySelector from '../components/customCalculator/DaySelector'
import CustomPricingSummary from '../components/customCalculator/CustomPricingSummary'
import CustomQuotationForm from '../components/customCalculator/CustomQuotationForm'
import { PWAHeaderInstallButton } from '../components/PWAInstallPrompt'
import { useCustomCalculatorStore } from '../stores/customCalculatorStore'
import { formatINR } from '../lib/customPricingEngine'
import {
  RotateCcw, Share2, FileText, Users, Bus, ArrowLeft, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomCampaignPage() {
  const reset = useCustomCalculatorStore((s) => s.reset)
  const pricing = useCustomCalculatorStore((s) => s.pricing)
  const config = useCustomCalculatorStore((s) => s.config)

  function handleReset() {
    reset()
    toast.success('Custom campaign reset to default configuration')
  }

  function handleQuickShare() {
    const text = `*Catgorithm Bus Screen Advertising — Custom Daily Campaign*
📍 *Kollam Bus Fleet, Kerala*
• Fleet Size: ${config.buses} ${config.buses === 1 ? 'Bus' : 'Buses'}
• Video Ad Duration: ${config.videoDurationSeconds} Seconds
• Duration: ${config.days} Days
• Custom Package Offer: *${formatINR(pricing.totalPrice)}*
• Base Tariff: ${formatINR(pricing.standardPrice)}
${pricing.savings > 0 ? `• Direct Savings: *${formatINR(pricing.savings)} (${pricing.savingsPercentage.toFixed(0)}% OFF)*\n` : ''}• Daily Rate: ₹${pricing.pricePerBusDay.toFixed(2)}/day/bus
Valid for 30 days. Contact: +91 97463 36175`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 pb-24 sm:pb-12">
      {/* ── Top Brand Header ── */}
      <header className="sticky top-0 z-40 bg-[#080B12]/95 backdrop-blur-md border-b border-gray-800 text-white shadow-sm">
        <div className="max-w-3xl mx-auto px-2.5 sm:px-4 h-14 flex items-center justify-between gap-1.5">
          {/* Back Button & Brand Name */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all flex-shrink-0"
              title="Back to Standard Calculator"
              aria-label="Back to Standard Calculator"
            >
              <ArrowLeft size={16} />
            </Link>

            <Link
              to="/"
              className="flex items-center gap-2 py-1 text-white hover:text-gray-200 transition-colors flex-shrink-0"
              aria-label="Catgorithm Home"
            >
              <img
                src="./app-icon.png"
                alt="Catgorithm Bus Ads"
                className="w-7 h-7 rounded-lg object-cover shadow-sm border border-white/10 flex-shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-extrabold text-base tracking-tight text-white">Catgorithm</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <PWAHeaderInstallButton />

            {/* Proposal Studio Button */}
            <Link
              to="/proposal"
              className="h-9 px-2.5 sm:px-3 text-xs font-bold rounded-xl bg-[#d6c26e]/20 hover:bg-[#d6c26e]/30 border border-[#d6c26e]/40 text-[#d6c26e] active:scale-95 flex items-center gap-1.5 transition-all shadow-xs"
              title="Proposal Maker (PDF)"
            >
              <Sparkles size={13} className="text-[#d6c26e]" />
              <span>Proposal</span>
            </Link>

            <Link
              to="/admin/enquiries?tab=enquiries"
              className="h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1.5 transition-all"
              title="View Enquiries Pipeline"
            >
              <Users size={13} className="text-accent" />
              <span>Pipeline</span>
            </Link>

            <Link
              to="/admin/enquiries?tab=quotations"
              className="h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1.5 transition-all"
              title="View Sent Quotations"
            >
              <FileText size={13} className="text-amber-400" />
              <span>Quotes</span>
            </Link>

            <Link
              to="/admin/fleet"
              className="hidden sm:flex h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white items-center gap-1.5 transition-all"
              title="Fleet Inventory & Routes"
            >
              <Bus size={13} className="text-emerald-400" />
              <span>Fleet</span>
            </Link>

            <button
              type="button"
              onClick={handleReset}
              className="h-9 w-9 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
              title="Reset custom calculator"
              aria-label="Reset custom calculator"
            >
              <RotateCcw size={14} />
            </button>
          </nav>
        </div>
      </header>

      {/* ── Mobile Quick Navigation Bar ── */}
      <div className="bg-white border-b border-gray-200 px-2.5 py-1.5 sm:hidden sticky top-14 z-30 shadow-xs">
        <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
          <Link
            to="/"
            className="flex-1 py-1.5 px-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
          >
            <ArrowLeft size={12} className="text-gray-600" />
            <span>Back</span>
          </Link>
          <Link
            to="/admin/enquiries?tab=enquiries"
            className="flex-1 py-1.5 px-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
          >
            <Users size={12} className="text-blue-500" />
            <span>Pipeline</span>
          </Link>
          <Link
            to="/admin/enquiries?tab=quotations"
            className="flex-1 py-1.5 px-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
          >
            <FileText size={12} className="text-amber-500" />
            <span>Quotes</span>
          </Link>
          <Link
            to="/admin/fleet"
            className="flex-1 py-1.5 px-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
          >
            <Bus size={12} className="text-emerald-600" />
            <span>Fleet</span>
          </Link>
        </div>
      </div>

      {/* ── Main Mobile-Optimized Body ── */}
      <main className="max-w-2xl mx-auto px-3.5 sm:px-4 pt-3.5 space-y-3.5">
        {/* Simple Clean Back Button */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 active:scale-95 border border-gray-200 transition-all shadow-2xs"
            title="Back to Standard Calculator"
          >
            <ArrowLeft size={14} className="text-gray-500" />
            <span>Back to Standard Calculator</span>
          </Link>
          <span className="text-xs font-semibold text-gray-500">
            Custom Campaign
          </span>
        </div>

        {/* 1. Live Price Pitch Card (Hero First) */}
        <section aria-label="Live Campaign Pricing">
          <CustomPricingSummary />
        </section>

        {/* 2. Interactive Campaign Customizer Container */}
        <section
          aria-label="Campaign Customizer"
          className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-xs space-y-5"
        >
          {/* Step 1: Bus Selector */}
          <CustomBusSelector />

          <hr className="border-gray-100" />

          {/* Step 2: Duration Selector */}
          <CustomDurationSelector />

          <hr className="border-gray-100" />

          {/* Step 3: Day Selector */}
          <DaySelector />
        </section>

        {/* 3. Quotation & Pipeline Lead Form */}
        <section aria-label="Official Quotation & Pitch">
          <CustomQuotationForm />
        </section>
      </main>

      {/* ── Persistent Floating Sticky Commercial Bar on Mobile ── */}
      <aside
        aria-label="Sticky Quote Bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#080B12]/95 backdrop-blur-md border-t border-gray-800 p-2.5 sm:hidden flex items-center justify-between gap-3 shadow-2xl"
      >
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white tabular-nums tracking-tight">
              {formatINR(pricing.totalPrice)}
            </span>
            {pricing.savings > 0 && (
              <span className="text-[11px] font-semibold text-emerald-400">
                ({pricing.savingsPercentage.toFixed(0)}% OFF)
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 block truncate">
            {config.buses} Buses · {config.videoDurationSeconds}s · {config.days} Days
          </span>
        </div>

        <button
          type="button"
          onClick={handleQuickShare}
          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md flex-shrink-0"
        >
          <Share2 size={13} />
          <span>Quick Pitch</span>
        </button>
      </aside>
    </div>
  )
}
