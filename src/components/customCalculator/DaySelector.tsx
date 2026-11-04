import { useState, useEffect } from 'react'
import { useCustomCalculatorStore } from '../../stores/customCalculatorStore'
import { FIXED_PRICING_MILESTONES, getInterpolated10SecPrice } from '../../lib/customPricingEngine'
import { Calendar, Plus, Minus, Check } from 'lucide-react'
import { format } from 'date-fns'

export default function DaySelector() {
  const days = useCustomCalculatorStore((s) => s.config.days)
  const setDays = useCustomCalculatorStore((s) => s.setDays)
  const startDate = useCustomCalculatorStore((s) => s.config.startDate)
  const endDate = useCustomCalculatorStore((s) => s.config.endDate)
  const setStartDate = useCustomCalculatorStore((s) => s.setStartDate)

  const [inputVal, setInputVal] = useState(String(days))

  useEffect(() => {
    setInputVal(String(days))
  }, [days])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setInputVal(raw)
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed) && parsed > 0) {
      setDays(Math.min(365, parsed))
    }
  }

  function handleBlur() {
    const parsed = parseInt(inputVal, 10)
    if (isNaN(parsed) || parsed < 1) {
      setDays(1)
      setInputVal('1')
    } else {
      const clamped = Math.min(365, parsed)
      setDays(clamped)
      setInputVal(String(clamped))
    }
  }

  function adjustDays(delta: number) {
    const next = Math.max(1, Math.min(365, days + delta))
    setDays(next)
  }

  const p10s = getInterpolated10SecPrice(days)

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
        <span className="text-xs font-bold text-accent bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full tabular-nums">
          {days} {days === 1 ? 'Day' : 'Days'} (10s: ₹{p10s})
        </span>
      </div>

      {/* 5 Fixed Core Milestones (Primary Action Buttons) */}
      <div>
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <span>Fixed Milestones</span>
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {FIXED_PRICING_MILESTONES.map((m) => {
            const isSelected = days === m.days
            return (
              <button
                key={m.days}
                type="button"
                onClick={() => setDays(m.days)}
                className={`py-2 px-1 rounded-xl border text-center transition-all active:scale-[0.98] flex flex-col items-center justify-center ${
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
                <span className={`text-[8px] ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                  per 10s
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Direct Days Entry Input (No slider) */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="custom-days-input" className="text-xs font-bold text-gray-800">
            Enter Number of Days:
          </label>
          <span className="text-[11px] text-gray-500">
            10s base rate: <span className="font-bold text-accent">₹{p10s}/bus</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick decrement button */}
          <button
            type="button"
            onClick={() => adjustDays(-1)}
            disabled={days <= 1}
            className="w-12 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-40 text-gray-800 flex items-center justify-center font-bold text-base transition-all flex-shrink-0"
            title="Decrease 1 day"
            aria-label="Decrease 1 day"
          >
            <Minus size={16} />
          </button>

          {/* Direct numeric input */}
          <div className="relative flex-1">
            <input
              id="custom-days-input"
              type="number"
              min="1"
              max="365"
              value={inputVal}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full h-11 text-center font-black text-base sm:text-lg text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all tabular-nums px-3"
              placeholder="e.g. 18"
            />
          </div>

          {/* Quick increment button */}
          <button
            type="button"
            onClick={() => adjustDays(1)}
            className="w-12 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 flex items-center justify-center font-bold text-base transition-all flex-shrink-0"
            title="Increase 1 day"
            aria-label="Increase 1 day"
          >
            <Plus size={16} />
          </button>
        </div>

        <p className="text-[11px] text-gray-400 text-center">
          Enter any campaign duration (e.g. 4, 15, 18, 20 days)
        </p>
      </div>

      {/* ── Start Date & Auto End Date Box ── */}
      <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-accent flex items-center justify-center flex-shrink-0">
            <Calendar size={16} />
          </div>
          <div className="flex-1 sm:flex-none">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              Campaign Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-auto font-bold text-gray-900 bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-accent"
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
            {days} {days === 1 ? 'Day' : 'Days'} Total
          </span>
        </div>
      </div>
    </div>
  )
}
