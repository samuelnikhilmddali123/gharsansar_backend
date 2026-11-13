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

/**
 * Complete, authoritative registry of all Ghar Sansar Interior Design categories and their synonyms.
 * Ensures queries like "sofa covers", "sofa cover", "couch covers", "wallpapers", "curtains",
 * "blinds", "wooden flooring" route directly to the Interior Design page with the exact category.
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
 * Returns the canonical category name (e.g. "Sofa Cover") or null if it is a store product query.
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

  return null;
}

/**
 * Categories that MUST NEVER be returned when searching for cookware or kitchenware.
 * Prevents sickle, garden trowels, hose nozzles, planters, and ceramic pots from appearing.
 */
const NON_COOKWARE_CATEGORIES = new Set([
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
  "pen stands"
]);

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
    categoryBoost: ["sonu_steel_products"],
    keywords: ["sonu", "steamer", "cooker", "kadai", "tawa", "frypan", "saucepan", "stockpot", "gravy pot", "cook & serve"],
    excludeCategories: Array.from(NON_COOKWARE_CATEGORIES)
  },
  {
    regex: /^bottles?$|^flasks?$|^jars?$|^thermos?$/i,
    categoryBoost: ["milton water bottles", "water bottles & jars", "cello"],
    keywords: ["bottle", "flask", "jar", "milton", "thermosteel", "asian"]
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
  "Sonu Cookware",
  "Sonu Eliza Pot 14cm 1000ml",
  "Pressure Cookers & Multi-Cookers",
  "Stockpots & Saucepan Pots",
  "Frypans, Kadais & Tawas",
  "Cook & Serve Sets",
  "Milton Water Bottles",
  "Cello Bottles & Flasks",
  "German Silver & More",
  "Festive Return Gifts",
  "Kondapalli Toys",
  "Water Fountains",
  "Wall Clocks",
  "Traditional Rajasthan Idols"
];

/**
 * Checks if a product matches a user query using multi-field text matching,
 * token intersection, and semantic e-commerce intent expansion.
 */
export function matchesProductSearch(product: Product, query: string): SearchMatchResult {
  if (!query || !query.trim()) {
    return { match: true, score: 0 };
  }

  const cleanQ = query.trim().toLowerCase();
  const tokens = cleanQ.split(/\s+/).filter(Boolean);

  const title = (product.title || product.name || "").toLowerCase().replace(/_/g, " ");
  const cat = (product.category || "").toLowerCase().replace(/_/g, " ");
  const sub = (product.subCategory || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const fullText = `${title} ${cat} ${sub} ${desc}`;

  // 1. Strict Cookware Protection
  // If user searched for cookware, do not match sickle, planters, spray bottles or gardening tools
  if (isCookwareSearch(cleanQ)) {
    if (NON_COOKWARE_CATEGORIES.has(cat)) {
      return { match: false, score: 0 };
    }

    if (cat === "sonu_steel_products" || cat.includes("sonu")) {
      let cookwareScore = 300;
      if (title.includes(cleanQ)) cookwareScore += 100;
      if (sub.includes(cleanQ)) cookwareScore += 80;
      return { match: true, score: cookwareScore };
    }

    // Matching cooking utensils in other categories
    const isKitchenUtensil = /cooker|steamer|kadai|tawa|frypan|saucepan|stockpot|cook\s*&\s*serve/i.test(
      `${title} ${sub}`
    );
    if (isKitchenUtensil) {
      return { match: true, score: 250 };
    }

    return { match: false, score: 0 };
  }

  let score = 0;

  // 2. Exact or Prefix Title Matches (Highest E-Commerce Relevance)
  if (title === cleanQ) {
    score += 260;
  } else if (title.startsWith(cleanQ)) {
    score += 190;
  } else if (title.split(/\s+/).some((w) => w.startsWith(cleanQ))) {
    score += 140;
  } else if (title.includes(cleanQ)) {
    score += 110;
  } else if (tokens.length > 1 && tokens.every((t) => title.includes(t))) {
    score += 95;
  }

  // 3. Subcategory Match
  if (sub.includes(cleanQ)) {
    score += 85;
  } else if (tokens.length > 1 && tokens.every((t) => sub.includes(t))) {
    score += 75;
  }

  // 4. Category Match
  if (cat.includes(cleanQ)) {
    score += 70;
  }

  // 5. Description Match
  if (desc.includes(cleanQ)) {
    score += 35;
  }

  // 6. Multi-token intersection across fullText
  if (tokens.length > 1 && tokens.every((t) => fullText.includes(t))) {
    score += 80;
  }

  // 7. Semantic Intent Rules
  for (const rule of semanticIntentRules) {
    if (rule.regex.test(cleanQ) || tokens.some((t) => rule.regex.test(t))) {
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

  return { match: score > 0, score };
}

export interface RecommendationResult {
  keywordSuggestions: string[];
  matchedProducts: Product[];
  interiorMatches: { title: string; category: string }[];
}

/**
 * Builds live autocomplete suggestions and matching product previews
 * synchronized with the live catalog and interior design database.
 */
export function getLiveRecommendations(
  products: Product[],
  searchTerm: string
): RecommendationResult {
  const clean = searchTerm.trim().toLowerCase();
  if (!clean) {
    return { keywordSuggestions: [], matchedProducts: [], interiorMatches: [] };
  }

  // 1. Check for matching Interior Design categories
  const interiorMatches: { title: string; category: string }[] = [];
  INTERIOR_CATEGORIES.forEach((item) => {
    const canonicalLower = item.canonical.toLowerCase();
    const isDirectMatch =
      canonicalLower.includes(clean) ||
      clean.includes(canonicalLower) ||
      item.synonyms.some((syn) => syn.startsWith(clean) || clean.startsWith(syn));

    if (isDirectMatch) {
      interiorMatches.push({
        title: item.canonical,
        category: item.canonical
      });
    }
  });

  // 2. Keyword candidates ranking
  const keywordCandidates = new Set<string>();

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

    if (kwLower === clean) {
      score = 220;
    } else if (kwLower.startsWith(clean)) {
      score = 170; // Google / Amazon prefix priority
    } else if (kwLower.split(/\s+/).some((w) => w.startsWith(clean))) {
      score = 120;
    } else if (kwLower.includes(clean)) {
      score = 60;
    } else if (isCookwareSearch(clean) && /sonu|cook|steamer|pot|kadai|tawa/i.test(kwLower)) {
      score = 80;
    }

    if (score > 0) {
      scoredKeywords.push({ text: kw, score });
    }
  });

  scoredKeywords.sort((a, b) => b.score - a.score || a.text.length - b.text.length);
  const keywordSuggestions = scoredKeywords.slice(0, 5).map((k) => k.text);

  // 3. Rank live products matching query
  const scoredProds: { prod: Product; score: number }[] = [];
  products.forEach((p) => {
    const res = matchesProductSearch(p, clean);
    if (res.match) {
      scoredProds.push({ prod: p, score: res.score });
    }
  });

  scoredProds.sort((a, b) => b.score - a.score);
  const matchedProducts = scoredProds.slice(0, 4).map((item) => item.prod);

  return { keywordSuggestions, matchedProducts, interiorMatches: interiorMatches.slice(0, 2) };
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
