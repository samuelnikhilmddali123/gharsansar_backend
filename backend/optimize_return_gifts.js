const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const BACKEND_DIR = __dirname;
const BACKEND_GIFTS_DIR = path.join(BACKEND_DIR, 'public', 'return gifts');
const BACKEND_BACKUP_DIR = path.join(BACKEND_DIR, 'public', 'return_gifts_original_backup');
const BACKEND_JSON = path.join(BACKEND_DIR, 'public', 'return_gifts.json');

const FRONTEND_DIR = path.join(__dirname, '..', 'ghar_sansar_frontend');
const FRONTEND_GIFTS_DIR = path.join(FRONTEND_DIR, 'public', 'return gifts');
const FRONTEND_BACKUP_DIR = path.join(FRONTEND_DIR, 'public', 'return_gifts_original_backup');
const FRONTEND_JSON = path.join(FRONTEND_DIR, 'public', 'return_gifts.json');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://samuelnikhilmddali123_db_user:B8WE55v2uAxsSQrX@cluster0.0uuwpyl.mongodb.net/gharsansar?retryWrites=true&w=majority";

async function main() {
  console.log("=== GHAR SANSAR RETURN GIFTS OPTIMIZATION ===");

  // 1. Ensure backup directories
  if (!fs.existsSync(BACKEND_BACKUP_DIR)) fs.mkdirSync(BACKEND_BACKUP_DIR, { recursive: true });
  if (fs.existsSync(FRONTEND_DIR) && !fs.existsSync(FRONTEND_BACKUP_DIR)) {
    fs.mkdirSync(FRONTEND_BACKUP_DIR, { recursive: true });
  }

  // 2. Locate PNG files
  const files = fs.readdirSync(BACKEND_GIFTS_DIR).filter(f => f.toLowerCase().endsWith('.png'));
  console.log(`Found ${files.length} PNG images in ${BACKEND_GIFTS_DIR}`);

  let totalOriginalSize = 0;
  let totalWebpSize = 0;
  let totalOptimizedPngSize = 0;

  for (const file of files) {
    const originalPath = path.join(BACKEND_GIFTS_DIR, file);
    const backupPath = path.join(BACKEND_BACKUP_DIR, file);
    const originalSize = fs.statSync(originalPath).size;
    totalOriginalSize += originalSize;

    // Backup original if not already backed up
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(originalPath, backupPath);
    }
    if (fs.existsSync(FRONTEND_BACKUP_DIR)) {
      const frontendBackupPath = path.join(FRONTEND_BACKUP_DIR, file);
      if (!fs.existsSync(frontendBackupPath)) {
        fs.copyFileSync(originalPath, frontendBackupPath);
      }
    }

    const baseName = path.basename(file, path.extname(file));
    const webpName = `${baseName}.webp`;
    const backendWebpPath = path.join(BACKEND_GIFTS_DIR, webpName);
    const frontendWebpPath = path.join(FRONTEND_GIFTS_DIR, webpName);

    // Read original image buffer
    const inputBuffer = fs.readFileSync(backupPath);

    // Convert to WebP (600px width max, quality 82, stripped metadata)
    const webpBuffer = await sharp(inputBuffer)
      .resize({ width: 600, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toBuffer();

    fs.writeFileSync(backendWebpPath, webpBuffer);
    if (fs.existsSync(FRONTEND_GIFTS_DIR)) {
      fs.writeFileSync(frontendWebpPath, webpBuffer);
    }
    totalWebpSize += webpBuffer.length;

    // Also produce an optimized 600px PNG fallback in place of original 2.3MB raw PNG
    const optimizedPngBuffer = await sharp(inputBuffer)
      .resize({ width: 600, withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 80, palette: true })
      .toBuffer();

    fs.writeFileSync(originalPath, optimizedPngBuffer);
    if (fs.existsSync(FRONTEND_GIFTS_DIR)) {
      fs.writeFileSync(path.join(FRONTEND_GIFTS_DIR, file), optimizedPngBuffer);
    }
    totalOptimizedPngSize += optimizedPngBuffer.length;

    console.log(`[Processed] ${file}: ${(originalSize / 1024 / 1024).toFixed(2)} MB -> WebP: ${(webpBuffer.length / 1024).toFixed(1)} KB (-${((1 - webpBuffer.length / originalSize) * 100).toFixed(1)}%), Opt PNG: ${(optimizedPngBuffer.length / 1024).toFixed(1)} KB`);
  }

  console.log("\n--- SIZE SUMMARY ---");
  console.log(`Original Total: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`WebP Total:     ${(totalWebpSize / 1024 / 1024).toFixed(2)} MB (${Math.round(totalWebpSize / 1024)} KB)`);
  console.log(`Opt PNG Total:  ${(totalOptimizedPngSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Payload Reduction: -${((1 - totalWebpSize / totalOriginalSize) * 100).toFixed(2)}%`);

  // 3. Update return_gifts.json in backend & frontend
  console.log("\n--- UPDATING JSON FILES ---");
  if (fs.existsSync(BACKEND_JSON)) {
    const raw = fs.readFileSync(BACKEND_JSON, 'utf8');
    const updated = raw.replace(/\/return%20gifts\/([^"]+)\.png/g, '/return gifts/$1.webp')
                       .replace(/\/return gifts\/([^"]+)\.png/g, '/return gifts/$1.webp');
    fs.writeFileSync(BACKEND_JSON, updated, 'utf8');
    console.log(`[OK] Updated ${BACKEND_JSON}`);
  }

  if (fs.existsSync(FRONTEND_JSON)) {
    const raw = fs.readFileSync(FRONTEND_JSON, 'utf8');
    const updated = raw.replace(/\/return%20gifts\/([^"]+)\.png/g, '/return gifts/$1.webp')
                       .replace(/\/return gifts\/([^"]+)\.png/g, '/return gifts/$1.webp');
    fs.writeFileSync(FRONTEND_JSON, updated, 'utf8');
    console.log(`[OK] Updated ${FRONTEND_JSON}`);
  }

  // 4. Update MongoDB Atlas collection 'return_gifts'
  console.log("\n--- UPDATING MONGODB ATLAS ---");
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    const db = mongoose.connection.getClient().db("gharsansar");
    const col = db.collection("return_gifts");
    
    const docs = await col.find({}).toArray();
    console.log(`Found ${docs.length} documents in MongoDB 'return_gifts' collection.`);

    let updatedCount = 0;
    for (const doc of docs) {
      if (doc.image && doc.image.includes('.png')) {
        const newImage = doc.image.replace(/\.png$/i, '.webp');
        await col.updateOne({ _id: doc._id }, { $set: { image: newImage } });
        updatedCount++;
      }
    }
    console.log(`[OK] Updated ${updatedCount} MongoDB documents to .webp images.`);
    await mongoose.disconnect();
  } catch (mongoErr) {
    console.error("[WARN] MongoDB update failed:", mongoErr.message);
  }

  console.log("\n=== OPTIMIZATION COMPLETE ===");
}

main().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
