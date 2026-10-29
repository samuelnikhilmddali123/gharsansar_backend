import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User, LogOut, Heart, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const searchList = [
  "Wallpaper Rolls",
  "Wallpapers",
  "3d Wallpapers",
  "Wall Art Effect",
  "Vinyl Flooring",
  "Natural Vertical Garden",
  "Blinds",
  "Automation Motorised Blinds",
  "Gym Flooring",
  "Artificial Wall Garden",
  "ICU Flooring",
  "Sliding & Metal Door",
  "Invisible Grill",
  "EPDM Flooring",
  "Bubble Fountain",
  "Terrace & Outdoor Gardening",
  "Outdoor Deck Benches",
  "Canopy",
  "Customised Water Fountain",
  "Wooden Flooring",
  "HDP Planter Pots",
  "Ceramic Pots",
  "Pigeon Net",
  "Artificial Lawn",
  "Curtains",
  "Office Room Carpets",
  "Cloth Dry Well",
  "Sky Light Blinds",
  "Pergola",
  "Wall And Ceiling Panels",
  "Hospital Curtains",
  "Mosquito Doors",
  "Customised Aquariums",
  "Gifting Plants",
  "All Types Of Doormats",
  "Basket Fruit Packings",
  "Brass Idols",
  "Sofa Cover",
  "Designer Sofa",
  "Luxury Table",
  "Curtain Rods",
  "Planter Pot Set",
  "LED Floor Lamp",
];

