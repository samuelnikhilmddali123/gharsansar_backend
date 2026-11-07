import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  FileText,
  Truck,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Eye,
} from "lucide-react";

export type LegalTab = "privacy" | "terms" | "shipping" | "returns";

interface PrivacyPolicyProps {
  initialTab?: LegalTab;
}

const tabConfigs: { id: LegalTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
  { id: "terms", label: "Terms & Conditions", icon: FileText },
  { id: "shipping", label: "Shipping Policy", icon: Truck },
  { id: "returns", label: "Return & Refund Policy", icon: RotateCcw },
];

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ initialTab = "privacy" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  // Sync tab with pathname or search params
  useEffect(() => {
    if (location.pathname.includes("terms")) {
      setActiveTab("terms");
    } else if (location.pathname.includes("shipping")) {
      setActiveTab("shipping");
    } else if (location.pathname.includes("return")) {
      setActiveTab("returns");
    } else if (location.pathname.includes("privacy")) {
      setActiveTab("privacy");
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [location.pathname, initialTab]);

  const handleTabChange = (tab: LegalTab) => {
    setActiveTab(tab);
    if (tab === "privacy") navigate("/privacy-policy");
    else if (tab === "terms") navigate("/terms");
    else if (tab === "shipping") navigate("/shipping-policy");
    else if (tab === "returns") navigate("/return-policy");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-800 pb-20">
      {/* Hero Header */}
      <div className="bg-[#00281b] text-white pt-12 pb-16 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-200 mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ghar Sansar Trust & Transparency Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-4 text-white">
            Legal & Privacy Policies
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            We value your trust and are committed to safeguarding your personal data, ensuring clear commercial terms,
            and providing dependable customer support for all our decor and interior design solutions.
          </p>

          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 mt-6">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Last Updated: October 2026</span>
            <span>•</span>
            <span>Governed by the Laws of India</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E5DC] p-2 flex flex-wrap gap-2 justify-center mb-8">
          {tabConfigs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#00281b] text-white shadow-md scale-[1.02]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-300" : "text-gray-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E8E5DC] p-6 sm:p-10 lg:p-12">
          <AnimatePresence mode="wait">
            {activeTab === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-gray-900">Privacy Policy</h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        How Ghar Sansar collects, protects, and manages your personal information.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1. Introduction */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs flex items-center justify-center font-semibold">1</span>
                    Introduction & Scope
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Welcome to <strong>Ghar Sansar</strong> (“we,” “our,” or “us”). Ghar Sansar operates the online portal,
                    e-commerce store, and custom interior design consultation platform located at{" "}
                    <span className="font-medium text-emerald-800">gharsansar.website</span> and our physical storefront
                    at Governorpet, Vijayawada, India.
                  </p>
                  <p className="text-sm leading-relaxed text-gray-600">
                    This Privacy Policy outlines our standards and practices regarding the collection, handling, storage,
                    and protection of your data when you visit our website, register an account, order home decor items or return gifts,
                    or submit requests for custom interior works (such as ICU Flooring, Wallpapers, Bubble Fountains, and Gym Flooring).
                  </p>
                </section>

                {/* 2. Information We Collect */}
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs flex items-center justify-center font-semibold">2</span>
                    Information We Collect
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    To deliver our products, complete transactions, and provide bespoke interior design consultations, we may collect the following details:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-600" /> Personal Identity & Contact Data
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Full name, mobile phone number, email address, and profile login credentials. Mobile numbers are verified via secure OTPs.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-600" /> Delivery & Billing Addresses
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Street address, apartment or flat details, city, state, postal PIN code, and recipient contact info required for shipment fulfillment.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" /> Payment & Transaction Identifiers
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Transaction reference IDs, order totals, and Razorpay payment receipts. <em>Note:</em> We do <strong>not</strong> store your credit/debit card numbers or CVVs on our servers.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" /> Design Consultation & Custom Requests
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Measurements, project specifications, custom return gift notes, and interior design consultation inquiries submitted via our web forms.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. How We Use Your Information */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs flex items-center justify-center font-semibold">3</span>
                    How We Use Your Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Order Fulfillment:</strong> Processing payments, packaging items, calculating applicable discounts, and dispatching your orders through reliable courier partners.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Interior Consultations:</strong> Reviewing measurements, scheduling site visits, and preparing quotations for customized interior works.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Communication & Updates:</strong> Sending order confirmations, shipping tracking links, invoice copies, and responding to your support queries via email or WhatsApp/SMS.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Security & Fraud Prevention:</strong> Authenticating user accounts, preventing fraudulent orders, and complying with Indian taxation and accounting requirements.</span>
                    </div>
                  </div>
                </section>

                {/* 4. Payment Security */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs flex items-center justify-center font-semibold">4</span>
                    Payment Processing & Financial Security
                  </h3>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-sm text-gray-700 leading-relaxed space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <Lock className="w-4 h-4 text-emerald-700" />
                      PCI-DSS Compliant Payment Handling via Razorpay
                    </div>
                    <p>
                      All online payments on Ghar Sansar are processed via <strong>Razorpay</strong>, India’s leading RBI-authorized
                      and PCI-DSS Level 1 compliant payment gateway. Your payment information (such as credit/debit card numbers, UPI PINs,
                      or Net Banking credentials) is encrypted and processed directly on Razorpay’s secure infrastructure.
                      Ghar Sansar never accesses or stores your banking credentials or card security codes.
                    </p>
                  </div>
                </section>

                {/* 5. Sharing & Disclosure */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs flex items-center justify-center font-semibold">5</span>
                    Data Sharing & Third Parties
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <strong>We do NOT sell, rent, or trade your personal information.</strong> We only share relevant details with trusted third parties under strict confidentiality:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1.5">
                    <li><strong>Logistics Partners:</strong> We share your name, phone number, and delivery address with trusted courier services to deliver physical packages to your doorstep.</li>
                    <li><strong>Payment Gateways:</strong> Necessary transaction tokens are passed to Razorpay for authorized billing and settlement.</li>
                    <li><strong>Statutory Authorities:</strong> When required by Indian law, court order, or governmental audit regulations.</li>
                  </ul>
                </section>

                {/* 6. Cookies & Local Storage */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs flex items-center justify-center font-semibold">6</span>
                    Cookies & Browser Storage
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our platform uses browser local storage and essential cookies to maintain your login session, persist your shopping cart items,
                    and save wishlist selections across visits. You can adjust your browser settings to decline cookies, although some interactive
                    features of the store may not function optimally without them.
                  </p>
                </section>

                {/* 7. User Rights */}
                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs flex items-center justify-center font-semibold">7</span>
                    Your Rights & Control
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    As a Ghar Sansar user, you have the right to access and update your profile information, manage saved addresses,
                    or request the closure of your account and deletion of non-statutory data. You can exercise these rights by
                    logging into your profile or writing directly to our grievance desk.
                  </p>
                </section>

                {/* 8. Contact & Grievance Officer */}
                <section className="border-t border-gray-100 pt-6 space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs flex items-center justify-center font-semibold">8</span>
                    Grievance Officer & Contact Details
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    In compliance with the Information Technology Act 2000 and the Digital Personal Data Protection Act,
                    the contact details of our Grievance Desk are provided below:
                  </p>
                  <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E5DC] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-gray-900 mb-0.5">Physical Store Address</strong>
                        <span className="text-gray-600 leading-relaxed">
                          D.No: 27-14-60, Near Buckingham Post Office, Rajagopalachari Street, Governorpet, Vijayawada - 520002, Andhra Pradesh, India.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-gray-900 mb-0.5">Email Inquiries</strong>
                        <a href="mailto:gharsansarshop@gmail.com" className="text-emerald-700 hover:underline">
                          gharsansarshop@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-gray-900 mb-0.5">Customer Helpline</strong>
                        <a href="tel:+918121135980" className="text-emerald-700 hover:underline">
                          +91-8121135980
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "terms" && (
              <motion.div
                key="terms"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5 text-[#a855f7]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-gray-900">Terms & Conditions</h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Terms governing purchases, services, and platform usage at Ghar Sansar.
                      </p>
                    </div>
                  </div>
                </div>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    By accessing our website, placing an order, or booking interior services with Ghar Sansar, you agree to
                    be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms,
                    please discontinue using our platform.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">2. Products & Pricing</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We make every effort to display accurate dimensions, colors, and descriptions of our home decor, return gifts,
                    and interior finishes. However, due to screen calibration differences, natural material textures, and handcrafted
                    nuances, slight variations may exist. All prices are listed in Indian Rupees (INR) and are inclusive of applicable
                    taxes unless explicitly stated. Ghar Sansar reserves the right to modify prices or correct typographical errors at any time.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">3. Interior Design Works & Quotes</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Estimates provided for specialized works (such as ICU Flooring, Wallpapers, Bubble Fountains, and Custom Blinds)
                    are preliminary until an on-site physical measurement or site readiness inspection is verified. Work schedules
                    and delivery timelines for custom architectural projects are mutually agreed upon during project confirmation.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">4. Order Confirmation & Payment</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Receipt of an electronic order confirmation does not signify our final acceptance of your order. Ghar Sansar
                    reserves the right at any time after receipt of your order to accept or decline it for reasons such as stock availability,
                    unserviceable delivery pin codes, or unauthorized pricing glitches.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">5. Governing Law & Jurisdiction</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute or claim
                    arising out of or in connection with the platform or products shall be subject to the exclusive jurisdiction of the
                    competent courts in <strong>Vijayawada, Andhra Pradesh</strong>.
                  </p>
                </section>
              </motion.div>
            )}

            {activeTab === "shipping" && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-gray-900">Shipping & Delivery Policy</h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Delivery coverage, timelines, and tracking details for retail purchases.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                    <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-sm text-gray-900">Dispatch Time</h4>
                    <p className="text-xs text-gray-600 mt-1">1 - 2 Business Days for standard decor items</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                    <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-sm text-gray-900">Transit Period</h4>
                    <p className="text-xs text-gray-600 mt-1">3 - 7 Business Days depending on destination PIN code</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                    <ShieldCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-sm text-gray-900">Safe Packaging</h4>
                    <p className="text-xs text-gray-600 mt-1">Multi-layer reinforced packaging for fragile decor & gifts</p>
                  </div>
                </div>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">1. Pan-India Delivery Network</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Ghar Sansar delivers retail home decor products and return gifts to serviceable postal codes across India
                    via reputed courier and logistics providers (e.g., Delhivery, BlueDart, DTDC, India Post).
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">2. Tracking Your Consignment</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Once your order is packed and dispatched from our Vijayawada facility, you will receive an email and SMS
                    containing the consignment AWB tracking number and carrier link to track delivery status in real time.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">3. Bulky Goods & Customized Installations</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Oversized or heavy products (such as large water bubble fountains, roll bulk orders, and commercial flooring materials)
                    are shipped via dedicated surface transport or door-to-door cargo logistics. Delivery schedules for such shipments
                    are coordinated directly with the client by our operations team.
                  </p>
                </section>
              </motion.div>
            )}

            {activeTab === "returns" && (
              <motion.div
                key="returns"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                      <RotateCcw className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-gray-900">Cancellation & Refund Policy</h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Guidelines on return eligibility, replacement requests, and refund timelines.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                    <strong>Transit Damage Notice:</strong> We take utmost care in packaging fragile items. If your package arrives
                    visibly crushed or broken, please take photographs/video during unboxing and notify us within <strong>48 hours</strong>
                    of receipt for expedited replacement or refund.
                  </div>
                </div>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">1. Return Eligibility</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Items are eligible for return or replacement if:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1.5">
                    <li>The item delivered is physically damaged, defective, or fundamentally different from the ordered product.</li>
                    <li>The item is returned in its original condition with all product tags, user manuals, and packaging intact.</li>
                    <li>The return request is raised within <strong>48 to 72 hours</strong> of verified delivery.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">2. Non-Returnable Products</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    To maintain hygiene and fair trade practices, the following categories cannot be returned once delivered:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1.5">
                    <li>Customized or personalized return gifts with names, logos, or bespoke packaging.</li>
                    <li>Cut-to-size rolls, tailored window blinds, and installed commercial floorings.</li>
                    <li>Products marked as clearance or final sale.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">3. Refund Processing Timelines</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Once the returned item is received at our Vijayawada facility and passes quality inspection, the approved refund
                    will be initiated through Razorpay to your original mode of payment (bank account, credit/debit card, or UPI)
                    within <strong>5 to 7 business days</strong>.
                  </p>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Support Banner Card */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-[#00281b] to-[#04402d] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-bold mb-1">Have questions about our policies?</h3>
            <p className="text-xs sm:text-sm text-emerald-200/90 font-light">
              Our team is here to assist you with order inquiries, return processing, and interior solutions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:gharsansarshop@gmail.com"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-gray-900 font-medium text-xs hover:bg-gray-100 transition shadow-sm"
            >
              <Mail className="w-4 h-4 text-emerald-700" />
              <span>Email Support</span>
            </a>
            <a
              href="tel:+918121135980"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Call +91-8121135980</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

