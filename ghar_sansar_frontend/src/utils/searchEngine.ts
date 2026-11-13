import React from "react";
import { Product } from "../context/ProductContext";

export interface SearchMatchResult {
  match: boolean;
  score: number;
}

export interface InteriorCategoryMapping {
  canonical: string;
  synonyms: string[];
}

export interface SpellingCorrectionResult {
  original: string;
  corrected: string;
  isCorrected: boolean;
}

export interface RecommendationResult {
  keywordSuggestions: string[];
  matchedProducts: Product[];
  interiorMatches: { title: string; category: string }[];
  didYouMean: SpellingCorrectionResult | null;
}

/**
 * Fast Damerau-Levenshtein Distance calculation with 2-row memory buffer.
 * Supports insertions, deletions, substitutions, and character transpositions.
 */
export function getEditDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const al = a.length;
  const bl = b.length;
  let prevRow = new Array(bl + 1);
  let currRow = new Array(bl + 1);

  for (let j = 0; j <= bl; j++) prevRow[j] = j;

  for (let i = 1; i <= al; i++) {
    currRow[0] = i;
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let min = Math.min(
        currRow[j - 1] + 1,      // insertion
        prevRow[j] + 1,          // deletion
        prevRow[j - 1] + cost    // substitution
      );

      // Damerau transposition check
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        min = Math.min(min, prevRow[j - 2] + 1);
      }

      currRow[j] = min;
    }

    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[bl];
}

/**
 * Complete, authoritative registry of all Ghar Sansar Interior Design categories and their synonyms.
 */
