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
  RotateCcw, Share2, FileText, Users, Sparkles
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
      {/* Logo image and "Sales Head" badge removed as specified */}
      <header className="sticky top-0 z-40 bg-[#080B12]/95 backdrop-blur-md border-b border-gray-800 text-white shadow-sm">
        <div className="max-w-3xl mx-auto px-2.5 sm:px-4 h-14 flex items-center justify-between gap-1.5">
          {/* Clean Brand Name (No logo image, no designation badges) */}
          <Link
            to="/"
            className="flex items-center gap-1.5 py-1 text-white hover:text-gray-200 transition-colors flex-shrink-0"
            aria-label="Catgorithm Home"
          >
            <span className="font-extrabold text-base tracking-tight text-white">Catgorithm</span>
          </Link>

          {/* ── Equal-Height, Perfectly Aligned Navigation Buttons ── */}
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

            {/* Campaigns Button */}
            <Link
              to="/admin/campaigns"
              className="h-9 px-2 sm:px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1.5 transition-all"
              title="Campaign Management"
            >
              <Sparkles size={13} className="text-[#F3C669]" />
              <span className="hidden xs:inline sm:inline">Campaigns</span>
            </Link>

            {/* Quick Reset Button (Consistent h-9 height) */}
            <button
              type="button"
              onClick={handleReset}
              className="h-9 w-9 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
              title="Reset configuration"
              aria-label="Reset calculator"
            >
              <RotateCcw size={14} />
            </button>
          </nav>
        </div>
      </header>

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
