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
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (p: Partial<Product> & { imageFile?: File }) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product> & { imageFile?: File }) => Promise<void>;
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
              stock: img.stock !== undefined ? img.stock : 50
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
              const sellingPrice = parseInt(img.selling_price) || parseInt(img.price) || 0;
              const strikePrice = parseInt(img.strike_price) || parseInt(img.actual_price) || parseInt(img["act-price"]) || parseInt(img.actualPrice) || (sellingPrice > 0 ? Math.round(sellingPrice * 1.25) : 0);
              const finalPrice = parseInt(img.final_price) || parseInt(img.finalPrice) || parseInt(img.price) || sellingPrice;
              const discountPct = parseFloat(img.discount_percentage) || 0;
              const savings = parseInt(img.savings) || Math.max(0, strikePrice - finalPrice);
              const totalDiscountPercent = parseInt(img.total_discount_percent) || (strikePrice > 0 ? Math.round(((strikePrice - finalPrice) / strikePrice) * 100) : 0);
              const isOnSale = img.is_on_sale !== undefined ? Boolean(img.is_on_sale) : (finalPrice < strikePrice || discountPct > 0);

              catProducts.push({
                id: img.id || `${category.name || category.category}-${sub.name}-${index}`,
                title: img.title || img.name || "Untitled Product",
                name: img.title || img.name || "Untitled Product",
                description: img.description || "",
                price: finalPrice,
                sellingPrice: sellingPrice,
                actualPrice: strikePrice,
                strikePrice: strikePrice,
                finalPrice: finalPrice,
                discountPercentage: discountPct,
                discountSource: img.discount_source || null,
                categoryDiscount: parseFloat(img.category_discount) || 0,
                productDiscount: parseFloat(img.product_discount) || 0,
                savings: savings,
                totalDiscountPercent: totalDiscountPercent,
                isOnSale: isOnSale,
                image: imageUrl,
                video: img.video || "",
                category: category.name || category.category || "General",
                subCategory: sub.name,
                stock: img.stock !== undefined ? img.stock : 50
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
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts: fetchProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