export const INTERIOR_CATEGORIES: InteriorCategoryMapping[] = [
  {
    canonical: "Sofa Cover",
    synonyms: [
      "sofa cover",
      "sofa covers",
      "sofacover",
      "sofaclovers",
      "sofa",
      "sofas",
      "slipcover",
      "slipcovers",
      "couch cover",
      "couch covers",
      "sofa cloth",
      "sofa fabric",
      "sofa upholstery",
      "chair cover",
      "chair covers"
    ]
  },
  {
    canonical: "3D Wallpapers",
    synonyms: [
      "3d wallpaper",
      "3d wallpapers",
      "3d mural",
      "3d murals",
      "mural",
      "murals",
      "3d wall mural",
      "wall mural",
      "wall murals"
    ]
  },
  {
    canonical: "Wallpaper Rolls",
    synonyms: [
      "wallpaper roll",
      "wallpaper rolls",
      "wallpaper sheet",
      "wallpaper sheets",
      "wall paper rolls"
    ]
  },
  {
    canonical: "Wallpapers",
    synonyms: [
      "wallpaper",
      "wallpapers",
      "wall paper",
      "wall papers",
      "designer wallpaper",
      "room wallpaper"
    ]
  },
  {
    canonical: "Wall Art Affects",
    synonyms: [
      "wall art",
      "wall arts",
      "wall art effects",
      "wall art affects",
      "led wall art",
      "wooden wall art",
      "backlit wall art",
      "acrylic wall art"
    ]
  },
  {
    canonical: "Vinyl Flooring",
    synonyms: [
      "vinyl flooring",
      "vinyl floor",
      "vinyl planks",
      "pvc flooring",
      "luxury vinyl",
      "vinyl tile"
    ]
  },
  {
    canonical: "Wooden Flooring",
    synonyms: [
      "wooden flooring",
      "wood flooring",
      "hardwood flooring",
      "laminate flooring",
      "wooden planks",
      "wooden floor"
    ]
  },
  {
    canonical: "Gym Flooring",
    synonyms: [
      "gym flooring",
      "rubber flooring",
      "gym floor",
      "gym mats",
      "rubber gym tiles",
      "weight room floor"
    ]
  },
  {
    canonical: "EPDM Flooring",
    synonyms: [
      "epdm flooring",
      "epdm",
      "play area flooring",
      "kids play flooring",
      "sports flooring"
    ]
  },
  {
    canonical: "ICU Flooring",
    synonyms: [
      "icu flooring",
      "hospital flooring",
      "antimicrobial flooring",
      "clinic flooring"
    ]
  },
  {
    canonical: "Blinds",
    synonyms: [
      "blinds",
      "blind",
      "window blinds",
      "roller blinds",
      "roman blinds",
      "venetian blinds",
      "wooden blinds",
      "vertical blinds",
      "zebra blinds"
    ]
  },
  {
    canonical: "Automation Motorised Blinds",
    synonyms: [
      "motorised blinds",
      "motorized blinds",
      "smart blinds",
      "electric blinds",
      "automated blinds",
      "remote blinds"
    ]
  },
  {
    canonical: "Sky Light Blinds",
    synonyms: [
      "sky light blinds",
      "skylight blinds",
      "roof blinds",
      "glass roof blinds",
      "ceiling blinds"
    ]
  },
  {
    canonical: "Curtains",
    synonyms: [
      "curtains",
      "curtain",
      "drapes",
      "drapery",
      "window curtains",
      "sheer curtains",
      "blackout curtains",
      "velvet curtains",
      "living room curtains"
    ]
  },
  {
    canonical: "Hospital Curtains",
    synonyms: [
      "hospital curtains",
      "cubicle curtains",
      "medical curtains",
      "partition curtains",
      "clinic curtains"
    ]
  },
  {
    canonical: "Natural Vertical Garden",
    synonyms: [
      "natural vertical garden",
      "vertical garden",
      "vertical gardens",
      "green wall",
      "living green wall",
      "bio wall",
      "living wall"
    ]
  },
  {
    canonical: "Artificial Wall Garden",
    synonyms: [
      "artificial wall garden",
      "artificial vertical garden",
      "synthetic green wall",
      "fake green wall",
      "artificial greenery"
    ]
  },
  {
    canonical: "Artificial Lawn",
    synonyms: [
      "artificial lawn",
      "artificial grass",
      "fake grass",
      "synthetic turf",
      "astro turf",
      "lawn turf",
      "balcony grass"
    ]
  },
  {
    canonical: "Sliding & Metal Door",
    synonyms: [
      "sliding door",
      "sliding doors",
      "metal door",
      "metal doors",
      "sliding & metal door",
      "glass partition",
      "sliding glass door",
      "metal sliding partition"
    ]
  },
  {
    canonical: "Invisible Grill",
    synonyms: [
      "invisible grill",
      "invisible grills",
      "balcony grill",
      "safety grill",
      "balcony safety grill",
      "invisible safety grill",
      "safety wire"
    ]
  },
  {
    canonical: "Pigeon Net",
    synonyms: [
      "pigeon net",
      "pigeon nets",
      "pigeon netting",
      "bird net",
      "bird nets",
      "bird netting",
      "balcony bird net",
      "anti bird net"
    ]
  },
  {
    canonical: "Mosquito Doors & Windows",
    synonyms: [
      "mosquito net",
      "mosquito nets",
      "mosquito door",
      "mosquito doors",
      "mosquito window",
      "mosquito windows",
      "insect screen",
      "mosquito mesh",
      "pleated mesh"
    ]
  },
  {
    canonical: "Cloth Dry Well",
    synonyms: [
      "cloth dry well",
      "cloth drying",
      "ceiling cloth hanger",
      "pulley cloth hanger",
      "clothes drying rack",
      "balcony cloth hanger"
    ]
  },
  {
    canonical: "Bubble Fountain",
    synonyms: [
      "bubble fountain",
      "bubble wall",
      "bubble panel",
      "acrylic bubble wall"
    ]
  },
  {
    canonical: "Customised Water Fountain",
    synonyms: [
      "water fountain",
      "customised water fountain",
      "custom water fountain",
      "indoor water fountain",
      "stone water fountain",
      "garden fountain"
    ]
  },
  {
    canonical: "Terrace & Outdoor Gardening",
    synonyms: [
      "terrace garden",
      "terrace gardening",
      "rooftop garden",
      "outdoor gardening",
      "terrace landscaping",
      "roof garden"
    ]
  },
  {
    canonical: "Pergola",
    synonyms: [
      "pergola",
      "pergolas",
      "gazebo",
      "gazebos",
      "outdoor pergola",
      "wooden pergola",
      "aluminum pergola"
    ]
  },
  {
    canonical: "Canopy",
    synonyms: [
      "canopy",
      "canopies",
      "awning",
      "awnings",
      "tensile canopy",
      "patio canopy",
      "carport canopy",
      "retractable awning"
    ]
  },
  {
    canonical: "Outdoor Deck Benches",
    synonyms: [
      "outdoor bench",
      "outdoor benches",
      "deck bench",
      "garden bench",
      "outdoor deck benches"
    ]
  },
  {
    canonical: "Wall and Ceiling Panels",
    synonyms: [
      "wall panels",
      "ceiling panels",
      "fluted panels",
      "acoustic panels",
      "3d wall panels",
      "pvc wall panels",
      "louvers",
      "wall cladding"
    ]
  },
  {
    canonical: "Office room carpets",
    synonyms: [
      "office carpet",
      "office carpets",
      "carpet tiles",
      "commercial carpet",
      "office room carpets",
      "floor carpet"
    ]
  },
  {
    canonical: "Customised Aquariums",
    synonyms: [
      "customised aquariums",
      "custom aquarium",
      "custom aquariums",
      "designer aquarium",
      "custom fish tank"
    ]
  },
  {
    canonical: "All Types of Doormats",
    synonyms: [
      "doormat",
      "doormats",
      "entrance mat",
      "coir mat",
      "rubber doormat",
      "all types of doormats"
    ]
  },
  {
    canonical: "HDP Planter Pots",
    synonyms: [
      "hdp planters",
      "hdp planter pots",
      "hdp pots",
      "polyethylene planters"
    ]
  },
  {
    canonical: "Basket Fruit Packings",
    synonyms: [
      "basket fruit packing",
      "basket fruit packings",
      "fruit basket packing",
      "gift fruit packing"
    ]
  }
];

