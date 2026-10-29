import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  _id?: string;
  id?: string | number;
  email: string;
  role: string;
  password_hash?: string;
  full_name?: string;
  name?: string;
  phone?: string;
  company_name?: string;
  gstin?: string;
  is_active?: boolean;
  firebase_uid?: string;
  photo_url?: string;
  profilePicture?: string;
  street_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  created_at?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  addresses?: any[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (emailOrPhone: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  sendOtp: (email: string) => Promise<{ success: boolean; message?: string; error?: string; expiresInSeconds?: number }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string; error?: string; isProfileIncomplete?: boolean }>;
  loginWithGoogle: () => Promise<{ success: boolean; isProfileIncomplete?: boolean; user?: User }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  saveShippingAddress: (addressData: {
    firstName: string;
    lastName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    isDefault?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = import.meta.env.VITE_AWS_API_URL || "/api";

const syncUserShippingPincode = (u: User | null) => {
  if (!u) return;

  // Check top-level address fields first or addresses array
  const defaultAddr = (u.addresses && u.addresses.length > 0)
    ? (u.addresses.find((a: any) => a.isDefault) || u.addresses[0])
    : (u.street_address ? {
        address: u.street_address,
        city: u.city,
        state: u.state,
        zipCode: u.pincode,
        phone: u.phone,
        firstName: (u.full_name || u.name || "").split(" ")[0] || "",
        lastName: (u.full_name || u.name || "").split(" ").slice(1).join(" ") || ""
      } : null);

  if (defaultAddr) {
    localStorage.setItem("user_shipping_address", JSON.stringify(defaultAddr));
    if (u.email) {
      localStorage.setItem(`shipping_address_${u.email}`, JSON.stringify(defaultAddr));
    }
    const zip = defaultAddr.zipCode || defaultAddr.pincode || u.pincode;
    if (zip) {
      const code = String(zip).trim();
      localStorage.setItem("user_pincode", code);
      const area = [defaultAddr.city || u.city, defaultAddr.state || u.state].filter(Boolean).join(", ") || defaultAddr.city || u.city || "India";
      localStorage.setItem("user_area", area);
      window.dispatchEvent(new Event("storage"));
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage and verify session with MongoDB Atlas
  useEffect(() => {
    const rawToken = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    const isValidToken = Boolean(
      rawToken &&
      rawToken !== "null" &&
      rawToken !== "undefined" &&
      rawToken.trim() !== ""
    );
    const isValidUser = Boolean(
      rawUser &&
      rawUser !== "null" &&
      rawUser !== "undefined" &&
      rawUser.trim() !== ""
    );

    if (!isValidToken) {
      if (rawToken) localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    } else {
      axios.defaults.headers.common["Authorization"] = `Bearer ${rawToken}`;
    }

    if (isValidUser && rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setUser(parsed);
        setIsAuthenticated(true);
        syncUserShippingPincode(parsed);
      } catch (e) {
        console.error("Failed to restore user", e);
        localStorage.removeItem("user");
      }
    }

    // Refresh user state from MongoDB Atlas ONLY if a valid token exists
    if (isValidToken && rawToken) {
      axios
        .get(`${BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${rawToken}` }
        })
        .then((res) => {
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            syncUserShippingPincode(res.data.user);
          }
        })
        .catch((err) => {
          // Stale or expired token: purge from localStorage and revert cleanly to guest mode
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            delete axios.defaults.headers.common["Authorization"];
            setUser(null);
            setIsAuthenticated(false);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, {
        emailOrPhone,
        password
      });

      if (res.data.success && res.data.user) {
        const authToken = res.data.token || res.data.legacyToken;
        if (authToken) {
          localStorage.setItem("token", authToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
        }
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        syncUserShippingPincode(res.data.user);
        window.dispatchEvent(new Event("auth_login"));
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
        full_name: name,
        email,
        phone: phone || "",
        password
      });

      if (res.data.success && res.data.user) {
        const authToken = res.data.token || res.data.legacyToken;
        if (authToken) {
          localStorage.setItem("token", authToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
        }
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        syncUserShippingPincode(res.data.user);
        window.dispatchEvent(new Event("auth_login"));
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

  const sendOtp = async (email: string): Promise<{ success: boolean; message?: string; error?: string; expiresInSeconds?: number }> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/send-otp`, { email });
      return {
        success: true,
        message: res.data.message || "Verification code sent to your email.",
        expiresInSeconds: res.data.expiresInSeconds || 600
      };
    } catch (err: any) {
      console.error("sendOtp error:", err);
      return {
        success: false,
        error: err.response?.data?.error || "Failed to send verification code. Please try again."
      };
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; message?: string; error?: string; isProfileIncomplete?: boolean }> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, { email, otp });
      if (res.data.success && res.data.user) {
        const authToken = res.data.token || res.data.legacyToken;
        if (authToken) {
          localStorage.setItem("token", authToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
        }
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        syncUserShippingPincode(res.data.user);
        window.dispatchEvent(new Event("auth_login"));
        return {
          success: true,
          message: res.data.message || "Login successful",
          isProfileIncomplete: res.data.isProfileIncomplete
        };
      }
      return {
        success: false,
        error: "Verification failed. Please check your code."
      };
    } catch (err: any) {
      console.error("verifyOtp error:", err);
      return {
        success: false,
        error: err.response?.data?.error || "Invalid or expired OTP. Please try again."
      };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; isProfileIncomplete?: boolean; user?: User }> => {
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, googleProvider } = await import("../firebase");
      
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const res = await axios.post(`${BACKEND_URL}/auth/google`, {
        email: fbUser.email,
        name: fbUser.displayName || "Google User",
        full_name: fbUser.displayName || "Google User",
        firebase_uid: fbUser.uid,
        photo_url: fbUser.photoURL || ""
      });

      if (res.data.success && res.data.user) {
        const authToken = res.data.token || res.data.legacyToken;
        if (authToken) {
          localStorage.setItem("token", authToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
        }
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        syncUserShippingPincode(res.data.user);
        window.dispatchEvent(new Event("auth_login"));
        return {
          success: true,
          isProfileIncomplete: Boolean(res.data.isProfileIncomplete),
          user: res.data.user
        };
      }
      return { success: false };
    } catch (err: any) {
      console.error("Google login error:", err);
      alert("Failed to login with Google: " + (err.message || "Unknown error"));
      return { success: false };
    }
  };

  const saveShippingAddress = async (addressData: {
    firstName: string;
    lastName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    isDefault?: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const currentUser = user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null);
      if (!currentUser || !currentUser.email) {
        return { success: false, error: "No authenticated user session found." };
      }

      const fullName = `${addressData.firstName} ${addressData.lastName}`.trim();
      const newAddressObj = {
        id: `addr_${Date.now()}`,
        firstName: addressData.firstName,
        lastName: addressData.lastName,
        phone: addressData.phone,
        address: addressData.streetAddress,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        country: "India",
        isDefault: addressData.isDefault !== undefined ? addressData.isDefault : true
      };

      const existingAddresses = Array.isArray(currentUser.addresses) ? [...currentUser.addresses] : [];
      let updatedAddresses: any[];
      if (newAddressObj.isDefault) {
        updatedAddresses = [newAddressObj, ...existingAddresses.map(a => ({ ...a, isDefault: false }))];
      } else {
        updatedAddresses = [...existingAddresses, newAddressObj];
      }

      const payload = {
        email: currentUser.email,
        full_name: fullName || currentUser.full_name || currentUser.name,
        name: fullName || currentUser.full_name || currentUser.name,
        phone: addressData.phone,
        street_address: addressData.streetAddress,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.zipCode,
        addresses: updatedAddresses
      };

      const res = await axios.put(`${BACKEND_URL}/auth/profile`, payload);
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        syncUserShippingPincode(res.data.user);
        return { success: true };
      }
      return { success: false, error: "Failed to update profile." };
    } catch (err: any) {
      console.error("Save shipping address error:", err);
      const errMsg = err.response?.data?.error || err.message || "Failed to save shipping address.";
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    localStorage.removeItem("user_pincode");
    localStorage.removeItem("user_area");
    localStorage.removeItem("user_shipping_address");
    delete axios.defaults.headers.common["Authorization"];
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("auth_logout"));
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    syncUserShippingPincode(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        logout,
        updateUser,
        saveShippingAddress
      }}
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
