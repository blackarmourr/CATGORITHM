import { useState } from 'react'
import { useCalculatorStore } from '../../stores/calculatorStore'
import { COMMON_VIDEO_DURATIONS } from '../../lib/pricingEngine'
import { Clock, Plus, Minus } from 'lucide-react'

export default function DurationSelector() {
  const videoDurationSeconds = useCalculatorStore((s) => s.config.videoDurationSeconds)
  const setConfig = useCalculatorStore((s) => s.setConfig)
  const [customMode, setCustomMode] = useState(false)

  const PRESETS = [15, 30, 45, 60]
  const isCustom = !PRESETS.includes(videoDurationSeconds)

  function handlePreset(s: number) {
    setCustomMode(false)
    setConfig({ videoDurationSeconds: s })
  }

  function adjustDuration(delta: number) {
    const next = Math.max(5, Math.min(300, videoDurationSeconds + delta))
    setConfig({ videoDurationSeconds: next })
  }

  const multiplier = (videoDurationSeconds / 30).toFixed(2)

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
        <span className="text-xs font-bold text-accent bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full tabular-nums">
          {videoDurationSeconds}s ({multiplier}× Base Rate)
        </span>
      </div>

      {/* Preset duration buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        {PRESETS.map((s) => {
          const isSelected = videoDurationSeconds === s && !customMode
          return (
            <button
              key={s}
              type="button"
              onClick={() => handlePreset(s)}
              className={`h-11 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center active:scale-95 ${
                isSelected
                  ? 'bg-accent text-white border-accent shadow-sm shadow-accent/25'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-accent/40'
              }`}
            >
              <span>{s}s</span>
              <span className={`text-[9px] font-normal ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                {s === 30 ? 'Std Base' : `${(s / 30).toFixed(1)}×`}
              </span>
            </button>
          )
        })}

        {/* Custom button */}
        <button
          type="button"
          onClick={() => setCustomMode(!customMode)}
          className={`h-11 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center active:scale-95 ${
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
          </div>
        </div>
      )}
    </div>
  )
}
