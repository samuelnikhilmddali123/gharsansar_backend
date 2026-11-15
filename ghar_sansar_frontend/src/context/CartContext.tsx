import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
  selectedColor?: string;
  isReturnGift?: boolean;
  minQty?: number;
  stock?: number;
  status?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const BACKEND_URL = import.meta.env.VITE_AWS_API_URL || "/api";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

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

  // Fetch persistent cart from MongoDB Atlas
  const refreshCart = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      // Guest mode: load from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (e) {
          setItems([]);
        }
      }
      return;
    }

    try {
      const res = await axios.get(`${BACKEND_URL}/v1/cart`, {
        headers: getAuthHeaders()
      });

      if (res.data.success && res.data.cart) {
        const backendItems: CartItem[] = (res.data.cart.items || []).map((i: any) => ({
          id: i.productId || i.id,
          productId: i.productId || i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor,
          isReturnGift: i.isReturnGift,
          stock: i.stock
        }));

        // If there were local guest items, merge them with Atlas
        const localSaved = localStorage.getItem('cart');
        if (localSaved) {
          try {
            const localItems: CartItem[] = JSON.parse(localSaved);
            if (localItems.length > 0) {
              const mergeRes = await axios.post(
                `${BACKEND_URL}/v1/cart/merge`,
                { items: localItems },
                { headers: getAuthHeaders() }
              );
              if (mergeRes.data.success && mergeRes.data.cart) {
                const merged: CartItem[] = (mergeRes.data.cart.items || []).map((i: any) => ({
                  id: i.productId || i.id,
                  productId: i.productId || i.id,
                  name: i.name,
                  price: i.price,
                  quantity: i.quantity,
                  image: i.image,
                  selectedSize: i.selectedSize,
                  selectedColor: i.selectedColor,
                  isReturnGift: i.isReturnGift,
                  stock: i.stock
                }));
                setItems(merged);
                localStorage.removeItem('cart');
                return;
              }
            }
          } catch (e) {}
          localStorage.removeItem('cart');
        }

        setItems(backendItems);
      }
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('token');
      }
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (e) {}
      }
    }
  }, []);

  // Initial cart load and event listeners for auth changes
  useEffect(() => {
    refreshCart();

    const handleLogin = () => {
      refreshCart();
    };

    const handleLogout = () => {
      setItems([]);
      localStorage.removeItem('cart');
    };

    window.addEventListener("auth_login", handleLogin);
    window.addEventListener("auth_logout", handleLogout);

    return () => {
      window.removeEventListener("auth_login", handleLogin);
      window.removeEventListener("auth_logout", handleLogout);
    };
  }, [refreshCart]);

  // Keep localStorage as local offline backup for guests
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    if (item.status === "out_of_stock" || (item.stock !== undefined && item.stock <= 0)) {
      return;
    }
    if (item.status === "coming_soon") {
      return;
    }
    const token = getAuthToken();
    const qtyToAdd = item.quantity || (item.isReturnGift ? 50 : 1);

    // 1. Instant Optimistic Local State Update (0ms UI feedback)
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      let updated: CartItem[];
      if (existing) {
        let newQty = existing.quantity + qtyToAdd;
        if (existing.stock !== undefined && newQty > existing.stock) {
          newQty = existing.stock;
        }
        updated = prev.map(i =>
          i.id === item.id ? { ...i, quantity: newQty } : i
        );
      } else {
        updated = [...prev, { ...item, quantity: qtyToAdd }];
      }
      try {
        localStorage.setItem('cart', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Background Asynchronous Sync to MongoDB Atlas (Non-blocking)
    if (token) {
      const payload = {
        productId: item.id,
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: qtyToAdd,
        image: item.image,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        isReturnGift: item.isReturnGift,
        stock: item.stock
      };

      axios.post(`${BACKEND_URL}/v1/cart/items`, payload, {
        headers: getAuthHeaders()
      }).catch(err => {
        console.error("Background cart sync failed:", err);
      });
    }
  };

  const removeFromCart = async (id: string) => {
    const token = getAuthToken();

    // 1. Instant Optimistic Local State Update (0ms UI feedback)
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      try {
        localStorage.setItem('cart', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Background Asynchronous Sync to MongoDB Atlas (Non-blocking)
    if (token) {
      axios.delete(`${BACKEND_URL}/v1/cart/items/${encodeURIComponent(id)}`, {
        headers: getAuthHeaders()
      }).catch(err => {
        console.error("Background remove from cart sync failed:", err);
      });
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const token = getAuthToken();

    // 1. Instant Optimistic Local State Update (0ms UI feedback)
    setItems(prev => {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = prev.filter(i => i.id !== id);
      } else {
        updated = prev.map(i => {
          if (i.id === id) {
            let newQty = quantity;
            if (i.isReturnGift && newQty < 50 && newQty > 0) {
              newQty = 50;
            }
            if (i.stock !== undefined && newQty > i.stock) {
              newQty = i.stock;
            }
            return { ...i, quantity: newQty };
          }
          return i;
        });
      }
      try {
        localStorage.setItem('cart', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Background Asynchronous Sync to MongoDB Atlas (Non-blocking)
    if (token) {
      axios.put(
        `${BACKEND_URL}/v1/cart/items/${encodeURIComponent(id)}`,
        { quantity },
        { headers: getAuthHeaders() }
      ).catch(err => {
        console.error("Background cart quantity sync failed:", err);
      });
    }
  };

  const clearCart = async () => {
    const token = getAuthToken();
    setItems([]);
    try {
      localStorage.removeItem('cart');
    } catch (e) {}

    if (token) {
      axios.delete(`${BACKEND_URL}/v1/cart`, {
        headers: getAuthHeaders()
      }).catch(err => {
        console.error("Background clear cart sync failed:", err);
      });
    }
  };

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};