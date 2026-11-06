// Comprehensive Verification Script for Catgorithm Revised Pricing System
import { calculatePrice } from './src/lib/pricingEngine.ts';
import { calculateCustomPrice, getDailyPricePerBus } from './src/lib/customPricingEngine.ts';

console.log('=== CATGORITHM REVISED PRICING SYSTEM VERIFICATION ===\n');

let allPassed = true;

function assert(condition, message, details) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
    if (details) console.error('   Details:', details);
    allPassed = false;
  }
}

// -------------------------------------------------------------
// 1. CUSTOM PACKAGE CALCULATOR – DAILY PRICING (Per Bus)
// -------------------------------------------------------------
console.log('\n--- 1. CUSTOM PACKAGE CALCULATOR: DAILY PRICING ---');
assert(getDailyPricePerBus(10) === 100, '10s daily price is ₹100', getDailyPricePerBus(10));
assert(getDailyPricePerBus(20) === 140, '20s daily price is ₹140', getDailyPricePerBus(20));
assert(getDailyPricePerBus(30) === 175, '30s daily price is ₹175', getDailyPricePerBus(30));
assert(getDailyPricePerBus(40) === 215, '40s daily price is ₹215', getDailyPricePerBus(40));
assert(getDailyPricePerBus(50) === 250, '50s daily price is ₹250', getDailyPricePerBus(50));
assert(getDailyPricePerBus(60) === 290, '60s daily price is ₹290', getDailyPricePerBus(60));

// Minimum duration clamp (no ads < 10s allowed)
assert(getDailyPricePerBus(5) === 100, 'Duration <10s clamped to minimum 10s rate (₹100)', getDailyPricePerBus(5));

// -------------------------------------------------------------
// 2. CUSTOM PACKAGE CALCULATOR – CAMPAIGN DURATION PRICING (30s)
// -------------------------------------------------------------
console.log('\n--- 2. CUSTOM PACKAGE CALCULATOR: CAMPAIGN DURATION (30s Ad, 1 Bus) ---');
const c1 = calculateCustomPrice(1, 1, 30);
assert(c1.totalPrice === 175, '1 Day @ 30s: ₹175', c1.totalPrice);

const c2 = calculateCustomPrice(1, 2, 30);
assert(c2.totalPrice === 350, '2 Days @ 30s: ₹350', c2.totalPrice);

const c3 = calculateCustomPrice(1, 3, 30);
assert(c3.totalPrice === 525, '3 Days @ 30s: ₹525', c3.totalPrice);

const c4 = calculateCustomPrice(1, 4, 30);
assert(c4.totalPrice === 700, '4 Days @ 30s: ₹700', c4.totalPrice);

const c5 = calculateCustomPrice(1, 5, 30);
assert(c5.totalPrice === 875, '5 Days @ 30s: ₹875', c5.totalPrice);

const c6 = calculateCustomPrice(1, 6, 30);
assert(c6.totalPrice === 1050, '6 Days @ 30s: ₹1,050', c6.totalPrice);

const c7 = calculateCustomPrice(1, 7, 30);
assert(c7.totalPrice === 1050, '7 Days @ 30s: ₹1,050 (6 days charge, 1 day free)', c7.totalPrice);
assert(c7.standardPrice === 1225, '7 Days @ 30s: Standard tariff is ₹1,225', c7.standardPrice);

const c14 = calculateCustomPrice(1, 14, 30);
assert(c14.totalPrice === 1500, '14 Days @ 30s: ₹1,500', c14.totalPrice);
assert(c14.standardPrice === 1850, '14 Days @ 30s: Standard tariff is ₹1,850', c14.standardPrice);

const c21 = calculateCustomPrice(1, 21, 30);
assert(c21.totalPrice === 1875, '21 Days @ 30s: ₹1,875', c21.totalPrice);
assert(c21.standardPrice === 2250, '21 Days @ 30s: Standard tariff is ₹2,250 (< ₹2,500 ceiling)', c21.standardPrice);

