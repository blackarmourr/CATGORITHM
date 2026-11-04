import { useCustomCalculatorStore } from '../../stores/customCalculatorStore'
import { formatINR } from '../../lib/customPricingEngine'
import { Sparkles, CalendarRange } from 'lucide-react'

export default function CustomPricingSummary() {
  const pricing = useCustomCalculatorStore((s) => s.pricing)
  const config = useCustomCalculatorStore((s) => s.config)

  return (
    <div className="space-y-3.5">
      {/* ── Main Commercial Highlight Card ── */}
      <div className="card p-4 sm:p-5 bg-gradient-to-br from-[#070B14] via-[#0F172A] to-[#1E293B] text-white shadow-xl relative overflow-hidden border border-blue-500/30">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-4">
          {/* Card Top Pill: Custom Campaign Specs */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              <CalendarRange size={13} className="text-blue-400" />
              <span>
                {config.buses} {config.buses === 1 ? 'Bus' : 'Buses'} · {config.videoDurationSeconds}s Video · {config.days} {config.days === 1 ? 'Day' : 'Days'}
              </span>
            </div>

            {pricing.savings > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles size={11} />
                Save {formatINR(pricing.savings)} ({pricing.savingsPercentage.toFixed(0)}% OFF)
              </span>
            )}
          </div>

          {/* Pricing Row */}
          <div>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
                {formatINR(pricing.totalPrice)}
              </span>
              {pricing.savings > 0 && (
                <span className="text-sm font-semibold text-gray-400 line-through tabular-nums">
                  {formatINR(pricing.standardPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Custom campaign package rate for all {config.buses} {config.buses === 1 ? 'bus' : 'buses'} across {config.days} days.
            </p>
          </div>

          {/* Unit Economics Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <span className="text-[10px] text-gray-400 block font-semibold">Rate Per Bus:</span>
              <span className="font-bold text-white text-sm tabular-nums">
                {formatINR(pricing.finalPerBusPrice)}
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <span className="text-[10px] text-gray-400 block font-semibold">Daily Cost / Bus:</span>
              <span className="font-bold text-emerald-400 text-sm tabular-nums">
                ₹{pricing.pricePerBusDay.toFixed(2)}/day
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-400 block font-semibold">Daily Rate / Sec:</span>
              <span className="font-bold text-blue-300 text-sm tabular-nums">
                ₹{pricing.pricePerSecondBusDay.toFixed(2)}/sec
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
