// ============================================================
// CATGORITHM CUSTOM CAMPAIGN — PER-DAY ADVERTISING PRICING ENGINE
// Independent per-day campaign pricing system for short campaigns (< 30 days)
// and seamlessly synchronized with the Main Calculator for all month-scale
// durations (30 days = 1 Month, 60 days = 2 Months, 90 days = 3 Months, etc.).
//
// 1. Daily Pricing Table (Per Bus):
//    10s: ₹100 | 20s: ₹140 | 30s: ₹175 | 40s: ₹215 | 50s: ₹250 | 60s: ₹290
//    Minimum advertisement duration: 10 seconds.
//
// 2. Campaign Duration Pricing (30-second advertisement reference):
//    1 Day:  ₹175
//    2 Days: ₹350
//    3 Days: ₹525
//    4 Days: ₹700
//    5 Days: ₹875
//    6 Days: ₹1,050
//    7 Days: ₹1,050 (charge 6 days, 1 day free)
//    14 Days: ₹1,500
//    21 Days: ₹1,875
//    30 Days: ₹2,250
//
// 3. Proportional Scaling & Rounding:
//    - For any duration s: scale by (dailyPrice(s) / 175).
//    - For b buses: totalPrice = pricePerBus * b.
//    - All final prices rounded to nearest multiple of ₹5 (no decimals).
// ============================================================

import { calculatePrice, roundToNearest5, roundCommercialPrice } from './pricingEngine.ts';

export const MIN_AD_DURATION_SECONDS = 10;
export const DAILY_BASE_RATE_PER_SECOND = 175 / 30; // ₹5.833/sec (backward compatibility)

export const DAILY_PRICING_TABLE_PER_BUS: Record<number, number> = {
  10: 100,
  20: 140,
  30: 175,
  40: 215,
  50: 250,
  60: 290,
};

export interface PricingMilestone {
  days: number;
  price30s: number;
  price10s: number;
  label: string;
}

export const FIXED_PRICING_MILESTONES: PricingMilestone[] = [
  { days: 1,  price30s: 175,  price10s: 100, label: '1 Day' },
  { days: 7,  price30s: 1050, price10s: 600, label: '7 Days (1d Free)' },
  { days: 14, price30s: 1500, price10s: 855, label: '14 Days' },
  { days: 21, price30s: 1875, price10s: 1070, label: '21 Days' },
  { days: 30, price30s: 2250, price10s: 1285, label: '30 Days' },
];

/**
 * Returns the daily rate per bus for any advertisement duration.
 * Clamped to a minimum of 10 seconds.
 */
export function getDailyPricePerBus(seconds: number): number {
  const s = Math.max(MIN_AD_DURATION_SECONDS, Math.round(seconds));
  if (DAILY_PRICING_TABLE_PER_BUS[s] !== undefined) {
    return DAILY_PRICING_TABLE_PER_BUS[s];
  }

  // Linear interpolation between defined duration tiers
  if (s < 20) {
    return 100 + ((s - 10) / 10) * (140 - 100);
  }
  if (s < 30) {
    return 140 + ((s - 20) / 10) * (175 - 140);
  }
  if (s < 40) {
    return 175 + ((s - 30) / 10) * (215 - 175);
  }
  if (s < 50) {
    return 215 + ((s - 40) / 10) * (250 - 215);
  }
  if (s < 60) {
    return 250 + ((s - 50) / 10) * (290 - 250);
  }

  // Beyond 60s: +₹4/sec (40 per 10s increment)
  return 290 + (s - 60) * 4;
}

/**
 * Calculates the reference 30-second campaign price per bus for any number of days.
 * Strictly respects fixed milestones:
 * - 1 to 6 days: days * ₹175
 * - 7 days: ₹1,050 (1 day free)
 * - 8 to 13 days: interpolated between 7d (₹1,050) and 14d (₹1,500)
 * - 14 days: ₹1,500
 * - 15 to 20 days: interpolated between 14d (₹1,500) and 21d (₹1,875)
 * - 21 days: ₹1,875
 * - 22 to 29 days: interpolated between 21d (₹1,875) and 30d (₹2,250)
 * - 30 days: ₹2,250
 * - Beyond 30 days: 30-day blocks @ ₹2,250 + remainder
 */
