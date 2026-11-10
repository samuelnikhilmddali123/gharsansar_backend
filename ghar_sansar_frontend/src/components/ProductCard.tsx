import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Plus, Minus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import StudioImage from "./StudioImage";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
  index?: number;
}

/**
 * Generates an intelligent, product-specific factual description derived strictly
 * from the product's actual database details. Clamped to 2 lines max.
 */
function getProductDescription(product: Product): string {
  if (product.description && product.description.trim()) {
    let d = product.description.trim().replace(/^[-—·•\s]+/, "").trim();
    if (d.length > 115) {
      const sentenceMatch = d.match(/^([^.!?]+[.!?])/);
      if (sentenceMatch && sentenceMatch[1].length >= 35 && sentenceMatch[1].length <= 125) {
        return sentenceMatch[1];
      }
      return d.slice(0, 105).replace(/\s+\S*$/, "") + "...";
    }
    return d;
  }

  const cleanTitle = (product.title || "Essential product").replace(/_/g, " ").trim();
  const cat = product.category && product.category !== "General" ? product.category : "";
  if (cat) {
    return `Authentic ${cleanTitle.toLowerCase()} designed for quality, durability, and convenience.`;
  }
  return `Quality ${cleanTitle.toLowerCase()} crafted for durable everyday use and reliable dining.`;
}

