import { useState } from 'react'
import { useCustomCalculatorStore } from '../../stores/customCalculatorStore'
import { getDailyPricePerBus, MIN_AD_DURATION_SECONDS } from '../../lib/customPricingEngine'
import { Clock, Plus, Minus } from 'lucide-react'

export default function CustomDurationSelector() {
  const videoDurationSeconds = useCustomCalculatorStore((s) => s.config.videoDurationSeconds)
  const setVideoDurationSeconds = useCustomCalculatorStore((s) => s.setVideoDurationSeconds)
  const [customMode, setCustomMode] = useState(false)

  const PRESETS = [10, 20, 30, 40, 50, 60]
  const isCustom = !PRESETS.includes(videoDurationSeconds)

  function handlePreset(s: number) {
    setCustomMode(false)
    setVideoDurationSeconds(s)
  }

  function adjustDuration(delta: number) {
    const next = Math.max(MIN_AD_DURATION_SECONDS, Math.min(300, videoDurationSeconds + delta))
    setVideoDurationSeconds(next)
  }

  const dailyBase = getDailyPricePerBus(videoDurationSeconds)

  return (
    <div className="space-y-3">
      {/* Label and multiplier badge */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-50 text-accent flex items-center justify-center font-bold text-xs">
            2
          </span>
          Video Ad Duration
        </label>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
            ₹{dailyBase}/day per bus
          </span>
          <span className="text-xs font-bold text-accent bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full tabular-nums">
            {videoDurationSeconds} Seconds
          </span>
        </div>
      </div>

      {/* Preset duration buttons (Grid with 10s, 20s, 30s, 40s, 50s, 60s, + Custom) */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
        {PRESETS.map((s) => {
          const isSelected = videoDurationSeconds === s && !customMode
          const sRate = getDailyPricePerBus(s)
          return (
            <button
              key={s}
              type="button"
              onClick={() => handlePreset(s)}
              className={`h-12 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center active:scale-95 ${
                isSelected
                  ? 'bg-accent text-white border-accent shadow-sm shadow-accent/25'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-accent/40'
              }`}
            >
              <span>{s}s</span>
              <span className={`text-[9px] font-normal ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                ₹{sRate}/d
              </span>
            </button>
          )
        })}

        {/* Custom button */}
        <button
          type="button"
          onClick={() => setCustomMode(!customMode)}
          className={`h-12 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center active:scale-95 ${
            customMode || isCustom
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300'
          }`}
        >
          <span>Custom</span>
          <span className={`text-[9px] font-normal ${customMode || isCustom ? 'text-white/80' : 'text-gray-400'}`}>
            Any sec
          </span>
        </button>
      </div>

      {/* Quick Stepper for Custom Duration */}
      {(customMode || isCustom) && (
        <div className="p-2.5 bg-violet-50/60 border border-violet-200/80 rounded-xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <Clock size={15} className="text-violet-600" />
            <span className="text-xs font-semibold text-violet-900">Fine Tune Seconds:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustDuration(-5)}
              className="w-8 h-8 rounded-lg bg-white border border-violet-200 text-violet-800 flex items-center justify-center active:scale-90 shadow-xs"
              aria-label="Decrease 5 seconds"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-black text-violet-950 w-12 text-center tabular-nums">
              {videoDurationSeconds}s
            </span>
            <button
              type="button"
              onClick={() => adjustDuration(5)}
              className="w-8 h-8 rounded-lg bg-white border border-violet-200 text-violet-800 flex items-center justify-center active:scale-90 shadow-xs"
              aria-label="Increase 5 seconds"
            >
              <Plus size={14} />
            </button>
            <input
              type="number"
              min="10"
              max="300"
              value={videoDurationSeconds}
              onChange={(e) => setVideoDurationSeconds(Math.max(MIN_AD_DURATION_SECONDS, Number(e.target.value)))}
              className="w-16 h-8 text-xs font-bold text-center border border-violet-200 rounded-lg bg-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
