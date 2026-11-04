// ============================================================
// CATGORITHM CUSTOM CAMPAIGN — PER-DAY ADVERTISING PRICING ENGINE
// Base Rate: ₹5 per second per day
// Fixed Milestones for 10-second ad:
//   1 Day: ₹50 | 7 Days: ₹350 | 14 Days: ₹500 | 21 Days: ₹625 | 30 Days: ₹750
// Linear interpolation for intermediate days, rounded to nearest ₹5.
// Proportional scaling for video durations (10s, 15s, 20s, 30s, 40s, 50s, 60s, etc.).
// Synchronized with Standard Monthly Pricing at 30 days (and multi-month milestones).
// ============================================================

import { ONE_MONTH_PACKAGE_PRICES, calculatePrice } from './pricingEngine';

export const DAILY_BASE_RATE_PER_SECOND = 5; // ₹5 per second per day

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
  // Price = Lower Price + ((Selected Days - Lower Days) / (Upper Days - Lower Days)) × (Upper Price - Lower Price)
  const rawPrice = lower.price10s + ((d - lower.days) / (upper.days - lower.days)) * (upper.price10s - lower.price10s);
  
  // Round the final per-bus price to the nearest ₹5
  return Math.round(rawPrice / 5) * 5;
}

export interface CustomPricingResult {
  // Inputs
  buses: number;
  days: number;
  videoDurationSeconds: number;

  // Commercials
  dailyBasePricePerBus: number; // Duration * ₹5
  standardPrice: number;        // dailyBasePricePerBus * days * buses
  finalPerBusPrice: number;     // totalPrice / buses (or rounded per bus)
  totalPrice: number;           // total campaign price (synced with standard tariff at 30 days)
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
 * Perfectly synced with Standard Monthly Pricing at 30 days (1 month) and multi-month increments.
 */
export function calculateCustomPrice(
  buses: number,
  days: number,
  videoDurationSeconds: number
): CustomPricingResult {
  const b = Math.max(1, Math.min(10, Math.round(buses)));
  const d = Math.max(1, Math.round(days));
  const s = Math.max(1, Math.round(videoDurationSeconds));

  // 1. Daily Base Price per bus: Video Duration × ₹5
  const dailyBasePricePerBus = s * DAILY_BASE_RATE_PER_SECOND;

  // 2. Standard undiscounted tariff: Daily Base Price × Days × Buses
  const standardPrice = dailyBasePricePerBus * d * b;

  // 3. Interpolated 10-Second Price for N days (rounded to nearest ₹5)
  const interpolated10SecPrice = getInterpolated10SecPrice(d);

  // 4. Video Duration Scaling
  const durationMultiplier = s / 10;

  // 5. Total Price Calculation — Synchronized with standard pricing
  let totalPrice: number;

  if (d % 30 === 0 && d <= 360) {
    // Exact month milestones (30 days = 1 month, 60 days = 2 months, etc.)
    // Guaranteed 100% synced with Standard Package Pricing
    const months = Math.floor(d / 30);
    totalPrice = calculatePrice(b, months, s).packagePrice;
  } else if (d < 30) {
    // Fleet scaling factor derived from standard 1-month tariff table
    const fleetRatio = (ONE_MONTH_PACKAGE_PRICES[b] ?? (2250 * b)) / (ONE_MONTH_PACKAGE_PRICES[1] * b);
    const rawTotal = interpolated10SecPrice * durationMultiplier * b * fleetRatio;
    totalPrice = Math.round(rawTotal / 5) * 5;
  } else {
    // Days between month blocks (e.g. 45 days, 75 days):
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
  }

  // 6. Unit Economics
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

/**
 * Generate Milestone breakdown data for a given video duration and bus count
 */
export function getMilestoneBreakdown(videoDurationSeconds: number, buses: number = 1) {
  const b = Math.max(1, Math.min(10, Math.round(buses)));
  const mult = videoDurationSeconds / 10;
  const fleetRatio = (ONE_MONTH_PACKAGE_PRICES[b] ?? (2250 * b)) / (ONE_MONTH_PACKAGE_PRICES[1] * b);

  return FIXED_PRICING_MILESTONES.map((m) => {
    let total: number;
    if (m.days === 30) {
      total = calculatePrice(b, 1, videoDurationSeconds).packagePrice;
    } else {
      total = Math.round((m.price10s * mult * b * fleetRatio) / 5) * 5;
    }
    const perBus = Math.round(total / b);
    const standard = (videoDurationSeconds * DAILY_BASE_RATE_PER_SECOND) * m.days * b;
    const savings = Math.max(0, standard - total);
    const pct = standard > 0 ? (savings / standard) * 100 : 0;
    return {
      days: m.days,
      price10s: m.price10s,
      perBusPrice: perBus,
      totalPrice: total,
      standardPrice: standard,
      savings,
      savingsPercentage: pct,
    };
  });
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
