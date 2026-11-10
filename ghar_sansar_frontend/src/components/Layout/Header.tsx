import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, User, LogOut, Heart, ChevronRight, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import GharSansarLogo from "./GharSansarLogo";

const searchList = [
  "Wallpaper Rolls",
  "Wallpapers",
  "3D Wallpapers",
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
  "Wooden Flooring",
  "Curtains",
  "Interior Decor",
  "Festive Gifts",
  "Return Gifts",
  "Pooja Decor",
  "Designer Sofa",
  "Luxury Table",
];

const Header: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const desktopSearchRef = useRef<HTMLFormElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setShowSuggestions(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

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
  }, []);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
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
    setIsSearchOpen(false);
    navigate(`/interior-design?category=${encodeURIComponent(value)}`);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/interior-design?category=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm("");
    setShowSuggestions(false);
    setIsSearchOpen(false);
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/interior-design", label: "Interior Design" },
    { path: "/products", label: "Products" },
    { path: "/return-gifts", label: "Festive Gifts" },
    { path: "/services", label: "Services" },
    { path: "/blog", label: "Blog" },
  ];

  const isHomeTop = false; // Navbar is white everywhere, non-transparent

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div
          className="w-full transition-all duration-300 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E2D8]"
        >
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
                    <div className="flex items-center w-48 sm:w-52 h-[32px] rounded-full px-3 bg-[#F6F1E8] text-gray-800 border border-[#E2DDD5] shadow-xs">
                      <input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => updateSearchTerm(e.target.value)}
                        onFocus={() => {
                          if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setIsSearchOpen(false);
                            setShowSuggestions(false);
                          }
                        }}
                        className="w-full bg-transparent text-xs font-normal text-gray-800 placeholder:text-gray-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        aria-label="Submit search"
                        className="text-gray-500 hover:text-[#C86B4C] ml-1 cursor-pointer transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Close search"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setShowSuggestions(false);
                          setSearchTerm("");
                        }}
                        className="text-gray-400 hover:text-gray-700 ml-1.5 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-[#F6F1E8] border border-[#E8E2D5] rounded-xl shadow-xl py-2 z-50 overflow-hidden">
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full text-left px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-[#F6F1E8] hover:text-[#C86B4C] transition-colors cursor-pointer"
                            onClick={() => onSuggestionSelect(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
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
                      className="block px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-[#F6F1E8] hover:text-[#C86B4C] rounded-lg transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="w-full flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1 cursor-pointer"
                    >
                      <LogOut className="mr-2 w-3.5 h-3.5" />
                      Logout
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