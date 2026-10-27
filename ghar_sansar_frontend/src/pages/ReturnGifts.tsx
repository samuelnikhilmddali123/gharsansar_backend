import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, Eye, Heart, ArrowRight, CheckCircle2, SlidersHorizontal, ChevronDown, Filter, Image as ImageIcon, Search, X, Plus, Minus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StudioImage from '../components/StudioImage';
import toast from 'react-hot-toast';

// ---------------------------------------------------------
// CMS Fallback Image Component
// ---------------------------------------------------------
function CMSImage({ src, alt, className }: { src?: string, alt: string, className?: string }) {
  const [error, setError] = useState(false);
  if (!src || error || src.includes('unsplash.com')) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <ImageIcon size={24} className="mb-2 opacity-50" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Image Coming Soon</span>
      </div>
    );
  }
  return <StudioImage src={src} alt={alt} className={className} loading="lazy" />;
}

// ---------------------------------------------------------
// MAIN RETURN GIFTS COMPONENT (REACT QUERY DRIVEN)
// ---------------------------------------------------------
export default function ReturnGifts() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSidebar, setShowSidebar] = useState(false);

  // Debounced Search state for UI
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Extract all filters from URL
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All Gifts';
  const material = searchParams.get('material') || '';
  const sort = searchParams.get('sort') || '';

  // Custom artificial delay for the premium animation feel (400ms)
  const animationDelay = 400;

  // React Query Fetcher
  const fetchProducts = async () => {
    const API_BASE = import.meta.env.VITE_AWS_API_URL || "/api";
    // Build query string
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category) params.append('category', category);
    if (material) params.append('material', material);
    if (sort) params.append('sort', sort);
    params.append('limit', '1000');
    params.append('delay', animationDelay.toString()); // Force minimum delay in backend

    const res = await fetch(`${API_BASE}/return_gifts?${params.toString()}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  };

  const { data, isFetching, error } = useQuery({
    queryKey: ['returnGifts', q, category, material, sort],
    queryFn: fetchProducts,
    placeholderData: (prev) => prev, // keeps previous data while fetching for smooth fade
  });

  // Handle Search input change with debounce sync to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams(prev => {
        if (searchInput) prev.set('q', searchInput);
        else prev.delete('q');
        return prev;
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams]);

  // Derived state
  const products = data?.products || [];
  const total = data?.total || 0;

  // Active Filter Chips
  const activeFilters = [];
  if (category !== 'All Gifts') activeFilters.push({ key: 'category', label: category });
  if (material) {
    material.split(',').forEach(m => activeFilters.push({ key: 'material', label: m, rawValue: material }));
  }
  if (q) activeFilters.push({ key: 'q', label: `"${q}"` });

  const removeFilter = (filterKey: string, specificValue?: string) => {
    setSearchParams(prev => {
      if (filterKey === 'material' && specificValue) {
        const current = prev.get('material')?.split(',') || [];
        const updated = current.filter(m => m !== specificValue);
        if (updated.length) prev.set('material', updated.join(','));
        else prev.delete('material');
      } else {
        prev.delete(filterKey);
        if (filterKey === 'category') prev.set('category', 'All Gifts');
        if (filterKey === 'q') setSearchInput(''); // Also clear the text input
      }
      return prev;
    });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  const formatName = (str: string) => {
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="bg-[#f8f8f7] min-h-screen font-sans pb-20 flex flex-col">
      {/* Animated Premium Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full bg-white border-b border-gray-100 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-cream/60 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-gray-900 mb-4 capitalize">
            {category === "All Gifts" ? "Return Gifts" : formatName(category)}
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Discover elegant gifts for weddings, housewarming, corporate events, festivals, and memorable moments.
          </p>
        </div>
      </motion.div>

      <div className="w-full flex-grow relative">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* Breadcrumb & Mobile Filter Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <nav className="flex items-center space-x-2 text-xs md:text-sm text-gray-400 font-medium">
              <span className="cursor-pointer hover:text-gray-900 transition" onClick={() => navigate("/")}>Home</span>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Return Gifts</span>
            </nav>
            <div className="flex flex-col md:flex-row items-center justify-end gap-4 w-full md:w-auto flex-1 md:ml-8">
              {/* Search Bar */}
              <div className="relative w-full md:max-w-xs">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                  <Search size={16} />
                </div>
                <input
                  type="search"
                  placeholder="Search gifts..."
                  className="w-full bg-white border border-gray-200 focus:border-[#6B21A8] focus:ring-4 focus:ring-[#6B21A8]/10 rounded-none py-2.5 pl-11 pr-10 text-sm focus:outline-none transition-all font-medium placeholder:text-gray-400 text-gray-800 shadow-sm"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button onClick={() => setSearchInput("")} className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-red-500"><X size={14} /></button>
                )}
              </div>
              <div className="text-sm text-gray-500 font-medium whitespace-nowrap hidden lg:block">
                <span className="text-gray-900 font-bold">{total}</span> items
              </div>
              
              {/* Sort Dropdown */}
              <div className="shrink-0 flex items-center gap-3">
                <span className="text-sm text-gray-500 font-medium hidden md:block">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); return prev; })}
                  className="text-sm font-medium bg-transparent border-none text-gray-900 focus:ring-0 outline-none cursor-pointer"
                >
                  <option value="">Recommended</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>

              <button 
                onClick={() => setShowSidebar(true)}
                className="w-full md:w-auto flex justify-center items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-luxury-charcoal hover:border-luxury-gold transition-colors shadow-sm"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>
          </div>

          {/* Products Layout */}
          <div className="flex flex-col relative items-start">
            
            {/* Slide-out Drawer overlay */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSidebar(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-[70] flex flex-col overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-serif text-luxury-charcoal font-bold">Filters</h2>
                    <button onClick={() => setShowSidebar(false)} className="p-2 text-gray-400 hover:text-luxury-charcoal transition-colors"><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
                    <SidebarContent activeCategory={category} searchParams={searchParams} setSearchParams={setSearchParams} />
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-white">
                    <button 
                      onClick={() => { clearAllFilters(); setShowSidebar(false); }}
                      className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filters Bar */}
            {activeFilters.length > 0 && (
              <div className="w-full flex flex-wrap gap-2 mb-6">
                <AnimatePresence>
                  {activeFilters.map((chip) => (
                    <motion.div
                      key={chip.key + chip.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-sm"
                    >
                      {chip.label}
                      <button onClick={() => removeFilter(chip.key, chip.key === 'material' ? chip.label : undefined)} className="hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Grid Layout */}
            <div className="w-full">
              {error ? (
                <div className="py-24 text-center text-red-500 font-medium bg-white rounded-2xl border border-red-100">
                  Failed to load products. Please try again.
                </div>
              ) : (
                <div className="relative min-h-[500px]">
                  <AnimatePresence mode="wait">
                    {isFetching ? (
                      <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-10 bg-[#f8f8f7]"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[4/5] relative rounded-[20px] overflow-hidden bg-white border border-gray-100">
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 skeleton-shimmer" />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : products.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm"
                      >
                        <div className="w-20 h-20 mb-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                          <Search size={28} />
                        </div>
                        <h3 className="text-xl font-serif font-medium mb-2 text-gray-900">No gifts found</h3>
                        <p className="text-gray-500 max-w-sm mb-6 text-sm">We couldn't find any items matching your current filters.</p>
                        <button onClick={clearAllFilters} className="px-6 py-2.5 bg-[#6B21A8] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#581c87] transition-colors shadow-lg shadow-[#6B21A8]/20">
                          Clear Filters
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10"
                      >
                        {products.map((product: any, idx: number) => (
                          <motion.div 
                            key={product.id || product._id || idx}
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.6, delay: idx * 0.05, ease: "easeOut" }}
                          >
                            <CatalogCard product={product} onAdd={addToCart} navigate={navigate} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// SIDEBAR CONTENT
// ---------------------------------------------------------
function SidebarContent({ activeCategory, searchParams, setSearchParams }: any) {
  const categories = ['All Gifts', 'Wedding', 'Housewarming', 'Corporate', 'Festivals', 'Luxury'];
  const filterSections = [
    { id: 'material', title: 'Material', items: ['German Silver', 'Brass', 'Ceramic', 'Wood', 'Glass', 'Crystal'] },
    { id: 'occasion', title: 'Occasion', items: ['Wedding', 'Housewarming', 'Anniversary', 'Corporate Event', 'Festivals'] }
  ];

  const handleCategory = (cat: string) => {
    setSearchParams((prev: any) => { prev.set('category', cat); return prev; });
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200/50 pb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group select-none">
              <div className={`relative w-4 h-4 rounded-full flex items-center justify-center border transition-colors
                  ${activeCategory === cat ? 'border-[#6B21A8] bg-[#6B21A8]' : 'border-gray-300 group-hover:border-gray-500'}
              `}>
                {activeCategory === cat && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className={`text-sm transition-colors ${activeCategory === cat ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-900'}`} onClick={() => handleCategory(cat)}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {filterSections.map((sec) => (
        <FilterAccordion key={sec.id} section={sec} searchParams={searchParams} setSearchParams={setSearchParams} />
      ))}
    </div>
  );
}

