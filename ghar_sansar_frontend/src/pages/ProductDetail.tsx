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
      selectedSize: selectedSize,
      selectedColor: selectedColor
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

      {/* Minimal Sticky Mobile CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E2D8] px-4 py-2.5 z-40 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[10px] text-[#8C827A] block uppercase font-medium">Total Price</span>
          <span className="font-poppins text-base font-normal text-gray-950">₹{(finalPrice * quantity) + (deliveryFee || 0)}</span>
        </div>
        <div className="flex gap-2 items-center">
          {isOutOfStock ? (
            <button 
              disabled
              className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-md font-medium text-xs cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : isComingSoon ? (
            <button 
              disabled
              className="px-3.5 py-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-md font-medium text-xs cursor-not-allowed"
            >
              Coming Soon
            </button>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center border border-[#D9B4A4] bg-[#FAF7F2] rounded-md px-2 py-1 gap-2">
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
                className="w-6 h-6 flex items-center justify-center bg-white text-gray-800 border border-[#E8E2D8] rounded-sm font-normal text-xs active:scale-90 transition"
              >
                -
              </button>
              <span className="font-normal text-xs text-gray-950 px-1 select-none">{quantityInCart}</span>
              <button 
                type="button"
                onClick={() => updateQuantity(cartItemForProduct!.id, quantityInCart + 1)}
                className="w-6 h-6 flex items-center justify-center bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4] rounded-sm font-medium text-xs active:scale-90 transition"
              >
                +
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-white text-gray-950 border border-[#E8E2D8] rounded-md font-normal text-xs transition"
            >
              Add to Cart
            </button>
          )}
          <button 
            onClick={handleBuyNow}
            className="px-4 py-2 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] rounded-md font-medium text-xs transition shadow-2xs"
          >
            Buy Now
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 relative z-10">
        
        {/* Luxury Breadcrumb matching website theme */}
        <nav className="flex items-center space-x-1.5 text-xs text-[#8C827A] mb-5 font-normal">
          <span className="cursor-pointer hover:text-[#C86B4C] transition" onClick={() => navigate("/")}>Home</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-[#C86B4C] transition" onClick={() => navigate(state?.isReturnGift ? "/return-gifts" : "/products")}>
            {state?.isReturnGift ? "Return Gifts" : "Shop"}
          </span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-[#C86B4C] transition" onClick={() => navigate(state?.isReturnGift ? `/return-gifts?category=${product.category}` : `/products?category=${product.category}`)}>
            {product.category || "General"}
          </span>
          <span>&gt;</span>
          <span className="text-gray-950 font-medium truncate max-w-[280px]">{product.title || product.name}</span>
        </nav>

        {/* 2-Column Product Showcase Section */}
        <div className="bg-white rounded-2xl border border-[#E8E2D8] p-5 sm:p-8 lg:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Clean Studio Image Showcase */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            
            <div className="w-full">
              {/* Main Image Showcase Container */}
              <div 
                className="w-full relative overflow-hidden rounded-xl bg-[#FAF7F2] aspect-square border border-[#E8E2D8] flex items-center justify-center p-8 sm:p-12 select-none group"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                {/* Expand Control at Top Right */}
                <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
                  <button
                    onClick={() => setActiveLightboxImage(product.image)}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 border border-[#E8E2D8] shadow-2xs hover:text-[#7D3219] transition-all cursor-pointer"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>

                {/* Bottom Right Zoom / Scan Icon */}
                <button 
                  onClick={() => setActiveLightboxImage(product.image)}
                  className="absolute bottom-3.5 right-3.5 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 border border-[#E8E2D8] shadow-2xs hover:text-[#7D3219] transition-all cursor-pointer"
                  title="Expand Image"
                >
                  <Scan size={14} />
                </button>

                {/* Main Media Content: Studio Image with Ambient Ground Shadow & Micro-Zoom */}
                <div className="w-full h-full flex items-center justify-center relative cursor-zoom-in">
                  <div 
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/5 h-4 rounded-full bg-black/[0.04] blur-[8px] pointer-events-none" 
                    aria-hidden="true" 
                  />

                  <StudioImage
                    src={product.image}
                    alt={product.title || product.name}
                    loading="eager"
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={isZooming ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: 'scale(1.7)'
                    } : {}}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Product Details, Pricing, Location, Stock, CTAs */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              {/* Category Pill, In Stock Dot, and Heart/Share icons */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold tracking-[0.24em] text-[#C86B4C] uppercase font-sans">
                    {product.category || "General"}
                  </span>
                  {isOutOfStock ? (
                    <span className="text-xs text-rose-700 font-medium px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md">
                      Out of Stock
                    </span>
                  ) : isComingSoon ? (
                    <span className="text-xs text-amber-800 font-medium px-2 py-0.5 bg-amber-50 border border-amber-300 rounded-md">
                      Coming Soon
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      if (product) toggleWishlist(product);
                    }}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      isWishlisted ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-[#FAF7F2] hover:bg-white text-gray-500 hover:text-rose-600 border-[#E8E2D8]'
                    }`}
                    title="Wishlist"
                  >
                    <Heart size={15} className={isWishlisted ? 'fill-current' : ''} />
                  </button>

                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-full border border-[#E8E2D8] bg-[#FAF7F2] hover:bg-white text-gray-500 hover:text-[#7D3219] transition-all cursor-pointer"
                    title="Share"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="font-poppins text-2xl sm:text-3xl font-normal text-gray-950 tracking-tight leading-snug mb-2">
                {product.title?.replace(/_/g, " ") || product.name?.replace(/_/g, " ")}
              </h1>

              {/* Star Rating and Customer Reviews */}
              <div className="flex items-center gap-2 mb-3.5">
                <div className="flex items-center gap-1">
                  <Star size={13} className="fill-[#F4B740] text-[#F4B740]" />
                  <span className="font-semibold text-gray-950 text-xs">{avgRating ? avgRating.toFixed(1) : "4.5"}</span>
                </div>
                <span className="text-xs text-[#8C827A] font-normal">
                  ({reviews.length > 0 ? reviews.length : 18} Verified Customer Reviews)
                </span>
              </div>

              {/* Pricing Section */}
              <div className="space-y-2 pb-3.5 border-b border-[#F0EAE1] mb-3.5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-poppins text-2xl sm:text-3xl font-normal text-gray-950 tracking-tight">
                    ₹{finalPrice.toLocaleString("en-IN")}
                  </span>
                  {strikePrice > finalPrice && (
                    <span className="text-sm sm:text-base text-[#8C827A] line-through font-normal" title="MRP / Strike Price">
                      ₹{strikePrice.toLocaleString("en-IN")}
                    </span>
                  )}
                  {displayDiscountBadge && (
                    <span className="text-xs font-medium text-[#7D3219] bg-[#F7EBE4] border border-[#D9B4A4] px-2.5 py-0.5 rounded-full">
                      {displayDiscountBadge}
                    </span>
                  )}
                </div>

                {categoryDiscount > 0 ? (
                  <div className="flex items-center gap-2 pt-0.5 text-xs">
                    <span className="inline-flex items-center gap-1 text-[#7D3219] bg-[#FAF7F2] border border-[#E8E2D8] px-2.5 py-1 rounded-md font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[#C86B4C]" />
                      <span>Category Offer: {categoryDiscount}% OFF</span>
                    </span>
                    <span className="text-[#8C827A] font-normal text-[11px]">
                      (₹{categoryDiscountAmount.toLocaleString("en-IN")} promotional discount)
                    </span>
                  </div>
                ) : currentDifference > 0 ? (
                  <div className="flex items-center gap-2 pt-0.5 text-xs text-[#8C827A] font-normal">
                    <span>Direct Price Benefit: ₹{currentDifference.toLocaleString("en-IN")} below MRP</span>
                  </div>
                ) : null}
              </div>

              {/* Product Short Description */}
              {product.description && (
                <div className="pb-3.5 border-b border-[#F0EAE1] mb-3.5">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-[#C86B4C] uppercase block mb-1 font-sans">
                    Description
                  </span>
                  <p className="text-xs sm:text-[13px] text-[#6B7280] leading-relaxed font-normal">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Delivery Location Box */}
              <div className="p-3.5 sm:p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8] shadow-2xs space-y-3 mb-4">
                <span className="text-[10px] font-semibold text-[#8C827A] uppercase tracking-wider block font-sans">Delivery &amp; Services</span>
                
                {isEditingPincode || !pincode ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter 6-digit Pincode" 
                        value={pincodeInput}
                        onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#E8E2D8] rounded-md focus:border-[#C86B4C] focus:ring-1 focus:ring-[#C86B4C] outline-none"
                        disabled={isCheckingPincode}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") checkPincode();
                        }}
                      />
                      <button 
                        onClick={checkPincode}
                        disabled={isCheckingPincode || pincodeInput.length !== 6}
                        className="px-4 py-2 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] text-xs font-medium rounded-md transition disabled:opacity-50 cursor-pointer"
                      >
                        {isCheckingPincode ? "Checking..." : "Check"}
                      </button>
                      {pincode ? (
                        <button 
                          onClick={() => setIsEditingPincode(false)}
                          className="text-xs text-gray-500 hover:text-gray-700 px-2 cursor-pointer"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-[#8C827A]">
                      Enter your pincode to check delivery availability and charges.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#F7EBE4] text-[#7D3219] flex items-center justify-center shrink-0">
                        <MapPin size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-950 leading-tight">{pincode}</p>
                        <p className="text-[11px] text-[#6B7280] leading-tight mt-0.5">{savedArea}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setPincodeInput(pincode);
                        setIsEditingPincode(true);
                      }}
                      className="text-xs font-medium text-[#7D3219] hover:underline transition cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}

                {pincode && deliveryFee !== null ? (
                  <div className="pt-2.5 border-t border-[#E8E2D8] flex items-center justify-between text-xs font-normal">
                    <div className="flex items-center gap-1.5 text-gray-800">
                      <Truck size={14} className="text-[#7D3219]" />
                      <span>Delivery <strong className="font-medium text-[#7D3219]">₹{deliveryFee} (Standard)</strong></span>
                    </div>
                    <div className="text-[#8C827A] text-[11px]">
                      Estimated: <strong className="text-gray-900 font-medium">{deliveryDateString}</strong>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {/* Row 1: Add to Cart & Buy Now */}
                <div className="flex gap-2 w-full">
                  {isOutOfStock ? (
                    <button
                      disabled
                      className="w-full h-[40px] px-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-[13px] font-semibold rounded-md flex items-center justify-center cursor-not-allowed select-none tracking-wide"
                    >
                      Out of Stock
                    </button>
                  ) : isComingSoon ? (
                    <button
                      disabled
                      className="w-full h-[40px] px-2 bg-amber-50 border border-amber-300 text-amber-800 text-xs sm:text-[13px] font-semibold rounded-md flex items-center justify-center cursor-not-allowed select-none tracking-wide"
                    >
                      Coming Soon — Stay Tuned
                    </button>
                  ) : quantityInCart > 0 ? (
                    <div className="flex-1 h-[40px] border border-[#E8E2D8] bg-[#FAF7F2] rounded-md flex items-center justify-between px-3 shadow-2xs">
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
                        className="w-6 h-6 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 border border-[#E8E2D8] rounded-sm active:scale-90 transition font-normal cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={11} strokeWidth={2} />
                      </button>

                      <span className="font-normal text-gray-950 text-xs sm:text-sm px-1 select-none">
                        {quantityInCart} in Cart
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(cartItemForProduct!.id, quantityInCart + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] rounded-sm active:scale-90 transition font-medium cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={11} strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 h-[40px] px-3 bg-[#FAF7F2] hover:bg-white text-gray-950 border border-[#E8E2D8] hover:border-[#8E3F24] rounded-md font-normal text-xs sm:text-[13px] flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-2xs cursor-pointer whitespace-nowrap"
                      >
                        <ShoppingCart size={13} className="text-gray-600 shrink-0 stroke-[1.8]" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={handleBuyNow}
                        className="flex-1 h-[40px] px-3 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] rounded-md font-medium text-xs sm:text-[13px] flex items-center justify-center gap-1 transition-all active:scale-98 shadow-2xs cursor-pointer whitespace-nowrap"
                      >
                        <Zap size={13} className="fill-[#7D3219] shrink-0" />
                        <span>Buy Now</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Row 2: WhatsApp Order & Call Support */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleWhatsAppOrderProduct}
                    className="h-[36px] flex items-center justify-center gap-1.5 px-2 bg-white hover:bg-[#FAF7F2] text-[#1E7E34] border border-[#D5E3D8] hover:border-[#1E7E34] rounded-md font-medium text-xs transition-all shadow-2xs cursor-pointer"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp Order</span>
                  </button>

                  <a
                    href="tel:+919492664870"
                    className="h-[36px] flex items-center justify-center gap-1.5 px-2 bg-white hover:bg-[#FAF7F2] text-gray-700 border border-[#E8E2D8] hover:border-gray-400 rounded-md font-medium text-xs transition-all shadow-2xs cursor-pointer"
                  >
                    <Phone size={13} />
                    <span>Call Support</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 4 Trust Badges Row (spanning full width with hairline dividers) */}
        <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-[0_4px_16px_rgba(0,0,0,0.02)] my-6 py-4 px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E8E2D8]">
          <div className="flex flex-col items-center text-center p-2.5">
            <User2 className="w-5 h-5 text-[#C86B4C] mb-1.5" strokeWidth={1.75} />
            <span className="text-xs font-medium text-gray-950 font-poppins leading-tight">Premium Quality</span>
            <span className="text-[11px] text-stone-500 font-light leading-tight mt-0.5">100% Certified</span>
          </div>

          <div className="flex flex-col items-center text-center p-2.5">
            <Truck className="w-5 h-5 text-[#C86B4C] mb-1.5" strokeWidth={1.75} />
            <span className="text-xs font-medium text-gray-950 font-poppins leading-tight">Fast Delivery</span>
            <span className="text-[11px] text-stone-500 font-light leading-tight mt-0.5">Pan India</span>
          </div>

          <div className="flex flex-col items-center text-center p-2.5">
            <RotateCcw className="w-5 h-5 text-[#C86B4C] mb-1.5" strokeWidth={1.75} />
            <span className="text-xs font-medium text-gray-950 font-poppins leading-tight">No Returns</span>
            <span className="text-[11px] text-stone-500 font-light leading-tight mt-0.5">No Exchange</span>
          </div>

          <div className="flex flex-col items-center text-center p-2.5">
            <Lock className="w-5 h-5 text-[#C86B4C] mb-1.5" strokeWidth={1.75} />
            <span className="text-xs font-medium text-gray-950 font-poppins leading-tight">Secure Payments</span>
            <span className="text-[11px] text-stone-500 font-light leading-tight mt-0.5">100% Encrypted</span>
          </div>
        </div>

        {/* Product Details Overview */}
        {product.description && (
          <div className="bg-white rounded-2xl border border-[#E8E2D8] p-6 sm:p-8 mb-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <span className="text-[11px] font-semibold tracking-[0.24em] text-[#C86B4C] uppercase block mb-1.5 font-sans">
              About This Product
            </span>
            <h2 className="text-xl sm:text-2xl font-poppins font-normal text-gray-950 leading-tight mb-3">
              {product.title || product.name}
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed max-w-3xl font-light">
              {product.description}
            </p>
          </div>
        )}

        {/* Customer Reviews & Verification Section */}
        <div className="bg-white rounded-2xl border border-[#E8E2D8] p-6 sm:p-8 mb-8 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F0EAE1]">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.24em] text-[#C86B4C] uppercase block mb-1 font-sans">
                Feedback & Ratings
              </span>
              <h2 className="text-xl sm:text-2xl font-poppins font-normal text-gray-950">
                Customer Reviews
              </h2>
            </div>
            <span className="text-[11px] font-medium px-3 py-1 bg-[#F7EBE4] text-[#7D3219] rounded-full border border-[#D9B4A4]/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#C86B4C] rounded-full"></span>
              Verified Reviews Only
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Rating Summary Card */}
            <div className="lg:col-span-6 bg-[#FAF7F2] p-5 sm:p-7 rounded-xl border border-[#E8E2D8] space-y-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1">Overall Rating</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-poppins font-normal text-gray-950">{avgRating ? avgRating.toFixed(1) : "0.0"}</span>
                  <span className="text-xs text-stone-500 font-medium">out of 5</span>
                </div>
                <div className="flex items-center text-stone-200 mt-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={star <= Math.round(avgRating) ? "fill-[#F4B740] text-[#F4B740]" : "text-stone-300"}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bars (5 Star to 1 Star) */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((r) => (
                  <div key={r} className="flex items-center text-xs text-stone-600 font-medium">
                    <span className="w-12 text-stone-500">{r} star</span>
                    <div className="flex-1 h-2 bg-[#E8E2D8] rounded-full mx-3 overflow-hidden">
                      <div 
                        className="h-full bg-[#C86B4C] rounded-full transition-all duration-500"
                        style={{ width: `${ratingPercentages[r as 5|4|3|2|1] || 0}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-stone-500 font-medium">{ratingPercentages[r as 5|4|3|2|1] || 0}%</span>
                  </div>
                ))}
              </div>

              {/* Review Restricted Badge Notice */}
              <div className="p-4 bg-white rounded-xl border border-[#E8E2D8] flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F7EBE4] text-[#7D3219] flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 leading-tight">Review Restricted</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5 font-light">
                    To maintain strict authenticity, only customers who have verified purchase history for this item can write feedback.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Empty State or Reviews Display */}
            <div className="lg:col-span-6 bg-[#FAF7F2] p-5 sm:p-7 rounded-xl border border-[#E8E2D8] flex flex-col items-center justify-center text-center">
              {reviews.length === 0 ? (
                <div className="space-y-4 py-8">
                  <div className="w-12 h-12 rounded-full bg-white text-stone-400 flex items-center justify-center mx-auto border border-[#E8E2D8]">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 font-poppins">No reviews yet</h3>
                    <p className="text-xs text-stone-500 mt-1 font-light">Be the first to share your experience with this piece.</p>
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
                    className="px-6 py-2.5 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] rounded-md font-medium text-xs sm:text-[13px] transition shadow-xs cursor-pointer"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8]">
                    <span className="text-xs font-medium text-gray-900">{reviews.length} Customer Feedback</span>
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="text-xs font-medium text-[#7D3219] hover:underline cursor-pointer"
                    >
                      + Add Review
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-white rounded-xl border border-[#E8E2D8] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-900">{rev.name}</span>
                          <span className="text-[10px] text-stone-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-[#F4B740]">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={11} className={s <= rev.rating ? "fill-current" : "text-stone-200"} />
                          ))}
                        </div>
                        <p className="text-xs text-stone-600 font-light">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E2D8] p-6 sm:p-8 mb-12 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] font-semibold tracking-[0.24em] text-[#C86B4C] uppercase block mb-1 font-sans">
                  Discover More
                </span>
                <h2 className="text-xl sm:text-2xl font-poppins font-normal text-gray-950 tracking-tight">
                  Related Products
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollRelated("left")}
                  className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-white border border-[#E8E2D8] hover:border-[#C86B4C] shadow-2xs flex items-center justify-center text-stone-700 hover:text-[#7D3219] transition cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRelated("right")}
                  className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-white border border-[#E8E2D8] hover:border-[#C86B4C] shadow-2xs flex items-center justify-center text-stone-700 hover:text-[#7D3219] transition cursor-pointer"
                  title="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Carousel using canonical ProductCard */}
            <div 
              ref={relatedScrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
            >
              {relatedProducts.map((relProduct, idx) => (
                <div key={relProduct.id || idx} className="w-[240px] sm:w-[270px] shrink-0">
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
