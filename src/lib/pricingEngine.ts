// ============================================================
// CATGORITHM PRICING ENGINE — SOURCE OF TRUTH
// All pricing calculations live here. Never hardcode prices
// in UI components. Always import from this module.
// ============================================================

export const STANDARD_PRICE_PER_BUS_PER_MONTH_30S = 2000; // INR
export const BASE_VIDEO_DURATION_SECONDS = 30;
export const MAX_BUSES = 10;
export const MAX_MONTHS = 12;
export const PRICING_DAYS_PER_MONTH = 30;

// ------------------------------------------------------------
// ONE-MONTH PACKAGE PRICES (total for all buses, 30s ad)
// These are the approved source-of-truth values.
// ------------------------------------------------------------
export const ONE_MONTH_PACKAGE_PRICES: Record<number, number> = {
  1:  2000,
  2:  3900,
  3:  5700,
  4:  7400,
  5:  9000,
  6:  10800,
  7:  12600,
  8:  14400,
  9:  15750,
  10: 17500,
};

// ------------------------------------------------------------
// TWO-MONTH PACKAGE PRICES (total for all buses, 30s ad)
// ------------------------------------------------------------
export const TWO_MONTH_PACKAGE_PRICES: Record<number, number> = {
  1:  3800,
  2:  7200,
  3:  10500,
  4:  14000,
  5:  17000,
  6:  20000,
  7:  23000,
  8:  26000,
  9:  29000,
  10: 32000,
};

// ------------------------------------------------------------
// DURATION DISCOUNT TABLE (for campaigns 3–12 months)
// Applied to (oneMonthPackagePrice × numberOfMonths)
// ------------------------------------------------------------
export interface DurationDiscountRule {
  minMonths: number;
  maxMonths: number;
  discountRate: number; // 0.0 – 1.0
}

export const DURATION_DISCOUNT_RULES: DurationDiscountRule[] = [
  { minMonths: 3,  maxMonths: 3,  discountRate: 0.12 },
  { minMonths: 4,  maxMonths: 5,  discountRate: 0.15 },
  { minMonths: 6,  maxMonths: 8,  discountRate: 0.20 },
  { minMonths: 9,  maxMonths: 11, discountRate: 0.23 },
  { minMonths: 12, maxMonths: 12, discountRate: 0.25 },
];

// ------------------------------------------------------------
// PRIVATE — negotiated floor (Internal sales head reference)
// ------------------------------------------------------------
export const PRIVATE_NEGOTIATED_FLOOR_10BUS_2MONTH_30S = 30000;

export function getNegotiationFloor(buses: number, months: number, videoDurationSeconds: number): number | null {
  // Only defined for 10 buses, 2 months as per spec
  if (buses === 10 && months === 2) {
    const durMultiplier = getDurationMultiplier(videoDurationSeconds);
    return Math.round(PRIVATE_NEGOTIATED_FLOOR_10BUS_2MONTH_30S * durMultiplier);
  }
  return null;
}

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
  const rule = DURATION_DISCOUNT_RULES.find(
    (r) => months >= r.minMonths && months <= r.maxMonths
  );
  return rule ? rule.discountRate : 0;
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
  standardPrice: number;           // undiscounted comparison price
  packagePrice: number;            // final customer price (rounded)
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

  // Standard undiscounted price
  const standardPrice = Math.round(
    STANDARD_PRICE_PER_BUS_PER_MONTH_30S * b * m * durationMultiplier
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
    // 3–12 months: use 1-month package × months × duration discount
    const oneMonthBase30s = ONE_MONTH_PACKAGE_PRICES[b] ?? (STANDARD_PRICE_PER_BUS_PER_MONTH_30S * b);
    durationDiscountRate = getDurationDiscountRate(m);
    packagePrice30s = oneMonthBase30s * m * (1 - durationDiscountRate);
    pricingMethod = 'duration-discount';
  }

  // Apply video duration multiplier and round to nearest whole rupee
  const packagePrice = Math.round(packagePrice30s * durationMultiplier);

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
    if (effectiveMonthly > prevEffectiveMonthly) {
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
