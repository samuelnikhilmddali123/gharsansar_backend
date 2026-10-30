const CategoryDiscount = require("../models/CategoryDiscount");
const { readData, writeData } = require("../db");
const path = require("path");

const DISCOUNTS_FILE = path.join(__dirname, "..", "category_discounts.json");

/**
 * Normalizes a category string for case-insensitive and underscore-neutral matching.
 */
function normalizeCategory(cat) {
  if (!cat) return "";
  return String(cat)
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, " ");
}

/**
 * Checks if a discount record is currently active based on status and dates.
 */
function isDiscountActive(disc) {
  if (!disc || disc.status !== "active") return false;
  const now = new Date();
  const start = new Date(disc.startDate);
  const end = new Date(disc.endDate);
  // Allow the entire end date until 23:59:59.999
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
}

/**
 * Loads all category discounts from Atlas / cache.
 */
async function getAllDiscounts() {
  try {
    const fromMongo = await CategoryDiscount.find({}).sort({ createdAt: -1 });
    if (fromMongo && fromMongo.length > 0) {
      return fromMongo.map(d => (d.toObject ? d.toObject() : d));
    }
  } catch (err) {
    // fallback
  }

  const cached = readData(DISCOUNTS_FILE, []);
  return Array.isArray(cached) ? cached : [];
}

/**
 * Loads only currently active category discounts.
 */
async function getActiveDiscounts() {
  const all = await getAllDiscounts();
  return all.filter(isDiscountActive);
}

/**
 * Finds the applicable category discount for a given category name.
 */
function findCategoryDiscount(categoryName, activeDiscounts = []) {
  if (!categoryName || !Array.isArray(activeDiscounts)) return null;
  const normCat = normalizeCategory(categoryName);
  return (
    activeDiscounts.find(d => {
      const normD = normalizeCategory(d.category);
      return normD === normCat || normCat.includes(normD) || normD.includes(normCat);
    }) || null
  );
}

/**
 * Flattens all products from nested category structure (products.json / product_catalog)
 */
function extractAllProducts(catalogData) {
  const products = [];
  if (!Array.isArray(catalogData)) return products;

  catalogData.forEach((category, catIdx) => {
    const catName = category.name || category.category || "General";
    (category.subcategories || []).forEach((sub, subIdx) => {
      const subName = sub.name || "";
      const items = sub.products || sub.images || sub.services || [];
      items.forEach((item, idx) => {
        products.push({
          ...item,
          category: item.category || catName,
          subCategory: item.subCategory || subName,
          id: item.prod_id || item.id || `prod_${catIdx}_${subIdx}_${idx}`
        });
      });
    });
  });

  return products;
}

/**
 * Counts how many products belong to a category.
 */
function countAffectedProducts(categoryName, allProducts = []) {
  if (!categoryName || !allProducts.length) return 0;
  const targetNorm = normalizeCategory(categoryName);
  return allProducts.filter(p => {
    const prodCat = normalizeCategory(p.category);
    return prodCat === targetNorm || prodCat.includes(targetNorm) || targetNorm.includes(prodCat);
  }).length;
}

/**
 * Pure calculation engine for product pricing according to the strict architecture:
 * 1. Strike Price (MRP / reference price): e.g., ₹2,150
 * 2. Actual Price (product's original base selling price BEFORE category discount): e.g., ₹1,650
 *    - MUST REMAIN UNCHANGED when category discount is enabled or disabled.
 *    - Stored in DB / JSON as base selling price (never overwritten).
 * 3. Category Discount % is calculated based on STRIKE PRICE:
 *    - categoryDiscountAmount = Strike Price * (categoryDiscountPercentage / 100) -> e.g. ₹2,129
 * 4. Discounted Price / Final Customer Price:
 *    - The price the customer actually pays when category discount is enabled.
 *    - Calculated dynamically from Actual Price:
 *      When category discount is ON:
 *        Discounted Price = Actual Price - (Actual Price * categoryDiscountPercentage / 100) -> e.g. ₹16.50
 *        Final Price = Discounted Price -> ₹16.50
 *      When category discount is OFF:
 *        Final Price = Actual Price -> ₹1,650
 *        No discounted price applied.
 */
