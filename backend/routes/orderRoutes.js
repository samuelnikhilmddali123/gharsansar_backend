const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { authenticate, optionalAuth, requireAdmin } = require("../middleware/auth");
const { readData, writeData } = require("../db");
const { getActiveDiscounts, calculateProductPricing, extractAllProducts } = require("../services/pricingService");
const path = require("path");
const fs = require("fs");

const ORDERS_FILE = path.join(__dirname, "..", "orders.json");
const CUSTOMERS_FILE = path.join(__dirname, "..", "customers.json");

/**
 * GET /api/v1/orders
 * Returns orders for the authenticated user (or all orders for admin) directly from MongoDB Atlas.
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const isAdmin =
      (user.role && user.role.toUpperCase() === "ADMIN") ||
      (user.email && user.email.toLowerCase() === "gharsansarshop@gmail.com");

    let orders = [];

    if (isAdmin) {
      // Admin sees all orders
      orders = await Order.find({}).sort({ createdAt: -1 });
    } else {
      // Regular customer sees only their own orders
      const userQueries = [
        { userId: req.userId },
        { "customer.email": user.email ? user.email.toLowerCase() : "" }
      ];
      if (user.id) userQueries.push({ userId: String(user.id) });
      if (user._id) userQueries.push({ userId: user._id.toString() });
      if (user.phone) {
        const cleanPhone = user.phone.replace(/\D/g, "");
        userQueries.push({ "customer.phone": user.phone });
        if (cleanPhone) userQueries.push({ "customer.phone": cleanPhone });
      }

      orders = await Order.find({ $or: userQueries }).sort({ createdAt: -1 });
    }

    // Fallback if Atlas collection returned empty but orders.json has legacy records
    if (orders.length === 0) {
      try {
        const rawJsonOrders = readData(ORDERS_FILE, []);
        if (isAdmin) {
          orders = rawJsonOrders;
        } else {
          orders = rawJsonOrders.filter((o) => {
            const matchesId = o.userId === req.userId || o.userId === String(user.id);
            const matchesEmail = o.customer && o.customer.email && o.customer.email.toLowerCase() === user.email.toLowerCase();
            return matchesId || matchesEmail;
          });
        }
      } catch (e) {}
    }

    res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ error: "Failed to load orders", success: false });
  }
});

/**
 * GET /api/v1/orders/:id
 * Retrieve a specific order by id / orderNumber from MongoDB Atlas.
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const orderId = req.params.id;
    const user = req.user;
    const isAdmin =
      (user.role && user.role.toUpperCase() === "ADMIN") ||
      (user.email && user.email.toLowerCase() === "gharsansarshop@gmail.com");

    const query = [
      { id: orderId },
      { orderNumber: orderId }
    ];
    if (/^[0-9a-fA-F]{24}$/.test(orderId)) {
      query.push({ _id: orderId });
    }

    const order = await Order.findOne({ $or: query });

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Authorization check
    if (!isAdmin) {
      const isOwner =
        order.userId === req.userId ||
        order.userId === String(user.id) ||
        (order.customer && order.customer.email && order.customer.email.toLowerCase() === user.email.toLowerCase());

      if (!isOwner) {
        return res.status(403).json({ success: false, error: "Access denied to this order" });
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Fetch single order error:", error);
    res.status(500).json({ success: false, error: "Failed to load order details" });
  }
});

/**
 * POST /api/v1/orders
 * Place a new order and persist permanently in MongoDB Atlas.
 */
