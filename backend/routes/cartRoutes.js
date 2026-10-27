const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { authenticate } = require("../middleware/auth");

/**
 * Helper to get or create cart for authenticated user
 */
async function getOrCreateCart(req) {
  const user = req.user;
  const canonicalId = req.userId;

  // Search by possible userId formats (string _id, numeric id, or email)
  const queryConditions = [{ userId: canonicalId }];
  if (user && user.id) queryConditions.push({ userId: String(user.id) });
  if (user && user.email) queryConditions.push({ userId: user.email.toLowerCase() });
  if (user && user._id) queryConditions.push({ userId: user._id.toString() });

  let cart = await Cart.findOne({ $or: queryConditions });

  if (!cart) {
    cart = new Cart({
      userId: canonicalId,
      items: []
    });
    await cart.save();
  } else if (cart.userId !== canonicalId) {
    // Standardize to canonical ID
    cart.userId = canonicalId;
    await cart.save();
  }

  return cart;
}

/**
 * GET /api/v1/cart
 * Return the currently authenticated user's cart from MongoDB Atlas.
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    res.json({
      success: true,
      cart: cart.getSummary()
    });
  } catch (error) {
    console.error("Fetch cart error:", error);
    res.status(500).json({ success: false, error: "Failed to load cart" });
  }
});

/**
 * POST /api/v1/cart/items
 * Add a product to the authenticated user's cart in MongoDB Atlas.
 */
router.post(["/items", "/add"], authenticate, async (req, res) => {
  try {
    const {
      productId,
      id,
      name,
      price,
      quantity,
      image,
      variantId,
      selectedSize,
      selectedColor,
      isReturnGift,
      stock
    } = req.body;

    const targetProductId = String(productId || id || "").trim();
    if (!targetProductId) {
      return res.status(400).json({ success: false, error: "productId or id is required" });
    }

    const cart = await getOrCreateCart(req);
    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || (isReturnGift ? 50 : 1));
    const numPrice = typeof price === "number" ? price : parseFloat(price) || 0;

    // Check if matching item (same productId, and same variant/size/color if present) already exists
    const existingIndex = cart.items.findIndex((item) => {
      const matchId = item.productId === targetProductId || item.id === targetProductId;
      const matchVariant = !variantId || item.variantId === variantId;
      const matchSize = !selectedSize || item.selectedSize === selectedSize;
      const matchColor = !selectedColor || item.selectedColor === selectedColor;
      return matchId && matchVariant && matchSize && matchColor;
    });

    if (existingIndex >= 0) {
      let newQty = cart.items[existingIndex].quantity + qtyToAdd;
      const maxStock = stock !== undefined ? stock : cart.items[existingIndex].stock;
      if (maxStock !== undefined && newQty > maxStock) {
        newQty = maxStock;
      }
      cart.items[existingIndex].quantity = newQty;
      if (price !== undefined) cart.items[existingIndex].price = numPrice;
      if (image && !cart.items[existingIndex].image) cart.items[existingIndex].image = image;
    } else {
      cart.items.push({
        productId: targetProductId,
        id: targetProductId,
        variantId: variantId || "",
        name: name || "Product",
        price: numPrice,
        quantity: qtyToAdd,
        image: image || "",
        selectedSize: selectedSize || "",
        selectedColor: selectedColor || "",
        isReturnGift: Boolean(isReturnGift),
        stock: stock !== undefined ? Number(stock) : undefined,
        priceAtAddition: numPrice,
        addedAt: new Date()
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: cart.getSummary()
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, error: "Failed to add product to cart" });
  }
});

/**
 * PUT /api/v1/cart/items/:item
 * Update quantity / variant for an item in authenticated user's cart in MongoDB Atlas.
 */
