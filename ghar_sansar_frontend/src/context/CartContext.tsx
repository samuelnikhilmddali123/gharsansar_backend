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
    const token = getAuthToken();
    const qtyToAdd = item.quantity || (item.isReturnGift ? 50 : 1);

    if (token) {
      try {
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

        const res = await axios.post(`${BACKEND_URL}/v1/cart/items`, payload, {
          headers: getAuthHeaders()
        });

        if (res.data.success && res.data.cart) {
          const updatedItems = (res.data.cart.items || []).map((i: any) => ({
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
          setItems(updatedItems);
          return;
        }
      } catch (err) {
        console.error("Failed to add to remote cart:", err);
      }
    }

    // Guest fallback / optimistic state update
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        let newQty = existing.quantity + qtyToAdd;
        if (existing.stock !== undefined && newQty > existing.stock) {
          newQty = existing.stock;
        }
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { ...item, quantity: qtyToAdd }];
    });
  };

  const removeFromCart = async (id: string) => {
    const token = getAuthToken();
    if (token) {
      try {
        const res = await axios.delete(`${BACKEND_URL}/v1/cart/items/${encodeURIComponent(id)}`, {
          headers: getAuthHeaders()
        });
        if (res.data.success && res.data.cart) {
          const updatedItems = (res.data.cart.items || []).map((i: any) => ({
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
          setItems(updatedItems);
          return;
        }
      } catch (err) {
        console.error("Failed to remove from remote cart:", err);
      }
    }

    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const token = getAuthToken();
    if (token) {
      try {
        const res = await axios.put(
          `${BACKEND_URL}/v1/cart/items/${encodeURIComponent(id)}`,
          { quantity },
          { headers: getAuthHeaders() }
        );
        if (res.data.success && res.data.cart) {
          const updatedItems = (res.data.cart.items || []).map((i: any) => ({
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
          setItems(updatedItems);
          return;
        }
      } catch (err) {
        console.error("Failed to update remote cart quantity:", err);
      }
    }

    setItems(prev =>
      prev.map(i => {
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
      })
    );
  };

  const clearCart = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await axios.delete(`${BACKEND_URL}/v1/cart`, {
          headers: getAuthHeaders()
        });
      } catch (err) {
        console.error("Failed to clear remote cart:", err);
      }
    }
    setItems([]);
    localStorage.removeItem('cart');
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