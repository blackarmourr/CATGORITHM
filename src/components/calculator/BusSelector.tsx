import { useCalculatorStore } from '../../stores/calculatorStore'
import { COMMON_BUS_OPTIONS, MAX_BUSES } from '../../lib/pricingEngine'
import { Bus, Check } from 'lucide-react'

export default function BusSelector() {
  const buses = useCalculatorStore((s) => s.config.buses)
  const setConfig = useCalculatorStore((s) => s.setConfig)

  const PRESETS = [
    { count: 1, label: '1 Bus', desc: 'Pilot' },
    { count: 5, label: '5 Buses', desc: '50% Fleet' },
    { count: 10, label: '10 Buses', desc: 'Full Fleet' },
  ]

  return (
    <div className="space-y-3">
      {/* Title & badge */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-50 text-accent flex items-center justify-center font-bold text-xs">
            1
          </span>
          Select Fleet Size
        </label>
        <span className="text-xs font-bold text-accent bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full tabular-nums">
          {buses} of {MAX_BUSES} Buses
        </span>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((p) => {
          const isSelected = buses === p.count
          return (
            <button
              key={p.count}
              type="button"
              onClick={() => setConfig({ buses: p.count })}
              className={`py-2 px-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                isSelected
                  ? 'bg-accent text-white border-accent shadow-sm shadow-accent/25'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-accent/40 hover:bg-blue-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold block">{p.label}</span>
                {isSelected && <Check size={12} className="text-white" />}
              </div>
              <span className={`text-[10px] block ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                {p.desc}
              </span>
            </button>
          )
        })}
      </div>

      {/* 10-Bus Number Grid for fast thumb selection */}
      <div className="grid grid-cols-5 gap-1.5 pt-1">
        {COMMON_BUS_OPTIONS.map((n) => {
          const active = buses === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => setConfig({ buses: n })}
              className={`h-11 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-1 active:scale-95 ${
                active
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
              }`}
              aria-label={`${n} Buses`}
            >
              <Bus size={12} className={active ? 'text-white/70' : 'text-gray-400'} />
              <span>{n}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
