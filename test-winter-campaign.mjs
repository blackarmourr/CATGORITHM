// Verification script for updated Catgorithm Pricing Model
import { calculatePrice, getMonthlyRatePerBus10 } from './src/lib/pricingEngine.ts';

console.log('=== CATGORITHM NEW PRICING ENGINE VERIFICATION ===\n');

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

// 1. Benchmark 1-Month (10 buses, 30s)
const p1 = calculatePrice(10, 1, 30);
assert(p1.packagePrice === 18500, '1 month @ 10 buses: Package price is Rs. 18,500', p1.packagePrice);
assert(p1.pricePerBusMonth === 1850, '1 month @ 10 buses: Rate is Rs. 1,850 / bus / mo', p1.pricePerBusMonth);

// 2. Benchmark 2-Month (10 buses, 30s)
const p2 = calculatePrice(10, 2, 30);
assert(p2.packagePrice === 35000, '2 months @ 10 buses: Package price is Rs. 35,000', p2.packagePrice);
assert(p2.pricePerBusMonth === 1750, '2 months @ 10 buses: Rate is Rs. 1,750 / bus / mo', p2.pricePerBusMonth);

// 3. Test progressive reduction by Rs. 25 per bus per month from 1,750 down to 1,500 at 12 months
const expectedMonthlyRates = [
  { m: 2,  rate: 1750, total: 35000 },
  { m: 3,  rate: 1725, total: 51750 },
  { m: 4,  rate: 1700, total: 68000 },
  { m: 5,  rate: 1675, total: 83750 },
  { m: 6,  rate: 1650, total: 99000 },
  { m: 7,  rate: 1625, total: 113750 },
  { m: 8,  rate: 1600, total: 128000 },
  { m: 9,  rate: 1575, total: 141750 },
  { m: 10, rate: 1550, total: 155000 },
  { m: 11, rate: 1525, total: 167750 },
  { m: 12, rate: 1500, total: 180000 },
];

for (const { m, rate, total } of expectedMonthlyRates) {
  const p = calculatePrice(10, m, 30);
  assert(
    p.pricePerBusMonth === rate,
    `${m} months: Rate per bus/mo is Rs. ${rate} (expected Rs. ${rate})`,
    { got: p.pricePerBusMonth, expected: rate }
  );
  assert(
    p.packagePrice === total,
    `${m} months: Total for 10 buses is Rs. ${total} (expected Rs. ${total})`,
    { got: p.packagePrice, expected: total }
  );
}

// 4. Rate floor: Check that 12 months does not reduce below 1,500
const p12 = calculatePrice(10, 12, 30);
assert(p12.pricePerBusMonth === 1500, '12 months rate floor is exactly Rs. 1,500 / bus / mo', p12.pricePerBusMonth);
assert(p12.pricePerBusMonth >= 1500, 'Price per bus per month never reduces below Rs. 1,500', p12.pricePerBusMonth);

// 5. Video duration scaling with new model (10 buses, 12 months, 15s)
const p12_15s = calculatePrice(10, 12, 15);
assert(p12_15s.packagePrice === 90000, '10 buses @ 15s for 12 months: Exactly half of 180,000 = Rs. 90,000', p12_15s.packagePrice);

console.log('\n--- Test Result ---');
if (allPassed) {
  console.log('🎉 ALL NEW PRICING REDUCTION BENCHMARKS PASSED PERFECTLY!\n');
  process.exit(0);
} else {
  console.error('💥 SOME BENCHMARKS FAILED!\n');
  process.exit(1);
}
