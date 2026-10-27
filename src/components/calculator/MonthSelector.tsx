import { useCalculatorStore } from '../../stores/calculatorStore'
import { MAX_MONTHS, getDurationDiscountRate } from '../../lib/pricingEngine'
import { Plus, Minus, Tag } from 'lucide-react'

export default function MonthSelector() {
  const months = useCalculatorStore((s) => s.config.months)
  const setConfig = useCalculatorStore((s) => s.setConfig)

  const PRESETS = [1, 2, 3, 6, 12]

  function adjustMonths(delta: number) {
    const next = Math.max(1, Math.min(MAX_MONTHS, months + delta))
    setConfig({ months: next })
  }

  const discountRate = getDurationDiscountRate(months)
  const discountPercent = Math.round(discountRate * 100)

  return (
    <div className="space-y-3">
      {/* Title & discount badge */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-50 text-accent flex items-center justify-center font-bold text-xs">
            3
          </span>
          Campaign Duration
        </label>
        {discountPercent > 0 ? (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Tag size={11} /> {discountPercent}% Long-Term Disc.
          </span>
        ) : (
          <span className="text-xs font-bold text-accent bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full tabular-nums">
            {months} {months === 1 ? 'Month' : 'Months'}
          </span>
        )}
      </div>

      {/* Preset duration buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        {PRESETS.map((m) => {
          const isSelected = months === m
          return (
            <button
              key={m}
              type="button"
              onClick={() => setConfig({ months: m })}
              className={`h-11 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center active:scale-95 ${
                isSelected
                  ? 'bg-accent text-white border-accent shadow-sm shadow-accent/25'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-accent/40'
              }`}
            >
              <span>{m} {m === 1 ? 'Mo' : 'Mo'}</span>
              <span className={`text-[9px] font-normal ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                {m === 1 ? '1 Month' : m === 2 ? '2 Months' : m === 3 ? '-12%' : m === 6 ? '-20%' : '-25%'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Stepper for any intermediate month (e.g. 4, 5, 7, 8, 9, 10, 11) */}
      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
        <span className="text-xs text-gray-600 font-medium">Fine-tune duration:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => adjustMonths(-1)}
            disabled={months <= 1}
            className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-800 disabled:opacity-30 flex items-center justify-center active:scale-90 shadow-xs"
            aria-label="Decrease month"
          >
            <Minus size={14} />
          </button>
          <span className="text-sm font-black text-gray-900 w-16 text-center tabular-nums">
            {months} {months === 1 ? 'Month' : 'Months'}
          </span>
          <button
            type="button"
            onClick={() => adjustMonths(1)}
            disabled={months >= MAX_MONTHS}
            className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-800 disabled:opacity-30 flex items-center justify-center active:scale-90 shadow-xs"
            aria-label="Increase month"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
