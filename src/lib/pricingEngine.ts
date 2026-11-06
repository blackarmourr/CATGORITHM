// ============================================================
// CATGORITHM PRICING ENGINE — SOURCE OF TRUTH
// Unified Pricing Engine for Monthly and Long-Term Campaigns.
//
// Reference Basis (10 Buses, 30-Second Video Ad):
// 1. Actual Price (Original Tariff):
//    - ₹2,500 per bus per month (₹25,000 / month for 10 buses)
//
// 2. Normal Selling Price:
//    - Exact scale from 1 month (₹20,000) to 12 months (₹2,16,000 / ₹1,800 per bus per month)
//
// 3. Festival Season Pricing:
//    - Active when festival toggle is ON and video duration >= 20 seconds.
//    - Headline offers: 3 Months (₹50,000), 6 Months (₹1,00,000), 12 Months (₹2,00,000).
//    - Modest discounts on all other durations.
//
// 4. Manual Price Overrides & Additional Discounts:
//    - Manual Final Price overrides automatic prices.
//    - Additional Manual Discount subtracted from price.
//
// 5. Rounding:
//    - Whole rupees only, rounded to nearest multiple of ₹5. No decimals.
// ============================================================

export const STANDARD_BASE_PRICE_30S = 2500; // ₹2,500 base actual price for 30s ad per bus per month
export const BASE_VIDEO_DURATION_SECONDS = 30;
export const STANDARD_RATE_PER_SECOND = STANDARD_BASE_PRICE_30S / BASE_VIDEO_DURATION_SECONDS; // ₹83.3333... per second
export const STANDARD_PRICE_PER_BUS_PER_MONTH_30S = STANDARD_BASE_PRICE_30S; // ₹2,500
export const MAX_BUSES = 10;
export const MAX_MONTHS = 12;
export const PRICING_DAYS_PER_MONTH = 30;

// ------------------------------------------------------------
// REFERENCE NORMAL SELLING PRICES (10 Buses, 30s Video Ad)
// ------------------------------------------------------------
export const NORMAL_SELLING_PRICE_10_BUSES_30S: Record<number, number> = {
  1:  20000,
  2:  37500,
  3:  55500,
  4:  73800,
  5:  92000,
  6:  110000,
  7:  127960,
  8:  145760,
  9:  163440,
  10: 181000,
  11: 198550,
  12: 216000,
};

// ------------------------------------------------------------
// REFERENCE FESTIVAL SEASON PRICES (10 Buses, 30s Video Ad)
// Active when Festival Toggle is ON and Duration >= 20s
// Special promotional pricing exclusively for 3, 6, and 12 months.
// 1 and 2 months retain exact same normal pricing.
// ------------------------------------------------------------
export const FESTIVAL_PRICE_10_BUSES_30S: Record<number, number> = {
  1:  20000,  // Exact same as normal (no festival discount for 1 month)
  2:  37500,  // Exact same as normal (no festival discount for 2 months)
  3:  50000,  // PRIMARY FESTIVAL OFFER (Normal ₹55,500 -> Save ₹5,500)
  4:  73800,  // Normal selling price
  5:  92000,  // Normal selling price
  6:  100000, // BEST VALUE FESTIVAL OFFER (Normal ₹1,10,000 -> Save ₹10,000)
  7:  127960, // Normal selling price
  8:  145760, // Normal selling price
  9:  163440, // Normal selling price
  10: 181000, // Normal selling price
  11: 198550, // Normal selling price
  12: 200000, // MAXIMUM SAVINGS FESTIVAL OFFER (Normal ₹2,16,000 -> Save ₹16,000)
};

// ------------------------------------------------------------
// APPROVED 1-MONTH AND 2-MONTH TARIFF TABLES
// Exact approved per-bus package tariffs for 1-month & 2-month campaigns.
// 1 bus, 1 month, 30s = ₹2,250 (both normal and festival).
// 10 buses, 2 months, 30s = ₹37,500 (both normal and festival).
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

export const TWO_MONTH_PACKAGE_PRICES: Record<number, number> = {
  1:  4250,
  2:  8200,
  3:  12000,
  4:  15800,
  5:  19500,
  6:  23200,
  7:  26800,
  8:  30400,
  9:  34000,
  10: 37500,
};