/**
 * Checks if a search term matches any interior design category or service.
 */
export function getInteriorCategoryMatch(query: string): string | null {
  if (!query || !query.trim()) return null;
  const clean = query.trim().toLowerCase().replace(/[-_]/g, " ");

  // 1. Exact match with canonical name or synonyms
  for (const item of INTERIOR_CATEGORIES) {
    if (item.canonical.toLowerCase() === clean) return item.canonical;
    for (const syn of item.synonyms) {
      if (syn === clean) return item.canonical;
    }
  }

  // 2. Token / word boundary matching (e.g. "sofa covers for 3 seater" -> "Sofa Cover")
  for (const item of INTERIOR_CATEGORIES) {
    for (const syn of item.synonyms) {
      if (
        clean === syn ||
        clean.startsWith(syn + " ") ||
        clean.endsWith(" " + syn) ||
        clean.includes(" " + syn + " ")
      ) {
        return item.canonical;
      }
    }
  }

  // 3. Stem matching (removing trailing 's')
  const stem = clean.replace(/s$/, "");
  if (stem.length >= 3) {
    for (const item of INTERIOR_CATEGORIES) {
      for (const syn of item.synonyms) {
        const synStem = syn.replace(/s$/, "");
        if (stem === synStem) {
          return item.canonical;
        }
      }
    }
  }

  // 4. Fuzzy typo match for interior services (e.g. "walpapper" -> "Wallpapers", "sofacover" -> "Sofa Cover")
  for (const item of INTERIOR_CATEGORIES) {
    for (const syn of item.synonyms) {
      if (Math.abs(syn.length - clean.length) <= 2) {
        const maxDist = clean.length <= 5 ? 1 : 2;
        if (getEditDistance(clean, syn) <= maxDist) {
          return item.canonical;
        }
      }
    }
  }

  return null;
}

/**
 * Categories that MUST NEVER be returned when searching for cookware or kitchenware.
 */
export const NON_COOKWARE_CATEGORIES = new Set([
  "garden tools & compost",
  "harshdeep planters",
  "ceramic pots",
  "aquarium & accessories",
  "birds_and_accessories",
  "wall clocks",
  "water fountains",
  "god idols",
  "traditional rajasthan idols",
  "garlands",
  "wallpaper rolls",
  "multiple purpose mats",
  "pen stands",
  "milton water bottles",
  "water bottles & jars"
]);

/**
 * Categories that MUST NEVER be returned when searching for water bottles, flasks, or jars.
 */
export const NON_BOTTLE_CATEGORIES = new Set([
  "garden tools & compost",
  "harshdeep planters",
  "ceramic pots",
  "aquarium & accessories",
  "birds_and_accessories",
  "wall clocks",
  "water fountains",
  "god idols",
  "traditional rajasthan idols",
  "garlands",
  "wallpaper rolls",
  "multiple purpose mats",
  "pen stands",
  "sonu_steel_products"
]);

/**
 * Checks if a user's query is targeted at water bottles, flasks, or jars.
 */
