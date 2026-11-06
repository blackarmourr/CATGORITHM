import { useCalculatorStore } from '../../stores/calculatorStore'
import { formatINR } from '../../lib/pricingEngine'
import { AnimatedPrice } from '../ui'
import { Link } from 'react-router-dom'
import {
  TrendingDown, Sparkles, CalendarRange, ArrowRight, Sliders, Check
} from 'lucide-react'

export default function PricingSummary() {
  const pricing = useCalculatorStore((s) => s.pricing)
  const config = useCalculatorStore((s) => s.config)
  const selectedCampaign = useCalculatorStore((s) => s.selectedCampaign)
  const isFestivalPricing = useCalculatorStore((s) => s.isFestivalPricing)
  const setFestivalPricing = useCalculatorStore((s) => s.setFestivalPricing)

  const {
    actualPrice,
    normalPrice,
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

  return (
    <div className="space-y-3">
      {/* ── Main Hero Pitch Card (Dark Slate Studio) ── */}
      <div className="text-white rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 border bg-[#0F172A] border-slate-800 shadow-slate-950/20">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-800/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          {/* Header row: Left pill + Right specs */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 text-accent/90 bg-accent/10 border-accent/20">
              <Sparkles size={11} className="text-accent" />
              {selectedCampaign?.name ? `${selectedCampaign.name}` : 'Standard Campaign'}
            </span>

            <span className="text-xs text-slate-300 font-medium">
              {config.buses} {config.buses === 1 ? 'Bus' : 'Buses'} · {config.videoDurationSeconds}s Ad · {config.months} {config.months === 1 ? 'Month' : 'Months'}
            </span>
          </div>

          {/* Active Pricing State Badges (Manual Overrides Only) */}
          {(isManualPriceActive || isManualDiscountActive) && (
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
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
          )}

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

          {/* Price Breakdown Table */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
            {/* 1. Actual Price */}
            <div className="flex items-center justify-between text-slate-400">
              <span>Actual Price (Original Tariff):</span>
              <span className="tabular-nums font-semibold line-through">
                {formatINR(actualPrice)}
              </span>
            </div>

            {/* 2. Selling Price */}
            <div className="flex items-center justify-between text-slate-300">
              <span>Selling Price:</span>
              <span className={`tabular-nums font-bold ${isManualPriceActive ? 'line-through text-slate-400' : 'text-white'}`}>
                {formatINR(pricing.packagePrice)}
              </span>
            </div>

            {/* Manual Discount Row (If active) */}
            {isManualDiscountActive && (
              <div className="flex items-center justify-between text-emerald-400 font-semibold border-t border-slate-800 pt-1.5">
                <span>Additional Manual Discount:</span>
                <span className="tabular-nums font-bold">
                  -{formatINR(manualDiscount)}
                </span>
              </div>
            )}

            {/* Applied Total Discount (Responsive & balanced size) */}
            {hasSavings && (
              <div className="flex items-center justify-between gap-1.5 text-emerald-400 font-bold border-t border-slate-800/80 pt-1.5 text-xs">
                <span className="flex items-center gap-1 flex-shrink-0">
                  <TrendingDown size={12} className="flex-shrink-0" />
                  Total Discount:
                </span>
                <span className="tabular-nums bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 text-[11px] sm:text-xs font-bold text-right">
                  Save {formatINR(savings)} ({savingsPercentage.toFixed(0)}% OFF)
                </span>
              </div>
            )}
          </div>

          {/* ── Effective Unit Economics Metrics (Mobile Responsive) ── */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1 text-center">
            <div className="bg-white/5 rounded-xl p-1.5 sm:p-2 border border-white/5 flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-medium leading-tight">Price / Bus</p>
              <p className="text-xs sm:text-sm font-bold text-white tabular-nums mt-0.5 truncate">
                {formatINR(pricePerBusCampaign)}
              </p>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-1.5 sm:p-2 border border-emerald-500/20 flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] text-emerald-300 font-semibold uppercase leading-tight">Monthly / Bus</p>
              <p className="text-xs sm:text-sm font-black text-emerald-400 tabular-nums mt-0.5 truncate">
                {formatINR(pricePerBusMonth)}/mo
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-1.5 sm:p-2 border border-white/5 flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-medium leading-tight">Daily / Bus</p>
              <p className="text-xs sm:text-sm font-bold text-white tabular-nums mt-0.5 truncate">
                {formatINR(pricePerBusDay, { decimals: 2 })}/day
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-center text-[8.5px] sm:text-[9.5px] text-gray-400">
            <div className="bg-white/5 rounded-xl py-1 px-1.5 sm:py-1.5 sm:px-2 border border-white/5 truncate">
              Rate / Sec / Mo: <span className="font-bold text-white">₹{pricePerSecondBusMonth.toFixed(2)}</span>
            </div>
            <div className="bg-white/5 rounded-xl py-1 px-1.5 sm:py-1.5 sm:px-2 border border-white/5 truncate">
              Cost / Sec / Camp: <span className="font-bold text-white">₹{pricePerSecondBusCampaign.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action bar: Custom Calculator & Festival Offer Toggle side-by-side ── */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <Link
          to="/custom-campaign"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 border border-gray-200 shadow-2xs transition-all whitespace-nowrap"
          title="Open Custom Package Calculator (Per-Day Pricing)"
        >
          <CalendarRange size={13} className="text-accent flex-shrink-0" />
          <span>Custom Calculator</span>
        </Link>

        <div className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-2xs text-xs font-bold text-gray-800 whitespace-nowrap">
          <span>Festival Offer</span>
          <button
            type="button"
            role="switch"
            aria-checked={isFestivalPricing}
            onClick={() => setFestivalPricing(!isFestivalPricing)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isFestivalPricing ? 'bg-accent' : 'bg-gray-300'
            }`}
            title="Toggle festival promotional pricing"
            aria-label="Toggle festival promotional pricing"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isFestivalPricing ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
