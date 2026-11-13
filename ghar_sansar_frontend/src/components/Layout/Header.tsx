import React, { useRef, useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  LogOut,
  Heart,
  ChevronRight,
  MessageCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  ArrowUpLeft,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useProducts, Product } from "../../context/ProductContext";
import GharSansarLogo from "./GharSansarLogo";
import {
  getLiveRecommendations,
  highlightSearchMatch,
  getInteriorCategoryMatch
} from "../../utils/searchEngine";

const defaultTrendingSearches = [
  "Sonu Cookware",
  "Sonu Eliza Pot 14cm 1000ml",
  "Sofa Cover",
  "Curtains",
  "Wallpaper Rolls",
  "3D Wallpapers",
  "Milton Water Bottles",
  "Festive Return Gifts"
];

const RECENT_SEARCHES_KEY = "gharsansar_recent_searches";

const Header: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // 200ms debounce for high-speed fluid typing without search jitter
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLFormElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { products } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    try {
      const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase());
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setShowSuggestions(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        if (!searchTerm.trim()) {
          setIsSearchOpen(false);
        }
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm]);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Synchronized with live database catalog, fuzzy spelling correction & semantic search engine
  const { keywordSuggestions, matchedProducts, interiorMatches, didYouMean } = useMemo(() => {
    return getLiveRecommendations(products, debouncedTerm || searchTerm);
  }, [debouncedTerm, searchTerm, products]);

  // Execute a search query and navigate to appropriate page
  const executeSearch = (query: string) => {
    const clean = query.trim();
    if (!clean) return;

    saveRecentSearch(clean);
    setShowSuggestions(false);
    setIsSearchOpen(false);
    setSearchTerm("");

    // 1. Check if the query specifically targets interior services (e.g. "sofa covers" -> "Sofa Cover")
    const interiorCategory = getInteriorCategoryMatch(clean);
    if (interiorCategory) {
      navigate(`/interior-design?category=${encodeURIComponent(interiorCategory)}`);
      return;
    }

    // 2. Return gifts / festive gifts
    if (clean.toLowerCase().includes("return gift") || clean.toLowerCase().includes("festive gift")) {
      navigate(`/return-gifts`);
      return;
    }

    // 3. Store products catalog
    navigate(`/products?search=${encodeURIComponent(clean)}`);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    executeSearch(searchTerm);
  };

  const onProductSelect = (product: Product) => {
    saveRecentSearch(product.title?.replace(/_/g, " ") || "");
    setShowSuggestions(false);
    setIsSearchOpen(false);
    setSearchTerm("");
    navigate(`/products/${encodeURIComponent(product.id)}`, { state: product });
  };

  // Flatten interactive suggestions for seamless Arrow Key navigation
  const flatSuggestions = useMemo(() => {
    const list: { type: "didYouMean" | "interior" | "keyword" | "product"; value: any }[] = [];
    if (didYouMean && didYouMean.isCorrected) {
      list.push({ type: "didYouMean", value: didYouMean.corrected });
    }
    interiorMatches.forEach((im) => list.push({ type: "interior", value: im.category }));
    keywordSuggestions.forEach((kw) => list.push({ type: "keyword", value: kw }));
    matchedProducts.forEach((p) => list.push({ type: "product", value: p }));
    return list;
  }, [didYouMean, interiorMatches, keywordSuggestions, matchedProducts]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showSuggestions) {
        setShowSuggestions(true);
        return;
      }
      setSelectedIndex((prev) => (prev < flatSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatSuggestions.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < flatSuggestions.length) {
        e.preventDefault();
        const selected = flatSuggestions[selectedIndex];
        if (selected.type === "product") {
          onProductSelect(selected.value);
        } else {
          executeSearch(selected.value);
        }
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setIsSearchOpen(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchTerm]);

  // Google/Amazon style character highlight helper
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const q = query.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <strong key={i} className="font-semibold text-[#7D3219]">
              {part}
            </strong>
          ) : (
            <span key={i} className="text-gray-700">
              {part}
            </span>
          )
        )}
      </span>
    );
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/interior-design", label: "Interior Design" },
    { path: "/products", label: "Products" },
    { path: "/return-gifts", label: "Festive Gifts" },
    { path: "/services", label: "Services" },
    { path: "/blog", label: "Blog" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="w-full transition-all duration-300 bg-[#F6F1E8]/95 backdrop-blur-md">
          <div className="relative w-full max-w-[1720px] mx-auto px-3.5 sm:px-8 lg:px-10 xl:px-12 h-12 flex items-center justify-between">
            {/* 1. Left: Brand Logo */}
            <div className="flex items-center shrink-0 z-10">
              <GharSansarLogo variant="dark" />
            </div>

            {/* 2. Center: True Mathematical Center Navigation */}
            <nav
              className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-6 xl:space-x-8 font-poppins text-[12px] xl:text-[12.5px] font-medium tracking-[0.14em] uppercase"
              role="navigation"
            >
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative py-0.5 px-1 transition-colors duration-200 ${
                      active
                        ? "text-gray-950 font-semibold"
                        : "text-gray-600 hover:text-[#C86B4C]"
                    }`}
                  >
                    <span>{link.label}</span>
                    {active && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C86B4C] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Right: Refined Search & Action Icons */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 z-10">
              {/* Expandable Search Bar on Symbol Click */}
              <div className="relative flex items-center">
                {!isSearchOpen ? (
                  <button
                    type="button"
                    aria-label="Open search"
                    onClick={() => {
                      setIsSearchOpen(true);
                      setShowSuggestions(true);
                      setTimeout(() => searchInputRef.current?.focus(), 60);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-[#C86B4C] hover:bg-[#F6F1E8] transition-colors cursor-pointer"
                  >
                    <Search className="w-[18px] h-[18px]" />
                  </button>
                ) : (
                  <form
                    ref={desktopSearchRef}
                    onSubmit={onSearchSubmit}
                    className="flex items-center relative transition-all duration-300"
                  >
                    {/* Search Input Container without any blue outline box */}
                    <div className="flex items-center w-56 sm:w-64 md:w-80 h-[34px] rounded-full px-3 bg-white text-gray-800 border border-[#D9B4A4] shadow-2xs focus-within:border-[#7D3219] focus-within:ring-2 focus-within:ring-[#7D3219]/20 transition-all duration-200">
                      <Search className="w-3.5 h-3.5 text-[#8C827A] shrink-0 mr-1.5" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        placeholder="Search products, cookware, gifts..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent text-xs font-normal text-gray-900 placeholder:text-stone-400 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none p-0"
                        style={{ outline: "none", boxShadow: "none", border: "none" }}
                      />
                      {searchTerm ? (
                        <button
                          type="button"
                          aria-label="Clear search"
                          onClick={() => {
                            setSearchTerm("");
                            searchInputRef.current?.focus();
                          }}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 ml-1 shrink-0 cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          aria-label="Close search"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setShowSuggestions(false);
                            setSearchTerm("");
                          }}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 ml-1 shrink-0 cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Google, Flipkart & Amazon Style Search Recommendations Dropdown */}
                    <AnimatePresence>
                      {showSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full right-0 mt-2.5 w-[330px] sm:w-[400px] md:w-[460px] max-w-[92vw] bg-[#FAF7F2] border border-[#E8E2D8] rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-[#F0EAE1]"
                        >
                          {/* Case A: User has typed a keyword (Active Autocomplete) */}
                          {searchTerm.trim().length > 0 ? (
                            <>
                              {/* Did You Mean Auto-Correction Banner */}
                              {didYouMean && didYouMean.isCorrected && (
                                <div className="p-3 bg-[#F7EBE4] border-b border-[#E8D0C5] flex items-center justify-between gap-2.5">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Sparkles size={15} className="text-[#C86B4C] shrink-0" />
                                    <span className="text-xs text-gray-800 truncate">
                                      Did you mean:{" "}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSearchTerm(didYouMean.corrected);
                                          executeSearch(didYouMean.corrected);
                                        }}
                                        className="font-semibold text-[#7D3219] hover:underline cursor-pointer"
                                      >
                                        {didYouMean.corrected}
                                      </button>
                                      ?
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSearchTerm(didYouMean.corrected);
                                      executeSearch(didYouMean.corrected);
                                    }}
                                    className="shrink-0 px-2.5 py-1 rounded-md bg-[#7D3219] hover:bg-[#652814] text-white text-[11px] font-medium transition-colors shadow-2xs cursor-pointer"
                                  >
                                    Search {didYouMean.corrected}
                                  </button>
                                </div>
                              )}

                              {/* 0. Interior Design & Service Matches */}
                              {interiorMatches && interiorMatches.length > 0 && (
                                <div className="p-2 space-y-1 bg-[#FAF2ED]">
                                  <div className="px-3 pt-1 pb-1 flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase text-[#7D3219]">
                                    <span>Interior Design & Home Solutions</span>
                                    <span className="text-[9px] font-semibold bg-[#F7EBE4] border border-[#D9B4A4] px-1.5 py-0.5 rounded text-[#7D3219]">
                                      Bespoke Service
                                    </span>
                                  </div>
                                  {interiorMatches.map((im, idx) => (
                                    <div
                                      key={idx}
                                      onClick={() => executeSearch(im.category)}
                                      className="group flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-[#F7EBE4] border border-[#E8E2D8] hover:border-[#D9B4A4] transition-all cursor-pointer shadow-2xs"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-6 h-6 rounded-md bg-[#F7EBE4] text-[#7D3219] flex items-center justify-center shrink-0">
                                          <Sparkles size={12} />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold text-gray-900 group-hover:text-[#7D3219] truncate">
                                            {im.title}
                                          </p>
                                          <p className="text-[10.5px] text-gray-500 truncate">
                                            Explore portfolio, designs & custom tailoring
                                          </p>
                                        </div>
                                      </div>
                                      <ArrowRight size={13} className="text-[#7D3219] shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* 1. Keyword Recommendations (Google / Amazon style) */}
                              {keywordSuggestions.length > 0 && (
                                <div className="p-2 space-y-0.5">
                                  <div className="px-3 pt-1 pb-1.5 flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase text-[#8C827A]">
                                    <span>Suggestions</span>
                                    <Sparkles size={11} className="text-[#C86B4C]" />
                                  </div>
                                  {keywordSuggestions.map((kw, idx) => (
                                    <div
                                      key={idx}
                                      className="group flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-white transition-colors cursor-pointer"
                                      onClick={() => executeSearch(kw)}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C86B4C] shrink-0 transition-colors" />
                                        <span className="text-xs truncate">
                                          {highlightSearchMatch(kw, searchTerm)}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        aria-label="Insert keyword"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSearchTerm(kw);
                                          searchInputRef.current?.focus();
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-700 p-1 rounded-md transition-opacity"
                                        title="Fill into search bar"
                                      >
                                        <ArrowUpLeft size={13} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* 2. Matching Product Cards (Flipkart / Amazon style visual preview) */}
                              {matchedProducts.length > 0 && (
                                <div className="p-2.5 bg-white/60">
                                  <div className="px-2 pb-2 text-[10px] font-semibold tracking-wider uppercase text-[#8C827A] flex items-center justify-between">
                                    <span>Products</span>
                                    <span className="text-[10px] lowercase font-normal text-stone-400">
                                      {matchedProducts.length} matches
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {matchedProducts.map((p) => {
                                      const price = p.finalPrice || p.actualPrice || 0;
                                      const strike = p.strikePrice || p.actualPrice || 0;
                                      const isOutOfStock =
                                        p.status === "out_of_stock" || (p.stock !== undefined && Number(p.stock) <= 0);

                                      return (
                                        <div
                                          key={p.id}
                                          onClick={() => onProductSelect(p)}
                                          className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#F0EAE1] hover:border-[#D9B4A4] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                                        >
                                          <div className="flex items-center gap-3 min-w-0">
                                            {/* Thumbnail */}
                                            <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                              {p.image ? (
                                                <img
                                                  src={p.image}
                                                  alt={p.title}
                                                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                                />
                                              ) : (
                                                <ShoppingBag size={14} className="text-stone-400" />
                                              )}
                                            </div>

                                            {/* Details */}
                                            <div className="min-w-0">
                                              <p className="text-xs font-medium text-gray-900 truncate">
                                                {highlightSearchMatch(p.title?.replace(/_/g, " ") || "", searchTerm)}
                                              </p>
                                              <div className="flex items-center gap-2 mt-0.5">
                                                {p.category && (
                                                  <span className="text-[9.5px] uppercase font-semibold text-[#8C827A] bg-[#F6F1E8] px-1.5 py-0.5 rounded">
                                                    {p.category}
                                                  </span>
                                                )}
                                                {isOutOfStock ? (
                                                  <span className="text-[9.5px] font-medium text-rose-600">
                                                    Out of Stock
                                                  </span>
                                                ) : (
                                                  <span className="text-[9.5px] font-medium text-emerald-700">
                                                    In Stock
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Price */}
                                          <div className="text-right shrink-0 pl-2">
                                            <span className="text-xs font-semibold text-gray-950 block">
                                              ₹{Number(price).toLocaleString("en-IN")}
                                            </span>
                                            {strike > price && (
                                              <span className="text-[10px] text-gray-400 line-through block">
                                                ₹{Number(strike).toLocaleString("en-IN")}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* No products matched state */}
                              {matchedProducts.length === 0 && (keywordSuggestions.length > 0 || (interiorMatches && interiorMatches.length > 0)) && (
                                <div className="px-4 py-2.5 bg-white/40 border-t border-[#E8E2D8] text-center">
                                  <p className="text-[11.5px] text-stone-500 font-normal">No matching products found</p>
                                </div>
                              )}

                              {/* No match fallback */}
                              {keywordSuggestions.length === 0 && matchedProducts.length === 0 && (!interiorMatches || interiorMatches.length === 0) && (
                                <div className="p-5 text-center">
                                  <p className="text-xs text-stone-500 font-normal">
                                    No matching products found for <strong className="text-gray-900">"{searchTerm}"</strong>
                                  </p>
                                  <p className="text-[11px] text-stone-400 mt-1">
                                    Press Enter to search all store catalog
                                  </p>
                                </div>
                              )}

                              {/* Footer Action */}
                              <button
                                type="button"
                                onClick={() => executeSearch(searchTerm)}
                                className="w-full py-2.5 px-4 bg-[#F6F1E8] hover:bg-[#EFE0D7] text-[#7D3219] text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                              >
                                <span>View all results for "{searchTerm}"</span>
                                <ArrowRight size={13} />
                              </button>
                            </>
                          ) : (
                            /* Case B: Input is empty (Recent & Trending Searches) */
                            <div className="p-3 space-y-3">
                              {/* Recent Searches */}
                              {recentSearches.length > 0 && (
                                <div>
                                  <div className="flex items-center justify-between px-2 pb-1.5 text-[10px] font-semibold tracking-wider uppercase text-[#8C827A]">
                                    <span className="flex items-center gap-1.5">
                                      <Clock size={11} />
                                      <span>Recent Searches</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={clearAllRecent}
                                      className="text-[10px] font-normal text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    >
                                      Clear all
                                    </button>
                                  </div>
                                  <div className="space-y-0.5">
                                    {recentSearches.map((term, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() => executeSearch(term)}
                                        className="group flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-white transition-colors cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <Clock className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C86B4C] shrink-0 transition-colors" />
                                          <span className="text-xs text-gray-800 truncate">{term}</span>
                                        </div>
                                        <button
                                          type="button"
                                          aria-label="Remove recent item"
                                          onClick={(e) => removeRecentSearch(e, term)}
                                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 p-1 rounded-md transition-opacity"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Popular / Trending Searches */}
                              <div>
                                <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider uppercase text-[#8C827A] flex items-center gap-1.5">
                                  <TrendingUp size={11} className="text-[#C86B4C]" />
                                  <span>Popular Recommendations</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 px-1 pt-1">
                                  {defaultTrendingSearches.map((trend, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => executeSearch(trend)}
                                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F6F1E8] border border-[#E8E2D8] hover:border-[#D9B4A4] text-xs font-normal text-gray-800 transition-all shadow-2xs cursor-pointer"
                                    >
                                      {trend}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                )}
              </div>

              {/* Profile Icon (Desktop & Tablet) */}
              {user ? (
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-label="User profile"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-[#C86B4C] hover:bg-[#F6F1E8] transition-colors cursor-pointer"
                  >
                    <User className="w-[18px] h-[18px]" />
                  </button>
                  <div
                    className={`absolute right-0 mt-2 w-52 bg-[#F6F1E8] border border-[#E8E2D5] rounded-xl shadow-xl p-2 z-50 ${
                      isUserMenuOpen ? "block" : "hidden"
                    }`}
                  >
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {user.email || user.name}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-[#FAF7F2] rounded-md transition-colors"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1.5 mt-1 cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  aria-label="Sign In"
                  className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-gray-700 hover:text-[#C86B4C] hover:bg-[#F6F1E8] transition-colors cursor-pointer"
                >
                  <User className="w-[18px] h-[18px]" />
                </Link>
              )}

              {/* Wishlist Heart Icon (Desktop & Tablet) */}
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-gray-700 hover:text-[#C86B4C] hover:bg-[#F6F1E8] transition-colors cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <Heart className="w-[18px] h-[18px]" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#C86B4C] text-white text-[8.5px] font-bold flex items-center justify-center shadow-xs leading-none">
                      {wishlist.length}
                    </span>
                  )}
                </div>
              </Link>

              {/* Cart Icon with Small Terracotta Badge */}
              <Link
                to="/cart"
                aria-label="Shopping Cart"
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-[#C86B4C] hover:bg-[#F6F1E8] transition-colors cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingCart className="w-[18px] h-[18px]" />
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#C86B4C] text-white text-[8.5px] font-bold flex items-center justify-center shadow-xs leading-none">
                    {totalItems || 0}
                  </span>
                </div>
              </Link>

              {/* Menu Toggle (Mobile & Tablet only) */}
              <button
                aria-label="Toggle navigation menu"
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-[#C86B4C] hover:bg-[#F6F1E8] transition-colors cursor-pointer"
              >
                {isMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-[#FAF7F2] shadow-2xl flex flex-col justify-between border-l border-[#E8E2D8] z-[80] overflow-y-auto"
            >
              <div>
                {/* Drawer Header */}
                <div className="h-14 px-5 border-b border-[#E8E2D8] flex items-center justify-between bg-[#F6F1E8] shrink-0">
                  <div className="flex items-center">
                    <GharSansarLogo variant="dark" />
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    className="w-8 h-8 rounded-full bg-white border border-[#E8E2D8] hover:border-[#D9B4A4] flex items-center justify-center text-gray-700 hover:text-black transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* User Status / Profile Card */}
                <div className="p-3.5 mx-4 mt-4 bg-white rounded-xl border border-[#E8E2D8] shadow-2xs">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#F7EBE4] text-[#7D3219] flex items-center justify-center shrink-0">
                          <User size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-500 font-normal">Signed in</p>
                          <p className="text-xs font-medium text-gray-950 truncate">
                            {user.name || user.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="px-2.5 py-1 text-xs font-medium text-[#7D3219] bg-[#F7EBE4] rounded-md border border-[#D9B4A4] hover:bg-[#EFE0D7] transition-colors shrink-0"
                      >
                        Profile
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#736B63] flex items-center justify-center shrink-0">
                          <User size={15} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900">Welcome Guest</p>
                          <p className="text-[10px] text-[#736B63]">Sign in to track orders</p>
                        </div>
                      </div>
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-1 bg-[#C26847] hover:bg-[#B05B3C] text-white rounded-md text-xs font-medium shadow-2xs transition-colors shrink-0"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>

                {/* Quick Action Tiles: Wishlist & Cart */}
                <div className="grid grid-cols-2 gap-2.5 px-4 mt-3">
                  <Link
                    to="/wishlist"
                    onClick={() => setMenuOpen(false)}
                    className="p-3 bg-white rounded-xl border border-[#E8E2D8] hover:border-[#D9B4A4] flex items-center justify-between text-xs text-gray-800 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <Heart size={14} className="text-[#C26847]" />
                      <span className="font-normal text-gray-900">Wishlist</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#F7EBE4] text-[#7D3219] text-[10px] font-bold">
                      {wishlist.length}
                    </span>
                  </Link>

                  <Link
                    to="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="p-3 bg-white rounded-xl border border-[#E8E2D8] hover:border-[#D9B4A4] flex items-center justify-between text-xs text-gray-800 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={14} className="text-[#C26847]" />
                      <span className="font-normal text-gray-900">Cart</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#C26847] text-white text-[10px] font-bold">
                      {totalItems || 0}
                    </span>
                  </Link>
                </div>

                {/* Navigation Links */}
                <div className="px-4 mt-5 space-y-1">
                  <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#736B63] px-2 block mb-2">
                    Menu Collections
                  </span>
                  {navLinks.map((link) => {
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-poppins transition-colors ${
                          active
                            ? "bg-white text-[#7D3219] font-medium border border-[#E8E2D8] shadow-2xs"
                            : "text-gray-800 hover:bg-white/60 hover:text-[#C26847]"
                        }`}
                      >
                        <span>{link.label}</span>
                        <ChevronRight size={13} className={active ? "text-[#C26847]" : "text-gray-400"} />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer with safe bottom padding for floating chat */}
              <div className="p-4 border-t border-[#E8E2D8] bg-[#F6F1E8] space-y-2.5 pb-24 sm:pb-6 mt-6">
                <a
                  href="https://wa.me/919492664870"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 shadow-2xs transition-colors"
                >
                  <MessageCircle size={15} className="fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>
                <p className="text-[11px] text-[#736B63] text-center">
                  Ghar Sansar • Home Decor & Curations
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
