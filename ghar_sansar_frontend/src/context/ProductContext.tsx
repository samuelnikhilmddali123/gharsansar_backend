// src/context/ProductContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  actualPrice: number;
  image: string;
  video?: string;
  category: string;
  subCategory: string;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (p: Partial<Product> & { imageFile?: File }) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product> & { imageFile?: File }) => Promise<void>;
  deleteProduct: (id: string, category_type: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
};

// Fix CloudFront / URL issues
const fixImageUrl = (url: string) => {
  if (!url) return "";
  let fixed = url
    .replace(/^https?:\/\/https?:\/\//, "https://")
    .replace(/\s/g, "%20")
    .replace(/([^:]\/)\/+/g, "$1");
  
  // Strip localhost / 127.0.0.1 / private IPs from image URLs so they load as relative paths through the current domain / tunnel proxy
  fixed = fixed.replace(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?/, "");

  // Enforce HTTPS for known live backend domains to prevent Mixed Content errors
  if (fixed.startsWith("http://backend.gharsansar.website") || fixed.startsWith("http://lx70r6zsef")) {
    fixed = fixed.replace(/^http:/, "https:");
  }

  // Add crossorigin attribute support for CloudFront CDN
  if (fixed.includes('cloudfront.net')) {
    // Ensure proper protocol
    if (!fixed.startsWith('http')) {
      fixed = 'https:' + fixed;
    }
  }
  return fixed;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BACKEND_URL = import.meta.env.VITE_AWS_API_URL || "/api";
  const API_BASE = import.meta.env.VITE_AWS_API_URL || "https://lx70r6zsef.execute-api.ap-south-1.amazonaws.com/prod/api";

  // Fetch all products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching products from local backend:", `${BACKEND_URL}/products`);

      const res = await axios.get(`${BACKEND_URL}/products`);

      const data = res.data;
      const allProducts: Product[] = [];

      // Handle the new API structure or local JSON array
      const rawCategories = Array.isArray(data) ? data : (data.data || data.categories || []);
      const categories = Array.isArray(rawCategories) ? rawCategories : [];

      console.log("Categories found:", categories.length);

      // Prioritize Sonu Steel Products first
      const sortedCategories = [...categories].sort((a: any, b: any) => {
        const nameA = (a.name || a.category || "").toLowerCase();
        const nameB = (b.name || b.category || "").toLowerCase();
        const aIsSonu = nameA.includes("sonu") ? 1 : 0;
        const bIsSonu = nameB.includes("sonu") ? 1 : 0;
        return bIsSonu - aIsSonu;
      });

      sortedCategories.forEach((category: any) => {
        const catProducts: Product[] = [];
        category.subcategories?.forEach((sub: any) => {
          // Try 'products', 'images', and 'services'
          const items = sub.products || sub.images || sub.services || [];
          items.forEach((img: any, index: number) => {
            const imageUrl = fixImageUrl(img.image);
            catProducts.push({
              id: img.id || `${category.name || category.category}-${sub.name}-${index}`,
              title: img.title || img.name || "Untitled Product",
              description: img.description || "",
              price: parseInt(img.price) || parseInt(img["act-price"]) || 0,
              actualPrice: parseInt(img["act-price"]) || parseInt(img.actual_price) || 0,
              image: imageUrl,
              video: img.video || "",
              category: category.name || category.category || "General",
              subCategory: sub.name,
            });
          });
        });
        // Sort items within this category according to price ascending
        catProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        allProducts.push(...catProducts);
      });

      console.log("Total products found:", allProducts.length);
      setProducts(allProducts);
    } catch (err) {
      console.warn("Backend API fetch failed, trying static /products.json fallback:", err);
      try {
        const localRes = await axios.get("/products.json");
        const categories = Array.isArray(localRes.data) ? localRes.data : [];
        const fallbackProducts: Product[] = [];
        
        // Prioritize Sonu Steel Products first in fallback as well
        const sortedFallbackCategories = [...categories].sort((a: any, b: any) => {
          const nameA = (a.name || a.category || "").toLowerCase();
          const nameB = (b.name || b.category || "").toLowerCase();
          const aIsSonu = nameA.includes("sonu") ? 1 : 0;
          const bIsSonu = nameB.includes("sonu") ? 1 : 0;
          return bIsSonu - aIsSonu;
        });

        sortedFallbackCategories.forEach((category: any) => {
          const catProducts: Product[] = [];
          category.subcategories?.forEach((sub: any) => {
            const items = sub.products || sub.images || sub.services || [];
            items.forEach((img: any, index: number) => {
              const imageUrl = fixImageUrl(img.image);
              catProducts.push({
                id: img.id || `${category.name || category.category}-${sub.name}-${index}`,
                title: img.title || img.name || "Untitled Product",
                description: img.description || "",
                price: parseInt(img.price) || parseInt(img["act-price"]) || 0,
                actualPrice: parseInt(img["act-price"]) || parseInt(img.actual_price) || 0,
                image: imageUrl,
                video: img.video || "",
                category: category.name || category.category || "General",
                subCategory: sub.name,
              });
            });
          });
          // Sort items within this category according to price ascending
          catProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
          fallbackProducts.push(...catProducts);
        });
        if (fallbackProducts.length > 0) {
          console.log("Loaded products from static /products.json:", fallbackProducts.length);
          setProducts(fallbackProducts);
          return;
        }
      } catch (localErr) {
        console.error("Static products fallback also failed:", localErr);
      }
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product
  const addProduct = async (p: Partial<Product> & { imageFile?: File }) => {
    try {
      const formData = new FormData();
      formData.append("category_name", p.category || "");
      formData.append("subcategory_name", p.subCategory || "");
      formData.append("title", p.title || "");
      formData.append("price", (p.price ?? 0).toString());
      formData.append("actual_price", (p.actualPrice ?? 0).toString());
      formData.append("description", p.description || "");
      if (p.video) formData.append("video", p.video);

      if (p.imageFile) {
        formData.append("image", p.imageFile, p.imageFile.name.replace(/\s/g, "-"));
      }

      await axios.post(`${BACKEND_URL}/storage/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  // Update product
  const updateProduct = async (id: string, p: Partial<Product> & { imageFile?: File }) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("category_name", p.category || "");
      formData.append("subcategory_name", p.subCategory || "");
      formData.append("title", p.title || "");
      formData.append("price", Math.floor(p.price ?? 0).toString());
      formData.append("actual_price", Math.floor(p.actualPrice ?? 0).toString());
      formData.append("description", p.description || "");
      if (p.video) formData.append("video", p.video);

      if (p.imageFile) {
        formData.append("image", p.imageFile, p.imageFile.name.replace(/\s/g, "-"));
      }

      await axios.put(`${BACKEND_URL}/storage/upload/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };



  // Delete product
  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/storage/uploads/products?id=${id}`);
      setProducts((prev) => prev.filter((prod) => prod.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};
