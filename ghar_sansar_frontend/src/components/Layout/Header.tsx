import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User, LogOut, Heart } from "lucide-react";
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
  // Add product names or other keywords you want searchable
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
      setIsScrolled(currentScrollY > 20);

      // Hide on scroll down, show on scroll up/top
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const desktopSearchRef = useRef<HTMLFormElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on page navigation
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

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300 transform ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}>
        <div className={`w-full pointer-events-auto transition-all duration-300 ${
          isTransparent 
            ? "bg-transparent border-b border-transparent" 
            : "bg-[#F7F6F0]/95 backdrop-blur-md shadow-xs border-b border-[#e8e5dc]"
        }`}>
          <div className="relative w-full max-w-[1880px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 h-14 sm:h-[60px] flex items-center justify-between">
            
            {/* Brand Logo - Balanced size */}
            <Link to="/" aria-label="Go to home" className="flex items-center shrink-0 hover:opacity-90 transition-opacity pr-2 sm:pr-4">
              <img 
                src="/ghar_sansar_logo_nav.png" 
                alt="Ghar Sansar" 
                className={`h-8 sm:h-9 md:h-10 w-auto object-contain transition-all duration-300 ${
                  isTransparent ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" : ""
                }`} 
                style={{ minWidth: 0, width: "auto" }} 
              />
            </Link>

            {/* Desktop Navigation Links - Centered horizontally and nudged slightly down */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3 uppercase tracking-wider text-xs lg:text-[13px] font-bold absolute left-1/2 top-[calc(50%+4px)] -translate-x-1/2 -translate-y-1/2" role="navigation">
              {[
                { path: "/", label: "Home" },
                { path: "/interior-design", label: "Interior Design" },
                { path: "/products", label: "Products" },
                { path: "/return-gifts", label: "Return Gifts" },
                { path: "/services", label: "Services" },
                { path: "/blog", label: "Blog" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-1 px-2.5 transition-colors duration-200 group ${
                    isTransparent
                      ? isActive(link.path)
                        ? "text-white font-bold"
                        : "text-white/80 hover:text-white"
                      : isActive(link.path)
                        ? "text-black font-bold"
                        : "text-[#26372c] hover:text-black"
                  }`}
                >
                  <span>{link.label}</span>
                  {/* Clean underline on selected heading */}
                  <span
                    className={`absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full transition-all duration-300 ${
                      isTransparent
                        ? isActive(link.path)
                          ? "bg-white opacity-100 scale-x-100 shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                          : "bg-white opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100"
                        : isActive(link.path)
                          ? "bg-black opacity-100 scale-x-100"
                          : "bg-black opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {/* Right side action icons */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
              
              {/* Desktop Search Bar */}
              <div className="relative hidden sm:flex items-center">
                <form ref={desktopSearchRef} onSubmit={onSearchSubmit} className="flex items-center relative" role="search">
                  <div className={`flex items-center w-36 md:w-44 lg:w-48 xl:w-56 h-8 sm:h-[34px] px-3 rounded-md transition-all ${
                    isTransparent
                      ? "bg-white/10 hover:bg-white/20 border border-white/30 focus-within:border-white focus-within:bg-black/40 focus-within:ring-2 focus-within:ring-white/20 backdrop-blur-md"
                      : "bg-white/80 hover:bg-white border border-[#ded5c5] hover:border-gray-400 focus-within:border-black focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 shadow-2xs"
                  }`}>
                    <Search className={`w-3.5 h-3.5 shrink-0 mr-2 transition-colors ${
                      isTransparent ? "text-white/80" : "text-gray-500"
                    }`} />
                    <input
                      ref={inputRef}
                      type="search"
                      aria-label="Search products or categories"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => updateSearchTerm(e.target.value)}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      className={`w-full bg-transparent py-1 text-xs font-medium focus:outline-none transition-colors ${
                        isTransparent 
                          ? "text-white placeholder:text-white/60" 
                          : "text-gray-800 placeholder:text-gray-400"
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
                        className={`ml-1 text-xs shrink-0 cursor-pointer transition-colors ${
                          isTransparent ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-black"
                        }`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-gray-100 rounded-md shadow-xl py-2 z-50 overflow-hidden">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-650 hover:bg-gray-50 hover:text-gray-950 transition-colors cursor-pointer"
                          onClick={() => onSuggestionSelect(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              </div>

              {/* Mobile Search Button */}
              <button
                type="button"
                aria-label="Open search"
                className={`sm:hidden w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                  isTransparent
                    ? "border border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                    : "border border-[#ded5c5] bg-white/80 hover:bg-white text-gray-650 hover:text-gray-950 shadow-2xs"
                }`}
                onClick={() => setMobileSearchOpen(true)}
              >
                <Search size={15} />
              </button>

              {/* Wishlist Heart Button */}
              <Link
                to="/products"
                aria-label="Wishlist"
                className={`w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-md flex items-center justify-center transition-all relative group ${
                  isTransparent
                    ? "border border-white/30 bg-white/10 hover:bg-white/20 hover:border-white text-white backdrop-blur-md"
                    : "border border-[#e5dfd5] bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700 hover:text-black shadow-2xs"
                }`}
              >
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-105 transition-transform" />
                {wishlist.length > 0 && (
                  <span className={`absolute -top-1 -right-1 text-[8.5px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold shadow-xs ${
                    isTransparent ? "bg-[#C89A65] text-black" : "bg-red-500 text-white"
                  }`}>
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <Link
                to="/cart"
                aria-label="Cart"
                className={`w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-md flex items-center justify-center transition-all relative group ${
                  isTransparent
                    ? "border border-white/30 bg-white/10 hover:bg-white/20 hover:border-white text-white backdrop-blur-md"
                    : "border border-[#e5dfd5] bg-white/80 hover:bg-white hover:border-gray-400 text-gray-700 hover:text-black shadow-2xs"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-105 transition-transform" />
                {totalItems > 0 && (
                  <span className={`absolute -top-1 -right-1 text-[8.5px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold shadow-xs ${
                    isTransparent ? "bg-[#C89A65] text-black" : "bg-[#004e38] text-white"
                  }`}>
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Button */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className={`w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-md flex items-center justify-center transition-all overflow-hidden cursor-pointer group ${
                      isTransparent
                        ? "bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md"
                        : "bg-[#1c2921] hover:bg-[#2c3f33] text-white border border-[#1c2921] shadow-xs"
                    }`}
                    aria-label="User menu"
                  >
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="User avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:scale-105 transition-transform" />
                    )}
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-md border border-gray-100 rounded-md shadow-xl shadow-gray-200/40 p-1.5 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-bold text-gray-900 truncate">{user.email || user.name}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-none transition-colors" onClick={() => setUserMenuOpen(false)}>
                        Profile
                      </Link>
                      {((user.role && user.role.toLowerCase() === "admin") || user.email?.toLowerCase() === "gharsansarshop@gmail.com") && (
                        <Link to="/admin" className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-none transition-colors" onClick={() => setUserMenuOpen(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-xs font-bold text-red-650 hover:bg-red-50 rounded-none transition-colors mt-0.5 cursor-pointer">
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
                  className={`w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-md flex items-center justify-center transition-all cursor-pointer group ${
                    isTransparent
                      ? "bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md"
                      : "bg-[#1c2921] hover:bg-[#2c3f33] text-white shadow-xs"
                  }`}
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:scale-105 transition-transform" />
                </Link>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                aria-label="Toggle menu"
                className={`lg:hidden w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-md flex items-center justify-center transition-all cursor-pointer ${
                  isTransparent
                    ? "border border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                    : "border border-[#e5dfd5] bg-white/80 hover:bg-white text-gray-700 hover:text-black shadow-2xs"
                }`}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>

            </div>
          </div>
        </div>
      </header>
      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl border-l border-gray-100 z-[999] p-6 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Navigation</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-none text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col space-y-4">
                {[
                  { path: "/", label: "Home" },
                  { path: "/interior-design", label: "Interior Design" },
                  { path: "/products", label: "Products" },
                  { path: "/return-gifts", label: "Return Gifts" },
                  { path: "/services", label: "Services" },
                  { path: "/blog", label: "Blog" }
                ].map((link, idx) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block py-2 text-base font-bold transition-colors ${
                        isActive(link.path) ? "text-gray-950" : "text-gray-500 hover:text-gray-950"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                <hr className="my-2 border-gray-100" />
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-bold text-gray-500 hover:text-gray-950"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart size={18} />
                      Cart
                    </span>
                    {totalItems > 0 && (
                      <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-none">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </motion.div>

                {user ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="pt-2"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 text-base font-bold text-gray-500 hover:text-gray-900 mb-4"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-650 rounded-none text-sm font-bold transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="pt-4"
                  >
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center py-2.5 px-4 bg-gray-950 hover:bg-gray-800 text-white rounded-none text-sm font-bold transition-all shadow-sm"
                    >
                      Login
                    </Link>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
