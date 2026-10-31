// ============================================================
// CATGORITHM PRICING ENGINE — SOURCE OF TRUTH
// All pricing calculations live here. Never hardcode prices
// in UI components. Always import from this module.
// ============================================================

export const STANDARD_BASE_PRICE_30S = 2500; // ₹2,500 base standard price for 30s ad per bus per month
export const BASE_VIDEO_DURATION_SECONDS = 30;
export const STANDARD_RATE_PER_SECOND = STANDARD_BASE_PRICE_30S / BASE_VIDEO_DURATION_SECONDS; // ₹83.3333... per second
export const STANDARD_PRICE_PER_BUS_PER_MONTH_30S = STANDARD_BASE_PRICE_30S; // ₹2,500
export const MAX_BUSES = 10;
export const MAX_MONTHS = 12;
export const PRICING_DAYS_PER_MONTH = 30;

// ------------------------------------------------------------
// ONE-MONTH APPROVED PACKAGE TARIFF (total for all buses, 30s ad)
// Standard reference: ₹2,500 / bus / month (₹25,000 for 10 buses)
// Discounted package prices:
// 1 bus:  ₹2,250 (Save ₹250)
// 2 buses: ₹4,350 (Save ₹650)
// 10 buses: ₹20,000 (Save ₹5,000)
// ------------------------------------------------------------
export const ONE_MONTH_PACKAGE_PRICES: Record<number, number> = {
  1:  2250,
  2:  4350,
  3:  6450,
  4:  8500,
  5:  10500,
  6:  12500,
  7:  14500,
  8:  16500,
  9:  18250,
  10: 20000,
};

// ------------------------------------------------------------
// TWO-MONTH APPROVED PACKAGE TARIFF (total for all buses, 30s ad)
// Standard reference: ₹5,000 / bus / 2 months (₹50,000 for 10 buses)
// 10 buses: ₹35,000 (Save ₹15,000, 30% OFF)
// ------------------------------------------------------------
export const TWO_MONTH_PACKAGE_PRICES: Record<number, number> = {
  1:  4250,
  2:  8200,
  3:  12000,
  4:  15800,
  5:  19500,
  6:  23000,
  7:  26500,
  8:  29500,
  9:  32500,
  10: 35000,
};

// ------------------------------------------------------------
// DURATION DISCOUNT TABLE & MONTHLY RATES (for campaigns 3–12 months)
// Applied to (oneMonthPackagePrice × numberOfMonths):
// - 3 months @ 10 buses: ₹54,000 (Standard ₹75,000, Save ₹21,000, 28% OFF)
// - 4 months @ 10 buses: ₹70,000 (Standard ₹1,00,000, Save ₹30,000, 30% OFF)
// - 6 months @ 10 buses: ₹1,05,000 (Standard ₹1,50,000, Save ₹45,000, 30% OFF)
// - 12 months @ 10 buses: ₹2,10,000 (Standard ₹3,00,000, Save ₹90,000, 30% OFF)
// ------------------------------------------------------------
export const MONTHLY_DURATION_DISCOUNT_RATES: Record<number, number> = {
  3:  0.100,  // 10.0% discount -> ₹54,000 for 10 buses (Standard ₹75,000)
  4:  0.125,  // 12.5% discount -> ₹70,000 for 10 buses (Standard ₹1,00,000)
  5:  0.125,  // 12.5% discount -> ₹87,500 for 10 buses (Standard ₹1,25,000)
  6:  0.125,  // 12.5% discount -> ₹1,05,000 for 10 buses (Standard ₹1,50,000)
  7:  0.125,  // 12.5% discount -> ₹1,22,500 for 10 buses (Standard ₹1,75,000)
  8:  0.125,  // 12.5% discount -> ₹1,40,000 for 10 buses (Standard ₹2,00,000)
  9:  0.125,  // 12.5% discount -> ₹1,57,500 for 10 buses (Standard ₹2,25,000)
  10: 0.125,  // 12.5% discount -> ₹1,75,000 for 10 buses (Standard ₹2,50,000)
  11: 0.125,  // 12.5% discount -> ₹1,92,500 for 10 buses (Standard ₹2,75,000)
  12: 0.125,  // 12.5% discount -> ₹2,10,000 for 10 buses (Standard ₹3,00,000, 30% OFF)
};

export interface DurationDiscountRule {
  minMonths: number;
  maxMonths: number;
  discountRate: number; // 0.0 – 1.0
}

