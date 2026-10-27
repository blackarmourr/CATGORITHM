import { useState } from 'react'
import { useCalculatorStore } from '../../stores/calculatorStore'
import { formatINR, formatINR2, getNegotiationFloor } from '../../lib/pricingEngine'
import { AnimatedPrice } from '../ui'
import {
  TrendingDown, ChevronDown, ChevronUp,
  ShieldAlert, Sparkles, Check
} from 'lucide-react'

export default function PricingSummary() {
  const pricing = useCalculatorStore((s) => s.pricing)
  const config = useCalculatorStore((s) => s.config)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [showMarginGuide, setShowMarginGuide] = useState(false)

  const {
    standardPrice, packagePrice, savings, savingsPercentage,
    pricePerBusCampaign, pricePerBusMonth, pricePerBusDay,
    pricePerSecondBusMonth,
    durationDiscountRate, pricingMethod, oneMonthBasis30s,
  } = pricing

  const floorPrice = getNegotiationFloor(config.buses, config.months, config.videoDurationSeconds)
  const hasSavings = savings > 0

  return (
    <div className="space-y-3">
      {/* ── Main Hero Pitch Card (Deep Midnight Futuristic Aesthetic) ── */}
      <div className="bg-[#080B12] text-white rounded-2xl p-5 shadow-xl relative overflow-hidden border border-gray-800/80">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header pill */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent/90 bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
              Live Campaign Quote
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {config.buses} {config.buses === 1 ? 'Bus' : 'Buses'} · {config.videoDurationSeconds}s · {config.months} {config.months === 1 ? 'Mo' : 'Mos'}
            </span>
          </div>

          {/* Main Price */}
          <div className="flex items-baseline gap-2 mb-1">
            <AnimatedPrice
              value={packagePrice}
              className="text-4xl sm:text-5xl font-black text-white tracking-tight"
            />
            <span className="text-xs text-gray-400 uppercase tracking-wide">Total All-in</span>
          </div>

          {/* Standard Comparison & Client Savings */}
          {hasSavings ? (
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-3 border-b border-gray-800">
              <span className="text-xs text-gray-400 line-through tabular-nums">
                Std: {formatINR(standardPrice)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <TrendingDown size={12} />
                Client Saves {formatINR(savings)} ({savingsPercentage.toFixed(0)}% OFF)
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-400 pt-1 pb-3 border-b border-gray-800">
              Standard Rate Applied (1 Bus / 1 Month baseline)
            </div>
          )}

          {/* ── 3 Field Pitch Numbers (Crucial for live client meetings) ── */}
          <div className="grid grid-cols-3 gap-2 pt-3 text-center">
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Per Bus / Month</p>
              <p className="text-sm font-bold text-white tabular-nums mt-0.5">
                {formatINR(pricePerBusMonth)}
              </p>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-2 border border-emerald-500/20">
              <p className="text-[10px] text-emerald-300 font-semibold uppercase">Per Bus / Day</p>
              <p className="text-sm font-black text-emerald-400 tabular-nums mt-0.5">
                {formatINR(pricePerBusDay, { decimals: 2 })}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Per Sec / Bus</p>
              <p className="text-sm font-bold text-white tabular-nums mt-0.5">
                ₹{pricePerSecondBusMonth.toFixed(2)}
              </p>
            </div>
          </div>

          {/* ── Discreet Sales Head Margin / Walkaway Floor Guide ── */}
          <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowMarginGuide(!showMarginGuide)}
              className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ShieldAlert size={12} className={floorPrice ? 'text-amber-400' : 'text-gray-500'} />
              <span>Sales Margin & Floor Guide</span>
              <ChevronDown size={11} className={`transition-transform ${showMarginGuide ? 'rotate-180' : ''}`} />
            </button>
            <span className="text-[10px] text-gray-500">Internal Sales Head Tool</span>
          </div>

          {showMarginGuide && (
            <div className="mt-2.5 p-3 rounded-xl bg-gray-900 border border-gray-700 text-xs text-gray-300 space-y-1.5 animate-fadeIn">
              {floorPrice ? (
                <>
                  <div className="flex justify-between items-center text-amber-300 font-semibold">
                    <span>Private Walkaway Floor:</span>
                    <span className="font-bold tabular-nums">{formatINR(floorPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Offered Package Price:</span>
                    <span className="tabular-nums font-semibold text-white">{formatINR(packagePrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400 pt-1 border-t border-gray-800">
                    <span>Negotiation Buffer Room:</span>
                    <span className="font-bold tabular-nums">+{formatINR(packagePrice - floorPrice)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    * Do not commit below {formatINR(floorPrice)} without executive approval.
                  </p>
                </>
              ) : (
                <div className="text-gray-400">
                  <p className="text-[11px]">
                    Current package rate: <span className="text-white font-semibold">{formatINR(packagePrice)}</span>.
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Standard discount policy applied. For special custom volume pricing beyond 10 buses, use Admin Private Pricing.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Expandable Transparent Math Breakdown ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setBreakdownOpen(!breakdownOpen)}
          className="w-full flex items-center justify-between p-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          aria-expanded={breakdownOpen}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-accent" />
            Show Rate Math & Calculation Breakdown
          </span>
          {breakdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {breakdownOpen && (
          <div className="px-3.5 pb-3.5 pt-1 text-xs border-t border-gray-100 space-y-2">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Standard Undiscounted Price:</span>
              <span className="font-semibold text-gray-900 tabular-nums">{formatINR(standardPrice)}</span>
            </div>

            {pricingMethod === '1month' && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">1-Month Approved Package Base:</span>
                <span className="font-semibold text-gray-900 tabular-nums">{formatINR(oneMonthBasis30s)}</span>
              </div>
            )}

            {pricingMethod === '2month' && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">2-Month Approved Package Base:</span>
                <span className="font-semibold text-gray-900 tabular-nums">
                  {formatINR(Math.round(packagePrice / (config.videoDurationSeconds / 30)))}
                </span>
              </div>
            )}

            {pricingMethod === 'duration-discount' && (
              <>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">1-Month Package Base:</span>
                  <span className="font-semibold text-gray-900 tabular-nums">{formatINR(oneMonthBasis30s)} × {config.months} mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Duration Discount ({config.months} Months):</span>
                  <span className="font-bold text-emerald-600 tabular-nums">−{(durationDiscountRate * 100).toFixed(0)}%</span>
                </div>
              </>
            )}

            {config.videoDurationSeconds !== 30 && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Duration Scaling ({config.videoDurationSeconds}s / 30s):</span>
                <span className="font-semibold text-gray-900 tabular-nums">×{(config.videoDurationSeconds / 30).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 font-bold text-gray-900 bg-gray-50 px-2 rounded-lg">
              <span>Final Offered Package Price:</span>
              <span className="text-accent tabular-nums">{formatINR(packagePrice)}</span>
            </div>

            <div className="flex justify-between py-1 text-emerald-700 font-semibold px-2">
              <span>Total Direct Client Savings:</span>
              <span className="tabular-nums">{formatINR(savings)} ({savingsPercentage.toFixed(1)}% off)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