const c30 = calculateCustomPrice(1, 30, 30);
assert(c30.totalPrice === 2250, '30 Days @ 30s: ₹2,250', c30.totalPrice);
assert(c30.standardPrice === 2500, '30 Days @ 30s: Standard tariff strikes off ₹2,500 (not ₹5,250)', c30.standardPrice);

// Custom Calculator Fleet Scaling Tests
const c14_2b = calculateCustomPrice(2, 14, 30);
assert(c14_2b.totalPrice === 2900, '14 Days @ 2 buses: ₹2,900 (Fleet discount vs ₹3,000)', c14_2b.totalPrice);

const c14_10b = calculateCustomPrice(10, 14, 30);
assert(c14_10b.totalPrice === 13335, '14 Days @ 10 buses: ₹13,335 (Fleet discount vs ₹15,000)', c14_10b.totalPrice);

const c30_10b = calculateCustomPrice(10, 30, 30);
assert(c30_10b.totalPrice === 20000, '30 Days @ 10 buses: Exactly ₹20,000 (Matches standard calculator ₹20,000, not ₹22,500)', c30_10b.totalPrice);
assert(c30_10b.standardPrice === 25000, '30 Days @ 10 buses: Standard tariff is ₹25,000', c30_10b.standardPrice);

// Multi-month synchronization across both calculators (2, 3, 6, 12 Months)
console.log('\n--- 2b. CUSTOM CALCULATOR: MULTI-MONTH SYNCHRONIZATION WITH MAIN CALCULATOR ---');
// 60 Days (2 Months)
const c60_10b = calculateCustomPrice(10, 60, 30);
assert(c60_10b.totalPrice === 37500, '60 Days (2m) @ 10 buses, 30s: ₹37,500 (Matches Main Calculator)', c60_10b.totalPrice);
assert(c60_10b.standardPrice === 50000, '60 Days (2m) @ 10 buses, 30s: Actual tariff is ₹50,000', c60_10b.standardPrice);

const c60_1b = calculateCustomPrice(1, 60, 30);
assert(c60_1b.totalPrice === 4250, '60 Days (2m) @ 1 bus, 30s: ₹4,250 (Matches Main Calculator)', c60_1b.totalPrice);

const c60_5b = calculateCustomPrice(5, 60, 30);
assert(c60_5b.totalPrice === 19500, '60 Days (2m) @ 5 buses, 30s: ₹19,500 (Matches Main Calculator)', c60_5b.totalPrice);

// 90 Days (3 Months)
const c90_10b = calculateCustomPrice(10, 90, 30);
assert(c90_10b.totalPrice === 55500, '90 Days (3m) @ 10 buses, 30s: ₹55,500 (Matches Main Calculator)', c90_10b.totalPrice);
assert(c90_10b.standardPrice === 75000, '90 Days (3m) @ 10 buses, 30s: Actual tariff is ₹75,000', c90_10b.standardPrice);

const c90_1b = calculateCustomPrice(1, 90, 30);
assert(c90_1b.totalPrice === 5550, '90 Days (3m) @ 1 bus, 30s: ₹5,550 (Matches Main Calculator)', c90_1b.totalPrice);

const c90_5b = calculateCustomPrice(5, 90, 30);
assert(c90_5b.totalPrice === 27750, '90 Days (3m) @ 5 buses, 30s: ₹27,750 (Matches Main Calculator)', c90_5b.totalPrice);

// 180 Days (6 Months)
const c180_10b = calculateCustomPrice(10, 180, 30);
assert(c180_10b.totalPrice === 110000, '180 Days (6m) @ 10 buses, 30s: ₹1,10,000 (Matches Main Calculator)', c180_10b.totalPrice);
assert(c180_10b.standardPrice === 150000, '180 Days (6m) @ 10 buses, 30s: Actual tariff is ₹1,50,000', c180_10b.standardPrice);

const c180_1b = calculateCustomPrice(1, 180, 30);
assert(c180_1b.totalPrice === 11000, '180 Days (6m) @ 1 bus, 30s: ₹11,000 (Matches Main Calculator)', c180_1b.totalPrice);

