import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronDown,
  Info,
  UserCheck,
  Sparkles,
  CreditCard,
  Truck,
  RotateCcw,
  MessageCircle,
  Headphones,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Clock,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { getAdminWhatsAppNumber } from "../config/whatsappConfig";

export type FAQCategory =
  | "all"
  | "general"
  | "login-guest"
  | "products-pricing"
  | "orders-payments"
  | "shipping-delivery"
  | "whatsapp"
  | "support";

interface FAQItem {
  id: string;
  category: FAQCategory;
  categoryLabel: string;
  question: string;
  answer: string | React.ReactNode;
  tags?: string[];
}

const CATEGORIES: { id: FAQCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "All Questions", icon: Layers },
  { id: "general", label: "General Information", icon: Info },
  { id: "login-guest", label: "Login & Guest Shopping", icon: UserCheck },
  { id: "products-pricing", label: "Products & Pricing", icon: Sparkles },
  { id: "orders-payments", label: "Orders & Payments", icon: CreditCard },
  { id: "shipping-delivery", label: "Shipping & Delivery", icon: Truck },
  { id: "whatsapp", label: "WhatsApp Enquiries", icon: MessageCircle },
  { id: "support", label: "Customer Support", icon: Headphones },
];

const FAQ_DATA: FAQItem[] = [
  // 1. General Information
  {
    id: "gen-1",
    category: "general",
    categoryLabel: "General Information",
    question: "What is Gharsansar?",
    answer:
      "Ghar Sansar is a premier home decor, luxury wallpaper, and interior design destination based in Governorpet, Vijayawada. We curate and craft sophisticated interior solutions—ranging from premium wallpaper rolls, custom 3D wall murals, luxury vinyl flooring, and wall art effects, to exquisite festive return gifts and end-to-end turnkey interior design services for homes and commercial spaces across Andhra Pradesh, Telangana, and pan-India.",
    tags: ["about", "store", "company", "who", "location"],
  },
  {
    id: "gen-2",
    category: "general",
    categoryLabel: "General Information",
    question: "What products and interior services does Gharsansar offer?",
    answer:
      "Our offerings span both physical luxury products and professional design services:\n• Products: Premium Wallpaper Rolls (120+ patterns), 3D Custom Wallpapers, Luxury Vinyl Flooring, Textured Wall Art Panels, Vertical Garden Installations, Home Decor Artifacts, and Curated Festive/Return Gifts.\n• Services: Complimentary 2D/3D interior design layouts, lighting consultation, material selection, on-site measurement, and turnkey project execution.",
    tags: ["products", "services", "catalog", "wallpaper", "flooring", "interior design"],
  },
  {
    id: "gen-3",
    category: "general",
    categoryLabel: "General Information",
    question: "Where is Gharsansar located, and can I visit the store?",
    answer:
      "Yes, we warmly welcome customers to experience our materials in person! Our flagship studio and showroom is located at:\n\nD.No. 27-3-68, Near Buckingham Post Office, Rajulakshmi School, Governorpet-520002, Vijayawada, Andhra Pradesh.\n\nYou can touch and feel actual wallpaper textures, view full-scale vinyl flooring planks, inspect lighting finishes, and sit down with our interior designers for a personalized consultation.",
    tags: ["location", "address", "visit", "showroom", "vijayawada", "store"],
  },
  {
    id: "gen-4",
    category: "general",
    categoryLabel: "General Information",
    question: "How can I purchase products from Gharsansar?",
    answer:
      "Gharsansar offers three flexible and seamless shopping pathways tailored to your preference:\n1. Shopping with an Account (Logged In): Full access to your order history, saved addresses, instant checkout, and real-time shipment tracking.\n2. Guest Checkout (Without Login): Fast and frictionless—browse items, add to cart, and checkout immediately by entering your contact & delivery details.\n3. WhatsApp Order & Enquiry: Click 'Order via WhatsApp' on any product page or text our support line directly to verify stock, request real photos/videos, get custom size quotes, and complete your purchase directly with our team.",
    tags: ["buy", "purchase", "order", "shopping", "how to buy", "ways to shop"],
  },

  // 2. Login & Guest Shopping
  {
    id: "auth-1",
    category: "login-guest",
    categoryLabel: "Login & Guest Shopping",
    question: "Can I shop without creating an account? (Guest Checkout)",
    answer:
      "Yes, absolutely! Gharsansar fully supports Guest Checkout. You can explore all available collections, add any items to your shopping cart, and place an order without ever creating an account or memorizing a password. All you need to provide at checkout is your delivery address, mobile number, and contact details so we can deliver your items and share tracking confirmations.",
    tags: ["guest", "no login", "without account", "guest checkout", "checkout"],
  },
  {
    id: "auth-2",
    category: "login-guest",
    categoryLabel: "Login & Guest Shopping",
    question: "What are the benefits of creating an account and logging in?",
    answer:
      "While guest checkout is available, creating an account unlocks the complete personalized experience:\n• Order History & Invoices: View all past orders, purchased products, payment receipts, and invoices anytime.\n• Saved Addresses: Store multiple home, office, and project addresses for quick, one-click checkout.\n• Live Order Tracking: Monitor real-time processing and dispatch updates in your account dashboard.\n• Multi-Device Wishlist: Save your favorite wallpapers and decor pieces across your phone, tablet, and PC.\n• Profile Management: Easily manage contact info and communication preferences.",
    tags: ["login", "account", "benefits", "register", "history", "profile"],
  },
  {
    id: "auth-3",
    category: "login-guest",
    categoryLabel: "Login & Guest Shopping",
    question: "Can I view my previous purchases?",
    answer:
      "If you placed your orders while logged into your Gharsansar account, your full purchase history is permanently saved and accessible under Profile > My Orders. If you checked out as a guest, your previous purchases are not attached to a central profile; however, your order details and item summaries are always preserved in the WhatsApp and SMS/email confirmations sent to you at the time of purchase, and can be retrieved by quoting your Order ID to our support team.",
    tags: ["previous purchases", "past orders", "history", "view orders", "receipt"],
  },
  {
    id: "auth-4",
    category: "login-guest",
    categoryLabel: "Login & Guest Shopping",
    question: "Can guest orders be tracked?",
    answer:
      "Yes! Guest orders can definitely be tracked. When you complete a guest purchase, an order confirmation with a unique Order ID (e.g., GS-XXXXXX) is generated on-screen and dispatched to your phone/email. Once your package ships, a courier tracking link is provided via SMS and WhatsApp. You can also contact our support team anytime with your Order ID or mobile number to receive live shipping updates.",
    tags: ["guest tracking", "track order", "order id", "status", "shipment tracking"],
  },
  {
    id: "auth-5",
    category: "login-guest",
    categoryLabel: "Login & Guest Shopping",
    question: "Can I convert my guest purchases to an account later?",
    answer:
      "If you create an account using the same phone number or email address that you used during your guest checkout, our support team can assist you in linking your order history so that future and past records appear neatly within your dashboard.",
    tags: ["link account", "convert guest", "sync orders"],
  },

  // 3. Products & Pricing
  {
    id: "prod-1",
    category: "products-pricing",
    categoryLabel: "Products & Pricing",
    question: "Are product prices transparent and inclusive of taxes?",
    answer:
      "Yes! All prices listed on the Gharsansar website are transparent. Any applicable GST or specific shipping charges for oversized products (such as heavy vinyl flooring or customized panels) are clearly calculated and presented in your order summary before you confirm payment. There are never any hidden fees or surprise charges.",
    tags: ["price", "tax", "gst", "pricing", "cost", "transparent"],
  },
  {
    id: "prod-2",
    category: "products-pricing",
    categoryLabel: "Products & Pricing",
    question: "Can I enquire about wallpapers and vinyl flooring for custom wall sizes?",
    answer:
      "Yes! Wallpapers and vinyl flooring require accurate area calculations to ensure you purchase the right quantity without excess waste. On any wallpaper or flooring page, you can click 'Inquire on WhatsApp' or call us at +91 9701990090. Simply provide your wall dimensions (width × height) or room area, and our technical specialists will calculate the exact number of rolls or square footage required, including pattern matching allowance.",
    tags: ["wallpapers", "vinyl flooring", "measurements", "dimensions", "custom size", "sqft"],
  },
  {
    id: "prod-3",
    category: "products-pricing",
    categoryLabel: "Products & Pricing",
    question: "Do you offer custom-made 3D wallpapers and personalized wall murals?",
    answer:
      "Yes! We design and produce bespoke 3D customized wallpapers and wall art murals tailored precisely to your specific wall dimensions. You can choose from our extensive catalog of spiritual, geometric, floral, architectural, or nature-inspired themes—or share your own high-resolution image. Before printing, our graphic design team provides a 2D preview scaled to your wall proportions for your final approval.",
    tags: ["3d wallpaper", "customized", "custom murals", "bespoke", "wall print"],
  },
  {
    id: "prod-4",
    category: "products-pricing",
    categoryLabel: "Products & Pricing",
    question: "Can I purchase products in bulk for commercial projects or return gifts?",
    answer:
      "Yes, we specialize in bulk orders! Whether you are an interior contractor, architect, hospitality venue, or planning a wedding/housewarming return gift celebration, we provide tiered bulk pricing. Contact our corporate & bulk sales desk via WhatsApp (+91 9492664870) or phone (+91 9701990090) with your required quantity to receive a personalized quote.",
    tags: ["bulk", "wholesale", "return gifts", "wedding", "commercial", "quantity"],
  },
  {
    id: "prod-5",
    category: "products-pricing",
    categoryLabel: "Products & Pricing",
    question: "Are physical material samples available before purchasing?",
    answer:
      "For interior designers, builders, and large renovations, we provide physical swatch books and material samples at our Vijayawada showroom. For remote clients across India, our team can arrange high-definition video walkthroughs and send physical material swatches upon request.",
    tags: ["samples", "swatches", "materials", "textures"],
  },

  // 4. Orders & Payments
  {
    id: "ord-1",
    category: "orders-payments",
    categoryLabel: "Orders & Payments",
    question: "How can I place an order on the website?",
    answer:
      "Placing an order takes just a few clicks:\n1. Browse our catalog and select your desired products.\n2. Choose any required options (size, color, design roll) and click 'Add to Cart'.\n3. Click the Cart icon in the top header and review your items.\n4. Click 'Proceed to Checkout'.\n5. Choose to sign in or proceed seamlessly as a guest.\n6. Enter your delivery address and contact information.\n7. Select your preferred payment method and complete the payment securely.\n8. You will instantly receive an order confirmation screen and a notification with your Order ID.",
    tags: ["place order", "how to order", "buying process", "checkout"],
  },
  {
    id: "ord-2",
    category: "orders-payments",
    categoryLabel: "Orders & Payments",
    question: "What payment methods are accepted?",
    answer:
      "We accept all major secure electronic payment methods through our certified payment gateway:\n• UPI: Google Pay, PhonePe, Paytm, BHIM, and any UPI app.\n• Credit Cards: Visa, MasterCard, RuPay, and American Express.\n• Debit Cards: All major Indian bank debit cards.\n• Net Banking: 50+ supported Indian banks.\nFor custom interior design contracts or showroom purchases, direct bank transfer (NEFT/RTGS/IMPS) and in-store payments are also accepted.",
    tags: ["payment methods", "upi", "google pay", "phonepe", "credit card", "net banking"],
  },
  {
    id: "ord-3",
    category: "orders-payments",
    categoryLabel: "Orders & Payments",
    question: "Is my online payment information secure?",
    answer:
      "Yes, 100%. All online payments on Gharsansar are processed through bank-grade, PCI-DSS Level 1 compliant payment gateways protected with 256-bit SSL encryption. We never see, store, or have access to your credit/debit card numbers, CVVs, or bank credentials.",
    tags: ["security", "safety", "payment security", "encrypted", "safe"],
  },
  {
    id: "ord-4",
    category: "orders-payments",
    categoryLabel: "Orders & Payments",
    question: "What should I do if my payment was debited but the order was not confirmed?",
    answer:
      "In rare cases of network timeouts during payment processing, funds deducted by your bank are held by the payment gateway. If this happens, please WhatsApp us at +91 9492664870 with your transaction reference number and bank screenshot. Our team will verify the payment status with the gateway and immediately confirm your order or assist in expediting the automatic bank refund.",
    tags: ["payment failure", "money deducted", "failed transaction", "payment issue"],
  },

  // 5. Shipping & Delivery
  {
    id: "ship-1",
    category: "shipping-delivery",
    categoryLabel: "Shipping & Delivery",
    question: "Does Gharsansar provide home delivery across India?",
    answer:
      "Yes, we ship nationwide! All our decor artifacts, wallpaper rolls, festive return gifts, and interior materials are delivered safely to your doorstep across Andhra Pradesh, Telangana, major metros, and tier-2/3 cities throughout India through reputable logistics partners.",
    tags: ["delivery", "home delivery", "shipping", "pan india", "courier"],
  },
  {
    id: "ship-2",
    category: "shipping-delivery",
    categoryLabel: "Shipping & Delivery",
    question: "How can I track my order?",
    answer:
      "Tracking is available for both logged-in and guest customers:\n• Logged-in Users: Go to Profile > My Orders in the top navigation to view the live status of your order.\n• Guest Users & All Orders: Once your package is dispatched from our Vijayawada hub, you will receive a tracking link via WhatsApp/SMS. You can also contact our support desk with your Order ID anytime for live location details.",
    tags: ["track order", "tracking", "status", "dispatch", "where is my order"],
  },
  {
    id: "ship-3",
    category: "shipping-delivery",
    categoryLabel: "Shipping & Delivery",
    question: "How are delicate home decor and wallpapers packaged?",
    answer:
      "We take extreme care in packing fragile and luxury items:\n• Wallpaper rolls are sealed in heavy-duty moisture-proof protective sleeves and enclosed in rigid cylindrical shipping tubes to prevent creasing.\n• Framed wall art, ceramics, and return gift items are cushioned with multi-layer bubble wrap, foam corner bumpers, and reinforced double-wall corrugated cartons.",
    tags: ["packaging", "fragile", "safety", "damage prevention", "wallpaper packing"],
  },
  {
    id: "ship-4",
    category: "shipping-delivery",
    categoryLabel: "Shipping & Delivery",
    question: "Can I change my delivery address after placing an order?",
    answer:
      "If your order has not yet been dispatched from our facility, we are happy to update your shipping address. Please immediately message our support team on WhatsApp (+91 9492664870) or call +91 9701990090 with your Order ID and the updated address.",
    tags: ["change address", "edit address", "update shipping", "delivery address"],
  },

  // 6. WhatsApp Enquiries
  {
    id: "wa-1",
    category: "whatsapp",
    categoryLabel: "WhatsApp Enquiries",
    question: "Can I enquire through WhatsApp without logging in or registering?",
    answer:
      "Yes! Enquiring via WhatsApp requires zero account creation or login. You can simply tap the WhatsApp button anywhere on our website to start a direct, human conversation with our Vijayawada team from your phone or desktop.",
    tags: ["whatsapp", "no login", "guest whatsapp", "direct inquiry"],
  },
  {
    id: "wa-2",
    category: "whatsapp",
    categoryLabel: "WhatsApp Enquiries",
    question: "Can I check real-time product availability through WhatsApp?",
    answer:
      "Absolutely. If you are eyeing a particular wallpaper design, gift item, or vinyl shade, click 'Inquire on WhatsApp' on the product page. Our studio managers will check live warehouse stock and confirm availability and batch numbers within minutes.",
    tags: ["check stock", "availability", "whatsapp stock", "in stock"],
  },
  {
    id: "wa-3",
    category: "whatsapp",
    categoryLabel: "WhatsApp Enquiries",
    question: "Can I request real product photos, video clips, and texture previews on WhatsApp?",
    answer:
      "Yes, we encourage this! We understand that lighting and textures look different in real life. When you connect with us on WhatsApp, our team will gladly send you unboxing video clips, natural daylight photos, and close-up texture captures of any wallpaper, wall art, or flooring sample.",
    tags: ["real photos", "videos", "texture preview", "daylight photos", "live video"],
  },
  {
    id: "wa-4",
    category: "whatsapp",
    categoryLabel: "WhatsApp Enquiries",
    question: "Does the WhatsApp button replace regular website checkout?",
    answer:
      "No, they operate side-by-side! The WhatsApp button provides an optional, personalized channel for customers who prefer speaking to an interior expert, discussing room measurements, or placing bespoke orders. Both our standard online checkout and direct WhatsApp order channels are fully supported.",
    tags: ["whatsapp checkout", "difference", "support channel"],
  },

  // 8. Customer Support
  {
    id: "sup-1",
    category: "support",
    categoryLabel: "Customer Support",
    question: "How can I contact Ghar Sansar customer support?",
    answer:
      "You can connect with our team through multiple direct channels:\n• WhatsApp: +91 9492664870 (Fastest response)\n• Direct Phone: +91 9701990090\n• Official Email: gharsansarvj@gmail.com\n• Flagship Store: D.No. 27-3-68, Governorpet-520002, Vijayawada, Andhra Pradesh\nWe are here to assist with product guidance, order tracking, measurements, and interior styling.",
    tags: ["contact", "support", "phone", "email", "helpline", "helpdesk"],
  },
  {
    id: "sup-2",
    category: "support",
    categoryLabel: "Customer Support",
    question: "What are your customer support operating hours?",
    answer:
      "Our showroom and support helpline are active Monday through Saturday from 10:00 AM to 8:30 PM IST. If you send us a message or WhatsApp outside business hours, our team will respond promptly first thing on the next working morning.",
    tags: ["hours", "timings", "working hours", "open days", "schedule"],
  },
  {
    id: "sup-3",
    category: "support",
    categoryLabel: "Customer Support",
    question: "Can I book a personalized interior design consultation?",
    answer:
      "Yes! Ghar Sansar offers free interior consultations for residences and commercial spaces in Andhra Pradesh and Telangana. You can book an appointment through our website's Interior Design page, call us at +91 9701990090, or message us on WhatsApp with photos or floor plans of your space to get started.",
    tags: ["interior consultation", "book consultation", "designer", "appointment", "free consultation"],
  },
];