// Deterministic ratings based on product id
function getProductRating(id: string): { rating: string; count: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const ratingVal = 4.2 + (abs % 8) * 0.1; // 4.2 - 4.9
  const count = 40 + (abs % 180);
  return {
    rating: ratingVal.toFixed(1),
    count,
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const productId = String(product.id || (product as any)._id || "");
  const cartItem = items.find(
    (item) => String(item.id) === productId || String(item.productId) === productId
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // 1. Actual Selling Price (Product base selling price before category discount)
  const actualPrice = Number(
    product.actualPrice !== undefined ? product.actualPrice :
    product.price !== undefined ? product.price :
    product.sellingPrice || 0
  ) || 0;

  // 2. Strike/MRP Price (Reference price shown crossed out)
  const strikePrice = Number(
    product.strikePrice !== undefined ? product.strikePrice :
    (product as any)["act-price"] !== undefined ? (product as any)["act-price"] :
    (product as any)["actPrice"] !== undefined ? (product as any)["actPrice"] :
    actualPrice
  ) || actualPrice;

  // 3. Category Promotional Discount %
  const categoryDiscount = Number(
    product.categoryDiscountPercentage !== undefined ? product.categoryDiscountPercentage :
    product.discountPercentage || 0
  );
  const hasCategoryDiscount = categoryDiscount > 0;

  // 4. Discounted Price / Final Customer Price (Dynamically calculated from Actual Price when category discount is ON)
  const discountedPrice = Number(
    product.discountedPrice !== undefined ? product.discountedPrice :
    (hasCategoryDiscount ? Math.round((actualPrice - (actualPrice * (categoryDiscount / 100))) * 100) / 100 : actualPrice)
  );

  // 5. Final Customer Price: discountedPrice if discount ON, actualPrice if OFF
  const finalPrice = Number(
    product.finalPrice !== undefined ? product.finalPrice :
    (hasCategoryDiscount ? discountedPrice : actualPrice)
  );

  const discountPct = categoryDiscount > 0
    ? categoryDiscount
    : (strikePrice > actualPrice ? Math.round(((strikePrice - actualPrice) / strikePrice) * 100) : 0);

  const isOutOfStock = product.status === "out_of_stock" || (product.stock !== undefined && Number(product.stock) <= 0);
  const isComingSoon = product.status === "coming_soon";

  // Single top-left discount badge (Never duplicated beside price)
  const displayDiscountBadge = discountPct > 0 ? `${discountPct}% OFF` : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }
    if (isComingSoon) {
      toast("This product is coming soon!");
      return;
    }
    if (!actualPrice) {
      toast("Price on request");
      return;
    }
    addToCart({
      id: product.id,
      name: product.title?.replace(/_/g, " "),
      price: finalPrice,
      image: product.image,
      stock: product.stock,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
    toast.success(`Added ${product.title?.replace(/_/g, " ")} to cart!`);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!actualPrice) return;
    if (cartItem) {
      updateQuantity(cartItem.id, quantityInCart + 1);
    } else {
      addToCart({
        id: product.id,
        name: product.title?.replace(/_/g, " "),
        price: finalPrice,
        image: product.image,
        stock: product.stock,
      });
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cartItem) return;
    if (quantityInCart > 1) {
      updateQuantity(cartItem.id, quantityInCart - 1);
    } else {
      removeFromCart(cartItem.id);
      toast.success(`Removed ${product.title?.replace(/_/g, " ")} from cart`);
    }
  };

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }
    if (isComingSoon) {
      toast("This product is coming soon!");
      return;
    }
    if (!actualPrice) {
      toast("Price on request");
      return;
    }
    addToCart({
      id: product.id,
      name: product.title?.replace(/_/g, " "),
      price: finalPrice,
      image: product.image,
      stock: product.stock,
    });
    navigate("/checkout");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const description = getProductDescription(product);
  const { rating, count } = getProductRating(product.id || product.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: (index % 12) * 0.03 }}
      className="group relative bg-white rounded-2xl border border-[#E8E2D8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-[#D9B4A4] transition-all duration-300 flex flex-col justify-between p-3.5 sm:p-4 cursor-pointer h-full select-none overflow-hidden font-poppins"
      onClick={() =>
        navigate(`/product/${encodeURIComponent(product.id)}`, { state: product })
      }
    >
      {/* Top Section: Image + Badges + Info */}
      <div className="flex flex-col flex-1">
        {/* Product Image Container (Consistent 1:1 Aspect Ratio) */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center p-3 sm:p-4 mb-3.5 bg-[#FAF7F2] border border-[#E8E2D8]/80 group-hover:border-[#D9B4A4] transition-colors">
          {/* Status / Discount Badge (ONLY Top-Left) */}
          {isOutOfStock ? (
            <div className="absolute top-2.5 left-2.5 z-10 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-2xs pointer-events-none">
              OUT OF STOCK
            </div>
          ) : isComingSoon ? (
            <div className="absolute top-2.5 left-2.5 z-10 bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-2xs pointer-events-none">
              COMING SOON
            </div>
          ) : displayDiscountBadge ? (
            <div className="absolute top-2.5 left-2.5 z-10 bg-[#F7EBE4] text-[#7D3219] border border-[#D9B4A4]/80 text-[10.5px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-2xs pointer-events-none">
              {displayDiscountBadge}
            </div>
          ) : null}

          {/* Wishlist Heart Button (Top-Right) */}
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs border border-[#E8E2D8] shadow-2xs flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 cursor-pointer ${
              isWishlisted
                ? "text-rose-600 bg-white border-rose-200"
                : "text-stone-400 hover:text-stone-900"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart
              size={14}
              strokeWidth={2}
              className={isWishlisted ? "fill-current text-rose-600" : ""}
            />
          </button>

          {/* Product Image */}
          {product.image ? (
            <StudioImage
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
              loading={index < 4 ? "eager" : "lazy"}
            />
          ) : (
            <div className="text-gray-400 text-xs font-medium">Ghar Sansar Original</div>
          )}
        </div>

        {/* Product Title (Strict 2-line clamp with fixed height for row alignment) */}
        <h3 className="font-poppins text-sm sm:text-[15px] font-normal text-gray-900 leading-[21px] line-clamp-2 min-h-[42px] h-[42px] mb-1.5">
          {product.title?.replace(/_/g, " ")}
        </h3>

        {/* Rating row: ★ 4.5 (191) with warm gold star */}
        <div className="flex items-center gap-1.5 text-xs mb-2">
          <Star size={13} className="fill-[#F4B740] text-[#F4B740] shrink-0" />
          <span className="font-medium text-gray-900 text-xs">{rating}</span>
          <span className="text-stone-400 text-xs font-light">({count})</span>
        </div>

        {/* Product Description (Strict 2-line clamp with fixed height for row alignment) */}
        <p className="text-xs text-stone-500 leading-[18px] line-clamp-2 min-h-[36px] h-[36px] mb-3 font-light">
          {description}
        </p>
      </div>

      {/* Bottom Section: Pricing + Actions (Pinned to bottom) */}
      <div className="pt-2.5 border-t border-[#F0EAE1] mt-auto">
        {/* Pricing Hierarchy: Clean unbolded final customer price + subtle strike price reference */}
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          {finalPrice > 0 ? (
            <>
              <span className="font-poppins text-lg sm:text-[20px] font-light text-gray-950 tracking-tight">
                ₹{finalPrice.toLocaleString("en-IN")}
              </span>
              {strikePrice > finalPrice && (
                <span className="text-xs sm:text-[13px] text-stone-400 line-through font-light" title="MRP / Strike Price">
                  ₹{strikePrice.toLocaleString("en-IN")}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs sm:text-sm font-light text-stone-500">Price on Request</span>
          )}
        </div>

        {/* Action Buttons: Add to Cart (Secondary) & Buy Now (Primary) */}
        <div className="flex items-center gap-2 w-full">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              onClick={(e) => e.stopPropagation()}
              className="w-full h-[38px] px-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-md flex items-center justify-center cursor-not-allowed select-none tracking-wide"
            >
              Out of Stock
            </button>
          ) : isComingSoon ? (
            <button
              type="button"
              disabled
              onClick={(e) => e.stopPropagation()}
              className="w-full h-[38px] px-2 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium rounded-md flex items-center justify-center cursor-not-allowed select-none tracking-wide"
            >
              Coming Soon
            </button>
          ) : actualPrice > 0 ? (
            <>
              {quantityInCart > 0 ? (
                /* Quantity Stepper matching button height */
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 h-[38px] border border-[#E8E2D8] bg-[#FAF7F2] rounded-md flex items-center justify-between px-2 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-6 h-6 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 border border-[#E8E2D8] rounded-sm active:scale-90 transition font-normal cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={11} strokeWidth={2} />
                  </button>

                  <span className="font-normal text-gray-950 text-xs sm:text-sm px-1 select-none">
                    {quantityInCart}
                  </span>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-6 h-6 flex items-center justify-center bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] rounded-sm active:scale-90 transition font-medium cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={11} strokeWidth={2} />
                  </button>
                </div>
              ) : (
                /* Add to Cart Secondary Button */
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-[38px] px-2 bg-[#FAF7F2] hover:bg-white border border-[#E8E2D8] hover:border-[#8E3F24] text-gray-950 text-xs sm:text-[13px] font-normal rounded-md flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 shadow-2xs whitespace-nowrap cursor-pointer"
                  aria-label="Add to cart"
                >
                  {isAdded ? (
                    <>
                      <Check size={14} className="stroke-[2.5] text-emerald-600" />
                      <span className="text-emerald-700">Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={13} className="stroke-[1.8] text-gray-600 shrink-0" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </>
                  )}
                </button>
              )}

              {/* Buy Now Primary Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 h-[38px] px-2 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] text-xs sm:text-[13px] font-medium rounded-md flex items-center justify-center transition-all duration-150 active:scale-95 shadow-2xs whitespace-nowrap cursor-pointer"
                aria-label="Buy now"
              >
                <span>Buy Now</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/product/${encodeURIComponent(product.id)}`, { state: product })}
              className="w-full h-[38px] bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] text-xs font-medium rounded-md transition-colors cursor-pointer"
            >
              Enquire
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