// 360 Days (12 Months)
const c360_10b = calculateCustomPrice(10, 360, 30);
assert(c360_10b.totalPrice === 216000, '360 Days (12m) @ 10 buses, 30s: ₹2,16,000 (Matches Main Calculator)', c360_10b.totalPrice);
assert(c360_10b.standardPrice === 300000, '360 Days (12m) @ 10 buses, 30s: Actual tariff is ₹3,00,000', c360_10b.standardPrice);

const c360_1b = calculateCustomPrice(1, 360, 30);
assert(c360_1b.totalPrice === 21600, '360 Days (12m) @ 1 bus, 30s: ₹21,600 (Matches Main Calculator)', c360_1b.totalPrice);

const c360_5b = calculateCustomPrice(5, 360, 30);
assert(c360_5b.totalPrice === 108000, '360 Days (12m) @ 5 buses, 30s: ₹1,08,000 (Matches Main Calculator)', c360_5b.totalPrice);

// Duration variations sync (10s, 20s, 60s)
const c60_10b_10s = calculateCustomPrice(10, 60, 10);
assert(c60_10b_10s.totalPrice === 12500, '60 Days (2m) @ 10 buses, 10s: ₹12,500 (Matches Main Calculator)', c60_10b_10s.totalPrice);

const c90_10b_20s = calculateCustomPrice(10, 90, 20);
assert(c90_10b_20s.totalPrice === 37000, '90 Days (3m) @ 10 buses, 20s: ₹37,000 (Matches Main Calculator)', c90_10b_20s.totalPrice);

const c180_5b_60s = calculateCustomPrice(5, 180, 60);
assert(c180_5b_60s.totalPrice === 110000, '180 Days (6m) @ 5 buses, 60s: ₹1,10,000 (Matches Main Calculator)', c180_5b_60s.totalPrice);

// -------------------------------------------------------------
// 3. MAIN CALCULATOR – NORMAL PRICING (10 Buses, 30s)
// -------------------------------------------------------------
console.log('\n--- 3. MAIN CALCULATOR: NORMAL PRICING (10 Buses, 30s) ---');
const expectedNormal = {
  1: 20000,
  2: 37500,
  3: 55500,
  4: 73800,
  5: 92000,
  6: 110000,
  7: 127960,
  8: 145760,
  9: 163440,
  10: 181000,
  11: 198550,
  12: 216000,
};

for (const [mStr, expVal] of Object.entries(expectedNormal)) {
  const m = Number(mStr);
  const res = calculatePrice(10, m, 30);
  assert(res.normalPrice === expVal, `${m} Month(s) @ 10b, 30s: Normal price is ₹${expVal.toLocaleString('en-IN')}`, res.normalPrice);
  assert(res.actualPrice === 25000 * m, `${m} Month(s) @ 10b, 30s: Actual tariff is ₹${(25000 * m).toLocaleString('en-IN')}`, res.actualPrice);
}

// -------------------------------------------------------------
// 4. MAIN CALCULATOR – FESTIVAL SEASON PRICING
// -------------------------------------------------------------
console.log('\n--- 4. MAIN CALCULATOR: FESTIVAL SEASON PRICING ---');
// 1 Month: 1 Bus, 30s: ₹2,250 for both Normal and Festival (No festival discount)
const m1_1b_norm = calculatePrice(1, 1, 30, { isFestivalPricing: false });
const m1_1b_fest = calculatePrice(1, 1, 30, { isFestivalPricing: true });
assert(m1_1b_norm.packagePrice === 2250, '1 Month, 1 Bus, 30s: Normal price is ₹2,250', m1_1b_norm.packagePrice);
assert(m1_1b_fest.packagePrice === 2250, '1 Month, 1 Bus, 30s: Festival price is ₹2,250 (Identical, not ₹1,950)', m1_1b_fest.packagePrice);

// 1 Month: 10 Buses, 30s: ₹20,000 for both Normal and Festival
const m1_10b_fest = calculatePrice(10, 1, 30, { isFestivalPricing: true });
assert(m1_10b_fest.packagePrice === 20000, '1 Month, 10 Buses, 30s: Price is ₹20,000 (both normal & festival)', m1_10b_fest.packagePrice);

