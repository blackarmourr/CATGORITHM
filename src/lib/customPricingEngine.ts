// ============================================================
// CATGORITHM CUSTOM CAMPAIGN — PER-DAY ADVERTISING PRICING ENGINE
// Synchronized with Standard Approved Tariff:
// Base standard rate: ₹2,500 / month / bus (for 30s ad)
// Rate per day per bus (30s ad): ₹83.333... (₹25,000 for 10 buses / 30 days)
// Rate per second per day per bus: ₹2.7778
// Fixed Milestones: 1 Day, 7 Days, 14 Days, 21 Days, 30 Days (and multi-month extensions)
// ============================================================

import {
  STANDARD_BASE_PRICE_30S,
  STANDARD_RATE_PER_SECOND,
  calculatePrice
} from './pricingEngine';

// Base daily rate per second per bus derived directly from standard tariff:
// ₹2,500 / (30 days * 30 seconds) = 25 / 9 ≈ ₹2.7778 per second per day
export const DAILY_BASE_RATE_PER_SECOND = STANDARD_RATE_PER_SECOND / 30; // ~2.7778

export interface PricingMilestone {
  days: number;
  label: string;
  sublabel: string;
}

export const FIXED_PRICING_MILESTONES: PricingMilestone[] = [
  { days: 1,  label: '1 Day',   sublabel: 'Daily' },
  { days: 7,  label: '7 Days',  sublabel: '1 Week' },
  { days: 14, label: '14 Days', sublabel: '2 Weeks' },
  { days: 21, label: '21 Days', sublabel: '3 Weeks' },
  { days: 30, label: '30 Days', sublabel: '1 Month' },
];

export interface CustomPricingResult {
  // Inputs
  buses: number;
  days: number;
  videoDurationSeconds: number;

  // Commercials
  dailyBasePricePerBus: number; // Base rate per day for selected video duration
  standardPrice: number;        // Undiscounted tariff based on ₹25,000 / month for 10 buses
  finalPerBusPrice: number;     // totalPrice / buses
  totalPrice: number;           // Total campaign offer price
  savings: number;              // standardPrice - totalPrice
  savingsPercentage: number;    // (savings / standardPrice) * 100

  // Multipliers & Base metrics
  durationMultiplier: number;   // videoDurationSeconds / 30
  interpolated10SecPrice: number;

  // Effective Unit Economics
  pricePerBusCampaign: number;  // finalPerBusPrice
  pricePerBusDay: number;       // totalPrice / (buses * days)
  pricePerSecondBusDay: number; // pricePerBusDay / videoDurationSeconds
}

/**
 * Main calculation function for the Custom Per-Day Campaign Pricing.
 * Perfectly synchronized with Standard Monthly Pricing:
 * - 30s ad, 1 bus, 30 days: Standard ₹2,500 | Offer ₹2,250 (Save ₹250, 10% OFF)
 * - 30s ad, 10 buses, 30 days: Standard ₹25,000 | Offer ₹20,000 (Save ₹5,000, 20% OFF)
 * - 30s ad, 10 buses, 60 days: Standard ₹50,000 | Offer ₹35,000 (Save ₹15,000, 30% OFF)
 * - 30s ad, 10 buses, 45 days: Standard ₹37,500 | Offer ₹27,500 (Save ₹10,000, 26.7% OFF)
 * - Proportional scaling for all video durations (10s, 15s, 20s, 30s, 40s, 50s, 60s, etc.)
 */