export const MONTHLY_DURATION_DISCOUNT_RATES: Record<number, number> = {
  3:  0.100,
  4:  0.125,
  5:  0.125,
  6:  0.125,
  7:  0.125,
  8:  0.125,
  9:  0.125,
  10: 0.125,
  11: 0.125,
  12: 0.125,
};

export interface DurationDiscountRule {
  minMonths: number;
  maxMonths: number;
  discountRate: number;
}

export const DURATION_DISCOUNT_RULES: DurationDiscountRule[] = [
  { minMonths: 3,  maxMonths: 3,  discountRate: 0.100 },
  { minMonths: 4,  maxMonths: 4,  discountRate: 0.125 },
  { minMonths: 5,  maxMonths: 5,  discountRate: 0.125 },
  { minMonths: 6,  maxMonths: 6,  discountRate: 0.125 },
  { minMonths: 7,  maxMonths: 7,  discountRate: 0.125 },
  { minMonths: 8,  maxMonths: 8,  discountRate: 0.125 },
  { minMonths: 9,  maxMonths: 9,  discountRate: 0.125 },
  { minMonths: 10, maxMonths: 10, discountRate: 0.125 },
  { minMonths: 11, maxMonths: 11, discountRate: 0.125 },
  { minMonths: 12, maxMonths: 12, discountRate: 0.125 },
];

// ------------------------------------------------------------
// INTERNAL PROFITABILITY REFERENCE (Operating cost metrics)
// ------------------------------------------------------------
export const INTERNAL_PROFITABILITY_METRICS = {
  monthlyOperatingExpensePerBus: 18600,
  advertisingCapacityPerCycleSeconds: 450,
  cyclesPerDay: 45,
  operatingDaysPerMonth: 30,
  totalMonthlyCapacitySeconds: 607500, // 450 * 45 * 30
  operatingCostPerSecond: 18600 / 607500, // ~0.03061728
  monthlySlotTime30s: 40500, // 30s * 45 * 30
  minCost15SlotsSold: 1240,
  minCost10SlotsSold: 1860,
};

/**
 * Rounds any commercial amount to the nearest multiple of ₹5.
 * Strictly avoids decimal places.
 */
export function roundToNearest5(val: number): number {
  if (val <= 0) return 0;
  return Math.round(val / 5) * 5;
}

/**
 * Clean commercial sales rounding:
 * Strictly eliminates odd tens and singles so prices always end in 00 or 50.
 * Preserves clean milestone increments:
 * - Exact ₹250 or ₹500 multiples stay intact
 * - < 2,500: nearest ₹50 (e.g. ₹1,400, ₹2,050)
 * - < 15,000: nearest ₹100 (e.g. ₹3,900, ₹4,100, ₹6,100, ₹7,900, ₹11,800)
 * - < 50,000: nearest ₹500 (e.g. ₹23,500, ₹37,500)
 * - >= 50,000: nearest ₹1,000 / ₹500 (e.g. ₹55,000, ₹1,10,000, ₹2,16,000)
 */