router.post("/", optionalAuth, async (req, res) => {
  try {
    const user = req.user;
    if (user && ((user.role && user.role.toUpperCase() === "ADMIN") || (user.email && user.email.toLowerCase() === "gharsansarshop@gmail.com"))) {
      return res.status(403).json({
        success: false,
        error: "Admin accounts are restricted from placing customer orders. Please use a customer account."
      });
    }

    const {
      customer,
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      paymentStatus,
      paymentId,
      paymentMethod,
      notes
    } = req.body;

    const orderId = `GS-ORD-${Date.now().toString().slice(-6)}`;
    const orderNumber = `GS${Date.now().toString().slice(-8)}`;

    const effectiveUserId = req.userId || (user ? String(user.id || user._id) : (customer && customer.email) || "guest");

    // Server-side source of truth: load active discounts and catalog
    const activeDiscounts = await getActiveDiscounts();
    const catalogData = readData("products.json", []);
    const catalogProducts = extractAllProducts(catalogData);

    const verifiedItems = (Array.isArray(items) ? items : []).map((itm) => {
      const pid = String(itm.productId || itm.id || "");
      const matched = catalogProducts.find(
        (p) => String(p.id) === pid || String(p.prod_id) === pid || (p.title && itm.name && p.title.toLowerCase() === itm.name.toLowerCase())
      );

      let finalVerifiedPrice = parseFloat(itm.price) || 0;
      if (matched) {
        const pricing = calculateProductPricing(matched, activeDiscounts);
        finalVerifiedPrice = pricing.finalPrice;
      }

      return {
        id: String(itm.id || itm.productId || `item_${Date.now()}`),
        productId: pid,
        name: itm.name || (matched ? matched.title : "Product"),
        price: finalVerifiedPrice,
        quantity: parseInt(itm.quantity, 10) || 1,
        image: itm.image || (matched ? matched.image : ""),
        selectedSize: itm.selectedSize || "",
        selectedColor: itm.selectedColor || "",
        isReturnGift: Boolean(itm.isReturnGift)
      };
    });

    const calculatedSubtotal = verifiedItems.reduce((acc, itm) => acc + (itm.price * itm.quantity), 0);
    const calculatedShipping = shipping !== undefined ? parseFloat(shipping) : (calculatedSubtotal > 1000 ? 0 : 99);
    const calculatedTax = tax !== undefined ? parseFloat(tax) : Math.round(calculatedSubtotal * 0.18);
    const calculatedDiscount = parseFloat(discount) || 0;
    const grandTotal = Math.max(0, calculatedSubtotal + calculatedShipping + calculatedTax - calculatedDiscount);

    const now = new Date();

    const orderDoc = {
      id: orderId,
      orderNumber,
      userId: effectiveUserId,
      timestamp: now,
      customer: {
        firstName: (customer && customer.firstName) || (user && user.full_name ? user.full_name.split(" ")[0] : "Guest"),
        lastName: (customer && customer.lastName) || (user && user.full_name ? user.full_name.split(" ").slice(1).join(" ") : ""),
        email: ((customer && customer.email) || (user && user.email) || "guest@example.com").toLowerCase().trim(),
        phone: (customer && customer.phone) || (user && user.phone) || "",
        address: (customer && customer.address) || (user && user.street_address) || "",
        city: (customer && customer.city) || (user && user.city) || "",
        state: (customer && customer.state) || (user && user.state) || "",
        zipCode: (customer && customer.zipCode) || (user && user.pincode) || "",
        country: (customer && customer.country) || "India",
        notes: (customer && customer.notes) || notes || ""
      },
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      tax: calculatedTax,
      discount: calculatedDiscount,
      total: grandTotal,
      status: "processing",
      paymentStatus: paymentStatus || "paid",
      paymentId: paymentId || `pay_sim_${Date.now().toString().slice(-6)}`,
      paymentMethod: paymentMethod || "razorpay_dummy",
      notes: notes || "",
      createdAt: now,
      updatedAt: now
    };

    // 1. Persist directly to MongoDB Atlas via Mongoose
    const createdOrder = await Order.create(orderDoc);

    // 2. Synchronize to legacy orders.json / atlasCache for backward compatibility
    try {
      const rawOrders = readData(ORDERS_FILE, []);
      rawOrders.unshift({ ...orderDoc, _id: createdOrder._id ? createdOrder._id.toString() : undefined });
      writeData(ORDERS_FILE, rawOrders);
    } catch (syncErr) {
      console.warn("Legacy orders.json sync warning:", syncErr.message);
    }

    // 3. Auto-save / update customer in customers.json & Atlas
    if (orderDoc.customer && orderDoc.customer.email) {
      try {
        const customers = readData(CUSTOMERS_FILE, []);
        const existingIdx = customers.findIndex((c) => c.email && c.email.toLowerCase() === orderDoc.customer.email);
        const customerRecord = {
          ...orderDoc.customer,
          lastOrderId: orderId,
          lastOrderDate: now.toISOString(),
          totalOrders: existingIdx >= 0 ? (customers[existingIdx].totalOrders || 0) + 1 : 1,
          totalSpent: existingIdx >= 0 ? (customers[existingIdx].totalSpent || 0) + grandTotal : grandTotal,
          savedAt: now.toISOString()
        };
        if (existingIdx >= 0) {
          customers[existingIdx] = customerRecord;
        } else {
          customers.unshift(customerRecord);
        }
        writeData(CUSTOMERS_FILE, customers);
      } catch (custErr) {
        console.warn("Customer sync warning:", custErr.message);
      }
    }

    // 4. Automatically clear the authenticated user's persistent cart in MongoDB Atlas
    if (req.userId) {
      try {
        await Cart.findOneAndUpdate(
          { $or: [{ userId: req.userId }, { userId: String(user ? user.id : "") }] },
          { $set: { items: [] } }
        );
      } catch (cartClearErr) {
        console.warn("Failed to clear cart after order:", cartClearErr.message);
      }
    }
    // 5. Record Admin Dashboard Notification
    try {
      const NOTIFICATIONS_FILE = path.join(__dirname, "..", "notifications.json");
      const notifications = readData(NOTIFICATIONS_FILE, []);
      const adminNotification = {
        id: `GS-NOTIF-${Date.now().toString().slice(-6)}`,
        type: "new_order",
        title: "New Order Placed",
        message: `Order ${orderNumber} for ₹${grandTotal.toFixed(2)} placed by ${orderDoc.customer.firstName} ${orderDoc.customer.lastName}`,
        timestamp: now.toISOString(),
        read: false,
        metadata: {
          orderId,
          orderNumber,
          customerName: `${orderDoc.customer.firstName} ${orderDoc.customer.lastName}`,
          total: grandTotal
        }
      };
      notifications.unshift(adminNotification);
      if (notifications.length > 100) notifications.pop();
      writeData(NOTIFICATIONS_FILE, notifications);
    } catch (notifErr) {}

    // 6. Dispatch Mobile & Push notifications
    if (global.sendMobileNotification && orderDoc.customer && orderDoc.customer.phone) {
      try {
        const customerMessage = `Hello ${orderDoc.customer.firstName}, thank you for shopping at Ghar Sansar! Your order ${orderNumber} for ₹${grandTotal.toFixed(2)} has been received and is being processed.`;
        global.sendMobileNotification(orderDoc.customer.phone, customerMessage, {
          customerName: orderDoc.customer.firstName,
          orderNumber,
          totalAmount: grandTotal.toFixed(2)
        });
      } catch (e) {}
    }
    if (global.createInternalNotification && effectiveUserId && effectiveUserId !== "guest") {
      try {
        global.createInternalNotification(
          effectiveUserId,
          "Order Placed Successfully! 🎉",
          `Your order #${orderNumber} for ₹${grandTotal.toFixed(2)} has been confirmed and is being prepared.`,
          "order"
        );
      } catch (e) {}
    }

    console.log(`📦 [MongoDB Atlas] New Order ${createdOrder.id} saved for user ${effectiveUserId} - Total: ₹${grandTotal}`);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, error: "Failed to place order" });
  }
});

