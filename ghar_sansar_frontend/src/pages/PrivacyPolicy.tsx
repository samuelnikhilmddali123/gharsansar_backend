import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export type LegalTab = "privacy" | "terms" | "shipping";

interface PrivacyPolicyProps {
  initialTab?: LegalTab;
}

const tabConfigs: { id: LegalTab; label: string }[] = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms & Conditions" },
  { id: "shipping", label: "Shipping Policy" },
];

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ initialTab = "privacy" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  // Sync tab with route
  useEffect(() => {
    if (location.pathname.includes("terms")) {
      setActiveTab("terms");
    } else if (location.pathname.includes("shipping")) {
      setActiveTab("shipping");
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
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#181513] font-sans pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Minimal Header & Underline Tabs */}
        <div className="border-b border-[#E8E2D8] mb-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#181513] tracking-tight">
                {activeTab === "privacy" && "Privacy Policy"}
                {activeTab === "terms" && "Terms & Conditions"}
                {activeTab === "shipping" && "Shipping Policy"}
              </h1>
              <p className="text-xs sm:text-sm text-[#736B63] mt-1">
                Ghar Sansar • Governorpet, Vijayawada
              </p>
            </div>
            <div className="text-xs text-[#8C827A]">
              <span>Last updated: November 2026</span>
            </div>
          </div>

          {/* Minimalist Horizontal Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
            {tabConfigs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
                    isActive ? "text-[#C86B4C] font-semibold" : "text-[#736B63] hover:text-[#181513]"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C86B4C]"
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="bg-white rounded-2xl border border-[#E8E2D8] p-6 sm:p-10 shadow-sm">
          <AnimatePresence mode="wait">
            {/* TAB 1: PRIVACY POLICY */}
            {activeTab === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 text-[#4A433D] text-sm sm:text-[15px] leading-relaxed"
              >
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">1. Overview</h2>
                  <p>
                    At <strong>Ghar Sansar</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we respect
                    your personal privacy and are committed to safeguarding the information you share with us. This policy
                    describes how we collect, handle, and protect your data when you visit our website, purchase home
                    decor, enquire about wallpapers, or book interior consultation services.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">2. Information We Collect</h2>
                  <p className="mb-3">
                    We collect only the information required to fulfill orders and coordinate design services:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Contact Details:</strong> Name, mobile phone number, email address, and optional WhatsApp
                      number.
                    </li>
                    <li>
                      <strong>Delivery Details:</strong> Shipping address, city, state, and postal PIN code for courier
                      dispatch.
                    </li>
                    <li>
                      <strong>Transaction Data:</strong> Unique Order IDs, payment status tokens, and timestamps
                      processed securely through authorized payment gateways. We never store credit/debit card numbers or
                      banking passwords.
                    </li>
                    <li>
                      <strong>Design Specifications:</strong> Wall dimensions, room photos, or blueprint measurements
                      shared for custom wallpaper sizing and interior planning.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">3. How Your Information Is Used</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Processing, securely packing, and delivering your orders.</li>
                    <li>Sending order confirmations, dispatch updates, and delivery tracking links via SMS/WhatsApp.</li>
                    <li>Coordinating 2D/3D design layouts, estimates, and on-site consultations.</li>
                    <li>Generating invoices and complying with statutory commercial tax obligations.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">4. Payment Security</h2>
                  <p>
                    Online transactions on Ghar Sansar are processed via <strong>Razorpay</strong>, an RBI-authorized,
                    PCI-DSS Level 1 compliant payment gateway with 256-bit encryption. All banking credentials and card
                    details are handled directly on secure infrastructure—Ghar Sansar does not access, collect, or store
                    any sensitive payment details.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">5. Information Sharing</h2>
                  <p className="mb-2">
                    We do not sell, rent, or trade your personal information. Relevant data is shared strictly with:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Logistics Carriers:</strong> Name, phone number, and address provided solely for shipping
                      your packages.
                    </li>
                    <li>
                      <strong>Payment Gateways:</strong> Transaction references for billing and payment settlement.
                    </li>
                    <li>
                      <strong>Statutory Authorities:</strong> Only when strictly mandated by Indian law or court order.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">6. Cookies &amp; Storage</h2>
                  <p>
                    We use local browser storage to maintain active shopping carts and remember wishlist preferences. You
                    may adjust your browser settings to disable cookies if preferred.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">7. Contact &amp; Grievances</h2>
                  <p className="mb-2">For any questions or privacy inquiries, contact our team directly:</p>
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E2D8] text-xs sm:text-sm space-y-1">
                    <p>
                      <strong>Ghar Sansar Flagship Studio:</strong> D.No. 27-3-68, Near Buckingham Post Office,
                      Rajulakshmi School, Governorpet-520002, Vijayawada, Andhra Pradesh.
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:gharsansarvj@gmail.com" className="text-[#C86B4C] hover:underline">
                        gharsansarvj@gmail.com
                      </a>
                    </p>
                    <p>
                      <strong>Phone / WhatsApp:</strong>{" "}
                      <a href="tel:+919701990090" className="text-[#C86B4C] hover:underline">
                        +91 9701990090
                      </a>{" "}
                      /{" "}
                      <a href="https://wa.me/919492664870" target="_blank" rel="noopener noreferrer" className="text-[#C86B4C] hover:underline">
                        +91 9492664870
                      </a>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: TERMS & CONDITIONS */}
            {activeTab === "terms" && (
              <motion.div
                key="terms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 text-[#4A433D] text-sm sm:text-[15px] leading-relaxed"
              >
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">1. Agreement to Terms</h2>
                  <p>
                    By accessing our website, placing an order (as a registered user or guest), or booking interior design
                    services with Ghar Sansar, you acknowledge and agree to be bound by these Terms and Conditions. If you
                    disagree with any part of these terms, please discontinue using our platform.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">2. Products &amp; Pricing</h2>
                  <p>
                    We make every effort to display accurate dimensions, high-resolution imagery, and descriptions for all
                    wallpapers, vinyl flooring, and home decor items. However, due to natural texture variations and
                    screen color calibrations, minor visual nuances may occur. All prices are listed in Indian Rupees (INR)
                    and are inclusive of applicable GST unless explicitly noted otherwise.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">3. Custom Orders &amp; Site Quotes</h2>
                  <p>
                    Preliminary estimates provided for customized turnkey projects (such as 3D murals, customized
                    flooring, vertical gardens, or lighting) are subject to final revision following an on-site physical
                    measurement. Installation dates and delivery schedules are mutually confirmed upon final project
                    sign-off.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">4. Order Processing &amp; Acceptance</h2>
                  <p>
                    Receipt of an electronic order confirmation verifies that our system has registered your request. Ghar
                    Sansar reserves the right prior to dispatch to cancel orders due to stock unavailability or unserviceable
                    delivery locations. In such rare instances, a 100% full refund is immediately credited to your original
                    payment method.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">5. Governing Law &amp; Jurisdiction</h2>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of India. Any legal disputes
                    arising in connection with our website or retail orders shall be subject to the exclusive jurisdiction
                    of the competent courts in <strong>Vijayawada, Andhra Pradesh</strong>.
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SHIPPING POLICY */}
            {activeTab === "shipping" && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 text-[#4A433D] text-sm sm:text-[15px] leading-relaxed"
              >
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">1. Delivery Coverage</h2>
                  <p>
                    Ghar Sansar ships retail home decor products, wallpaper rolls, vinyl flooring, and return gifts to
                    serviceable postal PIN codes across Andhra Pradesh, Telangana, and pan-India through reputable national
                    logistics partners (including Delhivery, BlueDart, DTDC, and India Post).
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">2. Processing &amp; Transit Timelines</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Dispatch:</strong> Standard decor items and in-stock wallpapers are dispatched within 1 to 2
                      business days from our Vijayawada studio.
                    </li>
                    <li>
                      <strong>Transit:</strong> Typical transit times range between 3 to 7 business days depending on the
                      delivery PIN code and destination.
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">3. Consignment Tracking</h2>
                  <p>
                    Once your order is dispatched, you will receive an SMS and WhatsApp notification containing your airway
                    bill (AWB) number and direct courier tracking link. Logged-in customers can also view live delivery
                    milestones in their account profile.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">4. Packaging Standards</h2>
                  <p>
                    Wallpaper rolls are packaged in rigid cylindrical protective tubes to prevent creasing and edge
                    damage. Fragile decor artifacts and ceramics are packed with multi-layer bubble wrap and reinforced
                    double-wall cartons.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-serif font-bold text-[#181513] mb-2">5. Oversized Shipments</h2>
                  <p>
                    Heavy or bulk architectural items (such as commercial flooring pallets or large vertical garden
                    panels) are dispatched via dedicated surface cargo logistics. Delivery timing and site unloading are
                    coordinated directly by our operations desk.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimalist Contact Note */}
        <div className="text-center mt-10 text-xs sm:text-sm text-[#736B63]">
          Questions about our policies?{" "}
          <a href="mailto:gharsansarvj@gmail.com" className="text-[#C86B4C] hover:underline font-medium">
            gharsansarvj@gmail.com
          </a>{" "}
          •{" "}
          <a href="tel:+919701990090" className="text-[#C86B4C] hover:underline font-medium">
            +91 9701990090
          </a>{" "}
          •{" "}
          <Link to="/faq" className="text-[#C86B4C] hover:underline font-medium">
            Read FAQs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
