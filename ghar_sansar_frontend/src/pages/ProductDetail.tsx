// src/pages/ProductDetail.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Phone, 
  MessageCircle, 
  ArrowLeft, 
  ShoppingCart, 
  Zap, 
  Star, 
  Camera, 
  User2, 
  X, 
  CheckCircle,
  ShieldCheck,
  Truck,
  Award,
  CreditCard,
  Heart,
  Info,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  RotateCcw,
  Lock,
  Flame,
  Droplets,
  Shield,
  Coffee,
  Maximize2,
  RotateCw,
  Play,
  FileText,
  Scan,
  Check,
  ExternalLink,
  Plus,
  Minus
} from "lucide-react";
import { useProducts, Product } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import ProductCard from "../components/ProductCard";
import StudioImage from "../components/StudioImage";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
}

const ProductDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { orders } = useOrders();
  const { products, loading } = useProducts();

  // Decode product id from path
  const { pathname, state } = location;
  const id = decodeURIComponent(pathname.split("/").pop() || "");

  // Fetch target product with robust fallback matching
  const product = state || useMemo(() => {
    if (!id || !products || products.length === 0) return null;
    return (
      products.find((p) => String(p.id) === String(id)) ||
      products.find((p: any) => String(p._id) === String(id)) ||
      products.find((p) => encodeURIComponent(String(p.id)) === encodeURIComponent(String(id))) ||
      products.find((p) => p.title?.toLowerCase() === id.toLowerCase() || p.title?.toLowerCase() === decodeURIComponent(id).toLowerCase())
    );
  }, [id, products]);

  const mainProductId = String(product?.id || (product as any)?._id || id || "");
  const cartItemForProduct = items.find(
    (item) => String(item.id) === mainProductId || String(item.productId) === mainProductId
  );
  const quantityInCart = cartItemForProduct ? cartItemForProduct.quantity : 0;

  // Gallery States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [is360Active, setIs360Active] = useState(false);
  const [verticalThumbOffset, setVerticalThumbOffset] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Commerce States
  const [quantity, setQuantity] = useState(state?.isReturnGift ? 50 : 1);
  const [activeTab, setActiveTab] = useState("description");
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Related products carousel ref
  const relatedScrollRef = useRef<HTMLDivElement>(null);

  // Helper to read initial pincode from account addresses or stored pincode
  const getInitialPincode = () => {
    const local = localStorage.getItem("user_pincode");
    if (local && /^\d{6}$/.test(local)) return local;
    try {
      const stored = localStorage.getItem("user_shipping_address");
      if (stored) {
        const parsed = JSON.parse(stored);
        const zip = parsed.zipCode || parsed.pincode;
        if (zip && /^\d{6}$/.test(String(zip).trim())) return String(zip).trim();
      }
    } catch {}
    return "520008"; // Default to Vijayawada as seen in design
  };

  const getInitialArea = () => {
    const localArea = localStorage.getItem("user_area");
    if (localArea) return localArea;
    try {
      const stored = localStorage.getItem("user_shipping_address");
      if (stored) {
        const parsed = JSON.parse(stored);
        const area = [parsed.city, parsed.state].filter(Boolean).join(", ") || parsed.city;
        if (area) return area;
      }
    } catch {}
    return "Vijayawada, Andhra Pradesh";
  };

  const [pincode, setPincode] = useState<string>(getInitialPincode);
  const [savedArea, setSavedArea] = useState<string>(getInitialArea);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(99);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(pincode);

  // Automatically sync pincode and area from user's account shipping address
  useEffect(() => {
    let activeAddr: any = null;

    if (user?.addresses && user.addresses.length > 0) {
      activeAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
    }

    if (!activeAddr && user?.email) {
      try {
        const stored = localStorage.getItem(`shipping_address_${user.email}`);
        if (stored) activeAddr = JSON.parse(stored);
      } catch {}
    }

    if (!activeAddr) {
      try {
        const storedGlobal = localStorage.getItem("user_shipping_address");
        if (storedGlobal) activeAddr = JSON.parse(storedGlobal);
      } catch {}
    }

    if (activeAddr) {
      const zip = activeAddr.zipCode || activeAddr.pincode;
      if (zip) {
        const code = String(zip).trim();
        if (/^\d{6}$/.test(code)) {
          const area = [activeAddr.city, activeAddr.state].filter(Boolean).join(", ") || activeAddr.city || "India";
          const fee = /^5[0-3]/.test(code) ? 99 : 149;

          setPincode(code);
          setSavedArea(area);
          setDeliveryFee(fee);
          setPincodeInput(code);

          localStorage.setItem("user_pincode", code);
          localStorage.setItem("user_area", area);
        }
      }
    }
  }, [user]);

  const checkPincode = async () => {
    if (pincodeInput.length !== 6 || !/^\d+$/.test(pincodeInput)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    
    setIsCheckingPincode(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincodeInput}`);
      const data = await res.json();
      
      let areaName = "India";
      if (data && data[0] && data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        areaName = `${postOffice.District}, ${postOffice.State}`;
      }
      
      const fee = /^5[0-3]/.test(pincodeInput) ? 99 : 149;
      setDeliveryFee(fee);
      setSavedArea(areaName);
      setPincode(pincodeInput);
      setIsEditingPincode(false);
      
      localStorage.setItem("user_pincode", pincodeInput);
      localStorage.setItem("user_area", areaName);
      
      toast.success(`Delivery to ${areaName} (₹${fee})`);
    } catch (err) {
      const fee = /^5[0-3]/.test(pincodeInput) ? 99 : 149;
      setDeliveryFee(fee);
      setSavedArea("India");
      setPincode(pincodeInput);
      setIsEditingPincode(false);
      localStorage.setItem("user_pincode", pincodeInput);
      localStorage.setItem("user_area", "India");
      toast.success(`Delivery available! (₹${fee})`);
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const handleDecreaseQuantity = () => {
    if (state?.isReturnGift) {
      setQuantity(Math.max(50, quantity - 1));
    } else {
      setQuantity(Math.max(1, quantity - 1));
    }
  };

  const handleIncreaseQuantity = () => {
    if (product?.stock !== undefined && quantity >= product.stock) {
      toast.error(`Only ${product.stock} items left in stock`);
      return;
    }
    setQuantity(quantity + 1);
  };

  const deliveryDateString = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, []);

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.title || product.name,
      text: `Check out ${product.title || product.name} at Ghar Sansar!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success("Link copied to clipboard!");
    }
  };

  // Base list of mockup/alternative images for premium gallery feel matching screenshot
  const productImages = useMemo(() => {
    if (!product) return [];
    const baseImg = product.image || "/products/waterbottles_and_jars/asian_diamond_insulated_inner_stainless_steel_flask_1_pc.webp";
    return [
      { url: baseImg, label: "Front View", isVideo: false },
      { url: "/images/diamond_collection_banner.jpg", label: "Product & Lid", isVideo: false },
      { url: baseImg, label: "Side Angle", transformClass: "scale-x-[-1]", isVideo: false },
      { url: "/images/flask_lifestyle_banner.jpg", label: "Lifestyle View", isVideo: false },
      { url: baseImg, label: "Detail View", transformClass: "scale-[1.35]", isVideo: false },
      { url: "/images/flask_lifestyle_banner.jpg", label: "Product Video", isVideo: true }
    ];
  }, [product]);

  // Gallery Navigation
  const handlePrevImage = () => {
    setIsVideoActive(false);
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
  };

  const handleNextImage = () => {
    setIsVideoActive(false);
    setActiveImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
  };

  const handleSelectThumbnail = (idx: number) => {
    if (productImages[idx]?.isVideo) {
      setIsVideoActive(true);
      setActiveImageIndex(idx);
    } else {
      setIsVideoActive(false);
      setActiveImageIndex(idx);
    }
  };

  // Dynamic Product Specifications
  const productSpecs = useMemo(() => {
    const title = product?.title || product?.name || "";
    const isBottle = /bottle|flask|mug|sipper|water/i.test(title + " " + (product?.category || ""));
    const capacityMatch = title.match(/(\d+\s*(?:ml|l|ltr|gm|kg))/i);
    const capacity = capacityMatch ? capacityMatch[1] : (isBottle ? "500 ml" : "Standard Size");

    return [
      { label: "Product Name", value: product?.title || product?.name || "Asian Diamond Insulated Inner Stainless Steel Flask" },
      { label: "Capacity", value: capacity },
      { label: "Material", value: isBottle ? "304 Stainless Steel (Food Grade)" : "Premium High-Grade Material" },
      { label: "Color", value: "Silver / White (Diamond Design)" },
      { label: "Insulation", value: isBottle ? "Double Wall Vacuum Insulation" : "Multi-layer Durable Coating" },
      { label: "Usage", value: isBottle ? "Hot & Cold Beverages" : "Indoor & Everyday Living" },
      { label: "Package Contents", value: isBottle ? "1 Flask with Lid (Cup)" : "1 Unit in Protective Box" },
    ];
  }, [product]);

  // Review Form States
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [formImage, setFormImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // Initial reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (!product) return [];
    const saved = localStorage.getItem(`product_reviews_${product.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync reviews to localStorage
  useEffect(() => {
    if (product) {
      localStorage.setItem(`product_reviews_${product.id}`, JSON.stringify(reviews));
    }
  }, [reviews, product]);

  // Check if customer has bought this product
  const hasBoughtProduct = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    return orders.some((order) => 
      order.items.some((item) => item.id === product?.id)
    );
  }, [orders, user, isAuthenticated, product]);

  // Rating aggregate calculations
  const { avgRating, ratingPercentages } = useMemo(() => {
    if (reviews.length === 0) {
      return { avgRating: 0, ratingPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / reviews.length) * 10) / 10;

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const ratingKey = Math.min(Math.max(Math.round(r.rating), 1), 5) as 5 | 4 | 3 | 2 | 1;
      counts[ratingKey]++;
    });

    const percentages = {
      5: Math.round((counts[5] / reviews.length) * 100),
      4: Math.round((counts[4] / reviews.length) * 100),
      3: Math.round((counts[3] / reviews.length) * 100),
      2: Math.round((counts[2] / reviews.length) * 100),
      1: Math.round((counts[1] / reviews.length) * 100),
    };

    return { avgRating: avg, ratingPercentages: percentages };
  }, [reviews]);

  // Handle Review Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormImage(base64String);
        setImagePreview(base64String);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newRev: Review = {
      id: `review_${Date.now()}`,
      name: formName.trim(),
      rating: formRating,
      comment: formComment.trim(),
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      image: formImage
    };

    setReviews([newRev, ...reviews]);
    toast.success("Review submitted successfully!");
    setIsReviewModalOpen(false);

    // Reset Form
    setFormName("");
    setFormRating(5);
    setFormComment("");
    setFormImage("");
    setImagePreview("");
  };

  // Zoom on Hover Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id || product._id,
      name: product.title || product.name,
      price: product.price,
      image: product.image || product.images?.[0],
      quantity: quantity,
      isReturnGift: state?.isReturnGift,
      minQty: state?.isReturnGift ? 50 : 1,
      stock: product.stock
    });
    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    if (!isAuthenticated) {
      toast.error('Please sign in to complete checkout.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  // Related products under the same category (or fallback bottles)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCat = products.filter((p) => p.category === product.category && p.id !== product.id);
    if (sameCat.length >= 5) return sameCat.slice(0, 10);
    const others = products.filter((p) => p.id !== product.id && !sameCat.some((sc) => sc.id === p.id));
    return [...sameCat, ...others].slice(0, 10);
  }, [products, product]);

  const scrollRelated = (direction: "left" | "right") => {
    if (relatedScrollRef.current) {
      const scrollAmount = 300;
      relatedScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] pb-16 pt-12 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
            <div className="lg:col-span-7 aspect-square bg-[#eae5dc] rounded-none" />
            <div className="lg:col-span-5 space-y-6 pt-4">
              <div className="h-6 bg-gray-200 rounded-none w-1/4" />
              <div className="h-10 bg-gray-200 rounded-none w-3/4" />
              <div className="h-28 bg-gray-200 rounded-none" />
              <div className="h-14 bg-gray-200 rounded-none" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-none flex items-center justify-center mb-4">
          <Info size={28} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 max-w-sm mb-6">The product you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate(state?.isReturnGift ? "/return-gifts" : "/products")}
          className="flex items-center gap-2 px-6 py-3 bg-[#0F2920] text-white font-bold uppercase tracking-widest text-xs rounded-none hover:bg-black transition shadow-md"
        >
          <ArrowLeft size={18} /> Back to Catalog
        </button>
      </div>
    );
  }

  // Discount Calculation
  const actualPriceVal = product.actualPrice || (product["act-price"] as number) || (product.price ? Math.round(product.price * 1.2) : 0);
  const discountPercentage = actualPriceVal && product.price && actualPriceVal > product.price
    ? Math.round(((actualPriceVal - product.price) / actualPriceVal) * 100)
    : 17;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20 font-sans relative overflow-x-hidden">
      
      {/* Subtle Botanical Watermarks on sides matching catalog screenshot */}
      <div className="fixed top-28 left-0 -translate-x-12 w-64 h-96 pointer-events-none opacity-20 z-0 hidden 2xl:block select-none">
        <svg viewBox="0 0 200 300" className="w-full h-full text-emerald-950/40 fill-current">
          <path d="M10,150 Q70,70 120,40 Q100,100 80,160 Q130,120 180,100 Q150,160 110,210 Q160,200 190,220 Q130,250 80,260 Q50,265 20,280 Q40,220 20,180 Z" />
        </svg>
      </div>
      <div className="fixed bottom-28 right-0 translate-x-12 w-64 h-96 pointer-events-none opacity-20 z-0 hidden 2xl:block select-none">
        <svg viewBox="0 0 200 300" className="w-full h-full text-emerald-950/40 fill-current scale-x-[-1]">
          <path d="M10,150 Q70,70 120,40 Q100,100 80,160 Q130,120 180,100 Q150,160 110,210 Q160,200 190,220 Q130,250 80,260 Q50,265 20,280 Q40,220 20,180 Z" />
        </svg>
      </div>

      {/* Luxury Sticky Mobile CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 p-3.5 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Total Price</span>
          <span className="text-lg font-black text-gray-900">₹{(product.price * quantity) + (deliveryFee || 0)}</span>
        </div>
        <div className="flex gap-2 items-center">
          {quantityInCart > 0 ? (
            <div className="flex items-center border border-[#0F2920] bg-[#f0f6f3] rounded-none px-2 py-1 gap-2">
              <button 
                type="button"
                onClick={() => {
                  if (quantityInCart > 1) {
                    updateQuantity(cartItemForProduct!.id, quantityInCart - 1);
                  } else {
                    removeFromCart(cartItemForProduct!.id);
                    toast.success("Removed from cart");
                  }
                }}
                className="w-7 h-7 flex items-center justify-center bg-white text-gray-800 border border-gray-300 rounded-none font-bold text-sm active:scale-90 transition"
              >
                -
              </button>
              <span className="font-bold text-xs text-[#0F2920] px-1 select-none">{quantityInCart}</span>
              <button 
                type="button"
                onClick={() => updateQuantity(cartItemForProduct!.id, quantityInCart + 1)}
                className="w-7 h-7 flex items-center justify-center bg-[#0F2920] text-white rounded-none font-bold text-sm active:scale-90 transition"
              >
                +
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-none font-bold text-xs uppercase tracking-wider transition"
            >
              Add to Cart
            </button>
          )}
          <button 
            onClick={handleBuyNow}
            className="px-5 py-2.5 bg-[#0F2920] hover:bg-[#183E31] text-white rounded-none font-bold text-xs uppercase tracking-wider transition shadow-md"
          >
            Buy Now
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        
        {/* Luxury Breadcrumb matching screenshot (Home > Shop > Category > Title) */}
        <nav className="flex items-center space-x-1.5 text-xs text-gray-500 mb-6 font-medium">
          <span className="cursor-pointer hover:text-gray-900 transition" onClick={() => navigate("/")}>Home</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-gray-900 transition" onClick={() => navigate(state?.isReturnGift ? "/return-gifts" : "/products")}>
            {state?.isReturnGift ? "Return Gifts" : "Shop"}
          </span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-gray-900 transition" onClick={() => navigate(state?.isReturnGift ? `/return-gifts?category=${product.category}` : `/products?category=${product.category}`)}>
            {product.category || "Water Bottles & Jars"}
          </span>
          <span>&gt;</span>
          <span className="text-gray-900 font-bold truncate max-w-[280px]">{product.title || product.name}</span>
        </nav>

        {/* 2-Column Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
          
          {/* LEFT COLUMN: Gallery with Vertical Thumbnails, Main Stage & Horizontal Thumbnails */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              {/* Vertical Thumbnails Strip (Left of main image on desktop) */}
              <div className="hidden sm:flex flex-col items-center gap-2">
                {productImages.slice(0, 5).map((imgObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectThumbnail(idx)}
                    className={`w-14 h-14 rounded-none p-1 bg-white border-2 transition-all overflow-hidden relative group flex items-center justify-center ${
                      activeImageIndex === idx && !isVideoActive ? 'border-[#0F2920] shadow-sm' : 'border-gray-200/80 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={imgObj.url}
                      alt={`Thumb ${idx + 1}`}
                      className={`w-full h-full object-contain ${imgObj.transformClass || ""}`}
                    />
                  </button>
                ))}
                
                {/* Vertical Scroll / Down Arrow */}
                <button 
                  onClick={() => handleSelectThumbnail((activeImageIndex + 1) % productImages.length)}
                  className="w-14 h-7 rounded-none bg-white border border-gray-200/80 hover:bg-gray-50 flex items-center justify-center text-gray-500 transition shadow-2xs"
                  title="Next View"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Main Image Showcase Container */}
              <div 
                className="flex-1 w-full relative overflow-hidden rounded-none bg-[#F7F6F0] aspect-[4/3] sm:aspect-square border border-[#E5E1D8] flex items-center justify-center p-6 sm:p-10 select-none group"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => !isVideoActive && setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                {/* 360 & Expand Controls at Top Right */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button
                    onClick={() => setIs360Active(!is360Active)}
                    className={`px-2.5 py-1.5 rounded-none text-[11px] font-bold border transition flex items-center gap-1 shadow-sm ${
                      is360Active ? 'bg-[#0F2920] text-white border-[#0F2920]' : 'bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border-white/20'
                    }`}
                    title="Interactive 360 View"
                  >
                    <RotateCw size={13} className={is360Active ? "animate-spin" : ""} />
                    <span>360°</span>
                  </button>

                  <button
                    onClick={() => setActiveLightboxImage(productImages[activeImageIndex]?.url || product.image)}
                    className="p-1.5 rounded-none bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20 transition shadow-sm"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>

                {/* Left & Right Circular Nav Arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-none bg-white/90 hover:bg-white text-gray-700 shadow-md border border-gray-200/60 flex items-center justify-center transition active:scale-95"
                  title="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-none bg-white/90 hover:bg-white text-gray-700 shadow-md border border-gray-200/60 flex items-center justify-center transition active:scale-95"
                  title="Next image"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Bottom Right Zoom / Scan Icon */}
                <button 
                  onClick={() => setActiveLightboxImage(productImages[activeImageIndex]?.url || product.image)}
                  className="absolute bottom-4 right-4 z-20 p-2 rounded-none bg-white/90 hover:bg-white text-gray-600 shadow-sm border border-gray-200 transition"
                >
                  <Scan size={15} />
                </button>

                {/* Main Media Content: Video or Studio Image */}
                {isVideoActive ? (
                  <div className="w-full h-full rounded-none overflow-hidden flex items-center justify-center bg-black/5">
                    <video
                      src="/videos/homepagevideo.mp4"
                      autoPlay
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <motion.div
                    key={activeImageIndex}
                    animate={is360Active ? { rotateY: [0, 360] } : {}}
                    transition={is360Active ? { repeat: Infinity, duration: 4, ease: "linear" } : {}}
                    className="w-full h-full flex items-center justify-center relative cursor-zoom-in"
                  >
                    {/* Realistic ambient ground shadow */}
                    <div 
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/5 h-4 rounded-none bg-black/[0.06] blur-[6px] pointer-events-none" 
                      aria-hidden="true" 
                    />

                    <StudioImage
                      src={productImages[activeImageIndex]?.url || product.image}
                      alt={product.title}
                      loading="eager"
                      className={`max-w-full max-h-full transition-transform duration-200 ${productImages[activeImageIndex]?.transformClass || "object-contain"}`}
                      style={isZooming ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transform: 'scale(1.8)'
                      } : {}}
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Horizontal Thumbnails Row below main image (matching screenshot with 6 items and video play icon) */}
            <div className="grid grid-cols-6 gap-2 sm:gap-2.5 pt-1">
              {productImages.map((imgObj, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectThumbnail(idx)}
                  className={`aspect-square rounded-none p-1 bg-white border-2 transition-all overflow-hidden relative group flex items-center justify-center ${
                    activeImageIndex === idx ? 'border-[#0F2920] shadow-sm' : 'border-gray-200/80 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={imgObj.url}
                    alt={imgObj.label}
                    className={`w-full h-full object-contain ${imgObj.transformClass || ""}`}
                  />
                  {imgObj.isVideo && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-none bg-white/90 text-gray-900 flex items-center justify-center shadow-sm">
                        <Play size={12} className="ml-0.5 fill-current" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN: Product Details, Pricing, Location, Stock, CTAs */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div>
              {/* Category Pill, In Stock Dot, and Heart/Share icons */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold tracking-widest text-[#8C3259] bg-[#F8EAEF] px-2.5 py-1 rounded-none uppercase">
                    {product.category || "Water Bottles & Jars"}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-none animate-ping"></span>
                    In Stock &amp; Ready
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (product) toggleWishlist(product);
                    }}
                    className={`p-2 rounded-none border transition ${
                      isWishlisted ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-gray-400 hover:text-gray-600 border-gray-200'
                    }`}
                    title="Wishlist"
                  >
                    <Heart size={17} className={isWishlisted ? 'fill-current' : ''} />
                  </button>

                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-none border border-gray-200 bg-white text-gray-400 hover:text-gray-600 transition"
                    title="Share"
                  >
                    <Share2 size={17} />
                  </button>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 leading-snug mb-2">
                {product.title || product.name}
              </h1>

              {/* Star Rating and Customer Reviews */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-900">0.0</span>
                <span className="text-xs text-gray-500 font-normal">
                  ({reviews.length} Verified Customer Reviews)
                </span>
              </div>

              {/* Pricing Row matching screenshot (MRP, SAVE %, Price) */}
              <div className="space-y-1 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">MRP</span>
                  <span className="text-sm text-gray-400 line-through">₹{actualPriceVal}</span>
                  <span className="text-[10px] font-extrabold text-[#D32F2F] bg-[#FCE8E8] px-2 py-0.5 rounded-none">
                    SAVE {discountPercentage}%
                  </span>
                </div>

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price</span>
                  <span className="text-3xl font-extrabold text-gray-900">₹{product.price}</span>
                </div>
              </div>

              {/* Delivery Location Box matching screenshot */}
              <div className="p-4 bg-white rounded-none border border-gray-200/90 shadow-2xs space-y-3.5 mb-5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Location</span>
                
                {isEditingPincode ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit Pincode" 
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      maxLength={6}
                      className="flex-1 px-3.5 py-2 text-sm border border-gray-300 rounded-none focus:ring-2 focus:ring-[#0F2920] outline-none"
                      disabled={isCheckingPincode}
                    />
                    <button 
                      onClick={checkPincode}
                      disabled={isCheckingPincode}
                      className="px-4 py-2 bg-[#0F2920] text-white text-xs font-bold uppercase rounded-none hover:bg-black transition disabled:opacity-50"
                    >
                      {isCheckingPincode ? "Checking..." : "Apply"}
                    </button>
                    <button 
                      onClick={() => setIsEditingPincode(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-none bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{pincode}</p>
                        <p className="text-xs text-gray-500 leading-tight mt-0.5">{savedArea}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsEditingPincode(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      Change
                    </button>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Truck size={15} />
                    <span>Delivery <strong className="font-bold">₹99 (Standard)</strong></span>
                  </div>
                  <div className="text-gray-500 text-[11px]">
                    Estimated Delivery: <strong className="text-gray-800 font-bold">{deliveryDateString}</strong>
                  </div>
                </div>
              </div>

              {/* Quantity Selector and In-Stock Label */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-none bg-white shadow-2xs">
                  <button 
                    onClick={handleDecreaseQuantity}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-none transition font-bold"
                  >
                    -
                  </button>
                  <span className="w-9 text-center font-bold text-sm text-gray-900">{quantity}</span>
                  <button 
                    onClick={handleIncreaseQuantity}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-none transition font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none"></span>
                  <span>In Stock (24 items)</span>
                </div>
              </div>

              {/* CTA Action Buttons matching screenshot */}
              <div className="space-y-3">
                {/* Row 1: Add to Cart & Buy Now */}
                <div className="flex gap-3">
                  {quantityInCart > 0 ? (
                    <div className="flex-1 flex items-center justify-between border-2 border-[#0F2920] bg-[#f0f6f3] rounded-none py-2 px-3 shadow-xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (quantityInCart > 1) {
                            updateQuantity(cartItemForProduct!.id, quantityInCart - 1);
                          } else {
                            removeFromCart(cartItemForProduct!.id);
                            toast.success(`Removed from cart`);
                          }
                        }}
                        className="w-9 h-9 flex items-center justify-center bg-white hover:bg-gray-100 text-[#0F2920] border border-[#c4d6cc] rounded-none active:scale-90 transition font-bold"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} strokeWidth={2.5} />
                      </button>

                      <div className="text-center select-none">
                        <span className="font-bold text-[#0F2920] text-sm sm:text-base block">
                          {quantityInCart} in Cart
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase font-semibold">
                          Click - / + to adjust
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => updateQuantity(cartItemForProduct!.id, quantityInCart + 1)}
                        className="w-9 h-9 flex items-center justify-center bg-[#0F2920] hover:bg-[#183E31] text-white rounded-none active:scale-90 transition font-bold"
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-[#0F2920] hover:bg-[#183E31] text-white rounded-none font-bold uppercase tracking-wider text-xs shadow-md transition transform active:scale-95 duration-200"
                    >
                      <ShoppingCart size={16} />
                      <span>Add to Cart</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-[#EDF4F0] hover:bg-[#E2EDE6] text-[#0F2920] border border-[#CDE0D5] rounded-none font-bold uppercase tracking-wider text-xs transition transform active:scale-95 duration-200"
                  >
                    <Zap size={16} />
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* Row 2: WhatsApp Inquiry & Call Support */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/918121135980?text=Hello, I would like to inquire about: ${product.title || product.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#EDF8F1] hover:bg-[#E1F3E7] text-[#1E7E34] border border-[#D1EEDB] rounded-none font-bold uppercase tracking-wider text-[11px] transition"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp Inquiry</span>
                  </a>

                  <a
                    href="tel:+918121135980"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#F9F7F2] hover:bg-[#F2EEE4] text-[#4A4036] border border-[#EBE6DC] rounded-none font-bold uppercase tracking-wider text-[11px] transition"
                  >
                    <Phone size={15} />
                    <span>Call Support</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 4 Trust Badges Row (spanning full width with hairline dividers) */}
        <div className="bg-white rounded-none border border-gray-200/80 shadow-xs my-4 py-3.5 px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200/60">
          <div className="flex flex-col items-center text-center p-2.5">
            <User2 className="w-5 h-5 text-gray-700 mb-1" strokeWidth={1.75} />
            <span className="text-xs font-bold text-gray-900 leading-tight">Premium Quality</span>
            <span className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">100% Certified</span>
          </div>

          <div className="flex flex-col items-center text-center p-2.5">
            <Truck className="w-5 h-5 text-gray-700 mb-1" strokeWidth={1.75} />
            <span className="text-xs font-bold text-gray-900 leading-tight">Fast Delivery</span>
            <span className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">Pan India</span>
          </div>

          <div className="flex flex-col items-center text-center p-2.5">
            <RotateCcw className="w-5 h-5 text-gray-700 mb-1" strokeWidth={1.75} />
            <span className="text-xs font-bold text-gray-900 leading-tight">No Returns</span>
            <span className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">No Exchange</span>
          </div>

          <div className="flex flex-col items-center text-center p-2.5">
            <Lock className="w-5 h-5 text-gray-700 mb-1" strokeWidth={1.75} />
            <span className="text-xs font-bold text-gray-900 leading-tight">Secure Payments</span>
            <span className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">100% Encrypted</span>
          </div>
        </div>

        {/* Tab Navigation matching screenshot */}
        <div className="pt-6 border-b border-gray-200/80">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar">
            {[
              { id: "description", label: "Description" },
              { id: "specifications", label: "Specifications" },
              { id: "materials", label: "Materials" },
              { id: "shipping", label: "Shipping & Delivery" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-bold tracking-normal transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "border-[#0F2920] text-[#0F2920]" 
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content 1: Description Section (2 Columns with Feature Badges & Lifestyle Card) */}
        {activeTab === "description" && (
          <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Description Column */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#9A7B66] uppercase block">
                Premium Collection
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-tight">
                Elegant Craftsmanship<br className="hidden sm:block" /> &amp; Luxury Aesthetics
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
                {product.description || "Elegant insulated flask/mug, designed for leakproof travel. Perfect for coffee, tea, and other hot/cold beverages on the go."} This premium collection highlights our dedication to creating beautiful, lasting decorative elements for your home. Made with precision and passion, this piece will bring style and refinement to any interior layout.
              </p>

              {/* 4 Feature Badges (2x2 Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="p-3 bg-white rounded-none border border-gray-200/70 shadow-2xs flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-none bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                    <Flame size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block leading-tight">Keeps Hot &amp; Cold</span>
                    <span className="text-[10px] text-gray-400 font-medium">for Long Hours</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-none border border-gray-200/70 shadow-2xs flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-none bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Droplets size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block leading-tight">Leak Proof</span>
                    <span className="text-[10px] text-gray-400 font-medium">Design</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-none border border-gray-200/70 shadow-2xs flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-none bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                    <Shield size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block leading-tight">304 Stainless Steel</span>
                    <span className="text-[10px] text-gray-400 font-medium">Food Grade</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-none border border-gray-200/70 shadow-2xs flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-none bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                    <Coffee size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block leading-tight">Portable &amp; Travel</span>
                    <span className="text-[10px] text-gray-400 font-medium">With Cup Lid</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Lifestyle Banner Column matching screenshot */}
            <div className="lg:col-span-5">
              <div className="relative rounded-none overflow-hidden aspect-[16/10] shadow-md border border-gray-200 group">
                <img
                  src="/images/flask_lifestyle_banner.jpg"
                  alt="Stay Refreshed Anywhere"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white leading-tight mb-1">
                      Stay Refreshed<br />Anywhere
                    </h3>
                    <p className="text-xs text-white/80 max-w-xs">
                      Premium design for your everyday essentials.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-black/60 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-none text-xs font-bold flex items-center gap-1.5">
                      <Flame size={13} className="text-red-400 fill-red-400" />
                      <span>HOT 12 Hours</span>
                    </span>
                    <span className="bg-black/60 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-none text-xs font-bold flex items-center gap-1.5">
                      <Droplets size={13} className="text-cyan-300" />
                      <span>COLD 24 Hours</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Specifications Section (Table + Diamond Collection Banner) */}
        {activeTab === "specifications" && (
          <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Specifications Table */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Specifications</h3>
                <span className="text-xs font-bold text-[#0F2920] flex items-center gap-1 hover:underline cursor-pointer">
                  View More Details &rarr;
                </span>
              </div>

              <div className="bg-white rounded-none border border-gray-200/80 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <tbody>
                    {productSpecs.map((spec, i) => (
                      <tr 
                        key={i} 
                        className={`border-b last:border-0 border-gray-100 ${i % 2 === 0 ? "bg-gray-50/60" : "bg-white"}`}
                      >
                        <td className="px-5 py-3.5 font-bold text-gray-500 w-1/3">{spec.label}</td>
                        <td className="px-5 py-3.5 font-medium text-gray-900">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Diamond Collection Promo Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-none overflow-hidden aspect-[16/10] shadow-md border border-gray-200 group">
                <img
                  src="/images/diamond_collection_banner.jpg"
                  alt="Diamond Collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent p-6 sm:p-8 flex flex-col justify-center">
                  <span className="text-xs font-extrabold tracking-widest uppercase text-amber-300 mb-1">
                    DIAMOND COLLECTION
                  </span>
                  <div className="w-10 h-0.5 bg-amber-300 mb-3" />
                  <p className="text-xs text-white/90 max-w-xs font-medium">
                    Premium design for your everyday essentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Materials Section */}
        {activeTab === "materials" && (
          <div className="py-10 max-w-3xl space-y-4">
            <h3 className="text-xl font-serif font-bold text-gray-900">Only The Finest Materials</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Constructed with eco-friendly and robust, food-grade 304 Stainless Steel that guarantees structural integrity, superior thermal retention, and long durability under regular household usage.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-white rounded-none border border-gray-200/80 shadow-2xs">
                <ShieldCheck className="w-6 h-6 text-emerald-700 mb-2" />
                <h4 className="text-xs font-bold text-gray-900 mb-1">BPA-Free Certified</h4>
                <p className="text-[11px] text-gray-500">100% non-toxic and food contact safe.</p>
              </div>
              <div className="p-4 bg-white rounded-none border border-gray-200/80 shadow-2xs">
                <Award className="w-6 h-6 text-emerald-700 mb-2" />
                <h4 className="text-xs font-bold text-gray-900 mb-1">304 Stainless Steel</h4>
                <p className="text-[11px] text-gray-500">Rust-proof and odor-resistant interior.</p>
              </div>
              <div className="p-4 bg-white rounded-none border border-gray-200/80 shadow-2xs">
                <Flame className="w-6 h-6 text-emerald-700 mb-2" />
                <h4 className="text-xs font-bold text-gray-900 mb-1">Double Wall Vacuum</h4>
                <p className="text-[11px] text-gray-500">Sweat-free exterior with extreme temperature lock.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: Shipping & Delivery Section */}
        {activeTab === "shipping" && (
          <div className="py-10 max-w-3xl space-y-4">
            <h3 className="text-xl font-serif font-bold text-gray-900">Reliable Logistics Network</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              We deliver using professional high-security transport partners (Delhivery, BlueDart, DTDC). Each item is securely packaged inside specialized heavy-duty boxes with multi-layer bubble wrap to guarantee safe arrival.
            </p>
            <div className="bg-white p-5 rounded-none border border-gray-200/80 shadow-2xs space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <CheckCircle size={15} className="text-emerald-600" />
                <span>Dispatched within 24–48 hours of order confirmation.</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <CheckCircle size={15} className="text-emerald-600" />
                <span>Real-time SMS and WhatsApp tracking updates.</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <CheckCircle size={15} className="text-emerald-600" />
                <span>Pan India standard delivery within 3–6 business days.</span>
              </div>
            </div>
          </div>
        )}

        {/* Customer Reviews & Verification Section matching screenshot */}
        <div className="py-12 border-t border-gray-200/80">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Reviews &amp; Verification</h2>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-none border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none"></span>
              Verified Reviews Only
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Rating Summary Card */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-none border border-gray-200/80 shadow-2xs space-y-5">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Overall Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-gray-900">{avgRating ? avgRating.toFixed(1) : "0.0"}</span>
                  <span className="text-xs font-bold text-gray-400">out of 5</span>
                </div>
                <div className="flex items-center text-gray-200 mt-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bars (5 Star to 1 Star) */}
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((r) => (
                  <div key={r} className="flex items-center text-xs text-gray-500 font-medium">
                    <span className="w-12">{r} star</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-none mx-3 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-700 rounded-none transition-all duration-500"
                        style={{ width: `${ratingPercentages[r as 5|4|3|2|1] || 0}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-gray-400 font-semibold">{ratingPercentages[r as 5|4|3|2|1] || 0}%</span>
                  </div>
                ))}
              </div>

              {/* Review Restricted Badge Notice */}
              <div className="p-4 bg-[#FDF3F3] rounded-none border border-[#FADBD8] flex items-start gap-3">
                <div className="w-8 h-8 rounded-none bg-[#FCE8E8] text-[#D32F2F] flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#D32F2F] leading-tight">Review Restricted</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                    To maintain strict authenticity, only customers who have verified purchase history for this item can write feedback.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Empty State or Reviews Display */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-none border border-gray-200/80 shadow-2xs flex flex-col items-center justify-center text-center">
              {reviews.length === 0 ? (
                <div className="space-y-4 py-8">
                  <div className="w-12 h-12 rounded-none bg-gray-50 text-gray-400 flex items-center justify-center mx-auto border border-gray-200/60">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">No reviews yet.</h3>
                    <p className="text-xs text-gray-400 mt-1">Be the first to share your feedback!</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error("Please sign in to write a review");
                        navigate('/login', { state: { from: location } });
                      } else {
                        setIsReviewModalOpen(true);
                      }
                    }}
                    className="px-8 py-3 bg-[#0F2920] hover:bg-[#183E31] text-white rounded-none font-bold uppercase tracking-wider text-xs shadow-md transition active:scale-95"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-900">{reviews.length} Customer Feedback</span>
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="text-xs font-bold text-[#0F2920] hover:underline"
                    >
                      + Add Review
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-gray-50 rounded-none border border-gray-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">{rev.name}</span>
                          <span className="text-[10px] text-gray-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={11} className={s <= rev.rating ? "fill-current" : "text-gray-200"} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Masterpieces Section matching screenshot */}
        {relatedProducts.length > 0 && (
          <div className="py-12 border-t border-gray-200/80">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Related Masterpieces</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollRelated("left")}
                  className="w-8 h-8 rounded-none bg-white hover:bg-gray-100 border border-gray-200 shadow-2xs flex items-center justify-center text-gray-700 transition"
                  title="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollRelated("right")}
                  className="w-8 h-8 rounded-none bg-white hover:bg-gray-100 border border-gray-200 shadow-2xs flex items-center justify-center text-gray-700 transition"
                  title="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Carousel of 5 Cards */}
            <div 
              ref={relatedScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
            >
              {relatedProducts.map((relProduct, idx) => {
                const relActualPrice = relProduct.actualPrice || (relProduct["act-price"] as number) || (relProduct.price ? Math.round(relProduct.price * 1.3) : 0);
                const relDiscount = relActualPrice && relProduct.price && relActualPrice > relProduct.price
                  ? Math.round(((relActualPrice - relProduct.price) / relActualPrice) * 100)
                  : 25;
                const relCartItem = items.find(
                  (item) => String(item.id) === String(relProduct.id) || String(item.productId) === String(relProduct.id)
                );
                const relQtyInCart = relCartItem ? relCartItem.quantity : 0;

                return (
                  <div
                    key={relProduct.id || idx}
                    onClick={() => navigate(`/product/${encodeURIComponent(relProduct.id)}`, { state: relProduct })}
                    className="w-56 sm:w-64 shrink-0 bg-white rounded-none border border-gray-200/80 p-3.5 hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Heart Wishlist */}
                      <div className="flex justify-end mb-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(relProduct);
                          }}
                          className={`transition p-1 ${
                            isInWishlist(relProduct.id) ? "text-red-500" : "text-gray-300 hover:text-red-500"
                          }`}
                        >
                          <Heart size={16} className={isInWishlist(relProduct.id) ? "fill-current" : ""} />
                        </button>
                      </div>

                      {/* Image */}
                      <div className="aspect-square rounded-none bg-[#FAF8F5] p-2 flex items-center justify-center overflow-hidden mb-3 border border-gray-100">
                        <img
                          src={relProduct.image}
                          alt={relProduct.title || relProduct.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Rating: ★ 4.5 (10) */}
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 mb-1.5">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={11} className={s <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                          ))}
                        </div>
                        <span className="font-bold text-gray-800">4.5</span>
                        <span className="text-gray-400 font-normal">(10)</span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-2 min-h-[32px] leading-tight mb-2 group-hover:text-emerald-900 transition-colors">
                        {relProduct.title || relProduct.name}
                      </h4>
                    </div>

                    <div>
                      {/* Price & Discount */}
                      <div className="flex items-baseline gap-1.5 mb-3">
                        <span className="text-sm font-extrabold text-gray-900">₹{relProduct.price}</span>
                        {relActualPrice > relProduct.price && (
                          <span className="text-[10px] text-gray-400 line-through">₹{relActualPrice}</span>
                        )}
                        <span className="text-[10px] font-bold text-[#D32F2F]">
                          {relDiscount}% OFF
                        </span>
                      </div>

                      {/* Action Buttons matching screenshot */}
                      <div className="flex items-center gap-2">
                        {relQtyInCart > 0 ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 h-[28px] border border-[#0F2920] bg-[#f0f6f3] rounded-none flex items-center justify-between px-1 shadow-2xs"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (relQtyInCart > 1) {
                                  updateQuantity(relCartItem!.id, relQtyInCart - 1);
                                } else {
                                  removeFromCart(relCartItem!.id);
                                  toast.success(`Removed from cart`);
                                }
                              }}
                              className="w-5 h-5 flex items-center justify-center bg-white hover:bg-gray-100 text-[#0F2920] border border-[#c4d6cc] rounded-none active:scale-90 transition font-bold"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={10} strokeWidth={2.5} />
                            </button>

                            <span className="font-bold text-[#0F2920] text-[11px] px-1 select-none">
                              {relQtyInCart}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(relCartItem!.id, relQtyInCart + 1);
                              }}
                              className="w-5 h-5 flex items-center justify-center bg-[#0F2920] hover:bg-[#183E31] text-white rounded-none active:scale-90 transition font-bold"
                              aria-label="Increase quantity"
                            >
                              <Plus size={10} strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart({
                                id: relProduct.id,
                                name: relProduct.title || relProduct.name,
                                price: relProduct.price,
                                image: relProduct.image,
                                quantity: 1
                              });
                              toast.success("Added to cart!");
                            }}
                            className="flex-1 py-1.5 px-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-none font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition"
                          >
                            <ShoppingCart size={11} />
                            <span>Add to Cart</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              id: relProduct.id,
                              name: relProduct.title || relProduct.name,
                              price: relProduct.price,
                              image: relProduct.image,
                              quantity: 1
                            });
                            navigate("/checkout");
                          }}
                          className="flex-1 py-1.5 px-2 bg-[#0F2920] hover:bg-[#183E31] text-white rounded-none font-bold text-[10px] uppercase tracking-wider flex items-center justify-center transition active:scale-95 shadow-2xs"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Review Modal Form */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-none p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-none"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-1">Write your Review</h3>
              <p className="text-xs text-gray-500 mb-4">{product.title || product.name}</p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-none text-xs focus:ring-2 focus:ring-[#0F2920] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Rating</label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="text-amber-400 hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Star
                          size={24}
                          className={star <= formRating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Review Comments</label>
                  <textarea
                    required
                    rows={3}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Describe your experience with this product..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-none text-xs focus:ring-2 focus:ring-[#0F2920] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Add Photo (Optional)</label>
                  <div className="mt-1 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-none p-3 bg-gray-50 relative cursor-pointer hover:bg-gray-100 transition">
                    {imagePreview ? (
                      <div className="relative w-full h-24 flex items-center justify-center">
                        <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-none shadow" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setFormImage("");
                          }}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-none p-1 shadow"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-500 font-semibold">Select delivery pic</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0F2920] hover:bg-[#183E31] text-white font-bold rounded-none text-xs uppercase tracking-wider shadow-md transition"
                >
                  Submit Verified Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expand Image Lightbox */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setActiveLightboxImage(null)}
          >
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white rounded-none p-2.5 transition"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={activeLightboxImage}
              alt="Full scale view"
              className="max-w-full max-h-[85vh] object-contain rounded-none shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductDetail;
