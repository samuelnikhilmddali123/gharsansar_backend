require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://samuelnikhilmddali123_db_user:B8WE55v2uAxsSQrX@cluster0.0uuwpyl.mongodb.net/gharsansar?retryWrites=true&w=majority";

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.getClient().db("gharsansar");
  const usersCol = db.collection("users");

  const existingUsers = await usersCol.find({}).toArray();
  console.log(`Found ${existingUsers.length} existing users in Atlas.`);

  let nextIntId = 1;

  for (const doc of existingUsers) {
    let intId = typeof doc.id === "number" ? doc.id : nextIntId++;

    const firstAddr = (doc.addresses && doc.addresses.length > 0) ? doc.addresses[0] : null;

    const email = doc.email || "";
    const password_hash = doc.password_hash || doc.password || "";
    const full_name = doc.full_name || doc.name || "";
    const phone = doc.phone || (firstAddr ? (firstAddr.phone || "") : "");
    const company_name = doc.company_name || "";
    const gstin = doc.gstin || "";
    const role = (doc.role === "admin" || doc.role === "ADMIN") ? "ADMIN" : "CUSTOMER";
    const is_active = doc.is_active !== undefined ? Boolean(doc.is_active) : true;
    const firebase_uid = doc.firebase_uid || "";
    const photo_url = doc.photo_url || doc.profilePicture || "";
    const street_address = doc.street_address || (firstAddr ? (firstAddr.address || firstAddr.street_address || "") : "");
    const city = doc.city || (firstAddr ? (firstAddr.city || "") : "");
    const state = doc.state || (firstAddr ? (firstAddr.state || "") : "");
    const pincode = doc.pincode || (firstAddr ? (firstAddr.zipCode || firstAddr.pincode || "") : "");
    const created_at = doc.created_at || (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString());
    const __v = 0;
    const createdAt = doc.createdAt ? new Date(doc.createdAt) : new Date();
    const updatedAt = new Date();

    const newDoc = {
      id: intId,
      email,
      password_hash,
      full_name,
      phone,
      company_name,
      gstin,
      role,
      is_active,
      firebase_uid,
      photo_url,
      street_address,
      city,
      state,
      pincode,
      created_at,
      __v,
      createdAt,
      updatedAt
    };

    if (doc.addresses && doc.addresses.length > 0) {
      newDoc.addresses = doc.addresses;
    }

    // Replace the document while preserving its _id
    await usersCol.replaceOne({ _id: doc._id }, newDoc);
    console.log(`Migrated user: ${email} -> id: ${intId}, full_name: "${full_name}", role: ${role}`);
  }

  const updatedUsers = await usersCol.find({}).toArray();
  console.log("Migration complete. Sample updated document in Atlas:");
  console.log(JSON.stringify(updatedUsers[1] || updatedUsers[0], null, 2));

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