export function get30sCustomPerBusPrice(days: number): number {
  const d = Math.max(1, Math.round(days));

  if (d <= 6) {
    return d * 175;
  }
  if (d === 7) {
    return 1050; // Charge only 6 days, 1 day free
  }
  if (d < 14) {
    const raw = 1050 + ((d - 7) / (14 - 7)) * (1500 - 1050);
    return Math.round(raw / 5) * 5;
  }
  if (d === 14) {
    return 1500;
  }
  if (d < 21) {
    const raw = 1500 + ((d - 14) / (21 - 14)) * (1875 - 1500);
    return Math.round(raw / 5) * 5;
  }
  if (d === 21) {
    return 1875;
  }
  if (d < 30) {
    const raw = 1875 + ((d - 21) / (30 - 21)) * (2250 - 1875);
    return Math.round(raw / 5) * 5;
  }
  if (d === 30) {
    return 2250;
  }

  // Beyond 30 days: Synchronized with 1-bus 30s rate from Main Calculator
  const m1 = Math.min(12, Math.floor(d / 30));
  const remDays = d - m1 * 30;
  if (remDays === 0) {
    return calculatePrice(1, m1, 30, { isFestivalPricing: false }).normalPrice;
  }
  if (m1 < 12) {
    const p1 = calculatePrice(1, m1, 30, { isFestivalPricing: false }).normalPrice;
    const p2 = calculatePrice(1, m1 + 1, 30, { isFestivalPricing: false }).normalPrice;
    return roundToNearest5(p1 + (remDays / 30) * (p2 - p1));
  }
  const p12 = calculatePrice(1, 12, 30, { isFestivalPricing: false }).normalPrice;
  return roundToNearest5(p12 + ((d - 360) / 30) * (p12 / 12));
}

/**
 * Standard (Undiscounted / Tariff) comparison price per bus for 30s ad.
 * Benchmarks:
 * - 1 to 6 days: full standard daily rate (d * ₹175)
 * - 7 days: 7 * ₹175 = ₹1,225 (1 day free savings vs package ₹1,050)
 * - 14 days: ₹1,850 (savings vs package ₹1,500)
 * - 21 days: ₹2,250 (strictly below 1-month tariff ₹2,500; savings vs package ₹1,875)
 * - 30 days (1 Month): ₹2,500 (full 1-month undiscounted tariff vs package ₹2,250)
 */
export function get30sCustomStandardPerBusPrice(days: number): number {
  const d = Math.max(1, Math.round(days));

  if (d <= 6) {
    return d * 175;
  }
  if (d === 7) {
    return 1225; // 7 days @ ₹175/day standard tariff
  }
  if (d < 14) {
    const raw = 1225 + ((d - 7) / (14 - 7)) * (1850 - 1225);
    return Math.round(raw / 5) * 5;
  }
  if (d === 14) {
    return 1850;
  }
  if (d < 21) {
    const raw = 1850 + ((d - 14) / (21 - 14)) * (2250 - 1850);
    return Math.round(raw / 5) * 5;
  }
  if (d === 21) {
    return 2250;
  }
  if (d < 30) {
    const raw = 2250 + ((d - 21) / (30 - 21)) * (2500 - 2250);
    return Math.round(raw / 5) * 5;
  }
  if (d === 30) {
    return 2500; // Standard 1-month tariff
  }

  // Beyond 30 days: Synchronized with 1-bus 30s actual tariff from Main Calculator (₹2,500/mo)
  const m1 = Math.min(12, Math.floor(d / 30));
  const remDays = d - m1 * 30;
  if (remDays === 0) {
    return calculatePrice(1, m1, 30, { isFestivalPricing: false }).actualPrice;
  }
  if (m1 < 12) {
    const p1 = calculatePrice(1, m1, 30, { isFestivalPricing: false }).actualPrice;
    const p2 = calculatePrice(1, m1 + 1, 30, { isFestivalPricing: false }).actualPrice;
    return roundToNearest5(p1 + (remDays / 30) * (p2 - p1));
  }
  const p12 = calculatePrice(1, 12, 30, { isFestivalPricing: false }).actualPrice;
  return roundToNearest5(p12 + ((d - 360) / 30) * (p12 / 12));
}

/**
 * Approved Fleet Multiplier for Multi-Bus Custom Campaigns
 * Derived from the standard 1-month tariff schedule:
 * 1 bus:  ₹2,250 (1.0000x)
 * 2 buses: ₹4,350 (1.9333x -> saves ₹150 vs 2 * 2250)
 * 3 buses: ₹6,450 (2.8667x -> saves ₹300)
 * 4 buses: ₹8,500 (3.7778x -> saves ₹500)
 * 5 buses: ₹10,500 (4.6667x -> saves ₹750)
 * 6 buses: ₹12,500 (5.5556x -> saves ₹1,000)
 * 7 buses: ₹14,500 (6.4444x -> saves ₹1,250)
 * 8 buses: ₹16,500 (7.3333x -> saves ₹1,500)
 * 9 buses: ₹18,250 (8.1111x -> saves ₹2,000)
 * 10 buses: ₹20,000 (8.8889x -> saves ₹2,500; yields exact ₹20,000 at 30 days!)
 */
export const CUSTOM_FLEET_MULTIPLIER: Record<number, number> = {
  1:  1.0000,
  2:  4350 / 2250,  // ~1.9333
  3:  6450 / 2250,  // ~2.8667
  4:  8500 / 2250,  // ~3.7778
  5:  10500 / 2250, // ~4.6667
  6:  12500 / 2250, // ~5.5556
  7:  14500 / 2250, // ~6.4444
  8:  16500 / 2250, // ~7.3333
  9:  18250 / 2250, // ~8.1111
  10: 20000 / 2250, // ~8.8889
};