export function isBottleSearch(query: string): boolean {
  if (!query) return false;
  const clean = query.trim().toLowerCase();
  return /^bottles?$|^water\s*bottles?$|^steel\s*(water\s*)?bottles?$|^milton\s*(water\s*)?bottles?$|^asian\s*(water\s*)?bottles?$/i.test(
    clean
  );
}

/**
 * Checks if a user's query is targeted at cookers, pressure cookers, or multi cookers.
 */
export function isCookerSearch(query: string): boolean {
  if (!query) return false;
  const clean = query.trim().toLowerCase();
  return /^cook(er|ers|ing|ware)?$|^pressure\s*cookers?$|^multi\s*cookers?$/i.test(
    clean
  );
}

/**
 * Checks if a user's query is targeted at wallpapers or contact papers.
 */
export function isWallpaperSearch(query: string): boolean {
  if (!query) return false;
  const clean = query.trim().toLowerCase();
  return /^wallpapers?$|^wallpaper\s*rolls?$|^3d\s*wallpapers?$/i.test(clean);
}

/**
 * Checks if a user's query is targeted at cookware, kitchen utensils, or Sonu steel cooking items.
 */
export function isCookwareSearch(query: string): boolean {
  if (!query) return false;
  const clean = query.trim().toLowerCase();
  return /^cook(war[es]?|ing)?$|^kitchen(ware)?$|^utensils?$|^steamer$|^kadai$|^tawa$|^frypan$|^saucepan$|^stockpot$|^pressure\s*cooker$|^cook\s*&\s*serve$/i.test(
    clean
  );
}

/**
 * Intelligent semantic synonyms dictionary for e-commerce search queries.
 */
const semanticIntentRules: {
  regex: RegExp;
  categoryBoost?: string[];
  keywords: string[];
  excludeCategories?: string[];
}[] = [
  {
    regex: /^cook(war[es]?|ing)?$|^kitchen(ware)?$|^utensils?$|^steamer$|^kadai$|^tawa$|^frypan$|^saucepan$|^stockpot$/i,
    categoryBoost: ["sonu_steel_products", "cello"],
    keywords: ["sonu", "cello", "steamer", "cooker", "kadai", "tawa", "frypan", "saucepan", "stockpot", "gravy pot", "cook & serve", "dinnerware", "opalware"],
    excludeCategories: Array.from(NON_COOKWARE_CATEGORIES)
  },
  {
    regex: /^bottles?$|^flasks?$|^jars?$|^thermos?$/i,
    categoryBoost: ["milton water bottles", "water bottles & jars", "cello"],
    keywords: ["bottle", "flask", "jar", "milton", "thermosteel", "asian"],
    excludeCategories: Array.from(NON_BOTTLE_CATEGORIES)
  },
  {
    regex: /^pooja$|^puja$|^idols?$|^gods?$|^mandir$|^diyas?$/i,
    categoryBoost: ["god idols", "traditional rajasthan idols"],
    keywords: ["pooja", "idol", "diya", "brass", "god", "rajasthan", "ganesha", "mandir"]
  },
  {
    regex: /^gifts?$|^festive$|^presents?$|^return\s*gifts?$/i,
    categoryBoost: ["german silver & more", "handicrafts & gifts", "kondapalli toys"],
    keywords: ["gift", "german", "silver", "kondapalli", "toy", "handicraft", "tray", "bowl"]
  },
  {
    regex: /^plants?$|^planters?$|^pots?$/i,
    categoryBoost: ["harshdeep planters", "ceramic pots", "artificial plants"],
    keywords: ["planter", "pot", "harshdeep", "ceramic", "plant"]
  },
  {
    regex: /^lunch$|^tiffin$|^boxes?$/i,
    categoryBoost: ["lunch boxes"],
    keywords: ["lunch", "box", "tiffin", "container"]
  }
];

export const staticCuratedKeywords = [
  "Bottle",
  "Bottles",
  "Water Bottle",
  "Steel Water Bottle",
  "Milton Water Bottles",
  "Sonu Cookware",
  "Pressure Cookers & Multi-Cookers",
  "Stockpots & Saucepan Pots",
  "Frypans, Kadais & Tawas",
  "Cook & Serve Sets",
  "Cello Kitchenware & Dinnerware",
  "German Silver & More",
  "Festive Return Gifts",
  "Kondapalli Toys",
  "Water Fountains",
  "Wall Clocks",
  "Traditional Rajasthan Idols",
  "Wallpaper Rolls",
  "3D Wallpapers",
  "Sofa Cover",
  "Curtains",
  "Blinds",
  "Wooden Flooring"
];

