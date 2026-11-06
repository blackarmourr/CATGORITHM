// ============================================================
// CATGORITHM CUSTOM CAMPAIGN — PER-DAY ADVERTISING PRICING ENGINE
// Independent per-day campaign pricing system.
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

  // Beyond 30 days
  const blocks30 = Math.floor(d / 30);
  const remDays = d % 30;
  const remPrice = remDays > 0 ? get30sCustomPerBusPrice(remDays) : 0;
  return blocks30 * 2250 + remPrice;
}

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
 * Completely independent from Main Calculator.
 */
export function calculateCustomPrice(
  buses: number,
  days: number,
  videoDurationSeconds: number
): CustomPricingResult {
  const b = Math.max(1, Math.min(10, Math.round(buses)));
  const d = Math.max(1, Math.round(days));
  const s = Math.max(MIN_AD_DURATION_SECONDS, Math.round(videoDurationSeconds)); // Min 10s

  // 1. Daily rate for selected duration
  const dailyBasePricePerBus = getDailyPricePerBus(s);
  const durationMultiplier = dailyBasePricePerBus / 175;

  // 2. 30s base price per bus for given days
  const price30s = get30sCustomPerBusPrice(d);

  // 3. Proportional price per bus and total price
  const rawPricePerBus = price30s * durationMultiplier;
  const finalPerBusPrice = Math.round(rawPricePerBus / 5) * 5;
  const totalPrice = Math.round((finalPerBusPrice * b) / 5) * 5;

  // 4. Undiscounted standard comparison price (daily rate without duration discounts)
  const standardPrice = Math.round((dailyBasePricePerBus * d * b) / 5) * 5;
  const savings = Math.max(0, standardPrice - totalPrice);
  const savingsPercentage = standardPrice > 0 ? (savings / standardPrice) * 100 : 0;

  // 5. Unit Economics
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
    interpolated10SecPrice: Math.round((price30s * (100 / 175)) / 5) * 5,
    pricePerBusCampaign,
    pricePerBusDay,
    pricePerSecondBusDay,
  };
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
