import { useState } from 'react'
import { Link } from 'react-router-dom'
import CampaignSelector from '../components/calculator/CampaignSelector'
import BusSelector from '../components/calculator/BusSelector'
import DurationSelector from '../components/calculator/DurationSelector'
import MonthSelector from '../components/calculator/MonthSelector'
import PricingSummary from '../components/calculator/PricingSummary'
import QuotationForm from '../components/calculator/QuotationForm'
import { useCalculatorStore } from '../stores/calculatorStore'
import { formatINR } from '../lib/pricingEngine'
import {
  RotateCcw, Share2, FileText, Users, Bus, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CalculatorPage() {
  const reset = useCalculatorStore((s) => s.reset)
  const pricing = useCalculatorStore((s) => s.pricing)
  const config = useCalculatorStore((s) => s.config)
  const selectedCampaign = useCalculatorStore((s) => s.selectedCampaign)

  function handleReset() {
    reset()
    toast.success('Calculator reset to default configuration')
  }

  function handleQuickShare() {
    const text = `*Catgorithm Bus Screen Advertising Quotation*
📍 *Kollam Bus Fleet, Kerala*
• Campaign: *${selectedCampaign?.name || 'Bus Screen Advertising'}*
• ${config.buses} Buses | ${config.videoDurationSeconds}s Video Ad | ${config.months} Months
• Package Offer: *${formatINR(pricing.packagePrice)}*
• Standard Tariff: ${formatINR(pricing.standardPrice)}
${pricing.savings > 0 ? `• Direct Savings: *${formatINR(pricing.savings)} (${pricing.savingsPercentage.toFixed(0)}% OFF)*\n` : ''}• Effective Rate: ${formatINR(pricing.pricePerBusMonth)}/bus/mo (~${formatINR(pricing.pricePerBusDay, { decimals: 2 })}/day)
Valid for 30 days. Contact: +91 97463 36175`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 pb-24 sm:pb-12">
      {/* ── PART 1: Clean, Uncluttered Mobile-First Header ── */}
      <header className="sticky top-0 z-40 bg-[#080B12]/95 backdrop-blur-md border-b border-gray-800 text-white shadow-sm">
        <div className="max-w-3xl mx-auto px-2.5 sm:px-4 h-14 flex items-center justify-between gap-1.5">
          {/* Clean Brand Name */}
          <Link
            to="/"
            className="flex items-center gap-1.5 py-1 text-white hover:text-gray-200 transition-colors flex-shrink-0"
            aria-label="Catgorithm Home"
          >
            <span className="font-extrabold text-base tracking-tight text-white">Catgorithm</span>
          </Link>

          {/* ── Top Navigation Links ── */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Pipeline Button */}
            <Link
              to="/admin/enquiries?tab=enquiries"
              className="h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1.5 transition-all"
              title="View Enquiries Pipeline"
            >
              <Users size={13} className="text-accent" />
              <span>Pipeline</span>
            </Link>

            {/* Quotes Button */}
            <Link
              to="/admin/enquiries?tab=quotations"
              className="h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1.5 transition-all"
              title="View Sent Quotations"
            >
              <FileText size={13} className="text-amber-400" />
              <span>Quotes</span>
            </Link>

            {/* Fleet Button (Desktop) */}
            <Link
              to="/admin/fleet"
              className="hidden sm:flex h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white items-center gap-1.5 transition-all"
              title="Fleet Inventory & Routes"
            >
              <Bus size={13} className="text-emerald-400" />
              <span>Fleet</span>
            </Link>

            {/* Campaigns Button (Desktop) */}
            <Link
              to="/admin/campaigns"
              className="hidden sm:flex h-9 px-2 sm:px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white items-center gap-1.5 transition-all"
              title="Campaign Management"
            >
              <Layers size={13} className="text-purple-400" />
              <span>Campaigns</span>
            </Link>

            {/* Quick Reset Button (Consistent h-9 height) */}
            <button
              type="button"
              onClick={handleReset}
              className="h-9 w-9 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
              title="Reset calculator"
              aria-label="Reset calculator"
            >
              <RotateCcw size={14} />
            </button>
          </nav>
        </div>
      </header>

      {/* ── Mobile-Only Sticky Quick Navigation Bar ── */}
      <div className="bg-white border-b border-gray-200 px-2.5 py-1.5 sm:hidden sticky top-14 z-30 shadow-xs">
        <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
          <Link
            to="/admin/enquiries?tab=enquiries"
            className="flex-1 py-1.5 px-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
          >
            <Users size={12} className="text-accent" />
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
          <Link
            to="/admin/campaigns"
            className="flex-1 py-1.5 px-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
          >
            <Layers size={12} className="text-purple-600" />
            <span>Campaigns</span>
          </Link>
        </div>
      </div>

      {/* ── Main Mobile-Optimized Body ── */}
      <main className="max-w-2xl mx-auto px-3.5 sm:px-4 pt-3.5 space-y-3.5">
        {/* 1. Live Price Pitch Card (Hero First) */}
        <section aria-label="Live Campaign Pricing">
          <PricingSummary />
        </section>

        {/* 2. Campaign Selection & Dates (Clean Dropdown Below Live Price) */}
        <section aria-label="Campaign Selection">
          <CampaignSelector />
        </section>

        {/* 3. Interactive Selection Controls (Clean, Thumb-Friendly) */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-5">
          <BusSelector />
          <div className="border-t border-gray-100" />
          <DurationSelector />
          <div className="border-t border-gray-100" />
          <MonthSelector />
        </section>

        {/* 4. Sales Action Suite (WhatsApp, PDF Quotation Generation, Pipeline Deal Logging) */}
        <section aria-label="Sales Actions">
          <QuotationForm />
        </section>
      </main>

      {/* ── Mobile Sticky Bottom Price Bar (Instant Thumb Action) ── */}
      <aside
        aria-label="Sticky Quote Summary"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#080B12]/95 backdrop-blur-lg border-t border-gray-800 text-white px-4 py-2.5 shadow-2xl sm:hidden"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white tabular-nums">
                {formatINR(pricing.packagePrice)}
              </span>
              {pricing.savings > 0 && (
                <span className="text-[11px] font-bold text-emerald-400">
                  (-{pricing.savingsPercentage.toFixed(0)}%)
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400">
              {config.buses} buses · {config.months} mo ({formatINR(pricing.pricePerBusMonth)}/mo)
            </p>
          </div>

          <button
            type="button"
            onClick={handleQuickShare}
            className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 active:scale-95 shadow-sm shadow-emerald-600/30 transition-all flex-shrink-0"
          >
            <Share2 size={13} />
            Share WhatsApp
          </button>
        </div>
      </aside>
    </div>
  )
}