/**
 * Common high-frequency search dictionary for smart auto-correction and "Did You Mean"
 */
export const CORE_SEARCH_DICTIONARY = [
  "bottle",
  "bottles",
  "water bottle",
  "water bottles",
  "steel water bottle",
  "milton water bottle",
  "milton water bottles",
  "asian bottle",
  "cooker",
  "cookers",
  "pressure cooker",
  "multi cooker",
  "cookware",
  "sonu cookware",
  "cello",
  "dinner set",
  "dinner sets",
  "dinnerware",
  "crockery",
  "serving bowl",
  "mixing bowl",
  "wallpaper",
  "wallpapers",
  "3d wallpapers",
  "wallpaper rolls",
  "contact paper",
  "sofa cover",
  "sofa covers",
  "curtain",
  "curtains",
  "blind",
  "blinds",
  "steamer",
  "kadai",
  "tawa",
  "frypan",
  "saucepan",
  "stockpot",
  "gravy pot",
  "flask",
  "flasks",
  "lunch box",
  "lunch boxes",
  "return gift",
  "return gifts",
  "festive gifts",
  "god idols",
  "brass idols",
  "wooden flooring",
  "vinyl flooring",
  "pigeon net",
  "mosquito net",
  "pergola",
  "fountain",
  "water fountain",
  "wall clock",
  "clock",
  "planter",
  "ceramic pot"
];

/**
 * Intelligent spelling correction with Damerau-Levenshtein distance.
 * Detects missing, extra, swapped, or incorrect characters.
 * E.g., "Bottlo" -> "Bottle", "Cookar" -> "Cooker", "Walpapper" -> "Wallpaper", "Diner Set" -> "Dinner Set"
 */
export function getSpellingCorrection(
  rawQuery: string,
  products: Product[] = []
): SpellingCorrectionResult | null {
  const query = rawQuery.trim().toLowerCase();
  if (!query || query.length < 3) return null;

  // Build dynamic searchable dictionary from products + core catalog
  const dict = new Set<string>(CORE_SEARCH_DICTIONARY);
  products.forEach((p) => {
    if (p.title) {
      const cleanT = p.title.replace(/_/g, " ").trim().toLowerCase();
      dict.add(cleanT);
      cleanT.split(/\s+/).forEach((w) => {
        if (w.length >= 3) dict.add(w);
      });
    }
    if (p.subCategory) dict.add(p.subCategory.trim().toLowerCase());
    if (p.category && p.category !== "General") dict.add(p.category.trim().toLowerCase());
  });

  const dictionaryList = Array.from(dict);

  // Exact match: user typed a known word perfectly, no correction needed
  if (dictionaryList.includes(query)) return null;

  // Multi-word phrase tokenization
  const tokens = query.split(/\s+/).filter(Boolean);
  const singleWords = new Set<string>();
  dictionaryList.forEach((item) => {
    item.split(/\s+/).forEach((w) => {
      if (w.length >= 3) singleWords.add(w);
    });
  });

  // Check whole phrase match against dictionary
  let bestPhrase: string | null = null;
  let minPhraseDist = 99;
  const phraseMax = query.length <= 5 ? 1 : query.length <= 8 ? 2 : 3;

  for (const entry of dictionaryList) {
    if (Math.abs(entry.length - query.length) > 2) continue;
    const d = getEditDistance(query, entry);
    if (d <= phraseMax && d < minPhraseDist) {
      minPhraseDist = d;
      bestPhrase = entry;
    }
  }

  if (bestPhrase && minPhraseDist <= 2 && bestPhrase.toLowerCase() !== query) {
    const formatted = bestPhrase.replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      original: rawQuery,
      corrected: formatted,
      isCorrected: true
    };
  }

  let wordsChanged = false;
  const correctedTokens = tokens.map((token) => {
    if (token.length < 3 || singleWords.has(token)) return token;

    let best = token;
    let minD = 99;
    const maxAllowed = token.length <= 6 ? 1 : 2;

    for (const w of singleWords) {
      if (Math.abs(token.length - w.length) > 1) continue;
      if (token[0] !== w[0]) continue;
      const d = getEditDistance(token, w);
      if (d <= maxAllowed && d < minD) {
        minD = d;
        best = w;
      }
    }

    if (best !== token) {
      wordsChanged = true;
      return best;
    }
    return token;
  });

  if (wordsChanged) {
    const joined = correctedTokens.join(" ");
    if (joined.toLowerCase() !== query) {
      const formatted = joined.replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        original: rawQuery,
        corrected: formatted,
        isCorrected: true
      };
    }
  }

  return null;
}

