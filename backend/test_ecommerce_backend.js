const http = require("http");
require("dotenv").config();

const BASE_URL = "http://localhost:5001";

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 TESTING PERSISTENT ECOMMERCE BACKEND & ATLAS");
  console.log("==================================================\n");

  const timestamp = Date.now();
  const userA_email = `test_user_a_${timestamp}@example.com`;
  const userB_email = `test_user_b_${timestamp}@example.com`;
  const password = "TestPassword@123";

  // 1. Register User A
  console.log("1. Registering User A...");
  const regARes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/auth/register",
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }, {
    name: "User Alpha",
    email: userA_email,
    password: password,
    phone: `98${String(timestamp).slice(-8)}`
  });

  if (regARes.status !== 201 || !regARes.data.token) {
    console.error("❌ Failed to register User A:", regARes.data);
    process.exit(1);
  }
  const tokenA = regARes.data.token;
  const userA = regARes.data.user;
  console.log(`✅ User A registered! ID: ${userA.id}, Email: ${userA.email}, Token received (JWT)`);

  // 2. Test /api/v1/auth/me
  console.log("\n2. Testing /api/v1/auth/me with User A token...");
  const meRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/auth/me",
    method: "GET",
    headers: { "Authorization": `Bearer ${tokenA}` }
  });
  if (meRes.status !== 200 || meRes.data.user.email !== userA_email) {
    console.error("❌ /api/v1/auth/me failed:", meRes.data);
    process.exit(1);
  }
  console.log(`✅ Authenticated session verified from Atlas: ${meRes.data.user.full_name}`);

  // 3. User A adds Product 1 and Product 2 to Cart
  console.log("\n3. Testing Cart: User A adding items to Cart...");
  const addCartRes1 = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/cart/items",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenA}`
    }
  }, {
    productId: "prod_001",
    name: "Luxury Ceramic Table Vase",
    price: 1499,
    quantity: 2,
    image: "http://localhost:5001/products/vase.jpg",
    selectedColor: "Imperial Gold"
  });

  if (addCartRes1.status !== 200 || addCartRes1.data.cart.items.length !== 1) {
    console.error("❌ Failed to add item 1 to cart:", addCartRes1.data);
    process.exit(1);
  }
  console.log(`✅ Added Item 1 to User A's Cart. Items: ${addCartRes1.data.cart.totalItems}, Total: ₹${addCartRes1.data.cart.totalPrice}`);

  const addCartRes2 = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/cart/items",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenA}`
    }
  }, {
    productId: "prod_002",
    name: "Handcrafted Heritage Sculpture",
    price: 2999,
    quantity: 1,
    image: "http://localhost:5001/products/sculpture.jpg"
  });
  console.log(`✅ Added Item 2 to User A's Cart. Items: ${addCartRes2.data.cart.totalItems}, Total: ₹${addCartRes2.data.cart.totalPrice}`);

  // 4. User A adds Product 3 to Wishlist
  console.log("\n4. Testing Wishlist: User A toggling Product in Wishlist...");
  const wishRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/wishlist/toggle",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenA}`
    }
  }, {
    productId: "prod_wish_003",
    product: {
      name: "Celestial Obsidian Platter",
      price: 3499,
      image: "http://localhost:5001/products/platter.jpg"
    }
  });

  if (wishRes.status !== 200 || !wishRes.data.wishlisted) {
    console.error("❌ Failed to toggle wishlist:", wishRes.data);
    process.exit(1);
  }
  console.log(`✅ Product added to User A's Wishlist! Wishlist count: ${wishRes.data.wishlist.length}`);

  // 5. Register User B and verify USER ISOLATION
  console.log("\n5. Registering User B to verify Cart/Wishlist Isolation...");
  const regBRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/auth/register",
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }, {
    name: "User Beta",
    email: userB_email,
    password: password,
    phone: `97${String(timestamp).slice(-8)}`
  });

  const tokenB = regBRes.data.token;

  // Check User B's cart
  const cartBRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/cart",
    method: "GET",
    headers: { "Authorization": `Bearer ${tokenB}` }
  });

  if (cartBRes.data.cart.items.length !== 0) {
    console.error("❌ SECURITY FAILURE: User B can see User A's cart items!");
    process.exit(1);
  }
  console.log("✅ ISOLATION VERIFIED: User B's cart is completely empty and separate from User A!");

  // 6. User A places an Order
  console.log("\n6. User A placing an order...");
  const orderRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/orders",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${tokenA}`
    }
  }, {
    customer: {
      firstName: "User",
      lastName: "Alpha",
      email: userA_email,
      phone: "9876543210",
      address: "123 Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500033"
    },
    items: [
      {
        id: "prod_001",
        productId: "prod_001",
        name: "Luxury Ceramic Table Vase",
        price: 1499,
        quantity: 1,
        image: "http://localhost:5001/products/vase.jpg"
      }
    ],
    subtotal: 1499,
    shipping: 0,
    tax: 269.82,
    total: 1768.82,
    paymentMethod: "razorpay"
  });

  if (orderRes.status !== 201 || !orderRes.data.order) {
    console.error("❌ Order placement failed:", orderRes.data);
    process.exit(1);
  }
  const placedOrderId = orderRes.data.order.id;
  console.log(`✅ Order placed successfully! Order ID: ${placedOrderId}, Total: ₹${orderRes.data.order.total}`);

  // 7. Verify Order History for User A
  console.log("\n7. Fetching Order History for User A...");
  const ordersARes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/orders",
    method: "GET",
    headers: { "Authorization": `Bearer ${tokenA}` }
  });

  const matchingOrder = ordersARes.data.find(o => o.id === placedOrderId);
  if (!matchingOrder) {
    console.error("❌ Placed order not found in User A's order history!");
    process.exit(1);
  }
  console.log(`✅ Order ${placedOrderId} verified in User A's order history from Atlas!`);

  // Verify User B cannot see User A's orders
  const ordersBRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/orders",
    method: "GET",
    headers: { "Authorization": `Bearer ${tokenB}` }
  });
  if (ordersBRes.data.some(o => o.id === placedOrderId)) {
    console.error("❌ SECURITY FAILURE: User B can see User A's order!");
    process.exit(1);
  }
  console.log("✅ ISOLATION VERIFIED: User B cannot see User A's orders!");

  // 8. SIMULATE LOGOUT & LOGIN AGAIN (Persistence Test)
  console.log("\n8. SIMULATING LOGOUT & RE-LOGIN FROM ANOTHER SESSION...");
  console.log("Logging in User A with email & password...");
  const reLoginRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/auth/login",
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }, {
    emailOrPhone: userA_email,
    password: password
  });

  if (reLoginRes.status !== 200 || !reLoginRes.data.token) {
    console.error("❌ Re-login failed:", reLoginRes.data);
    process.exit(1);
  }
  const newTokenA = reLoginRes.data.token;
  console.log("✅ User A logged in from new session!");

  // Verify restored Wishlist from Atlas
  const restoredWishlist = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/wishlist",
    method: "GET",
    headers: { "Authorization": `Bearer ${newTokenA}` }
  });
  if (!restoredWishlist.data.wishlist.includes("prod_wish_003")) {
    console.error("❌ User A's wishlist was not restored from MongoDB Atlas!");
    process.exit(1);
  }
  console.log(`✅ WISHLIST RESTORED FROM MONGODB ATLAS: ${JSON.stringify(restoredWishlist.data.wishlist)}`);

  // Verify restored Orders from Atlas
  const restoredOrders = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/orders",
    method: "GET",
    headers: { "Authorization": `Bearer ${newTokenA}` }
  });
  if (!restoredOrders.data.some(o => o.id === placedOrderId)) {
    console.error("❌ User A's order history was not restored from MongoDB Atlas!");
    process.exit(1);
  }
  console.log(`✅ ORDER HISTORY RESTORED FROM MONGODB ATLAS: ${restoredOrders.data.length} orders found.`);

  // 9. TEST CART UPDATE, REMOVAL, MERGE & RESTORATION ACROSS LOGOUT/LOGIN
  console.log("\n9. TESTING CART PERSISTENCE, UPDATE, REMOVAL & GUEST MERGE...");
  // Add item
  await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/cart/items",
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${newTokenA}` }
  }, {
    productId: "prod_persistent_009",
    name: "Artisan Gilded Decanter",
    price: 4999,
    quantity: 3
  });

  // Update item quantity
  const updateRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/cart/items/prod_persistent_009",
    method: "PUT",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${newTokenA}` }
  }, {
    quantity: 5
  });
  if (updateRes.data.cart.items.find(i => i.productId === "prod_persistent_009").quantity !== 5) {
    console.error("❌ Cart update quantity failed:", updateRes.data);
    process.exit(1);
  }
  console.log("✅ Cart item quantity updated to 5 via PUT /api/v1/cart/items/:id");

  // Re-login User A again to test Cart restoration
  console.log("Re-logging in User A to test Cart restoration from MongoDB Atlas...");
  const thirdLoginRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/auth/login",
    method: "POST",
    headers: { "Content-Type": "application/json" }
  }, {
    emailOrPhone: userA_email,
    password: password
  });
  const tokenA_session3 = thirdLoginRes.data.token;

  const restoredCartRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/cart",
    method: "GET",
    headers: { "Authorization": `Bearer ${tokenA_session3}` }
  });
  const restoredItem = restoredCartRes.data.cart.items.find(i => i.productId === "prod_persistent_009");
  if (!restoredItem || restoredItem.quantity !== 5) {
    console.error("❌ Cart was not restored from MongoDB Atlas on new session:", restoredCartRes.data);
    process.exit(1);
  }
  console.log(`✅ CART RESTORED FROM MONGODB ATLAS: Product ${restoredItem.productId}, Quantity: ${restoredItem.quantity}, Total: ₹${restoredCartRes.data.cart.totalPrice}`);

  // Test Guest Cart Merge
  console.log("Testing guest cart merge...");
  const mergeRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/cart/merge",
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenA_session3}` }
  }, {
    items: [
      { productId: "guest_item_1", name: "Guest Plate", price: 299, quantity: 2 }
    ]
  });
  if (mergeRes.data.cart.items.length < 2) {
    console.error("❌ Guest cart merge failed:", mergeRes.data);
    process.exit(1);
  }
  console.log(`✅ GUEST CART MERGE SUCCEEDED: Cart now contains ${mergeRes.data.cart.items.length} distinct items!`);

  // Test Cart Clear
  const clearRes = await request({
    hostname: "localhost",
    port: 5001,
    path: "/api/v1/cart",
    method: "DELETE",
    headers: { "Authorization": `Bearer ${tokenA_session3}` }
  });
  if (clearRes.data.cart.items.length !== 0) {
    console.error("❌ Cart clear failed:", clearRes.data);
    process.exit(1);
  }
  console.log("✅ Cart cleared successfully via DELETE /api/v1/cart");

  console.log("\n==================================================");
  console.log("🎉 ALL ECOMMERCE BACKEND & ATLAS TESTS PASSED 100%!");
  console.log("==================================================");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
