// ============================================================
// CATGORITHM CUSTOM CAMPAIGN — PER-DAY ADVERTISING PRICING ENGINE
// Base Rate: ₹5 per second per day (10s = ₹50/day, 20s = ₹100/day, 30s = ₹150/day)
// Fixed Milestones for 10-second ad:
//   1 Day: ₹50 | 7 Days: ₹350 | 14 Days: ₹500 | 21 Days: ₹625 | 30 Days: ₹750
// Linear interpolation for intermediate days, rounded to nearest ₹5.
// Proportional scaling for video durations (10s, 15s, 20s, 30s, 40s, 50s, 60s, etc.).
// Synchronized with Standard Monthly Package (₹20,000 for 10 buses / 30s ad).
// Maximum 30-day tariff kept below ₹25,000 for 10 buses (₹2,500 for 1 bus).
// ============================================================

import {
  ONE_MONTH_PACKAGE_PRICES,
  calculatePrice
} from './pricingEngine';

export const DAILY_BASE_RATE_PER_SECOND = 5; // ₹5 per second per day (10s = ₹50/day, 30s = ₹150/day)

export interface PricingMilestone {
  days: number;
  price10s: number;
}

export const FIXED_PRICING_MILESTONES: PricingMilestone[] = [
  { days: 1,  price10s: 50 },
  { days: 7,  price10s: 350 },
  { days: 14, price10s: 500 },
  { days: 21, price10s: 625 },
  { days: 30, price10s: 750 },
];

/**
 * Calculates the interpolated 10-second advertisement price for a given number of days.
 * Applies linear interpolation between the two nearest milestones and rounds to nearest ₹5.
 */
export function getInterpolated10SecPrice(days: number): number {
  const d = Math.max(1, Math.round(days));

  // Check exact milestone
  const exact = FIXED_PRICING_MILESTONES.find((m) => m.days === d);
  if (exact) return exact.price10s;

  let lower: PricingMilestone;
  let upper: PricingMilestone;

  if (d < 7) {
    lower = FIXED_PRICING_MILESTONES[0]; // 1 day, ₹50
    upper = FIXED_PRICING_MILESTONES[1]; // 7 days, ₹350
  } else if (d < 14) {
    lower = FIXED_PRICING_MILESTONES[1]; // 7 days, ₹350
    upper = FIXED_PRICING_MILESTONES[2]; // 14 days, ₹500
  } else if (d < 21) {
    lower = FIXED_PRICING_MILESTONES[2]; // 14 days, ₹500
    upper = FIXED_PRICING_MILESTONES[3]; // 21 days, ₹625
  } else if (d <= 30) {
    lower = FIXED_PRICING_MILESTONES[3]; // 21 days, ₹625
    upper = FIXED_PRICING_MILESTONES[4]; // 30 days, ₹750
  } else {
    // Beyond 30 days: each 30-day block stays ₹750 for 10s plus remainder interpolated
    const blocks30 = Math.floor(d / 30);
    const remDays = d % 30;
    const remPrice = remDays > 0 ? getInterpolated10SecPrice(remDays) : 0;
    return blocks30 * 750 + remPrice;
  }

  // Linear interpolation formula:
  const rawPrice = lower.price10s + ((d - lower.days) / (upper.days - lower.days)) * (upper.price10s - lower.price10s);
  return Math.round(rawPrice / 5) * 5;
}

export interface CustomPricingResult {
  // Inputs
  buses: number;
  days: number;
  videoDurationSeconds: number;

  // Commercials
  dailyBasePricePerBus: number; // Duration * ₹5 (₹50 for 10s, ₹150 for 30s)
  standardPrice: number;        // Comparison tariff (capped at ₹25,000 for 1 month / 10 buses)
  finalPerBusPrice: number;     // totalPrice / buses
  totalPrice: number;           // Total campaign offer price
  savings: number;              // standardPrice - totalPrice
  savingsPercentage: number;    // (savings / standardPrice) * 100

