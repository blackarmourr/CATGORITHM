import { useCalculatorStore } from '../../stores/calculatorStore'
import { formatINR, formatINR2 } from '../../lib/pricingEngine'
import { AnimatedPrice } from '../ui'
import { Link } from 'react-router-dom'
import {
  TrendingDown, Sparkles, Check, CalendarRange, ArrowRight
} from 'lucide-react'

export default function PricingSummary() {
  const pricing = useCalculatorStore((s) => s.pricing)
  const config = useCalculatorStore((s) => s.config)
  const selectedCampaign = useCalculatorStore((s) => s.selectedCampaign)

  const {
    standardPrice, packagePrice, savings, savingsPercentage,
    pricePerBusCampaign, pricePerBusMonth, pricePerBusDay,
    pricePerSecondBusMonth, pricePerSecondBusCampaign,
  } = pricing

  const hasSavings = savings > 0

  return (
    <div className="space-y-3">
      {/* ── Main Hero Pitch Card (Clean, Professional Dark Slate) ── */}
      <div className="text-white rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 border bg-[#0F172A] border-slate-800 shadow-slate-950/20">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-800/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header pill */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 text-accent/90 bg-accent/10 border-accent/20">
              <Sparkles size={11} className="text-accent" />
              {selectedCampaign?.name ? `${selectedCampaign.name} Package` : 'Live Campaign Price'}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {config.buses} {config.buses === 1 ? 'Bus' : 'Buses'} · {config.videoDurationSeconds}s · {config.months} {config.months === 1 ? 'Month' : 'Months'}
            </span>
          </div>

          {/* Main Price */}
          <div className="flex items-baseline gap-2 mb-1">
            <AnimatedPrice
              value={packagePrice}
              className="text-4xl sm:text-5xl font-black text-white tracking-tight"
            />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Total All-in</span>
          </div>

          {/* Standard Comparison & Client Savings */}
          {hasSavings ? (
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400 line-through tabular-nums">
                Standard: {formatINR(standardPrice)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <TrendingDown size={12} />
                You Save {formatINR(savings)} ({savingsPercentage.toFixed(0)}% OFF)
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 pt-1 pb-3 border-b border-slate-800">
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

      {/* ── Custom Campaign Navigation Button (Replaces Full Price Breakdown) ── */}
      <Link
        to="/custom-campaign"
        className="group relative overflow-hidden bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-blue-500/40 hover:border-blue-400 p-3.5 sm:p-4 rounded-2xl shadow-sm transition-all hover:shadow-md active:scale-98 flex items-center justify-between text-white"
        title="Open Custom Campaign Calculator"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400 group-hover:scale-105 transition-transform">
            <CalendarRange size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-tight">Custom Campaign Calculator</span>
              <span className="bg-blue-500/20 text-blue-300 text-[9.5px] font-black px-2 py-0.5 rounded-md border border-blue-500/30 uppercase tracking-wider">
                1–30 Days
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Need custom days (e.g. 14, 18 or 21 days)? Switch to daily milestone pricing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-blue-400 font-bold text-xs pl-2 flex-shrink-0 group-hover:translate-x-1 transition-transform">
          <span className="hidden sm:inline">Open</span>
          <ArrowRight size={15} />
        </div>
      </Link>
    </div>
  )
}
