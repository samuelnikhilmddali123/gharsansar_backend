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
  ChevronUp,
  MapPin,
  RotateCcw,
  Lock,
  Maximize2,
  FileText,
  Scan,
  Check,
  ExternalLink,
  Plus,
  Minus,
  Sparkles
} from "lucide-react";
import { useProducts, Product } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { generateOrderId, generateSingleProductWhatsAppMessage, openWhatsAppOrderUrl } from "../utils/whatsappOrder";
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
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Commerce States
  const [quantity, setQuantity] = useState(state?.isReturnGift ? 50 : 1);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Availability / Stock Status Checks
  const isOutOfStock = Boolean(product?.status === "out_of_stock" || (product?.stock !== undefined && Number(product?.stock) <= 0));
  const isComingSoon = Boolean(product?.status === "coming_soon");

  // Related products carousel ref
  const relatedScrollRef = useRef<HTMLDivElement>(null);

  // Helper to read initial pincode from account addresses or explicitly saved pincode
  const getInitialPincode = () => {
    const local = localStorage.getItem("user_pincode");
    // Ensure we do not use legacy hardcoded default "520008"
    if (local && /^\d{6}$/.test(local) && local !== "520008") return local;
    return "";
  };

  const getInitialArea = () => {
    const localPin = localStorage.getItem("user_pincode");
    if (!localPin || localPin === "520008") return "";
    const localArea = localStorage.getItem("user_area");
    if (localArea && localArea !== "Vijayawada, Andhra Pradesh") return localArea;
    return "";
  };

  const [pincode, setPincode] = useState<string>(getInitialPincode);
  const [savedArea, setSavedArea] = useState<string>(getInitialArea);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(() => {
    const initialPin = getInitialPincode();
    return initialPin ? (/^5[0-3]/.test(initialPin) ? 99 : 149) : null;
  });
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(getInitialPincode);

  // Automatically sync pincode and area only if the user is authenticated and has an address
  useEffect(() => {
    if (!user) return;
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
    if (isOutOfStock || isComingSoon) return;
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
    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }
    if (isComingSoon) {
      toast("This product is coming soon!");
      return;
    }
    const catDisc = Number(product.categoryDiscountPercentage || product.discountPercentage || 0);
    const actP = Number(product.actualPrice !== undefined ? product.actualPrice : (product.price || 0)) || 0;
    const discP = Number(product.discountedPrice !== undefined ? product.discountedPrice : (catDisc > 0 ? Math.round((actP - (actP * (catDisc / 100))) * 100) / 100 : actP));
    const effectivePrice = Number(product.finalPrice !== undefined ? product.finalPrice : (catDisc > 0 ? discP : actP));

    addToCart({
      id: product.id || product._id,
      name: product.title || product.name,
      price: effectivePrice, // Customer pays actualPrice (₹2,500)
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

  const handleWhatsAppOrderProduct = () => {
    if (!product) return;
    const orderId = generateOrderId();
    const customerInfo = {
      name: user?.full_name || '',
      mobile: user?.phone || '',
      email: user?.email || '',
      address: user?.addresses?.[0]?.address || ''
    };
    const msg = generateSingleProductWhatsAppMessage(orderId, customerInfo, {
      product: {
        id: product.id,
        title: product.title || product.name,
        name: product.name || product.title,
        price: product.price,
        image: product.image,
        category: product.category,
        subCategory: product.subCategory
      },
      quantity: quantity,
      unitPrice: product.price,
      selectedSize: undefined,
      selectedColor: undefined
    });
    openWhatsAppOrderUrl(msg);
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
      <div className="min-h-screen bg-[#FAF9F5] pb-16 pt-16 sm:pt-20 flex items-center justify-center">
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

  // Controlled Pricing Architecture: Strike Price (MRP), Actual Price (Base), Discounted Price (Final Customer Price)
  const actualPrice = Number(
    product.actualPrice !== undefined ? product.actualPrice :
    product.price !== undefined ? product.price :
    product.sellingPrice || 0
  ) || 0;

  // Strike Price: Reference price displayed with strikethrough (e.g. ₹2,150)
  const strikePrice = Number(
    product.strikePrice !== undefined ? product.strikePrice :
    (product as any)["act-price"] !== undefined ? (product as any)["act-price"] :
    actualPrice
  ) || actualPrice;

  // Category promotional discount % (e.g. 99%)
  const categoryDiscount = Number(
    product.categoryDiscountPercentage !== undefined ? product.categoryDiscountPercentage :
    product.discountPercentage || 0
  );
  const hasCategoryDiscount = categoryDiscount > 0;

  // Category Discount Amount calculated based on STRIKE PRICE: e.g. ₹2,150 × 99% = ₹2,129
  const categoryDiscountAmount = strikePrice > 0 && hasCategoryDiscount
    ? Math.round(strikePrice * (categoryDiscount / 100))
    : 0;

  // Discounted Price calculated dynamically from ACTUAL PRICE: e.g. ₹1,650 - (₹1,650 × 99 / 100) = ₹16.50
  const discountedPrice = Number(
    product.discountedPrice !== undefined ? product.discountedPrice :
    (hasCategoryDiscount ? Math.round((actualPrice - (actualPrice * (categoryDiscount / 100))) * 100) / 100 : actualPrice)
  );

  // Final Customer Price: discountedPrice when category discount ON, actualPrice when OFF
  const finalPrice = Number(
    product.finalPrice !== undefined ? product.finalPrice :
    (hasCategoryDiscount ? discountedPrice : actualPrice)
  );

  // Current Difference between Strike Price and Customer Price
  const currentDifference = Math.max(0, strikePrice - finalPrice);

  const displayDiscountBadge = categoryDiscount > 0
    ? `${categoryDiscount}% OFF`
    : (strikePrice > actualPrice ? `${Math.round(((strikePrice - actualPrice) / strikePrice) * 100)}% OFF` : null);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 font-sans text-gray-900 selection:bg-[#C57053] selection:text-white antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 relative z-10">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500 mb-6 font-normal">
          <button onClick={() => navigate("/")} className="hover:text-stone-900 transition cursor-pointer">Home</button>
          <span className="text-stone-300">/</span>
          <button onClick={() => navigate(state?.isReturnGift ? "/return-gifts" : "/products")} className="hover:text-stone-900 transition cursor-pointer">
            {state?.isReturnGift ? "Return Gifts" : "Shop"}
          </button>
          <span className="text-stone-300">/</span>
          <button onClick={() => navigate(state?.isReturnGift ? `/return-gifts?category=${product.category}` : `/products?category=${product.category}`)} className="hover:text-stone-900 transition cursor-pointer">
            {product.category || "General"}
          </button>
          <span className="text-stone-300">/</span>
          <span className="text-stone-900 truncate max-w-[280px]">{product.title || product.name}</span>
        </nav>

        {/* 2-Column Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start mb-16">
          
          {/* Left Column: Clean Image Showcase */}
          <div className="lg:col-span-7">
            <div 
              className="w-full relative overflow-hidden rounded-2xl bg-white aspect-square border border-[#E8E2D8]/70 flex items-center justify-center p-8 sm:p-14 select-none group shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
            >
              {/* Wishlist Button top-right */}
              <button 
                onClick={() => {
                  if (product) toggleWishlist(product);
                }}
                className={`absolute top-4 right-4 z-20 p-2.5 rounded-full border transition-all cursor-pointer ${
                  isWishlisted ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white/90 hover:bg-white text-stone-400 hover:text-rose-600 border-[#E8E2D8]'
                }`}
                title="Wishlist"
              >
                <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
              </button>

              {/* Main Media Content */}
              <div 
                className="w-full h-full flex items-center justify-center relative cursor-zoom-in"
                onClick={() => setActiveLightboxImage(product.image)}
              >
                <div 
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/5 h-4 rounded-full bg-black/[0.03] blur-[8px] pointer-events-none" 
                  aria-hidden="true" 
                />

                <StudioImage
                  src={product.image}
                  alt={product.title || product.name}
                  loading="eager"
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={isZooming ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: 'scale(1.5)'
                  } : {}}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Clean Editorial Product Info & CTAs */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Category Eyebrow & Status */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-semibold tracking-[0.24em] text-[#C86B4C] uppercase font-sans">
                  {product.category || "General"}
                </span>
                {isOutOfStock ? (
                  <span className="text-[11px] text-rose-700 font-medium px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md">
                    Out of Stock
                  </span>
                ) : isComingSoon ? (
                  <span className="text-[11px] text-amber-800 font-medium px-2 py-0.5 bg-amber-50 border border-amber-300 rounded-md">
                    Coming Soon
                  </span>
                ) : null}
              </div>

              {/* Title */}
              <h1 className="font-poppins text-2xl sm:text-3xl font-light text-gray-950 tracking-tight leading-snug mb-2.5">
                {product.title?.replace(/_/g, " ") || product.name?.replace(/_/g, " ")}
              </h1>

              {reviews.length > 0 && (
                <div className="flex items-center gap-1.5 mb-4 text-xs">
                  <div className="flex items-center text-[#F4B740]">
                    <Star size={13} className="fill-current" />
                  </div>
                  <span className="font-medium text-gray-900">{avgRating.toFixed(1)}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-stone-500 font-light">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                </div>
              )}

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="font-poppins text-2xl sm:text-3xl font-light text-gray-950">
                  ₹{finalPrice.toLocaleString("en-IN")}
                </span>
                {strikePrice > finalPrice && (
                  <span className="text-sm text-stone-400 line-through font-light" title="MRP">
                    ₹{strikePrice.toLocaleString("en-IN")}
                  </span>
                )}
                {displayDiscountBadge && (
                  <span className="text-xs font-medium text-[#7D3219] bg-[#F7EBE4] border border-[#D9B4A4]/80 px-2.5 py-0.5 rounded-full">
                    {displayDiscountBadge}
                  </span>
                )}
              </div>

              {/* Concise Description */}
              {product.description && (
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed mb-6 pt-3 border-t border-[#F0EAE1]">
                  {product.description}
                </p>
              )}

              {/* Minimal Delivery Checker */}
              <div className="mb-6 pt-3 border-t border-[#F0EAE1]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Delivery</span>
                  {pincode && !isEditingPincode && (
                    <button 
                      onClick={() => setIsEditingPincode(true)}
                      className="text-[11px] text-[#7D3219] hover:underline cursor-pointer"
                    >
                      Change pincode
                    </button>
                  )}
                </div>

                {isEditingPincode || !pincode ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit Pincode" 
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      className="w-48 px-3 py-1.5 text-xs bg-white border border-[#E8E2D8] rounded-md focus:border-[#C86B4C] outline-none"
                      disabled={isCheckingPincode}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") checkPincode();
                      }}
                    />
                    <button 
                      onClick={checkPincode}
                      disabled={isCheckingPincode || pincodeInput.length !== 6}
                      className="px-3.5 py-1.5 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] text-xs font-medium rounded-md transition disabled:opacity-50 cursor-pointer"
                    >
                      {isCheckingPincode ? "Checking..." : "Check"}
                    </button>
                    {pincode && (
                      <button 
                        onClick={() => setIsEditingPincode(false)}
                        className="text-xs text-stone-400 hover:text-stone-600 px-1 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-stone-600 flex-wrap">
                    <Truck size={14} className="text-[#C86B4C] shrink-0" />
                    <span>Deliver to <strong className="font-medium text-stone-900">{pincode}</strong> ({savedArea})</span>
                    <span className="text-stone-300">·</span>
                    <span>Standard ₹{deliveryFee} (by {deliveryDateString})</span>
                  </div>
                )}
              </div>

              {/* Purchase Actions */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  {!isOutOfStock && !isComingSoon && quantityInCart === 0 && (
                    <div className="flex items-center border border-[#E8E2D8] bg-white rounded-md h-[42px] px-1">
                      <button
                        type="button"
                        onClick={handleDecreaseQuantity}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-900 rounded transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-medium text-stone-900 select-none">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncreaseQuantity}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:text-stone-900 rounded transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}

                  {isOutOfStock ? (
                    <button
                      disabled
                      className="flex-1 h-[42px] px-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-md flex items-center justify-center cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  ) : isComingSoon ? (
                    <button
                      disabled
                      className="flex-1 h-[42px] px-4 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium rounded-md flex items-center justify-center cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  ) : quantityInCart > 0 ? (
                    <div className="flex-1 h-[42px] border border-[#E8E2D8] bg-white rounded-md flex items-center justify-between px-3">
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
                        className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
                        aria-label="Decrease cart quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-medium text-stone-900 select-none">
                        {quantityInCart} in Cart
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(cartItemForProduct!.id, quantityInCart + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 rounded text-stone-700 transition cursor-pointer"
                        aria-label="Increase cart quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 h-[42px] px-4 bg-white hover:bg-[#FAF7F2] text-gray-900 border border-[#E8E2D8] hover:border-stone-400 rounded-md font-normal text-xs sm:text-[13px] flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <ShoppingCart size={14} className="text-stone-600" />
                      <span>Add to Cart</span>
                    </button>
                  )}

                  {!isOutOfStock && !isComingSoon && (
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 h-[42px] px-4 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] rounded-md font-medium text-xs sm:text-[13px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <Zap size={14} className="fill-[#7D3219]" />
                      <span>Buy Now</span>
                    </button>
                  )}
                </div>

                {/* Subtle Secondary Help Row */}
                <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-stone-500 font-light">
                  <button
                    type="button"
                    onClick={handleWhatsAppOrderProduct}
                    className="inline-flex items-center gap-1.5 text-[#1E7E34] hover:underline cursor-pointer"
                  >
                    <MessageCircle size={13} />
                    <span>Order via WhatsApp</span>
                  </button>
                  <span className="text-stone-300">·</span>
                  <a
                    href="tel:+919492664870"
                    className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition cursor-pointer"
                  >
                    <Phone size={12} />
                    <span>Call Support</span>
                  </a>
                  <span className="text-stone-300">·</span>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 transition cursor-pointer"
                  >
                    <Share2 size={12} />
                    <span>Share</span>
                  </button>
                </div>

                {/* Clean Inline Highlights */}
                <div className="pt-4 border-t border-[#F0EAE1] grid grid-cols-3 gap-2 text-center text-[11px] text-stone-500 font-light">
                  <div className="flex items-center justify-center gap-1.5">
                    <Award size={13} className="text-[#C86B4C]" />
                    <span>100% Certified</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Truck size={13} className="text-[#C86B4C]" />
                    <span>Pan India Delivery</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Lock size={13} className="text-[#C86B4C]" />
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-10 border-t border-[#E8E2D8] mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-poppins font-normal text-gray-900">
                Customer Reviews
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                {avgRating > 0 ? `${avgRating.toFixed(1)} out of 5 (${reviews.length} reviews)` : "Verified customer feedback"}
              </p>
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
              className="px-4 py-2 bg-white hover:bg-[#FAF7F2] text-stone-800 border border-[#E8E2D8] hover:border-stone-400 rounded-md font-normal text-xs transition cursor-pointer"
            >
              Write a Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="py-8 text-center bg-white rounded-xl border border-[#E8E2D8]/60 p-6">
              <p className="text-xs text-stone-500 font-light">No reviews yet for this product. Be the first to review!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-white rounded-xl border border-[#E8E2D8]/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-900">{rev.name}</span>
                    <span className="text-[10px] text-stone-400 font-light">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-[#F4B740]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={11} className={s <= rev.rating ? "fill-current" : "text-stone-200"} />
                    ))}
                  </div>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-[#E8E2D8] mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-poppins font-normal text-gray-900">
                You May Also Like
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollRelated("left")}
                  className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 border border-[#E8E2D8] flex items-center justify-center text-stone-600 transition cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRelated("right")}
                  className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 border border-[#E8E2D8] flex items-center justify-center text-stone-600 transition cursor-pointer"
                  title="Next"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Carousel using canonical ProductCard */}
            <div 
              ref={relatedScrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
            >
              {relatedProducts.map((relProduct, idx) => (
                <div key={relProduct.id || idx} className="w-[220px] sm:w-[250px] shrink-0">
                  <ProductCard product={relProduct} index={idx} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Review Modal Form */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-[#E8E2D8]"
            >
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#C86B4C] uppercase block mb-1">
                Feedback
              </span>
              <h3 className="text-lg font-poppins font-normal text-gray-950 mb-1">Write your Review</h3>
              <p className="text-xs text-stone-500 mb-5 font-light">{product.title || product.name}</p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 border border-[#E8E2D8] rounded-lg text-xs focus:ring-1 focus:ring-[#C86B4C] focus:border-[#C86B4C] outline-none transition bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Your Rating</label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="text-[#F4B740] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Star
                          size={24}
                          className={star <= formRating ? "fill-[#F4B740] text-[#F4B740]" : "text-stone-300"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Review Comments</label>
                  <textarea
                    required
                    rows={3}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Describe your experience with this product..."
                    className="w-full px-3.5 py-2.5 border border-[#E8E2D8] rounded-lg text-xs focus:ring-1 focus:ring-[#C86B4C] focus:border-[#C86B4C] outline-none transition bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Add Photo (Optional)</label>
                  <div className="mt-1 flex flex-col items-center justify-center border border-dashed border-[#D9B4A4] rounded-xl p-3 bg-[#FAF7F2] relative cursor-pointer hover:bg-white transition">
                    {imagePreview ? (
                      <div className="relative w-full h-24 flex items-center justify-center">
                        <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setFormImage("");
                          }}
                          className="absolute top-0 right-0 bg-[#7D3219] text-white rounded-full p-1 shadow hover:bg-black transition cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-stone-400 mb-1" />
                        <span className="text-[11px] text-stone-500 font-medium">Select photo</span>
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
                  className="w-full py-2.5 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] font-medium rounded-md text-xs sm:text-[13px] tracking-wide transition shadow-xs cursor-pointer"
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
            className="fixed inset-0 bg-black/90 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setActiveLightboxImage(null)}
          >
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={activeLightboxImage}
              alt="Full scale view"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductDetail;
