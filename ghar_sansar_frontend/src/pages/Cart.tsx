import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Home, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Helper to normalize image paths
const fixImageUrl = (url?: string) => {
  if (!url) return "";
  let fixed = url
    .replace(/^https?:\/\/https?:\/\//, "https://")
    .replace(/\s/g, "%20")
    .replace(/([^:]\/)\/+/g, "$1");
  fixed = fixed.replace(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?/, "");
  if (fixed.startsWith("http://backend.gharsansar.website") || fixed.startsWith("http://lx70r6zsef")) {
    fixed = fixed.replace(/^http:/, "https:");
  }
  return fixed;
};

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleRemove = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    toast.success(`"${itemName.replace(/_/g, " ")}" removed from cart`);
  };

  const handleDecreaseQuantity = (itemId: string, currentQty: number, itemName: string, isReturnGift?: boolean) => {
    if (isReturnGift && currentQty <= 50) {
      toast.error("Return gifts require a minimum order of 50 units.");
      return;
    }
    
    if (currentQty <= 1) {
      removeFromCart(itemId);
      toast.success(`"${itemName.replace(/_/g, " ")}" removed from cart`);
    } else {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  const handleIncreaseQuantity = (item: any) => {
    if (item.stock !== undefined && item.quantity >= item.stock) {
      toast.error(`Only ${item.stock} items left in stock`);
      return;
    }
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to proceed to checkout!");
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    } else {
      navigate("/checkout");
    }
  };

  const handleWhatsAppOrderCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to proceed to checkout and place your order on WhatsApp!");
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    } else {
      navigate("/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen font-poppins pt-14 pb-16 flex flex-col items-center justify-center selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#E8E2D8] p-8 sm:p-10 shadow-2xs"
          >
            <div className="w-16 h-16 rounded-full bg-[#F7EBE4] border border-[#D9B4A4] flex items-center justify-center text-[#7D3219] mb-4 mx-auto">
              <ShoppingBag className="w-7 h-7 text-[#7D3219]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-poppins font-normal text-gray-950 mb-2">
              Your Shopping Cart is Empty
            </h1>
            <p className="text-xs sm:text-sm text-[#736B63] font-normal mb-6 leading-relaxed">
              Explore our curated collections of handcrafted festive gifts, idols, and luxury interior accents.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C26847] hover:bg-[#B05B3C] text-white font-medium text-xs sm:text-sm rounded-md shadow-2xs transition-all cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const taxAmount = totalPrice * 0.18;
  const grandTotal = totalPrice + taxAmount;

  return (
    <div className="bg-[#FAF7F2] min-h-screen font-poppins pt-14 pb-16 sm:pb-20 flex flex-col selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-5 border-b border-[#E8E2D8] mb-8 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-poppins font-normal text-gray-950 tracking-tight">
              Shopping Cart
            </h1>
            <span className="text-xs text-[#736B63] font-normal">
              ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
          </div>
        </div>

        {/* 2-Column Cart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item, index) => {
              const itemTotal = (item.price || 0) * (item.quantity || 1);
              const cleanName = (item.name || "Curated Item").replace(/_/g, " ");

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white rounded-xl border border-[#E8E2D8] hover:border-[#D9B4A4] transition-colors p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5"
                >
                  {/* Product Image */}
                  <div
                    onClick={() => item.productId && navigate(`/product/${item.productId}`)}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-[#FBF9F6] border border-[#E8E2D8] shrink-0 cursor-pointer"
                  >
                    <img
                      src={fixImageUrl(item.image) || "/images/festive_gifts_banner.jpg"}
                      alt={cleanName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => item.productId && navigate(`/product/${item.productId}`)}
                      className="font-poppins font-normal text-sm sm:text-base text-gray-950 hover:text-[#C26847] transition-colors cursor-pointer truncate mb-1"
                      title={cleanName}
                    >
                      {cleanName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#736B63] font-normal mb-3">
                      <span>₹{Number(item.price).toLocaleString("en-IN")} each</span>
                      {item.isReturnGift && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#F7EBE4] text-[#7D3219] rounded-md border border-[#D9B4A4]">
                          Return Gift (Min 50)
                        </span>
                      )}
                    </div>

                    {/* Stepper & Subtotal row on mobile */}
                    <div className="flex items-center justify-between sm:hidden pt-2 border-t border-[#E8E2D8]">
                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center border border-[#E8E2D8] rounded-md bg-[#FAF7F2]/60 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity, item.name, item.isReturnGift)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white text-gray-700 rounded-sm transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-normal text-gray-950">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncreaseQuantity(item)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white text-gray-700 rounded-sm transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Item Total */}
                      <span className="font-poppins font-normal text-sm text-gray-950">
                        ₹{Number(itemTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Stepper */}
                  <div className="hidden sm:inline-flex items-center border border-[#E8E2D8] rounded-md bg-[#FAF7F2]/60 p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDecreaseQuantity(item.id, item.quantity, item.name, item.isReturnGift)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white text-gray-700 rounded-sm transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-9 text-center text-xs font-normal text-gray-950">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncreaseQuantity(item)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white text-gray-700 rounded-sm transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Desktop Item Subtotal */}
                  <div className="hidden sm:block text-right shrink-0 min-w-[90px]">
                    <span className="font-poppins font-normal text-sm sm:text-base text-gray-950 block">
                      ₹{Number(itemTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id, item.name)}
                    title="Remove item"
                    className="self-end sm:self-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-[#E8E2D8] p-6 shadow-2xs lg:sticky lg:top-24"
            >
              <h2 className="text-lg font-poppins font-normal text-gray-950 pb-4 border-b border-[#E8E2D8] mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 mb-5 text-xs sm:text-sm">
                <div className="flex justify-between text-[#736B63] font-normal">
                  <span>Subtotal</span>
                  <span className="text-gray-950 font-normal">
                    ₹{Number(totalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-[#736B63] font-normal">
                  <span>Estimated Shipping</span>
                  <span className="text-gray-500 font-normal text-xs">
                    Calculated at checkout
                  </span>
                </div>

                <div className="flex justify-between text-[#736B63] font-normal">
                  <span>GST (18%)</span>
                  <span className="text-gray-950 font-normal">
                    ₹{Number(taxAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#E8E2D8] flex justify-between items-baseline">
                  <span className="text-sm font-normal text-gray-950">Grand Total</span>
                  <span className="text-lg font-poppins font-normal text-gray-950">
                    ₹{Number(grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className="w-full py-3 px-4 bg-[#C26847] hover:bg-[#B05B3C] text-white font-medium text-xs sm:text-sm tracking-wide rounded-md shadow-2xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppOrderCart}
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#1ebc59] text-white font-medium text-xs sm:text-sm tracking-wide rounded-md shadow-2xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle size={15} className="fill-current" />
                  <span>Order via WhatsApp</span>
                </button>

                <Link
                  to="/products"
                  className="w-full py-2.5 px-4 bg-[#FAF7F2] hover:bg-white text-gray-900 border border-[#E8E2D8] hover:border-[#D9B4A4] font-normal text-xs sm:text-sm rounded-md shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-5 border-t border-[#E8E2D8] space-y-2 text-[11px] text-[#736B63]">
                <div className="flex items-center gap-2">
                  <Truck size={13} className="text-[#7D3219] shrink-0" />
                  <span>Standard delivery in 3–5 business days across India</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-[#7D3219] shrink-0" />
                  <span>100% genuine artisanal & insured packaging</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