export const DURATION_DISCOUNT_RULES: DurationDiscountRule[] = [
  { minMonths: 3,  maxMonths: 3,  discountRate: MONTHLY_DURATION_DISCOUNT_RATES[3] },
  { minMonths: 4,  maxMonths: 4,  discountRate: MONTHLY_DURATION_DISCOUNT_RATES[4] },
  { minMonths: 5,  maxMonths: 5,  discountRate: MONTHLY_DURATION_DISCOUNT_RATES[5] },
  { minMonths: 6,  maxMonths: 6,  discountRate: MONTHLY_DURATION_DISCOUNT_RATES[6] },
  { minMonths: 7,  maxMonths: 7,  discountRate: MONTHLY_DURATION_DISCOUNT_RATES[7] },
  { minMonths: 8,  maxMonths: 8,  discountRate: MONTHLY_DURATION_DISCOUNT_RATES[8] },
  { minMonths: 9,  maxMonths: 9,  discountRate: MONTHLY_DURATION_DISCOUNT_RATES[9] },
  { minMonths: 10, maxMonths: 10, discountRate: MONTHLY_DURATION_DISCOUNT_RATES[10] },
  { minMonths: 11, maxMonths: 11, discountRate: MONTHLY_DURATION_DISCOUNT_RATES[11] },
  { minMonths: 12, maxMonths: 12, discountRate: MONTHLY_DURATION_DISCOUNT_RATES[12] },
];

// ============================================================
// HELPER: Duration multiplier
// ============================================================
export function getDurationMultiplier(videoDurationSeconds: number): number {
  return videoDurationSeconds / BASE_VIDEO_DURATION_SECONDS;
}

// ============================================================
// HELPER: Get duration discount rate for N months
// ============================================================
export function getDurationDiscountRate(months: number): number {
  if (months < 3) return 0;
  if (months >= 12) return MONTHLY_DURATION_DISCOUNT_RATES[12];
  return MONTHLY_DURATION_DISCOUNT_RATES[months] ?? MONTHLY_DURATION_DISCOUNT_RATES[12];
}

// ============================================================
// HELPER: Clean commercial rounding
// Eliminates odd tens/singles while preserving clean approved
// 250, 500, 1000 steps.
// ============================================================
export function roundCommercialPrice(amount: number): number {
  if (amount <= 0) return 0;
  const rounded = Math.round(amount);

  // Exact clean milestones stay intact
  if (rounded % 250 === 0) return rounded;
  if (rounded % 500 === 0) return rounded;

  // Otherwise, round to clean sales increments
  if (rounded < 2500) {
    return Math.round(rounded / 50) * 50;
  }
  if (rounded < 15000) {
    return Math.round(rounded / 100) * 100;
  }
  if (rounded < 50000) {
    return Math.round(rounded / 500) * 500;
  }
  return Math.round(rounded / 1000) * 1000;
}

// ============================================================
// CORE PRICING RESULT TYPE
// ============================================================
export interface PricingResult {
  // Inputs
  buses: number;
  months: number;
  videoDurationSeconds: number;

  // Pricing
  standardPrice: number;           // undiscounted comparison price (75 * sec * buses * months)
  packagePrice: number;            // final customer package price (rounded)
  savings: number;                 // standardPrice - packagePrice
  savingsPercentage: number;       // savings / standardPrice * 100

  // Unit economics
  pricePerBusCampaign: number;     // packagePrice / buses
  pricePerBusMonth: number;        // packagePrice / (buses * months)
  pricePerBusDay: number;          // packagePrice / (buses * months * 30)
  pricePerSecondBusMonth: number;  // packagePrice / (buses * months * seconds)
  pricePerSecondBusCampaign: number; // packagePrice / (buses * seconds)

  // Breakdown detail
  durationMultiplier: number;
  durationDiscountRate: number;    // 0 for 1-2 months
  oneMonthBasis30s: number;        // the 1-month 30s package price for selected buses
  pricingMethod: '1month' | '2month' | 'duration-discount';
}

