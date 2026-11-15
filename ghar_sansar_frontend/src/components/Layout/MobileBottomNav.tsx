import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Sparkles, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  const currentPath = location.pathname;

  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: Home,
      isActive: currentPath === "/",
    },
    {
      label: "Products",
      path: "/products",
      icon: ShoppingBag,
      isActive: currentPath === "/products" || currentPath.startsWith("/product/"),
    },
    {
      label: "Interior",
      path: "/interior-design",
      icon: Sparkles,
      isActive: currentPath === "/interior-design",
    },
    {
      label: "Wishlist",
      path: "/wishlist",
      icon: Heart,
      isActive: currentPath === "/wishlist",
      badgeCount: wishlist.length,
    },
    {
      label: "Cart",
      path: "/cart",
      icon: ShoppingCart,
      isActive: currentPath === "/cart",
      badgeCount: totalItems || 0,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E8E2D8] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-2 py-1.5"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                item.isActive
                  ? "text-[#C86B4C] font-semibold"
                  : "text-gray-500 hover:text-gray-900 font-normal"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${
                    item.isActive ? "scale-110 text-[#C86B4C]" : "text-gray-600"
                  }`}
                  strokeWidth={item.isActive ? 2.3 : 1.8}
                />
                {item.badgeCount !== undefined && item.badgeCount > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-[#C86B4C] text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-xs">
                    {item.badgeCount > 99 ? "99+" : item.badgeCount}
                  </span>
                ) : null}
              </div>
              <span className="text-[10.5px] mt-1 tracking-tight truncate leading-tight">
                {item.label}
              </span>
              {item.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C86B4C] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
