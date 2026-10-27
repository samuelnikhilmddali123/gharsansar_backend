require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://samuelnikhilmddali123_db_user:B8WE55v2uAxsSQrX@cluster0.0uuwpyl.mongodb.net/gharsansar?retryWrites=true&w=majority";

const readJson = (filePath, defaultValue = []) => {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.warn(`[WARN] Could not parse ${filePath}:`, err.message);
    return defaultValue;
  }
};

async function migrate() {
  console.log("=================================================");
  console.log("   GHAR SANSAR - MONGODB ATLAS MIGRATION TOOL    ");
  console.log("=================================================\n");

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected successfully to database: gharsansar\n");

  const db = mongoose.connection.db;

  // 1. Migrate Users
  const users = readJson(path.join(__dirname, "users.json"), []);
  if (users.length > 0) {
    const col = db.collection("users");
    await col.deleteMany({});
    await col.insertMany(users);
    console.log(`[OK] Migrated ${users.length} users -> 'users' collection`);
  }

  // 2. Migrate Orders
  const orders = readJson(path.join(__dirname, "orders.json"), []);
  if (orders.length > 0) {
    const col = db.collection("orders");
    await col.deleteMany({});
    await col.insertMany(orders);
    console.log(`[OK] Migrated ${orders.length} orders -> 'orders' collection`);
  }

  // 3. Migrate Customers
  const customers = readJson(path.join(__dirname, "customers.json"), []);
  if (customers.length > 0) {
    const col = db.collection("customers");
    await col.deleteMany({});
    await col.insertMany(customers);
    console.log(`[OK] Migrated ${customers.length} customers -> 'customers' collection`);
  }

  // 4. Migrate Blogs
  const blogs = readJson(path.join(__dirname, "blogs.json"), []);
  if (blogs.length > 0) {
    const col = db.collection("blogs");
    await col.deleteMany({});
    await col.insertMany(blogs);
    console.log(`[OK] Migrated ${blogs.length} blogs -> 'blogs' collection`);
  }

  // 5. Migrate Banners
  const banners = readJson(path.join(__dirname, "banners.json"), []);
  if (banners.length > 0) {
    const col = db.collection("banners");
    await col.deleteMany({});
    await col.insertMany(banners);
    console.log(`[OK] Migrated ${banners.length} banners -> 'banners' collection`);
  }

  // 6. Migrate Categories (from public/categories.json)
  const categories = readJson(path.join(__dirname, "public", "categories.json"), []);
  if (categories.length > 0) {
    const col = db.collection("categories");
    await col.deleteMany({});
    await col.insertMany(categories);
    console.log(`[OK] Migrated ${categories.length} categories -> 'categories' collection`);
  }

  // 7. Migrate Return Gifts
  const returnGifts = readJson(path.join(__dirname, "public", "return_gifts.json"), []);
  if (returnGifts.length > 0) {
    const col = db.collection("return_gifts");
    await col.deleteMany({});
    await col.insertMany(returnGifts);
    console.log(`[OK] Migrated ${returnGifts.length} return gifts -> 'return_gifts' collection`);
  }

  // 8. Migrate Catalog & Flattened Products
  const catalog = readJson(path.join(__dirname, "public", "products.json"), []);
  if (catalog.length > 0) {
    // A. Catalog Categories hierarchy
    const catCol = db.collection("product_catalog");
    await catCol.deleteMany({});
    await catCol.insertMany(catalog);
    console.log(`[OK] Migrated ${catalog.length} category trees -> 'product_catalog' collection`);

    // B. Individual Flattened Products
    const allProducts = [];
    catalog.forEach((cat, catIdx) => {
      const categoryName = cat.name === "23_evening" ? "Luxury Home Decor" : cat.name;
      cat.subcategories?.forEach((sub, subIdx) => {
        const subName = sub.name === "evening_collection" ? "Bespoke Artisanal Collection" : sub.name;
        const itemKey = sub.images ? "images" : sub.products ? "products" : "services";
        const items = sub[itemKey] || [];
        items.forEach((item, idx) => {
          const id = item.prod_id || item.id || `prod_${catIdx}_${subIdx}_${idx}`;
          let imageUrl = item.image || "";
          if (imageUrl && imageUrl.startsWith("/")) {
            imageUrl = `/products${imageUrl.replace(/^\/products/, "")}`;
          }
          allProducts.push({
            id,
            prod_id: id,
            title: item.title || item.name || `Product ${id}`,
            name: item.name || item.title || `Product ${id}`,
            description: item.description || "",
            price: Number(item.price) || 0,
            actPrice: Number(item["act-price"]) || Number(item.actual_price) || Number(item.price) || 0,
            image: imageUrl,
            category: categoryName,
            subCategory: subName,
            rating: item.rating || parseFloat((4.0 + (idx % 11) * 0.1).toFixed(1)),
            reviewsCount: item.reviewsCount || 10 + (idx % 20) * 5,
            matchPercent: item.matchPercent || 80 + (idx % 15),
            commentsCount: item.commentsCount || 2 + (idx % 5),
            createdAt: new Date().toISOString()
          });
        });
      });
    });

    if (allProducts.length > 0) {
      const prodCol = db.collection("products");
      await prodCol.deleteMany({});
      await prodCol.insertMany(allProducts);
      // Create indexes for fast searches
      await prodCol.createIndex({ id: 1 }, { unique: true });
      await prodCol.createIndex({ category: 1 });
      await prodCol.createIndex({ title: "text", description: "text" });
      console.log(`[OK] Migrated ${allProducts.length} flattened products -> 'products' collection (with indexes)`);
    }
  }

  // 9. Migrate Chats
  const chats = readJson(path.join(__dirname, "chats.json"), []);
  if (chats.length > 0) {
    const col = db.collection("chats");
    await col.deleteMany({});
    await col.insertMany(chats);
    console.log(`[OK] Migrated ${chats.length} chat threads -> 'chats' collection`);
  }

  // 10. Migrate Reviews
  const reviewsObj = readJson(path.join(__dirname, "reviews.json"), {});
  const reviewEntries = Object.entries(reviewsObj).map(([productId, reviews]) => ({
    productId,
    reviews
  }));
  if (reviewEntries.length > 0) {
    const col = db.collection("reviews");
    await col.deleteMany({});
    await col.insertMany(reviewEntries);
    console.log(`[OK] Migrated reviews for ${reviewEntries.length} products -> 'reviews' collection`);
  }

  // 11. Migrate Homepage Layout
  const homepageLayout = readJson(path.join(__dirname, "homepage_layout.json"), { sections: [] });
  const homeCol = db.collection("homepage_layout");
  await homeCol.deleteMany({});
  await homeCol.insertOne({ ...homepageLayout, id: "default_layout" });
  console.log(`[OK] Migrated homepage layout -> 'homepage_layout' collection`);

  // 12. Migrate Flash Sale
  const flashsale = readJson(path.join(__dirname, "flashsale.json"), null);
  if (flashsale) {
    const col = db.collection("flashsale");
    await col.deleteMany({});
    await col.insertOne({ ...flashsale, id: "active_flashsale" });
    console.log(`[OK] Migrated flash sale settings -> 'flashsale' collection`);
  }

  // 13. Migrate Analytics
  const analytics = readJson(path.join(__dirname, "analytics.json"), null);
  if (analytics) {
    const col = db.collection("analytics");
    await col.deleteMany({});
    await col.insertOne({ ...analytics, id: "main_analytics" });
    console.log(`[OK] Migrated analytics data -> 'analytics' collection`);
  }

  // 14. Migrate Notifications
  const notifications = readJson(path.join(__dirname, "notifications.json"), []);
  if (notifications.length > 0) {
    const col = db.collection("notifications");
    await col.deleteMany({});
    await col.insertMany(notifications);
    console.log(`[OK] Migrated ${notifications.length} notifications -> 'notifications' collection`);
  }

  console.log("\n=================================================");
  console.log("   ALL JSON DATA SUCCESSFULLY MIGRATED TO ATLAS! ");
  console.log("=================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("\n[FATAL ERROR] Migration failed:", err);
  process.exit(1);
});