// ============================================================
// MAIN CALCULATION FUNCTION
// ============================================================
export function calculatePrice(
  buses: number,
  months: number,
  videoDurationSeconds: number,
): PricingResult {
  // --- Validate inputs ---
  const b = Math.max(1, Math.min(MAX_BUSES, Math.round(buses)));
  const m = Math.max(1, Math.min(MAX_MONTHS, Math.round(months)));
  const s = Math.max(1, videoDurationSeconds);

  const durationMultiplier = getDurationMultiplier(s);

  // Standard undiscounted price: 75 * videoDurationSeconds * numberOfBuses * numberOfMonths
  const standardPrice = Math.round(
    STANDARD_RATE_PER_SECOND * s * b * m
  );

  let packagePrice30s: number;
  let pricingMethod: PricingResult['pricingMethod'];
  let durationDiscountRate = 0;

  if (m === 1) {
    packagePrice30s = ONE_MONTH_PACKAGE_PRICES[b] ?? (STANDARD_PRICE_PER_BUS_PER_MONTH_30S * b);
    pricingMethod = '1month';
  } else if (m === 2) {
    packagePrice30s = TWO_MONTH_PACKAGE_PRICES[b] ?? (STANDARD_PRICE_PER_BUS_PER_MONTH_30S * b * 2);
    pricingMethod = '2month';
  } else {
    // 3–12 months: use 1-month package × months × (1 - duration discount)
    const oneMonthBase30s = ONE_MONTH_PACKAGE_PRICES[b] ?? (STANDARD_PRICE_PER_BUS_PER_MONTH_30S * b);
    durationDiscountRate = getDurationDiscountRate(m);
    packagePrice30s = oneMonthBase30s * m * (1 - durationDiscountRate);
    pricingMethod = 'duration-discount';
  }

  // Calculate final package price with clean commercial rounding
  let packagePrice: number;
  if ((m === 1 || m === 2) && s === BASE_VIDEO_DURATION_SECONDS) {
    // Approved source-of-truth tariff tables are already canonical
    packagePrice = packagePrice30s;
  } else {
    packagePrice = roundCommercialPrice(packagePrice30s * durationMultiplier);
  }

  // Derived values
  const savings = standardPrice - packagePrice;
  const savingsPercentage = standardPrice > 0
    ? parseFloat(((savings / standardPrice) * 100).toFixed(2))
    : 0;

  // Unit economics (use final packagePrice for accuracy)
  const pricePerBusCampaign     = packagePrice / b;
  const pricePerBusMonth        = packagePrice / (b * m);
  const pricePerBusDay          = packagePrice / (b * m * PRICING_DAYS_PER_MONTH);
  const pricePerSecondBusMonth  = packagePrice / (b * m * s);
  const pricePerSecondBusCampaign = packagePrice / (b * s);

  const oneMonthBasis30s = ONE_MONTH_PACKAGE_PRICES[b] ?? (STANDARD_PRICE_PER_BUS_PER_MONTH_30S * b);

  return {
    buses: b,
    months: m,
    videoDurationSeconds: s,
    standardPrice,
    packagePrice,
    savings,
    savingsPercentage,
    pricePerBusCampaign,
    pricePerBusMonth,
    pricePerBusDay,
    pricePerSecondBusMonth,
    pricePerSecondBusCampaign,
    durationMultiplier,
    durationDiscountRate,
    oneMonthBasis30s,
    pricingMethod,
  };
}

// ============================================================
// VALIDATION: Ensure effective monthly price doesn't increase
// as campaign duration grows (for a given buses/duration)
// ============================================================
export function validatePricingMonotonicity(
  buses: number,
  videoDurationSeconds: number,
): { valid: boolean; violatingMonths: number[] } {
  const violatingMonths: number[] = [];
  let prevEffectiveMonthly = Infinity;

  for (let m = 1; m <= MAX_MONTHS; m++) {
    const result = calculatePrice(buses, m, videoDurationSeconds);
    const effectiveMonthly = result.pricePerBusMonth;
    if (effectiveMonthly > prevEffectiveMonthly + 0.01) {
      violatingMonths.push(m);
    }
    prevEffectiveMonthly = effectiveMonthly;
  }

  return { valid: violatingMonths.length === 0, violatingMonths };
}

// ============================================================
// CURRENCY FORMATTING — Indian numbering system
// ============================================================
export function formatINR(
  amount: number,
  options: { decimals?: number; compact?: boolean } = {}
): string {
  const { decimals = 0, compact = false } = options;

  if (compact) {
    if (amount >= 10_00_000) {
      return `₹${(amount / 10_00_000).toFixed(2)}L`;
    }
    if (amount >= 1_00_000) {
      return `₹${(amount / 1_00_000).toFixed(2)}L`;
    }
    if (amount >= 1_000) {
      return `₹${(amount / 1_000).toFixed(1)}K`;
    }
  }

  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `₹${formatted}`;
}

export function formatINR2(amount: number): string {
  return formatINR(amount, { decimals: 2 });
}

// ============================================================
// QUICK-SELECT OPTIONS
// ============================================================
export const COMMON_VIDEO_DURATIONS = [10, 15, 20, 30, 45, 60, 90];
export const COMMON_MONTH_OPTIONS = [1, 2, 3, 6, 12];
export const COMMON_BUS_OPTIONS = Array.from({ length: MAX_BUSES }, (_, i) => i + 1);