export interface CustomPricingResult {
  // Inputs
  buses: number;
  days: number;
  videoDurationSeconds: number;

  // Commercials
  dailyBasePricePerBus: number; // Daily price for selected duration
  standardPrice: number;        // Undiscounted comparison price (daily rate * days * buses)
  finalPerBusPrice: number;     // totalPrice / buses
  totalPrice: number;           // Total campaign price rounded to nearest ₹5
  packagePrice: number;         // Alias to totalPrice for backward compatibility
  savings: number;              // standardPrice - totalPrice
  savingsPercentage: number;    // (savings / standardPrice) * 100

  // Multipliers & Base metrics
  durationMultiplier: number;   // dailyRate / 175
  interpolated10SecPrice: number; // for backward compatibility

  // Effective Unit Economics
  pricePerBusCampaign: number;  // finalPerBusPrice
  pricePerBusDay: number;       // totalPrice / (buses * days)
  pricePerSecondBusDay: number; // pricePerBusDay / videoDurationSeconds
}

/**
 * Main calculation function for the Custom Per-Day Campaign Pricing.
 * For short campaigns (d < 30 days): Uses custom per-day pricing with fleet multipliers.
 * For month-scale campaigns (d >= 30 days): Synchronizes 100% with the Main Calculator's
 * normal selling prices and standard actual tariffs across all bus counts, durations, and months.
 */
export function calculateCustomPrice(
  buses: number,
  days: number,
  videoDurationSeconds: number
): CustomPricingResult {
  const b = Math.max(1, Math.min(10, Math.round(buses)));
  const d = Math.max(1, Math.round(days));
  const s = Math.max(MIN_AD_DURATION_SECONDS, Math.round(videoDurationSeconds)); // Min 10s

  const dailyBasePricePerBus = getDailyPricePerBus(s);

  let totalPrice: number;
  let standardPrice: number;
  let durationMultiplier: number;

  if (d >= 30) {
    // -------------------------------------------------------------
    // Synchronize 100% with Main Calculator for all month-scale campaigns (d >= 30)
    // 30 days = 1 Month, 60 days = 2 Months, 90 days = 3 Months, 180 days = 6 Months, etc.
    // -------------------------------------------------------------
    durationMultiplier = s / 30;
    const m1 = Math.min(12, Math.floor(d / 30));
    const remDays = d - m1 * 30;

    if (remDays === 0) {
      const res = calculatePrice(b, m1, s, { isFestivalPricing: false });
      totalPrice = res.normalPrice;
      standardPrice = res.actualPrice;
    } else if (m1 < 12) {
      const m2 = m1 + 1;
      const res1 = calculatePrice(b, m1, s, { isFestivalPricing: false });
      const res2 = calculatePrice(b, m2, s, { isFestivalPricing: false });
      const alpha = remDays / 30;
      totalPrice = roundToNearest5(res1.normalPrice + alpha * (res2.normalPrice - res1.normalPrice));
      standardPrice = roundToNearest5(res1.actualPrice + alpha * (res2.actualPrice - res1.actualPrice));
    } else {
      // Beyond 12 months (d > 360)
      const res12 = calculatePrice(b, 12, s, { isFestivalPricing: false });
      const extraDays = d - 360;
      const monthlyNormal = res12.normalPrice / 12;
      const monthlyActual = res12.actualPrice / 12;
      totalPrice = roundToNearest5(res12.normalPrice + (extraDays / 30) * monthlyNormal);
      standardPrice = roundToNearest5(res12.actualPrice + (extraDays / 30) * monthlyActual);
    }
  } else {
    // Custom per-day short campaigns (1 to 29 days)
    durationMultiplier = dailyBasePricePerBus / 175;
    const price30s = get30sCustomPerBusPrice(d);
    const fleetMultiplier = CUSTOM_FLEET_MULTIPLIER[b] ?? b;
    const rawTotalPrice = price30s * fleetMultiplier * durationMultiplier;
    totalPrice = roundToNearest5(rawTotalPrice);

    const standardPrice30s = get30sCustomStandardPerBusPrice(d);
    const rawStandardPerBus = standardPrice30s * durationMultiplier;
    standardPrice = roundToNearest5(rawStandardPerBus * b);
  }

  const finalPerBusPrice = d >= 30 ? roundCommercialPrice(totalPrice / b) : roundToNearest5(totalPrice / b);
  const savings = Math.max(0, standardPrice - totalPrice);
  const savingsPercentage = standardPrice > 0 ? (savings / standardPrice) * 100 : 0;

  // Unit Economics
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
    packagePrice: totalPrice,
    savings,
    savingsPercentage,
    durationMultiplier,
    interpolated10SecPrice: roundToNearest5(get30sCustomPerBusPrice(d) * (100 / 175)),
    pricePerBusCampaign,
    pricePerBusDay,
    pricePerSecondBusDay,
  };
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