// 2 Months: 10 Buses, 30s: ₹37,500 for both Normal and Festival
const m2_10b_norm = calculatePrice(10, 2, 30, { isFestivalPricing: false });
const m2_10b_fest = calculatePrice(10, 2, 30, { isFestivalPricing: true });
assert(m2_10b_norm.packagePrice === 37500, '2 Months, 10 Buses, 30s: Normal price is ₹37,500', m2_10b_norm.packagePrice);
assert(m2_10b_fest.packagePrice === 37500, '2 Months, 10 Buses, 30s: Festival price is ₹37,500 (Identical)', m2_10b_fest.packagePrice);

// 2 Months: 1 Bus, 30s: ₹4,250 for both Normal and Festival
const m2_1b_fest = calculatePrice(1, 2, 30, { isFestivalPricing: true });
assert(m2_1b_fest.packagePrice === 4250, '2 Months, 1 Bus, 30s: Price is ₹4,250 (both normal & festival)', m2_1b_fest.packagePrice);

// 3 Months Primary Offer: ₹50,000 (Normal ₹55,500)
const norm3m = calculatePrice(10, 3, 30, { isFestivalPricing: false });
const fest3m = calculatePrice(10, 3, 30, { isFestivalPricing: true });
assert(norm3m.normalPrice === 55500, '3 Months Normal Price is ₹55,500', norm3m.normalPrice);
assert(fest3m.festivalPrice === 50000, '3 Months Festival Primary Offer is ₹50,000', fest3m.festivalPrice);
assert(fest3m.finalPrice === 50000, '3 Months Final Price with Festival ON is ₹50,000', fest3m.finalPrice);

// 6 Months Best Value Offer: ₹1,00,000 (Normal ₹1,10,000)
const norm6m = calculatePrice(10, 6, 30, { isFestivalPricing: false });
const fest6m = calculatePrice(10, 6, 30, { isFestivalPricing: true });
assert(norm6m.normalPrice === 110000, '6 Months Normal Price is ₹1,10,000', norm6m.normalPrice);
assert(fest6m.festivalPrice === 100000, '6 Months Festival Best Value Offer is ₹1,00,000', fest6m.festivalPrice);

// 12 Months Maximum Savings Offer: ₹2,00,000 (Normal ₹2,16,000)
const norm12m = calculatePrice(10, 12, 30, { isFestivalPricing: false });
const fest12m = calculatePrice(10, 12, 30, { isFestivalPricing: true });
assert(norm12m.normalPrice === 216000, '12 Months Normal Price is ₹2,16,000', norm12m.normalPrice);
assert(fest12m.festivalPrice === 200000, '12 Months Festival Maximum Savings Offer is ₹2,00,000', fest12m.festivalPrice);

// 4 Months: Non-festival month retains normal price (₹73,800)
const fest4m = calculatePrice(10, 4, 30, { isFestivalPricing: true });
assert(fest4m.finalPrice === 73800, '4 Months with Festival ON retains normal price ₹73,800', fest4m.finalPrice);

// Duration eligibility: < 20s must retain normal price
const festShort = calculatePrice(10, 3, 15, { isFestivalPricing: true });
assert(festShort.isEligibleForFestival === false, 'Ad duration < 20s is NOT eligible for festival discount', festShort.isEligibleForFestival);
assert(festShort.finalPrice === festShort.normalPrice, 'Ad duration < 20s retains normal price', festShort.finalPrice);

// Bus count threshold (Festival discount ONLY applies for b >= 8)
const fest1b_3m = calculatePrice(1, 3, 30, { isFestivalPricing: true });
assert(fest1b_3m.finalPrice === 5550, '1 Bus, 3m @ 30s with Festival ON retains normal rate ₹5,550 (not ₹1,665/mo)', fest1b_3m.finalPrice);

const fest5b_3m = calculatePrice(5, 3, 30, { isFestivalPricing: true });
assert(fest5b_3m.finalPrice === 27750, '5 Buses, 3m @ 30s with Festival ON retains normal rate ₹27,750', fest5b_3m.finalPrice);

