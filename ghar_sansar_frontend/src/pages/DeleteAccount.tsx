import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  ArrowLeft,
  Lock,
  Clock,
  HelpCircle,
  Info
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_AWS_API_URL || "/api";

export const DeleteAccount: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ message: string; requestId: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmed) {
      toast.error("Please confirm that you understand this action is permanent.");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      toast.error("Please enter your registered email address or phone number.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(`${BACKEND_URL}/v1/auth/delete-account-request`, {
        email: email.trim(),
        phone: phone.trim(),
        reason: reason.trim()
      });

      if (res.data.success) {
        setSuccessInfo({
          message: res.data.message || "Account deletion request processed successfully.",
          requestId: res.data.requestId || `req_${Date.now()}`
        });
        toast.success("Account deletion request submitted.");
        if (isAuthenticated) {
          setTimeout(() => {
            logout();
          }, 2500);
        }
      } else {
        toast.error(res.data.error || "Failed to submit request.");
      }
    } catch (err: any) {
      console.error("Account deletion request error:", err);
      toast.error(err.response?.data?.error || "Error processing deletion request. Please contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans pb-24">
      {/* Top Breadcrumb Header */}
      <div className="bg-[#00281b] text-white pt-10 pb-16 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Ghar Sansar Home
          </Link>

          <div className="inline-flex items-center space-x-2 bg-red-500/20 border border-red-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-red-200 mb-4 backdrop-blur-sm">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Google Play &amp; App Store Data Safety Policy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-4 text-white">
            Delete Your Ghar Sansar Account
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            In compliance with Google Play Store, Apple App Store, and Indian Data Privacy Standards,
            you have full rights to request the permanent deletion of your account and associated personal data.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <AnimatePresence mode="wait">
          {successInfo ? (
            /* Success Confirmation Box */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8 sm:p-10 text-center"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-200">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                Deletion Request Confirmed
              </h2>
              <p className="text-sm text-gray-600 mb-6 max-w-lg mx-auto">
                {successInfo.message}
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-md mx-auto mb-8 text-left">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Reference Request ID
                </span>
                <span className="font-mono text-sm font-bold text-gray-900 select-all block mt-0.5">
                  {successInfo.requestId}
                </span>
                <span className="text-xs text-gray-500 block mt-2">
                  Please save this ID for your records. If you have any inquiries, email us at{" "}
                  <strong className="text-gray-800">gharsansarshop@gmail.com</strong>.
                </span>
              </div>

              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#004D40] hover:bg-[#00382e] text-white rounded-xl text-sm font-bold transition shadow-sm"
              >
                Return to Store Homepage
              </Link>
            </motion.div>
          ) : (
            /* Information & Form Card */
            <div className="bg-white rounded-2xl shadow-lg border border-[#E8E5DC] p-6 sm:p-10 space-y-8">
              {/* Logged in notification banner */}
              {isAuthenticated && user && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#004D40] flex items-center justify-center font-bold text-sm shrink-0">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-emerald-800 font-semibold">Currently signed in as:</p>
                    <p className="text-sm font-bold text-emerald-950 truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Data Safety Policy Breakdown */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Info className="w-5 h-5 text-[#004D40]" />
                  <span>What happens when you delete your account?</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                    <span className="font-bold text-rose-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <Trash2 size={14} /> Data Permanently Removed:
                    </span>
                    <ul className="space-y-1.5 text-gray-700 list-disc list-inside">
                      <li>Full Name, Email Address, and Phone Number</li>
                      <li>Login credentials, OAuth/Google tokens, &amp; session keys</li>
                      <li>All saved shipping and delivery addresses</li>
                      <li>Cart items, active wishlists, and interior preferences</li>
                      <li>Profile photos and personalization settings</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                    <span className="font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <Lock size={14} /> Data Retained for Legal Compliance:
                    </span>
                    <ul className="space-y-1.5 text-gray-700 list-disc list-inside">
                      <li>Past order tax invoices &amp; GST transaction receipts</li>
                      <li>Financial accounting records mandated by Indian Tax Law</li>
                      <li>These records are de-identified and retained for up to 7 years solely for tax and regulatory auditing.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Account Deletion Request Form */}
              <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Request Account Deletion
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#004D40] outline-none transition"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Enter the email address you used to register on the Ghar Sansar App or Website.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Registered Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#004D40] outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Reason for Deletion (Optional)
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#004D40] outline-none transition bg-white"
                  >
                    <option value="">Select a reason (optional)</option>
                    <option value="No longer using the service">No longer using the service</option>
                    <option value="Privacy concerns">Privacy concerns</option>
                    <option value="Created multiple accounts">Created multiple accounts</option>
                    <option value="Temporary pause">Temporary pause</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Permanent Confirmation Checkbox */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#004D40] rounded border-gray-300 focus:ring-[#004D40] cursor-pointer"
                      required
                    />
                    <span className="text-xs text-gray-700 leading-relaxed font-medium">
                      I understand and confirm that this action is <strong>permanent</strong> and cannot be undone. 
                      I will lose access to my saved orders, profile, and wishlists.
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !confirmed}
                    className="w-full py-3.5 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing Request...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        <span>Permanently Delete My Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Direct Support Contact */}
              <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-gray-400" />
                  <span>Manual request email: <a href="mailto:gharsansarshop@gmail.com" className="font-semibold text-gray-800 hover:underline">gharsansarshop@gmail.com</a></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-gray-400" />
                  <span>Processing timeline: 24 to 48 hours</span>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeleteAccount;

