import { create } from 'zustand'
import type { CampaignConfig, Campaign } from '../types'
import { calculatePrice, type PricingResult } from '../lib/pricingEngine'
import { getDefaultCampaigns } from '../lib/dataStore'

export function computeAutoEndDate(startDateStr: string, months: number): string {
  try {
    const [y, m, d] = startDateStr.split('-').map(Number)
    if (!y || !m || !d) return startDateStr
    const date = new Date(y, m - 1, d)
    date.setMonth(date.getMonth() + months)
    const outY = date.getFullYear()
    const outM = String(date.getMonth() + 1).padStart(2, '0')
    const outD = String(date.getDate()).padStart(2, '0')
    return `${outY}-${outM}-${outD}`
  } catch {
    return startDateStr
  }
}

interface CalculatorStore {
  config: CampaignConfig
  selectedCampaign: Campaign
  pricing: PricingResult
  isCustomEndDate: boolean
  setCampaign: (campaign: Campaign) => void
  setConfig: (updates: Partial<CampaignConfig>) => void
  setIsCustomEndDate: (val: boolean) => void
  reset: () => void
}

const defaultCampaigns = getDefaultCampaigns()
const initialCampaign = defaultCampaigns[0] // Winter Spotlight 2026–27
const initialMonths = initialCampaign.defaultBilledMonths || 2
const initialStartDate = initialCampaign.startDate || new Date().toISOString().split('T')[0]
const initialEndDate = computeAutoEndDate(initialStartDate, initialMonths)

const DEFAULT_CONFIG: CampaignConfig = {
  buses: 10,
  months: initialMonths,
  videoDurationSeconds: 30,
  campaignId: initialCampaign.id,
  startDate: initialStartDate,
  endDate: initialEndDate,
}

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  config: DEFAULT_CONFIG,
  selectedCampaign: initialCampaign,
  pricing: calculatePrice(DEFAULT_CONFIG.buses, DEFAULT_CONFIG.months, DEFAULT_CONFIG.videoDurationSeconds),
  isCustomEndDate: false,

  setCampaign: (campaign: Campaign) =>
    set((state) => {
      const months = campaign.defaultBilledMonths || state.config.months
      const startDate = campaign.startDate || state.config.startDate
      const endDate = computeAutoEndDate(startDate, months)
      const newConfig: CampaignConfig = {
        ...state.config,
        campaignId: campaign.id,
        startDate,
        endDate,
        months,
      }
      return {
        selectedCampaign: campaign,
        config: newConfig,
        isCustomEndDate: false,
        pricing: calculatePrice(newConfig.buses, newConfig.months, newConfig.videoDurationSeconds),
      }
    }),

  setConfig: (updates) =>
    set((state) => {
      const newConfig = { ...state.config, ...updates }

      // If user specifically passed endDate, mark as custom
      let customEnd = state.isCustomEndDate
      if (updates.endDate !== undefined) {
        customEnd = true
      }

      // If start date or months changed and custom end date is not explicitly enabled, auto-update end date
      if (!customEnd && (updates.startDate !== undefined || updates.months !== undefined)) {
        newConfig.endDate = computeAutoEndDate(newConfig.startDate, newConfig.months)
      }

      return {
        config: newConfig,
        isCustomEndDate: customEnd,
        pricing: calculatePrice(newConfig.buses, newConfig.months, newConfig.videoDurationSeconds),
      }
    }),

  setIsCustomEndDate: (val) =>
    set((state) => {
      const newConfig = { ...state.config }
      if (!val) {
        // Reset end date to auto calculated date
        newConfig.endDate = computeAutoEndDate(newConfig.startDate, newConfig.months)
      }
      return {
        isCustomEndDate: val,
        config: newConfig,
      }
    }),

  reset: () =>
    set({
      config: DEFAULT_CONFIG,
      selectedCampaign: initialCampaign,
      isCustomEndDate: false,
      pricing: calculatePrice(DEFAULT_CONFIG.buses, DEFAULT_CONFIG.months, DEFAULT_CONFIG.videoDurationSeconds),
    }),
}))