export const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("all");
  const [openId, setOpenId] = useState<string | null>("gen-1"); // Open first item by default

  const adminWhatsApp = getAdminWhatsAppNumber();
  const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
    "Hello Ghar Sansar! I have a question regarding your products and shopping process."
  )}`;

  useEffect(() => {
    document.title = "FAQ | Ghar Sansar";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Filter items based on active category
  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return FAQ_DATA;
    return FAQ_DATA.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#181513] font-sans selection:bg-[#C86B4C] selection:text-white pb-20">
      {/* 1. Minimal Header (Spacious clearance below navbar, no search bar) */}
      <section className="pt-24 sm:pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-[#181513] mb-3">
          FAQ
        </h1>
        <p className="text-sm sm:text-base text-[#736B63] max-w-xl mx-auto leading-relaxed">
          Everything you need to know about shopping with Gharsansar.
        </p>
      </section>

      {/* 2. Three Customer Shopping Experiences Highlight Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Journey 1: Shopping With Login */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-[#E8E2D8] hover:border-[#C86B4C]/40 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#F7EBE4] text-[#C86B4C] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C86B4C] bg-[#F7EBE4] px-2.5 py-1 rounded-full">
                  Account Journey
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#181513] mb-2">
                Shopping With Login
              </h3>
              <p className="text-xs sm:text-[13px] text-[#736B63] leading-relaxed mb-4">
                Enjoy full account privileges: manage saved delivery addresses, access permanent past purchase history,
                track active orders in real time, and save favorite items across devices.
              </p>
              <ul className="space-y-1.5 text-xs text-[#4A433D] mb-5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C86B4C] shrink-0" />
                  <span>Access previous orders &amp; invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C86B4C] shrink-0" />
                  <span>Save multiple delivery addresses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C86B4C] shrink-0" />
                  <span>Live order tracking in dashboard</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-between text-xs font-semibold text-[#C86B4C] hover:text-[#7D3219] pt-3 border-t border-[#F2ECE4] transition-colors"
            >
              <span>Sign In or Register</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Journey 2: Shopping Without Login (Guest) */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-[#E8E2D8] hover:border-[#C86B4C]/40 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#F4F1EA] text-[#736B63] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5 text-[#8C5E3C]" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C5E3C] bg-[#F4F1EA] px-2.5 py-1 rounded-full">
                  Fast &amp; Direct
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#181513] mb-2">
                Guest Shopping (No Login)
              </h3>
              <p className="text-xs sm:text-[13px] text-[#736B63] leading-relaxed mb-4">
                Shop quickly without creating an account or remembering passwords. Browse all products, add to cart,
                and complete checkout with just your shipping info and mobile number.
              </p>
              <ul className="space-y-1.5 text-xs text-[#4A433D] mb-5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8C5E3C] shrink-0" />
                  <span>Instant checkout with zero sign-up</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8C5E3C] shrink-0" />
                  <span>Order ID confirmation via SMS/WhatsApp</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8C5E3C] shrink-0" />
                  <span>Direct shipment tracking link provided</span>
                </li>
              </ul>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-between text-xs font-semibold text-[#8C5E3C] hover:text-[#5B3920] pt-3 border-t border-[#F2ECE4] transition-colors"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Journey 3: WhatsApp Inquiry */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-[#E8E2D8] hover:border-[#1E7E34]/40 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#25D366] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5 text-[#1E7E34]" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1E7E34] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                  1-on-1 Assistance
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#181513] mb-2">
                WhatsApp Enquiries &amp; Orders
              </h3>
              <p className="text-xs sm:text-[13px] text-[#736B63] leading-relaxed mb-4">
                Chat directly with our studio team. Ask current pricing, check live stock, request daylight unboxing
                videos/photos, share room dimensions for roll calculations, or discuss bulk rates.
              </p>
              <ul className="space-y-1.5 text-xs text-[#4A433D] mb-5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7E34] shrink-0" />
                  <span>No login or app registration needed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7E34] shrink-0" />
                  <span>Request live photos &amp; texture previews</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7E34] shrink-0" />
                  <span>Custom wall size &amp; bulk quotes</span>
                </li>
              </ul>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between text-xs font-semibold text-[#1E7E34] hover:text-[#155D27] pt-3 border-t border-[#F2ECE4] transition-colors"
            >
              <span>Connect on WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Category Filter Navigation */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#181513]">
            Browse by Category
          </h2>
          <span className="text-xs text-[#8C827A] hidden sm:inline">
            Showing {filteredItems.length} of {FAQ_DATA.length} answers
          </span>
        </div>

        {/* Category Pills (horizontal scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === "all"
                ? FAQ_DATA.length
                : FAQ_DATA.filter((i) => i.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  // If opening category, reset open accordion to first item in category
                  const firstInCat =
                    cat.id === "all"
                      ? FAQ_DATA[0]?.id
                      : FAQ_DATA.find((i) => i.category === cat.id)?.id;
                  if (firstInCat) setOpenId(firstInCat);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? "bg-[#C86B4C] text-white border-[#C86B4C] shadow-md shadow-[#C86B4C]/25"
                    : "bg-white text-[#736B63] border-[#E8E2D8] hover:border-[#C86B4C]/50 hover:text-[#181513]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#8C827A]"}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-[#FAF7F2] text-[#8C827A]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Accordion Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20">
        <div className="space-y-3">
          {filteredItems.map((item, idx) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#C86B4C]/50 shadow-md shadow-[#C86B4C]/5"
                    : "border-[#E8E2D8] hover:border-[#D9B4A4]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C86B4C] bg-[#F7EBE4] px-2 py-0.5 rounded-full">
                        {item.categoryLabel}
                      </span>
                      <span className="text-[11px] text-[#A69E96]">Q{idx + 1}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-[#181513] leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "bg-[#C86B4C] text-white rotate-180" : "bg-[#FAF7F2] text-[#8C827A]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#4A433D] leading-relaxed border-t border-[#F5F0E8] whitespace-pre-line">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Customer Support Section (Clean & Minimal) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#E8E2D8] mt-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#181513] mb-2">
            Still have questions?
          </h2>

          <p className="text-xs sm:text-sm text-[#736B63] max-w-lg mx-auto leading-relaxed mb-6">
            Our team is here to help. Contact us directly for assistance with products, orders and enquiries.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Link
              to="/services"
              className="px-5 py-2.5 rounded-xl bg-[#C86B4C] hover:bg-[#B05B3C] text-white text-xs sm:text-sm font-medium shadow-xs transition-all inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Us</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-medium shadow-xs transition-all inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Quick Contact Details Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#736B63]">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#C86B4C]" />
              <a href="tel:+919701990090" className="hover:text-[#C86B4C] transition-colors">
                +91 9701990090
              </a>
            </div>

            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#C86B4C]" />
              <a href="mailto:gharsansarvj@gmail.com" className="hover:text-[#C86B4C] transition-colors">
                gharsansarvj@gmail.com
              </a>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C86B4C]" />
              <span>Governorpet, Vijayawada</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
