require('./node_modules/dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const backendPublic = path.join(__dirname, 'public');
const frontendPublic = path.join(__dirname, '..', 'ghar_sansar_frontend', 'public');
const productsJsonPath = path.join(backendPublic, 'products.json');
const frontendProductsJsonPath = path.join(frontendPublic, 'products.json');

const harshadeepDir = path.join(backendPublic, 'products', 'Harshadeep pots');
const miltonDir = path.join(backendPublic, 'products', 'Milton Water Bottle');

if (!fs.existsSync(harshadeepDir)) {
  console.error('Harshadeep pots dir not found:', harshadeepDir);
  process.exit(1);
}
if (!fs.existsSync(miltonDir)) {
  console.error('Milton dir not found:', miltonDir);
  process.exit(1);
}

const harshFiles = fs.readdirSync(harshadeepDir).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
const miltonFiles = fs.readdirSync(miltonDir).filter(f => /\.(png|jpe?g|webp)$/i.test(f));

console.log(`Found ${harshFiles.length} Harshadeep pots files`);
console.log(`Found ${miltonFiles.length} Milton bottles files`);

// 1. Build Harshadeep products
const harshProducts = harshFiles.map((file, idx) => {
  const cleanName = file.replace(/\.(png|jpe?g|webp)$/i, '').trim();
  const title = `Harshadeep ${cleanName}`;
  
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const priceOptions = [349, 399, 449, 499, 549, 599, 649, 699, 799, 849, 899, 999, 1199, 1299, 1499];
  const price = priceOptions[Math.abs(hash) % priceOptions.length];
  const actPrice = Math.round(price * 1.35 + 50);

  return {
    prod_id: `harshadeep_pot_${idx + 1}`,
    id: `harshadeep_pot_${idx + 1}`,
    name: title,
    title: title,
    image: `/products/Harshadeep pots/${file}`,
    description: `Premium quality ${title}. Crafted from high-grade, durable, UV-stabilized materials for modern homes and gardens. Features excellent drainage and aesthetic finishes.`,
    price: price,
    "act-price": actPrice,
    actualPrice: actPrice,
    stock: 40 + (Math.abs(hash) % 40)
  };
});

// 2. Build Milton products
const miltonProducts = miltonFiles.map((file, idx) => {
  let cleanName = file.replace(/\.(png|jpe?g|webp)$/i, '').trim();
  cleanName = cleanName.replace(/–/g, '-');
  const title = /^milton/i.test(cleanName) ? cleanName : `Milton ${cleanName}`;

  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const priceOptions = [399, 449, 499, 549, 599, 649, 699, 749, 799, 849, 899, 999, 1099, 1199, 1299];
  const price = priceOptions[Math.abs(hash) % priceOptions.length];
  const actPrice = Math.round(price * 1.35 + 50);

  return {
    prod_id: `milton_bottle_${idx + 1}`,
    id: `milton_bottle_${idx + 1}`,
    name: title,
    title: title,
    image: `/products/Milton Water Bottle/${file}`,
    description: `Authentic ${title}. Features double-wall vacuum insulation, food-grade 304 stainless steel, 100% leak-proof cap, and superior hot & cold temperature retention.`,
    price: price,
    "act-price": actPrice,
    actualPrice: actPrice,
    stock: 50 + (Math.abs(hash) % 35)
  };
});

// 3. Load existing products.json
const catalog = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

// Update Harshdeep Planters category
const harshCatIdx = catalog.findIndex(c => c.name && c.name.toLowerCase().includes('harsh'));
if (harshCatIdx !== -1) {
  const existingSubcats = catalog[harshCatIdx].subcategories || [];
  // Keep existing 80 products subcategory
  const origSubcat = existingSubcats.find(s => s.name === 'Planters & Pots') || existingSubcats[0];
  
  // Create / replace 'Harshadeep Designer Pots' subcategory with the 171 new pots
  catalog[harshCatIdx].name = "Harshdeep Planters";
  catalog[harshCatIdx].subcategories = [
    {
      sub_id: 'sub_harshadeep_designer_pots',
      name: 'Harshadeep Designer Pots',
      products: harshProducts
    },
    origSubcat
  ];
  console.log(`Updated Harshdeep Planters: now has ${catalog[harshCatIdx].subcategories[0].products.length} designer pots + ${catalog[harshCatIdx].subcategories[1].products?.length || catalog[harshCatIdx].subcategories[1].images?.length} original items`);
} else {
  catalog.push({
    cat_id: 'cat_harshadeep_planters',
    name: 'Harshdeep Planters',
    subcategories: [
      {
        sub_id: 'sub_harshadeep_designer_pots',
        name: 'Harshadeep Designer Pots',
        products: harshProducts
      }
    ]
  });
}

// Add or update Milton Water Bottles category
const miltonCatIdx = catalog.findIndex(c => c.name && c.name.toLowerCase().includes('milton'));
const miltonCat = {
  cat_id: 'cat_milton_water_bottles',
  name: 'Milton Water Bottles',
  subcategories: [
    {
      sub_id: 'sub_milton_bottles_1',
      name: 'Thermosteel & Water Bottles',
      products: miltonProducts
    }
  ]
};

if (miltonCatIdx !== -1) {
  catalog[miltonCatIdx] = miltonCat;
  console.log(`Updated existing Milton Water Bottles category with ${miltonProducts.length} items`);
} else {
  // Insert Milton after Cello or Water Bottles & Jars
  const insertAfter = catalog.findIndex(c => c.name === 'Cello');
  if (insertAfter !== -1) {
    catalog.splice(insertAfter + 1, 0, miltonCat);
  } else {
    catalog.push(miltonCat);
  }
  console.log(`Added new Milton Water Bottles category with ${miltonProducts.length} items`);
}

// 4. Save updated JSON to backend/public and frontend/public
fs.writeFileSync(productsJsonPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`[OK] Saved to ${productsJsonPath}`);

fs.writeFileSync(frontendProductsJsonPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`[OK] Saved to ${frontendProductsJsonPath}`);

// Also copy images to frontend/public/products if not already there
fs.cpSync(harshadeepDir, path.join(frontendPublic, 'products', 'Harshadeep pots'), { recursive: true });
fs.cpSync(miltonDir, path.join(frontendPublic, 'products', 'Milton Water Bottle'), { recursive: true });
console.log('[OK] Assets synchronized to frontend/public/products');

// 5. Connect to MongoDB Atlas and persist
async function syncToMongo() {
  const uri = process.env.MONGODB_URI;
  console.log('[MongoDB Atlas] Connecting to database...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.getClient().db('gharsansar');
  console.log('[MongoDB Atlas] Connected successfully');

  // A. Update product_catalog collection
  const catCol = db.collection('product_catalog');
  await catCol.deleteMany({});
  const cleanCatalog = catalog.map(c => {
    const copy = { ...c };
    delete copy._id;
    return copy;
  });
  await catCol.insertMany(cleanCatalog);
  console.log(`[OK] Saved ${cleanCatalog.length} category trees to MongoDB Atlas 'product_catalog'`);

  // B. Update flattened products collection
  const allFlattened = [];
  cleanCatalog.forEach((cat, catIdx) => {
    const categoryName = cat.name === '23_evening' ? 'Luxury Home Decor' : cat.name;
    cat.subcategories?.forEach((sub, subIdx) => {
      const subName = sub.name === 'evening_collection' ? 'Bespoke Artisanal Collection' : sub.name;
      const items = sub.products || sub.images || sub.services || [];
      items.forEach((item, idx) => {
        const id = item.prod_id || item.id || `prod_${catIdx}_${subIdx}_${idx}`;
        let imageUrl = item.image || '';
        if (imageUrl && imageUrl.startsWith('/')) {
          imageUrl = `/products${imageUrl.replace(/^\/products/, '')}`;
        }
        allFlattened.push({
          id,
          prod_id: id,
          title: item.title || item.name || `Product ${id}`,
          name: item.name || item.title || `Product ${id}`,
          description: item.description || '',
          price: Number(item.price) || 0,
          actPrice: Number(item['act-price']) || Number(item.actual_price) || Number(item.price) || 0,
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

  const prodCol = db.collection('products');
  await prodCol.deleteMany({});
  await prodCol.insertMany(allFlattened);
  console.log(`[OK] Saved ${allFlattened.length} flattened products to MongoDB Atlas 'products'`);

  await mongoose.disconnect();
  console.log('[OK] MongoDB Atlas synchronization complete!');
}

syncToMongo().catch(err => {
  console.error('[ERROR] MongoDB Atlas sync failed:', err);
  process.exit(1);
});
