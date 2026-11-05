import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface WishlistItem {
  productId: string;
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  addedAt?: string | Date;
}

interface WishlistContextType {
  wishlist: string[];
  items: WishlistItem[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: { id?: string; productId?: string; name?: string; title?: string; price?: number; image?: string; category?: string }) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

const BACKEND_URL = import.meta.env.VITE_AWS_API_URL || "/api";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`
    };
  };

  const refreshWishlist = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      const saved = localStorage.getItem("wishlist");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setWishlist(parsed);
        } catch (e) {
          setWishlist([]);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/v1/wishlist`, {
        headers: getAuthHeaders()
      });

      if (res.data.success) {
        setWishlist(res.data.wishlist || []);
        setItems(res.data.items || []);

        // Sync local guest wishlist if existed
        const localSaved = localStorage.getItem("wishlist");
        if (localSaved) {
          try {
            const localIds: string[] = JSON.parse(localSaved);
            if (localIds.length > 0) {
              const syncRes = await axios.post(
                `${BACKEND_URL}/v1/wishlist/sync`,
                { productIds: localIds },
                { headers: getAuthHeaders() }
              );
              if (syncRes.data.success) {
                setWishlist(syncRes.data.wishlist || []);
                setItems(syncRes.data.items || []);
              }
            }
          } catch (e) {}
          localStorage.removeItem("wishlist");
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote wishlist:", err);
      const saved = localStorage.getItem("wishlist");
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();

    const handleLogin = () => {
      refreshWishlist();
    };

    const handleLogout = () => {
      setWishlist([]);
      setItems([]);
      localStorage.removeItem("wishlist");
    };

    window.addEventListener("auth_login", handleLogin);
    window.addEventListener("auth_logout", handleLogout);

    return () => {
      window.removeEventListener("auth_login", handleLogin);
      window.removeEventListener("auth_logout", handleLogout);
    };
  }, [refreshWishlist]);

  // Save guest wishlist to localStorage
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const isInWishlist = (productId: string): boolean => {
    if (!productId) return false;
    return wishlist.includes(String(productId));
  };

  const toggleWishlist = async (product: {
    id?: string;
    productId?: string;
    name?: string;
    title?: string;
    price?: number;
    image?: string;
    category?: string;
  }): Promise<boolean> => {
    const targetId = String(product.productId || product.id || "").trim();
    if (!targetId) return false;

    const token = getAuthToken();
    const currentlyWishlisted = isInWishlist(targetId);

    if (token) {
      try {
        const payload = {
          productId: targetId,
          product: {
            id: targetId,
            productId: targetId,
            name: product.name || product.title || "Product",
            price: product.price || 0,
            image: product.image || "",
            category: product.category || ""
          }
        };

        const res = await axios.post(`${BACKEND_URL}/v1/wishlist/toggle`, payload, {
          headers: getAuthHeaders()
        });

        if (res.data.success) {
          setWishlist(res.data.wishlist || []);
          setItems(res.data.items || []);
          const wishlisted = Boolean(res.data.wishlisted);
          toast.success(wishlisted ? "Saved to wishlist!" : "Removed from wishlist");
          return wishlisted;
        }
      } catch (err) {
        console.error("Failed to toggle remote wishlist:", err);
      }
    }

    // Guest fallback
    let nextWishlisted = false;
    setWishlist(prev => {
      if (prev.includes(targetId)) {
        nextWishlisted = false;
        toast.success("Removed from wishlist");
        return prev.filter(id => id !== targetId);
      } else {
        nextWishlisted = true;
        toast.success("Saved to wishlist!");
        return [...prev, targetId];
      }
    });

    return nextWishlisted;
  };

  const removeFromWishlist = async (productId: string): Promise<void> => {
    const targetId = String(productId).trim();
    if (!targetId) return;

    const token = getAuthToken();
    if (token) {
      try {
        const res = await axios.delete(`${BACKEND_URL}/v1/wishlist/${encodeURIComponent(targetId)}`, {
          headers: getAuthHeaders()
        });
        if (res.data.success) {
          setWishlist(res.data.wishlist || []);
          setItems(res.data.items || []);
          toast.success("Removed from wishlist");
          return;
        }
      } catch (err) {
        console.error("Failed to remove from remote wishlist:", err);
      }
    }

    setWishlist(prev => prev.filter(id => id !== targetId));
    toast.success("Removed from wishlist");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        items,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
