import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ShoppingCart,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  Search,
  X,
  Plus,
  Minus,
  Check,
  Home,
  Star,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StudioImage from '../components/StudioImage';
import toast from 'react-hot-toast';

// ---------------------------------------------------------
// Constant Filter Definitions
// ---------------------------------------------------------
const categories = ['All Gifts', 'Wedding', 'Housewarming', 'Corporate', 'Festivals', 'Luxury'];

const materials = ['German Silver', 'Brass', 'Ceramic', 'Wood', 'Glass', 'Crystal'];

const priceRanges = [
  { key: '', label: 'All Prices' },
  { key: 'under-200', label: 'Under ₹200', max: 200 },
  { key: '200-350', label: '₹200 - ₹350', min: 200, max: 350 },
  { key: '350-500', label: '₹350 - ₹500', min: 350, max: 500 },
  { key: 'above-500', label: 'Above ₹500', min: 500 },
];

// Deterministic rating helper
function getGiftRating(id: string): { rating: string; count: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const ratingVal = 4.3 + (abs % 7) * 0.1;
  const count = 35 + (abs % 160);
  return {
    rating: ratingVal.toFixed(1),
    count,
  };
}

// ---------------------------------------------------------
// Fallback Studio Image Component
// ---------------------------------------------------------
function CMSImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  if (!src || error || src.includes('unsplash.com')) {
    return (
      <div className={`flex flex-col items-center justify-center bg-[#FAF8F5] text-gray-400 ${className}`}>
        <ImageIcon size={24} className="mb-2 opacity-40 text-stone-400" />
        <span className="text-[10px] font-normal uppercase tracking-widest text-center px-2 text-stone-500">
          Ghar Sansar Original
        </span>
      </div>
    );
  }
  return <StudioImage src={src} alt={alt} className={className} loading="lazy" />;
}

