// Pricing engine verification tests for New Model (₹75/sec standard rate)
const STANDARD_RATE_PER_SECOND = 75;
const BASE_DURATION = 30;

const ONE_MONTH = {
  1: 2250, 2: 4350, 3: 6450, 4: 8500, 5: 10500,
  6: 12500, 7: 14500, 8: 16000, 9: 17250, 10: 18500,
};
const TWO_MONTH = {
  1: 4250, 2: 8200, 3: 12000, 4: 15800, 5: 19500,
  6: 23000, 7: 26500, 8: 29500, 9: 32500, 10: 35000,
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
  const standardPrice = Math.round(STANDARD_RATE_PER_SECOND * seconds * buses * months);
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
  [1, 1, 30, 2250, 2250, 0, '1bus 1mo 30s'],
  [5, 1, 30, 11250, 10500, 750, '5bus 1mo 30s'],
  [10, 1, 30, 22500, 18500, 4000, '10bus 1mo 30s'],
  [1, 2, 30, 4500, 4250, 250, '1bus 2mo 30s'],
  [5, 2, 30, 22500, 19500, 3000, '5bus 2mo 30s'],
  [10, 2, 30, 45000, 35000, 10000, '10bus 2mo 30s'],
  [10, 3, 30, 67500, 48840, 18660, '10bus 3mo 30s'],
  [10, 4, 30, 90000, 62900, 27100, '10bus 4mo 30s'],
  [10, 6, 30, 135000, 88800, 46200, '10bus 6mo 30s'],
  [10, 9, 30, 202500, 128205, 74295, '10bus 9mo 30s'],
  [10, 12, 30, 270000, 166500, 103500, '10bus 12mo 30s'],
  // Duration scaling
  [10, 1, 15, 11250, 9250, 2000, '10bus 1mo 15s (half)'],
  [10, 1, 60, 45000, 37000, 8000, '10bus 1mo 60s (double)'],
  [10, 2, 15, 22500, 17500, 5000, '10bus 2mo 15s (half)'],
  [10, 2, 60, 90000, 70000, 20000, '10bus 2mo 60s (double)'],
  [10, 3, 60, 135000, 97680, 37320, '10bus 3mo 60s (double)'],
];

let passed = 0, failed = 0;
for (const [buses, months, seconds, expStd, expPkg, expSav, label] of TESTS) {
  const { standardPrice, packagePrice, savings } = calculatePrice(buses, months, seconds);
  const ok = standardPrice === expStd && packagePrice === expPkg && savings === expSav;
  if (ok) {
    console.log(`✅ PASS: ${label} -> Std: ₹${standardPrice}, Pkg: ₹${packagePrice}, Sav: ₹${savings}`);
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
if (failed === 0) console.log('🎉 All 28 pricing tests passed with new model!');
else console.log('⚠️  Some tests failed.');
