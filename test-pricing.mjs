// Pricing engine verification tests for New Model (₹75/sec standard rate)
// With fine-tuned 3mo (₹48,000), 12mo (₹150,000 / ₹1,250 per bus/mo) and commercial rounding.

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

const MONTHLY_RATES = {
  3:  7500 / 55500,
  4:  12000 / 74000,
  5:  17500 / 92500,
  6:  24000 / 111000,
  7:  31500 / 129500,
  8:  40000 / 148000,
  9:  47500 / 166500,
  10: 55000 / 185000,
  11: 63500 / 203500,
  12: 72000 / 222000,
};

function getDiscountRate(m) {
  if (m < 3) return 0;
  return MONTHLY_RATES[m] ?? MONTHLY_RATES[12];
}

function roundCommercialPrice(amount) {
  if (amount <= 0) return 0;
  const rounded = Math.round(amount);

  if (rounded % 500 === 0) return rounded;
  if (rounded % 250 === 0 && rounded < 50000) return rounded;

  if (rounded < 2500) return Math.round(rounded / 50) * 50;
  if (rounded < 15000) return Math.round(rounded / 100) * 100;
  if (rounded < 50000) return Math.round(rounded / 500) * 500;
  return Math.round(rounded / 1000) * 1000;
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

  let packagePrice;
  if ((months === 1 || months === 2) && seconds === BASE_DURATION) {
    packagePrice = pkg30s;
  } else {
    packagePrice = roundCommercialPrice(pkg30s * dur);
  }

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
  // Fine-tuned tests
  [10, 3, 30, 67500, 48000, 19500, '10bus 3mo 30s (fine-tuned to ₹48,000)'],
  [10, 4, 30, 90000, 62000, 28000, '10bus 4mo 30s (clean rounded)'],
  [10, 5, 30, 112500, 75000, 37500, '10bus 5mo 30s (clean rounded)'],
  [10, 6, 30, 135000, 87000, 48000, '10bus 6mo 30s (clean rounded)'],
  [10, 9, 30, 202500, 119000, 83500, '10bus 9mo 30s (clean rounded)'],
  [10, 12, 30, 270000, 150000, 120000, '10bus 12mo 30s (fine-tuned to ₹150,000 / ₹1,250 per bus/mo)'],
  // Duration scaling
  [10, 1, 15, 11250, 9250, 2000, '10bus 1mo 15s (half duration)'],
  [10, 1, 60, 45000, 37000, 8000, '10bus 1mo 60s (double duration)'],
  [10, 2, 15, 22500, 17500, 5000, '10bus 2mo 15s (half duration)'],
  [10, 2, 60, 90000, 70000, 20000, '10bus 2mo 60s (double duration)'],
  [10, 3, 60, 135000, 96000, 39000, '10bus 3mo 60s (double duration)'],
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

// Monotonicity check across all 12 months for 10 buses
console.log('\n--- Monotonicity Check (10 buses, 30s) ---');
let prevMonthly = Infinity;
for (let m = 1; m <= 12; m++) {
  const { packagePrice } = calculatePrice(10, m, 30);
  const monthly = packagePrice / (10 * m);
  const mono = monthly <= prevMonthly + 0.01;
  console.log(`${mono ? '✅' : '❌'} ${m}mo: pkg=₹${packagePrice}, per-bus-month=₹${monthly.toFixed(2)}`);
  if (!mono) failed++;
  else passed++;
  prevMonthly = monthly;
}

console.log(`\n====================================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('🎉 All pricing tests passed with fine-tuned rounded model!');
else console.log('⚠️  Some tests failed.');
