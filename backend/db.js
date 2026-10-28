require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://samuelnikhilmddali123_db_user:B8WE55v2uAxsSQrX@cluster0.0uuwpyl.mongodb.net/gharsansar?retryWrites=true&w=majority";

const atlasCache = {};
let dbInstance = null;

const COLLECTION_MAP = {
  "users.json": "users",
  "orders.json": "orders",
  "customers.json": "customers",
  "blogs.json": "blogs",
  "banners.json": "banners",
  "categories.json": "categories",
  "collections.json": "collections",
  "homepage_layout.json": "homepage_layout",
  "flashsale.json": "flashsale",
  "analytics.json": "analytics",
  "notifications.json": "notifications",
  "customer_notifications.json": "customer_notifications",
  "chats.json": "chats",
  "reviews.json": "reviews",
  "wishlist.json": "wishlists",
  "wishlists.json": "wishlists",
  "carts.json": "carts",
  "cart.json": "carts",
  "push_tokens.json": "push_tokens",
  "products.json": "product_catalog",
  "return_gifts.json": "return_gifts",
  "23_evening_products.json": "product_catalog",
  "category_discounts.json": "category_discounts",
  "discounts.json": "category_discounts"
};

const resolveCollectionName = (filePath) => {
  const base = path.basename(filePath);
  return COLLECTION_MAP[base] || base.replace(/\.json$/, "");
};

async function initDatabase() {
  console.log("[MongoDB Atlas] Connecting to database...");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  dbInstance = mongoose.connection.getClient().db("gharsansar");
  console.log("[MongoDB Atlas] Connected to database: gharsansar");

  // Pre-load all collections into cache
  const collections = await dbInstance.listCollections().toArray();
  for (const c of collections) {
    const colName = c.name;
    const col = dbInstance.collection(colName);

    if (["homepage_layout", "flashsale", "analytics"].includes(colName)) {
      const doc = await col.findOne({});
      if (doc) {
        delete doc._id;
        atlasCache[colName] = doc;
      } else {
        atlasCache[colName] = {};
      }
    } else if (colName === "reviews") {
      const list = await col.find({}).toArray();
      const reviewsMap = {};
      list.forEach(r => {
        if (r.productId && r.reviews) {
          reviewsMap[r.productId] = r.reviews;
        }
      });
      atlasCache[colName] = reviewsMap;
    } else if (colName === "users") {
      const docs = await col.find({}).toArray();
      docs.forEach(d => {
        d._id = d._id ? d._id.toString() : undefined;
        // backwards compat helpers
        d.name = d.full_name || d.name || "";
        d.password = d.password_hash || d.password || "";
        d.profilePicture = d.photo_url || d.profilePicture || "";
      });
      atlasCache[colName] = docs;
    } else {
      const docs = await col.find({}).toArray();
      docs.forEach(d => delete d._id);
      atlasCache[colName] = docs;
    }
  }

  // Ensure default cache for all known collections if empty or missing
  for (const colName of Object.values(COLLECTION_MAP)) {
    if (atlasCache[colName] === undefined) {
      if (["homepage_layout", "flashsale", "analytics"].includes(colName)) {
        atlasCache[colName] = {};
      } else if (colName === "reviews") {
        atlasCache[colName] = {};
      } else {
        atlasCache[colName] = [];
      }
    }
  }

  // Ensure unique indexes on users collection for email and phone
  try {
    const usersCol = dbInstance.collection("users");
    await usersCol.createIndex(
      { email: 1 },
      { unique: true, collation: { locale: "en", strength: 2 } }
    );
    await usersCol.createIndex(
      { phone: 1 },
      { unique: true, partialFilterExpression: { phone: { $type: "string", $gt: "" } } }
    );
    console.log("[MongoDB Atlas] Unique indexes active for users: email & phone");
  } catch (idxErr) {
    console.warn("[MongoDB Atlas] Index setup warning:", idxErr.message);
  }

  // Ensure indexes for carts, wishlists, and orders
  try {
    const cartsCol = dbInstance.collection("carts");
    await cartsCol.createIndex({ userId: 1 }, { unique: true });
    
    const wishlistsCol = dbInstance.collection("wishlists");
    await wishlistsCol.createIndex({ userId: 1 }, { unique: true });

    const ordersCol = dbInstance.collection("orders");
    await ordersCol.createIndex({ id: 1 }, { unique: true });
    await ordersCol.createIndex({ userId: 1 });
    await ordersCol.createIndex({ "customer.email": 1 });

    const discountsCol = dbInstance.collection("category_discounts");
    await discountsCol.createIndex({ id: 1 }, { unique: true });
    await discountsCol.createIndex({ category: 1, status: 1 });
    console.log("[MongoDB Atlas] Indexes active for carts, wishlists, orders & category_discounts");
  } catch (idxErr) {
    console.warn("[MongoDB Atlas] Ecommerce index setup warning:", idxErr.message);
  }

  console.log(`[MongoDB Atlas] Cached ${Object.keys(atlasCache).length} collections in memory from Atlas`);
  return dbInstance;
}

