import React from "react";
import { Product } from "../context/ProductContext";

export interface SearchMatchResult {
  match: boolean;
  score: number;
}

/**
 * Intelligent semantic synonyms dictionary for e-commerce search queries.
 * Expands short customer terms (e.g. "cookware", "bottle", "gifts") into relevant
 * categories, subcategories, and product features.
 */
const semanticIntentRules: { regex: RegExp; keywords: string[] }[] = [
  {
    regex: /^cook(war[es]?|ing)?$|^kitchen(ware)?$|^utensils?$|^pots?$|^pans?$/i,
    keywords: [
      "sonu",
      "steel",
      "cook",
      "steamer",
      "pot",
      "pan",
      "kadai",
      "tawa",
      "frypan",
      "saucepan",
      "stockpot",
      "pressure",
      "cookware"
    ]
  },
  {
    regex: /^bottles?$|^flasks?$|^jars?$|^thermos?$/i,
    keywords: ["bottle", "flask", "jar", "milton", "water", "thermosteel", "asian"]
  },
  {
    regex: /^pooja$|^puja$|^idols?$|^gods?$|^mandir$|^diyas?$/i,
    keywords: ["pooja", "idol", "diya", "brass", "god", "rajasthan", "traditional", "ganesha"]
  },
  {
    regex: /^gifts?$|^festive$|^presents?$|^return\s*gifts?$/i,
    keywords: ["gift", "german", "silver", "kondapalli", "toy", "handicraft", "tray", "bowl", "festive"]
  },
  {
    regex: /^decor$|^decoration$|^home\s*decor$|^décor$/i,
    keywords: ["decor", "clock", "fountain", "plant", "flower", "wallpaper", "kondapalli"]
  },
  {
    regex: /^steamer$|^idli$|^momo$/i,
    keywords: ["steamer", "steam", "kadai", "multi"]
  },
  {
    regex: /^lunch$|^tiffin$|^boxes?$/i,
    keywords: ["lunch", "box", "tiffin", "container"]
  },
  {
    regex: /^plants?$|^planters?$|^pots?$/i,
    keywords: ["plant", "planter", "pot", "harshdeep", "ceramic"]
  }
];

export const staticCuratedKeywords = [
  "Sonu Cookware",
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
  "Traditional Rajasthan Idols",
  "Ceramic Pots",
  "Artificial Plants",
  "Wallpaper Rolls",
  "3D Wallpapers",
  "Wooden Flooring",
  "Vinyl Flooring"
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

  let score = 0;

  // 1. Exact or Prefix Title Matches (Highest E-Commerce Relevance)
  if (title === cleanQ) {
    score += 250;
  } else if (title.startsWith(cleanQ)) {
    score += 180;
  } else if (title.split(/\s+/).some((w) => w.startsWith(cleanQ))) {
    score += 140;
  } else if (title.includes(cleanQ)) {
    score += 100;
  } else if (tokens.length > 1 && tokens.every((t) => title.includes(t))) {
    score += 90;
  }

  // 2. Subcategory Match (e.g., "Pressure Cookers & Multi-Cookers")
  if (sub.includes(cleanQ)) {
    score += 85;
  } else if (tokens.length > 1 && tokens.every((t) => sub.includes(t))) {
    score += 75;
  }

  // 3. Category Match (e.g., "sonu_steel_products", "milton water bottles")
  if (cat.includes(cleanQ)) {
    score += 70;
  }

  // 4. Description Match
  if (desc.includes(cleanQ)) {
    score += 35;
  }

  // 5. Multi-token intersection across fullText
  if (tokens.length > 1 && tokens.every((t) => fullText.includes(t))) {
    score += 80;
  }

  // 6. Semantic Intent & Synonyms Matching
  for (const rule of semanticIntentRules) {
    if (rule.regex.test(cleanQ) || tokens.some((t) => rule.regex.test(t))) {
      // Check if product belongs to this intent's domain
      const matchesIntent = rule.keywords.some((kw) => fullText.includes(kw));
      if (matchesIntent) {
        score += 80;
        break;
      }
    }
  }

  return { match: score > 0, score };
}

/**
 * Builds live autocomplete suggestions and matching product previews
 * synchronized with the live MongoDB Atlas catalog.
 */
export function getLiveRecommendations(
  products: Product[],
  searchTerm: string
): { keywordSuggestions: string[]; matchedProducts: Product[] } {
  const clean = searchTerm.trim().toLowerCase();
  if (!clean) {
    return { keywordSuggestions: [], matchedProducts: [] };
  }

  // 1. Keyword extraction & ranking
  const keywordCandidates = new Set<string>();

  // Add all static curated terms
  staticCuratedKeywords.forEach((kw) => keywordCandidates.add(kw));

  // Add all live product titles & categories
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
      score = 200;
    } else if (kwLower.startsWith(clean)) {
      score = 150; // Google / Amazon prefix priority
    } else if (kwLower.split(/\s+/).some((w) => w.startsWith(clean))) {
      score = 100;
    } else if (kwLower.includes(clean)) {
      score = 50;
    } else {
      // Check semantic intent match for keyword
      for (const rule of semanticIntentRules) {
        if (rule.regex.test(clean) && rule.keywords.some((k) => kwLower.includes(k))) {
          score = 65;
          break;
        }
      }
    }

    if (score > 0) {
      scoredKeywords.push({ text: kw, score });
    }
  });

  scoredKeywords.sort((a, b) => b.score - a.score || a.text.length - b.text.length);
  const keywordSuggestions = scoredKeywords.slice(0, 5).map((k) => k.text);

  // 2. Rank live products matching query
  const scoredProds: { prod: Product; score: number }[] = [];
  products.forEach((p) => {
    const res = matchesProductSearch(p, clean);
    if (res.match) {
      scoredProds.push({ prod: p, score: res.score });
    }
  });

  scoredProds.sort((a, b) => b.score - a.score);
  const matchedProducts = scoredProds.slice(0, 4).map((item) => item.prod);

  return { keywordSuggestions, matchedProducts };
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