// ---------------------------------------------------------
// MAIN RETURN GIFTS / FESTIVE GIFTS PAGE
// ---------------------------------------------------------
export default function ReturnGifts() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  // Search input state with debounce
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Active filters from URL
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All Gifts';
  const material = searchParams.get('material') || '';
  const priceFilter = searchParams.get('price') || '';
  const sort = searchParams.get('sort') || '';

  // React Query Fetcher
  const fetchProducts = async () => {
    const API_BASE = import.meta.env.VITE_AWS_API_URL || '/api';
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category && category !== 'All Gifts') params.append('category', category);
    if (material) params.append('material', material);
    if (sort) params.append('sort', sort);
    params.append('limit', '1000');

    const res = await fetch(`${API_BASE}/return_gifts?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch gifts');
    return res.json();
  };

  const { data, isFetching, error } = useQuery({
    queryKey: ['returnGifts', q, category, material, sort],
    queryFn: fetchProducts,
    placeholderData: (prev) => prev,
  });

  // Debounce search input into URL query
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams((prev) => {
        if (searchInput) prev.set('q', searchInput);
        else prev.delete('q');
        return prev;
      });
      setCurrentPage(1);
    }, 280);
    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams]);

  // Client-side price range filtering
  const allProducts = data?.products || [];
  const filteredProducts = useMemo(() => {
    if (!priceFilter) return allProducts;
    const selectedRange = priceRanges.find((r) => r.key === priceFilter);
    if (!selectedRange) return allProducts;

    return allProducts.filter((p: any) => {
      const price = Number(p.price);
      if (selectedRange.min !== undefined && price < selectedRange.min) return false;
      if (selectedRange.max !== undefined && price > selectedRange.max) return false;
      return true;
    });
  }, [allProducts, priceFilter]);

  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / itemsPerPage);

  // Paginated product slice
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, material, priceFilter, q, sort]);

  // Active filter chips list
  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; specificValue?: string }[] = [];
    if (category !== 'All Gifts') chips.push({ key: 'category', label: category });
    if (material) {
      material.split(',').forEach((m) => {
        if (m.trim()) chips.push({ key: 'material', label: m.trim(), specificValue: m.trim() });
      });
    }
    if (priceFilter) {
      const r = priceRanges.find((pr) => pr.key === priceFilter);
      if (r) chips.push({ key: 'price', label: r.label });
    }
    if (q) chips.push({ key: 'q', label: `"${q}"` });
    return chips;
  }, [category, material, priceFilter, q]);

  const removeFilter = (filterKey: string, specificValue?: string) => {
    setSearchParams((prev) => {
      if (filterKey === 'material' && specificValue) {
        const current = prev.get('material')?.split(',') || [];
        const updated = current.filter((m) => m !== specificValue);
        if (updated.length) prev.set('material', updated.join(','));
        else prev.delete('material');
      } else {
        prev.delete(filterKey);
        if (filterKey === 'category') prev.set('category', 'All Gifts');
        if (filterKey === 'q') setSearchInput('');
      }
      return prev;
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
    setCurrentPage(1);
  };

  const activeMaterials = useMemo(() => {
    return material ? material.split(',').filter(Boolean) : [];
  }, [material]);

  const handleToggleMaterial = (mat: string) => {
    setSearchParams((prev) => {
      const current = prev.get('material')?.split(',').filter(Boolean) || [];
      const updated = current.includes(mat)
        ? current.filter((m) => m !== mat)
        : [...current, mat];
      if (updated.length) prev.set('material', updated.join(','));
      else prev.delete('material');
      return prev;
    });
    setCurrentPage(1);
  };

  const handleSelectCategory = (cat: string) => {
    setSearchParams((prev) => {
      if (cat === 'All Gifts') prev.delete('category');
      else prev.set('category', cat);
      return prev;
    });
    setCurrentPage(1);
  };

  const handleSelectPrice = (pKey: string) => {
    setSearchParams((prev) => {
      if (!pKey) prev.delete('price');
      else prev.set('price', pKey);
      return prev;
    });
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen font-poppins pb-20 flex flex-col selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
      {/* 1. Inset Hero Banner */}
      <div className="w-full bg-[#FAF7F2] pt-16 sm:pt-20 pb-2 sm:pb-2.5">
        <div className="w-full max-w-[1880px] mx-auto px-3 sm:px-6 md:px-8 lg:px-10">
          <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden border-[2.5px] sm:border-[3px] border-[#F6F1E8] shadow-md bg-[#181513] group select-none h-[145px] sm:h-[180px] lg:h-[210px] xl:h-[230px]">
            {/* Background Image: rich, high-clarity festive gifts showcase */}
            <img
              src="/images/festive_gifts_banner.jpg"
              alt="Festive and Return Gifts"
              className="absolute inset-0 w-full h-full object-cover object-[center_35%] pointer-events-none"
            />
            {/* Soft directional gradient only over text area so the gifts remain vibrant & visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent max-w-[56%] sm:max-w-xl z-[1]" />

            {/* Banner typography */}
            <div className="relative h-full flex flex-col justify-center px-3 sm:px-10 md:px-14 lg:px-16 max-w-[52%] xs:max-w-[54%] sm:max-w-xl z-10">
              <span className="text-[8.5px] xs:text-[9.5px] sm:text-[11px] font-medium tracking-[0.16em] sm:tracking-[0.26em] text-[#E8A588] uppercase font-sans mb-1 sm:mb-2 block drop-shadow-xs line-clamp-1">
                Artisanal Curations • Favors
              </span>
              <h1 className="text-[17px] xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-poppins text-white font-normal tracking-tight leading-[1.18] sm:leading-tight mb-1 sm:mb-2 drop-shadow-xs">
                Festive &amp; Return Gifts
              </h1>
              <p className="text-[10px] xs:text-[11px] sm:text-[13px] text-[#FAF7F2]/90 font-normal leading-[14px] xs:leading-[16px] sm:leading-relaxed line-clamp-2 drop-shadow-xs">
                <span className="sm:hidden">Handcrafted German silver, brass &amp; sacred celebration favors.</span>
                <span className="hidden sm:inline">Handcrafted German silver, brass, ceramic, crystal, and sacred favors for weddings, housewarmings, anniversaries, and joyful festivities.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="w-full max-w-[1880px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pt-2 sm:pt-2.5">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs sm:text-[13px] text-gray-500 font-medium mb-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hover:text-[#7D3219] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Home size={14} className="shrink-0 text-gray-500" />
            <span>Home</span>
          </button>
          <span className="text-gray-400 select-none px-0.5">&gt;</span>
          {category !== 'All Gifts' ? (
            <>
              <button
                type="button"
                onClick={() => handleSelectCategory('All Gifts')}
                className="hover:text-[#7D3219] transition-colors cursor-pointer"
              >
                Festive Gifts
              </button>
              <span className="text-gray-400 select-none px-0.5">&gt;</span>
              <span className="text-gray-900 font-semibold">{category}</span>
            </>
          ) : (
            <span className="text-gray-900 font-semibold">Festive Gifts</span>
          )}
        </nav>

        {/* Collection Header & Right Controls Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
          <div>
            <span className="text-[11px] sm:text-xs font-medium tracking-[0.2em] text-[#8C827A] uppercase font-sans mb-1 block">
              Handpicked Favors
            </span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-poppins text-gray-950 font-normal tracking-tight">
                {category === 'All Gifts' ? 'Festive Gifts' : category}
              </h2>
              <span className="text-xs sm:text-sm font-medium text-[#736B63] bg-[#F0EAE1] px-2.5 py-0.5 rounded-full border border-[#E8E2D8]">
                {total} Items
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#736B63] mt-1 font-normal leading-relaxed max-w-3xl">
              Authentic celebration gifts with wholesale bulk pricing (Min. 50 pcs), sacred motifs, and premium presentation boxes.
            </p>
          </div>

          {/* Right Action Controls: Search, Sort, Filter Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0">
            {/* Search Input */}
            <div className="relative w-44 sm:w-56 md:w-60">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Search festive gifts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-[38px] bg-white border border-[#E8E2D8] focus:border-[#7D3219] focus:ring-1 focus:ring-[#7D3219]/20 rounded-xl py-2 pl-9 pr-7 text-xs font-normal text-[#181513] placeholder:text-gray-400 focus:outline-none transition-all shadow-2xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) =>
                  setSearchParams((prev) => {
                    if (e.target.value) prev.set('sort', e.target.value);
                    else prev.delete('sort');
                    return prev;
                  })
                }
                className="h-[38px] bg-white border border-[#E8E2D8] hover:border-[#D9B4A4] rounded-xl px-3 pr-8 text-xs font-normal text-gray-800 focus:outline-none transition-all cursor-pointer shadow-2xs appearance-none"
              >
                <option value="">Recommended</option>
                <option value="newest">Newest Arrivals</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden flex items-center gap-1.5 bg-white border border-[#E8E2D8] hover:border-[#7D3219] px-3.5 py-2 rounded-xl text-xs font-medium text-gray-800 transition-colors shadow-2xs cursor-pointer h-[38px]"
            >
              <SlidersHorizontal size={14} className="text-gray-700" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* 3. Horizontal Category Pills Row */}
        <div className="py-4 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer shadow-2xs ${
                  isActive
                    ? 'bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4] shadow-xs'
                    : 'bg-white hover:bg-[#FAF7F2] text-[#4A433D] hover:text-[#7D3219] border border-[#E8E2D8] hover:border-[#D9B4A4]'
                }`}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Active Filters Bar */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pb-4">
            <span className="text-xs text-gray-500">Active filters:</span>
            {activeFilters.map((chip) => (
              <span
                key={chip.key + chip.label}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4] rounded-full text-xs font-medium shadow-2xs"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeFilter(chip.key, chip.specificValue)}
                  className="hover:text-red-600 transition cursor-pointer"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-[#7D3219] hover:underline font-medium ml-2 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* 5. Main 2-Column Content Layout (Sidebar + Product Grid) */}
        <div className="flex items-start gap-6 lg:gap-8 pt-2">
          {/* Desktop Filters Sidebar */}
          <aside className="w-60 xl:w-64 shrink-0 bg-white rounded-2xl border border-[#E8E2D8] p-4 shadow-2xs hidden lg:block sticky top-24">
            <FilterSidebarContent
              activeCategory={category}
              activeMaterials={activeMaterials}
              activePrice={priceFilter}
              onSelectCategory={handleSelectCategory}
              onToggleMaterial={handleToggleMaterial}
              onSelectPrice={handleSelectPrice}
              onClearAll={clearAllFilters}
              hasActiveFilters={activeFilters.length > 0}
            />
          </aside>

          {/* Mobile Filter Slide-out Drawer */}
          <AnimatePresence>
            {showMobileSidebar && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileSidebar(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[60] lg:hidden"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                  className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl z-[70] flex flex-col overflow-hidden lg:hidden"
                >
                  <div className="p-4 border-b border-[#E8E2D8] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={15} className="text-gray-900" />
                      <span className="text-sm font-semibold text-gray-950 uppercase tracking-wide">
                        Filters
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMobileSidebar(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <FilterSidebarContent
                      activeCategory={category}
                      activeMaterials={activeMaterials}
                      activePrice={priceFilter}
                      onSelectCategory={(cat) => {
                        handleSelectCategory(cat);
                        setShowMobileSidebar(false);
                      }}
                      onToggleMaterial={handleToggleMaterial}
                      onSelectPrice={(p) => {
                        handleSelectPrice(p);
                        setShowMobileSidebar(false);
                      }}
                      onClearAll={() => {
                        clearAllFilters();
                        setShowMobileSidebar(false);
                      }}
                      hasActiveFilters={activeFilters.length > 0}
                    />
                  </div>

                  <div className="p-4 border-t border-[#E8E2D8] bg-[#FAF7F2]">
                    <button
                      type="button"
                      onClick={() => setShowMobileSidebar(false)}
                      className="w-full py-2.5 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] rounded-md font-medium text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                    >
                      Show {total} Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {error ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-red-200 p-8 shadow-2xs">
                <p className="text-red-600 font-medium text-sm mb-3">Failed to load festive gifts.</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4] rounded-md text-xs font-medium hover:bg-[#EFE0D7] transition shadow-2xs cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            ) : isFetching && allProducts.length === 0 ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white rounded-xl p-4 border border-[#E8E2D8] h-[380px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="bg-[#FAF8F5] rounded-lg aspect-square mb-3" />
                      <div className="bg-stone-100 h-4 w-3/4 rounded mb-2" />
                      <div className="bg-stone-100 h-3 w-1/2 rounded mb-2" />
                      <div className="bg-stone-100 h-3 w-full rounded" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <div className="bg-stone-100 h-9 flex-1 rounded-md" />
                      <div className="bg-stone-100 h-9 flex-1 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#E8E2D8] shadow-2xs p-8">
                <div className="w-16 h-16 mb-4 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center text-gray-400">
                  <Search size={24} />
                </div>
                <h3 className="font-poppins text-lg font-normal text-gray-950 mb-1">No gifts found</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-5 leading-relaxed">
                  We couldn't find any items matching your selected criteria. Try resetting your search or filters.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Products Grid */
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
                  {paginatedProducts.map((product: any, idx: number) => (
                    <CatalogCard
                      key={product.id || product._id || idx}
                      product={product}
                      index={idx}
                    />
                  ))}
                </div>

                {/* Pagination Row */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 mb-6">
                    <nav className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(p - 1, 1));
                          window.scrollTo({ top: 380, behavior: 'smooth' });
                        }}
                        className="px-3.5 py-1.5 flex items-center gap-1 rounded-md border border-[#E8E2D8] bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FAF7F2] transition cursor-pointer text-xs font-medium shadow-2xs"
                        aria-label="Previous Page"
                      >
                        <ChevronLeft size={14} />
                        <span>Prev</span>
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={`page-${p}`}
                          type="button"
                          onClick={() => {
                            setCurrentPage(p);
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all cursor-pointer ${
                            currentPage === p
                              ? 'bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4] shadow-2xs font-medium'
                              : 'bg-white border border-[#E8E2D8] text-gray-700 hover:bg-[#FAF7F2]'
                          }`}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => {
                          setCurrentPage((p) => Math.min(p + 1, totalPages));
                          window.scrollTo({ top: 380, behavior: 'smooth' });
                        }}
                        className="px-3.5 py-1.5 flex items-center gap-1 rounded-md border border-[#E8E2D8] bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FAF7F2] transition cursor-pointer text-xs font-medium shadow-2xs"
                        aria-label="Next Page"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// REUSABLE SIDEBAR / DRAWER FILTER ACCORDIONS
// ---------------------------------------------------------
function FilterSidebarContent({
  activeCategory,
  activeMaterials,
  activePrice,
  onSelectCategory,
  onToggleMaterial,
  onSelectPrice,
  onClearAll,
  hasActiveFilters,
}: {
  activeCategory: string;
  activeMaterials: string[];
  activePrice: string;
  onSelectCategory: (cat: string) => void;
  onToggleMaterial: (mat: string) => void;
  onSelectPrice: (price: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}) {
  const [openSections, setOpenSections] = useState({
    category: true,
    material: true,
    price: true,
  });

  const toggleSection = (sec: 'category' | 'material' | 'price') => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  return (
    <div className="space-y-4">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-gray-900" />
          <span className="text-xs font-semibold text-gray-950 tracking-wider uppercase">
            FILTERS
          </span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-[#7D3219] hover:underline font-medium cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Occasion / Category Filter */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-950 tracking-wider uppercase cursor-pointer py-1"
        >
          <span>OCCASION / THEME</span>
          <ChevronDown
            size={14}
            className={`text-gray-500 transition-transform duration-200 ${
              openSections.category ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openSections.category && (
          <div className="mt-2.5 flex flex-col space-y-1">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <label
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`flex items-center gap-2.5 text-xs cursor-pointer select-none group py-1.5 px-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-stone-100' : 'hover:bg-[#FAF7F2]/70'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'border-2 border-black bg-black text-white'
                        : 'border border-[#D5CEC4] group-hover:border-black bg-white'
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span
                    className={`truncate text-[13px] transition-colors ${
                      isSelected
                        ? 'font-medium text-black'
                        : 'font-normal text-[#5F5850] group-hover:text-black'
                    }`}
                  >
                    {cat}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Material Filter */}
      <div className="pt-3 border-t border-[#E8E2D8]">
        <button
          type="button"
          onClick={() => toggleSection('material')}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-950 tracking-wider uppercase cursor-pointer py-1"
        >
          <span>MATERIAL</span>
          <ChevronDown
            size={14}
            className={`text-gray-500 transition-transform duration-200 ${
              openSections.material ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openSections.material && (
          <div className="mt-2.5 flex flex-col space-y-1">
            {materials.map((mat) => {
              const isSelected = activeMaterials.includes(mat);
              return (
                <label
                  key={mat}
                  onClick={() => onToggleMaterial(mat)}
                  className={`flex items-center gap-2.5 text-xs cursor-pointer select-none group py-1.5 px-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-stone-100' : 'hover:bg-[#FAF7F2]/70'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'border-2 border-black bg-black text-white'
                        : 'border border-[#D5CEC4] group-hover:border-black bg-white'
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span
                    className={`truncate text-[13px] transition-colors ${
                      isSelected
                        ? 'font-medium text-black'
                        : 'font-normal text-[#5F5850] group-hover:text-black'
                    }`}
                  >
                    {mat}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="pt-3 border-t border-[#E8E2D8]">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-950 tracking-wider uppercase cursor-pointer py-1"
        >
          <span>PRICE RANGE</span>
          <ChevronDown
            size={14}
            className={`text-gray-500 transition-transform duration-200 ${
              openSections.price ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openSections.price && (
          <div className="mt-2.5 flex flex-col space-y-1">
            {priceRanges.map((range) => {
              const isSelected = activePrice === range.key;
              return (
                <label
                  key={range.key}
                  onClick={() => onSelectPrice(range.key)}
                  className={`flex items-center gap-2.5 text-xs cursor-pointer select-none group py-1.5 px-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-stone-100' : 'hover:bg-[#FAF7F2]/70'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'border-2 border-black bg-black text-white'
                        : 'border border-[#D5CEC4] group-hover:border-black bg-white'
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span
                    className={`truncate text-[13px] transition-colors ${
                      isSelected
                        ? 'font-medium text-black'
                        : 'font-normal text-[#5F5850] group-hover:text-black'
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
    </div>
  );
}

// ---------------------------------------------------------
// STUDIO CATALOG CARD
// ---------------------------------------------------------
function CatalogCard({ product, index = 0 }: { product: any; index?: number }) {
  const navigate = useNavigate();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const targetId = String(product._id || product.id || product.name || '');
  const cartItem = items.find(
    (item) => String(item.id) === targetId || String(item.productId) === targetId
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(targetId);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist({ ...product, id: targetId });
  };

  const title = (product.title || product.name || 'Return Gift').replace(/_/g, ' ').trim();
  const desc =
    product.description && product.description.trim()
      ? product.description.trim().replace(/^[-—·•\s]+/, '')
      : `Curated ${title.toLowerCase()} perfect for wedding celebrations and special festive occasions.`;

  const { rating, count } = getGiftRating(targetId);

  const price = Number(product.price);
  const actualPrice = product.actualPrice ? Number(product.actualPrice) : 0;
  const discountPercent =
    actualPrice && actualPrice > price
      ? Math.round(((actualPrice - price) / actualPrice) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: targetId,
      productId: targetId,
      name: title,
      price: price,
      image: product.image || product.images?.[0] || '',
      quantity: 50,
      minQty: 50,
      isReturnGift: true,
      stock: product.stock,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
    toast.success(`Added 50 x ${title} to cart!`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cartItem) {
      addToCart({
        id: targetId,
        productId: targetId,
        name: title,
        price: price,
        image: product.image || product.images?.[0] || '',
        quantity: 50,
        minQty: 50,
        isReturnGift: true,
        stock: product.stock,
      });
    }
    navigate('/checkout');
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.id, quantityInCart + 10);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cartItem) return;
    if (quantityInCart > 50) {
      updateQuantity(cartItem.id, quantityInCart - 10);
    } else {
      removeFromCart(cartItem.id);
      toast.success(`Removed ${title} from cart`);
    }
  };

  return (
    <div
      onClick={() =>
        navigate(`/product/${encodeURIComponent(targetId)}`, {
          state: { ...product, isReturnGift: true },
        })
      }
      className="group bg-white rounded-2xl border border-[#E8E2D8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-[#D9B4A4] transition-all duration-300 p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer h-full select-none font-poppins"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center p-3 sm:p-4 mb-3.5 bg-[#FAF7F2] border border-[#E8E2D8]/80 group-hover:border-[#D9B4A4] transition-colors">
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 z-10 bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4]/80 text-[10.5px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-2xs pointer-events-none">
              {discountPercent}% OFF
            </div>
          )}

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs border border-[#E8E2D8] shadow-2xs flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 cursor-pointer ${
              isWishlisted
                ? 'text-rose-600 bg-white border-rose-200'
                : 'text-stone-400 hover:text-stone-900'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart
              size={14}
              strokeWidth={2}
              className={isWishlisted ? 'fill-current text-rose-600' : ''}
            />
          </button>

          {/* Product Image */}
          <CMSImage
            src={product.image || product.images?.[0]}
            alt={title}
            className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        {/* Product Title */}
        <h3 className="font-poppins text-sm sm:text-[15px] font-normal text-gray-900 leading-[21px] line-clamp-2 min-h-[42px] h-[42px] mb-1.5 group-hover:text-[#7D3219] transition-colors">
          {title}
        </h3>

        {/* Rating row: ★ 4.5 (191) */}
        <div className="flex items-center gap-1.5 text-xs mb-2">
          <Star size={13} className="fill-[#F4B740] text-[#F4B740] shrink-0" />
          <span className="font-medium text-gray-900 text-xs">{rating}</span>
          <span className="text-stone-400 text-xs font-light">({count})</span>
        </div>

        {/* Product Description */}
        <p className="font-poppins text-xs text-stone-500 leading-[18px] line-clamp-2 min-h-[36px] h-[36px] mb-3 font-light">
          {desc}
        </p>
      </div>

      <div>
        {/* Divider */}
        <div className="w-full border-t border-[#F0EAE1] mb-3" />

        {/* Price Row */}
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="font-poppins text-lg sm:text-[20px] font-light text-gray-950 tracking-tight">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {actualPrice > price && (
              <span className="font-poppins text-xs sm:text-sm text-stone-400 line-through font-light">
                ₹{actualPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <span className="text-[11px] text-stone-400 font-light">(Min 50 pcs)</span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {quantityInCart > 0 ? (
            <>
              {/* Stepper */}
              <div className="flex-1 h-[38px] px-1.5 border border-[#E8E2D8] bg-[#FAF7F2] rounded-md flex items-center justify-between shadow-2xs">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-6 h-6 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 border border-[#E8E2D8] rounded-sm active:scale-90 transition font-normal cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={11} strokeWidth={2} />
                </button>
                <span className="font-normal text-gray-950 text-xs sm:text-sm px-1 select-none">
                  {quantityInCart} pcs
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-6 h-6 flex items-center justify-center bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] rounded-sm active:scale-90 transition font-medium cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={11} strokeWidth={2} />
                </button>
              </div>

              {/* Buy Now Primary Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 h-[38px] px-2 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] text-xs sm:text-[13px] font-medium rounded-md flex items-center justify-center transition-all duration-150 active:scale-95 shadow-2xs whitespace-nowrap cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </>
          ) : (
            <>
              {/* Add to Cart Secondary Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-[38px] px-2 bg-[#FAF7F2] hover:bg-white border border-[#E8E2D8] hover:border-[#8E3F24] text-gray-950 text-xs sm:text-[13px] font-normal rounded-md flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 shadow-2xs whitespace-nowrap cursor-pointer"
                aria-label="Add to cart"
              >
                {isAdded ? (
                  <>
                    <Check size={14} className="stroke-[2.5] text-emerald-600" />
                    <span className="text-emerald-700">Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={13} className="stroke-[1.8] text-gray-600 shrink-0" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </>
                )}
              </button>

              {/* Buy Now Primary Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 h-[38px] px-2 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] text-xs sm:text-[13px] font-medium rounded-md flex items-center justify-center transition-all duration-150 active:scale-95 shadow-2xs whitespace-nowrap cursor-pointer"
                aria-label="Buy now"
              >
                <span>Buy Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
