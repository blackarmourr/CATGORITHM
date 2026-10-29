import { create } from 'zustand'
import type { CampaignConfig, Campaign } from '../types'
import { calculatePrice, type PricingResult } from '../lib/pricingEngine'
import { getDefaultCampaigns } from '../lib/dataStore'

interface CalculatorStore {
  config: CampaignConfig
  selectedCampaign: Campaign
  pricing: PricingResult
  setCampaign: (campaign: Campaign) => void
  setConfig: (updates: Partial<CampaignConfig>) => void
  reset: () => void
}

const defaultCampaigns = getDefaultCampaigns()
const initialCampaign = defaultCampaigns[0] // Winter Spotlight 2026–27

const DEFAULT_CONFIG: CampaignConfig = {
  buses: 10,
  months: initialCampaign.defaultBilledMonths || 2,
  videoDurationSeconds: 30,
  campaignId: initialCampaign.id,
  startDate: initialCampaign.startDate,
  endDate: initialCampaign.endDate,
}

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  config: DEFAULT_CONFIG,
  selectedCampaign: initialCampaign,
  pricing: calculatePrice(DEFAULT_CONFIG.buses, DEFAULT_CONFIG.months, DEFAULT_CONFIG.videoDurationSeconds),

  setCampaign: (campaign: Campaign) =>
    set((state) => {
      const newConfig: CampaignConfig = {
        ...state.config,
        campaignId: campaign.id,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        months: campaign.defaultBilledMonths || state.config.months,
      }
      return {
        selectedCampaign: campaign,
        config: newConfig,
        pricing: calculatePrice(newConfig.buses, newConfig.months, newConfig.videoDurationSeconds),
      }
    }),

  setConfig: (updates) =>
    set((state) => {
      const newConfig = { ...state.config, ...updates }
      return {
        config: newConfig,
        pricing: calculatePrice(newConfig.buses, newConfig.months, newConfig.videoDurationSeconds),
      }
    }),

  reset: () =>
    set({
      config: DEFAULT_CONFIG,
      selectedCampaign: initialCampaign,
      pricing: calculatePrice(DEFAULT_CONFIG.buses, DEFAULT_CONFIG.months, DEFAULT_CONFIG.videoDurationSeconds),
    }),
}))
