import React, { useState, useEffect, useMemo } from "react";
import {
  Tag,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  X,
  RefreshCw,
  ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useProducts } from "../../context/ProductContext";

export interface CategoryDiscountItem {
  id: string;
  _id?: string;
  category: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
  description?: string;
  affectedProductsCount?: number;
  isCurrentlyActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const BACKEND_URL = import.meta.env.VITE_AWS_API_URL || "/api";

export default function DiscountAdmin() {
  const { products, refreshProducts } = useProducts();
  const [discounts, setDiscounts] = useState<CategoryDiscountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<CategoryDiscountItem | null>(null);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState("");
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Extract unique category names from catalog
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") return {};
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch discounts from backend
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/v1/discounts`, {
        headers: getAuthHeaders()
      });
      if (res.data.success && Array.isArray(res.data.data)) {
        setDiscounts(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load discounts:", err);
      toast.error(err.response?.data?.error || "Failed to load category discounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Compute live count of affected products for selected category in modal
  const affectedCountInModal = useMemo(() => {
    if (!selectedCategory) return 0;
    const norm = selectedCategory.trim().toLowerCase();
    return products.filter((p) => (p.category || "").trim().toLowerCase() === norm).length;
  }, [selectedCategory, products]);

  // Open modal for new discount
  const handleOpenCreateModal = () => {
    setEditingDiscount(null);
    setSelectedCategory(availableCategories[0] || "");
    setDiscountPercent("");
    // Default start date = today, end date = 14 days from now
    const today = new Date();
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);

    setStartDate(today.toISOString().split("T")[0]);
    setEndDate(twoWeeks.toISOString().split("T")[0]);
    setStatus("active");
    setDescription("");
    setFormError("");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (item: CategoryDiscountItem) => {
    setEditingDiscount(item);
    setSelectedCategory(item.category);
    setDiscountPercent(String(item.discountPercentage));
    setStartDate(item.startDate ? item.startDate.split("T")[0] : "");
    setEndDate(item.endDate ? item.endDate.split("T")[0] : "");
    setStatus(item.status);
    setDescription(item.description || "");
    setFormError("");
    setIsModalOpen(true);
  };

  // Pre-validate form
  const validateForm = () => {
    setFormError("");
    if (!selectedCategory) {
      setFormError("Please select a category.");
      return false;
    }
    const pct = parseFloat(discountPercent);
    if (isNaN(pct) || pct <= 0) {
      setFormError("Discount percentage must be greater than 0%.");
      return false;
    }
    if (pct > 100) {
      setFormError("Discount percentage cannot exceed 100%.");
      return false;
    }
    if (!startDate || !endDate) {
      setFormError("Both start and end dates are required.");
      return false;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError("End date cannot be earlier than start date.");
      return false;
    }
    return true;
  };

  // Click Submit in Form -> Directly save and activate
  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    executeSave();
  };

  // Execute actual API save (Create or Update)
  const executeSave = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setFormError("");

    try {
      const payload = {
        category: selectedCategory,
        discountPercentage: parseFloat(discountPercent),
        startDate,
        endDate,
        status,
        description
      };

      if (editingDiscount) {
        const res = await axios.put(`${BACKEND_URL}/v1/discounts/${editingDiscount.id}`, payload, {
          headers: getAuthHeaders()
        });
        if (res.data.success) {
          toast.success(`Updated ${selectedCategory} discount!`);
        }
      } else {
        const res = await axios.post(`${BACKEND_URL}/v1/discounts`, payload, {
          headers: getAuthHeaders()
        });
        if (res.data.success) {
          toast.success(`Activated ${discountPercent}% discount on ${selectedCategory}!`);
        }
      }

      setIsModalOpen(false);
      await fetchDiscounts();
      await refreshProducts();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to save discount.";
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active/inactive status
  const handleToggleStatus = async (item: CategoryDiscountItem) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    try {
      const res = await axios.patch(`${BACKEND_URL}/v1/discounts/${item.id}/status`, {
        status: newStatus
      }, {
        headers: getAuthHeaders()
      });
      if (res.data.success) {
        toast.success(`Discount ${newStatus === "active" ? "activated" : "deactivated"}!`);
        await fetchDiscounts();
        await refreshProducts();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update discount status");
    }
  };

  // Delete discount
  const handleDelete = async (item: CategoryDiscountItem) => {
    if (!window.confirm(`Are you sure you want to delete the discount for "${item.category}"?`)) {
      return;
    }

    try {
      const res = await axios.delete(`${BACKEND_URL}/v1/discounts/${item.id}`, {
        headers: getAuthHeaders()
      });
      if (res.data.success) {
        toast.success("Discount deleted successfully");
        await fetchDiscounts();
        await refreshProducts();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete discount");
    }
  };

  // Filtered discounts
  const filteredDiscounts = useMemo(() => {
    return discounts.filter((d) => {
      const matchesSearch =
        d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" ? true : d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [discounts, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const activeList = discounts.filter((d) => d.status === "active" && (d.isCurrentlyActive !== false));
    const totalCovered = activeList.reduce((sum, d) => sum + (d.affectedProductsCount || 0), 0);
    const avgPct = activeList.length > 0
      ? Math.round(activeList.reduce((sum, d) => sum + d.discountPercentage, 0) / activeList.length)
      : 0;

    return {
      total: discounts.length,
      active: activeList.length,
      affectedProducts: totalCovered,
      avgDiscount: avgPct
    };
  }, [discounts]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Discount Management
            </h1>
            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Category Pricing
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Configure category-level promotions, automated pricing deductions, and scheduled sales.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 text-sm"
        >
          <Plus className="w-5 h-5" /> Create Discount
        </button>
      </motion.div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Discounts</p>
            <p className="text-2xl font-black text-gray-900">{stats.active}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Products on Sale</p>
            <p className="text-2xl font-black text-gray-900">{stats.affectedProducts}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Discount</p>
            <p className="text-2xl font-black text-gray-900">{stats.avgDiscount}%</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Campaigns</p>
            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search category or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Campaigns Only</option>
            <option value="inactive">Inactive / Paused</option>
          </select>

          <button
            onClick={() => {
              fetchDiscounts();
              refreshProducts();
            }}
            title="Refresh Discounts"
            className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-semibold">Loading category discounts...</p>
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Discounts Found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "No discounts match your search or filter criteria."
                : "Create your first category discount to automatically apply promotions to all products in a category."}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md cursor-pointer"
            >
              Create Category Discount
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4 text-center">Affected Products</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredDiscounts.map((item) => {
                  const isActiveNow = item.status === "active" && item.isCurrentlyActive !== false;
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Category */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-black text-xs shrink-0">
                            {item.category.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.category}</p>
                            {item.description && (
                              <p className="text-xs text-gray-400 truncate max-w-xs">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Discount % */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <TrendingDown className="w-3 h-3" />
                          {item.discountPercentage}% OFF
                        </span>
                      </td>

                      {/* Number of Products Affected */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-800">
                          <ShoppingBag className="w-3.5 h-3.5 text-gray-500" />
                          {item.affectedProductsCount || 0} Products
                        </span>
                      </td>

                      {/* Start Date & End Date */}
                      <td className="py-4 px-4">
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              {item.startDate ? new Date(item.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] pl-5">
                            <span>to</span>
                            <span>
                              {item.endDate ? new Date(item.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isActiveNow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                            <XCircle className="w-3 h-3 text-gray-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-xs text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleToggleStatus(item)}
                            title={item.status === "active" ? "Deactivate" : "Activate"}
                            className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                              item.status === "active"
                                ? "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                            }`}
                          >
                            {item.status === "active" ? "Pause" : "Activate"}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Discount"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item)}
                            title="Delete Discount"
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
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
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {editingDiscount ? "Edit Category Discount" : "Create Category Discount"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Apply promotional pricing across all products in a chosen category.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitClick} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {/* Affected products live preview badge */}
                  <div className="mt-2 flex items-center justify-between text-xs bg-blue-50/70 border border-blue-100 rounded-lg px-3 py-2 text-blue-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Affected Products:
                    </span>
                    <span className="font-bold">{affectedCountInModal} Products in catalog</span>
                  </div>
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Discount Percentage (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      placeholder="e.g. 10 or 15.5"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                      %
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Value must be between 0.1% and 100%. (e.g., 10% on ₹2,500 = ₹2,250 final customer price).
                  </p>
                </div>

                {/* Date Range: Start Date & End Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Campaign Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus("active")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                        status === "active"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Active (Apply now)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("inactive")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                        status === "inactive"
                          ? "bg-gray-100 border-gray-500 text-gray-900 shadow-xs"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Inactive (Draft)
                    </button>
                  </div>
                </div>

                {/* Description / Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Optional Description / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Festival clearance sale on all kitchen items"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : editingDiscount ? "Update Discount" : "Save & Activate"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL (Requirement #12) */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-gray-100"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirm Discount Activation</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  This will apply a <span className="font-black text-gray-900">{discountPercent}% discount</span> to{" "}
                  <span className="font-black text-gray-900">{affectedCountInModal} products</span> in{" "}
                  <span className="font-black text-gray-900">{selectedCategory}</span>.
                </p>
                <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
                  <p>• Customers will immediately see the discounted final price.</p>
                  <p>• The original price will appear crossed out.</p>
                  <p>• Newly added products in this category will also receive this discount.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={executeSave}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? "Activating..." : "Activate Discount"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