function readData(filePath, defaultData = []) {
  const colName = resolveCollectionName(filePath);
  if (atlasCache[colName] !== undefined) {
    return atlasCache[colName];
  }
  if (fs.existsSync(filePath)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      atlasCache[colName] = fileData;
      return fileData;
    } catch (e) {}
  }
  return defaultData;
}

function writeData(filePath, data) {
  const colName = resolveCollectionName(filePath);
  atlasCache[colName] = data;

  if (!dbInstance) return;

  // Persist asynchronously to MongoDB Atlas
  const col = dbInstance.collection(colName);
  (async () => {
    try {
      if (["homepage_layout", "flashsale", "analytics"].includes(colName)) {
        await col.deleteMany({});
        await col.insertOne({ ...data, _persistedAt: new Date().toISOString() });
      } else if (colName === "reviews") {
        await col.deleteMany({});
        const entries = Object.entries(data).map(([productId, reviews]) => ({
          productId,
          reviews
        }));
        if (entries.length > 0) {
          await col.insertMany(entries);
        }
      } else if (colName === "users" && Array.isArray(data)) {
        for (const item of data) {
          const doc = {
            id: typeof item.id === "number" ? item.id : (parseInt(String(item.id).replace(/\D/g, "")) || 1),
            email: (item.email || "").trim(),
            password_hash: item.password_hash || item.password || "",
            full_name: (item.full_name || item.name || "").trim(),
            phone: (item.phone || "").replace(/\D/g, ""),
            company_name: item.company_name || "",
            gstin: item.gstin || "",
            role: (item.role && item.role.toLowerCase() === "admin") ? "ADMIN" : "CUSTOMER",
            is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
            firebase_uid: item.firebase_uid || "",
            photo_url: item.photo_url || item.profilePicture || "",
            street_address: item.street_address || (item.addresses && item.addresses[0] ? (item.addresses[0].address || item.addresses[0].street_address || "") : ""),
            city: item.city || (item.addresses && item.addresses[0] ? item.addresses[0].city || "" : ""),
            state: item.state || (item.addresses && item.addresses[0] ? item.addresses[0].state || "" : ""),
            pincode: item.pincode || (item.addresses && item.addresses[0] ? (item.addresses[0].zipCode || item.addresses[0].pincode || "") : ""),
            created_at: item.created_at || (item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()),
            __v: item.__v !== undefined ? item.__v : 0,
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            updatedAt: new Date()
          };
          if (item.addresses && Array.isArray(item.addresses)) {
            doc.addresses = item.addresses;
          }
          await col.updateOne(
            { email: doc.email },
            { $set: doc },
            { upsert: true }
          );
        }
      } else if (Array.isArray(data)) {
        await col.deleteMany({});
        if (data.length > 0) {
          // Remove internal _id if any
          const clean = data.map(item => {
            const copy = { ...item };
            delete copy._id;
            return copy;
          });
          await col.insertMany(clean);
        }
      }
    } catch (err) {
      console.error(`[MongoDB Atlas Error] Failed to persist '${colName}':`, err.message);
    }
  })();
}

function getDatabase() {
  return dbInstance;
}

module.exports = {
  initDatabase,
  readData,
  writeData,
  getDatabase,
  atlasCache
};
