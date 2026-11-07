const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const { authenticate, optionalAuth } = require("../middleware/auth");

/**
 * Helper to get or create wishlist for authenticated user
 */
async function getOrCreateWishlist(req) {
  const user = req.user;
  const canonicalId = req.userId;

  if (!canonicalId) return null;

  const queryConditions = [{ userId: canonicalId }];
  if (user && user.id) queryConditions.push({ userId: String(user.id) });
  if (user && user.email) queryConditions.push({ userId: user.email.toLowerCase() });
  if (user && user._id) queryConditions.push({ userId: user._id.toString() });

  let wishlist = await Wishlist.findOne({ $or: queryConditions });

  if (!wishlist) {
    wishlist = new Wishlist({
      userId: canonicalId,
      items: [],
      productIds: []
    });
    await wishlist.save();
  } else if (wishlist.userId !== canonicalId) {
    wishlist.userId = canonicalId;
    await wishlist.save();
  }

  return wishlist;
}

/**
 * GET /api/v1/wishlist
 * Return user's wishlist from MongoDB Atlas (or empty for guests).
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.json({ success: true, wishlist: [], items: [] });
    }
    const wishlist = await getOrCreateWishlist(req);
    res.json({
      success: true,
      wishlist: wishlist.productIds || [],
      items: wishlist.items || []
    });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    res.status(500).json({ success: false, error: "Failed to load wishlist" });
  }
});

/**
 * POST /api/v1/wishlist/toggle
 * Toggle product in user's wishlist in MongoDB Atlas.
 */
router.post(["/toggle", "/items/toggle"], optionalAuth, async (req, res) => {
  try {
    const { productId, product } = req.body;
    const targetId = String(productId || (product && (product.id || product.productId)) || "").trim();

    if (!targetId) {
      return res.status(400).json({ success: false, error: "productId is required" });
    }

    if (!req.userId) {
      // Guest mode response
      return res.json({
        success: true,
        wishlisted: true,
        wishlist: [targetId],
        items: []
      });
    }

    const wishlist = await getOrCreateWishlist(req);
    const existingIndex = wishlist.items.findIndex((i) => i.productId === targetId);

    let wishlisted = false;
    if (existingIndex >= 0) {
      // Remove from wishlist
      wishlist.items.splice(existingIndex, 1);
      wishlisted = false;
    } else {
      // Add to wishlist
      wishlist.items.push({
        productId: targetId,
        name: (product && (product.name || product.title)) || "Product",
        price: (product && (typeof product.price === "number" ? product.price : parseFloat(product.price))) || 0,
        image: (product && product.image) || "",
        category: (product && product.category) || "",
        addedAt: new Date()
      });
      wishlisted = true;
    }

    await wishlist.save();

    res.json({
      success: true,
      wishlisted,
      wishlist: wishlist.productIds || [],
      items: wishlist.items || []
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    res.status(500).json({ success: false, error: "Failed to update wishlist" });
  }
});

/**
 * POST /api/v1/wishlist
 * Add product to user's wishlist in MongoDB Atlas.
 */
router.post(["/", "/items"], authenticate, async (req, res) => {
  try {
    const { productId, product } = req.body;
    const targetId = String(productId || (product && (product.id || product.productId)) || "").trim();

    if (!targetId) {
      return res.status(400).json({ success: false, error: "productId is required" });
    }

    const wishlist = await getOrCreateWishlist(req);
    const exists = wishlist.items.some((i) => i.productId === targetId);

    if (!exists) {
      wishlist.items.push({
        productId: targetId,
        name: (product && (product.name || product.title)) || "Product",
        price: (product && (typeof product.price === "number" ? product.price : parseFloat(product.price))) || 0,
        image: (product && product.image) || "",
        category: (product && product.category) || "",
        addedAt: new Date()
      });
      await wishlist.save();
    }

    res.json({
      success: true,
      wishlisted: true,
      wishlist: wishlist.productIds || [],
      items: wishlist.items || []
    });
  } catch (error) {
    console.error("Add wishlist error:", error);
    res.status(500).json({ success: false, error: "Failed to add to wishlist" });
  }
});

/**
 * DELETE /api/v1/wishlist/:productId
 * Remove product from user's wishlist in MongoDB Atlas.
 */
router.delete(["/:productId", "/items/:productId"], authenticate, async (req, res) => {
  try {
    const targetId = String(req.params.productId || "").trim();
    if (!targetId) {
      return res.status(400).json({ success: false, error: "productId is required" });
    }

    const wishlist = await getOrCreateWishlist(req);
    wishlist.items = wishlist.items.filter((i) => i.productId !== targetId);
    await wishlist.save();

    res.json({
      success: true,
      wishlisted: false,
      wishlist: wishlist.productIds || [],
      items: wishlist.items || []
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);
    res.status(500).json({ success: false, error: "Failed to remove from wishlist" });
  }
});

/**
 * POST /api/v1/wishlist/sync
 * Sync guest wishlist on login into user's MongoDB wishlist.
 */
router.post(["/sync", "/merge"], authenticate, async (req, res) => {
  try {
    const { productIds, items } = req.body;
    const wishlist = await getOrCreateWishlist(req);

    if (Array.isArray(items) && items.length > 0) {
      for (const itm of items) {
        const pId = String(itm.productId || itm.id || "").trim();
        if (!pId) continue;
        if (!wishlist.items.some((i) => i.productId === pId)) {
          wishlist.items.push({
            productId: pId,
            name: itm.name || itm.title || "Product",
            price: typeof itm.price === "number" ? itm.price : parseFloat(itm.price) || 0,
            image: itm.image || "",
            category: itm.category || "",
            addedAt: new Date()
          });
        }
      }
    } else if (Array.isArray(productIds) && productIds.length > 0) {
      for (const pId of productIds) {
        const cleanId = String(pId).trim();
        if (!cleanId) continue;
        if (!wishlist.items.some((i) => i.productId === cleanId)) {
          wishlist.items.push({
            productId: cleanId,
            name: "Product",
            price: 0,
            image: "",
            addedAt: new Date()
          });
        }
      }
    }

    await wishlist.save();

    res.json({
      success: true,
      wishlist: wishlist.productIds || [],
      items: wishlist.items || []
    });
  } catch (error) {
    console.error("Sync wishlist error:", error);
    res.status(500).json({ success: false, error: "Failed to sync wishlist" });
  }
});

module.exports = router;
