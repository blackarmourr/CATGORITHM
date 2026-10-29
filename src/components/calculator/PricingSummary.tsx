import { useState } from 'react'
import { useCalculatorStore } from '../../stores/calculatorStore'
import { formatINR, formatINR2 } from '../../lib/pricingEngine'
import { AnimatedPrice } from '../ui'
import {
  TrendingDown, ChevronDown, ChevronUp,
  Sparkles, Check
} from 'lucide-react'

export default function PricingSummary() {
  const pricing = useCalculatorStore((s) => s.pricing)
  const config = useCalculatorStore((s) => s.config)
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  const {
    standardPrice, packagePrice, savings, savingsPercentage,
    pricePerBusCampaign, pricePerBusMonth, pricePerBusDay,
    pricePerSecondBusMonth, pricePerSecondBusCampaign,
    durationDiscountRate, pricingMethod, oneMonthBasis30s,
  } = pricing

  const hasSavings = savings > 0

  return (
    <div className="space-y-3">
      {/* ── Main Hero Pitch Card (Deep Midnight Futuristic Aesthetic) ── */}
      <div className="bg-[#080B12] text-white rounded-2xl p-5 shadow-xl relative overflow-hidden border border-gray-800/80">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-[#A0354E]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header pill */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent/90 bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
              Live Campaign Price
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {config.buses} {config.buses === 1 ? 'Bus' : 'Buses'} · {config.videoDurationSeconds}s · {config.months} {config.months === 1 ? 'Month' : 'Months'}
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
                Standard: {formatINR(standardPrice)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <TrendingDown size={12} />
                You Save {formatINR(savings)} ({savingsPercentage.toFixed(0)}% OFF)
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-400 pt-1 pb-3 border-b border-gray-800">
              Standard Rate Applied (1 Bus / 1 Month baseline)
            </div>
          )}

          {/* ── 5 Effective Unit Economics Metrics ── */}
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
              <p className="text-[10px] text-gray-400 uppercase font-medium">Per Bus / Full Campaign</p>
              <p className="text-sm font-bold text-white tabular-nums mt-0.5">
                {formatINR(pricePerBusCampaign)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 text-center">
            <div className="bg-white/5 rounded-xl py-1.5 px-2 border border-white/5">
              <p className="text-[9.5px] text-gray-400">Rate / Sec / Bus / Month: <span className="font-bold text-white">₹{pricePerSecondBusMonth.toFixed(2)}</span></p>
            </div>
            <div className="bg-white/5 rounded-xl py-1.5 px-2 border border-white/5">
              <p className="text-[9.5px] text-gray-400">Cost / Sec / Bus Campaign: <span className="font-bold text-white">₹{pricePerSecondBusCampaign.toFixed(2)}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expandable Transparent Math Breakdown ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setBreakdownOpen(!breakdownOpen)}
          className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
          aria-expanded={breakdownOpen}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-accent" />
            View Full Price Breakdown
          </span>
          {breakdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {breakdownOpen && (
          <div className="px-4 pb-4 pt-1 text-xs border-t border-gray-100 space-y-2">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Standard Advertising Price:</span>
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

            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Discount Amount / Package Adjustment:</span>
              <span className={`font-semibold tabular-nums ${hasSavings ? 'text-emerald-600' : 'text-gray-500'}`}>
                {hasSavings ? `−${formatINR(savings)}` : '₹0'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 font-bold text-gray-900 bg-gray-50 px-2 rounded-lg">
              <span>Final Package Price:</span>
              <span className="text-accent tabular-nums">{formatINR(packagePrice)}</span>
            </div>

            <div className="flex justify-between py-1 text-emerald-700 font-semibold px-2">
              <span>Total Direct Client Savings:</span>
              <span className="tabular-nums">{formatINR(savings)} ({savingsPercentage.toFixed(1)}% off)</span>
            </div>

            <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-gray-600 text-[11px]">
              <div>Effective Rate / Bus: <span className="font-bold text-gray-900">{formatINR(pricePerBusCampaign)}</span></div>
              <div>Effective / Bus / Month: <span className="font-bold text-gray-900">{formatINR(pricePerBusMonth)}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
