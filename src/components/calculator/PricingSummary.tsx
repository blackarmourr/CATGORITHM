import { useCalculatorStore } from '../../stores/calculatorStore'
import { formatINR } from '../../lib/pricingEngine'
import { AnimatedPrice } from '../ui'
import { Link } from 'react-router-dom'
import {
  TrendingDown, Sparkles, CalendarRange, ArrowRight, Tag, Sliders, Check
} from 'lucide-react'

export default function PricingSummary() {
  const pricing = useCalculatorStore((s) => s.pricing)
  const config = useCalculatorStore((s) => s.config)
  const selectedCampaign = useCalculatorStore((s) => s.selectedCampaign)

  const {
    actualPrice,
    normalPrice,
    festivalPrice,
    isEligibleForFestival,
    isFestivalActive,
    festivalOfferName,
    manualPriceOverride,
    manualDiscount,
    isManualPriceActive,
    isManualDiscountActive,
    finalPrice,
    savings,
    savingsPercentage,
    pricePerBusCampaign,
    pricePerBusMonth,
    pricePerBusDay,
    pricePerSecondBusMonth,
    pricePerSecondBusCampaign,
  } = pricing

  const hasSavings = savings > 0
  const showFestival = isFestivalActive && isEligibleForFestival

  return (
    <div className="space-y-3">
      {/* ── Main Hero Pitch Card (Dark Slate Studio) ── */}
      <div className="text-white rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 border bg-[#0F172A] border-slate-800 shadow-slate-950/20">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-800/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          {/* Header pill & Specs */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 text-accent/90 bg-accent/10 border-accent/20">
              <Sparkles size={11} className="text-accent" />
              {selectedCampaign?.name ? `${selectedCampaign.name}` : 'Main Calculator'}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {config.buses} {config.buses === 1 ? 'Bus' : 'Buses'} · {config.videoDurationSeconds}s Ad · {config.months} {config.months === 1 ? 'Month' : 'Months'}
            </span>
          </div>

          {/* Active Pricing State Badges */}
          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
            {showFestival && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Tag size={10} />
                Festival Offer Active {festivalOfferName ? `(${festivalOfferName})` : ''}
              </span>
            )}
            {isManualPriceActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <Sliders size={10} />
                Manual Final Price: {formatINR(manualPriceOverride!)}
              </span>
            )}
            {isManualDiscountActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Check size={10} />
                Manual Discount: -{formatINR(manualDiscount)}
              </span>
            )}
          </div>

          {/* Main Hero Final Campaign Price */}
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
              Final Campaign Price
            </p>
            <div className="flex items-baseline gap-2">
              <AnimatedPrice
                value={finalPrice}
                className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums"
              />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Total All-in</span>
            </div>
          </div>

          {/* Three-Tier Price Breakdown Table */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
            {/* 1. Actual Price */}
            <div className="flex items-center justify-between text-slate-400">
              <span>Actual Price (Original Tariff):</span>
              <span className="tabular-nums font-semibold line-through">
                {formatINR(actualPrice)}
              </span>
            </div>

            {/* 2. Normal Selling Price */}
            <div className="flex items-center justify-between text-slate-300">
              <span>Normal Selling Price:</span>
              <span className={`tabular-nums font-bold ${showFestival || isManualPriceActive ? 'line-through text-slate-400' : 'text-white'}`}>
                {formatINR(normalPrice)}
              </span>
            </div>

            {/* 3. Festival Offer Price (When ON & eligible) */}
            {showFestival && (
              <div className="flex items-center justify-between text-amber-300 font-bold bg-amber-500/10 -mx-1.5 px-1.5 py-1 rounded-lg border border-amber-500/20">
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-400" />
                  Festival Offer Price:
                </span>
                <span className="tabular-nums font-black text-amber-200">
                  {formatINR(festivalPrice)}
                </span>
              </div>
            )}

            {/* Manual Discount Row (If active) */}
            {isManualDiscountActive && (
              <div className="flex items-center justify-between text-emerald-400 font-semibold border-t border-slate-800 pt-1.5">
                <span>Additional Manual Discount:</span>
                <span className="tabular-nums font-bold">
                  -{formatINR(manualDiscount)}
                </span>
              </div>
            )}

            {/* Applied Total Discount */}
            {hasSavings && (
              <div className="flex items-center justify-between text-emerald-400 font-extrabold border-t border-slate-800/80 pt-1.5">
                <span className="flex items-center gap-1">
                  <TrendingDown size={13} />
                  Total Applied Discount:
                </span>
                <span className="tabular-nums bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Save {formatINR(savings)} ({savingsPercentage.toFixed(0)}% OFF)
                </span>
              </div>
            )}
          </div>

          {/* ── Effective Unit Economics Metrics ── */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Price Per Bus</p>
              <p className="text-sm font-bold text-white tabular-nums mt-0.5">
                {formatINR(pricePerBusCampaign)}
              </p>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-2 border border-emerald-500/20">
              <p className="text-[10px] text-emerald-300 font-semibold uppercase">Effective Monthly / Bus</p>
              <p className="text-sm font-black text-emerald-400 tabular-nums mt-0.5">
                {formatINR(pricePerBusMonth)}/mo
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <p className="text-[10px] text-gray-400 uppercase font-medium">Daily Cost / Bus</p>
              <p className="text-sm font-bold text-white tabular-nums mt-0.5">
                {formatINR(pricePerBusDay, { decimals: 2 })}/day
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-[9.5px] text-gray-400">
            <div className="bg-white/5 rounded-xl py-1.5 px-2 border border-white/5">
              Rate / Sec / Bus / Month: <span className="font-bold text-white">₹{pricePerSecondBusMonth.toFixed(2)}</span>
            </div>
            <div className="bg-white/5 rounded-xl py-1.5 px-2 border border-white/5">
              Cost / Sec / Bus Campaign: <span className="font-bold text-white">₹{pricePerSecondBusCampaign.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Link to Custom Campaign Calculator (Per-day) ── */}
      <div className="flex justify-center pt-0.5">
        <Link
          to="/custom-campaign"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 border border-gray-200 shadow-2xs hover:border-gray-300 transition-all"
          title="Open Custom Package Calculator (Per-Day Pricing)"
        >
          <CalendarRange size={13} className="text-gray-500" />
          <span>Need Per-Day Pricing? Open Custom Calculator</span>
          <ArrowRight size={12} className="text-gray-400" />
        </Link>
      </div>
    </div>
  )
}
