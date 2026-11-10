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
  CreditCard,
  Heart,
  Info,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [is360Active, setIs360Active] = useState(false);
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
    return "520008";
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

  // Size & Color selection states
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

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

  // Product images gallery
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
    const catDisc = Number(product.categoryDiscountPercentage || product.discountPercentage || 0);
    const actP = Number(product.actualPrice !== undefined ? product.actualPrice : (product.price || 0)) || 0;
    const discP = Number(product.discountedPrice !== undefined ? product.discountedPrice : (catDisc > 0 ? Math.round((actP - (actP * (catDisc / 100))) * 100) / 100 : actP));
    const effectivePrice = Number(product.finalPrice !== undefined ? product.finalPrice : (catDisc > 0 ? discP : actP));

    addToCart({
      id: product.id || product._id,
      name: product.title || product.name,
      price: effectivePrice,
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
      selectedSize: selectedSize,
      selectedColor: selectedColor
    });
    openWhatsAppOrderUrl(msg);
  };

  // Related products under the same category
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

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading && !product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-[#EDE8E0] rounded-lg" />
            <div className="space-y-5 pt-4">
              <div className="h-4 bg-[#EDE8E0] rounded w-1/4" />
              <div className="h-8 bg-[#EDE8E0] rounded w-3/4" />
              <div className="h-4 bg-[#EDE8E0] rounded w-1/2" />
              <div className="h-24 bg-[#EDE8E0] rounded" />
              <div className="h-12 bg-[#EDE8E0] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not Found State ────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 bg-[#EDE8E0] text-[#9A7B66] rounded-full flex items-center justify-center mb-5">
          <Info size={26} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-gray-500 max-w-xs mb-6">The product you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate(state?.isReturnGift ? "/return-gifts" : "/products")}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0F2920] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#1a3d2f] transition"
        >
          <ArrowLeft size={15} /> Back to Catalog
        </button>
      </div>
    );
  }

  // ── Pricing Architecture ───────────────────────────────────────────────────
  const actualPrice = Number(
    product.actualPrice !== undefined ? product.actualPrice :
    product.price !== undefined ? product.price :
    product.sellingPrice || 0
  ) || 0;

  const strikePrice = Number(
    product.strikePrice !== undefined ? product.strikePrice :
    (product as any)["act-price"] !== undefined ? (product as any)["act-price"] :
    actualPrice
  ) || actualPrice;

  const categoryDiscount = Number(
    product.categoryDiscountPercentage !== undefined ? product.categoryDiscountPercentage :
    product.discountPercentage || 0
  );
  const hasCategoryDiscount = categoryDiscount > 0;

  const categoryDiscountAmount = strikePrice > 0 && hasCategoryDiscount
    ? Math.round(strikePrice * (categoryDiscount / 100))
    : 0;

  const discountedPrice = Number(
    product.discountedPrice !== undefined ? product.discountedPrice :
    (hasCategoryDiscount ? Math.round((actualPrice - (actualPrice * (categoryDiscount / 100))) * 100) / 100 : actualPrice)
  );

  const finalPrice = Number(
    product.finalPrice !== undefined ? product.finalPrice :
    (hasCategoryDiscount ? discountedPrice : actualPrice)
  );

  const currentDifference = Math.max(0, strikePrice - finalPrice);

  const displayDiscountBadge = categoryDiscount > 0
    ? `${categoryDiscount}% OFF`
    : (strikePrice > actualPrice ? `${Math.round(((strikePrice - actualPrice) / strikePrice) * 100)}% OFF` : null);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 md:pb-16 font-sans relative overflow-x-hidden">

      {/* ── Sticky Mobile CTA Bar ───────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E2D8] px-4 py-3 z-40 flex items-center gap-3 shadow-lg">
        <div className="flex-1">
          <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider block">Total</span>
          <span className="text-base font-bold text-gray-900">₹{((finalPrice * quantity) + (deliveryFee || 0)).toLocaleString("en-IN")}</span>
        </div>
        <div className="flex gap-2">
          {quantityInCart > 0 ? (
            <div className="flex items-center border border-[#0F2920] bg-[#EDF4F0] rounded-lg px-2 py-1.5 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (quantityInCart > 1) updateQuantity(cartItemForProduct!.id, quantityInCart - 1);
                  else { removeFromCart(cartItemForProduct!.id); toast.success("Removed from cart"); }
                }}
                className="w-6 h-6 flex items-center justify-center bg-white text-gray-700 border border-[#C4D6CC] rounded font-bold text-sm active:scale-90 transition"
              >-</button>
              <span className="font-bold text-xs text-[#0F2920] select-none">{quantityInCart}</span>
              <button
                type="button"
                onClick={() => updateQuantity(cartItemForProduct!.id, quantityInCart + 1)}
                className="w-6 h-6 flex items-center justify-center bg-[#0F2920] text-white rounded font-bold text-sm active:scale-90 transition"
              >+</button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-4 py-2.5 bg-white border border-[#0F2920] text-[#0F2920] rounded-lg font-bold text-xs uppercase tracking-wider transition active:scale-95"
            >
              Add to Cart
            </button>
          )}
          <button
            onClick={handleBuyNow}
            className="px-5 py-2.5 bg-[#0F2920] hover:bg-[#1a3d2f] text-white rounded-lg font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* ── Main Container ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 py-4 font-medium">
          <span className="cursor-pointer hover:text-gray-700 transition" onClick={() => navigate("/")}>Home</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-gray-700 transition" onClick={() => navigate(state?.isReturnGift ? "/return-gifts" : "/products")}>
            {state?.isReturnGift ? "Return Gifts" : "Shop"}
          </span>
          <span>/</span>
          <span className="cursor-pointer hover:text-gray-700 transition" onClick={() => navigate(state?.isReturnGift ? `/return-gifts?category=${product.category}` : `/products?category=${product.category}`)}>
            {product.category || "All Products"}
          </span>
          <span>/</span>
          <span className="text-gray-700 font-semibold truncate max-w-[200px]">{product.title || product.name}</span>
        </nav>

        {/* ── Product Main Section (2-col grid) ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 pb-10">

          {/* LEFT: Image Gallery */}
          <div className="flex flex-col gap-3">

            {/* Main Image + Vertical Thumbnails */}
            <div className="flex gap-3">
              {/* Vertical Thumbnails – desktop only */}
              <div className="hidden sm:flex flex-col gap-2">
                {productImages.slice(0, 5).map((imgObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectThumbnail(idx)}
                    className={`w-14 h-14 rounded-lg p-1 bg-white border-2 transition-all overflow-hidden flex items-center justify-center ${
                      activeImageIndex === idx && !isVideoActive
                        ? "border-[#0F2920]"
                        : "border-[#E8E2D8] hover:border-[#C4B9A8]"
                    }`}
                  >
                    <img
                      src={imgObj.url}
                      alt={`View ${idx + 1}`}
                      className={`w-full h-full object-contain ${imgObj.transformClass || ""}`}
                    />
                  </button>
                ))}
                <button
                  onClick={() => handleSelectThumbnail((activeImageIndex + 1) % productImages.length)}
                  className="w-14 h-7 rounded bg-white border border-[#E8E2D8] hover:bg-[#F5F1EC] flex items-center justify-center text-gray-400 transition"
                >
                  <ChevronDown size={15} />
                </button>
              </div>

              {/* Main Image Stage */}
              <div
                className="flex-1 relative overflow-hidden rounded-xl bg-white border border-[#E8E2D8] aspect-square flex items-center justify-center p-6 sm:p-10 select-none group cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => !isVideoActive && setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                {/* Controls top-right */}
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                  <button
                    onClick={() => setIs360Active(!is360Active)}
                    className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 transition ${
                      is360Active
                        ? "bg-[#0F2920] text-white border-[#0F2920]"
                        : "bg-white/80 text-gray-600 border-[#E8E2D8] hover:border-[#C4B9A8] backdrop-blur-sm"
                    }`}
                  >
                    <RotateCw size={11} className={is360Active ? "animate-spin" : ""} />
                    360°
                  </button>
                  <button
                    onClick={() => setActiveLightboxImage(productImages[activeImageIndex]?.url || product.image)}
                    className="p-1.5 rounded bg-white/80 hover:bg-white text-gray-500 border border-[#E8E2D8] transition backdrop-blur-sm"
                  >
                    <Maximize2 size={12} />
                  </button>
                </div>

                {/* Nav Arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-600 shadow-sm border border-[#E8E2D8] flex items-center justify-center transition active:scale-95"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-600 shadow-sm border border-[#E8E2D8] flex items-center justify-center transition active:scale-95"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Discount Badge on image */}
                {displayDiscountBadge && (
                  <div className="absolute top-3 left-3 z-20 bg-[#C57053] text-white text-[10px] font-bold px-2 py-1 rounded">
                    {displayDiscountBadge}
                  </div>
                )}

                {/* Media Content */}
                {isVideoActive ? (
                  <div className="w-full h-full rounded overflow-hidden flex items-center justify-center bg-black/5">
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
                    className="w-full h-full flex items-center justify-center relative"
                  >
                    <StudioImage
                      src={productImages[activeImageIndex]?.url || product.image}
                      alt={product.title}
                      loading="eager"
                      className={`max-w-full max-h-full transition-transform duration-200 ${productImages[activeImageIndex]?.transformClass || "object-contain"}`}
                      style={isZooming ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transform: 'scale(1.75)'
                      } : {}}
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Horizontal Thumbnail Row */}
            <div className="grid grid-cols-6 gap-2">
              {productImages.map((imgObj, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectThumbnail(idx)}
                  className={`aspect-square rounded-lg p-1 bg-white border-2 transition-all overflow-hidden relative flex items-center justify-center ${
                    activeImageIndex === idx
                      ? "border-[#0F2920]"
                      : "border-[#E8E2D8] hover:border-[#C4B9A8]"
                  }`}
                >
                  <img
                    src={imgObj.url}
                    alt={imgObj.label}
                    className={`w-full h-full object-contain ${imgObj.transformClass || ""}`}
                  />
                  {imgObj.isVideo && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
                      <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                        <Play size={9} className="ml-0.5 fill-current text-gray-800" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col gap-5">

            {/* Category + Status + Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-widest text-[#9A7B66] bg-[#F5EFE6] px-2.5 py-1 rounded-full uppercase">
                  {product.category || "Home Decor"}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping inline-block"></span>
                  In Stock
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { if (product) toggleWishlist(product); }}
                  className={`p-2 rounded-lg border transition ${
                    isWishlisted ? "bg-red-50 text-red-500 border-red-200" : "bg-white text-gray-400 hover:text-gray-600 border-[#E8E2D8]"
                  }`}
                >
                  <Heart size={16} className={isWishlisted ? "fill-current" : ""} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg border border-[#E8E2D8] bg-white text-gray-400 hover:text-gray-600 transition"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug tracking-tight">
                {product.title || product.name}
              </h1>

              {/* Star Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700">{avgRating > 0 ? avgRating.toFixed(1) : "New"}</span>
                <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-b border-[#E8E2D8] py-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                  ₹{finalPrice.toLocaleString("en-IN")}
                </span>
                {strikePrice > finalPrice && (
                  <span className="text-base text-gray-400 line-through font-normal">
                    ₹{strikePrice.toLocaleString("en-IN")}
                  </span>
                )}
                {displayDiscountBadge && (
                  <span className="text-xs font-bold text-[#C57053] bg-[#FDF0EB] px-2 py-0.5 rounded-full">
                    {displayDiscountBadge}
                  </span>
                )}
              </div>
              {categoryDiscount > 0 ? (
                <p className="text-xs text-emerald-700 mt-1.5 font-medium">
                  You save ₹{categoryDiscountAmount.toLocaleString("en-IN")} with category offer
                </p>
              ) : currentDifference > 0 ? (
                <p className="text-xs text-emerald-700 mt-1.5 font-medium">
                  ₹{currentDifference.toLocaleString("en-IN")} below MRP
                </p>
              ) : null}
              <p className="text-[11px] text-gray-400 mt-1">Inclusive of all taxes · Free delivery above ₹999</p>
            </div>

            {/* Short Description */}
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description.slice(0, 160)}{product.description.length > 160 ? "…" : ""}
              </p>
            )}

            {/* Delivery Box */}
            <div className="bg-white border border-[#E8E2D8] rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Delivery</p>

              {isEditingPincode ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter 6-digit Pincode"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    maxLength={6}
                    className="flex-1 px-3 py-2 text-sm border border-[#E8E2D8] rounded-lg focus:ring-2 focus:ring-[#0F2920] outline-none bg-[#FAF7F2]"
                    disabled={isCheckingPincode}
                  />
                  <button
                    onClick={checkPincode}
                    disabled={isCheckingPincode}
                    className="px-4 py-2 bg-[#0F2920] text-white text-xs font-bold rounded-lg hover:bg-[#1a3d2f] transition disabled:opacity-50"
                  >
                    {isCheckingPincode ? "…" : "Apply"}
                  </button>
                  <button
                    onClick={() => setIsEditingPincode(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 px-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F5EFE6] text-[#9A7B66] flex items-center justify-center shrink-0">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{pincode}</p>
                      <p className="text-xs text-gray-400 leading-tight">{savedArea}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingPincode(true)}
                    className="text-xs font-semibold text-[#0F2920] hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2.5 border-t border-[#E8E2D8] text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <Truck size={13} />
                  <span>Delivery <strong>₹{deliveryFee}</strong></span>
                </div>
                <div className="text-gray-400">
                  Est. <strong className="text-gray-600">{deliveryDateString}</strong>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E8E2D8] rounded-lg bg-white overflow-hidden">
                <button
                  onClick={handleDecreaseQuantity}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-[#F5F1EC] transition font-bold"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-bold text-sm text-gray-900 select-none">{quantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-[#F5F1EC] transition font-bold"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                {product.stock ? `${product.stock} in stock` : "In Stock"}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5">
              {/* Add to Cart / Buy Now */}
              <div className="flex gap-2.5">
                {quantityInCart > 0 ? (
                  <div className="flex-1 flex items-center justify-between border-2 border-[#0F2920] bg-[#EDF4F0] rounded-xl py-2.5 px-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (quantityInCart > 1) updateQuantity(cartItemForProduct!.id, quantityInCart - 1);
                        else { removeFromCart(cartItemForProduct!.id); toast.success("Removed from cart"); }
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-white text-[#0F2920] border border-[#C4D6CC] rounded-lg active:scale-90 transition"
                    >
                      <Minus size={13} strokeWidth={2.5} />
                    </button>
                    <div className="text-center select-none">
                      <span className="font-bold text-[#0F2920] text-sm block">{quantityInCart} in Cart</span>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Tap - / + to adjust</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateQuantity(cartItemForProduct!.id, quantityInCart + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-[#0F2920] text-white rounded-lg active:scale-90 transition"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#0F2920] hover:bg-[#1a3d2f] text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow transition active:scale-95"
                  >
                    <ShoppingCart size={15} />
                    Add to Cart
                  </button>
                )}
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#F5EFE6] hover:bg-[#EDE5D8] text-[#6B4A36] border border-[#D9C9B4] rounded-xl font-bold uppercase tracking-wider text-xs transition active:scale-95"
                >
                  <Zap size={15} />
                  Buy Now
                </button>
              </div>

              {/* WhatsApp + Call */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleWhatsAppOrderProduct}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-[#F0FAF3] hover:bg-[#E4F5E9] text-[#1A7A35] border border-[#C2E8CF] rounded-xl font-semibold text-xs transition"
                >
                  <MessageCircle size={14} />
                  Order via WhatsApp
                </button>
                <a
                  href="tel:+919492664870"
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-white hover:bg-[#F5F1EC] text-gray-700 border border-[#E8E2D8] rounded-xl font-semibold text-xs transition"
                >
                  <Phone size={14} />
                  Call Support
                </a>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { icon: <Truck size={15} />, label: "Fast Delivery", sub: "Pan India" },
                { icon: <Lock size={15} />, label: "Secure Pay", sub: "Encrypted" },
                { icon: <ShieldCheck size={15} />, label: "Genuine", sub: "100% Certified" },
                { icon: <RotateCcw size={15} />, label: "No Returns", sub: "No Exchange" },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center text-center p-2 bg-white border border-[#E8E2D8] rounded-xl">
                  <div className="text-[#9A7B66] mb-1">{badge.icon}</div>
                  <span className="text-[9px] font-bold text-gray-800 leading-tight">{badge.label}</span>
                  <span className="text-[9px] text-gray-400 leading-tight">{badge.sub}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Tabs Section ────────────────────────────────────────────────────── */}
        <div className="border-t border-[#E8E2D8]">
          <div className="flex gap-6 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: "description", label: "Description" },
              { id: "specifications", label: "Specifications" },
              { id: "materials", label: "Materials" },
              { id: "shipping", label: "Shipping" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 pt-4 text-sm font-semibold tracking-normal transition-all border-b-2 whitespace-nowrap ${
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

        {/* ── Tab: Description ───────────────────────────────────────────────── */}
        {activeTab === "description" && (
          <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#9A7B66] uppercase">Premium Collection</span>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mt-1">
                  Elegant Craftsmanship &amp; Lasting Quality
                </h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || "Elegant insulated flask designed for leakproof travel. Perfect for coffee, tea, and other hot/cold beverages on the go."} This premium piece highlights our dedication to creating beautiful, lasting elements for your home — made with precision and passion.
              </p>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Flame size={15} className="text-[#C57053]" />, bg: "bg-[#FDF0EB]", title: "Keeps Hot & Cold", sub: "Long Hours" },
                  { icon: <Droplets size={15} className="text-blue-500" />, bg: "bg-blue-50", title: "Leak Proof", sub: "Design" },
                  { icon: <Shield size={15} className="text-emerald-700" />, bg: "bg-emerald-50", title: "Food Grade", sub: "304 Steel" },
                  { icon: <Coffee size={15} className="text-[#9A7B66]" />, bg: "bg-[#F5EFE6]", title: "Portable", sub: "With Cup Lid" },
                ].map((f, i) => (
                  <div key={i} className="p-3 bg-white border border-[#E8E2D8] rounded-xl flex flex-col gap-2">
                    <div className={`w-8 h-8 rounded-lg ${f.bg} flex items-center justify-center`}>{f.icon}</div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block leading-tight">{f.title}</span>
                      <span className="text-[10px] text-gray-400">{f.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifestyle Banner */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm border border-[#E8E2D8] group">
                <img
                  src="/images/flask_lifestyle_banner.jpg"
                  alt="Stay Refreshed Anywhere"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-white leading-tight mb-1">Stay Refreshed<br />Anywhere</h3>
                  <p className="text-xs text-white/70 mb-3">Premium design for your everyday essentials.</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-black/50 backdrop-blur-sm text-white border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Flame size={11} className="text-red-400" /> HOT 12H
                    </span>
                    <span className="bg-black/50 backdrop-blur-sm text-white border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Droplets size={11} className="text-cyan-300" /> COLD 24H
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Specifications ─────────────────────────────────────────────── */}
        {activeTab === "specifications" && (
          <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Product Specifications</h3>
              <div className="bg-white border border-[#E8E2D8] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {productSpecs.map((spec, i) => (
                      <tr key={i} className={`border-b last:border-0 border-[#F0EBE3] ${i % 2 === 0 ? "bg-[#FAF7F2]" : "bg-white"}`}>
                        <td className="px-5 py-3.5 font-semibold text-gray-500 w-2/5 text-xs uppercase tracking-wide">{spec.label}</td>
                        <td className="px-5 py-3.5 font-medium text-gray-900 text-sm">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm border border-[#E8E2D8] group">
                <img
                  src="/images/diamond_collection_banner.jpg"
                  alt="Diamond Collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent p-6 flex flex-col justify-center">
                  <span className="text-[10px] font-extrabold tracking-widest text-amber-300 uppercase mb-2">Diamond Collection</span>
                  <div className="w-8 h-0.5 bg-amber-300 mb-3" />
                  <p className="text-xs text-white/80 font-medium">Premium design for your everyday essentials.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Materials ──────────────────────────────────────────────────── */}
        {activeTab === "materials" && (
          <div className="py-10 max-w-3xl space-y-5">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#9A7B66] uppercase">Quality Standards</span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">Only The Finest Materials</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Constructed with eco-friendly and robust, food-grade 304 Stainless Steel that guarantees structural integrity, superior thermal retention, and long durability under regular household usage.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />, title: "BPA-Free Certified", desc: "100% non-toxic and food contact safe." },
                { icon: <Award className="w-5 h-5 text-[#9A7B66]" />, title: "304 Stainless Steel", desc: "Rust-proof and odor-resistant interior." },
                { icon: <Flame className="w-5 h-5 text-[#C57053]" />, title: "Double Wall Vacuum", desc: "Sweat-free exterior with extreme temperature lock." },
              ].map((m, i) => (
                <div key={i} className="p-4 bg-white border border-[#E8E2D8] rounded-2xl">
                  <div className="mb-2">{m.icon}</div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{m.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Shipping ───────────────────────────────────────────────────── */}
        {activeTab === "shipping" && (
          <div className="py-10 max-w-3xl space-y-5">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#9A7B66] uppercase">Logistics</span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">Reliable Delivery Network</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              We deliver using professional high-security transport partners (Delhivery, BlueDart, DTDC). Each item is securely packaged inside specialized heavy-duty boxes with multi-layer bubble wrap to guarantee safe arrival.
            </p>
            <div className="bg-white border border-[#E8E2D8] rounded-2xl p-5 space-y-3">
              {[
                "Dispatched within 24–48 hours of order confirmation.",
                "Real-time SMS and WhatsApp tracking updates.",
                "Pan India standard delivery within 3–6 business days.",
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews Section ─────────────────────────────────────────────────── */}
        <div className="py-12 border-t border-[#E8E2D8]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
              <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Verified Only
              </span>
            </div>
            {reviews.length > 0 && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="text-xs font-semibold text-[#0F2920] hover:underline"
              >
                + Write Review
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Summary */}
            <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6 space-y-5">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Overall Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">{avgRating ? avgRating.toFixed(1) : "0.0"}</span>
                  <span className="text-xs text-gray-400">out of 5</span>
                </div>
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-[#E8E2D8]"}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((r) => (
                  <div key={r} className="flex items-center text-xs text-gray-500 gap-2">
                    <span className="w-10 shrink-0">{r} star</span>
                    <div className="flex-1 h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#9A7B66] rounded-full transition-all duration-500"
                        style={{ width: `${ratingPercentages[r as 5|4|3|2|1] || 0}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-gray-400">{ratingPercentages[r as 5|4|3|2|1] || 0}%</span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-[#FDF7F4] border border-[#F0D9CE] rounded-xl flex items-start gap-3">
                <ShieldCheck size={16} className="text-[#C57053] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#C57053]">Review Restricted</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Only customers with verified purchase history can submit reviews.
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Display */}
            <div className="bg-white border border-[#E8E2D8] rounded-2xl p-6 flex flex-col">
              {reviews.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#F5EFE6] text-[#9A7B66] flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">No reviews yet</h3>
                    <p className="text-xs text-gray-400 mt-1">Be the first to share your experience!</p>
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
                    className="px-6 py-2.5 bg-[#0F2920] hover:bg-[#1a3d2f] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-95"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
                    <span className="text-sm font-bold text-gray-900">{reviews.length} Review{reviews.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-[#FAF7F2] border border-[#E8E2D8] rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">{rev.name}</span>
                          <span className="text-[10px] text-gray-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-[#E8E2D8]"} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Products ─────────────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="py-10 border-t border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#9A7B66] uppercase">You May Also Like</span>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">Related Products</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollRelated("left")}
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#F5EFE6] border border-[#E8E2D8] flex items-center justify-center text-gray-600 transition"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => scrollRelated("right")}
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#F5EFE6] border border-[#E8E2D8] flex items-center justify-center text-gray-600 transition"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div
              ref={relatedScrollRef}
              className="flex gap-4 overflow-x-auto pb-3 no-scrollbar scroll-smooth"
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
                    className="w-52 sm:w-56 shrink-0 bg-white border border-[#E8E2D8] rounded-2xl p-3.5 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer group"
                  >
                    {/* Wishlist */}
                    <div className="flex justify-end mb-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(relProduct); }}
                        className={`p-1 transition ${isInWishlist(relProduct.id) ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}
                      >
                        <Heart size={15} className={isInWishlist(relProduct.id) ? "fill-current" : ""} />
                      </button>
                    </div>

                    {/* Image */}
                    <div className="aspect-square rounded-xl bg-[#FAF7F2] flex items-center justify-center overflow-hidden mb-3 border border-[#E8E2D8]">
                      <img
                        src={relProduct.image}
                        alt={relProduct.title || relProduct.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-1.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={10} className={s <= 4 ? "fill-amber-400 text-amber-400" : "text-[#E8E2D8]"} />
                      ))}
                      <span className="text-[10px] font-bold text-gray-700 ml-0.5">4.5</span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-[#0F2920] transition-colors flex-1">
                      {relProduct.title || relProduct.name}
                    </h4>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-sm font-bold text-gray-900">₹{relProduct.price}</span>
                      {relActualPrice > relProduct.price && (
                        <span className="text-[10px] text-gray-400 line-through">₹{relActualPrice}</span>
                      )}
                      <span className="text-[10px] font-bold text-[#C57053]">{relDiscount}% OFF</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {relQtyInCart > 0 ? (
                        <div className="flex-1 h-7 border border-[#0F2920] bg-[#EDF4F0] rounded-lg flex items-center justify-between px-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (relQtyInCart > 1) updateQuantity(relCartItem!.id, relQtyInCart - 1);
                              else { removeFromCart(relCartItem!.id); toast.success("Removed"); }
                            }}
                            className="w-5 h-5 flex items-center justify-center bg-white text-[#0F2920] border border-[#C4D6CC] rounded active:scale-90 transition"
                          >
                            <Minus size={9} />
                          </button>
                          <span className="font-bold text-[#0F2920] text-[11px]">{relQtyInCart}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); updateQuantity(relCartItem!.id, relQtyInCart + 1); }}
                            className="w-5 h-5 flex items-center justify-center bg-[#0F2920] text-white rounded active:scale-90 transition"
                          >
                            <Plus size={9} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({ id: relProduct.id, name: relProduct.title || relProduct.name, price: relProduct.price, image: relProduct.image, quantity: 1 });
                            toast.success("Added to cart!");
                          }}
                          className="flex-1 py-1.5 bg-white hover:bg-[#F5EFE6] border border-[#E8E2D8] text-gray-700 rounded-lg font-semibold text-[10px] flex items-center justify-center gap-1 transition active:scale-95"
                        >
                          <ShoppingCart size={10} /> Add
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({ id: relProduct.id, name: relProduct.title || relProduct.name, price: relProduct.price, image: relProduct.image, quantity: 1 });
                          navigate("/checkout");
                        }}
                        className="flex-1 py-1.5 bg-[#0F2920] hover:bg-[#1a3d2f] text-white rounded-lg font-semibold text-[10px] flex items-center justify-center transition active:scale-95"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── Review Modal ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-0.5">Write a Review</h3>
              <p className="text-xs text-gray-400 mb-5">{product.title || product.name}</p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 border border-[#E8E2D8] rounded-xl text-sm bg-[#FAF7F2] focus:ring-2 focus:ring-[#0F2920] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Star
                          size={28}
                          className={star <= formRating ? "fill-amber-400 text-amber-400" : "text-[#E8E2D8]"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Review</label>
                  <textarea
                    required
                    rows={3}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Describe your experience..."
                    className="w-full px-3.5 py-2.5 border border-[#E8E2D8] rounded-xl text-sm bg-[#FAF7F2] focus:ring-2 focus:ring-[#0F2920] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Add Photo <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <div className="flex items-center justify-center border-2 border-dashed border-[#E8E2D8] rounded-xl p-4 bg-[#FAF7F2] relative cursor-pointer hover:bg-[#F5EFE6] transition">
                    {imagePreview ? (
                      <div className="relative w-full h-20 flex items-center justify-center">
                        <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
                        <button
                          type="button"
                          onClick={() => { setImagePreview(""); setFormImage(""); }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 shadow"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-center pointer-events-none">
                          <Camera className="w-5 h-5 text-[#9A7B66] mx-auto mb-1" />
                          <span className="text-xs text-gray-400">Click to upload photo</span>
                        </div>
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
                  className="w-full py-3 bg-[#0F2920] hover:bg-[#1a3d2f] text-white font-bold rounded-xl text-sm uppercase tracking-wider shadow transition active:scale-95"
                >
                  Submit Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Lightbox ────────────────────────────────────────────────────────────── */}
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
              className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition"
            >
              <X size={18} />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={activeLightboxImage}
              alt="Full scale view"
              className="max-w-full max-h-[88vh] object-contain rounded-xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductDetail;
