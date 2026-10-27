// Pricing engine verification tests
// Run with: node --input-type=module < test-pricing.mjs

// Inline the pricing engine logic for standalone test
const STANDARD = 2000;
const BASE_DURATION = 30;

const ONE_MONTH = {
  1: 2000, 2: 3900, 3: 5700, 4: 7400, 5: 9000,
  6: 10800, 7: 12600, 8: 14400, 9: 15750, 10: 17500,
};
const TWO_MONTH = {
  1: 3800, 2: 7200, 3: 10500, 4: 14000, 5: 17000,
  6: 20000, 7: 23000, 8: 26000, 9: 29000, 10: 32000,
};
const DISCOUNT_RULES = [
  { min: 3, max: 3, rate: 0.12 },
  { min: 4, max: 5, rate: 0.15 },
  { min: 6, max: 8, rate: 0.20 },
  { min: 9, max: 11, rate: 0.23 },
  { min: 12, max: 12, rate: 0.25 },
];

function getDiscountRate(m) {
  if (m < 3) return 0;
  const r = DISCOUNT_RULES.find(r => m >= r.min && m <= r.max);
  return r ? r.rate : 0;
}

function calculatePrice(buses, months, seconds) {
  const dur = seconds / BASE_DURATION;
  const standardPrice = Math.round(STANDARD * buses * months * dur);
  let pkg30s;
  if (months === 1) pkg30s = ONE_MONTH[buses];
  else if (months === 2) pkg30s = TWO_MONTH[buses];
  else {
    const base = ONE_MONTH[buses];
    const disc = getDiscountRate(months);
    pkg30s = base * months * (1 - disc);
  }
  const packagePrice = Math.round(pkg30s * dur);
  const savings = standardPrice - packagePrice;
  return { standardPrice, packagePrice, savings };
}

const TESTS = [
  // [buses, months, seconds, expectedStd, expectedPkg, expectedSavings, label]
  [1, 1, 30, 2000, 2000, 0, '1bus 1mo 30s'],
  [2, 1, 30, 4000, 3900, 100, '2bus 1mo 30s'],
  [5, 1, 30, 10000, 9000, 1000, '5bus 1mo 30s'],
  [10, 1, 30, 20000, 17500, 2500, '10bus 1mo 30s'],
  [1, 2, 30, 4000, 3800, 200, '1bus 2mo 30s'],
  [5, 2, 30, 20000, 17000, 3000, '5bus 2mo 30s'],
  [10, 2, 30, 40000, 32000, 8000, '10bus 2mo 30s'],
  [10, 3, 30, 60000, 46200, 13800, '10bus 3mo 30s'],
  [10, 6, 30, 120000, 84000, 36000, '10bus 6mo 30s'],
  [10, 12, 30, 240000, 157500, 82500, '10bus 12mo 30s'],
  // Duration scaling
  [10, 1, 15, 10000, 8750, 1250, '10bus 1mo 15s (half)'],
  [10, 1, 60, 40000, 35000, 5000, '10bus 1mo 60s (double)'],
  [10, 2, 15, 20000, 16000, 4000, '10bus 2mo 15s (half)'],
  [10, 3, 60, 120000, 92400, 27600, '10bus 3mo 60s (double)'],
];

let passed = 0, failed = 0;
for (const [buses, months, seconds, expStd, expPkg, expSav, label] of TESTS) {
  const { standardPrice, packagePrice, savings } = calculatePrice(buses, months, seconds);
  const ok = standardPrice === expStd && packagePrice === expPkg && savings === expSav;
  if (ok) {
    console.log(`✅ PASS: ${label}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${label}`);
    console.log(`   Expected: std=${expStd}, pkg=${expPkg}, sav=${expSav}`);
    console.log(`   Got:      std=${standardPrice}, pkg=${packagePrice}, sav=${savings}`);
    failed++;
  }
}

// Monotonicity check
console.log('\n--- Monotonicity Check (10 buses, 30s) ---');
let prevMonthly = Infinity;
for (let m = 1; m <= 12; m++) {
  const { packagePrice } = calculatePrice(10, m, 30);
  const monthly = packagePrice / m;
  const mono = monthly <= prevMonthly;
  console.log(`${mono ? '✅' : '❌'} ${m}mo: pkg=₹${packagePrice}, per-month=₹${monthly.toFixed(2)}`);
  if (!mono) failed++;
  else passed++;
  prevMonthly = monthly;
}

console.log(`\n====================================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('🎉 All pricing tests passed!');
else console.log('⚠️  Some tests failed — review pricing engine.');
