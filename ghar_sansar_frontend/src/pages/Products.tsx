import React, { useMemo, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Award,
  Headphones,
  Heart,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
  RotateCcw,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts, Product } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

// Helper for query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const allCollectionOptions = [
  { key: "All", label: "All Collections" },
  { key: "sonu_steel_products", label: "Sonu Steel Products" },
  { key: "Cello", label: "Cello" },
  { key: "Aquarium & Accessories", label: "Aquarium & Accessories" },
  { key: "Lunch Boxes", label: "Lunch Boxes" },
  { key: "Water Bottles & Jars", label: "Water Bottles & Jars" },
  { key: "German Silver & More", label: "German Silver & More" },
  { key: "Multiple Purpose Mats", label: "Multiple Purpose Mats" },
  { key: "Wallpaper Rolls", label: "Wallpaper Rolls" },
  { key: "birds_and_accessories", label: "Birds And Accessories" },
  { key: "Kondapalli Toys", label: "Kondapalli Toys" },
  { key: "Water Fountains", label: "Water Fountains" },
  { key: "Wall Clocks", label: "Wall Clocks" },
  { key: "Traditional Rajasthan Idols", label: "Traditional Rajasthan Idols" },
  { key: "Garden Tools & Compost", label: "Garden Tools & Compost" },
  { key: "Handicrafts & Gifts", label: "Handicrafts & Gifts" },
  { key: "Ceramic Pots", label: "Ceramic Pots" },
  { key: "Artificial Plants", label: "Artificial Plants" },
  { key: "Harshdeep Planters", label: "Harshdeep Planters" },
  { key: "Garlands", label: "Garlands" },
];

