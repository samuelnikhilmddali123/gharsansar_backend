const assert = require("assert");
const {
  calculateProductPricing,
  isDiscountActive,
  countAffectedProducts,
  findCategoryDiscount
} = require("./services/pricingService");

const BASE_URL = "http://localhost:5001";

async function runTests() {
  console.log("=========================================================");
  console.log("🚀 TESTING REVISED PRODUCTION PRICING & DISCOUNT SYSTEM");
  console.log("=========================================================");

  // TEST 1: Two Separate Prices without Category Discount (Discount OFF)
  console.log("\n[Test 1] Discount OFF: Strike Price ₹2,150 & Actual Price ₹1,650:");
  const testProduct = {
    title: "Artisanal Vase",
    strikePrice: 2150, // Reference / MRP price
    actualPrice: 1650, // Product's original base selling price
    category: "Decor"
  };
  const pricingOff = calculateProductPricing(testProduct, []);
  console.log("  Strike Price: ₹" + pricingOff.strikePrice);
  console.log("  Actual Price: ₹" + pricingOff.actualPrice);
  console.log("  Discount Amount: ₹" + pricingOff.categoryDiscountAmount);
  console.log("  Customer / Final Price: ₹" + pricingOff.finalPrice);
  assert.strictEqual(pricingOff.strikePrice, 2150);
  assert.strictEqual(pricingOff.actualPrice, 1650);
  assert.strictEqual(pricingOff.categoryDiscountPercentage, 0);
  assert.strictEqual(pricingOff.categoryDiscountAmount, 0);
  assert.strictEqual(pricingOff.finalPrice, 1650);
  assert.strictEqual(pricingOff.price, 1650);
  assert.strictEqual(pricingOff.hasCategoryDiscount, false);
  console.log("  ✅ Test 1 Passed: Final Customer Price = Actual Price = ₹1,650 when discount is OFF.");

  // TEST 2: Category Discount 99% Example from Specification
  console.log("\n[Test 2] Discount ON at 99% (User Specification Example):");
  const discount99 = [
    {
      id: "disc_decor_99",
      category: "Decor",
      discountPercentage: 99,
      status: "active",
      startDate: new Date(Date.now() - 86400000).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 10).toISOString()
    }
  ];
  const pricing99 = calculateProductPricing(testProduct, discount99);
  console.log("  Strike Price: ₹" + pricing99.strikePrice);
  console.log("  Actual Price: ₹" + pricing99.actualPrice);
  console.log("  Category Discount: " + pricing99.categoryDiscountPercentage + "%");
  console.log("  Discount Amount (from Strike Price): ₹" + pricing99.categoryDiscountAmount);
  console.log("  Discounted Price / Customer Price: ₹" + pricing99.finalPrice);

  // 1. Discount Amount calculated from Strike Price: ₹2,150 × 99% = ₹2,128.50 ≈ ₹2,129
  assert.strictEqual(pricing99.categoryDiscountAmount, 2129, "Discount amount must be ₹2,129 calculated from Strike Price ₹2,150");

  // 2. Actual Price MUST NEVER be overwritten: remains ₹1,650
  assert.strictEqual(pricing99.actualPrice, 1650, "Actual Price MUST ALWAYS remain ₹1,650");

  // 3. Discounted Price = Actual Price - (Actual Price × 99 / 100) = 1650 - 1633.50 = ₹16.50
  assert.strictEqual(pricing99.discountedPrice, 16.5, "Discounted Price must be ₹16.50");
  assert.strictEqual(pricing99.finalPrice, 16.5, "Customer final price must be ₹16.50");
  assert.strictEqual(pricing99.price, 16.5, "Purchasing price charged to customer must be ₹16.50");
  console.log("  ✅ Test 2 Passed: Exactly satisfies Strike ₹2,150 | Actual ₹1,650 | Disc Amt ₹2,129 | Final ₹16.50!");

  // TEST 3: Multi-percentage Discount Steps: 10%, 20%, 50%
  console.log("\n[Test 3] Testing 10%, 20%, 50% Category Discounts on Actual Price ₹1,650:");

  // 10% Discount: 1650 - (1650 * 0.10) = ₹1,485
  const disc10 = [{ category: "Decor", discountPercentage: 10, status: "active", startDate: new Date(Date.now() - 1000).toISOString(), endDate: new Date(Date.now() + 100000).toISOString() }];
  const pricing10 = calculateProductPricing(testProduct, disc10);
  console.log("  10% Discount -> Final Price: ₹" + pricing10.finalPrice + " (Actual: ₹" + pricing10.actualPrice + ")");
  assert.strictEqual(pricing10.actualPrice, 1650);
  assert.strictEqual(pricing10.finalPrice, 1485);
  assert.strictEqual(pricing10.discountedPrice, 1485);

  // 20% Discount: 1650 - (1650 * 0.20) = ₹1,320
  const disc20 = [{ category: "Decor", discountPercentage: 20, status: "active", startDate: new Date(Date.now() - 1000).toISOString(), endDate: new Date(Date.now() + 100000).toISOString() }];
  const pricing20 = calculateProductPricing(testProduct, disc20);
  console.log("  20% Discount -> Final Price: ₹" + pricing20.finalPrice + " (Actual: ₹" + pricing20.actualPrice + ")");
  assert.strictEqual(pricing20.actualPrice, 1650);
  assert.strictEqual(pricing20.finalPrice, 1320);
  assert.strictEqual(pricing20.discountedPrice, 1320);

  // 50% Discount: 1650 - (1650 * 0.50) = ₹825
  const disc50 = [{ category: "Decor", discountPercentage: 50, status: "active", startDate: new Date(Date.now() - 1000).toISOString(), endDate: new Date(Date.now() + 100000).toISOString() }];
  const pricing50 = calculateProductPricing(testProduct, disc50);
  console.log("  50% Discount -> Final Price: ₹" + pricing50.finalPrice + " (Actual: ₹" + pricing50.actualPrice + ")");
  assert.strictEqual(pricing50.actualPrice, 1650);
  assert.strictEqual(pricing50.finalPrice, 825);
  assert.strictEqual(pricing50.discountedPrice, 825);
  console.log("  ✅ Test 3 Passed: 10% -> ₹1,485, 20% -> ₹1,320, 50% -> ₹825, Actual Price remains ₹1,650.");

  // TEST 4: Changing Actual Price while Discount is ON
  console.log("\n[Test 4] Changing Actual Price while Discount is ON:");
  const updatedProduct = {
    title: "Artisanal Vase (Updated Price)",
    strikePrice: 2500,
    actualPrice: 2000,
    category: "Decor"
  };
  const pricingUpdated = calculateProductPricing(updatedProduct, disc50);
  // 50% on 2000 -> 1000
  console.log("  New Actual Price: ₹" + pricingUpdated.actualPrice + ", 50% Discount -> Final Price: ₹" + pricingUpdated.finalPrice);
  assert.strictEqual(pricingUpdated.actualPrice, 2000);
  assert.strictEqual(pricingUpdated.finalPrice, 1000);
  assert.strictEqual(pricingUpdated.categoryDiscountAmount, 1250); // 2500 * 50%
  console.log("  ✅ Test 4 Passed: Changing Actual Price dynamically recalculates Final Price.");

  // TEST 5: Switching Discount 50% -> OFF
  console.log("\n[Test 5] Switching Discount 50% -> OFF:");
  const pricingBackToOff = calculateProductPricing(testProduct, []);
  assert.strictEqual(pricingBackToOff.actualPrice, 1650);
  assert.strictEqual(pricingBackToOff.finalPrice, 1650);
  console.log("  ✅ Test 5 Passed: Turning discount OFF restores Final Price = Actual Price = ₹1,650.");

  console.log("\n🎉 ALL LOCAL PRICING UNIT TESTS PASSED SUCCESSFULLY!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
