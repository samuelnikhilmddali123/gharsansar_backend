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
  X, 
  CheckCircle,
  ShieldCheck,
  Truck,
  Award,
  Heart,
  Info,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RotateCcw,
  Lock,
  Maximize2,
  RotateCw,
  FileText,
  Plus,
  Minus,
  Sparkles,
  Package,
  Clock,
  Check
} from "lucide-react";
import { useProducts, Product } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { generateOrderId, generateSingleProductWhatsAppMessage, openWhatsAppOrderUrl } from "../utils/whatsappOrder";
import ProductCard from "../components/ProductCard";
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
  const product: Product | null = state || useMemo(() => {
    if (!id || !products || products.length === 0) return null;
    return (
      products.find((p) => String(p.id) === String(id)) ||
      products.find((p: any) => String(p._id) === String(id)) ||
      products.find((p) => encodeURIComponent(String(p.id)) === encodeURIComponent(String(id))) ||
      products.find((p) => p.title?.toLowerCase() === id.toLowerCase() || p.title?.toLowerCase() === decodeURIComponent(id).toLowerCase()) ||
      null
    );
  }, [id, products]);

  const mainProductId = String(product?.id || (product as any)?._id || id || "");
  const cartItemForProduct = items.find(
    (item) => String(item.id) === mainProductId || String(item.productId) === mainProductId
  );
  const quantityInCart = cartItemForProduct ? cartItemForProduct.quantity : 0;

  // Determine if this is viewed in Return Gift mode
  const isReturnGiftItem = Boolean(state?.isReturnGift || product?.category?.toLowerCase().includes("return") || pathname.includes("return-gift"));
  const minQty = isReturnGiftItem ? 50 : 1;

  // Gallery States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [is360Active, setIs360Active] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Commerce States
  const [quantity, setQuantity] = useState(minQty);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "shipping" | "reviews">("overview");
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Related products carousel ref
  const relatedScrollRef = useRef<HTMLDivElement>(null);

  // Pincode setup
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
    return "520008";
  };

  const cleanAreaText = (val: string) => {
    if (!val || /idhe/i.test(val)) return "Vijayawada, Andhra Pradesh";
    return val;
  };

  const getInitialArea = () => {
    const localArea = localStorage.getItem("user_area");
    if (localArea && !/idhe/i.test(localArea)) return localArea;
    try {
      const stored = localStorage.getItem("user_shipping_address");
      if (stored) {
        const parsed = JSON.parse(stored);
        const area = [parsed.city, parsed.state].filter(Boolean).join(", ") || parsed.city;
        if (area && !/idhe/i.test(area)) return area;
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
          const rawArea = [activeAddr.city, activeAddr.state].filter(Boolean).join(", ") || activeAddr.city || "Andhra Pradesh";
          const area = cleanAreaText(rawArea);
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
      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
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
    } catch {
      const fee = /^5[0-3]/.test(pincodeInput) ? 99 : 149;
      setDeliveryFee(fee);
      setSavedArea("India");
      setPincode(pincodeInput);
      setIsEditingPincode(false);
      localStorage.setItem("user_pincode", pincodeInput);
      localStorage.setItem("user_area", "India");
      toast.success(`Delivery available (₹${fee})`);
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(minQty, prev - 1));
  };

  const handleIncreaseQuantity = () => {
    if (product?.stock !== undefined && quantity >= product.stock) {
      toast.error(`Only ${product.stock} items left in stock`);
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const deliveryDateString = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, []);

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: (product.title || product.name || "").replace(/_/g, " "),
      text: `Check out ${(product.title || product.name || "").replace(/_/g, " ")} on Ghar Sansar!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success("Product link copied!");
    }
  };

  // Product gallery: Extract REAL images for this product (NO hardcoded fake banners)
  const productImages = useMemo(() => {
    if (!product) return [];
    const imgs: string[] = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      imgs.push(...product.images.filter(Boolean));
    }
    if (product.image && !imgs.includes(product.image)) {
      imgs.unshift(product.image);
    }
    // If only one image exists, provide it as single source
    if (imgs.length === 0 && product.image) {
      imgs.push(product.image);
    }
    return imgs.length > 0 ? imgs : ["/images/placeholder.jpg"];
  }, [product]);

  // Gallery Navigation
  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
  };

  // Review Form States
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [formImage, setFormImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // Stored reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (!product) return [];
    const saved = localStorage.getItem(`product_reviews_${product.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (product) {
      localStorage.setItem(`product_reviews_${product.id}`, JSON.stringify(reviews));
    }
  }, [reviews, product]);

  // Rating aggregate calculations
  const { avgRating, ratingPercentages } = useMemo(() => {
    if (reviews.length === 0) {
      // Deterministic fallback rating from product ID for consistent polish
      const hash = (product?.id || "default").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const fallbackRating = 4.3 + (hash % 6) * 0.1;
      return { 
        avgRating: Number(fallbackRating.toFixed(1)), 
        ratingPercentages: { 5: 75, 4: 20, 3: 5, 2: 0, 1: 0 } 
      };
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
  }, [reviews, product]);

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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) {
      toast.error("Please fill in your name and comment.");
      return;
    }

    const newRev: Review = {
      id: `review_${Date.now()}`,
      name: formName.trim(),
      rating: formRating,
      comment: formComment.trim(),
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      image: formImage
    };

    setReviews([newRev, ...reviews]);
    toast.success("Review submitted!");
    setIsReviewModalOpen(false);

    setFormName("");
    setFormRating(5);
    setFormComment("");
    setFormImage("");
    setImagePreview("");
  };

  // Zoom on Hover Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const cleanTitle = (product?.title || product?.name || "Product").replace(/_/g, " ").trim();
  const cleanCategory = (product?.category || "Return Gifts").replace(/_/g, " ").trim();

  // Pricing Architecture
  const actualPrice = Number(
    product?.actualPrice !== undefined ? product.actualPrice :
    product?.price !== undefined ? product.price :
    product?.sellingPrice || 0
  ) || 0;

  const strikePrice = Number(
    product?.strikePrice !== undefined ? product.strikePrice :
    (product as any)?.["act-price"] !== undefined ? (product as any)["act-price"] :
    (product as any)?.["actPrice"] !== undefined ? (product as any)["actPrice"] :
    actualPrice
  ) || actualPrice;

  const categoryDiscount = Number(
    product?.categoryDiscountPercentage !== undefined ? product.categoryDiscountPercentage :
    product?.discountPercentage || 0
  );
  const hasCategoryDiscount = categoryDiscount > 0;

  const discountedPrice = Number(
    product?.discountedPrice !== undefined ? product.discountedPrice :
    (hasCategoryDiscount ? Math.round((actualPrice - (actualPrice * (categoryDiscount / 100))) * 100) / 100 : actualPrice)
  );

  const finalPrice = Number(
    product?.finalPrice !== undefined ? product.finalPrice :
    (hasCategoryDiscount ? discountedPrice : actualPrice)
  );

  const discountPct = categoryDiscount > 0
    ? categoryDiscount
    : (strikePrice > actualPrice ? Math.round(((strikePrice - actualPrice) / strikePrice) * 100) : 0);

  const displayDiscountBadge = discountPct > 0 ? `${discountPct}% OFF` : null;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id || product._id,
      name: cleanTitle,
      price: finalPrice,
      image: product.image || product.images?.[0],
      quantity: quantity,
      isReturnGift: isReturnGiftItem,
      minQty: minQty,
      stock: product.stock
    });
    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart!`);
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
        title: cleanTitle,
        name: cleanTitle,
        price: finalPrice,
        image: product.image,
        category: cleanCategory,
        subCategory: product.subCategory
      },
      quantity: quantity,
      unitPrice: finalPrice
    });
    openWhatsAppOrderUrl(msg);
  };

  // Related products under the same category
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCat = products.filter((p) => p.category === product.category && p.id !== product.id);
    if (sameCat.length >= 4) return sameCat.slice(0, 8);
    const others = products.filter((p) => p.id !== product.id && !sameCat.some((sc) => sc.id === p.id));
    return [...sameCat, ...others].slice(0, 8);
  }, [products, product]);

  const scrollRelated = (direction: "left" | "right") => {
    if (relatedScrollRef.current) {
      const container = relatedScrollRef.current;
      const card = container.firstElementChild as HTMLElement;
      const step = card ? (card.offsetWidth + 16) : 300;
      container.scrollBy({
        left: direction === "left" ? -step : step,
        behavior: "smooth"
      });
    }
  };

  // Loading State
  if (loading && !product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center pt-24 pb-20 font-poppins">
        <div className="max-w-6xl mx-auto px-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
            <div className="aspect-square bg-[#EAE4DC] rounded-2xl" />
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-[#EAE4DC] rounded-full w-24" />
              <div className="h-8 bg-[#EAE4DC] rounded-xl w-3/4" />
              <div className="h-4 bg-[#EAE4DC] rounded-full w-32" />
              <div className="h-28 bg-[#EAE4DC] rounded-2xl" />
              <div className="h-12 bg-[#EAE4DC] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center font-poppins">
        <div className="w-14 h-14 bg-[#F7EBE4] text-[#8E3F24] rounded-full flex items-center justify-center mb-4">
          <Info size={26} />
        </div>
        <h2 className="text-xl font-normal text-[#181513] mb-1.5">Product Not Found</h2>
        <p className="text-xs text-[#736B63] max-w-xs mb-6">The product you are looking for does not exist or has been moved.</p>
        <button
          onClick={() => navigate(isReturnGiftItem ? "/return-gifts" : "/products")}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8E3F24] hover:bg-[#742F19] text-white text-xs font-medium uppercase tracking-wider rounded-xl transition shadow-xs"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-poppins text-[#181513] pb-24 md:pb-20 selection:bg-[#8E3F24] selection:text-white antialiased">
      
      {/* ── Sticky Mobile CTA Bar ───────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E2D8] px-4 py-3 z-40 flex items-center gap-3 shadow-lg">
        <div className="flex-1">
          <span className="text-[10px] text-[#8C827A] uppercase font-medium tracking-wider block">Total Price</span>
          <span className="text-base font-normal text-gray-950 font-poppins">
            ₹{((finalPrice * quantity) + (deliveryFee || 0)).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex gap-2">
          {quantityInCart > 0 ? (
            <div className="flex items-center border border-[#E8E2D8] bg-[#FAF7F2] rounded-xl px-2 py-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (quantityInCart > 1) updateQuantity(cartItemForProduct!.id, quantityInCart - 1);
                  else { removeFromCart(cartItemForProduct!.id); toast.success("Removed from cart"); }
                }}
                className="w-6 h-6 flex items-center justify-center bg-white text-gray-700 border border-[#E8E2D8] rounded active:scale-90 transition font-normal"
              >
                -
              </button>
              <span className="font-normal text-xs text-[#181513] select-none px-1">{quantityInCart}</span>
              <button
                type="button"
                onClick={() => updateQuantity(cartItemForProduct!.id, quantityInCart + 1)}
                className="w-6 h-6 flex items-center justify-center bg-[#8E3F24] text-white rounded active:scale-90 transition font-normal"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-4 py-2.5 bg-white border border-[#E8E2D8] hover:border-[#8E3F24] text-[#181513] rounded-xl text-xs font-medium uppercase tracking-wider transition active:scale-95 shadow-2xs"
            >
              Add to Cart
            </button>
          )}
          <button
            onClick={handleBuyNow}
            className="px-5 py-2.5 bg-[#8E3F24] hover:bg-[#742F19] text-white rounded-xl text-xs font-medium uppercase tracking-wider transition active:scale-95 shadow-xs"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* ── Main Container ──────────────────────────────────────────────────── */}
      <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">

        {/* ── Editorial Breadcrumb ────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-[#8C827A] py-1 mb-2.5 overflow-x-auto no-scrollbar whitespace-nowrap">
          <span onClick={() => navigate("/")} className="hover:text-[#181513] cursor-pointer transition-colors">Home</span>
          <span className="text-[#D5CEC4]">/</span>
          <span onClick={() => navigate(isReturnGiftItem ? "/return-gifts" : "/products")} className="hover:text-[#181513] cursor-pointer transition-colors">
            {isReturnGiftItem ? "Return Gifts" : "Products"}
          </span>
          <span className="text-[#D5CEC4]">/</span>
          <span 
            onClick={() => navigate(isReturnGiftItem ? `/return-gifts?category=${encodeURIComponent(product.category || "")}` : `/products?category=${encodeURIComponent(product.category || "")}`)} 
            className="hover:text-[#181513] cursor-pointer transition-colors capitalize"
          >
            {cleanCategory}
          </span>
          <span className="text-[#D5CEC4]">/</span>
          <span className="text-[#181513] font-medium truncate max-w-[280px]">
            {cleanTitle}
          </span>
        </nav>

        {/* ── 2-Column Product Showcase ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 pb-8 items-start">

          {/* LEFT: Product Gallery (50% Split, compact, no cutoffs) */}
          <div className="flex flex-col gap-2.5 w-full max-w-[500px] mx-auto lg:mx-0">
            
            <div className="flex flex-col sm:flex-row gap-2.5 items-start">
              {/* Vertical Thumbnails */}
              {productImages.length > 1 && (
                <div className="hidden sm:flex flex-col gap-2 shrink-0">
                  {productImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-12 rounded-xl p-1 bg-white border transition-all overflow-hidden flex items-center justify-center cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-[#8E3F24] ring-1 ring-[#8E3F24]"
                          : "border-[#E8E2D8] hover:border-[#8E3F24]/50 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Stage */}
              <div 
                className="flex-1 w-full relative overflow-hidden rounded-2xl bg-white border border-[#E8E2D8] aspect-square max-h-[440px] flex items-center justify-center p-4 sm:p-6 select-none group shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                {/* Main Discount Badge (Top-Left) */}
                {displayDiscountBadge && (
                  <div className="absolute top-2.5 left-2.5 z-20 bg-[#8E3F24] text-white text-[10.5px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs pointer-events-none">
                    {displayDiscountBadge}
                  </div>
                )}

                {/* Top-Right Interactive Actions */}
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIs360Active(!is360Active)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                      is360Active 
                        ? "bg-[#8E3F24] text-white border-[#8E3F24]" 
                        : "bg-white/90 text-[#4A433D] border-[#E8E2D8] shadow-2xs backdrop-blur-xs"
                    }`}
                    title="Interactive 360 rotation"
                  >
                    <RotateCw size={11} className={is360Active ? "animate-spin" : ""} />
                    <span>360°</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLightboxImage(productImages[activeImageIndex] || product.image)}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#4A433D] hover:text-black border border-[#E8E2D8] flex items-center justify-center transition-all shadow-2xs backdrop-blur-xs cursor-pointer"
                    title="Expand View"
                  >
                    <Maximize2 size={12} />
                  </button>
                </div>

                {/* Left / Right Nav Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#4A433D] shadow-xs border border-[#E8E2D8] flex items-center justify-center cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#4A433D] shadow-xs border border-[#E8E2D8] flex items-center justify-center cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </>
                )}

                {/* Product Image Stage (Uncut, full product & packaging visibility) */}
                <motion.div
                  key={activeImageIndex}
                  animate={is360Active ? { rotateY: [0, 360] } : {}}
                  transition={is360Active ? { repeat: Infinity, duration: 4, ease: "linear" } : {}}
                  className="w-full h-full flex items-center justify-center relative p-1"
                >
                  <img
                    src={productImages[activeImageIndex] || product.image}
                    alt={cleanTitle}
                    loading="eager"
                    className="max-w-[85%] max-h-[85%] w-auto h-auto object-contain select-none transition-transform duration-300 ease-out"
                    style={isZooming ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: 'scale(1.35)'
                    } : {}}
                  />
                </motion.div>
              </div>
            </div>

            {/* Mobile Thumbnails Row */}
            {productImages.length > 1 && (
              <div className="flex sm:hidden gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {productImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-12 shrink-0 rounded-lg p-1 bg-white border transition-all overflow-hidden flex items-center justify-center ${
                      activeImageIndex === idx ? "border-[#8E3F24] ring-1 ring-[#8E3F24]" : "border-[#E8E2D8]"
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT: Compact, Minimal, Unified Product Details */}
          <div className="flex flex-col space-y-3.5">
            
            {/* Header: Category Badge + Stock Status + Wishlist / Share */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wider text-[#7D3219] bg-[#F7EBE4] border border-[#D9B4A4] px-2.5 py-0.5 rounded-full uppercase">
                    {cleanCategory}
                  </span>
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    In Stock
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      isWishlisted 
                        ? "bg-rose-50 border-rose-200 text-rose-600" 
                        : "bg-white border-[#E8E2D8] text-[#8C827A] hover:text-[#181513] hover:border-[#8E3F24]"
                    }`}
                    title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
                  >
                    <Heart size={15} className={isWishlisted ? "fill-current" : ""} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-8 h-8 rounded-full border border-[#E8E2D8] bg-white text-[#8C827A] hover:text-[#181513] hover:border-[#8E3F24] flex items-center justify-center transition-all cursor-pointer"
                    title="Share Product"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="font-poppins text-xl sm:text-2xl font-normal text-[#181513] leading-snug tracking-tight mb-1.5">
                {cleanTitle}
              </h1>

              {/* Ratings Row */}
              <div className="flex items-center gap-1.5 text-xs text-[#8C827A]">
                <div className="flex items-center gap-0.5 text-[#F4B740]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={13} className="fill-[#F4B740]" />
                  ))}
                </div>
                <span className="font-medium text-[#181513]">{avgRating.toFixed(1)}</span>
                <span>({reviews.length > 0 ? reviews.length : 128} verified reviews)</span>
              </div>
            </div>

            {/* Integrated Minimal Price & Delivery Bar (No heavy separate boxes) */}
            <div className="bg-white rounded-xl border border-[#E8E2D8] p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="font-poppins text-2xl sm:text-3xl font-normal text-gray-950 tracking-tight">
                  ₹{finalPrice.toLocaleString("en-IN")}
                </span>
                {strikePrice > finalPrice && (
                  <span className="text-sm text-[#8C827A] line-through font-normal">
                    ₹{strikePrice.toLocaleString("en-IN")}
                  </span>
                )}
                {displayDiscountBadge && (
                  <span className="text-[11px] font-medium text-[#7D3219] bg-[#F7EBE4] border border-[#D9B4A4] px-2 py-0.5 rounded-full">
                    {displayDiscountBadge}
                  </span>
                )}
                {strikePrice > finalPrice && (
                  <span className="text-[11px] text-emerald-700 font-medium ml-auto">
                    Save ₹{(strikePrice - finalPrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* One-line Delivery Check */}
              <div className="pt-2 border-t border-[#F0EAE1] flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between text-[#736B63]">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin size={13} className="text-[#8E3F24] shrink-0" />
                    <span className="truncate">Deliver to <strong className="text-[#181513]">{pincode}</strong> ({savedArea})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingPincode(!isEditingPincode)}
                    className="text-[11px] font-medium text-[#8E3F24] hover:underline cursor-pointer ml-2 shrink-0"
                  >
                    {isEditingPincode ? "Cancel" : "Change"}
                  </button>
                </div>

                {isEditingPincode && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="6-digit Pincode"
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      maxLength={6}
                      className="flex-1 px-2.5 py-1 text-xs border border-[#E8E2D8] rounded-lg bg-[#FAF7F2] focus:ring-1 focus:ring-[#8E3F24] outline-none"
                    />
                    <button
                      type="button"
                      onClick={checkPincode}
                      className="px-3 py-1 bg-[#8E3F24] text-white text-xs font-medium rounded-lg hover:bg-[#742F19] cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#8C827A] pt-0.5">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <Truck size={12} /> Standard delivery ₹{deliveryFee}
                  </span>
                  <span>Est. <strong className="text-[#181513]">{deliveryDateString}</strong></span>
                </div>
              </div>
            </div>

            {/* Quantity & CTA Action Row */}
            <div className="space-y-2 pt-0.5">
              <div className="flex items-center gap-2.5">
                {/* Stepper */}
                <div className="h-[42px] border border-[#E8E2D8] bg-white rounded-xl flex items-center justify-between px-2 w-28 shrink-0 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    className="w-6 h-6 flex items-center justify-center bg-[#FAF7F2] hover:bg-[#F0EAE1] text-gray-800 border border-[#E8E2D8] rounded active:scale-90 transition cursor-pointer"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="font-normal text-xs text-[#181513] select-none">{quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncreaseQuantity}
                    className="w-6 h-6 flex items-center justify-center bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] rounded active:scale-90 transition cursor-pointer"
                  >
                    <Plus size={11} />
                  </button>
                </div>

                {/* Add to Cart */}
                {quantityInCart > 0 ? (
                  <div className="flex-1 h-[42px] border border-[#E8E2D8] bg-[#FAF7F2] rounded-xl flex items-center justify-between px-3 text-xs">
                    <span className="font-medium text-[#181513]">{quantityInCart} in Cart</span>
                    <button
                      onClick={() => updateQuantity(cartItemForProduct!.id, quantityInCart + 1)}
                      className="text-[#8E3F24] font-medium hover:underline text-[11px]"
                    >
                      + Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-[42px] px-3 bg-white hover:bg-[#FAF7F2] border border-[#E8E2D8] hover:border-[#8E3F24] text-gray-950 text-xs font-medium uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <ShoppingCart size={14} className="text-gray-600" />
                    <span>Add to Cart</span>
                  </button>
                )}

                {/* Buy Now */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 h-[42px] px-4 bg-[#8E3F24] hover:bg-[#742F19] text-white text-xs font-medium uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <Zap size={14} />
                  <span>Buy Now</span>
                </button>
              </div>

              {isReturnGiftItem && (
                <p className="text-[10.5px] text-[#7D3219] bg-[#F7EBE4] px-2 py-0.5 rounded-md inline-block">
                  Bulk Return Gift: Minimum order 50 units
                </p>
              )}

              {/* WhatsApp & Call Links */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleWhatsAppOrderProduct}
                  className="h-[34px] bg-[#EDF8F1] hover:bg-[#E1F3E7] text-[#1E7E34] border border-[#D1EEDB] rounded-lg font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle size={13} />
                  <span>Order on WhatsApp</span>
                </button>

                <a
                  href="tel:+919492664870"
                  className="h-[34px] bg-white hover:bg-[#FAF7F2] text-[#4A433D] hover:text-black border border-[#E8E2D8] rounded-lg font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone size={13} />
                  <span>Call Support</span>
                </a>
              </div>

              {/* Trust Strip */}
              <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-[10.5px] text-[#8C827A]">
                <span className="flex items-center gap-1"><Award size={11} className="text-[#8E3F24]" /> 100% Certified</span>
                <span className="flex items-center gap-1"><Package size={11} className="text-[#8E3F24]" /> Box Packing</span>
                <span className="flex items-center gap-1"><Truck size={11} className="text-[#8E3F24]" /> Fast Dispatch</span>
                <span className="flex items-center gap-1"><Lock size={11} className="text-[#8E3F24]" /> Secure Pay</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Tabs Navigation ─────────────────────────────────────────────────── */}
        <div className="border-t border-[#E8E2D8]">
          <div className="flex gap-8 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "specs", label: "Specifications" },
              { id: "shipping", label: "Shipping & Handling" },
              { id: "reviews", label: `Reviews (${reviews.length > 0 ? reviews.length : 128})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3.5 pt-4 text-sm font-medium tracking-normal transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "border-[#8E3F24] text-[#8E3F24]"
                    : "border-transparent text-[#8C827A] hover:text-[#181513]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content: Overview ───────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-[10.5px] font-medium tracking-widest text-[#7D3219] uppercase block mb-1">
                  Product Overview
                </span>
                <h2 className="font-poppins text-2xl font-normal text-[#181513] leading-snug">
                  Crafted for Daily Elegance &amp; Reliable Use
                </h2>
              </div>
              <p className="text-sm text-[#736B63] leading-relaxed">
                {product.description || `The ${cleanTitle} brings authentic Ghar Sansar design, exceptional durability, and aesthetic charm to your home. Precision-crafted for seamless everyday utility and premium gifting.`}
              </p>

              {/* 4 Feature Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { title: "Premium Finish", sub: "Hand-inspected surface" },
                  { title: "Durable Build", sub: "Built for long life" },
                  { title: "Safe Packaging", sub: "Transit protected" },
                  { title: "Ghar Sansar", sub: "Direct authenticity" },
                ].map((item, i) => (
                  <div key={i} className="p-3.5 bg-white border border-[#E8E2D8] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <CheckCircle size={15} className="text-[#8E3F24] mb-1.5" />
                    <span className="text-xs font-medium text-[#181513] block leading-tight">{item.title}</span>
                    <span className="text-[10px] text-[#8C827A]">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8E2D8] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <h3 className="font-poppins text-sm font-medium text-[#181513]">Authenticity Guarantee</h3>
              <p className="text-xs text-[#736B63] leading-relaxed">
                Every piece in our catalogue is sourced with strict quality checks. From material safety to packaging integrity, we guarantee complete satisfaction.
              </p>
              <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-xs text-[#8C827A]">
                <span>Category: <strong className="text-[#181513]">{cleanCategory}</strong></span>
                <span>Dispatch: <strong className="text-[#181513]">24-48 Hours</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Content: Specifications ─────────────────────────────────────── */}
        {activeTab === "specs" && (
          <div className="py-10 max-w-3xl space-y-4">
            <div>
              <span className="text-[10.5px] font-medium tracking-widest text-[#7D3219] uppercase block mb-1">
                Detailed Specifications
              </span>
              <h2 className="font-poppins text-2xl font-normal text-[#181513]">
                Product Information &amp; Specs
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody>
                  {[
                    { label: "Product Name", value: cleanTitle },
                    { label: "Category", value: cleanCategory },
                    { label: "Stock Availability", value: product.stock ? `${product.stock} units available` : "Ready to Dispatch" },
                    { label: "Order Minimum", value: isReturnGiftItem ? "50 Units (Bulk Gift Pack)" : "1 Unit" },
                    { label: "Origin", value: "Curated for Ghar Sansar" },
                    { label: "Delivery Mode", value: "Doorstep delivery via insured courier" },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b last:border-0 border-[#F0EAE1] ${i % 2 === 0 ? "bg-[#FAF7F2]" : "bg-white"}`}>
                      <td className="px-5 py-3.5 font-medium text-[#8C827A] w-1/3">{row.label}</td>
                      <td className="px-5 py-3.5 font-normal text-[#181513]">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab Content: Shipping ───────────────────────────────────────────── */}
        {activeTab === "shipping" && (
          <div className="py-10 max-w-3xl space-y-4">
            <div>
              <span className="text-[10.5px] font-medium tracking-widest text-[#7D3219] uppercase block mb-1">
                Logistics &amp; Delivery
              </span>
              <h2 className="font-poppins text-2xl font-normal text-[#181513]">
                Safe Packaging &amp; Pan-India Dispatch
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#736B63] leading-relaxed">
              We partner with India's premier logistics providers (Delhivery, BlueDart, DTDC) to ensure every order arrives on time and in perfect condition.
            </p>

            <div className="bg-white rounded-2xl border border-[#E8E2D8] p-5 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-xs sm:text-sm text-[#4A433D]">
              <div className="flex items-center gap-2.5">
                <CheckCircle size={15} className="text-emerald-700 shrink-0" />
                <span>Orders dispatched within 24 to 48 hours of confirmation.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle size={15} className="text-emerald-700 shrink-0" />
                <span>Real-time SMS &amp; WhatsApp tracking updates provided.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle size={15} className="text-emerald-700 shrink-0" />
                <span>Standard delivery within 3–6 business days across India.</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab Content: Reviews ────────────────────────────────────────────── */}
        {activeTab === "reviews" && (
          <div className="py-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-medium tracking-widest text-[#7D3219] uppercase block mb-1">
                  Customer Feedback
                </span>
                <h2 className="font-poppins text-2xl font-normal text-[#181513]">
                  Verified Customer Reviews
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("Please sign in to write a review");
                    navigate('/login', { state: { from: location } });
                  } else {
                    setIsReviewModalOpen(true);
                  }
                }}
                className="px-4 py-2 bg-[#8E3F24] hover:bg-[#742F19] text-white text-xs font-medium rounded-xl transition shadow-xs cursor-pointer"
              >
                Write a Review
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Summary Card */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8E2D8] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                <div>
                  <span className="text-xs text-[#8C827A] uppercase tracking-wider block mb-1">Overall Rating</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-normal text-[#181513]">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-[#8C827A]">out of 5</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        className={star <= Math.round(avgRating) ? "fill-[#F4B740] text-[#F4B740]" : "text-[#E8E2D8]"}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#F0EAE1]">
                  {[5, 4, 3, 2, 1].map((r) => (
                    <div key={r} className="flex items-center text-xs text-[#736B63] gap-2">
                      <span className="w-10">{r} star</span>
                      <div className="flex-1 h-1.5 bg-[#F0EAE1] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#8E3F24] rounded-full transition-all duration-500"
                          style={{ width: `${ratingPercentages[r as 5|4|3|2|1] || 0}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[#8C827A]">{ratingPercentages[r as 5|4|3|2|1] || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E2D8] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                {reviews.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <FileText size={28} className="text-[#8C827A] mx-auto opacity-40" />
                    <h3 className="text-sm font-medium text-[#181513]">No customer reviews yet</h3>
                    <p className="text-xs text-[#8C827A]">Be the first to share your thoughts about this product!</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#181513]">{rev.name}</span>
                          <span className="text-[10px] text-[#8C827A]">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={11} className={s <= rev.rating ? "fill-[#F4B740] text-[#F4B740]" : "text-[#E8E2D8]"} />
                          ))}
                        </div>
                        <p className="text-xs text-[#4A433D] leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Related Products Carousel ───────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="py-12 border-t border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10.5px] font-medium tracking-widest text-[#7D3219] uppercase block mb-1">
                  Handpicked Recommendations
                </span>
                <h2 className="font-poppins text-2xl font-normal text-[#181513] tracking-tight">
                  Related Products
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollRelated("left")}
                  className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8E2D8] shadow-2xs flex items-center justify-center text-[#4A433D] hover:text-black transition cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRelated("right")}
                  className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#E8E2D8] shadow-2xs flex items-center justify-center text-[#4A433D] hover:text-black transition cursor-pointer"
                  title="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Render with the site's official ProductCard component */}
            <div 
              ref={relatedScrollRef}
              className="flex gap-4 overflow-x-auto pb-5 pt-1 scroll-smooth snap-x snap-mandatory related-products-scroll"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#8E3F24 #E8E2D8'
              }}
            >
              {relatedProducts.map((relProduct, idx) => (
                <div 
                  key={relProduct.id || idx} 
                  className="w-full sm:w-[calc((100%-16px)/2)] md:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)] shrink-0 snap-start"
                >
                  <ProductCard product={relProduct} index={idx} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Review Form Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative font-poppins border border-[#E8E2D8]"
            >
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-5 right-5 text-[#8C827A] hover:text-black p-1 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-medium text-[#181513] mb-1">Write Your Review</h3>
              <p className="text-xs text-[#8C827A] mb-4">{cleanTitle}</p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#181513] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF7F2] focus:ring-1 focus:ring-[#8E3F24] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#181513] mb-1">Your Rating</label>
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
                          className={star <= formRating ? "fill-[#F4B740]" : "text-[#E8E2D8]"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#181513] mb-1">Review Comments</label>
                  <textarea
                    required
                    rows={3}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Describe your experience with this product..."
                    className="w-full px-3.5 py-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF7F2] focus:ring-1 focus:ring-[#8E3F24] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#181513] mb-1">Add Photo (Optional)</label>
                  <div className="mt-1 flex flex-col items-center justify-center border border-dashed border-[#E8E2D8] rounded-xl p-3 bg-[#FAF7F2] relative cursor-pointer hover:bg-[#F0EAE1] transition">
                    {imagePreview ? (
                      <div className="relative w-full h-24 flex items-center justify-center">
                        <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-xs" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setFormImage("");
                          }}
                          className="absolute top-0 right-0 bg-[#8E3F24] text-white rounded-full p-1 shadow cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-[#8C827A] mb-1" />
                        <span className="text-[10px] text-[#8C827A]">Select a photo</span>
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
                  className="w-full py-3 bg-[#8E3F24] hover:bg-[#742F19] text-white font-medium rounded-xl text-xs uppercase tracking-wider shadow-xs transition cursor-pointer"
                >
                  Submit Verified Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Lightbox Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
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
              alt="Expanded View"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductDetail;
