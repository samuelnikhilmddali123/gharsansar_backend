import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useProducts, Product } from "../context/ProductContext";
import { Heart, ShoppingBag, Trash2, ArrowRight, Home, Sparkles, Check } from "lucide-react";
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

const Wishlist: React.FC = () => {
  const { wishlist, items: rawItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart, items: cartItems } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();
  const [addedIds, setAddedIds] = React.useState<Record<string, boolean>>({});

  // Merge wishlist IDs with latest product catalog data, falling back to stored wishlist items
  const wishlistItems = React.useMemo(() => {
    return wishlist.map((id) => {
      const liveProduct = products.find((p) => String(p.id) === String(id));
      if (liveProduct) {
        return {
          id: String(liveProduct.id),
          name: liveProduct.title || liveProduct.name || "Curated Product",
          price: liveProduct.finalPrice || liveProduct.price || liveProduct.actualPrice || 0,
          strikePrice: liveProduct.strikePrice || 0,
          image: liveProduct.image,
          category: liveProduct.category,
          stock: liveProduct.stock,
          liveProduct
        };
      }

      const storedItem = rawItems.find((it) => String(it.productId) === String(id));
      return {
        id: String(id),
        name: storedItem?.name || "Curated Decor Product",
        price: storedItem?.price || 0,
        strikePrice: 0,
        image: storedItem?.image || "",
        category: storedItem?.category || "Home Decor",
        stock: 10,
        liveProduct: null
      };
    });
  }, [wishlist, products, rawItems]);

  const handleAddToCart = async (item: typeof wishlistItems[0]) => {
    const cleanName = (item.name || "Product").replace(/_/g, " ");
    await addToCart({
      id: item.id,
      name: cleanName,
      price: item.price,
      image: item.image,
      stock: item.stock
    });
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
    toast.success(`"${cleanName}" added to cart!`);
  };

  const handleMoveAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    for (const item of wishlistItems) {
      await addToCart({
        id: item.id,
        name: (item.name || "Product").replace(/_/g, " "),
        price: item.price,
        image: item.image,
        stock: item.stock
      });
    }
    toast.success("All items added to cart!");
  };

  if (loading && wishlist.length === 0) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen font-poppins pt-24 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#D9B4A4] border-t-[#7D3219] animate-spin"></div>
          <p className="text-xs text-gray-500 font-normal">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen font-poppins pt-16 sm:pt-20 pb-16 flex flex-col selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-5 border-b border-[#E8E2D8] mb-8 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-poppins font-normal text-gray-950 tracking-tight">
              My Wishlist
            </h1>
            <span className="text-xs text-[#736B63] font-normal">
              ({wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"})
            </span>
          </div>

          {wishlistItems.length > 0 && (
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="py-2 px-3.5 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] rounded-md text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ShoppingBag size={13} />
              <span>Add All to Cart</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 sm:py-20 bg-white rounded-xl border border-[#E8E2D8] p-8 shadow-2xs max-w-lg mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-[#F7EBE4] border border-[#D9B4A4] flex items-center justify-center text-[#7D3219] mb-4 mx-auto">
              <Heart className="w-7 h-7 text-[#7D3219]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-poppins font-normal text-gray-950 mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#736B63] font-normal max-w-sm mx-auto mb-6 leading-relaxed">
              Explore our collections of handcrafted festive curations, idols, and lifestyle accents to save your favorites.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] font-medium text-xs sm:text-sm rounded-md shadow-2xs transition-all cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {wishlistItems.map((item, index) => {
              const inCart = cartItems.some((ci) => String(ci.id) === item.id || String(ci.productId) === item.id);
              const isJustAdded = addedIds[item.id];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white rounded-xl border border-[#E8E2D8] hover:border-[#D9B4A4] transition-all duration-200 shadow-2xs overflow-hidden flex flex-col group"
                >
                  {/* Image Container */}
                  <div
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="aspect-square bg-[#FBF9F6] relative overflow-hidden cursor-pointer"
                  >
                    <img
                      src={fixImageUrl(item.image) || "/images/festive_gifts_banner.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Quick Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(item.id);
                      }}
                      title="Remove from wishlist"
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-red-600 border border-[#E8E2D8] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Category pill */}
                    {item.category && (
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 bg-white/95 backdrop-blur-xs rounded-md text-[9px] font-medium tracking-wider uppercase text-[#7D3219] border border-[#E8E2D8]">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Details Container */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="font-poppins font-normal text-xs sm:text-sm text-gray-950 hover:text-[#C26847] line-clamp-2 cursor-pointer transition-colors leading-snug mb-2"
                      title={item.name}
                    >
                      {item.name.replace(/_/g, " ")}
                    </h3>

                    {/* Price Block */}
                    <div className="mt-auto mb-3.5 flex items-baseline gap-2">
                      <span className="font-poppins font-normal text-sm sm:text-base text-gray-950">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </span>
                      {item.strikePrice > item.price && (
                        <span className="text-xs text-gray-400 line-through font-normal">
                          ₹{Number(item.strikePrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer ${isJustAdded
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                            : inCart
                              ? "bg-[#FAF7F2] text-gray-800 border border-[#E8E2D8] hover:border-[#D9B4A4]"
                              : "bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219]"
                          }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check size={13} className="text-emerald-700" />
                            <span>Added</span>
                          </>
                        ) : inCart ? (
                          <>
                            <Check size={13} />
                            <span>In Cart (+1)</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={13} />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        title="Remove"
                        className="p-2 bg-[#FAF7F2] hover:bg-red-50 text-gray-400 hover:text-red-600 border border-[#E8E2D8] hover:border-red-200 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