export function calculateCustomPrice(
  buses: number,
  days: number,
  videoDurationSeconds: number
): CustomPricingResult {
  const b = Math.max(1, Math.min(10, Math.round(buses)));
  const d = Math.max(1, Math.round(days));
  const s = Math.max(1, Math.round(videoDurationSeconds));

  // 1. Standard Undiscounted Base Tariff:
  // Derived from approved standard rate: ₹2,500 / month / bus for 30s ad.
  // Standard daily rate per second per bus = STANDARD_RATE_PER_SECOND / 30 (₹2.7778)
  const dailyRatePerSec = STANDARD_RATE_PER_SECOND / 30;
  const dailyBasePricePerBus = Math.round(s * dailyRatePerSec * 100) / 100;

  // Standard tariff scales proportionally with duration, fleet size, and ad duration:
  const standardPrice = Math.round((STANDARD_BASE_PRICE_30S / 30) * (s / 30) * d * b);

  // 2. Video Duration Scaling Multiplier
  const durationMultiplier = s / 30;

  // 3. Package Price Calculation
  let totalPrice: number;

  if (d % 30 === 0 && d <= 360) {
    // Exact month milestones (30 days = 1 month, 60 days = 2 months, etc.)
    // Guaranteed 100% exact match with approved Standard Package Pricing
    const months = Math.floor(d / 30);
    totalPrice = calculatePrice(b, months, s).packagePrice;
  } else if (d > 30) {
    // Intermediate days between monthly milestones (e.g. 45 days, 75 days)
    // Smooth linear interpolation between standard monthly packages
    const lowerMonth = Math.floor(d / 30);
    const upperMonth = lowerMonth + 1;
    const lowerDays = lowerMonth * 30;
    const upperDays = upperMonth * 30;

    const lowerPrice = calculatePrice(b, Math.min(12, lowerMonth), s).packagePrice;
    const upperPrice = calculatePrice(b, Math.min(12, upperMonth), s).packagePrice;

    const fraction = (d - lowerDays) / (upperDays - lowerDays);
    const rawTotal = lowerPrice + fraction * (upperPrice - lowerPrice);
    totalPrice = Math.round(rawTotal / 5) * 5;
  } else {
    // Days 1..29 below 30 days
    // Benchmark 30-day package and standard tariff
    const std30 = Math.round((STANDARD_BASE_PRICE_30S / 30) * (s / 30) * 30 * b);
    const pkg30 = calculatePrice(b, 1, s).packagePrice;
    const maxDiscountRate = std30 > 0 ? (std30 - pkg30) / std30 : 0;

    // Milestone discount curve:
    // 1-7 days: 0% discount (standard rate)
    // 7-14 days: scales to 50% of monthly discount
    // 14-21 days: scales to 75% of monthly discount
    // 21-30 days: scales to 100% of monthly discount
    let discFactor = 0;
    if (d <= 7) {
      discFactor = 0;
    } else if (d <= 14) {
      discFactor = ((d - 7) / 7) * 0.5;
    } else if (d <= 21) {
      discFactor = 0.5 + ((d - 14) / 7) * 0.25;
    } else {
      discFactor = 0.75 + ((d - 21) / 9) * 0.25;
    }

    const effectiveDiscount = maxDiscountRate * discFactor;
    const rawTotal = Math.round((standardPrice * (1 - effectiveDiscount)) / 5) * 5;
    totalPrice = Math.min(standardPrice, rawTotal);
  }

  // 4. Effective Unit Economics
  const finalPerBusPrice = Math.round(totalPrice / b);
  const savings = Math.max(0, standardPrice - totalPrice);
  const savingsPercentage = standardPrice > 0 ? (savings / standardPrice) * 100 : 0;
  const pricePerBusCampaign = finalPerBusPrice;
  const pricePerBusDay = totalPrice / (b * d);
  const pricePerSecondBusDay = pricePerBusDay / s;

  return {
    buses: b,
    days: d,
    videoDurationSeconds: s,
    dailyBasePricePerBus,
    standardPrice,
    finalPerBusPrice,
    totalPrice,
    savings,
    savingsPercentage,
    durationMultiplier,
    interpolated10SecPrice: Math.round((totalPrice / (b * (s / 10))) / 5) * 5,
    pricePerBusCampaign,
    pricePerBusDay,
    pricePerSecondBusDay,
  };
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