const Header: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 24);

      if (currentScrollY > lastScrollY.current && currentScrollY > 90) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const location = useLocation();
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const desktopSearchRef = useRef<HTMLFormElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
    setShowSuggestions(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchOpen && desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setShowSuggestions(false);
      }
      if (isMobileSearchOpen && mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setMobileSearchOpen(false);
      }
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setShowSuggestions(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isSearchOpen, isMobileSearchOpen, isUserMenuOpen]);

  useEffect(() => {
    if (isSearchOpen || isMobileSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen, isMobileSearchOpen]);

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = searchList.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const onSuggestionSelect = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(false);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    navigate(`/interior-design?category=${encodeURIComponent(value)}`);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/interior-design?category=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm("");
    setShowSuggestions(false);
    setSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isHomePage = location.pathname === "/";
  const isTransparent = isHomePage && !isScrolled;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/interior-design", label: "Interior Design" },
    { path: "/products", label: "Products" },
    { path: "/return-gifts", label: "Return Gifts" },
    { path: "/services", label: "Services" },
    { path: "/blog", label: "Blog" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div
          className={`w-full transition-all duration-500 ease-out ${
            isTransparent
              ? "bg-gradient-to-b from-black/75 via-black/35 to-transparent border-b border-white/10"
              : "bg-[#FAF8F5]/92 backdrop-blur-md border-b border-[#E8E2D5] shadow-[0_4px_20px_rgba(11,21,17,0.04)]"
          }`}
        >
          <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-[70px] flex items-center justify-between">
            {/* Brand Logo with Architectural Refinement */}
            <Link
              to="/"
              aria-label="Gharsansar Home"
              className="flex items-center gap-3 shrink-0 group transition-transform duration-300 hover:opacity-95"
            >
              <img
                src={isTransparent ? "/ghar_sansar_logo_white.png" : "/ghar_sansar_logo_nav.png"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/ghar_sansar_logo_nav.png";
                }}
                alt="Ghar Sansar"
                className={`h-9 sm:h-10 md:h-11 w-auto object-contain transition-all duration-300 ${
                  isTransparent ? "drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] brightness-110" : ""
                }`}
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2" role="navigation">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-3.5 py-2 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors duration-200 group ${
                      isTransparent
                        ? active
                          ? "text-white"
                          : "text-white/75 hover:text-white"
                        : active
                          ? "text-[#0F1F18]"
                          : "text-[#58625C] hover:text-[#0F1F18]"
                    }`}
                  >
                    <span>{link.label}</span>
                    {/* Architectural hairline active indicator */}
                    <span
                      className={`absolute bottom-0.5 left-3.5 right-3.5 h-[1.5px] rounded-full transition-all duration-300 ${
                        active
                          ? isTransparent
                            ? "bg-[#C5A059] opacity-100 scale-x-100 shadow-[0_0_8px_rgba(197,160,89,0.7)]"
                            : "bg-[#0F1F18] opacity-100 scale-x-100"
                          : "bg-current opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-75"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Controls: Search, Wishlist, Cart, Profile, Mobile Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              {/* Desktop Search Bar */}
              <div className="relative hidden sm:block">
                <form
                  ref={desktopSearchRef}
                  onSubmit={onSearchSubmit}
                  className="flex items-center relative"
                  role="search"
                >
                  <div
                    className={`flex items-center w-40 md:w-48 lg:w-56 h-9 px-3.5 rounded-full transition-all duration-300 ${
                      isTransparent
                        ? "bg-white/10 hover:bg-white/15 border border-white/25 focus-within:border-[#C5A059] focus-within:bg-black/50 backdrop-blur-md"
                        : "bg-white border border-[#DFD9CD] hover:border-[#B3ABA0] focus-within:border-[#0F1F18] shadow-xs"
                    }`}
                  >
                    <Search
                      className={`w-3.5 h-3.5 shrink-0 mr-2 transition-colors ${
                        isTransparent ? "text-white/70" : "text-gray-400"
                      }`}
                    />
                    <input
                      ref={inputRef}
                      type="search"
                      aria-label="Search products or categories"
                      placeholder="Search designs..."
                      value={searchTerm}
                      onChange={(e) => updateSearchTerm(e.target.value)}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      className={`w-full bg-transparent text-xs font-medium focus:outline-none placeholder:text-xs transition-colors ${
                        isTransparent
                          ? "text-white placeholder:text-white/60"
                          : "text-gray-900 placeholder:text-gray-400"
                      }`}
                      autoComplete="off"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setShowSuggestions(false);
                        }}
                        className={`ml-1 text-sm shrink-0 cursor-pointer transition-colors ${
                          isTransparent ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-black"
                        }`}
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full right-0 mt-2.5 w-72 bg-white/98 backdrop-blur-md border border-[#E8E2D5] rounded-xl shadow-[0_12px_36px_rgba(11,21,17,0.12)] py-2 z-50 overflow-hidden">
                      <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#8F897F] border-b border-[#F0ECE1]">
                        Suggested Collections
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-800 hover:bg-[#FAF8F5] hover:text-[#0F1F18] flex items-center justify-between transition-colors cursor-pointer group"
                            onClick={() => onSuggestionSelect(s)}
                          >
                            <span>{s}</span>
                            <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-[#0F1F18] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Mobile Search Button */}
              <button
                type="button"
                aria-label="Open search"
                className={`sm:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isTransparent
                    ? "border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                    : "border border-[#E2DCD1] bg-white text-gray-700 hover:text-black shadow-xs"
                }`}
                onClick={() => setMobileSearchOpen(true)}
              >
                <Search size={15} />
              </button>

              {/* Wishlist Button */}
              <Link
                to="/products"
                aria-label="Wishlist"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative group ${
                  isTransparent
                    ? "border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                    : "border border-[#E2DCD1] bg-white hover:border-[#12241C] text-gray-700 hover:text-[#12241C] shadow-xs"
                }`}
              >
                <Heart className="w-4 h-4 group-hover:scale-105 transition-transform" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-[9px] rounded-full w-4 h-4 bg-[#C5A059] text-white flex items-center justify-center font-bold shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <Link
                to="/cart"
                aria-label="Cart"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative group ${
                  isTransparent
                    ? "border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                    : "border border-[#E2DCD1] bg-white hover:border-[#12241C] text-gray-700 hover:text-[#12241C] shadow-xs"
                }`}
              >
                <ShoppingCart className="w-4 h-4 group-hover:scale-105 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 text-[9px] rounded-full w-4 h-4 bg-[#12241C] text-[#FAF8F5] flex items-center justify-center font-bold shadow-xs">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Account Button */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all overflow-hidden cursor-pointer group ${
                      isTransparent
                        ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md"
                        : "bg-[#12241C] hover:bg-[#1A3327] text-white shadow-xs"
                    }`}
                    aria-label="User account"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white group-hover:scale-105 transition-transform" />
                    )}
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white/98 backdrop-blur-md border border-[#E8E2D5] rounded-xl shadow-[0_16px_40px_rgba(11,21,17,0.12)] p-2 z-50">
                      <div className="px-3.5 py-2 border-b border-[#F0ECE1] mb-1">
                        <p className="text-[10px] text-[#8F897F] font-bold uppercase tracking-widest">
                          Signed in as
                        </p>
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {user.email || user.name}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-[#FAF8F5] rounded-lg transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      {((user.role && user.role.toLowerCase() === "admin") ||
                        user.email?.toLowerCase() === "gharsansarshop@gmail.com") && (
                        <Link
                          to="/admin"
                          className="block px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-[#FAF8F5] rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5 cursor-pointer"
                      >
                        <LogOut className="mr-2 w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  aria-label="Sign In"
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer group ${
                    isTransparent
                      ? "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md"
                      : "bg-[#12241C] hover:bg-[#1A3327] text-white shadow-xs"
                  }`}
                >
                  <User className="w-4 h-4 text-white group-hover:scale-105 transition-transform" />
                </Link>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                aria-label="Toggle navigation menu"
                className={`lg:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isTransparent
                    ? "border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                    : "border border-[#E2DCD1] bg-white text-gray-800 shadow-xs"
                }`}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {isMenuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay Bar */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 inset-x-0 bg-white/98 backdrop-blur-md border-b border-[#E8E2D5] p-3 z-40 sm:hidden shadow-lg"
          >
            <form ref={mobileSearchRef} onSubmit={onSearchSubmit} className="flex items-center gap-2">
              <div className="flex-1 flex items-center h-10 px-3 bg-[#FAF8F5] border border-[#DFD9CD] rounded-full">
                <Search size={15} className="text-gray-400 mr-2 shrink-0" />
                <input
                  ref={inputRef}
                  type="search"
                  placeholder="Search products or categories..."
                  value={searchTerm}
                  onChange={(e) => updateSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="text-xs font-semibold px-3 py-2 text-gray-600"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Architectural Mobile Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 w-[84%] max-w-sm bg-[#FAF8F5] border-l border-[#E8E2D5] shadow-2xl z-[999] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-6 border-b border-[#E8E2D5] mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-[#8F897F] uppercase tracking-[0.25em] block">
                      GHAR SANSAR
                    </span>
                    <span className="text-xs text-gray-500 font-light">Interior & Decor</span>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    className="w-8 h-8 rounded-full border border-[#DFD9CD] bg-white flex items-center justify-center text-gray-600 hover:text-black transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Editorial Navigation Links */}
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link, idx) => {
                    const active = isActive(link.path);
                    return (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center justify-between py-3 px-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                            active
                              ? "bg-[#12241C] text-[#FAF8F5]"
                              : "text-gray-700 hover:bg-white hover:text-black"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] opacity-40 font-mono">0{idx + 1}</span>
                            <span>{link.label}</span>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-6 border-t border-[#E8E2D5] space-y-3">
                <Link
                  to="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-[#DFD9CD]"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart size={15} />
                    Cart
                  </span>
                  {totalItems > 0 && (
                    <span className="bg-[#12241C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {user ? (
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center py-2.5 text-xs font-semibold text-gray-700 bg-white border border-[#DFD9CD] rounded-lg"
                    >
                      Profile ({user.name || user.email})
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 bg-[#12241C] text-white rounded-lg text-xs font-semibold tracking-wider uppercase shadow-xs"
                  >
                    Login / Register
                  </Link>
                )}

                <p className="text-[10px] text-center text-gray-400 pt-2">
                  Call us: +91-8121135980
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