function calculateProductPricing(product, activeDiscounts = []) {
  const rawActualPrice = parseFloat(
    product.actualPrice !== undefined ? product.actualPrice :
    product.actual_price !== undefined ? product.actual_price :
    product.price !== undefined ? product.price :
    product.selling_price || 0
  ) || 0;

  let rawStrikePrice = parseFloat(
    product.strikePrice !== undefined ? product.strikePrice :
    product.strike_price !== undefined ? product.strike_price :
    product["act-price"] !== undefined ? product["act-price"] : 0
  ) || 0;

  // Ensure Strike Price is at least equal to Actual Price if strike price was missing or lower
  if (rawStrikePrice === 0 && rawActualPrice > 0) {
    rawStrikePrice = rawActualPrice;
  }
  if (rawStrikePrice < rawActualPrice) {
    rawStrikePrice = rawActualPrice;
  }

  const actualPrice = Math.round(rawActualPrice * 100) / 100;
  const strikePrice = Math.round(rawStrikePrice * 100) / 100;

  // Check category discount for this category
  const activeCatDiscount = findCategoryDiscount(product.category, activeDiscounts);
  const categoryDiscountPercentage = activeCatDiscount ? parseFloat(activeCatDiscount.discountPercentage || 0) : 0;
  const hasCategoryDiscount = categoryDiscountPercentage > 0;

  // Formula 1: Category Discount Amount is calculated from STRIKE PRICE (MRP)
  // Example: ₹2,150 * 99% = ₹2,128.50 ≈ ₹2,129
  const categoryDiscountAmount = (strikePrice > 0 && hasCategoryDiscount)
    ? Math.round(strikePrice * (categoryDiscountPercentage / 100))
    : 0;

  // Formula 2: Discounted Customer Price is calculated dynamically from ACTUAL PRICE
  // Example: ₹1,650 - (₹1,650 * 99 / 100) = ₹16.50
  let discountedPrice = actualPrice;
  if (hasCategoryDiscount) {
    discountedPrice = Math.round((actualPrice - (actualPrice * (categoryDiscountPercentage / 100))) * 100) / 100;
  }

  // The price customer pays: Discounted Price when discount is ON, otherwise Actual Price
  const finalPrice = hasCategoryDiscount ? discountedPrice : actualPrice;

  // Difference between Strike Price and Customer Price
  const currentDifference = Math.max(0, strikePrice - finalPrice);
  const isDiscounted = hasCategoryDiscount || strikePrice > actualPrice;

  return {
    strikePrice,
    actualPrice, // Base selling price (STORED VALUE - NEVER OVERWRITTEN)
    discountedPrice, // Customer discounted price when category discount is ON (e.g. ₹16.50)
    finalPrice, // Price customer actually pays: discountedPrice when ON, actualPrice when OFF
    categoryDiscountPercentage,
    categoryDiscountAmount, // Calculated from Strike Price (e.g. ₹2,129)
    currentDifference,
    hasCategoryDiscount,
    isDiscounted,
    // Aliases for compatibility across frontend, backend, cart, orders, and mobile app
    price: finalPrice, // Active customer purchasing price
    sellingPrice: finalPrice,
    selling_price: finalPrice,
    strike_price: strikePrice,
    actual_price: actualPrice,
    discounted_price: discountedPrice,
    final_price: finalPrice,
    discountAmount: categoryDiscountAmount,
    discount_amount: categoryDiscountAmount,
    discountPercentage: categoryDiscountPercentage,
    discount_percentage: categoryDiscountPercentage
  };
}

module.exports = {
  normalizeCategory,
  isDiscountActive,
  getAllDiscounts,
  getActiveDiscounts,
  findCategoryDiscount,
  extractAllProducts,
  countAffectedProducts,
  calculateProductPricing
};
