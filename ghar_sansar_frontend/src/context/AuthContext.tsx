import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id?: string;
  email: string;
  role: string; // "admin" | "user" | "pending"
  name?: string;
  phone?: string;
  profilePicture?: string;
  addresses?: any[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (emailOrPhone: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = import.meta.env.VITE_AWS_API_URL || "/api";

const syncUserShippingPincode = (u: User | null) => {
  if (!u || !u.addresses || u.addresses.length === 0) return;
  const defaultAddr = u.addresses.find((a: any) => a.isDefault) || u.addresses[0];
  if (defaultAddr) {
    localStorage.setItem("user_shipping_address", JSON.stringify(defaultAddr));
    if (u.email) {
      localStorage.setItem(`shipping_address_${u.email}`, JSON.stringify(defaultAddr));
    }
    const zip = defaultAddr.zipCode || defaultAddr.pincode;
    if (zip) {
      const code = String(zip).trim();
      localStorage.setItem("user_pincode", code);
      const area = [defaultAddr.city, defaultAddr.state].filter(Boolean).join(", ") || defaultAddr.city || "India";
      localStorage.setItem("user_area", area);
      window.dispatchEvent(new Event("storage"));
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
        syncUserShippingPincode(parsed);
      } catch (e) {
        console.error("Failed to restore user", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, {
        emailOrPhone,
        password
      });

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        syncUserShippingPincode(res.data.user);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Login error:", err);
      const errMsg = err.response?.data?.error || "Invalid credentials. Only admin and registered customers can login.";
      alert(errMsg);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/register`, {
        name,
        email,
        phone: phone || "",
        password
      });

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        syncUserShippingPincode(res.data.user);
        alert("Registration successful! Welcome to Ghar Sansar.");
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Registration error:", err);
      const errMsg = err.response?.data?.error || "Registration failed. Try a different email.";
      alert(errMsg);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, googleProvider } = await import("../firebase");
      
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const res = await axios.post(`${BACKEND_URL}/auth/google`, {
        email: fbUser.email,
        name: fbUser.displayName || "Google User"
      });

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        syncUserShippingPincode(res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Google login error:", err);
      alert("Failed to login with Google.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("user_pincode");
    localStorage.removeItem("user_area");
    localStorage.removeItem("user_shipping_address");
    window.dispatchEvent(new Event("storage"));
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    syncUserShippingPincode(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, register, loginWithGoogle, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
