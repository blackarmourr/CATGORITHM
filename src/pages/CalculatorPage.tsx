import { useState } from 'react'
import { Link } from 'react-router-dom'
import BusSelector from '../components/calculator/BusSelector'
import DurationSelector from '../components/calculator/DurationSelector'
import MonthSelector from '../components/calculator/MonthSelector'
import PricingSummary from '../components/calculator/PricingSummary'
import QuotationForm from '../components/calculator/QuotationForm'
import { useCalculatorStore } from '../stores/calculatorStore'
import { formatINR } from '../lib/pricingEngine'
import {
  Bus, RotateCcw, ShieldCheck, Share2,
  TrendingDown, Check, Smartphone
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CalculatorPage() {
  const reset = useCalculatorStore((s) => s.reset)
  const pricing = useCalculatorStore((s) => s.pricing)
  const config = useCalculatorStore((s) => s.config)

  function handleReset() {
    reset()
    toast.success('Calculator reset to default configuration')
  }

  function handleQuickShare() {
    const text = `*Catgorithm Bus Screen Advertising Quotation*
📍 *Kollam Bus Fleet, Kerala*
• ${config.buses} Buses | ${config.videoDurationSeconds}s Video Ad | ${config.months} Months
• Package Offer: *${formatINR(pricing.packagePrice)}*
• Standard Tariff: ${formatINR(pricing.standardPrice)}
${pricing.savings > 0 ? `• Direct Savings: *${formatINR(pricing.savings)} (${pricing.savingsPercentage.toFixed(0)}% OFF)*\n` : ''}• Effective Rate: ${formatINR(pricing.pricePerBusMonth)}/bus/mo (~${formatINR(pricing.pricePerBusDay, { decimals: 2 })}/day)
Valid for 30 days. Contact: +91 97463 36175`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 pb-24 sm:pb-12">
      {/* ── Compact Header for Sales Head ── */}
      <header className="sticky top-0 z-40 bg-[#080B12]/95 backdrop-blur-md border-b border-gray-800 text-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2.5">
            <img
              src="./catgorithm-logo.png"
              alt="Catgorithm"
              className="h-8 w-auto object-contain max-w-[120px] filter brightness-110"
              onError={(e) => {
                // fallback
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">Catgorithm</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/15 border border-accent/20 px-1.5 py-0.2 rounded">
                  Sales Head
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Kollam Bus Screen Fleet Pitch</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all"
              title="Reset configuration"
              aria-label="Reset calculator"
            >
              <RotateCcw size={16} />
            </button>
            <Link
              to="/admin"
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1"
              title="Admin Dashboard"
            >
              <ShieldCheck size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Mobile-Optimized Body ── */}
      <main className="max-w-2xl mx-auto px-3.5 sm:px-4 pt-3 space-y-3.5">
        {/* 1. Live Price & Pitch Card (Always prominent at the top) */}
        <section aria-label="Live Campaign Pricing">
          <PricingSummary />
        </section>

        {/* 2. Interactive Selection Controls (Clean, Thumb-Friendly) */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-5">
          <BusSelector />
          <div className="border-t border-gray-100" />
          <DurationSelector />
          <div className="border-t border-gray-100" />
          <MonthSelector />
        </section>

        {/* 3. Sales Action Suite (WhatsApp, PDF, Pipeline Logger) */}
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