const fest8b_3m = calculatePrice(8, 3, 30, { isFestivalPricing: true });
assert(fest8b_3m.finalPrice === 40000, '8 Buses, 3m @ 30s with Festival ON gets festival rate ₹40,000 (₹1,666.67/mo)', fest8b_3m.finalPrice);

// -------------------------------------------------------------
// 5. SCALING EXAMPLES FROM USER SPECIFICATION
// -------------------------------------------------------------
console.log('\n--- 5. SCALING EXAMPLES FROM SPECIFICATION ---');
// Ex 1: 20 seconds, 3 months, 10 buses (b >= 8)
const ex1 = calculatePrice(10, 3, 20, { isFestivalPricing: true });
assert(ex1.actualPrice === 50000, 'Ex 1: 20s, 3m, 10b Actual = ₹50,000', ex1.actualPrice);
assert(ex1.normalPrice === 37000, 'Ex 1: 20s, 3m, 10b Normal = ₹37,000', ex1.normalPrice);
assert(ex1.festivalPrice === 33335, 'Ex 1: 20s, 3m, 10b Festival = ₹33,335 (33,333.33 rounded to ₹5)', ex1.festivalPrice);

// Ex 2: 40 seconds, 3 months, 10 buses (b >= 8)
const ex2 = calculatePrice(10, 3, 40, { isFestivalPricing: true });
assert(ex2.actualPrice === 100000, 'Ex 2: 40s, 3m, 10b Actual = ₹1,00,000', ex2.actualPrice);
assert(ex2.normalPrice === 74000, 'Ex 2: 40s, 3m, 10b Normal = ₹74,000', ex2.normalPrice);
assert(ex2.festivalPrice === 66665, 'Ex 2: 40s, 3m, 10b Festival = ₹66,665 (66,666.67 rounded to ₹5)', ex2.festivalPrice);

// Ex 3: 30 seconds, 3 months, 8 buses (b >= 8)
const ex3 = calculatePrice(8, 3, 30, { isFestivalPricing: true });
assert(ex3.actualPrice === 60000, 'Ex 3: 30s, 3m, 8b Actual = ₹60,000', ex3.actualPrice);
assert(ex3.normalPrice === 44400, 'Ex 3: 30s, 3m, 8b Normal = ₹44,400', ex3.normalPrice);
assert(ex3.festivalPrice === 40000, 'Ex 3: 30s, 3m, 8b Festival = ₹40,000', ex3.festivalPrice);

// -------------------------------------------------------------
// 6. MANUAL PRICE OVERRIDE & MANUAL DISCOUNT
// -------------------------------------------------------------
console.log('\n--- 6. MANUAL OVERRIDES & DISCOUNTS ---');
// Ex 4: Manual Price Override
const ex4 = calculatePrice(10, 3, 30, { manualPriceOverride: 48000 });
assert(ex4.isManualPriceActive === true, 'Manual price is active', ex4.isManualPriceActive);
assert(ex4.finalPrice === 48000, 'Final price matches manual override ₹48,000', ex4.finalPrice);

// Ex 5: Additional Manual Discount
const ex5 = calculatePrice(10, 3, 30, { manualDiscount: 2500 });
assert(ex5.isManualDiscountActive === true, 'Manual discount is active', ex5.isManualDiscountActive);
assert(ex5.finalPrice === 53000, 'Final price is Normal ₹55,500 - ₹2,500 = ₹53,000', ex5.finalPrice);

// Ex 6: Both Manual Override and Manual Discount
const ex6 = calculatePrice(10, 3, 30, { manualPriceOverride: 48000, manualDiscount: 2500 });
assert(ex6.finalPrice === 45500, 'Both set: Manual ₹48,000 - ₹2,500 = ₹45,500', ex6.finalPrice);

console.log('\n----------------------------------------');
if (allPassed) {
  console.log('🎉 ALL REVISED PRICING SPECIFICATION BENCHMARKS PASSED PERFECTLY!\n');
  process.exit(0);
} else {
  console.error('💥 SOME BENCHMARKS FAILED!\n');
  process.exit(1);
}