  // Multipliers & Base metrics
  durationMultiplier: number;   // videoDurationSeconds / 10
  interpolated10SecPrice: number;

  // Effective Unit Economics
  pricePerBusCampaign: number;  // finalPerBusPrice
  pricePerBusDay: number;       // totalPrice / (buses * days)
  pricePerSecondBusDay: number; // pricePerBusDay / videoDurationSeconds
}

/**
 * Main calculation function for the Custom Per-Day Campaign Pricing.
 * - Base rate: ₹50 for 10s, ₹150 for 30s per bus per day.
 * - Previous milestone pricing for upto 1 month (1, 7, 14, 21, 30 days).
 * - Total price for 30 days stays below ₹25,000 (synced to ₹20,000 for 10 buses).
 * - Standard undiscounted price capped at ₹25,000 for 1 month (10 buses) and ₹50,000 for 2 months.
 */
export function calculateCustomPrice(
  buses: number,
  days: number,
  videoDurationSeconds: number
): CustomPricingResult {
  const b = Math.max(1, Math.min(10, Math.round(buses)));
  const d = Math.max(1, Math.round(days));
  const s = Math.max(1, Math.round(videoDurationSeconds));

  // 1. Daily Base Price per bus: Video Duration × ₹5 (₹50 for 10s, ₹150 for 30s)
  const dailyBasePricePerBus = s * DAILY_BASE_RATE_PER_SECOND;

  // 2. Video Duration Scaling (relative to 10s base milestone)
  const durationMultiplier = s / 10;
  const interpolated10SecPrice = getInterpolated10SecPrice(d);

  // 3. Package Price Calculation
  let totalPrice: number;
  let standardPrice: number;

  if (d % 30 === 0 && d <= 360) {
    // Exact month milestones (30 days = 1 month, 60 days = 2 months, etc.)
    const months = Math.floor(d / 30);
    const stdMonthCalc = calculatePrice(b, months, s);
    totalPrice = stdMonthCalc.packagePrice;
    standardPrice = stdMonthCalc.standardPrice;
  } else if (d > 30) {
    // Intermediate days between monthly milestones (e.g. 45 days, 75 days)
    const lowerMonth = Math.floor(d / 30);
    const upperMonth = lowerMonth + 1;
    const lowerDays = lowerMonth * 30;
    const upperDays = upperMonth * 30;

    const lowerCalc = calculatePrice(b, Math.min(12, lowerMonth), s);
    const upperCalc = calculatePrice(b, Math.min(12, upperMonth), s);

    const fraction = (d - lowerDays) / (upperDays - lowerDays);
    const rawTotal = lowerCalc.packagePrice + fraction * (upperCalc.packagePrice - lowerCalc.packagePrice);
    totalPrice = Math.round(rawTotal / 5) * 5;

    const rawStd = lowerCalc.standardPrice + fraction * (upperCalc.standardPrice - lowerCalc.standardPrice);
    standardPrice = Math.round(rawStd);
  } else {
    // Days 1..29 below 1 month: follow previous milestone & interpolation pricing
    const fleetRatio = (ONE_MONTH_PACKAGE_PRICES[b] ?? (2250 * b)) / (ONE_MONTH_PACKAGE_PRICES[1] * b);
    if (d === 30) {
      totalPrice = calculatePrice(b, 1, s).packagePrice;
    } else {
      const rawTotal = interpolated10SecPrice * durationMultiplier * b * fleetRatio;
      totalPrice = Math.round(rawTotal / 5) * 5;
    }

    // Standard comparison price for upto 1 month:
    // Daily base rate: (s * 5) * d * b, capped at the approved 30-day standard tariff (₹25,000 for 10 buses)
    const unconstrainedStd = dailyBasePricePerBus * d * b;
    const maxMonthlyStd = calculatePrice(b, 1, s).standardPrice;
    standardPrice = Math.min(maxMonthlyStd, unconstrainedStd);
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
    interpolated10SecPrice,
    pricePerBusCampaign,
    pricePerBusDay,
    pricePerSecondBusDay,
  };
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
