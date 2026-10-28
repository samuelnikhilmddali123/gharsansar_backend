import React, { useState, useEffect, useMemo } from "react";
import { 
  Save, 
  Edit3, 
  Trash2, 
  ImagePlus, 
  Search, 
  X, 
  Filter, 
  Plus, 
  Package, 
  ChevronDown, 
  ChevronRight, 
  Percent, 
  Tag, 
  LayoutList, 
  LayoutGrid, 
  AlertCircle, 
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Controlled Two-Price Product type (Section 1, 12, 13)
interface Product {
  id: string;
  title: string;
  description: string;
  strikePrice: number; // Original / reference price displayed with strikethrough (e.g. ₹3,000)
  actualPrice: number; // Current product price entered manually by admin (e.g. ₹2,500)
  categoryDiscountPercentage: number; // Category discount % (e.g. 10%)
  categoryDiscountAmount: number; // Strike Price × Category Discount % (e.g. ₹300)
  currentDifference?: number; // Strike Price - Actual Price (e.g. ₹500)
  hasCategoryDiscount?: boolean;
  price: string; // Compatibility
  actual_price?: string;
  strike_price?: number;
  final_price?: number;
  image: string | File;
  video?: string;
  category: string;
  subCategory: string;
  features?: string[];
  stock?: number;
}

// Category type
interface Category {
  cat_id: string;
  name: string;
  subcategories: { sub_id: string; name: string }[];
}

interface CategoryDiscount {
  id: string;
  category: string;
  discountPercentage: number;
  startDate?: string;
  endDate?: string;
  status: string;
  isCurrentlyActive?: boolean;
}

// Fix CloudFront/S3 URLs or create object URL for File type images
const fixImageUrl = (url: string | File) => {
  if (!url) return "";
  if (url instanceof File) return URL.createObjectURL(url);
  let fixed = url.replace(/^https?:\/\/https?:\/\//, "https://").replace(/\s/g, "%20").replace(/([^:]\/)\/+/g, "$1");
  if (fixed.startsWith("http://backend.gharsansar.website") || fixed.startsWith("http://lx70r6zsef")) {
    fixed = fixed.replace(/^http:/, "https:");
  }
  return fixed;
};

const ProductsAdmin: React.FC = () => {
  const API_BASE =
    import.meta.env.VITE_AWS_API_URL ||
    "/api";

  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [categoryDiscounts, setCategoryDiscounts] = useState<CategoryDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Filters state (Section 6 & 14)
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [discountFilter, setDiscountFilter] = useState<"All" | "Discounted" | "Non-Discounted">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Out of Stock">("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "catalog">("table");

  // Table pagination
  const [tablePage, setTablePage] = useState(1);
  const TABLE_PAGE_SIZE = 12;

  // Accordion state
  const [expandedCategories, setExpandedCategories] = useState<{ [categoryName: string]: boolean }>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<{ [key: string]: boolean }>({});
  const [currentPages, setCurrentPages] = useState<{ [key: string]: number }>({});
  const ITEMS_PER_PAGE = 6;

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const toggleSubcategory = (catName: string, subName: string) => {
    const key = `${catName}-${subName}`;
    setExpandedSubcategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getPageForSubcategory = (catName: string, subName: string) => {
    return currentPages[`${catName}-${subName}`] || 1;
  };

  const setPageForSubcategory = (catName: string, subName: string, page: number) => {
    setCurrentPages(prev => ({ ...prev, [`${catName}-${subName}`]: page }));
  };

  // Section 7: Form State for Two Separate Prices
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "", // Actual Price (e.g. 2500)
    actual_price: "", // Strike Price (e.g. 3000)
    image: "" as string | File,
    category: "Idols",
    subCategory: "Premium Line",
    features: [] as string[],
    stock: "50",
  });

  // Fetch active category discounts
  const fetchCategoryDiscounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/discounts`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategoryDiscounts(data.data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch category discounts:", err);
    }
  };

  // Fetch categories and products
  const fetchCategoriesAndProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/storage/upload/products`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
      const data = await res.json();

      const categories = data.data || [];

      // Store categories
      setCategoriesData(
        categories.map((cat: any) => ({
          cat_id: cat.cat_id,
          name: cat.name,
          subcategories: (cat.subcategories || []).map((sub: any) => ({
            sub_id: sub.sub_id,
            name: sub.name,
          })),
        }))
      );

      // Flatten all products with controlled two-price architecture
      const allProducts: Product[] = [];
      categories.forEach((category: any) => {
        category.subcategories?.forEach((sub: any) => {
          const items = sub.products || sub.images || sub.services || [];
          items.forEach((p: any) => {
            const rawActual = p.actualPrice !== undefined ? parseFloat(p.actualPrice) : (parseFloat(p.actual_price) || parseFloat(p.price) || 0);
            const rawStrike = p.strikePrice !== undefined ? parseFloat(p.strikePrice) : (parseFloat(p.strike_price) || parseFloat(p["act-price"]) || rawActual);
            const catDiscountPct = parseFloat(p.categoryDiscountPercentage || p.category_discount_percentage || p.discount_percentage || 0);
            const catDiscountAmt = parseFloat(p.categoryDiscountAmount || p.category_discount_amount || (rawStrike > 0 && catDiscountPct > 0 ? Math.round(rawStrike * (catDiscountPct / 100)) : 0));
            const diff = Math.max(0, rawStrike - rawActual);

            allProducts.push({
              id: p.prod_id || p.id,
              title: p.title || p.name || "Untitled Product",
              description: p.description || "No description",
              strikePrice: rawStrike,
              actualPrice: rawActual,
              categoryDiscountPercentage: catDiscountPct,
              categoryDiscountAmount: catDiscountAmt,
              currentDifference: diff,
              hasCategoryDiscount: catDiscountPct > 0,
              price: rawActual.toString(),
              actual_price: rawActual.toString(),
              strike_price: rawStrike,
              final_price: rawActual, // Customer pays actualPrice (₹2,500)
              image: fixImageUrl(p.image),
              category: category.name,
              subCategory: sub.name,
              stock: p.stock !== undefined ? p.stock : 50,
            });
          });
        });
      });

      setProducts(allProducts);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndProducts();
    fetchCategoryDiscounts();
  }, []);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setForm({ ...form, image: file });
      setExistingImageUrl(null);
    }
  };

  // Section 7: Real-time form pricing calculations
  const formStrikePrice = parseFloat(form.actual_price) || 0; // Strike Price (e.g. ₹3,000)
  const formActualPrice = parseFloat(form.price) || 0; // Actual Price (e.g. ₹2,500)

  // Current Difference: Strike Price - Actual Price (e.g. ₹500)
  const formCurrentDifference = Math.max(0, formStrikePrice - formActualPrice);

  // Check if selected category has an active category discount
  const activeCategoryDiscount = useMemo(() => {
    if (!form.category) return null;
    const normFormCat = form.category.toLowerCase().replace(/[^a-z0-9]/g, "");
    return categoryDiscounts.find(d => {
      if (!d.isCurrentlyActive && d.status !== "active") return false;
      const normD = (d.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return normD === normFormCat || normFormCat.includes(normD) || normD.includes(normFormCat);
    });
  }, [form.category, categoryDiscounts]);

  const formCategoryDiscountPct = activeCategoryDiscount ? activeCategoryDiscount.discountPercentage : 0;

  // Formula: Discount calculated from Strike Price = Strike Price × Category Discount %
  const formCategoryDiscountAmount = formStrikePrice > 0 && formCategoryDiscountPct > 0
    ? Math.round(formStrikePrice * (formCategoryDiscountPct / 100))
    : 0;

  // Validation: Actual Price should normally not exceed Strike Price
  const isPriceHigherThanStrike = formStrikePrice > 0 && formActualPrice > formStrikePrice;

  // Handle form submit (Add or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Product title is required.");
      return;
    }
    if (!form.price || formActualPrice <= 0) {
      alert("A valid Actual Price is required.");
      return;
    }
    if (!form.image && !existingImageUrl) {
      alert("Product image is required.");
      return;
    }

    // Default strike price to actual price if not provided
    const finalStrikePriceToSave = formStrikePrice > 0 ? formStrikePrice : formActualPrice;

    try {
      let res: Response;

      // UPDATE PRODUCT
      if (editingId) {
        const params = new URLSearchParams();
        params.append("id", editingId);
        params.append("title", form.title);
        params.append("price", formActualPrice.toString());
        params.append("actual_price", finalStrikePriceToSave.toString());
        params.append("description", form.description);
        params.append("category_name", form.category);
        params.append("subcategory_name", form.subCategory);
        params.append("stock", form.stock);

        res = await fetch(`${API_BASE}/storage/upload/products`, {
          method: "PUT",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        });
      }
      // CREATE PRODUCT
      else {
        const formData = new FormData();
        formData.append("category_type", "products");
        formData.append("category_name", form.category);
        formData.append("subcategory_name", form.subCategory);
        formData.append("title", form.title);
        formData.append("price", formActualPrice.toString());
        formData.append("actual_price", finalStrikePriceToSave.toString());
        formData.append("description", form.description);
        formData.append("stock", form.stock);
        if (form.image instanceof File) {
          formData.append("image", form.image);
        }

        res = await fetch(`${API_BASE}/storage/upload`, {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      await fetchCategoriesAndProducts();
      alert(editingId ? "✅ Product updated successfully!" : "✅ Product created successfully!");
      resetForm();
    } catch (err: any) {
      console.error("❌ Error uploading product:", err);
      alert(`Upload failed: ${err.message || "Check console for details"}`);
    }
  };

  // Edit Product
  const handleEdit = (id: string) => {
    const p = products.find((p) => p.id === id);
    if (!p) {
      alert("Product not found!");
      return;
    }

    setForm({
      title: p.title,
      description: p.description,
      price: (p.actualPrice !== undefined ? p.actualPrice : p.price).toString(),
      actual_price: (p.strikePrice !== undefined ? p.strikePrice : (p.actual_price || p.price)).toString(),
      image: "",
      category: p.category,
      subCategory: p.subCategory,
      features: p.features || [],
      stock: p.stock !== undefined ? p.stock.toString() : "50",
    });
    setPreview(null);
    setExistingImageUrl(fixImageUrl(p.image));
    setEditingId(id);
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API_BASE}/storage/uploads/products?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      alert("🗑️ Product deleted successfully!");
      await fetchCategoriesAndProducts();
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      alert("Delete failed. Check console for details.");
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      price: "",
      actual_price: "",
      image: "",
      category: categoriesData[0]?.name || "Idols",
      subCategory: categoriesData[0]?.subcategories[0]?.name || "Premium Line",
      features: [],
      stock: "50",
    });
    setPreview(null);
    setExistingImageUrl(null);
    setEditingId(null);
    setShowForm(false);
  };

  // Section 6 & 14: Filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search term (title / description)
      const matchesSearch = searchTerm
        ? p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      // 2. Category filter
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;

      // 3. Discount filter
      const isDiscounted = (p.categoryDiscountPercentage && p.categoryDiscountPercentage > 0) ||
                           (p.strikePrice && p.actualPrice && p.strikePrice > p.actualPrice);
      let matchesDiscount = true;
      if (discountFilter === "Discounted") matchesDiscount = Boolean(isDiscounted);
      else if (discountFilter === "Non-Discounted") matchesDiscount = !isDiscounted;

      // 4. Status filter (Active / In Stock vs Out of Stock)
      const stockQty = p.stock !== undefined ? p.stock : 50;
      let matchesStatus = true;
      if (statusFilter === "Active") matchesStatus = stockQty > 0;
      else if (statusFilter === "Out of Stock") matchesStatus = stockQty === 0;

      // 5. Price range filter (based on Actual Price)
      const priceVal = p.actualPrice || parseFloat(p.price) || 0;
      const minP = parseFloat(minPrice);
      const maxP = parseFloat(maxPrice);
      let matchesPrice = true;
      if (!isNaN(minP) && priceVal < minP) matchesPrice = false;
      if (!isNaN(maxP) && priceVal > maxP) matchesPrice = false;

      return matchesSearch && matchesCategory && matchesDiscount && matchesStatus && matchesPrice;
    });
  }, [products, searchTerm, categoryFilter, discountFilter, statusFilter, minPrice, maxPrice]);

  const uniqueCategories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  // Grouped products for catalog view
  const groupedProducts = useMemo(() => {
    const groups: {
      [category: string]: {
        [subcategory: string]: Product[]
      }
    } = {};

    filteredProducts.forEach(p => {
      if (!groups[p.category]) groups[p.category] = {};
      if (!groups[p.category][p.subCategory]) groups[p.category][p.subCategory] = [];
      groups[p.category][p.subCategory].push(p);
    });

    return groups;
  }, [filteredProducts]);

  // Paginated table items
  const totalTablePages = Math.ceil(filteredProducts.length / TABLE_PAGE_SIZE) || 1;
  const paginatedTableProducts = useMemo(() => {
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return filteredProducts.slice(start, start + TABLE_PAGE_SIZE);
  }, [filteredProducts, tablePage]);

  // Reset pagination on filter change
  useEffect(() => {
    setTablePage(1);
  }, [searchTerm, categoryFilter, discountFilter, statusFilter, minPrice, maxPrice]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-600 mt-1">
            Independently manage Strike Price and Actual Price with Strike-based Category Discounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutList className="w-4 h-4" /> Table View
            </button>
            <button
              onClick={() => setViewMode("catalog")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "catalog"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Grouped Catalog
            </button>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all font-semibold inline-flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </motion.div>

      {/* Filter Bar (Section 6 & 14) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition appearance-none bg-white"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Discount Filter */}
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={discountFilter}
              onChange={(e) => setDiscountFilter(e.target.value as any)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition appearance-none bg-white"
            >
              <option value="All">All Discounts</option>
              <option value="Discounted">Discounted Products Only</option>
              <option value="Non-Discounted">Non-discounted Products</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition appearance-none bg-white"
            >
              <option value="All">All Stock Status</option>
              <option value="Active">Active / In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Actual Price Range (₹):
            </span>
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {(searchTerm || categoryFilter !== "All" || discountFilter !== "All" || statusFilter !== "All" || minPrice || maxPrice) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                  setDiscountFilter("All");
                  setStatusFilter("All");
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="ml-2 text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-800">{filteredProducts.length}</strong> of {products.length} products
          </div>
        </div>
      </motion.div>

      {/* Section 7: Add / Edit Product Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Two separate prices: Strike Price (reference) and Actual Price (manually set)
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Title & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Sonu Shirt"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  placeholder="Enter product description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition h-24 resize-none"
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const subs = categoriesData.find((c) => c.name === newCat)?.subcategories || [];
                      setForm({
                        ...form,
                        category: newCat,
                        subCategory: subs[0]?.name || "",
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition appearance-none bg-white"
                  >
                    {categoriesData.map((cat) => (
                      <option key={cat.cat_id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Subcategory *
                  </label>
                  <select
                    value={form.subCategory}
                    onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition appearance-none bg-white"
                  >
                    {categoriesData
                      .find((c) => c.name === form.category)
                      ?.subcategories.map((sub) => (
                        <option key={sub.sub_id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Section 7: Dedicated Pricing Section (Two Separate Prices) */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 rounded-2xl border border-indigo-100 p-6 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-indigo-600 text-white rounded-lg">
                      <Percent className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">Pricing</h3>
                      <p className="text-xs text-gray-500">
                        Admin independently enters Strike Price and Actual Price
                      </p>
                    </div>
                  </div>
                  {activeCategoryDiscount && (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-200">
                      Category Offer Active: {activeCategoryDiscount.discountPercentage}% OFF
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Strike Price */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Strike Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="e.g., 3000"
                        value={form.actual_price}
                        onChange={(e) => setForm({ ...form, actual_price: e.target.value })}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-800"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Reference price displayed crossed out (~~₹3,000~~)
                    </p>
                  </div>

                  {/* Actual Price */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Actual Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="e.g., 2500"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className={`w-full pl-8 pr-4 py-2.5 border rounded-xl focus:ring-2 outline-none font-bold text-gray-900 ${
                          isPriceHigherThanStrike
                            ? "border-rose-500 bg-rose-50/50 focus:ring-rose-500 text-rose-900"
                            : "border-gray-300 focus:ring-indigo-500"
                        }`}
                        required
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Current base price entered manually. Never reduced by category discount!
                    </p>
                  </div>
                </div>

                {/* Validation Note */}
                {isPriceHigherThanStrike && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-bold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      Notice: Actual Price (₹{formActualPrice}) is higher than Strike Price (₹{formStrikePrice}). Actual Price should normally not exceed Strike Price.
                    </span>
                  </motion.div>
                )}

                {/* Section 7 Calculated Preview Box */}
                <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
                    Current Product Pricing Preview
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                        Strike Price
                      </span>
                      <span className="text-lg font-extrabold text-gray-700 line-through">
                        ₹{formStrikePrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-emerald-600 font-bold block">
                        Actual Price
                      </span>
                      <span className="text-2xl font-black text-emerald-700">
                        ₹{formActualPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        (Unchanged customer price)
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                        Current Difference
                      </span>
                      <span className="text-lg font-extrabold text-gray-900">
                        ₹{formCurrentDifference.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        (Strike Price - Actual Price)
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-amber-600 font-bold block">
                        Category Discount
                      </span>
                      {formCategoryDiscountPct > 0 ? (
                        <div>
                          <span className="text-lg font-extrabold text-amber-600">
                            {formCategoryDiscountPct}% OFF
                          </span>
                          <span className="text-[11px] font-bold text-indigo-700 block mt-0.5">
                            ₹{formCategoryDiscountAmount.toLocaleString("en-IN")} from Strike Price
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-gray-400">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Product Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition cursor-pointer text-sm"
                />
                {(preview || existingImageUrl) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded-xl inline-block"
                  >
                    <img
                      src={preview || existingImageUrl || ""}
                      alt="Preview"
                      className="w-48 h-48 object-contain rounded-lg bg-white"
                    />
                  </motion.div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all font-semibold inline-flex items-center gap-2"
                >
                  {editingId ? (
                    <>
                      <Save className="w-4 h-4" /> Update Product
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-4 h-4" /> Save Product
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 14: Admin Product Table */}
      {viewMode === "table" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Products Catalog ({filteredProducts.length})</h2>
              <p className="text-xs text-gray-500">
                Showing Strike Price, Actual Price, Category Discount %, and Discount Amount calculated from Strike Price
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              Two-Price System Active
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
            </div>
          ) : paginatedTableProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-bold border-b border-gray-200">
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Strike Price</th>
                    <th className="py-3.5 px-4 text-right">Actual Price</th>
                    <th className="py-3.5 px-4 text-center">Category Discount</th>
                    <th className="py-3.5 px-4 text-right">Discount Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {paginatedTableProducts.map((p) => {
                    const strikeVal = p.strikePrice || p.strike_price || parseFloat(p.actual_price || p.price);
                    const actualVal = p.actualPrice || parseFloat(p.price);
                    const catDiscountPct = p.categoryDiscountPercentage || 0;
                    const discountAmt = p.categoryDiscountAmount !== undefined
                      ? p.categoryDiscountAmount
                      : (strikeVal > 0 && catDiscountPct > 0 ? Math.round(strikeVal * (catDiscountPct / 100)) : 0);
                    const stock = p.stock !== undefined ? p.stock : 50;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Product Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                              <img
                                src={fixImageUrl(p.image)}
                                alt={p.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="max-w-[200px] sm:max-w-[260px]">
                              <p className="font-bold text-gray-900 truncate" title={p.title}>
                                {p.title}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {p.subCategory}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category Column */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            {p.category}
                          </span>
                        </td>

                        {/* Strike Price Column (crossed out) */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-gray-400 line-through font-normal">
                            ₹{strikeVal.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Actual Price Column (bold, customer pays this) */}
                        <td className="py-3.5 px-4 text-right font-black text-gray-900 text-base">
                          ₹{actualVal.toLocaleString("en-IN")}
                        </td>

                        {/* Category Discount Column */}
                        <td className="py-3.5 px-4 text-center">
                          {catDiscountPct > 0 ? (
                            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                              {catDiscountPct}%
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* Discount Amount Column (calculated from Strike Price) */}
                        <td className="py-3.5 px-4 text-right font-semibold text-indigo-700">
                          {discountAmt > 0 ? `₹${discountAmt.toLocaleString("en-IN")}` : "—"}
                        </td>

                        {/* Status Column */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold ${
                              stock > 10
                                ? "bg-emerald-100 text-emerald-800"
                                : stock > 0
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {stock > 0 ? "Active" : "Out of Stock"}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleEdit(p.id)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                              title="Edit product pricing"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table Pagination */}
              {totalTablePages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                    disabled={tablePage === 1}
                    className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-600">
                    Page <strong>{tablePage}</strong> of <strong>{totalTablePages}</strong>
                  </span>
                  <button
                    onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                    disabled={tablePage === totalTablePages}
                    className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 mb-1">No products match the selected filters</h3>
              <p className="text-xs text-gray-400">Try clearing filters or search term</p>
            </div>
          )}
        </motion.div>
      ) : (
        /* Grouped Catalog View */
        <div className="space-y-4">
          {Object.keys(groupedProducts).length > 0 ? (
            Object.keys(groupedProducts).map((catName) => {
              const isCatExpanded = !!expandedCategories[catName];
              const subcats = groupedProducts[catName];
              const totalItemsInCat = Object.values(subcats).reduce((acc, curr) => acc + curr.length, 0);

              return (
                <div key={catName} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleCategory(catName)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50/70 hover:bg-gray-100/70 transition-colors border-b border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900">{catName}</h3>
                        <p className="text-xs text-gray-500">
                          {totalItemsInCat} products across {Object.keys(subcats).length} subcategories
                        </p>
                      </div>
                    </div>
                    {isCatExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {isCatExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 space-y-4"
                      >
                        {Object.keys(subcats).map((subName) => {
                          const subcatKey = `${catName}-${subName}`;
                          const isSubExpanded = !!expandedSubcategories[subcatKey];
                          const allSubProducts = subcats[subName];
                          const page = getPageForSubcategory(catName, subName);
                          const totalPages = Math.ceil(allSubProducts.length / ITEMS_PER_PAGE);
                          const startIndex = (page - 1) * ITEMS_PER_PAGE;
                          const paginatedProducts = allSubProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                          return (
                            <div key={subName} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/30">
                              <button
                                onClick={() => toggleSubcategory(catName, subName)}
                                className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-gray-50 transition-colors border-b border-gray-200"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                  <h4 className="font-semibold text-sm text-gray-800">{subName}</h4>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                    {allSubProducts.length}
                                  </span>
                                </div>
                                {isSubExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                              </button>

                              <AnimatePresence initial={false}>
                                {isSubExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-4"
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {paginatedProducts.map((p) => {
                                        const strikeVal = p.strikePrice || p.strike_price || parseFloat(p.actual_price || p.price);
                                        const actualVal = p.actualPrice || parseFloat(p.price);
                                        const catDiscountPct = p.categoryDiscountPercentage || 0;
                                        const discountAmt = p.categoryDiscountAmount !== undefined
                                          ? p.categoryDiscountAmount
                                          : (strikeVal > 0 && catDiscountPct > 0 ? Math.round(strikeVal * (catDiscountPct / 100)) : 0);

                                        return (
                                          <div
                                            key={p.id}
                                            className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-md transition-shadow p-3.5 flex flex-col justify-between"
                                          >
                                            <div>
                                              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3 relative flex items-center justify-center p-2">
                                                {catDiscountPct > 0 && (
                                                  <span className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                                                    {catDiscountPct}% OFF
                                                  </span>
                                                )}
                                                <img
                                                  src={fixImageUrl(p.image)}
                                                  alt={p.title}
                                                  className="w-full h-full object-contain"
                                                />
                                              </div>
                                              <h5 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">
                                                {p.title}
                                              </h5>
                                              <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                                {p.description}
                                              </p>
                                            </div>

                                            <div>
                                              {/* Strike Price & Actual Price */}
                                              <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-base font-extrabold text-gray-950">
                                                  ₹{actualVal.toLocaleString("en-IN")}
                                                </span>
                                                {strikeVal > actualVal && (
                                                  <span className="text-xs text-gray-400 line-through">
                                                    ₹{strikeVal.toLocaleString("en-IN")}
                                                  </span>
                                                )}
                                              </div>
                                              {discountAmt > 0 && (
                                                <p className="text-[11px] font-semibold text-indigo-600 mb-2">
                                                  Discount: ₹{discountAmt.toLocaleString("en-IN")} from Strike Price
                                                </p>
                                              )}

                                              <div className="flex gap-2 pt-2 border-t border-gray-100">
                                                <button
                                                  onClick={() => handleEdit(p.id)}
                                                  className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
                                                >
                                                  <Edit3 className="w-3.5 h-3.5" /> Edit
                                                </button>
                                                <button
                                                  onClick={() => handleDelete(p.id)}
                                                  className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 text-xs">
                                        <button
                                          onClick={() => setPageForSubcategory(catName, subName, page - 1)}
                                          disabled={page === 1}
                                          className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
                                        >
                                          Previous
                                        </button>
                                        <span>
                                          Page {page} of {totalPages}
                                        </span>
                                        <button
                                          onClick={() => setPageForSubcategory(catName, subName, page + 1)}
                                          disabled={page === totalPages}
                                          className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
                                        >
                                          Next
                                        </button>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700">No products match current filters</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;