router.put(["/items/:item", "/items/:itemId", "/update"], authenticate, async (req, res) => {
  try {
    const targetId = String(req.params.item || req.params.itemId || req.body.productId || req.body.id || "").trim();
    const { quantity, selectedSize, selectedColor } = req.body;

    if (!targetId) {
      return res.status(400).json({ success: false, error: "Item identifier required" });
    }

    const cart = await getOrCreateCart(req);

    const itemIndex = cart.items.findIndex(
      (i) =>
        (i._id && i._id.toString() === targetId) ||
        i.productId === targetId ||
        i.id === targetId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: "Item not found in cart" });
    }

    if (quantity !== undefined) {
      const newQty = parseInt(quantity, 10);
      if (isNaN(newQty) || newQty <= 0) {
        // Remove item if quantity set to 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        const item = cart.items[itemIndex];
        let finalQty = newQty;
        if (item.isReturnGift && finalQty < 50) finalQty = 50;
        if (item.stock !== undefined && finalQty > item.stock) finalQty = item.stock;
        item.quantity = finalQty;
        if (selectedSize !== undefined) item.selectedSize = selectedSize;
        if (selectedColor !== undefined) item.selectedColor = selectedColor;
      }
    } else {
      if (selectedSize !== undefined) cart.items[itemIndex].selectedSize = selectedSize;
      if (selectedColor !== undefined) cart.items[itemIndex].selectedColor = selectedColor;
    }

    await cart.save();

    res.json({
      success: true,
      message: "Cart updated",
      cart: cart.getSummary()
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ success: false, error: "Failed to update cart" });
  }
});

/**
 * DELETE /api/v1/cart/items/:item
 * Remove an item from the authenticated user's cart in MongoDB Atlas.
 */
router.delete(["/items/:item", "/items/:itemId", "/remove/:item"], authenticate, async (req, res) => {
  try {
    const targetId = String(req.params.item || req.params.itemId || "").trim();
    if (!targetId) {
      return res.status(400).json({ success: false, error: "Item identifier required" });
    }

    const cart = await getOrCreateCart(req);

    const initialLen = cart.items.length;
    cart.items = cart.items.filter(
      (i) =>
        !(
          (i._id && i._id.toString() === targetId) ||
          i.productId === targetId ||
          i.id === targetId
        )
    );

    await cart.save();

    res.json({
      success: true,
      message: cart.items.length < initialLen ? "Item removed from cart" : "Item not present in cart",
      cart: cart.getSummary()
    });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ success: false, error: "Failed to remove item from cart" });
  }
});

/**
 * DELETE /api/v1/cart
 * Clear all items from the authenticated user's cart in MongoDB Atlas.
 */
router.delete(["/", "/clear"], authenticate, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      cart: cart.getSummary()
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, error: "Failed to clear cart" });
  }
});

/**
 * POST /api/v1/cart/merge
 * Merge local guest cart items into authenticated user's MongoDB cart on login.
 */
router.post("/merge", authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      const cart = await getOrCreateCart(req);
      return res.json({ success: true, cart: cart.getSummary() });
    }

    const cart = await getOrCreateCart(req);

    for (const incoming of items) {
      const targetId = String(incoming.productId || incoming.id || "").trim();
      if (!targetId) continue;

      const qty = Math.max(1, parseInt(incoming.quantity, 10) || 1);
      const existing = cart.items.find((i) => i.productId === targetId || i.id === targetId);

      if (existing) {
        existing.quantity += qty;
        if (incoming.stock && existing.quantity > incoming.stock) {
          existing.quantity = incoming.stock;
        }
      } else {
        cart.items.push({
          productId: targetId,
          id: targetId,
          name: incoming.name || "Product",
          price: typeof incoming.price === "number" ? incoming.price : parseFloat(incoming.price) || 0,
          quantity: qty,
          image: incoming.image || "",
          variantId: incoming.variantId || "",
          selectedSize: incoming.selectedSize || "",
          selectedColor: incoming.selectedColor || "",
          isReturnGift: Boolean(incoming.isReturnGift),
          stock: incoming.stock,
          priceAtAddition: incoming.price,
          addedAt: new Date()
        });
      }
    }

    await cart.save();

    res.json({
      success: true,
      message: "Guest cart merged successfully",
      cart: cart.getSummary()
    });
  } catch (error) {
    console.error("Merge cart error:", error);
    res.status(500).json({ success: false, error: "Failed to merge cart" });
  }
});

module.exports = router;
