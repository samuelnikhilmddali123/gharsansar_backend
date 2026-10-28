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
 * Pure calculation engine for product pricing.
/**
 * Calculates pricing according to the strict rule:
 * 1. Strike Price (MRP) and Actual Price are two independent prices.
 * 2. Category Discount % is calculated based on STRIKE PRICE:
 *    categoryDiscountAmount = Strike Price * (categoryDiscountPercentage / 100)
 * 3. Actual Price is NEVER reduced by the category discount.
 *    Customer pays actualPrice (e.g., ₹2,500).
 * 4. Current Difference = Strike Price - Actual Price.
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

  // Ensure Strike Price is at least equal to Actual Price if strike price was missing
  if (rawStrikePrice === 0 && rawActualPrice > 0) {
    rawStrikePrice = rawActualPrice;
  }
  if (rawStrikePrice < rawActualPrice) {
    rawStrikePrice = rawActualPrice;
  }

  const actualPrice = Math.round(rawActualPrice);
  const strikePrice = Math.round(rawStrikePrice);

  // Check category discount for this category
  const activeCatDiscount = findCategoryDiscount(product.category, activeDiscounts);
  const categoryDiscountPercentage = activeCatDiscount ? parseFloat(activeCatDiscount.discountPercentage || 0) : 0;

  // Formula: Discount Amount = Strike Price * Category Discount %
  const categoryDiscountAmount = strikePrice > 0 && categoryDiscountPercentage > 0
    ? Math.round(strikePrice * (categoryDiscountPercentage / 100))
    : 0;

  // Difference between Strike Price and Actual Price
  const currentDifference = Math.max(0, strikePrice - actualPrice);

  const hasCategoryDiscount = categoryDiscountPercentage > 0;
  const isDiscounted = hasCategoryDiscount || strikePrice > actualPrice;

  return {
    strikePrice,
    actualPrice,
    categoryDiscountPercentage,
    categoryDiscountAmount,
    currentDifference,
    hasCategoryDiscount,
    isDiscounted,
    // Aliases for compatibility
    price: actualPrice, // Customer pays actual price (e.g., ₹2,500)
    finalPrice: actualPrice, // Crucial: NOT ₹2,250, remains ₹2,500
    sellingPrice: actualPrice,
    strike_price: strikePrice,
    actual_price: actualPrice,
    discountAmount: categoryDiscountAmount,
    discountPercentage: categoryDiscountPercentage
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
