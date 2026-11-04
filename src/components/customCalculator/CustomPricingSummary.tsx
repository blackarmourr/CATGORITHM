import { useState } from 'react'
import { useCustomCalculatorStore } from '../../stores/customCalculatorStore'
import { formatINR, getMilestoneBreakdown } from '../../lib/customPricingEngine'
import {
  Sparkles, ChevronDown, ChevronUp,
  CalendarRange, ShieldCheck
} from 'lucide-react'

export default function CustomPricingSummary() {
  const pricing = useCustomCalculatorStore((s) => s.pricing)
  const config = useCustomCalculatorStore((s) => s.config)
  const [tableOpen, setTableOpen] = useState(false)

  const milestoneData = getMilestoneBreakdown(config.videoDurationSeconds, config.buses)

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

      {/* ── Collapsible Milestone Rate Reference Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setTableOpen(!tableOpen)}
          className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
          aria-expanded={tableOpen}
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-accent" />
            <span>Milestone Tariff Reference ({config.videoDurationSeconds}s Ad)</span>
          </span>
          {tableOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {tableOpen && (
          <div className="p-3.5 pt-1 border-t border-gray-100 text-xs space-y-2">
            <p className="text-[11px] text-gray-500">
              Pricing is calculated using linear interpolation between these 5 fixed milestone reference points (rounded to nearest ₹5):
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="py-2 px-2.5 font-bold">Milestone</th>
                    <th className="py-2 px-2.5 font-bold">10s Price</th>
                    <th className="py-2 px-2.5 font-bold">{config.videoDurationSeconds}s / Bus</th>
                    <th className="py-2 px-2.5 font-bold">All {config.buses} Buses</th>
                    <th className="py-2 px-2.5 font-bold text-right">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold">
                  {milestoneData.map((m) => {
                    const isCurrent = config.days === m.days
                    return (
                      <tr
                        key={m.days}
                        className={isCurrent ? 'bg-blue-50/70 text-accent font-bold' : 'hover:bg-gray-50 text-gray-800'}
                      >
                        <td className="py-2 px-2.5 flex items-center gap-1">
                          <span>{m.days} Days</span>
                          {isCurrent && <span className="text-[10px] bg-accent text-white px-1.5 py-0.2 rounded font-black">Active</span>}
                        </td>
                        <td className="py-2 px-2.5 tabular-nums text-gray-600">₹{m.price10s}</td>
                        <td className="py-2 px-2.5 tabular-nums font-bold">₹{m.perBusPrice}</td>
                        <td className="py-2 px-2.5 tabular-nums font-extrabold">{formatINR(m.totalPrice)}</td>
                        <td className="py-2 px-2.5 tabular-nums text-right text-emerald-600 font-bold">
                          {m.savings > 0 ? `${m.savingsPercentage.toFixed(0)}% OFF` : 'Standard'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[10.5px] text-gray-400 italic pt-1">
              Base tariff: ₹5 per second per day. Durations between milestones (e.g. 15, 18, 20 days) interpolate linearly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
