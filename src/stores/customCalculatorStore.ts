import { create } from 'zustand'
import { calculateCustomPrice, type CustomPricingResult } from '../lib/customPricingEngine'
import { format, addDays } from 'date-fns'

export interface CustomCalculatorConfig {
  buses: number;
  days: number;
  videoDurationSeconds: number;
  startDate: string;
  endDate: string;
}

interface CustomCalculatorStore {
  config: CustomCalculatorConfig;
  pricing: CustomPricingResult;
  setBuses: (buses: number) => void;
  setDays: (days: number) => void;
  setVideoDurationSeconds: (seconds: number) => void;
  setStartDate: (startDate: string) => void;
  reset: () => void;
}

function computeEndDate(startDateStr: string, daysCount: number): string {
  try {
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return '';
    // A 1-day campaign ends on the start day; a 14-day campaign ends on start + 13 days
    const end = addDays(start, Math.max(0, daysCount - 1));
    return format(end, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

const DEFAULT_DAYS = 14;
const DEFAULT_BUSES = 1;
const DEFAULT_SECONDS = 30;
const INITIAL_START_DATE = format(new Date(), 'yyyy-MM-dd');
const INITIAL_END_DATE = computeEndDate(INITIAL_START_DATE, DEFAULT_DAYS);

export const useCustomCalculatorStore = create<CustomCalculatorStore>((set, get) => ({
  config: {
    buses: DEFAULT_BUSES,
    days: DEFAULT_DAYS,
    videoDurationSeconds: DEFAULT_SECONDS,
    startDate: INITIAL_START_DATE,
    endDate: INITIAL_END_DATE,
  },
  pricing: calculateCustomPrice(DEFAULT_BUSES, DEFAULT_DAYS, DEFAULT_SECONDS),

  setBuses: (buses) => {
    const cleanB = Math.max(1, Math.min(10, Math.round(buses)));
    const { config } = get();
    const pricing = calculateCustomPrice(cleanB, config.days, config.videoDurationSeconds);
    set({ config: { ...config, buses: cleanB }, pricing });
  },

  setDays: (days) => {
    const cleanD = Math.max(1, Math.round(days));
    const { config } = get();
    const endDate = computeEndDate(config.startDate, cleanD);
    const pricing = calculateCustomPrice(config.buses, cleanD, config.videoDurationSeconds);
    set({ config: { ...config, days: cleanD, endDate }, pricing });
  },

  setVideoDurationSeconds: (seconds) => {
    const cleanS = Math.max(10, Math.round(seconds));
    const { config } = get();
    const pricing = calculateCustomPrice(config.buses, config.days, cleanS);
    set({ config: { ...config, videoDurationSeconds: cleanS }, pricing });
  },

  setStartDate: (startDate) => {
    const { config } = get();
    const endDate = computeEndDate(startDate, config.days);
    set({ config: { ...config, startDate, endDate } });
  },

  reset: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const endDate = computeEndDate(today, DEFAULT_DAYS);
    set({
      config: {
        buses: DEFAULT_BUSES,
        days: DEFAULT_DAYS,
        videoDurationSeconds: DEFAULT_SECONDS,
        startDate: today,
        endDate,
      },
      pricing: calculateCustomPrice(DEFAULT_BUSES, DEFAULT_DAYS, DEFAULT_SECONDS),
    });
  },
}));