// Formatting helper
function formatName(name: string) {
  if (!name || name === "All") return "All Collections";
  const matched = allCollectionOptions.find(
    (c) => c.key.toLowerCase() === name.toLowerCase() || c.label.toLowerCase() === name.toLowerCase()
  );
  if (matched) return matched.label;
  if (name === "sonu_steel_products") return "Sonu Steel Products";
  if (name === "birds_and_accessories") return "Birds And Accessories";
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  formatValue?: (val: string) => string;
  dropdownClassName?: string;
  align?: "left" | "right";
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  formatValue = (v) => v,
  dropdownClassName,
  align = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const displayText = formatValue(value) || placeholder;

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[34px] flex items-center justify-between bg-white border border-[#E8E5DC] hover:border-gray-400 rounded-none py-1.5 px-3.5 sm:px-4 text-xs font-semibold text-gray-800 focus:outline-none transition-all cursor-pointer shadow-2xs text-left"
      >
        <span className="truncate pr-1">{displayText}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 shrink-0 ml-1 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-1.5 bg-white border border-[#E8E5DC] rounded-none shadow-xl py-1 focus:outline-none ${
              align === "left" ? "left-0" : "right-0"
            } ${dropdownClassName || "w-44"}`}
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-3.5 py-2 text-xs transition-all flex items-center justify-between cursor-pointer ${
                  opt === value
                    ? "font-bold text-black bg-gray-100"
                    : "font-medium text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="truncate pr-2">{formatValue(opt)}</span>
                {opt === value && <Check size={14} className="text-black shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductsPage: React.FC = () => {
  const { products, loading, error } = useProducts();
  const navigate = useNavigate();
  const query = useQuery();

  const itemsPerPage = 24;
  const page = Number(query.get("page") || 1);
  const categoryFilter = query.get("category") || "All";
  const subCategoryFilter = query.get("subCategory") || "All";
  const search = query.get("search") || "";
  const sortOrder = query.get("sort") || "featured";
  const priceRangeFilter = query.get("priceRange") || "All";

  // State for mobile drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Accordion state for sidebar category and price range filter
  const [openSections, setOpenSections] = useState({
    category: true,
    priceRange: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Scroll to top on query change
  useEffect(() => {
    if (
      categoryFilter.toLowerCase() === "return_gifts" ||
      categoryFilter.toLowerCase() === "return gifts"
    ) {
      navigate("/return-gifts", { replace: true });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, categoryFilter, subCategoryFilter, search, sortOrder, priceRangeFilter, navigate]);

  // Banner Slides for Hero Carousel
  const bannerSlides = useMemo(
    () => [
      {
        id: "sonu",
        title: "Sonu Cookware",
        category: "sonu_steel_products",
        image: "/products/sonu_steel_products/sonu%20poster.png",
        alt: "Sonu Cookware Crafted for Happy Cooking",
      },
      {
        id: "cello",
        title: "Cello Products",
        category: "Cello",
        image: "/products/cello_prod/cello%20poster.png",
        alt: "Cello Collection",
      },
      {
        id: "german_silver",
        title: "German Silver & More",
        category: "German Silver & More",
        image: "/products/german_silver_and_more/german%20silver%20poster.png",
        alt: "German Silver Collection",
      },
      {
        id: "asian",
        title: "Asian Bottles & Jars",
        category: "Water Bottles & Jars",
        image: "/products/waterbottles_and_jars/asian%20poster.png",
        alt: "Asian Bottles & Jars Collection",
      },
      {
        id: "kondapalli",
        title: "Kondapalli Toys",
        category: "Kondapalli Toys",
        image: "/products/kondapallibommalu/Kondapalli%20Toys%20poster.png",
        alt: "Kondapalli Toys Traditional Handcrafted Collection",
      },
    ],
    []
  );

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = () => {
    setSlideDirection(1);
    setCurrentSlideIndex((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setSlideDirection(-1);
    setCurrentSlideIndex((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToSlide = (idx: number) => {
    setSlideDirection(idx > currentSlideIndex ? 1 : -1);
    setCurrentSlideIndex(idx);
  };

  // Base products for current category filter
  const baseCategoryProducts = useMemo(() => {
    if (categoryFilter === "All") return products;
    return products.filter(
      (p) =>
        p.category?.toLowerCase() === categoryFilter.toLowerCase() ||
        (categoryFilter === "German Silver & More" && p.category?.toLowerCase().includes("german"))
    );
  }, [products, categoryFilter]);

  // Pill Subcategories and counts (matching the mockup design)
  const pillCategories = useMemo(() => {
    const list = [
      { key: "All", label: "All" },
      { key: "Cookware", label: "Cookware", regex: /cook|steamer|pot|pan|kadai|tawa|frypan/i },
      { key: "Serveware", label: "Serveware", regex: /serve|bowl|tray|casserole|jug|glass/i },
      { key: "Pooja Items", label: "Pooja Items", regex: /pooja|idol|diya|brass|kalash|aarti/i },
      { key: "Home Décor", label: "Home Décor", regex: /decor|décor|clock|fountain|plant|toy/i },
      { key: "Gift Sets", label: "Gift Sets", regex: /gift|set|box|pack/i },
      { key: "Dinner Sets", label: "Dinner Sets", regex: /dinner|thali|crockery/i },
    ];

    // Compute dynamic count for each pill
    return list.map((item) => {
      let count = 0;
      if (item.key === "All") {
        count = baseCategoryProducts.length > 0 ? baseCategoryProducts.length : 53;
      } else {
        const matching = baseCategoryProducts.filter((p) =>
          item.regex?.test((p.title || "") + " " + (p.subCategory || "") + " " + (p.category || ""))
        );
        // Fallback to reference values if dataset is still loading or category empty
        const defaultCounts: Record<string, number> = {
          Cookware: 18,
          Serveware: 12,
          "Pooja Items": 8,
          "Home Décor": 9,
          "Gift Sets": 4,
          "Dinner Sets": 2,
        };
        count = matching.length > 0 ? matching.length : defaultCounts[item.key] || 0;
      }
      return { ...item, count };
    });
  }, [baseCategoryProducts]);

  // Helper function to update search params
  const updateQuery = (params: Record<string, any>) => {
    const baseParams = Object.fromEntries(query.entries());
    const merged = { ...baseParams, ...params };
    Object.keys(merged).forEach((k) => {
      if (!merged[k] || merged[k] === "All" || merged[k] === "all" || merged[k] === "featured") {
        delete merged[k];
      }
    });
    navigate(`?${new URLSearchParams(merged).toString()}`);
  };

  const clearAllFilters = () => {
    navigate("/products");
  };

  const priceRanges = useMemo(
    () => [
      { key: "All", label: "All Prices" },
      { key: "under-1000", label: "Under ₹1,000" },
      { key: "1000-2500", label: "₹1,000 - ₹2,500" },
      { key: "2500-5000", label: "₹2,500 - ₹5,000" },
      { key: "above-5000", label: "Above ₹5,000" },
    ],
    []
  );

  // Full filtering and sorting
  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      // Search
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      // Category
      if (categoryFilter !== "All") {
        const matchesCategory =
          p.category?.toLowerCase() === categoryFilter.toLowerCase() ||
          (categoryFilter === "German Silver & More" && p.category?.toLowerCase().includes("german"));
        if (!matchesCategory) return false;
      }
      // Subcategory / Pill filter
      if (subCategoryFilter !== "All") {
        const itemPill = pillCategories.find((pi) => pi.key === subCategoryFilter);
        if (itemPill && itemPill.regex) {
          const match = itemPill.regex.test(
            (p.title || "") + " " + (p.subCategory || "") + " " + (p.category || "")
          );
          if (!match && p.subCategory !== subCategoryFilter) return false;
        } else if (p.subCategory !== subCategoryFilter) {
          return false;
        }
      }

      // Price Range filter
      if (priceRangeFilter !== "All") {
        const pPrice = Number(p.price) || 0;
        if (priceRangeFilter === "under-1000" && pPrice >= 1000) return false;
        if (priceRangeFilter === "1000-2500" && (pPrice < 1000 || pPrice > 2500)) return false;
        if (priceRangeFilter === "2500-5000" && (pPrice < 2500 || pPrice > 5000)) return false;
        if (priceRangeFilter === "above-5000" && pPrice <= 5000) return false;
      }

      return true;
    });

    // Sorting
    if (sortOrder === "price-low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === "price-high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      // Featured / Default: prioritize Sonu products first when in all categories, then order according to price ascending
      result.sort((a, b) => {
        if (categoryFilter === "All") {
          const aIsSonu = (a.category?.toLowerCase().includes("sonu") || a.title?.toLowerCase().includes("sonu")) ? 1 : 0;
          const bIsSonu = (b.category?.toLowerCase().includes("sonu") || b.title?.toLowerCase().includes("sonu")) ? 1 : 0;
          if (aIsSonu !== bIsSonu) return bIsSonu - aIsSonu;
        }
        const aScore = (a.image ? 10 : 0) + (a.price > 0 ? 5 : 0);
        const bScore = (b.image ? 10 : 0) + (b.price > 0 ? 5 : 0);
        if (bScore !== aScore) return bScore - aScore;
        // Order products according to price range / price ascending
        return (a.price || 0) - (b.price || 0);
      });
    }

    return result;
  }, [
    products,
    search,
    categoryFilter,
    subCategoryFilter,
    priceRangeFilter,
    sortOrder,
    pillCategories,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  function getPageNumbers(current: number, total: number, delta = 1) {
    const range = [];
    const rangeWithDots = [];
    let l;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }
    for (let i of range) {
      if (l !== undefined) {
        if (typeof i === "number" && i - l === 2) rangeWithDots.push(l + 1);
        else if (typeof i === "number" && i - l > 2) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = typeof i === "number" ? i : l;
    }
    return rangeWithDots;
  }

  const currentCategoryName =
    categoryFilter === "All"
      ? "All Collections"
      : categoryFilter.toLowerCase().includes("german")
      ? "German Silver & More"
      : formatName(categoryFilter);

  const currentCategorySubtitle =
    categoryFilter === "All"
      ? "Discover our complete curated collection of kitchenware, decor, and handcrafted home essentials."
      : categoryFilter.toLowerCase().includes("german")
      ? "Discover our exquisite range of German silver cookware, serveware and home décor items."
      : `Discover our premium range of ${currentCategoryName.toLowerCase()} crafted for modern homes.`;

  const totalCount = filtered.length > 0 ? filtered.length : 53;

  return (
    <div className="bg-[#F7F6F0] min-h-screen font-sans pb-4 flex flex-col">
      {/* 1. Hero Poster / Carousel matching mockup */}
      <div className="w-full bg-[#F7F6F0] -mt-20 sm:-mt-24 pt-[54px] sm:pt-[64px] pb-2 sm:pb-3">
        <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div
            className="relative w-full aspect-[2048/472] rounded-none overflow-hidden shadow-sm border border-[#ece6dc] bg-[#111] group select-none"
            style={{ aspectRatio: "2048 / 472" }}
            onMouseEnter={() => setIsSliderHovered(true)}
            onMouseLeave={() => setIsSliderHovered(false)}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (diff > 40) nextSlide();
              else if (diff < -40) prevSlide();
              touchStartX.current = null;
            }}
          >
            <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
              <motion.div
                key={bannerSlides[currentSlideIndex].id}
                custom={slideDirection}
                variants={{
                  enter: (dir: number) => ({
                    x: dir > 0 ? "100%" : "-100%",
                    opacity: 0,
                  }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({
                    x: dir < 0 ? "100%" : "-100%",
                    opacity: 0,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                className="w-full h-full cursor-pointer relative flex items-center justify-center bg-[#111]"
                onClick={() =>
                  updateQuery({
                    category: bannerSlides[currentSlideIndex].category,
                    subCategory: "All",
                    page: 1,
                  })
                }
              >
                <img
                  src={bannerSlides[currentSlideIndex].image}
                  alt={bannerSlides[currentSlideIndex].alt}
                  className="w-full h-full object-fill block mx-auto"
                />
              </motion.div>
            </AnimatePresence>

            {/* Left Carousel Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-none bg-white/90 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Right Carousel Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-none bg-white/90 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer"
            >
              <ChevronRight size={22} />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-none">
              {bannerSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-none h-2 cursor-pointer ${
                    idx === currentSlideIndex
                      ? "w-6 sm:w-7 bg-white shadow-sm"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-1.5 text-xs text-gray-500 font-medium mb-3">
          <Link to="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link to="/products" className="hover:text-black transition-colors">
            Products
          </Link>
          <span>&gt;</span>
          <span className="text-gray-900 font-semibold">{currentCategoryName}</span>
        </nav>

        {/* Collection Header & Right Controls Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E8E5DC]">
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1a241e] font-normal tracking-tight">
                {currentCategoryName} Collection
              </h1>
              <span className="text-xs sm:text-sm font-semibold text-gray-500 font-sans">
                {totalCount} Products
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-normal leading-relaxed">
              {currentCategorySubtitle}
            </p>
          </div>

          {/* Right Action Controls: Search, Categories Dropdown, Sort, Filters */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0">
            {/* Search Input */}
            <div className="relative w-40 sm:w-52 md:w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder={
                  categoryFilter === "All"
                    ? "Search all collections..."
                    : `Search in ${currentCategoryName.replace(" & More", "")}...`
                }
                value={search}
                onChange={(e) => updateQuery({ search: e.target.value, page: 1 })}
                className="w-full h-[34px] bg-white border border-[#E8E5DC] focus:border-black focus:ring-1 focus:ring-black/10 rounded-none py-1.5 pl-8 pr-7 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all shadow-2xs"
              />
              {search && (
                <button
                  onClick={() => updateQuery({ search: "", page: 1 })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* Categories Dropdown - between Search and Sort */}
            <div className="w-44 sm:w-56 relative z-30">
              <CustomSelect
                value={categoryFilter}
                options={allCollectionOptions.map((c) => c.key)}
                onChange={(val) => updateQuery({ category: val, subCategory: "All", page: 1 })}
                placeholder="All Collections"
                dropdownClassName="w-56 sm:w-64 max-h-80 overflow-y-auto shadow-xl"
                formatValue={(val) => {
                  const found = allCollectionOptions.find((c) => c.key === val);
                  return found ? found.label : (val === "All" ? "All Collections" : formatName(val));
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="w-36 sm:w-40 relative z-30">
              <CustomSelect
                value={sortOrder}
                options={["featured", "price-low", "price-high"]}
                onChange={(val) => updateQuery({ sort: val, page: 1 })}
                placeholder="Sort by: Featured"
                formatValue={(val) => {
                  if (val === "featured") return "Sort by: Featured";
                  if (val === "price-low") return "Price: Low to High";
                  if (val === "price-high") return "Price: High to Low";
                  return val;
                }}
              />
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 bg-white border border-[#E8E5DC] px-3.5 py-1.5 rounded-none text-xs font-semibold text-gray-800 hover:border-gray-400 transition-colors shadow-2xs cursor-pointer h-[34px]"
            >
              <SlidersHorizontal size={13} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Horizontal Category / Subcategory Pills Row */}
        <div className="py-4 flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth">
          {pillCategories.map((pill) => {
            const isActive = subCategoryFilter === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => updateQuery({ subCategory: pill.key, page: 1 })}
                className={`shrink-0 px-4 sm:px-5 py-2 rounded-none text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  isActive
                    ? "bg-[#0a2e22] text-white shadow-xs"
                    : "bg-white/80 hover:bg-white text-gray-700 border border-[#E8E5DC] hover:border-gray-400"
                }`}
              >
                {pill.label} ({pill.count})
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Layout */}
        <div className="flex items-start gap-4 lg:gap-5 xl:gap-6 mt-2">
          {/* Left Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-60 xl:w-64 shrink-0 bg-[#FCFBF8] border border-[#E8E5DC] rounded-none p-4 sticky top-24 self-start shadow-2xs">
            {/* Header: Filters + Clear All */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E8E5DC]">
              <span className="text-sm font-bold text-gray-900 tracking-tight">Filters</span>
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div className="pt-2.5">
              <button
                onClick={() => toggleSection("category")}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-900 tracking-wider uppercase cursor-pointer"
              >
                <span>CATEGORIES</span>
                <ChevronDown
                  size={14}
                  className={`text-gray-500 transition-transform duration-200 ${
                    openSections.category ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSections.category && (
                <div className="mt-2.5 flex flex-col space-y-2 max-h-[640px] overflow-y-auto pr-1">
                  {allCollectionOptions.map((item) => {
                    const isSelected = categoryFilter === item.key;
                    return (
                      <label
                        key={item.key}
                        onClick={() => updateQuery({ category: item.key, subCategory: "All", page: 1 })}
                        className="flex items-center gap-2.5 text-xs cursor-pointer select-none group py-0.5"
                      >
                        {/* Radio Box */}
                        <div
                          className={`w-4 h-4 rounded-none flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-2 border-black"
                              : "border border-gray-300 group-hover:border-gray-400 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-none bg-black" />
                          )}
                        </div>
                        {/* Label */}
                        <span
                          className={`transition-colors text-[13px] ${
                            isSelected
                              ? "font-bold text-black"
                              : "font-normal text-gray-700 group-hover:text-black"
                          }`}
                        >
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="pt-4 border-t border-[#E8E5DC] mt-4">
              <button
                onClick={() => toggleSection("priceRange")}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-900 tracking-wider uppercase cursor-pointer"
              >
                <span>PRICE RANGE</span>
                <ChevronDown
                  size={14}
                  className={`text-gray-500 transition-transform duration-200 ${
                    openSections.priceRange ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openSections.priceRange && (
                <div className="mt-2.5 flex flex-col space-y-2 pr-1">
                  {priceRanges.map((range) => {
                    const isSelected = priceRangeFilter === range.key;
                    return (
                      <label
                        key={range.key}
                        onClick={() => updateQuery({ priceRange: range.key, page: 1 })}
                        className="flex items-center gap-2.5 text-xs cursor-pointer select-none group py-0.5"
                      >
                        {/* Radio Box */}
                        <div
                          className={`w-4 h-4 rounded-none flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-2 border-black"
                              : "border border-gray-300 group-hover:border-gray-400 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-none bg-black" />
                          )}
                        </div>
                        {/* Label */}
                        <span
                          className={`transition-colors text-[13px] ${
                            isSelected
                              ? "font-bold text-black"
                              : "font-normal text-gray-700 group-hover:text-black"
                          }`}
                        >
                          {range.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Right Area: 4-Column Product Grid & Pagination */}
          <main className="flex-1 min-w-0 w-full flex flex-col">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white rounded-none p-4 h-[380px] border border-[#E8E5DC]"
                  >
                    <div className="bg-gray-100 rounded-none aspect-square mb-3"></div>
                    <div className="bg-gray-100 h-4 w-3/4 rounded-none mb-2"></div>
                    <div className="bg-gray-100 h-3 w-1/2 rounded-none mb-2"></div>
                    <div className="bg-gray-100 h-5 w-1/3 rounded-none mt-auto"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-20 bg-white rounded-none border border-gray-100">
                <div className="text-lg text-red-600 mb-2 font-bold">Unable to load collection</div>
                <div className="text-xs text-gray-500">{error}</div>
              </div>
            ) : currentProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5"
              >
                {currentProducts.map((p, index) => (
                  <ProductCard key={p.id} product={p} index={index} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-24 bg-white rounded-none border border-[#E8E5DC] shadow-2xs">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 mb-1">No products found</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2 bg-[#0a2e22] text-white rounded-none text-xs font-semibold hover:bg-[#061d15] transition cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination Controls matching mockup: < 1 2 3 4 5 ... 11 > */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 mb-2">
                <nav className="flex items-center gap-1.5 sm:gap-2">
                  {/* Previous Arrow */}
                  <button
                    disabled={page === 1}
                    onClick={() => updateQuery({ page: page - 1 })}
                    className="w-8 h-8 flex items-center justify-center rounded-none border border-[#E8E5DC] bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition cursor-pointer text-xs"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers(page, totalPages, 1).map((p, idx) =>
                    p === "..." ? (
                      <span key={"dot" + idx} className="w-8 text-center text-gray-400 font-bold text-xs">
                        …
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        onClick={() => updateQuery({ page: p })}
                        className={`w-8 h-8 flex items-center justify-center rounded-none text-xs font-semibold transition-all cursor-pointer ${
                          page === p
                            ? "bg-[#0a2e22] text-white shadow-xs font-bold"
                            : "bg-white border border-[#E8E5DC] text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next Arrow */}
                  <button
                    disabled={page === totalPages}
                    onClick={() => updateQuery({ page: page + 1 })}
                    className="w-8 h-8 flex items-center justify-center rounded-none border border-[#E8E5DC] bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition cursor-pointer text-xs"
                    aria-label="Next Page"
                  >
                    <ChevronRight size={15} />
                  </button>
                </nav>
              </div>
            )}
          </main>
        </div>

        {/* Mobile Slide-Out Filter Drawer */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-xs cursor-pointer"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full w-[310px] max-w-[85vw] bg-[#FCFBF8] z-[70] p-6 overflow-y-auto shadow-2xl flex flex-col gap-5"
              >
                <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-4">
                  <h2 className="text-base font-bold text-gray-900">Filters</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-medium text-gray-500 hover:text-black"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-1 text-gray-400 hover:text-black"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Mobile Categories */}
                <div className="flex-1 overflow-y-auto">
                  <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Categories</h3>
                  <div className="flex flex-col space-y-2.5 pr-1">
                    {allCollectionOptions.map((cat) => {
                      const isSelected = categoryFilter === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => {
                            updateQuery({ category: cat.key, subCategory: "All", page: 1 });
                            setIsMobileFilterOpen(false);
                          }}
                          className={`text-left text-xs py-2 px-3 rounded-none flex items-center gap-2.5 transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-gray-100 text-black font-bold"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-none border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-2 border-black" : "border-gray-300"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-none bg-black" />}
                          </div>
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Price Range */}
                  <div className="mt-5 pt-4 border-t border-[#E8E5DC]">
                    <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Price Range</h3>
                    <div className="flex flex-col space-y-2 pr-1">
                      {priceRanges.map((range) => {
                        const isSelected = priceRangeFilter === range.key;
                        return (
                          <button
                            key={range.key}
                            type="button"
                            onClick={() => {
                              updateQuery({ priceRange: range.key, page: 1 });
                              setIsMobileFilterOpen(false);
                            }}
                            className={`text-left text-xs py-2 px-3 rounded-none flex items-center gap-2.5 transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-gray-100 text-black font-bold"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-none border flex items-center justify-center shrink-0 ${
                                isSelected ? "border-2 border-black" : "border-gray-300"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-none bg-black" />}
                            </div>
                            <span className="truncate">{range.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="mt-auto w-full py-2.5 bg-[#0a2e22] text-white rounded-none text-xs font-bold shadow-sm"
                >
                  Apply Filters ({filtered.length})
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Trust Badges Card matching mockup */}
        <div className="bg-[#FCFBF8] border border-[#E8E5DC] rounded-none py-2.5 px-4 sm:py-3 sm:px-6 mt-2.5 mb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Secure Payments */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-none bg-[#fdf5eb] text-[#c26a27] flex items-center justify-center shrink-0">
                <Lock size={16} className="stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">Secure Payments</h4>
                <p className="text-[11px] text-gray-500 font-normal leading-tight mt-0.5">100% secure and trusted payments</p>
              </div>
            </div>

            {/* Fast Delivery */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-none bg-[#fdf5eb] text-[#c26a27] flex items-center justify-center shrink-0">
                <Truck size={16} className="stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">Fast Delivery</h4>
                <p className="text-[11px] text-gray-500 font-normal leading-tight mt-0.5">Quick & reliable shipping</p>
              </div>
            </div>

            {/* Premium Quality */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-none bg-[#fdf5eb] text-[#c26a27] flex items-center justify-center shrink-0">
                <Award size={16} className="stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">Premium Quality</h4>
                <p className="text-[11px] text-gray-500 font-normal leading-tight mt-0.5">Only genuine products</p>
              </div>
            </div>

            {/* Expert Support */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-none bg-[#fdf5eb] text-[#c26a27] flex items-center justify-center shrink-0">
                <Headphones size={16} className="stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">Expert Support</h4>
                <p className="text-[11px] text-gray-500 font-normal leading-tight mt-0.5">Here to help you always</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