/**
 * PATCH /api/v1/orders/:id/status
 * Update order status in MongoDB Atlas.
 */
router.patch(["/:id/status", "/:id/status-update"], requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value", success: false });
    }

    const updated = await Order.findOneAndUpdate(
      { $or: [{ id: orderId }, { orderNumber: orderId }] },
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Order not found", success: false });
    }

    // Keep orders.json sync
    try {
      const rawOrders = readData(ORDERS_FILE, []);
      const idx = rawOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
      if (idx !== -1) {
        rawOrders[idx].status = status;
        rawOrders[idx].updatedAt = new Date().toISOString();
        writeData(ORDERS_FILE, rawOrders);
      }
    } catch (e) {}

    res.json({ success: true, message: "Order status updated", order: updated });
  } catch (error) {
    console.error("Order status update error:", error);
    res.status(500).json({ error: "Failed to update status", success: false });
  }
});

/**
 * PATCH /api/v1/orders/:id/shipped
 * Mark order as shipped and save tracking info in MongoDB Atlas.
 */
router.patch("/:id/shipped", requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { trackingNumber, waybill, shipment_id } = req.body;

    const finalTracking = trackingNumber || waybill || shipment_id || "";

    const updated = await Order.findOneAndUpdate(
      { $or: [{ id: orderId }, { orderNumber: orderId }] },
      {
        $set: {
          status: "shipped",
          trackingNumber: finalTracking,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Order not found", success: false });
    }

    // Keep orders.json sync
    try {
      const rawOrders = readData(ORDERS_FILE, []);
      const idx = rawOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
      if (idx !== -1) {
        rawOrders[idx].status = "shipped";
        rawOrders[idx].trackingNumber = finalTracking;
        rawOrders[idx].updatedAt = new Date().toISOString();
        writeData(ORDERS_FILE, rawOrders);
      }
    } catch (e) {}

    res.json({ success: true, message: "Order marked as shipped", order: updated });
  } catch (error) {
    console.error("Order shipped update error:", error);
    res.status(500).json({ error: "Failed to update shipment details", success: false });
  }
});

module.exports = router;
