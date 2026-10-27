import { create } from 'zustand'
import type { CampaignConfig } from '../types'
import { calculatePrice, type PricingResult } from '../lib/pricingEngine'

interface CalculatorStore {
  config: CampaignConfig
  pricing: PricingResult
  setConfig: (updates: Partial<CampaignConfig>) => void
  reset: () => void
}

const DEFAULT_CONFIG: CampaignConfig = {
  buses: 5,
  months: 3,
  videoDurationSeconds: 30,
}

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  config: DEFAULT_CONFIG,
  pricing: calculatePrice(DEFAULT_CONFIG.buses, DEFAULT_CONFIG.months, DEFAULT_CONFIG.videoDurationSeconds),
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
      pricing: calculatePrice(DEFAULT_CONFIG.buses, DEFAULT_CONFIG.months, DEFAULT_CONFIG.videoDurationSeconds),
    }),
}))
