// Verification script for updated Catgorithm Pricing Model
import { calculatePrice } from './src/lib/pricingEngine.ts';

console.log('=== CATGORITHM NEW PRICING ENGINE VERIFICATION (₹2,500 BASE) ===\n');

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

// 1. Benchmark 1-Month (1 bus, 30s)
const p1_bus1 = calculatePrice(1, 1, 30);
assert(p1_bus1.standardPrice === 2500, '1 bus @ 1 mo: Standard price is Rs. 2,500', p1_bus1.standardPrice);
assert(p1_bus1.packagePrice === 2250, '1 bus @ 1 mo: Discounted price is Rs. 2,250', p1_bus1.packagePrice);
assert(p1_bus1.savings === 250, '1 bus @ 1 mo: Savings is Rs. 250', p1_bus1.savings);

// 2. Benchmark 1-Month (2 buses, 30s)
const p1_bus2 = calculatePrice(2, 1, 30);
assert(p1_bus2.standardPrice === 5000, '2 buses @ 1 mo: Standard price is Rs. 5,000', p1_bus2.standardPrice);
assert(p1_bus2.packagePrice === 4350, '2 buses @ 1 mo: Discounted price is Rs. 4,350', p1_bus2.packagePrice);
assert(p1_bus2.savings === 650, '2 buses @ 1 mo: Savings is Rs. 650', p1_bus2.savings);

// 3. Benchmark 1-Month (10 buses, 30s)
const p1_bus10 = calculatePrice(10, 1, 30);
assert(p1_bus10.standardPrice === 25000, '10 buses @ 1 mo: Standard price is Rs. 25,000', p1_bus10.standardPrice);
assert(p1_bus10.packagePrice === 20000, '10 buses @ 1 mo: Package price is Rs. 20,000', p1_bus10.packagePrice);
assert(p1_bus10.savings === 5000, '10 buses @ 1 mo: Savings is Rs. 5,000', p1_bus10.savings);

// 4. Benchmark 2-Month (10 buses, 30s)
const p2_bus10 = calculatePrice(10, 2, 30);
assert(p2_bus10.standardPrice === 50000, '10 buses @ 2 mo: Standard price is Rs. 50,000', p2_bus10.standardPrice);
assert(p2_bus10.packagePrice === 39000, '10 buses @ 2 mo: Package price is Rs. 39,000 (floor Rs. 1,950/mo)', p2_bus10.packagePrice);
assert(p2_bus10.savings === 11000, '10 buses @ 2 mo: Savings is Rs. 11,000 (22% OFF)', p2_bus10.savings);

// 5. Benchmark 3-Month (10 buses, 30s)
const p3_bus10 = calculatePrice(10, 3, 30);
assert(p3_bus10.standardPrice === 75000, '10 buses @ 3 mo: Standard price is Rs. 75,000', p3_bus10.standardPrice);
assert(p3_bus10.packagePrice === 58500, '10 buses @ 3 mo: Package price is Rs. 58,500 (floor Rs. 1,950/mo)', p3_bus10.packagePrice);
assert(p3_bus10.savings === 16500, '10 buses @ 3 mo: Savings is Rs. 16,500', p3_bus10.savings);

// 6. Benchmark 12-Month (10 buses, 30s)
const p12_bus10 = calculatePrice(10, 12, 30);
assert(p12_bus10.standardPrice === 300000, '10 buses @ 12 mo: Standard price is Rs. 3,00,000 (3 Lakhs)', p12_bus10.standardPrice);
assert(p12_bus10.packagePrice === 234000, '10 buses @ 12 mo: Package price is Rs. 2,34,000 (floor Rs. 1,950/mo)', p12_bus10.packagePrice);
assert(p12_bus10.savings === 66000, '10 buses @ 12 mo: Savings is Rs. 66,000', p12_bus10.savings);

console.log('\n--- Test Result ---');
if (allPassed) {
  console.log('🎉 ALL NEW 2,500 BASE PRICING BENCHMARKS PASSED PERFECTLY!\n');
  process.exit(0);
} else {
  console.error('💥 SOME BENCHMARKS FAILED!\n');
  process.exit(1);
}
