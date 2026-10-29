import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Search,
  Home,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Calendar,
  Send,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import categoriesData from "../data/categories.json";

const itemsPerPage = 12;
const placeholderImage = "/images/placeholder.jpg";
const API_BASE = import.meta.env.VITE_AWS_API_URL || "/api";
const BACKEND_STATIC_URL = API_BASE.replace(/\/api$/, "");

const sanitizeImageUrl = (path?: string) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/products") || path.startsWith("/blogs") || path.startsWith("/uploads")) {
    return `${BACKEND_STATIC_URL}${path}`;
  }
  return path.startsWith("/") ? path : `/${path}`;
};

// Formats category titles to match reference typography
function formatCategoryTitle(name: string): string {
  if (!name) return "";
  const lower = name.trim().toLowerCase();
  if (lower === "3d wallpapers" || lower === "3d wallapapers") return "3D Wallpapers";
  if (lower === "wall art affects" || lower === "wall art effect") return "Wall Art Affects";
  if (lower === "sofa cover") return "Sofa Cover";
  if (lower === "pergola") return "Pergola";
  if (lower === "epdm" || lower === "epdm flooring") return "EPDM Flooring";
  if (lower === "icu flooring") return "ICU Flooring";
  if (lower === "hdp planter pots") return "HDP Planter Pots";

  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Curated authentic 2-line descriptions for every interior category
const categoryDescriptions: Record<string, string> = {
  "3d wallpapers": "High-definition custom 3D wall murals with cartoon, landscape & spatial depth themes.",
  "wall art affects": "Luxury illuminated wooden wall art, backlit acrylic panels & custom LED focal displays.",
  "wallpaper rolls": "Textured, geometric & floral designer rolls with easy seamless self-adhesive application.",
  "wallpapers": "Curated designer wallpapers in modern, vintage, botanical & abstract textured patterns.",
  "vinyl flooring": "Durable, waterproof luxury vinyl planks with authentic wood grain & scratch resistance.",
  "natural vertical garden": "Lush living green walls with real indoor plants & integrated automated drip irrigation.",
  "blinds": "Custom roller, roman, venetian & wooden window blinds tailored for light control and privacy.",
  "automation motorised blinds": "Smart motorized blinds with whisper-quiet motors, remote control & smart automation.",
  "gym flooring": "Heavy-duty shock-absorbent rubber tiles & interlocking puzzle mats engineered for gym safety.",
  "artificial wall garden": "Zero-maintenance UV-resistant synthetic greenery panels for indoor & outdoor accent walls.",
  "icu flooring": "Seamless anti-microbial, hygienic & chemical-resistant hospital-grade vinyl flooring solutions.",
  "sliding & metal door": "Architectural sliding glass partitions & high-strength powder-coated modern metal doors.",
  "invisible grill": "High-tensile stainless steel safety cables ensuring unobstructed panoramic balcony views.",
  "epdm flooring": "Seamless impact-absorbing colored rubber safety flooring for kids' play zones and sports areas.",
  "bubble fountain": "Ambient illuminated acrylic bubble walls & contemporary soothing indoor water features.",
  "terrace & outdoor gardening": "Complete rooftop landscaping, garden pathways, patio pergolas & green sanctuary designs.",
  "canopy": "Weatherproof retractable patio awnings, entrance carports & modern tensile shade sails.",
  "wooden flooring": "Authentic solid hardwood, engineered oak planks & premium moisture-resistant laminate flooring.",
  "ceramic pots": "Handcrafted glazed & matte decorative ceramic planters for indoor botanical styling.",
  "artificial lawn": "High-density 4-tone synthetic grass turf with realistic softness & all-weather drainage.",
  "outdoor deck benches": "Weatherproof teak wood & cast-iron outdoor seating benches built for gardens and patios.",
  "customised water fountain": "Bespoke indoor & garden water fountains with natural stone cascading water flows.",
  "hdp planter pots": "Durable lightweight high-density polyethylene planters available in modern geometric forms.",
  "pigeon net": "Transparent UV-stabilized balcony netting providing robust protection against birds and pigeons.",
  "curtains": "Custom tailored sheer, velvet, linen & blackout drapery crafted with premium designer fabrics.",
  "office room carpets": "Acoustic noise-dampening commercial carpet tiles featuring stain-resistant heavy-duty fibers.",
  "cloth dry well": "Ceiling-mounted pulley clothes drying systems & space-efficient foldable wall racks.",
  "sky light blinds": "Motorized heat-reflective skylight shades engineered for high ceilings & glass roof panels.",
  "pergola": "Custom aluminum & wooden outdoor pergolas with adjustable louvers & ambient LED lighting.",
  "wall and ceiling panels": "Decorative 3D fluted wall cladding & acoustic ceiling panels for luxury residential interiors.",
  "mosquito doors & windows": "Magnetic pleated insect mesh screens with durable rust-proof aluminum frames.",
  "hospital curtains": "Flame-retardant antibacterial hospital cubicle partition curtains with smooth ceiling tracks.",
  "customised aquariums": "Designer glass aquariums tailored with aquatic plants, filtration systems & marine lighting.",
  "sofa cover": "Custom-fit stretchable, washable slipcovers offering all-around protective sofa upholstery.",
  "gifting plants": "Curated air-purifying potted desk plants & bonsai arrangements ready for gifting.",
  "all types of doormats": "High-traction dirt-trapping entrance mats in natural coir, rubber & plush microfiber.",
  "brass idols": "Hand-carved authentic brass deity statues & traditional heritage home decor figurines.",
  "basket fruit packings": "Artisanal woven fruit gift hampers & festive basket packaging with premium ribbon styling."
};

// Clean features helper matching reference text
function getFeatureSnippet(cat: any): string {
  const lower = (cat.name || "").trim().toLowerCase();
  if (categoryDescriptions[lower]) {
    return categoryDescriptions[lower];
  }
  for (const [key, desc] of Object.entries(categoryDescriptions)) {
    if (lower.includes(key) || key.includes(lower)) {
      return desc;
    }
  }
  if (cat.features && Array.isArray(cat.features) && cat.features.length > 0) {
    const raw = cat.features.join(", ").trim();
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }
  return "Premium interior solutions and bespoke design installation tailored for your home.";
}

// Editorial design subtitle matching reference design
function getDesignSubtitle(design: Subcategory | null | undefined, categoryName?: string | null): string {
  if (!design) return "";
  const cat = (categoryName || "").trim();
  const catLower = cat.toLowerCase();
  const dName = design.name.toLowerCase();

  if (catLower.includes("wallpaper") || dName.includes("wallpaper")) {
    return `Elegant ${design.name.toLowerCase()} rolls to add a touch of sophistication to your interiors.`;
  }
  if (catLower.includes("floor") || dName.includes("floor")) {
    return `Premium high-durability ${design.name.toLowerCase()} featuring natural textures and easy-clean scratch resistance.`;
  }
  if (catLower.includes("blind") || dName.includes("blind")) {
    return `Custom tailored ${design.name.toLowerCase()} offering precision light filtering, thermal efficiency and privacy.`;
  }
  if (catLower.includes("curtain") || dName.includes("curtain")) {
    return `Luxurious bespoke drapery crafted with premium designer fabrics and custom motorized hardware.`;
  }
  if (catLower.includes("garden") || dName.includes("garden")) {
    return `Lush living green wall crafted with precision aesthetics and integrated automated drip irrigation.`;
  }
  if (catLower.includes("pot") || dName.includes("pot")) {
    return `Handcrafted artisanal planter pot designed for indoor botanical accent styling and durable finish.`;
  }
  if (catLower.includes("fountain") || dName.includes("fountain")) {
    return `Soothing indoor and landscape water feature designed with ambient lighting and tranquil cascading water flow.`;
  }
  return `Bespoke ${design.name} tailored by expert craftsmen to elevate your interior living experience.`;
}

interface Subcategory {
  name: string;
  image?: string;
  video?: string;
}

interface Category {
  name: string;
  image?: string;
  features?: string[];
  subcategories: Subcategory[];
}

interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  placeholder,
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

  return (
    <div ref={containerRef} className="relative w-44 sm:w-52">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 flex items-center justify-between bg-white border border-[#D4CBBF] hover:border-gray-500 focus:border-[#0a2e22] rounded-lg px-3.5 text-xs sm:text-[13px] font-medium text-gray-800 focus:outline-none transition-all cursor-pointer shadow-2xs text-left"
      >
        <span className="truncate">{value === "All Categories" ? placeholder : formatCategoryTitle(value)}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 right-0 mt-1.5 w-64 max-h-72 overflow-y-auto bg-white border border-[#D4CBBF] rounded-xl shadow-xl py-1.5 focus:outline-none"
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs sm:text-[13px] transition-colors flex items-center justify-between cursor-pointer ${
                  opt === value
                    ? "font-bold text-[#0a2e22] bg-[#F7F6F0]"
                    : "font-medium text-gray-700 hover:bg-[#FAF8F5]"
                }`}
              >
                <span className="truncate">{opt === "All Categories" ? placeholder : formatCategoryTitle(opt)}</span>
                {opt === value && <Check size={14} className="text-[#0a2e22] shrink-0 ml-2" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InteriorDesignPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const urlCategory = params.get("category");

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [subCatPage, setSubCatPage] = useState(1);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeDesign, setActiveDesign] = useState<Subcategory | null>(null);
  const [designForEnquiry, setDesignForEnquiry] = useState<Subcategory | null>(null);

  // Form state for enquiry
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Fetch categories immediately without animation delay
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        let data = categoriesData;
        try {
          const res = await axios.get(`${API_BASE}/storage/upload/interior`);
          if (
            res.data &&
            res.data.success &&
            Array.isArray(res.data.data) &&
            res.data.data.length > 0
          ) {
            data = res.data.data;
          }
        } catch (e) {
          // Fallback cleanly to static categoriesData
        }

        const dataArr = Array.isArray(data) ? data : (data as any).data || [];
        const apiCategories: Category[] = dataArr.map((cat: any) => {
          const subcategories: Subcategory[] = (cat.subcategories || []).map((sub: any) => ({
            name: sub.name,
            image: sanitizeImageUrl(sub.image),
            video: sanitizeImageUrl(sub.video),
          }));

          const categoryImageRaw =
            cat.image || (subcategories.length > 0 ? subcategories[0].image : undefined);
          const categoryImage = sanitizeImageUrl(categoryImageRaw) || "";

          return {
            name: cat.name,
            image: categoryImage,
            features: cat.features || [],
            subcategories,
          };
        });

        setCategories(apiCategories);
      } catch (err) {
        setCategories(categoriesData as any);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Handle URL category param flexibly (e.g. wallpaper_rolls -> Wallpaper Rolls)
  useEffect(() => {
    if (urlCategory && categories.length) {
      const cleanUrl = urlCategory.toLowerCase().replace(/_/g, " ").trim();
      const match = categories.find((c) => {
        const cLower = c.name.toLowerCase().trim();
        return (
          cLower === cleanUrl ||
          cLower.replace(/_/g, " ") === cleanUrl ||
          cLower.includes(cleanUrl) ||
          cleanUrl.includes(cLower) ||
          (urlCategory.includes("wallpaper_roll") && cLower.includes("wallpaper roll")) ||
          (urlCategory.includes("3d") && cLower.includes("3d")) ||
          (urlCategory.includes("wallart") && cLower.includes("wall art")) ||
          (urlCategory.includes("vinyl") && cLower.includes("vinyl")) ||
          (urlCategory.includes("vertical_garden") && (cLower.includes("vertical garden") || cLower.includes("wall garden")))
        );
      });

      if (match) {
        setSelectedCategory(match.name);
        setActiveCategory(match.name);
      } else {
        setSelectedCategory("All Categories");
      }
    }
  }, [urlCategory, categories]);

  // Filter categories
  const filteredCategories = useMemo(() => {
    let result = categories;
    if (selectedCategory !== "All Categories") {
      result = result.filter((c) => c.name === selectedCategory);
    }
    if (search.trim()) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [categories, selectedCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const paginatedCategories = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredCategories, currentPage]);

  // Active Category details for subcategories view
  const currentCat = categories.find((c) => c.name === activeCategory);
  const allSubcategories = currentCat?.subcategories ?? [];

  const filteredSubcategories = useMemo(() => {
    if (!search.trim()) return allSubcategories;
    return allSubcategories.filter((sub) =>
      sub.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allSubcategories, search]);

  const subCatTotalPages = Math.max(1, Math.ceil(filteredSubcategories.length / itemsPerPage));
  const paginatedSubCategories = useMemo(() => {
    const startIdx = (subCatPage - 1) * itemsPerPage;
    return filteredSubcategories.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredSubcategories, subCatPage]);

  // Handlers
  function onSelectCategory(catName: string) {
    setActiveCategory(catName);
    setSubCatPage(1);
    window.scrollTo({ top: 380, behavior: "smooth" });
  }

  function handleBackToCategories() {
    setActiveCategory(null);
    window.scrollTo({ top: 380, behavior: "smooth" });
  }

  // Active design gallery items from current category
  const galleryItems = useMemo(() => {
    if (allSubcategories && allSubcategories.length > 0) {
      return allSubcategories;
    }
    const current = activeDesign || designForEnquiry;
    return current ? [current] : [];
  }, [allSubcategories, activeDesign, designForEnquiry]);

  const activeIndex = useMemo(() => {
    const current = activeDesign || designForEnquiry;
    if (!current || !galleryItems.length) return 0;
    const idx = galleryItems.findIndex((item) => item.name === current.name);
    return idx >= 0 ? idx : 0;
  }, [activeDesign, designForEnquiry, galleryItems]);

  const handlePrevImage = () => {
    if (!galleryItems.length) return;
    const prevIdx = (activeIndex - 1 + galleryItems.length) % galleryItems.length;
    setActiveDesign(galleryItems[prevIdx]);
    setDesignForEnquiry(galleryItems[prevIdx]);
  };

  const handleNextImage = () => {
    if (!galleryItems.length) return;
    const nextIdx = (activeIndex + 1) % galleryItems.length;
    setActiveDesign(galleryItems[nextIdx]);
    setDesignForEnquiry(galleryItems[nextIdx]);
  };

  const visibleThumbnails = useMemo(() => {
    if (galleryItems.length <= 5) return galleryItems;
    let start = activeIndex - 2;
    if (start < 0) start = 0;
    if (start + 5 > galleryItems.length) start = galleryItems.length - 5;
    return galleryItems.slice(start, start + 5);
  }, [galleryItems, activeIndex]);

  function handleEnquiryOpen(subcategory: Subcategory) {
    setActiveDesign(subcategory);
    setDesignForEnquiry(subcategory);
    setBookingOpen(true);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormMessage("");
    setEnquirySuccess(false);
  }

  function handleModalClose() {
    setActiveDesign(null);
    setDesignForEnquiry(null);
    setBookingOpen(false);
    setEnquirySuccess(false);
  }

  function handleEnquirySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert("Please enter your name and phone number.");
      return;
    }
    const currentDesign = activeDesign || designForEnquiry;
    if (!currentDesign) {
      alert("No design selected for enquiry.");
      return;
    }

    const categoryTitle = formatCategoryTitle(activeCategory || currentCat?.name || "Interior Design");
    const message = `Hello Ghar Sansar,
I would like to inquire about the following Interior Design:

*Design:* ${currentDesign.name}
*Category:* ${categoryTitle}
*Customer Name:* ${formName.trim()}
*Phone:* +91 ${formPhone.trim()}
*Email:* ${formEmail.trim() || "Not provided"}
*Requirements:* ${formMessage.trim() || "Please contact me for consultation and pricing."}

Looking forward to your response!`;

    const phone = "918121135980";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setEnquirySuccess(true);
    setTimeout(() => {
      handleModalClose();
    }, 2000);
  }

  // Smooth scroll to explore collection
  const scrollToCollection = () => {
    const elem = document.getElementById("collection-section");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#F7F6F0] min-h-screen font-sans pb-20 flex flex-col">
      {/* 1. Hero Inset Banner */}
      <div className="w-full bg-[#F7F6F0] -mt-20 sm:-mt-24 pt-[60px] sm:pt-[74px] pb-3 sm:pb-4">
        <div className="w-full max-w-[1880px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
          <div
            className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-[#ece6dc] bg-[#1a2e22] group select-none aspect-[2172/724] min-h-[170px] sm:min-h-[220px]"
            style={{ aspectRatio: "2172 / 724" }}
          >
            {/* Banner Background Image */}
            <img
              src="/images/interior banner.png"
              alt="Interior Design - Transform Your Space Into A Beautiful Home"
              className="w-full h-full object-cover block cursor-pointer"
              onClick={scrollToCollection}
            />

            {/* Clickable Overlay specifically on the 'Explore Collection' button area */}
            <button
              type="button"
              onClick={scrollToCollection}
              className="absolute left-[3.5%] sm:left-[4.2%] bottom-[13%] sm:bottom-[15%] w-36 sm:w-44 md:w-48 h-8 sm:h-10 md:h-11 rounded-full cursor-pointer z-20 opacity-0 hover:opacity-100 hover:ring-2 hover:ring-[#D4AF37]/50 active:scale-95 transition-all"
              aria-label="Explore Collection"
              title="Explore Collection"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div id="collection-section" className="w-full max-w-[1880px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pt-4">
        {/* Breadcrumb: [Home Icon] Home > Interior Design */}
        <nav className="flex items-center space-x-2 text-xs sm:text-[13px] text-gray-500 font-medium mb-3">
          <Link to="/" className="hover:text-[#0a2e22] transition-colors flex items-center gap-1.5">
            <Home size={14} className="shrink-0 text-gray-500" />
            <span>Home</span>
          </Link>
          <span className="text-gray-400 select-none px-0.5">&gt;</span>
          {activeCategory ? (
            <>
              <button
                onClick={handleBackToCategories}
                className="hover:text-[#0a2e22] transition-colors cursor-pointer"
              >
                Interior Design
              </button>
              <span className="text-gray-400 select-none px-0.5">&gt;</span>
              <span className="text-gray-900 font-semibold">
                {formatCategoryTitle(activeCategory)}
              </span>
            </>
          ) : (
            <span className="text-gray-900 font-semibold">Interior Design</span>
          )}
        </nav>

        {/* Categories View */}
        {!activeCategory ? (
          <>
            {/* Title & Controls Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E8E5DC]">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1a241e] font-normal tracking-tight">
                  Interior Design
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 font-normal leading-relaxed">
                  Explore our wide range of interior solutions for a more beautiful home.
                </p>
              </div>

              {/* Right Controls: Search bar + All Categories dropdown */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                {/* Search Bar */}
                <div className="relative w-64 sm:w-80 md:w-96">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    placeholder="Search interior products, categories..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 bg-white border border-[#D4CBBF] hover:border-gray-500 focus:border-[#0a2e22] focus:ring-1 focus:ring-[#0a2e22]/20 rounded-lg pl-10 pr-8 text-xs sm:text-[13px] font-normal text-gray-900 placeholder:text-gray-500 focus:outline-none transition-all shadow-2xs"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm font-medium cursor-pointer"
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Dropdown: All Categories [v] */}
                <CustomSelect
                  value={selectedCategory}
                  options={["All Categories", ...categories.map((c) => c.name)]}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    setCurrentPage(1);
                  }}
                  placeholder="All Categories"
                />
              </div>
            </div>

            {/* 4-Column Categories Grid matching mockup */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 mt-6">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white rounded-2xl p-4 h-[320px] border border-[#E8E5DC]"
                  >
                    <div className="bg-gray-100 rounded-xl aspect-[4/3] mb-3"></div>
                    <div className="bg-gray-100 h-4 w-3/4 rounded mb-2"></div>
                    <div className="bg-gray-100 h-3 w-1/2 rounded mb-3"></div>
                    <div className="bg-gray-100 h-4 w-1/3 rounded mt-auto"></div>
                  </div>
                ))}
              </div>
            ) : paginatedCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 mt-6">
                {paginatedCategories.map((cat) => (
                  <div
                    key={cat.name}
                    onClick={() => onSelectCategory(cat.name)}
                    className="group bg-white rounded-2xl border border-[#E8E5DC] hover:border-[#C4BAA9] hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-3.5 sm:p-4 cursor-pointer"
                  >
                    <div>
                      {/* Image container: aspect 4:3 rounded-xl */}
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF8F5] mb-3 border border-[#ECE7DC]">
                        <img
                          src={cat.image || placeholderImage}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 group-hover:text-[#0a2e22] transition-colors mb-1.5 line-clamp-1">
                        {formatCategoryTitle(cat.name)}
                      </h3>

                      {/* Feature snippet - authentic 2-line description */}
                      <p className="text-xs text-gray-500 font-normal leading-relaxed line-clamp-2 min-h-[34px] mb-3">
                        {getFeatureSnippet(cat)}
                      </p>
                    </div>

                    {/* Bottom row: XX Designs + Circular Arrow */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#F2EFE9] mt-auto">
                      <span className="text-xs text-gray-500 font-medium">
                        {cat.subcategories.length} Designs
                      </span>
                      <div className="w-8 h-8 rounded-full border border-[#D6C7B2] bg-white group-hover:bg-[#0a2e22] group-hover:border-[#0a2e22] text-[#8C6D4F] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
                        <ChevronRight size={15} className="stroke-[2.2]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-[#E8E5DC] mt-6 shadow-2xs">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 mb-1">No categories found</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Try adjusting your search query or dropdown filter.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All Categories");
                    setCurrentPage(1);
                  }}
                  className="px-5 py-2 bg-[#0a2e22] text-white rounded-full text-xs font-semibold hover:bg-[#061d15] transition cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Pagination Controls matching mockup: < Prev   1   2   3   4   Next > */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 mb-6">
                <nav className="flex items-center gap-1.5 sm:gap-2">
                  {/* Prev Button */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className="px-3.5 py-1.5 flex items-center gap-1 rounded-lg border border-[#E8E5DC] bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer text-xs font-semibold shadow-2xs"
                  >
                    <span>&lt;</span>
                    <span>Prev</span>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={`page-${p}`}
                      onClick={() => {
                        setCurrentPage(p);
                        window.scrollTo({ top: 380, behavior: "smooth" });
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentPage === p
                          ? "bg-[#0a2e22] text-white shadow-xs font-bold"
                          : "bg-white border border-[#E8E5DC] text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className="px-3.5 py-1.5 flex items-center gap-1 rounded-lg border border-[#E8E5DC] bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer text-xs font-semibold shadow-2xs"
                  >
                    <span>Next</span>
                    <span>&gt;</span>
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          /* Subcategories / Designs View for chosen category */
          <div className="mt-2">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DC] mb-6">
              <div>
                <button
                  onClick={handleBackToCategories}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#D4CBBF] hover:border-[#0a2e22] rounded-lg text-xs font-semibold text-gray-800 transition-colors shadow-2xs mb-3 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Back to Categories</span>
                </button>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#1a241e] font-normal tracking-tight">
                  {formatCategoryTitle(activeCategory)} Designs
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {getFeatureSnippet(currentCat || { name: activeCategory })}
                </p>
              </div>

              {/* Search Subcategories */}
              <div className="relative w-64 sm:w-80 md:w-96">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search designs..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSubCatPage(1);
                  }}
                  className="w-full h-10 bg-white border border-[#D4CBBF] hover:border-gray-500 focus:border-[#0a2e22] focus:ring-1 focus:ring-[#0a2e22]/20 rounded-lg pl-10 pr-8 text-xs sm:text-[13px] font-normal text-gray-900 placeholder:text-gray-500 focus:outline-none transition-all shadow-2xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm font-medium cursor-pointer"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Designs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {paginatedSubCategories.length > 0 ? (
                paginatedSubCategories.map((sub, idx) => (
                  <div
                    key={sub.name + idx}
                    className="bg-white rounded-2xl border border-[#E8E5DC] hover:border-[#C4BAA9] hover:shadow-lg transition-all duration-300 p-3.5 sm:p-4 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Media container */}
                      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF8F5] mb-3 border border-[#ECE7DC]">
                        {sub.video ? (
                          <video
                            src={encodeURI(sub.video)}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            poster={sub.image || placeholderImage}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                            onClick={() => setActiveDesign(sub)}
                          />
                        ) : (
                          <img
                            src={sub.image || placeholderImage}
                            alt={sub.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                            onClick={() => setActiveDesign(sub)}
                          />
                        )}
                      </div>

                      <h3
                        onClick={() => setActiveDesign(sub)}
                        className="text-sm font-bold text-gray-900 group-hover:text-[#0a2e22] transition-colors cursor-pointer mb-2 line-clamp-2"
                      >
                        {sub.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleEnquiryOpen(sub)}
                      className="w-full mt-3 py-2 px-3 bg-[#0a2e22] hover:bg-[#061d15] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Calendar size={13} />
                      <span>Book an Enquiry</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-[#E8E5DC]">
                  <p className="text-gray-500 text-xs">
                    {search ? `No designs found matching "${search}"` : "No designs available in this category."}
                  </p>
                </div>
              )}
            </div>

            {/* Subcategory Pagination */}
            {subCatTotalPages > 1 && (
              <div className="flex justify-center mt-12 mb-6">
                <nav className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    disabled={subCatPage === 1}
                    onClick={() => {
                      setSubCatPage(subCatPage - 1);
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className="px-3.5 py-1.5 flex items-center gap-1 rounded-lg border border-[#E8E5DC] bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer text-xs font-semibold shadow-2xs"
                  >
                    <span>&lt;</span>
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: subCatTotalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={`sub-page-${p}`}
                      onClick={() => {
                        setSubCatPage(p);
                        window.scrollTo({ top: 380, behavior: "smooth" });
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        subCatPage === p
                          ? "bg-[#0a2e22] text-white shadow-xs font-bold"
                          : "bg-white border border-[#E8E5DC] text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    disabled={subCatPage === subCatTotalPages}
                    onClick={() => {
                      setSubCatPage(subCatPage + 1);
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className="px-3.5 py-1.5 flex items-center gap-1 rounded-lg border border-[#E8E5DC] bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition cursor-pointer text-xs font-semibold shadow-2xs"
                  >
                    <span>Next</span>
                    <span>&gt;</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2-Column Design Showcase & Enquiry Modal matching reference design */}
      {(activeDesign || bookingOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 w-full max-w-5xl overflow-hidden relative my-auto animate-fadeIn max-h-[92vh] flex flex-col lg:flex-row">
            {/* Close Button */}
            <button
              onClick={handleModalClose}
              className="absolute top-3.5 right-3.5 z-30 text-gray-400 hover:text-black bg-white/90 hover:bg-white rounded-full p-1.5 transition-colors cursor-pointer shadow-xs border border-gray-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Left Column: Image Showcase / Carousel */}
            <div className="w-full lg:w-1/2 p-5 sm:p-6 lg:p-7 flex flex-col justify-between bg-white border-b lg:border-b-0 lg:border-r border-[#F0ECE1]">
              <div>
                {/* Main Image Container */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[1.15/1] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#ECE7DC] flex items-center justify-center select-none group">
                  {(activeDesign || designForEnquiry)?.video ? (
                    <video
                      src={encodeURI((activeDesign || designForEnquiry)!.video!)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={(activeDesign || designForEnquiry)?.image || placeholderImage}
                      alt={(activeDesign || designForEnquiry)?.name || "Design"}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  )}

                  {/* Navigation Arrows */}
                  {galleryItems.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:text-black transition cursor-pointer"
                        aria-label="Previous Design"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:text-black transition cursor-pointer"
                        aria-label="Next Design"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails Strip */}
                {galleryItems.length > 1 && (
                  <div className="flex items-center gap-2.5 sm:gap-3 mt-3.5 overflow-x-auto pb-1 pt-0.5">
                    {visibleThumbnails.map((item, idx) => {
                      const isSelected = item.name === (activeDesign || designForEnquiry)?.name;
                      return (
                        <button
                          key={item.name + idx}
                          type="button"
                          onClick={() => {
                            setActiveDesign(item);
                            setDesignForEnquiry(item);
                          }}
                          className={`relative w-16 h-14 sm:w-20 sm:h-16 shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all ${
                            isSelected
                              ? "ring-2 ring-[#0a2e22] ring-offset-2 border-transparent scale-102 shadow-xs"
                              : "border border-[#E8E5DC] opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={item.image || placeholderImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Category Pill, Heading, Enquiry Form & Direct Contacts */}
            <div className="w-full lg:w-1/2 p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Category Badge */}
                <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#E5ECE7] text-[#1E3B2B] text-xs font-semibold tracking-wide mb-2 self-start">
                  {formatCategoryTitle(activeCategory || currentCat?.name || "Wallpaper Rolls")}
                </div>

                {/* Editorial Title */}
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] leading-tight text-[#111827] font-normal tracking-tight mb-2">
                  {(activeDesign || designForEnquiry)?.name}
                </h2>

                {/* Subtitle Description */}
                <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal mb-4">
                  {getDesignSubtitle(activeDesign || designForEnquiry, activeCategory || currentCat?.name)}
                </p>

                {/* Send an Enquiry Form */}
                <form onSubmit={handleEnquirySubmit} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm sm:text-[15px] font-bold text-gray-900 mb-2">
                    <Briefcase size={16} className="text-[#0a2e22]" />
                    <span>Send an Enquiry</span>
                  </div>

                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full h-10 border border-[#D4CBBF] hover:border-gray-500 rounded-lg px-3 text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0a2e22] focus:ring-1 focus:ring-[#0a2e22]/20 transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                      <div className="flex h-10 border border-[#D4CBBF] hover:border-gray-500 rounded-lg overflow-hidden focus-within:border-[#0a2e22] focus-within:ring-1 focus-within:ring-[#0a2e22]/20 bg-white transition-all">
                        <span className="inline-flex items-center px-2.5 bg-gray-50 border-r border-[#D4CBBF] text-xs font-semibold text-gray-700 select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="Enter phone number"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full px-3 text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email (optional)"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full h-10 border border-[#D4CBBF] hover:border-gray-500 rounded-lg px-3 text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0a2e22] focus:ring-1 focus:ring-[#0a2e22]/20 transition-all bg-white"
                    />
                  </div>

                  {/* Row 3: Message */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Message *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Tell us about your requirements (e.g. quantity, size, location, etc.)"
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      className="w-full border border-[#D4CBBF] hover:border-gray-500 rounded-lg p-2.5 text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0a2e22] focus:ring-1 focus:ring-[#0a2e22]/20 resize-none transition-all bg-white"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full h-10 sm:h-11 bg-[#0a2e22] hover:bg-[#061d15] text-white rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <Send size={15} />
                    <span>Send Enquiry</span>
                  </button>

                  {enquirySuccess && (
                    <div className="p-2 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs text-center font-medium animate-fadeIn">
                      ✓ Enquiry submitted! Connecting to WhatsApp...
                    </div>
                  )}
                </form>

                {/* Divider: OR CONTACT DIRECTLY */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E8E5DC]"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    <span className="bg-white px-3">OR CONTACT DIRECTLY</span>
                  </div>
                </div>

                {/* 3 Contact Columns */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <a
                    href="tel:+918121135980"
                    className="group flex flex-col items-center p-2 rounded-xl hover:bg-[#FAF8F5] transition-colors"
                  >
                    <Phone size={16} className="text-[#0a2e22] mb-1.5" />
                    <span className="text-[11px] sm:text-xs font-bold text-gray-900 group-hover:text-[#0a2e22] truncate w-full">
                      +91 81211 35980
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">Call Now</span>
                  </a>

                  <a
                    href="https://wa.me/919248344434"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center p-2 rounded-xl hover:bg-[#FAF8F5] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#25D366] fill-current mb-1.5" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span className="text-[11px] sm:text-xs font-bold text-gray-900 group-hover:text-[#0a2e22] truncate w-full">
                      +91 92483 44434
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">WhatsApp</span>
                  </a>

                  <a
                    href="mailto:gharsansarshop@gmail.com"
                    className="group flex flex-col items-center p-2 rounded-xl hover:bg-[#FAF8F5] transition-colors"
                  >
                    <Mail size={16} className="text-[#0a2e22] mb-1.5" />
                    <span className="text-[11px] sm:text-xs font-bold text-gray-900 group-hover:text-[#0a2e22] truncate w-full">
                      gharsansarshop@gmail.com
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">Email Us</span>
                  </a>
                </div>

                {/* Physical Address */}
                <div className="flex items-start gap-2 pt-3 border-t border-[#F2EFE9] text-[11px] text-gray-500 leading-snug mt-3">
                  <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <span>
                    D.No. 27-14-60, Rajagopalachari Street, near BuckinghamPet Post Office, Governor Peta, Vijayawada, Andhra Pradesh 520002.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteriorDesignPage;
