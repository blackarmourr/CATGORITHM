import { useState, useEffect } from 'react'
import { useCalculatorStore } from '../../stores/calculatorStore'
import { getCampaigns } from '../../lib/dataStore'
import type { Campaign } from '../../types'
import {
  Sparkles, Calendar, AlertCircle, CheckCircle2, ChevronRight,
  Info
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

export default function CampaignSelector() {
  const selectedCampaign = useCalculatorStore((s) => s.selectedCampaign)
  const setCampaign = useCalculatorStore((s) => s.setCampaign)
  const config = useCalculatorStore((s) => s.config)
  const setConfig = useCalculatorStore((s) => s.setConfig)

  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    getCampaigns().then((list) => {
      // Filter out archived campaigns
      setCampaigns(list.filter((c) => !c.isArchived))
    })
  }, [])

  function handleSelectCampaign(c: Campaign) {
    setCampaign(c)
  }

  function handleStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newStart = e.target.value
    let newEnd = config.endDate

    // Ensure end date doesn't precede start date
    if (newEnd && newEnd < newStart) {
      newEnd = newStart
    }

    setConfig({ startDate: newStart, endDate: newEnd })
  }

  function handleEndDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newEnd = e.target.value
    if (newEnd < config.startDate) {
      // Invalid date range
      return
    }
    setConfig({ endDate: newEnd })
  }

  // Calculate calendar days
  let calendarDays = 0
  try {
    if (config.startDate && config.endDate) {
      calendarDays = Math.max(1, differenceInDays(new Date(config.endDate), new Date(config.startDate)) + 1)
    }
  } catch {
    calendarDays = 60
  }

  // Check discrepancy between calendar days and billed months (approx 30 days/month)
  const expectedMinDays = (config.months - 1) * 30 + 15 // allow reasonable variance
  const expectedMaxDays = config.months * 31 + 15
  const hasDiscrepancy = calendarDays < expectedMinDays || calendarDays > expectedMaxDays

  const isWinterSpotlight = selectedCampaign?.theme?.style === 'winter-spotlight'

  return (
    <div className="space-y-3">
      {/* ── Section Title & Selected Badge ── */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={13} className={isWinterSpotlight ? 'text-[#D4AF37]' : 'text-accent'} />
          Select Campaign & Dates
        </label>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isWinterSpotlight
              ? 'bg-[#D4AF37]/15 text-[#B8860B] border-[#D4AF37]/30'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}
        >
          {selectedCampaign?.status || 'Active'}
        </span>
      </div>

      {/* ── Campaign Selector Pills (Scrollable / Wrap on mobile) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {campaigns.map((c) => {
          const isSelected = selectedCampaign?.id === c.id
          const isWinter = c.theme.style === 'winter-spotlight'

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelectCampaign(c)}
              className={`p-3 rounded-xl text-left transition-all relative border ${
                isSelected
                  ? isWinter
                    ? 'bg-[#070B14] text-white border-[#D4AF37] shadow-md shadow-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
                    : 'bg-white text-gray-900 border-accent shadow-md shadow-accent/10 ring-1 ring-accent'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className={`font-bold text-xs truncate ${isSelected && isWinter ? 'text-[#F3C669]' : ''}`}>
                  {c.name}
                </span>
                {isSelected && (
                  <CheckCircle2
                    size={14}
                    className={`flex-shrink-0 ${isWinter ? 'text-[#D4AF37]' : 'text-accent'}`}
                  />
                )}
              </div>

              <p className={`text-[11px] line-clamp-1 ${isSelected && isWinter ? 'text-gray-300' : 'text-gray-500'}`}>
                {c.tagline}
              </p>

              <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                <Calendar size={11} className={isSelected && isWinter ? 'text-[#D4AF37]' : 'text-gray-400'} />
                <span className={isSelected && isWinter ? 'text-gray-300' : 'text-gray-500'}>
                  {format(new Date(c.startDate), 'dd MMM yyyy')} – {format(new Date(c.endDate), 'dd MMM yyyy')}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Winter Spotlight Banner (if active) ── */}
      {isWinterSpotlight && (
        <div className="bg-gradient-to-r from-[#070B14] via-[#0D1527] to-[#070B14] border border-[#D4AF37]/40 rounded-xl p-3 text-white relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex items-start gap-2.5">
            <span className="text-base">✨</span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-[#F3C669] tracking-wide">
                  Winter Spotlight 2026–27 Activated
                </p>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#F3C669] px-1.5 py-0.2 rounded border border-[#D4AF37]/30">
                  Recommended Seasonal
                </span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Black Friday · Christmas · New Year · Year-End Sales. Premium festive cinematic theme applied to live calculations and quotation PDFs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Campaign Dates: Start Date & End Date ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <div>
          <label className="text-[11px] font-semibold text-gray-600 block mb-1">
            Campaign Start Date
          </label>
          <input
            type="date"
            value={config.startDate}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-accent font-medium text-gray-800"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-gray-600 block mb-1">
            Campaign End Date
          </label>
          <input
            type="date"
            min={config.startDate}
            value={config.endDate}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-accent font-medium text-gray-800"
          />
        </div>
      </div>

      {/* ── Billed Duration vs Calendar Range Clarification ── */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-2.5 text-xs text-blue-900 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[11px] flex items-center gap-1.5">
            <Info size={13} className="text-blue-600" />
            Calendar Range: {calendarDays} Days
          </span>
          <span className="font-bold text-[11px] bg-blue-100/80 text-blue-800 px-2 py-0.5 rounded-md">
            Billed as {config.months} {config.months === 1 ? 'Month' : 'Months'} Tariff
          </span>
        </div>
        <p className="text-[10.5px] text-blue-700 leading-normal">
          {isWinterSpotlight
            ? 'The Winter Spotlight runs from 20 Nov 2026 to 20 Jan 2027 and is priced under the approved 2-Month package tariff.'
            : 'Pricing calculations strictly use the agreed billed duration months selected below.'}
        </p>
      </div>

      {/* Discrepancy warning (if admin manually chose contradictory dates/months) */}
      {hasDiscrepancy && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-[11px]">Notice: Date range differs from billed months</p>
            <p className="text-[10.5px] text-amber-800">
              The selected calendar range ({calendarDays} days) does not match exactly {config.months} billed months. The tariff will be billed at {config.months} months unless you adjust the duration.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
