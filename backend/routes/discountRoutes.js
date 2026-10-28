const express = require("express");
const router = express.Router();
const CategoryDiscount = require("../models/CategoryDiscount");
const { requireAdmin, optionalAuth } = require("../middleware/auth");
const { readData, writeData } = require("../db");
const {
  getAllDiscounts,
  getActiveDiscounts,
  extractAllProducts,
  countAffectedProducts,
  isDiscountActive,
  normalizeCategory
} = require("../services/pricingService");
const path = require("path");

const DISCOUNTS_FILE = path.join(__dirname, "..", "category_discounts.json");

/**
 * Helper to get all products currently in the catalog.
 */
function getCatalogProducts() {
  const catalog = readData("products.json", []);
  return extractAllProducts(catalog);
}

/**
 * GET /api/v1/discounts
 * Returns all category discounts with live affected product counts and status.
 */
router.get("/", async (req, res) => {
  try {
    const discounts = await getAllDiscounts();
    const products = getCatalogProducts();

    const formatted = discounts.map(disc => {
      const active = isDiscountActive(disc);
      const affectedCount = countAffectedProducts(disc.category, products);
      return {
        ...disc,
        isCurrentlyActive: active,
        affectedProductsCount: affectedCount
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error("Fetch discounts error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch discounts" });
  }
});

/**
 * GET /api/v1/discounts/active
 * Returns only currently active discounts.
 */
router.get("/active", async (req, res) => {
  try {
    const active = await getActiveDiscounts();
    res.json({
      success: true,
      count: active.length,
      data: active
    });
  } catch (error) {
    console.error("Fetch active discounts error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch active discounts" });
  }
});

/**
 * GET /api/v1/discounts/stats
 * Summary statistics for the Admin Dashboard.
 */
router.get("/stats", async (req, res) => {
  try {
    const allDiscounts = await getAllDiscounts();
    const activeDiscounts = allDiscounts.filter(isDiscountActive);
    const products = getCatalogProducts();

    // Map which products receive discount
    let discountedProductsCount = 0;
    let totalDiscountPercentSum = 0;

    products.forEach(p => {
      const normCat = normalizeCategory(p.category);
      const activeDisc = activeDiscounts.find(d => {
        const normD = normalizeCategory(d.category);
        return normD === normCat || normCat.includes(normD) || normD.includes(normCat);
      });

      const pDisc = parseFloat(p.product_discount || 0);
      if (pDisc > 0 || activeDisc) {
        discountedProductsCount++;
        const pct = pDisc > 0 ? pDisc : (activeDisc ? activeDisc.discountPercentage : 0);
        totalDiscountPercentSum += pct;
      }
    });

    const averageDiscount = discountedProductsCount > 0
      ? Math.round((totalDiscountPercentSum / discountedProductsCount) * 10) / 10
      : (activeDiscounts.length > 0 ? Math.round(activeDiscounts.reduce((sum, d) => sum + d.discountPercentage, 0) / activeDiscounts.length) : 0);

    res.json({
      success: true,
      stats: {
        totalProducts: products.length,
        activeDiscounts: activeDiscounts.length,
        discountedProducts: discountedProductsCount,
        averageDiscount: averageDiscount,
        productsOnSale: discountedProductsCount
      }
    });
  } catch (error) {
    console.error("Discount stats error:", error);
    res.status(500).json({ success: false, error: "Failed to load discount statistics" });
  }
});

/**
 * POST /api/v1/discounts
 * Create a new category discount with validations.
 */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { category, discountPercentage, startDate, endDate, status = "active", description = "" } = req.body;

    // 1. Validations
    if (!category || !String(category).trim()) {
      return res.status(400).json({ success: false, error: "Category selection is required." });
    }

    const pct = parseFloat(discountPercentage);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      return res.status(400).json({ success: false, error: "Discount percentage must be between 0.1% and 100%." });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: "Both Start Date and End Date are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, error: "Invalid date format." });
    }

    if (end < start) {
      return res.status(400).json({ success: false, error: "End date cannot be before Start date." });
    }

    // 2. Prevent duplicate active discounts for the same category
    const allDiscounts = await getAllDiscounts();
    const cleanCategory = String(category).trim();
    const normTarget = normalizeCategory(cleanCategory);

    if (status === "active") {
      const existing = allDiscounts.find(d => {
        const normD = normalizeCategory(d.category);
        return normD === normTarget;
      });

      if (existing) {
        existing.discountPercentage = pct;
        existing.startDate = start;
        existing.endDate = end;
        existing.status = "active";
        existing.description = String(description || "").trim();
        existing.updatedAt = new Date();

        try {
          await CategoryDiscount.findOneAndUpdate(
            { $or: [{ id: existing.id }, { category: cleanCategory }] },
            { $set: existing },
            { new: true, upsert: true }
          );
        } catch (e) {}

        const diskList = readData(DISCOUNTS_FILE, []);
        const idx = diskList.findIndex(d => d.id === existing.id || normalizeCategory(d.category) === normTarget);
        if (idx !== -1) {
          diskList[idx] = existing;
        } else {
          diskList.push(existing);
        }
        writeData(DISCOUNTS_FILE, diskList);

        return res.status(200).json({
          success: true,
          message: `Successfully updated discount for ${cleanCategory} to ${pct}%!`,
          data: existing
        });
      }
    }

    // 3. Compute affected product count
    const products = getCatalogProducts();
    const affectedCount = countAffectedProducts(cleanCategory, products);

    const discountId = `disc_${Date.now()}`;
    const newDoc = {
      id: discountId,
      category: cleanCategory,
      discountPercentage: pct,
      startDate: start,
      endDate: end,
      status: status === "inactive" ? "inactive" : "active",
      description: String(description || "").trim(),
      affectedProductsCount: affectedCount,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to Mongo
    try {
      await CategoryDiscount.create(newDoc);
    } catch (e) {
      console.warn("CategoryDiscount mongo save fallback:", e.message);
    }

    // Save to Atlas/local file cache
    allDiscounts.unshift(newDoc);
    writeData(DISCOUNTS_FILE, allDiscounts);

    res.status(201).json({
      success: true,
      message: `Successfully created ${pct}% discount for ${cleanCategory}!`,
      data: newDoc
    });
  } catch (error) {
    console.error("Create discount error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create discount" });
  }
});

