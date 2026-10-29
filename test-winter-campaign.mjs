// Test script to verify Catgorithm Pricing Engine & Winter Spotlight rules
import { calculatePrice } from './src/lib/pricingEngine.ts';

console.log('=== CATGORITHM PRICING & WINTER SPOTLIGHT VERIFICATION ===\n');

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

// 1. Winter Spotlight 2026-27 core benchmark: 10 buses, 30s ad, 2 months
const p10_2_30 = calculatePrice(10, 2, 30);
assert(p10_2_30.standardPrice === 45000, '10 buses @ 30s for 2 mo: Standard price is Rs. 45,000', p10_2_30);
assert(p10_2_30.packagePrice === 35000, '10 buses @ 30s for 2 mo: Package price is Rs. 35,000', p10_2_30);
assert(p10_2_30.savings === 10000, '10 buses @ 30s for 2 mo: Savings is Rs. 10,000', p10_2_30);
assert(Math.round(p10_2_30.savingsPercentage) === 22, '10 buses @ 30s for 2 mo: Discount is ~22.22%', p10_2_30);
assert(p10_2_30.pricePerBusMonth === 1750, '10 buses @ 30s for 2 mo: Rate per bus/mo is Rs. 1,750', p10_2_30);

// 2. 1-Month 10 buses benchmark
const p10_1_30 = calculatePrice(10, 1, 30);
assert(p10_1_30.standardPrice === 22500, '10 buses @ 30s for 1 mo: Standard price is Rs. 22,500', p10_1_30);
assert(p10_1_30.packagePrice === 18500, '10 buses @ 30s for 1 mo: Package price is Rs. 18,500', p10_1_30);
assert(p10_1_30.savings === 4000, '10 buses @ 30s for 1 mo: Savings is Rs. 4,000', p10_1_30);

// 3. 15-second variation: 10 buses, 2 months
const p10_2_15 = calculatePrice(10, 2, 15);
assert(p10_2_15.standardPrice === 22500, '10 buses @ 15s for 2 mo: Standard price is Rs. 22,500', p10_2_15);
assert(p10_2_15.packagePrice === 17500, '10 buses @ 15s for 2 mo: Package price is Rs. 17,500', p10_2_15);
assert(p10_2_15.savings === 5000, '10 buses @ 15s for 2 mo: Savings is Rs. 5,000', p10_2_15);

// 4. 60-second variation: 10 buses, 2 months
const p10_2_60 = calculatePrice(10, 2, 60);
assert(p10_2_60.standardPrice === 90000, '10 buses @ 60s for 2 mo: Standard price is Rs. 90,000', p10_2_60);
assert(p10_2_60.packagePrice === 70000, '10 buses @ 60s for 2 mo: Package price is Rs. 70,000', p10_2_60);
assert(p10_2_60.savings === 20000, '10 buses @ 60s for 2 mo: Savings is Rs. 20,000', p10_2_60);

// 5. 3-Month clean rounding: 10 buses, 30s
const p10_3_30 = calculatePrice(10, 3, 30);
assert(p10_3_30.packagePrice === 48000, '10 buses @ 30s for 3 mo: Clean rounded price is Rs. 48,000', p10_3_30);

// 6. 12-Month milestone: 10 buses, 30s
const p10_12_30 = calculatePrice(10, 12, 30);
assert(p10_12_30.packagePrice === 150000, '10 buses @ 30s for 12 mo: Milestone price is Rs. 150,000', p10_12_30);
assert(p10_12_30.pricePerBusMonth === 1250, '10 buses @ 30s for 12 mo: Rate is Rs. 1,250/bus/mo', p10_12_30);

console.log('\n--- Test Summary ---');
if (allPassed) {
  console.log('🎉 ALL SECTION 10 PRICING & WINTER SPOTLIGHT BENCHMARKS PASSED PERFECTLY!\n');
  process.exit(0);
} else {
  console.error('💥 SOME BENCHMARKS FAILED!\n');
  process.exit(1);
}
