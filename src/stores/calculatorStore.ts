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
  isFestivalPricing: boolean
  manualPriceOverride: number | null
  manualDiscount: number

  setCampaign: (campaign: Campaign) => void
  setConfig: (updates: Partial<CampaignConfig>) => void
  setIsCustomEndDate: (val: boolean) => void
  setFestivalPricing: (val: boolean) => void
  setManualPriceOverride: (val: number | null) => void
  setManualDiscount: (val: number) => void
  reset: () => void
}

const defaultCampaigns = getDefaultCampaigns()
const initialCampaign = defaultCampaigns[0] // Standard Campaign
const initialMonths = initialCampaign?.defaultBilledMonths || 1
const initialStartDate = initialCampaign?.startDate || new Date().toISOString().split('T')[0]
const initialEndDate = computeAutoEndDate(initialStartDate, initialMonths)

const DEFAULT_CONFIG: CampaignConfig = {
  buses: 10,
  months: initialMonths,
  videoDurationSeconds: 30,
  campaignId: initialCampaign.id,
  startDate: initialStartDate,
  endDate: initialEndDate,
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  config: DEFAULT_CONFIG,
  selectedCampaign: initialCampaign,
  isCustomEndDate: false,
  isFestivalPricing: false,
  manualPriceOverride: null,
  manualDiscount: 0,
  pricing: calculatePrice(
    DEFAULT_CONFIG.buses,
    DEFAULT_CONFIG.months,
    DEFAULT_CONFIG.videoDurationSeconds,
    {
      isFestivalPricing: false,
      manualPriceOverride: null,
      manualDiscount: 0,
    }
  ),

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
        pricing: calculatePrice(
          newConfig.buses,
          newConfig.months,
          newConfig.videoDurationSeconds,
          {
            isFestivalPricing: state.isFestivalPricing,
            manualPriceOverride: state.manualPriceOverride,
            manualDiscount: state.manualDiscount,
          }
        ),
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
        pricing: calculatePrice(
          newConfig.buses,
          newConfig.months,
          newConfig.videoDurationSeconds,
          {
            isFestivalPricing: state.isFestivalPricing,
            manualPriceOverride: state.manualPriceOverride,
            manualDiscount: state.manualDiscount,
          }
        ),
      }
    }),

  setIsCustomEndDate: (val) =>
    set((state) => {
      const newConfig = { ...state.config }
      if (!val) {
        newConfig.endDate = computeAutoEndDate(newConfig.startDate, newConfig.months)
      }
      return {
        isCustomEndDate: val,
        config: newConfig,
      }
    }),

  setFestivalPricing: (val) =>
    set((state) => ({
      isFestivalPricing: val,
      pricing: calculatePrice(
        state.config.buses,
        state.config.months,
        state.config.videoDurationSeconds,
        {
          isFestivalPricing: val,
          manualPriceOverride: state.manualPriceOverride,
          manualDiscount: state.manualDiscount,
        }
      ),
    })),

  setManualPriceOverride: (val) =>
    set((state) => ({
      manualPriceOverride: val,
      pricing: calculatePrice(
        state.config.buses,
        state.config.months,
        state.config.videoDurationSeconds,
        {
          isFestivalPricing: state.isFestivalPricing,
          manualPriceOverride: val,
          manualDiscount: state.manualDiscount,
        }
      ),
    })),

  setManualDiscount: (val) =>
    set((state) => ({
      manualDiscount: val,
      pricing: calculatePrice(
        state.config.buses,
        state.config.months,
        state.config.videoDurationSeconds,
        {
          isFestivalPricing: state.isFestivalPricing,
          manualPriceOverride: state.manualPriceOverride,
          manualDiscount: val,
        }
      ),
    })),

  reset: () =>
    set({
      config: DEFAULT_CONFIG,
      selectedCampaign: initialCampaign,
      isCustomEndDate: false,
      isFestivalPricing: false,
      manualPriceOverride: null,
      manualDiscount: 0,
      pricing: calculatePrice(
        DEFAULT_CONFIG.buses,
        DEFAULT_CONFIG.months,
        DEFAULT_CONFIG.videoDurationSeconds,
        {
          isFestivalPricing: false,
          manualPriceOverride: null,
          manualDiscount: 0,
        }
      ),
    }),
}))