/**
 * PUT /api/v1/discounts/:id
 * Update an existing category discount.
 */
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, discountPercentage, startDate, endDate, status, description } = req.body;

    const allDiscounts = await getAllDiscounts();
    const idx = allDiscounts.findIndex(d => String(d.id) === String(id) || String(d._id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Discount not found" });
    }

    const current = allDiscounts[idx];

    const cleanCategory = category ? String(category).trim() : current.category;
    let pct = current.discountPercentage;
    if (discountPercentage !== undefined) {
      pct = parseFloat(discountPercentage);
      if (isNaN(pct) || pct <= 0 || pct > 100) {
        return res.status(400).json({ success: false, error: "Discount percentage must be between 0.1% and 100%." });
      }
    }

    let start = current.startDate ? new Date(current.startDate) : new Date();
    let end = current.endDate ? new Date(current.endDate) : new Date();

    if (startDate) start = new Date(startDate);
    if (endDate) end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, error: "End date cannot be before Start date." });
    }

    const newStatus = status !== undefined ? status : current.status;

    // Check duplicate active discount if activating or changing category
    if (newStatus === "active") {
      const normTarget = normalizeCategory(cleanCategory);
      const duplicate = allDiscounts.find(d => {
        if (String(d.id) === String(id) || String(d._id) === String(id)) return false;
        if (d.status !== "active") return false;
        return normalizeCategory(d.category) === normTarget;
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: `Another active discount (${duplicate.discountPercentage}%) already exists for category "${cleanCategory}".`
        });
      }
    }

    const products = getCatalogProducts();
    const affectedCount = countAffectedProducts(cleanCategory, products);

    const updated = {
      ...current,
      category: cleanCategory,
      discountPercentage: pct,
      startDate: start,
      endDate: end,
      status: newStatus,
      description: description !== undefined ? String(description).trim() : current.description,
      affectedProductsCount: affectedCount,
      updatedAt: new Date()
    };

    allDiscounts[idx] = updated;

    try {
      await CategoryDiscount.findOneAndUpdate(
        { $or: [{ id: id }, { _id: id }] },
        { $set: updated },
        { new: true }
      );
    } catch (e) {
      console.warn("CategoryDiscount mongo update fallback:", e.message);
    }

    writeData(DISCOUNTS_FILE, allDiscounts);

    res.json({
      success: true,
      message: "Discount updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Update discount error:", error);
    res.status(500).json({ success: false, error: "Failed to update discount" });
  }
});

/**
 * PATCH /api/v1/discounts/:id/status
 * Quick toggle status between 'active' and 'inactive'.
 */
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allDiscounts = await getAllDiscounts();
    const idx = allDiscounts.findIndex(d => String(d.id) === String(id) || String(d._id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Discount not found" });
    }

    const current = allDiscounts[idx];
    const targetStatus = status || (current.status === "active" ? "inactive" : "active");

    if (targetStatus === "active") {
      const normTarget = normalizeCategory(current.category);
      const duplicate = allDiscounts.find(d => {
        if (String(d.id) === String(id) || String(d._id) === String(id)) return false;
        if (d.status !== "active") return false;
        return normalizeCategory(d.category) === normTarget;
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: `Cannot activate: Category "${current.category}" already has an active discount (${duplicate.discountPercentage}%).`
        });
      }
    }

    current.status = targetStatus;
    current.updatedAt = new Date();
    allDiscounts[idx] = current;

    try {
      await CategoryDiscount.findOneAndUpdate(
        { $or: [{ id: id }, { _id: id }] },
        { $set: { status: targetStatus, updatedAt: new Date() } }
      );
    } catch (e) {}

    writeData(DISCOUNTS_FILE, allDiscounts);

    res.json({
      success: true,
      message: `Discount status changed to ${targetStatus}`,
      data: current
    });
  } catch (error) {
    console.error("Toggle discount status error:", error);
    res.status(500).json({ success: false, error: "Failed to update discount status" });
  }
});

/**
 * DELETE /api/v1/discounts/:id
 * Remove a category discount.
 */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let allDiscounts = await getAllDiscounts();
    const exists = allDiscounts.some(d => String(d.id) === String(id) || String(d._id) === String(id));
    if (!exists) {
      return res.status(404).json({ success: false, error: "Discount not found" });
    }

    allDiscounts = allDiscounts.filter(d => String(d.id) !== String(id) && String(d._id) !== String(id));

    try {
      await CategoryDiscount.deleteOne({ $or: [{ id: id }, { _id: id }] });
    } catch (e) {}

    writeData(DISCOUNTS_FILE, allDiscounts);

    res.json({
      success: true,
      message: "Discount deleted successfully"
    });
  } catch (error) {
    console.error("Delete discount error:", error);
    res.status(500).json({ success: false, error: "Failed to delete discount" });
  }
});

module.exports = router;