export function roundCommercialPrice(amount: number): number {
  if (amount <= 0) return 0;
  const rounded = Math.round(amount);

  // Exact clean milestones stay intact
  if (rounded % 250 === 0) return rounded;
  if (rounded % 500 === 0) return rounded;

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

export function getDurationMultiplier(videoDurationSeconds: number): number {
  return videoDurationSeconds / BASE_VIDEO_DURATION_SECONDS;
}

export function getDurationDiscountRate(months: number): number {
  if (months < 3) return 0;
  return MONTHLY_DURATION_DISCOUNT_RATES[months] ?? 0.10;
}

// ============================================================
// CORE PRICING RESULT TYPE
// ============================================================
export interface PricingResult {
  // Inputs
  buses: number;
  months: number;
  videoDurationSeconds: number;

  // 1. Actual Price (Original tariff before discounts)
  actualPrice: number;
  // 2. Normal Selling Price (Regular discounted price)
  normalPrice: number;
  // 3. Festival Offer Price (Special promotional price when festival toggle is enabled)
  festivalPrice: number;

  // Festival status & eligibility
  isEligibleForFestival: boolean;  // Video duration >= 20 seconds
  isFestivalActive: boolean;       // Toggle is ON
  festivalOfferName?: 'Primary Offer' | 'Best Value Offer' | 'Maximum Savings Offer' | 'Seasonal Offer';

  // Manual Overrides
  manualPriceOverride: number | null;
  manualDiscount: number;
  isManualPriceActive: boolean;
  isManualDiscountActive: boolean;

  // Final Campaign Price
  finalPrice: number;
  packagePrice: number;            // Alias to finalPrice (100% backward compatibility)
  standardPrice: number;           // Alias to actualPrice (100% backward compatibility)

  // Savings
  savings: number;                 // actualPrice - finalPrice
  savingsPercentage: number;       // (savings / actualPrice) * 100

  // Unit Economics
  pricePerBusCampaign: number;     // finalPrice / buses
  pricePerBusMonth: number;        // finalPrice / (buses * months)
  pricePerBusDay: number;          // finalPrice / (buses * months * 30)
  pricePerSecondBusMonth: number;  // finalPrice / (buses * months * seconds)
  pricePerSecondBusCampaign: number; // finalPrice / (buses * seconds)

  durationMultiplier: number;
  busMultiplier: number;
  durationDiscountRate: number;
  oneMonthBasis30s: number;
  pricingMethod: 'normal' | 'festival' | 'manual-override';
}

export interface PricingCalculationOptions {
  isFestivalPricing?: boolean;
  manualPriceOverride?: number | null;
  manualDiscount?: number;
}

// ============================================================
// MAIN CALCULATION FUNCTION
// ============================================================
export function calculatePrice(
  buses: number,
  months: number,
  videoDurationSeconds: number,
  options: PricingCalculationOptions = {}
): PricingResult {
  const b = Math.max(1, Math.min(MAX_BUSES, Math.round(buses)));
  const m = Math.max(1, Math.min(MAX_MONTHS, Math.round(months)));
  const s = Math.max(10, Math.round(videoDurationSeconds)); // Min 10s

  const isFestivalActive = Boolean(options.isFestivalPricing);
  const manualOverride = options.manualPriceOverride != null && !isNaN(options.manualPriceOverride)
    ? Math.max(0, Math.round(options.manualPriceOverride))
    : null;
  const manualDiscount = options.manualDiscount != null && !isNaN(options.manualDiscount)
    ? Math.max(0, Math.round(options.manualDiscount))
    : 0;

  const durationMultiplier = s / BASE_VIDEO_DURATION_SECONDS;
  const busMultiplier = b / 10;

  // 1. Actual Price: ₹2,500/bus/mo for 30s ad -> ₹25,000 * m for 10 buses
  const rawActual = STANDARD_PRICE_PER_BUS_PER_MONTH_30S * 10 * m * durationMultiplier * busMultiplier;
  const actualPrice = roundToNearest5(rawActual);

  // 2. Normal Selling Price
  let normalPrice: number;
  if (m === 1) {
    // 1-month campaign uses approved exact tariff table (1 bus @ 30s = ₹2,250, 10 buses = ₹20,000)
    const base30s = ONE_MONTH_PACKAGE_PRICES[b] ?? (20000 * busMultiplier);
    if (b >= 8) {
      normalPrice = Math.round((base30s * durationMultiplier) / 100) * 100;
    } else {
      normalPrice = roundCommercialPrice(base30s * durationMultiplier);
    }
  } else if (m === 2) {
    // 2-month campaign uses approved exact tariff table (1 bus @ 30s = ₹4,250, 10 buses = ₹37,500)
    const base30s = TWO_MONTH_PACKAGE_PRICES[b] ?? (37500 * busMultiplier);
    normalPrice = roundCommercialPrice(base30s * durationMultiplier);
  } else {
    // 3–12 months
    if (b >= 8) {
      // 8-10 buses: scaled from approved 10-bus benchmarks (₹55,500 for 3m, ₹1,10,000 for 6m, ₹2,16,000 for 12m)
      const refNormal = NORMAL_SELLING_PRICE_10_BUSES_30S[m] ?? ((216000 / 12) * m);
      const rawNormal = refNormal * durationMultiplier * busMultiplier;
      normalPrice = Math.round(rawNormal / 100) * 100;
    } else {
      // Below 8 buses (1 to 7 buses): preserves dedicated package tariff with higher margins
      const oneMonthBase30s = ONE_MONTH_PACKAGE_PRICES[b] ?? (STANDARD_PRICE_PER_BUS_PER_MONTH_30S * b);
      const discountRate = getDurationDiscountRate(m);
      const packagePrice30s = oneMonthBase30s * m * (1 - discountRate);
      normalPrice = roundCommercialPrice(packagePrice30s * durationMultiplier);
    }
  }

  // 3. Festival Offer Price
  // Festival discount applies strictly to 3, 6, and 12-month packages with ad duration >= 20s
  // AND exclusively for campaigns with 8 or more buses (b >= 8).
  // Below 8 buses, campaigns retain their exact normal pricing.
  const isFestivalMonth = m === 3 || m === 6 || m === 12;
  const isEligibleForFestival = s >= 20 && isFestivalMonth && b >= 8;
  let festivalPrice = normalPrice;
  let festivalOfferName: PricingResult['festivalOfferName'] = undefined;

  if (isEligibleForFestival) {
    const refFestival = FESTIVAL_PRICE_10_BUSES_30S[m];
    festivalPrice = Math.round((refFestival * durationMultiplier * busMultiplier) / 100) * 100;
    if (m === 3) festivalOfferName = 'Primary Offer';
    else if (m === 6) festivalOfferName = 'Best Value Offer';
    else if (m === 12) festivalOfferName = 'Maximum Savings Offer';
  }

  // 4. Automatic base price selection
  const autoPrice = isFestivalActive && isEligibleForFestival ? festivalPrice : normalPrice;

  // 5. Apply Manual Price Override & Manual Discount
  const isManualPriceActive = manualOverride !== null && manualOverride > 0;
  const isManualDiscountActive = manualDiscount > 0;

  const effectiveBase = isManualPriceActive ? roundCommercialPrice(manualOverride!) : autoPrice;
  const finalPrice = Math.max(0, effectiveBase - manualDiscount);

  // Determine pricing method
  let pricingMethod: PricingResult['pricingMethod'] = 'normal';
  if (isManualPriceActive) {
    pricingMethod = 'manual-override';
  } else if (isFestivalActive && isEligibleForFestival) {
    pricingMethod = 'festival';
  }

  // Derived metrics
  const savings = Math.max(0, actualPrice - finalPrice);
  const savingsPercentage = actualPrice > 0
    ? parseFloat(((savings / actualPrice) * 100).toFixed(2))
    : 0;

  const pricePerBusCampaign = roundCommercialPrice(finalPrice / b);
  const pricePerBusMonth = roundCommercialPrice(finalPrice / (b * m));
  const pricePerBusDay = finalPrice / (b * m * PRICING_DAYS_PER_MONTH);
  const pricePerSecondBusMonth = finalPrice / (b * m * s);
  const pricePerSecondBusCampaign = finalPrice / (b * s);
  const oneMonthBasis30s = ONE_MONTH_PACKAGE_PRICES[b] ?? 20000;

  return {
    buses: b,
    months: m,
    videoDurationSeconds: s,
    actualPrice,
    normalPrice,
    festivalPrice,
    isEligibleForFestival,
    isFestivalActive,
    festivalOfferName,
    manualPriceOverride: manualOverride,
    manualDiscount,
    isManualPriceActive,
    isManualDiscountActive,
    finalPrice,
    packagePrice: finalPrice,
    standardPrice: actualPrice,
    savings,
    savingsPercentage,
    pricePerBusCampaign,
    pricePerBusMonth,
    pricePerBusDay,
    pricePerSecondBusMonth,
    pricePerSecondBusCampaign,
    durationMultiplier,
    busMultiplier,
    durationDiscountRate: getDurationDiscountRate(m),
    oneMonthBasis30s,
    pricingMethod,
  };
}

export function calculatePricing(options: {
  buses: number;
  months: number;
  videoDurationSeconds: number;
  isFestivalPricing?: boolean;
  manualPriceOverride?: number | null;
  manualDiscount?: number;
}): PricingResult {
  return calculatePrice(
    options.buses,
    options.months,
    options.videoDurationSeconds,
    {
      isFestivalPricing: options.isFestivalPricing,
      manualPriceOverride: options.manualPriceOverride,
      manualDiscount: options.manualDiscount,
    }
  );
}

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

export const COMMON_VIDEO_DURATIONS = [10, 15, 20, 30, 45, 60, 90];
export const COMMON_MONTH_OPTIONS = [1, 2, 3, 6, 12];
export const COMMON_BUS_OPTIONS = Array.from({ length: MAX_BUSES }, (_, i) => i + 1);
