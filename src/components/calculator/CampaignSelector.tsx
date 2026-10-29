import { useState, useEffect } from 'react'
import { useCalculatorStore } from '../../stores/calculatorStore'
import { getCampaigns } from '../../lib/dataStore'
import type { Campaign } from '../../types'
import { Calendar, ChevronDown, Edit3 } from 'lucide-react'
import { format } from 'date-fns'

export default function CampaignSelector() {
  const selectedCampaign = useCalculatorStore((s) => s.selectedCampaign)
  const setCampaign = useCalculatorStore((s) => s.setCampaign)
  const config = useCalculatorStore((s) => s.config)
  const setConfig = useCalculatorStore((s) => s.setConfig)
  const isCustomEndDate = useCalculatorStore((s) => s.isCustomEndDate)
  const setIsCustomEndDate = useCalculatorStore((s) => s.setIsCustomEndDate)

  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    getCampaigns().then((list) => {
      setCampaigns(list.filter((c) => !c.isArchived))
    })
  }, [])

  function handleDropdownChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const found = campaigns.find((c) => c.id === e.target.value)
    if (found) {
      setCampaign(found)
    }
  }

  function handleStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setConfig({ startDate: e.target.value })
  }

  function handleEndDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setConfig({ endDate: e.target.value })
  }

  // Safe formatted dates
  let displayEndDate = config.endDate
  try {
    if (config.endDate) {
      displayEndDate = format(new Date(config.endDate), 'dd MMM yyyy')
    }
  } catch {
    displayEndDate = config.endDate
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs space-y-3">
      {/* ── Campaign Dropdown & Start Date Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Small, clean Campaign Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
            Campaign
          </label>
          <div className="relative">
            <select
              value={selectedCampaign?.id || ''}
              onChange={handleDropdownChange}
              className="w-full appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 pr-8 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>

        {/* Start Date Picker */}
        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={config.startDate || ''}
              onChange={handleStartDateChange}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Auto-determined End Date bar ── */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-1.5 font-medium">
          <Calendar size={13} className="text-gray-400" />
          <span>
            Broadcast Period:{' '}
            <strong className="text-gray-800 font-bold">
              {config.startDate} → {displayEndDate}
            </strong>
          </span>
          <span className="text-[11px] text-gray-400">
            ({config.months} {config.months === 1 ? 'month' : 'months'})
          </span>
        </div>

        {/* Optional Custom End Date toggle (only for rare specific days / < 1 mo) */}
        {!isCustomEndDate ? (
          <button
            type="button"
            onClick={() => setIsCustomEndDate(true)}
            className="text-[11px] font-semibold text-accent hover:underline inline-flex items-center gap-1"
          >
            <Edit3 size={11} />
            <span>Specific end date</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsCustomEndDate(false)}
            className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 underline"
          >
            Reset to auto ({config.months} mo)
          </button>
        )}
      </div>

      {/* Only rendered when user explicitly chose to set a specific custom end date */}
      {isCustomEndDate && (
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
          <label className="text-[11px] font-semibold text-gray-600 whitespace-nowrap">
            Custom End Date:
          </label>
          <input
            type="date"
            value={config.endDate || ''}
            onChange={handleEndDateChange}
            className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
      )}
    </div>
  )
}