/**
 * Checks if a product matches a user query using multi-field text matching,
 * token intersection, semantic e-commerce intent expansion, and controlled fuzzy typo tolerance.
 * Accepts optional correctedQuery (from getSpellingCorrection) to ensure normalized product retrieval.
 */
export function matchesProductSearch(
  product: Product,
  query: string,
  correctedQuery?: string
): SearchMatchResult {
  if (!query || !query.trim()) {
    return { match: true, score: 0 };
  }

  const targetQuery = (correctedQuery || query).trim().toLowerCase();
  const cleanRaw = query.trim().toLowerCase();

  const title = (product.title || product.name || "").toLowerCase().replace(/_/g, " ");
  const cat = (product.category || "").toLowerCase().replace(/_/g, " ");
  const sub = (product.subCategory || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const fullText = `${title} ${cat} ${sub} ${desc}`;

  // 1. Strict Bottle Intent Protection
  if (isBottleSearch(targetQuery) || isBottleSearch(cleanRaw)) {
    if (NON_BOTTLE_CATEGORIES.has(cat)) {
      return { match: false, score: 0 };
    }

    // Bowls, dinnerware, crockery, and cookware MUST NEVER match bottle searches
    if (/bowl|dinnerware|crockery|frypan|kadai|tawa|saucepan|stockpot|cookware|mats|curtain/i.test(`${title} ${sub}`)) {
      return { match: false, score: 0 };
    }

    if (cat.includes("milton water bottle") || cat.includes("water bottles & jars")) {
      let bScore = 280;
      if (title.includes("bottle") || title.includes("flask")) bScore += 50;
      return { match: true, score: bScore };
    }

    if (title.includes("bottle") || title.includes("flask")) {
      return { match: true, score: 260 };
    }

    return { match: false, score: 0 };
  }

  // 2. Strict Cooker / Cookware Protection
  if (isCookerSearch(targetQuery) || isCookerSearch(cleanRaw)) {
    if (NON_COOKWARE_CATEGORIES.has(cat)) {
      return { match: false, score: 0 };
    }

    // User specifically wants cooker products
    if (/cooker|pressure cooker|multi cooker/i.test(targetQuery) || /cooker|pressure cooker/i.test(cleanRaw)) {
      if (sub.includes("pressure cookers & multi-cookers") || /cooker/i.test(title)) {
        return { match: true, score: 320 };
      }
      if (cat === "sonu_steel_products" || cat.includes("sonu")) {
        return { match: true, score: 220 };
      }
      return { match: false, score: 0 };
    }

    if (cat === "sonu_steel_products" || cat.includes("sonu")) {
      let cookwareScore = 300;
      if (title.includes(targetQuery)) cookwareScore += 100;
      if (sub.includes(targetQuery)) cookwareScore += 80;
      return { match: true, score: cookwareScore };
    }

    if (cat === "cello" || cat.includes("cello")) {
      let celloScore = 200;
      if (title.includes(targetQuery)) celloScore += 100;
      if (sub.includes(targetQuery)) celloScore += 80;
      return { match: true, score: celloScore };
    }

    const isKitchenUtensil = /cooker|steamer|kadai|tawa|frypan|saucepan|stockpot|cook\s*&\s*serve/i.test(
      `${title} ${sub}`
    );
    if (isKitchenUtensil) {
      return { match: true, score: 250 };
    }

    return { match: false, score: 0 };
  }

  // 3. Strict Wallpaper Protection
  if (isWallpaperSearch(targetQuery) || isWallpaperSearch(cleanRaw)) {
    if (cat.includes("wallpaper") || title.includes("wallpaper")) {
      return { match: true, score: 300 };
    }
    return { match: false, score: 0 };
  }

  // 4. Standard multi-field relevance scoring using targetQuery (the corrected or original query)
  const qToUse = targetQuery;
  const tokens = qToUse.split(/\s+/).filter(Boolean);
  let score = 0;

  if (title === qToUse) {
    score += 260;
  } else if (title.startsWith(qToUse)) {
    score += 190;
  } else if (title.split(/\s+/).some((w) => w.startsWith(qToUse))) {
    score += 140;
  } else if (title.includes(qToUse)) {
    score += 110;
  } else if (tokens.length > 1 && tokens.every((t) => title.includes(t))) {
    score += 95;
  }

  if (sub.includes(qToUse)) {
    score += 85;
  } else if (tokens.length > 1 && tokens.every((t) => sub.includes(t))) {
    score += 75;
  }

  if (cat.includes(qToUse)) {
    score += 70;
  }

  if (desc.includes(qToUse)) {
    score += 35;
  }

  if (tokens.length > 1 && tokens.every((t) => fullText.includes(t))) {
    score += 80;
  }

  // 5. Semantic Intent Rules
  for (const rule of semanticIntentRules) {
    if (rule.regex.test(qToUse) || tokens.some((t) => rule.regex.test(t))) {
      if (rule.excludeCategories && rule.excludeCategories.includes(cat)) {
        continue;
      }

      if (rule.categoryBoost && rule.categoryBoost.some((cb) => cat.includes(cb))) {
        score += 90;
        break;
      }

      const matchesIntent = rule.keywords.some((kw) => fullText.includes(kw));
      if (matchesIntent) {
        score += 70;
        break;
      }
    }
  }

  // 6. Strict Controlled Fuzzy Matching:
  // Requires minimum length 4, matching first character, length diff <= 1, max distance <= 1 (or 2 for len 7+)
  if (score === 0 && tokens.length > 0) {
    const titleWords = title.split(/\s+/).filter((w) => w.length >= 3);
    const fuzzyMatchedTokens = tokens.filter((token) => {
      if (token.length < 4) return false;
      const maxAllowed = token.length <= 6 ? 1 : 2;
      return titleWords.some((tw) => {
        if (Math.abs(token.length - tw.length) > 1) return false;
        if (token[0] !== tw[0]) return false;
        const dist = getEditDistance(token, tw);
        return dist <= maxAllowed && dist / Math.max(token.length, tw.length) <= 0.25;
      });
    });

    if (fuzzyMatchedTokens.length === tokens.length) {
      score += 70;
    }
  }

  return { match: score > 0, score };
}

/**
 * Builds live autocomplete suggestions, "Did You Mean" auto-correction, and matching product previews
 * synchronized with the live catalog and interior design database.
 */
export function getLiveRecommendations(
  products: Product[],
  searchTerm: string
): RecommendationResult {
  const clean = searchTerm.trim().toLowerCase();
  if (!clean) {
    return { keywordSuggestions: [], matchedProducts: [], interiorMatches: [], didYouMean: null };
  }

  // 1. Intelligent Spelling Correction / Did You Mean
  const didYouMean = getSpellingCorrection(clean, products);
  const effectiveQuery = (didYouMean && didYouMean.isCorrected) ? didYouMean.corrected.toLowerCase() : clean;

  const isBottle = isBottleSearch(effectiveQuery) || isBottleSearch(clean);
  const isCooker = isCookerSearch(effectiveQuery) || isCookerSearch(clean);
  const isWallpaper = isWallpaperSearch(effectiveQuery) || isWallpaperSearch(clean);

  // 2. Check for matching Interior Design categories
  const interiorMatches: { title: string; category: string }[] = [];
  INTERIOR_CATEGORIES.forEach((item) => {
    const canonicalLower = item.canonical.toLowerCase();
    const isDirectMatch =
      canonicalLower.includes(clean) ||
      clean.includes(canonicalLower) ||
      canonicalLower.includes(effectiveQuery) ||
      item.synonyms.some((syn) => syn.startsWith(clean) || clean.startsWith(syn) || syn.startsWith(effectiveQuery));

    const isFuzzyInterior =
      !isDirectMatch &&
      clean.length >= 4 &&
      item.synonyms.some((syn) => {
        if (Math.abs(syn.length - clean.length) <= 2) {
          const maxD = clean.length <= 5 ? 1 : 2;
          return getEditDistance(clean, syn) <= maxD;
        }
        return false;
      });

    if (isDirectMatch || isFuzzyInterior) {
      interiorMatches.push({
        title: item.canonical,
        category: item.canonical
      });
    }
  });

  // 3. Keyword candidates ranking
  const keywordCandidates = new Set<string>();

  // Add Did You Mean corrected keyword with top priority
  if (didYouMean && didYouMean.isCorrected) {
    keywordCandidates.add(didYouMean.corrected);
  }

  // Add relevant interior design categories as keyword suggestions
  interiorMatches.forEach((im) => keywordCandidates.add(im.title));

  // Add static curated terms
  staticCuratedKeywords.forEach((kw) => keywordCandidates.add(kw));

  // Add live product titles & categories
  products.forEach((p) => {
    if (p.title) {
      const cleanTitle = p.title.replace(/_/g, " ").trim();
      keywordCandidates.add(cleanTitle);

      const words = cleanTitle.split(/\s+/);
      if (words.length > 2) {
        keywordCandidates.add(words.slice(0, 3).join(" "));
      }
    }
    if (p.subCategory) {
      keywordCandidates.add(p.subCategory.trim());
    }
    if (p.category && p.category !== "General") {
      keywordCandidates.add(p.category.replace(/_/g, " ").trim());
    }
  });

  // Score candidate keywords
  const scoredKeywords: { text: string; score: number }[] = [];
  keywordCandidates.forEach((kw) => {
    const kwLower = kw.toLowerCase();
    let score = 0;

    // Reject conflicting categories when intent is specific
    if (isBottle) {
      if (/bowl|cookware|dinnerware|plate|planter|mat|clock|wallpaper/i.test(kwLower)) {
        return;
      }
    } else if (isCooker) {
      if (/bottle|planter|mat|clock|wallpaper|garland/i.test(kwLower)) {
        return;
      }
    } else if (isWallpaper) {
      if (/bottle|cookware|bowl|dinnerware|planter|mat|clock|garland/i.test(kwLower)) {
        return;
      }
    }

    if (didYouMean && didYouMean.isCorrected && kwLower === didYouMean.corrected.toLowerCase()) {
      score = 300;
    } else if (kwLower === effectiveQuery || kwLower === clean) {
      score = 280;
    } else if (kwLower.startsWith(effectiveQuery) || kwLower.startsWith(clean)) {
      score = 220; // Google / Amazon prefix priority
    } else if (kwLower.split(/\s+/).some((w) => w.startsWith(effectiveQuery) || w.startsWith(clean))) {
      score = 180;
    } else if (kwLower.includes(effectiveQuery) || kwLower.includes(clean)) {
      score = 140;
    } else if (isBottle && /bottle|flask/i.test(kwLower)) {
      score = 120;
    } else if (isCooker && /cooker|steamer|kadai|tawa/i.test(kwLower)) {
      score = 120;
    } else if (isWallpaper && /wallpaper/i.test(kwLower)) {
      score = 120;
    }

    if (score > 0) {
      scoredKeywords.push({ text: kw, score });
    }
  });

  scoredKeywords.sort((a, b) => b.score - a.score || a.text.length - b.text.length);

  // Deduplicate case-insensitively
  const seenKw = new Set<string>();
  const keywordSuggestions: string[] = [];
  for (const item of scoredKeywords) {
    const lower = item.text.toLowerCase();
    if (!seenKw.has(lower)) {
      seenKw.add(lower);
      keywordSuggestions.push(item.text);
      if (keywordSuggestions.length >= 5) break;
    }
  }

  // 4. Rank live products matching query (using normalized effectiveQuery for accurate retrieval)
  const scoredProds: { prod: Product; score: number }[] = [];
  products.forEach((p) => {
    const res = matchesProductSearch(p, clean, effectiveQuery);
    if (res.match) {
      scoredProds.push({ prod: p, score: res.score });
    }
  });

  scoredProds.sort((a, b) => b.score - a.score);
  const matchedProducts = scoredProds.slice(0, 4).map((item) => item.prod);

  return { keywordSuggestions, matchedProducts, interiorMatches: interiorMatches.slice(0, 2), didYouMean };
}

/**
 * Highlights the matched characters in search suggestions with brand terracotta accents.
 */
export function highlightSearchMatch(text: string, query: string): React.ReactNode {
  if (!query || !query.trim()) return text;
  const q = query.trim();
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return React.createElement(
    "span",
    null,
    parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase()
        ? React.createElement(
            "strong",
            { key: i, className: "font-semibold text-[#7D3219]" },
            part
          )
        : React.createElement("span", { key: i, className: "text-gray-700 font-normal" }, part)
    )
  );
}
