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
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { getAdminWhatsAppNumber } from "../config/whatsappConfig";

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

  const adminWhatsApp = getAdminWhatsAppNumber();
  const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
    "Hello Ghar Sansar! I have a question regarding your terms, privacy, or store policies."
  )}`;

  // Sync tab with pathname or initialTab
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const handleTabChange = (tab: LegalTab) => {
    setActiveTab(tab);
    if (tab === "privacy") navigate("/privacy-policy");
    else if (tab === "terms") navigate("/terms");
    else if (tab === "shipping") navigate("/shipping-policy");
    else if (tab === "returns") navigate("/return-policy");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#181513] font-sans pb-20">
      {/* 1. Hero Header (Matching Website Luxury Dark Theme) */}
      <section className="relative bg-gradient-to-b from-[#1C1714] via-[#261E1A] to-[#1C1714] text-white pt-20 pb-20 sm:pt-24 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-center">
        {/* Subtle decorative dot pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#FAF7F2 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C86B4C]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#7D3219]/25 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2]/10 backdrop-blur-md border border-[#FAF7F2]/15 text-[#E6AF9A] text-xs font-medium uppercase tracking-wider mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C86B4C]" />
            <span>Ghar Sansar Trust &amp; Transparency Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#FAF7F2] mb-4">
            Legal &amp; Privacy Policies
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#C8BFB6] max-w-2xl mx-auto leading-relaxed">
            We value your trust and are committed to safeguarding your personal data, ensuring transparent commercial
            terms, and providing dependable support for all our decor and interior design solutions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#A69E96] mt-6">
            <Clock className="w-3.5 h-3.5 text-[#C86B4C]" />
            <span>Last Updated: November 2026</span>
            <span>•</span>
            <span>Governed by the Laws of India</span>
            <span>•</span>
            <Link to="/faq" className="text-[#E6AF9A] hover:text-white underline transition-colors">
              Read FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        {/* Navigation Tabs (Terracotta active style) */}
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-[#E8E2D8] p-2 flex flex-wrap gap-2 justify-center mb-8">
          {tabConfigs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#C86B4C] text-white shadow-md shadow-[#C86B4C]/25 scale-[1.02] border border-[#C86B4C]"
                    : "text-[#736B63] hover:text-[#181513] hover:bg-[#FAF7F2] border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#8C827A]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E8E2D8] p-6 sm:p-10 lg:p-12">
          <AnimatePresence mode="wait">
            {/* TAB 1: PRIVACY POLICY */}
            {activeTab === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-[#F2ECE4] pb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-11 h-11 rounded-xl bg-[#F7EBE4] text-[#C86B4C] flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6 text-[#C86B4C]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#181513]">Privacy Policy</h2>
                      <p className="text-xs sm:text-sm text-[#736B63]">
                        How Ghar Sansar collects, protects, and manages your personal information.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1. Introduction */}
                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      1
                    </span>
                    Introduction &amp; Scope
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    At <strong>Ghar Sansar</strong> (referred to as &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;),
                    we are committed to protecting the privacy, confidentiality, and security of our customers, website
                    visitors, and interior design clients. This Privacy Policy details how we collect, use, store, and
                    disclose your personal information when you visit{" "}
                    <span className="font-medium text-[#C86B4C]">gharsansar.website</span>, purchase home decor products,
                    request custom wallpaper estimates, book interior consultations, or visit our physical studio in
                    Governorpet, Vijayawada.
                  </p>
                </section>

                {/* 2. Information We Collect */}
                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      2
                    </span>
                    Information We Collect
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    We collect information strictly necessary to provide seamless shopping experiences, fulfill retail
                    orders, and coordinate customized interior installations:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E2D8]">
                      <h4 className="font-semibold text-sm text-[#181513] flex items-center gap-2 mb-1.5">
                        <Eye className="w-4 h-4 text-[#C86B4C]" /> Personal Identity &amp; Contact Data
                      </h4>
                      <p className="text-xs text-[#736B63] leading-relaxed">
                        Full name, email address, mobile phone number, and optional WhatsApp contact information provided
                        during account registration, guest checkout, or inquiries.
                      </p>
                    </div>

                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E2D8]">
                      <h4 className="font-semibold text-sm text-[#181513] flex items-center gap-2 mb-1.5">
                        <Truck className="w-4 h-4 text-[#C86B4C]" /> Delivery &amp; Billing Addresses
                      </h4>
                      <p className="text-xs text-[#736B63] leading-relaxed">
                        Shipping address, apartment/house number, city, state, and postal PIN code required for physical
                        package dispatch and logistics partners.
                      </p>
                    </div>

                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E2D8]">
                      <h4 className="font-semibold text-sm text-[#181513] flex items-center gap-2 mb-1.5">
                        <CreditCard className="w-4 h-4 text-[#C86B4C]" /> Payment &amp; Transaction Identifiers
                      </h4>
                      <p className="text-xs text-[#736B63] leading-relaxed">
                        Order IDs, payment status tokens, and timestamps returned by authorized RBI-compliant payment
                        gateways (Razorpay). We never view or store card numbers or banking PINs.
                      </p>
                    </div>

                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E2D8]">
                      <h4 className="font-semibold text-sm text-[#181513] flex items-center gap-2 mb-1.5">
                        <FileText className="w-4 h-4 text-[#C86B4C]" /> Design Consultation &amp; Custom Requests
                      </h4>
                      <p className="text-xs text-[#736B63] leading-relaxed">
                        Wall measurements, floor plan blueprints, preferred textures, color selections, and design notes
                        shared during consultation bookings or WhatsApp chats.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. How We Use Your Data */}
                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      3
                    </span>
                    How We Use Your Information
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#4A433D]">
                    <li className="flex items-start gap-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E2D8]">
                      <CheckCircle2 className="w-4 h-4 text-[#C86B4C] shrink-0 mt-0.5" />
                      <span>Order fulfillment, secure packing, and doorstep delivery across India.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E2D8]">
                      <CheckCircle2 className="w-4 h-4 text-[#C86B4C] shrink-0 mt-0.5" />
                      <span>Order updates, shipping tracking links, and customer support via WhatsApp/SMS.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E2D8]">
                      <CheckCircle2 className="w-4 h-4 text-[#C86B4C] shrink-0 mt-0.5" />
                      <span>Scheduling 2D/3D design layouts and interior site visits.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E2D8]">
                      <CheckCircle2 className="w-4 h-4 text-[#C86B4C] shrink-0 mt-0.5" />
                      <span>Legal tax invoicing and compliance with statutory Indian commercial regulations.</span>
                    </li>
                  </ul>
                </section>

                {/* 4. Payment Security */}
                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      4
                    </span>
                    Payment Processing &amp; Financial Security
                  </h3>
                  <div className="bg-[#FAF7F2] border border-[#D9B4A4]/70 rounded-2xl p-5 text-sm text-[#4A433D] leading-relaxed space-y-2">
                    <div className="flex items-center gap-2 text-[#7D3219] font-semibold">
                      <Lock className="w-4 h-4 text-[#C86B4C]" />
                      PCI-DSS Compliant Payment Handling via Razorpay
                    </div>
                    <p>
                      All online payments on Ghar Sansar are processed via <strong>Razorpay</strong>, India’s leading
                      RBI-authorized and PCI-DSS Level 1 compliant payment gateway. Your financial information (such as
                      credit/debit card numbers, UPI credentials, or Net Banking logins) is 256-bit encrypted and processed
                      directly on Razorpay’s secure infrastructure. Ghar Sansar never accesses or stores your banking
                      credentials.
                    </p>
                  </div>
                </section>

                {/* 5. Sharing & Disclosure */}
                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      5
                    </span>
                    Data Sharing &amp; Third Parties
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    <strong>We do NOT sell, rent, or trade your personal information.</strong> We only share relevant
                    details with trusted service providers under strict confidentiality:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-[#4A433D] space-y-1.5">
                    <li>
                      <strong>Logistics Partners:</strong> Your recipient name, phone number, and delivery address are
                      shared with reputable couriers (e.g., Delhivery, BlueDart, DTDC) to deliver packages.
                    </li>
                    <li>
                      <strong>Payment Gateways:</strong> Necessary transaction tokens are passed to Razorpay for
                      authorized settlement.
                    </li>
                    <li>
                      <strong>Statutory Authorities:</strong> Only when required by Indian law, court order, or official
                      tax audit regulations.
                    </li>
                  </ul>
                </section>

                {/* 6. Cookies & Local Storage */}
                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      6
                    </span>
                    Cookies &amp; Browser Storage
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    Our platform uses browser local storage and essential cookies to maintain your login session, persist
                    your shopping cart items, and save wishlist selections across visits. You can adjust your browser
                    settings to decline cookies, although interactive features of the store may not function optimally
                    without them.
                  </p>
                </section>

                {/* 7. User Rights */}
                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      7
                    </span>
                    Your Rights &amp; Control
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    As a Ghar Sansar customer, you have the right to access and update your profile information, manage
                    saved delivery addresses, or request the closure of your account and deletion of non-statutory data.
                    You can exercise these rights by logging into your profile or writing directly to our grievance desk.
                  </p>
                </section>

                {/* 8. Contact & Grievance Officer */}
                <section className="border-t border-[#F2ECE4] pt-6 space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      8
                    </span>
                    Grievance Officer &amp; Contact Details
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    In compliance with the Information Technology Act 2000 and the Digital Personal Data Protection Act,
                    our store and customer grievance details are provided below:
                  </p>
                  <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8E2D8] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#C86B4C] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[#181513] mb-0.5">Physical Studio Address</strong>
                        <span className="text-[#736B63] leading-relaxed">
                          D.No. 27-3-68, Near Buckingham Post Office, Rajulakshmi School, Governorpet-520002,
                          Vijayawada, Andhra Pradesh, India.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-[#C86B4C] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[#181513] mb-0.5">Official Email</strong>
                        <a href="mailto:gharsansarvj@gmail.com" className="text-[#C86B4C] hover:underline font-medium">
                          gharsansarvj@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-[#C86B4C] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[#181513] mb-0.5">Customer Helpline</strong>
                        <a href="tel:+919701990090" className="text-[#C86B4C] hover:underline font-medium">
                          +91 9701990090
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {/* TAB 2: TERMS & CONDITIONS */}
            {activeTab === "terms" && (
              <motion.div
                key="terms"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-[#F2ECE4] pb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-11 h-11 rounded-xl bg-[#F7EBE4] text-[#C86B4C] flex items-center justify-center font-bold">
                      <FileText className="w-6 h-6 text-[#C86B4C]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#181513]">Terms &amp; Conditions</h2>
                      <p className="text-xs sm:text-sm text-[#736B63]">
                        Terms governing purchases, custom orders, design consultations, and platform usage.
                      </p>
                    </div>
                  </div>
                </div>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      1
                    </span>
                    Acceptance of Terms
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    By browsing our website, placing an order (as a registered user or guest), or booking interior design
                    services with Ghar Sansar, you acknowledge and agree to be bound by these Terms and Conditions and our
                    Privacy Policy. If you disagree with any part of these terms, please discontinue using our platform.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      2
                    </span>
                    Products, Materials &amp; Pricing
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    We make every effort to display accurate dimensions, high-resolution imagery, and descriptions for our
                    wallpaper rolls, 3D wall coverings, vinyl flooring, wall art panels, and festive return gifts.
                    However, due to individual display color calibration, physical texture variations, and natural lighting
                    differences, slight visual variations may occur. All prices are listed in Indian Rupees (INR) and are
                    inclusive of applicable GST unless explicitly stated otherwise.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      3
                    </span>
                    Interior Design Works &amp; On-Site Quotes
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    Preliminary estimates provided for customized turnkey projects (including wallpaper installations,
                    flooring, vertical gardens, and lighting) are subject to revision until an on-site physical measurement
                    and site readiness check are completed. Work schedules, installation dates, and material deliveries are
                    mutually confirmed upon project agreement.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      4
                    </span>
                    Order Confirmation &amp; Cancellations
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    Receipt of an electronic order confirmation verifies that our system has received your request. Ghar
                    Sansar reserves the right at any point prior to dispatch to cancel orders due to unforeseen stock
                    unavailability, unserviceable delivery locations, or rare technological pricing errors. In such events,
                    a 100% full refund will be immediately issued to the original payment method.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      5
                    </span>
                    Governing Law &amp; Jurisdiction
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute
                    or claim arising out of or in connection with the platform, retail orders, or interior design contracts
                    shall be subject to the exclusive jurisdiction of the competent courts in{" "}
                    <strong>Vijayawada, Andhra Pradesh</strong>.
                  </p>
                </section>
              </motion.div>
            )}

            {/* TAB 3: SHIPPING POLICY */}
            {activeTab === "shipping" && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-[#F2ECE4] pb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-11 h-11 rounded-xl bg-[#F7EBE4] text-[#C86B4C] flex items-center justify-center font-bold">
                      <Truck className="w-6 h-6 text-[#C86B4C]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#181513]">Shipping &amp; Delivery Policy</h2>
                      <p className="text-xs sm:text-sm text-[#736B63]">
                        Coverage, transit periods, safe packaging, and tracking details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping highlights grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-center">
                    <Clock className="w-6 h-6 text-[#C86B4C] mx-auto mb-2" />
                    <h4 className="font-semibold text-sm text-[#181513]">Dispatch Time</h4>
                    <p className="text-xs text-[#736B63] mt-1">1 - 2 Business Days for standard decor &amp; wallpapers</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-center">
                    <Truck className="w-6 h-6 text-[#C86B4C] mx-auto mb-2" />
                    <h4 className="font-semibold text-sm text-[#181513]">Transit Period</h4>
                    <p className="text-xs text-[#736B63] mt-1">3 - 7 Business Days depending on destination PIN code</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-center">
                    <ShieldCheck className="w-6 h-6 text-[#C86B4C] mx-auto mb-2" />
                    <h4 className="font-semibold text-sm text-[#181513]">Safe Packaging</h4>
                    <p className="text-xs text-[#736B63] mt-1">Rigid protective tubes and reinforced bubble-wrap cushioning</p>
                  </div>
                </div>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      1
                    </span>
                    Pan-India Delivery Network
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    Ghar Sansar delivers retail home decor products, wallpaper rolls, vinyl planks, and festive return
                    gifts to serviceable postal codes across Andhra Pradesh, Telangana, and pan-India through reputable
                    national logistics partners (such as Delhivery, BlueDart, DTDC, and India Post).
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      2
                    </span>
                    Consignment Tracking (Logged-in &amp; Guest Orders)
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    Once your order is safely packed and dispatched from our Vijayawada facility, you will receive an
                    instant SMS and WhatsApp notification containing your airway bill (AWB) number and direct courier
                    tracking link. Logged-in customers can also view live delivery milestones directly under their account
                    dashboard.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      3
                    </span>
                    Bulky Goods &amp; Customized Architectural Materials
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    Heavy or oversized consignments (such as commercial vinyl flooring pallets, large vertical garden
                    panels, and water features) are dispatched via dedicated surface transport or door-to-door cargo
                    logistics. Delivery timings and site unloading are coordinated directly with you by our operations team.
                  </p>
                </section>
              </motion.div>
            )}

            {/* TAB 4: RETURNS & REFUNDS */}
            {activeTab === "returns" && (
              <motion.div
                key="returns"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="border-b border-[#F2ECE4] pb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-11 h-11 rounded-xl bg-[#F7EBE4] text-[#C86B4C] flex items-center justify-center font-bold">
                      <RotateCcw className="w-6 h-6 text-[#C86B4C]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#181513]">Return &amp; Refund Policy</h2>
                      <p className="text-xs sm:text-sm text-[#736B63]">
                        Eligibility criteria, transit damage reporting, and refund timelines.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transit damage notice card */}
                <div className="p-4 rounded-2xl bg-[#F7EBE4] border border-[#D9B4A4] flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#C86B4C] shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-[#7D3219] leading-relaxed">
                    <strong>Transit Damage Notice:</strong> We take utmost care in packaging delicate wallpapers and decor
                    items. If your shipment arrives visibly crushed, opened, or damaged, please take clear photos or unboxing
                    video clips and notify our support desk within <strong>48 hours</strong> of delivery for an immediate,
                    hassle-free replacement or refund.
                  </div>
                </div>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      1
                    </span>
                    Return &amp; Replacement Eligibility
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    Standard retail home decor products and standard wallpaper rolls are eligible for return or replacement if:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-[#4A433D] space-y-1.5">
                    <li>The product arrived physically damaged or defective.</li>
                    <li>The delivered item is fundamentally different from the design or color roll ordered.</li>
                    <li>The product is unused, unpasted, and returned in its original protective packaging with all tags intact.</li>
                    <li>The replacement request is submitted within <strong>48 to 72 hours</strong> of verified delivery.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      2
                    </span>
                    Non-Returnable Products
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    To maintain standard quality and hygienic trade practices, the following customized items cannot be
                    returned for change of mind:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-[#4A433D] space-y-1.5">
                    <li>Custom-printed 3D wallpapers tailored to your specific wall dimensions.</li>
                    <li>Cut-to-size vinyl flooring sheets and customized window coverings.</li>
                    <li>Personalized festive or wedding return gifts featuring custom names or logos.</li>
                    <li>Items marked as final clearance or sample sale.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-[#181513] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F7EBE4] text-[#7D3219] text-xs flex items-center justify-center font-semibold">
                      3
                    </span>
                    Refund Processing &amp; Timelines
                  </h3>
                  <p className="text-sm text-[#4A433D] leading-relaxed">
                    Once the returned item is received at our Vijayawada studio and passes basic verification, your approved
                    refund is initiated through Razorpay back to your original payment method (bank account, UPI, credit or
                    debit card) within <strong>5 to 7 business days</strong>.
                  </p>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Bottom Support Banner Card (Exact Theme Harmony with FAQ & Footer) */}
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#1C1714] to-[#2B221D] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-[#3A2F29]">
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-bold mb-1 text-[#FAF7F2]">
              Have questions about our policies?
            </h3>
            <p className="text-xs sm:text-sm text-[#C8BFB6] font-light">
              Our Vijayawada support team is here to assist you with order inquiries, measurements, and returns.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:gharsansarvj@gmail.com"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#C86B4C] hover:bg-[#B05B3C] text-white font-medium text-xs transition shadow-lg shadow-[#C86B4C]/25"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-medium text-xs transition shadow-lg shadow-black/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
