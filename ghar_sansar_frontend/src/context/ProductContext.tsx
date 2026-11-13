// src/context/ProductContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

export interface Product {
  id: string;
  title: string;
  name?: string;
  description: string;
  strikePrice: number; // Original / reference price displayed with strikethrough (e.g. ₹2,150)
  actualPrice: number; // Product's original base selling price BEFORE category discount (e.g. ₹1,650)
  discountedPrice: number; // Discounted price calculated dynamically from Actual Price when category discount is ON (e.g. ₹16.50)
  finalPrice: number; // Price customer actually pays: discountedPrice when ON, actualPrice when OFF
  categoryDiscountPercentage: number; // Category promotional discount % (e.g. 99%)
  categoryDiscountAmount: number; // Calculated from STRIKE PRICE: Strike * Discount% (e.g. ₹2,129)
  currentDifference?: number; // Difference between Strike Price and Customer Price
  hasCategoryDiscount?: boolean;
  price: number; // Customer purchase price = finalPrice (₹16.50 when 99% discount is active)
  sellingPrice: number; // alias for finalPrice
  discountPercentage: number; // alias for categoryDiscountPercentage
  isOnSale?: boolean;
  image: string;
  video?: string;
  category: string;
  subCategory: string;
  stock?: number;
  status?: "active" | "out_of_stock" | "coming_soon";
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (p: Partial<Product> & { imageFile?: File }) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product> & { imageFile?: File }) => Promise<void>;
  updateProductStatus: (id: string, status: "active" | "out_of_stock" | "coming_soon", stock?: number) => Promise<boolean>;
  deleteProduct: (id: string, category_type: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
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
      console.log("Fetching products from backend:", `${BACKEND_URL}/api/products`);

      let res;
      try {
        res = await axios.get(`${BACKEND_URL}/api/products`);
      } catch (e1) {
        try {
          res = await axios.get(`${BACKEND_URL}/products`);
        } catch (e2) {
          res = await axios.get("/products.json");
        }
      }

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
            const actualPrice = parseFloat(img.actualPrice !== undefined ? img.actualPrice : (img.actual_price !== undefined ? img.actual_price : (img.price || 0))) || 0;
            const strikePrice = parseFloat(img.strikePrice !== undefined ? img.strikePrice : (img.strike_price !== undefined ? img.strike_price : (img["act-price"] || actualPrice))) || actualPrice;
            const categoryDiscountPercentage = parseFloat(img.categoryDiscountPercentage || img.category_discount_percentage || img.discount_percentage || 0);
            const categoryDiscountAmount = parseFloat(img.categoryDiscountAmount !== undefined ? img.categoryDiscountAmount : (img.category_discount_amount !== undefined ? img.category_discount_amount : (strikePrice > 0 && categoryDiscountPercentage > 0 ? Math.round(strikePrice * (categoryDiscountPercentage / 100)) : 0)));
            const hasCategoryDiscount = categoryDiscountPercentage > 0;

            // Discounted price calculated dynamically from Actual Price
            const discountedPrice = img.discountedPrice !== undefined ? parseFloat(img.discountedPrice) : (
              hasCategoryDiscount
                ? Math.round((actualPrice - (actualPrice * (categoryDiscountPercentage / 100))) * 100) / 100
                : actualPrice
            );

            // Final price the customer actually pays
            const finalPrice = img.finalPrice !== undefined ? parseFloat(img.finalPrice) : (
              hasCategoryDiscount ? discountedPrice : actualPrice
            );

            const currentDifference = Math.max(0, strikePrice - finalPrice);
            const isOnSale = hasCategoryDiscount || strikePrice > finalPrice;

            catProducts.push({
              id: img.id || `${category.name || category.category}-${sub.name}-${index}`,
              title: img.title || img.name || "Untitled Product",
              name: img.title || img.name || "Untitled Product",
              description: img.description || "",
              strikePrice: strikePrice,
              actualPrice: actualPrice,
              discountedPrice: discountedPrice,
              finalPrice: finalPrice,
              categoryDiscountPercentage: categoryDiscountPercentage,
              categoryDiscountAmount: categoryDiscountAmount,
              currentDifference: currentDifference,
              hasCategoryDiscount: hasCategoryDiscount,
              price: finalPrice, // Customer purchase price (₹16.50 when 99% discount is active)
              sellingPrice: finalPrice,
              discountPercentage: categoryDiscountPercentage,
              isOnSale: isOnSale,
              image: imageUrl,
              video: img.video || "",
              category: category.name || category.category || "General",
              subCategory: sub.name,
              stock: img.stock !== undefined ? img.stock : 50,
              status: img.status || (img.stock !== undefined && Number(img.stock) <= 0 ? "out_of_stock" : "active")
            });
          });
        });
        // Sort items within this category according to price ascending
        catProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        allProducts.push(...catProducts);
      });

      console.log("Total products found from MongoDB Atlas:", allProducts.length);
      setProducts(allProducts);
    } catch (err) {
      console.error("Backend MongoDB Atlas products fetch failed:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products from database");
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
      if (p.status) formData.append("status", p.status);
      if (p.stock !== undefined) formData.append("stock", p.stock.toString());
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

  // Quick update product status
  const updateProductStatus = async (
    id: string,
    status: "active" | "out_of_stock" | "coming_soon",
    stock?: number
  ): Promise<boolean> => {
    try {
      await axios.patch(`${BACKEND_URL}/storage/upload/products/status`, { id, status, stock });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                stock: stock !== undefined ? stock : (status === "out_of_stock" ? 0 : (item.stock && item.stock > 0 ? item.stock : 50))
              }
            : item
        )
      );
      return true;
    } catch (err) {
      console.error("Error updating product status:", err);
      return false;
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
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        updateProductStatus,
        deleteProduct,
        refreshProducts: fetchProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
