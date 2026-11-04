import { useCustomCalculatorStore } from '../../stores/customCalculatorStore'
import { FIXED_PRICING_MILESTONES, getInterpolated10SecPrice } from '../../lib/customPricingEngine'
import { Calendar, Plus, Minus, Sparkles, Check, Info } from 'lucide-react'
import { format } from 'date-fns'

export default function DaySelector() {
  const days = useCustomCalculatorStore((s) => s.config.days)
  const setDays = useCustomCalculatorStore((s) => s.setDays)
  const startDate = useCustomCalculatorStore((s) => s.config.startDate)
  const endDate = useCustomCalculatorStore((s) => s.config.endDate)
  const setStartDate = useCustomCalculatorStore((s) => s.setStartDate)

  const INTERMEDIATE_PRESETS = [10, 15, 18, 20, 25]

  function adjustDays(delta: number) {
    const next = Math.max(1, Math.min(90, days + delta))
    setDays(next)
  }

  const p10s = getInterpolated10SecPrice(days)
  const isMilestone = FIXED_PRICING_MILESTONES.some((m) => m.days === days)

  return (
    <div className="space-y-3.5">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-50 text-accent flex items-center justify-center font-bold text-xs">
            3
          </span>
          Campaign Duration (Days)
        </label>
        <div className="flex items-center gap-1.5">
          {isMilestone && (
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={10} /> Milestone Rate
            </span>
          )}
          <span className="text-xs font-bold text-accent bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full tabular-nums">
            {days} {days === 1 ? 'Day' : 'Days'} (10s: ₹{p10s})
          </span>
        </div>
      </div>

      {/* 5 Fixed Core Milestones (Primary Action Buttons) */}
      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <span>Fixed Pricing Milestones</span>
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {FIXED_PRICING_MILESTONES.map((m) => {
            const isSelected = days === m.days
            return (
              <button
                key={m.days}
                type="button"
                onClick={() => setDays(m.days)}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all active:scale-[0.98] flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-accent text-white border-accent shadow-sm shadow-accent/25'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-accent/40 hover:bg-blue-50/20'
                }`}
              >
                <div className="flex items-center gap-0.5 font-black text-xs">
                  <span>{m.days}D</span>
                  {isSelected && <Check size={11} className="text-white" />}
                </div>
                <span className={`text-[10px] font-semibold mt-0.5 tabular-nums ${isSelected ? 'text-white/90' : 'text-accent'}`}>
                  ₹{m.price10s}
                </span>
                <span className={`text-[8.5px] ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                  per 10s
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Popular Intermediate Presets (10, 15, 18, 20, 25 days) */}
      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Flexible Interpolated Days
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {INTERMEDIATE_PRESETS.map((d) => {
            const isSelected = days === d
            const price = getInterpolated10SecPrice(d)
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`py-1.5 px-1 rounded-xl border text-center transition-all active:scale-[0.98] flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                <span className="text-xs font-bold">{d} Days</span>
                <span className={`text-[9.5px] font-semibold tabular-nums ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                  ₹{price} (10s)
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Interactive Slider & Stepper */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <span>Custom Days Slider</span>
            <span className="text-gray-400 font-normal">(1 to 30 Days):</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustDays(-1)}
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center active:scale-90"
              title="Decrease 1 day"
            >
              <Minus size={13} />
            </button>
            <span className="text-sm font-black text-accent w-14 text-center tabular-nums">
              {days} {days === 1 ? 'Day' : 'Days'}
            </span>
            <button
              type="button"
              onClick={() => adjustDays(1)}
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center active:scale-90"
              title="Increase 1 day"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="30"
          value={Math.min(30, days)}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-full accent-accent h-1.5 bg-gray-200 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-gray-400 font-semibold px-0.5">
          <span>1 Day</span>
          <span>7 Days</span>
          <span>14 Days</span>
          <span>21 Days</span>
          <span>30 Days</span>
        </div>
      </div>

      {/* ── Start Date & Auto End Date Box ── */}
      <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-accent flex items-center justify-center flex-shrink-0">
            <Calendar size={16} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              Campaign Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="font-bold text-gray-900 bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="bg-white px-3 py-2 rounded-xl border border-gray-200 flex-1 sm:max-w-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Calculated End Date
            </span>
            <span className="font-bold text-gray-800 text-xs">
              {endDate ? format(new Date(endDate), 'dd MMM yyyy') : '—'}
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-accent bg-blue-50 px-2 py-0.5 rounded-md">
            {days} Days Total
          </span>
        </div>
      </div>
    </div>
  )
}