function FilterAccordion({ section, searchParams, setSearchParams }: any) {
  const [isOpen, setIsOpen] = useState(true);
  const activeVals = searchParams.get(section.id)?.split(',') || [];

  const toggleItem = (item: string) => {
    setSearchParams((prev: any) => {
      const current = prev.get(section.id)?.split(',') || [];
      const updated = current.includes(item)
        ? current.filter((x: string) => x !== item)
        : [...current, item];
      if (updated.length) prev.set(section.id, updated.join(','));
      else prev.delete(section.id);
      return prev;
    });
  };

  return (
    <div className="border-b border-gray-200/50 pb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-luxury-charcoal mb-4 group"
      >
        {section.title}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-gray-400 group-hover:text-gray-600">
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              {section.items.map((item: string, i: number) => {
                const checked = activeVals.includes(item);
                return (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group select-none">
                    <motion.div
                      layout
                      className={`relative w-4 h-4 rounded flex items-center justify-center border transition-colors overflow-hidden
                        ${checked ? 'bg-[#6B21A8] border-[#6B21A8]' : 'bg-white border-gray-300 group-hover:border-gray-500'}
                      `}
                    >
                      <AnimatePresence>
                        {checked && (
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                            <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <span className={`text-sm transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-900'}`} onClick={() => toggleItem(item)}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------
// ---------------------------------------------------------
// STUDIO CATALOG CARD (Matching Exact Reference Aesthetic)
// ---------------------------------------------------------
function CatalogCard({ product, onAdd, navigate }: any) {
  const { items, updateQuantity, removeFromCart } = useCart();
  const targetId = String(product._id || product.id || product.name || "");
  const cartItem = items.find(
    (item) => String(item.id) === targetId || String(item.productId) === targetId
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd({ ...product, quantity: 50, minQty: 50, isReturnGift: true, stock: product.stock });
    toast.success(`Added 50 x ${product.title || product.name} to cart`);
  };

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(targetId);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist({ ...product, id: targetId });
  };

  const title = (product.title || product.name || "Return Gift").replace(/_/g, " ").trim();
  const desc = product.description && product.description.trim()
    ? product.description.trim().replace(/^[-—·•\s]+/, "")
    : `Curated ${title.toLowerCase()} perfect for wedding celebrations and special festive occasions.`;

  return (
    <div
      className="group relative bg-[#FFFFFF] rounded-none p-3.5 sm:p-5 border border-[#E8E5DC] hover:border-[#D6D0C2] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer h-full"
      onClick={() => navigate(`/product/${product._id || product.id || product.name}`, { state: { ...product, isReturnGift: true } })}
    >
      <div>
        {/* 1. Product Image Container */}
        <div className="relative w-full aspect-square rounded-none overflow-hidden flex items-center justify-center p-5 sm:p-7 mb-4 bg-[#F7F6F0] border border-[#E8E5DC]">
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-none bg-white/95 hover:bg-white border border-gray-150 flex items-center justify-center transition-all shadow-xs active:scale-90 ${
              isWishlisted ? "text-red-500" : "text-gray-700 hover:text-red-500"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart size={18} strokeWidth={1.75} className={isWishlisted ? "fill-current" : ""} />
          </button>

          {/* Subtle realistic ground shadow under product */}
          <div 
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-7/12 h-2.5 rounded-[100%] bg-black/[0.04] blur-[4px] pointer-events-none" 
            aria-hidden="true" 
          />

          <CMSImage
            src={product.image || product.images?.[0]}
            alt={product.title}
            className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        {/* 2. Product Name */}
        <h3 className="text-base sm:text-[18px] font-bold text-[#111827] leading-snug line-clamp-2 min-h-[44px] sm:min-h-[50px] mb-1.5 group-hover:text-[#004e38] transition-colors">
          {title}
        </h3>

        {/* 3. Product-Specific Description */}
        <p className="text-xs sm:text-[13px] text-[#6B7280] font-normal leading-relaxed line-clamp-2 min-h-[36px] sm:min-h-[40px] mb-4">
          {desc}
        </p>
      </div>

      <div>
        {/* 4. Divider */}
        <div className="w-full border-t border-[#EFECE6] mb-3 sm:mb-4" />

        {/* 5. Price & Add to Cart / Stepper */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline">
              <span className="text-lg sm:text-[22px] font-bold text-[#111827] tracking-tight">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 block font-normal">(Min 50 pcs)</span>
          </div>

          {quantityInCart > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="h-[36px] sm:h-[40px] border border-[#004e38] bg-[#f0f6f3] rounded-none flex items-center justify-between px-1.5 shadow-2xs gap-1.5"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (quantityInCart > 50) {
                    updateQuantity(cartItem!.id, quantityInCart - 10);
                  } else {
                    removeFromCart(cartItem!.id);
                    toast.success(`Removed from cart`);
                  }
                }}
                className="w-7 h-7 flex items-center justify-center bg-white hover:bg-gray-100 text-[#004e38] border border-[#c4d6cc] rounded-none active:scale-90 transition font-bold"
                aria-label="Decrease quantity"
              >
                <Minus size={12} strokeWidth={2.5} />
              </button>

              <span className="font-bold text-[#004e38] text-xs sm:text-sm px-1 select-none">
                {quantityInCart} pcs
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(cartItem!.id, quantityInCart + 10);
                }}
                className="w-7 h-7 flex items-center justify-center bg-[#004e38] hover:bg-[#003c2b] text-white rounded-none active:scale-90 transition font-bold"
                aria-label="Increase quantity"
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="bg-[#004e38] hover:bg-[#003c2b] text-white px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-none text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm active:scale-95 shrink-0"
              aria-label="Add to cart"
            >
              <ShoppingCart size={15} className="stroke-[2]" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
