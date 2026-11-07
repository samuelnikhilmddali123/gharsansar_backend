import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import GharSansarLogo from "./GharSansarLogo";
import toast from "react-hot-toast";

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  return (
    <footer className="bg-[#FAF7F2] text-gray-800 border-t border-[#E8E2D8] font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 pt-4 sm:pt-5 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-4 border-b border-[#E8E2D8]">
          
          {/* Column 1: Brand & Socials (Span 4) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col pr-0 lg:pr-4">
            <div className="mb-3.5">
              <GharSansarLogo variant="dark" />
            </div>
            <p className="text-gray-600 text-xs leading-relaxed mb-2.5 font-normal max-w-xs">
              Transforming homes with premium products and professional interior design services.
            </p>
            {/* Social Icons: Minimalist circular outlines */}
            <div className="flex items-center space-x-2.5">
              <a
                href="https://www.instagram.com/gharsansar_shop/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:text-white hover:border-[#C86B4C] hover:bg-[#C86B4C] flex items-center justify-center transition-all duration-200"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.facebook.com/GharSansarshop/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:text-white hover:border-[#C86B4C] hover:bg-[#C86B4C] flex items-center justify-center transition-all duration-200"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.youtube.com/@gharsansar_shop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:text-white hover:border-[#C86B4C] hover:bg-[#C86B4C] flex items-center justify-center transition-all duration-200"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:text-white hover:border-[#C86B4C] hover:bg-[#C86B4C] flex items-center justify-center transition-all duration-200"
              >
                <span className="font-poppins font-bold text-xs">P</span>
              </a>
            </div>
          </div>

          {/* Column 2: EXPLORE (Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C86B4C] mb-3.5 font-sans">
              Explore
            </h4>
            <ul className="space-y-1 text-xs sm:text-[13px] text-gray-650 font-normal">
              <li>
                <Link to="/" className="hover:text-[#C86B4C] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/interior-design" className="hover:text-[#C86B4C] transition-colors">
                  Interior Design
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#C86B4C] transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/return-gifts" className="hover:text-[#C86B4C] transition-colors">
                  Festive Gifts
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#C86B4C] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#C86B4C] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: SUPPORT (Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C86B4C] mb-3.5 font-sans">
              Support
            </h4>
            <ul className="space-y-1 text-xs sm:text-[13px] text-gray-650 font-normal">
              <li>
                <Link to="/my-orders" className="hover:text-[#C86B4C] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#C86B4C] transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#C86B4C] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#C86B4C] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#C86B4C] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#C86B4C] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: CONTACT US (Span 3) */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C86B4C] mb-3.5 font-sans">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-650">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#C86B4C] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  D.No. 27-3-68, Near Buckingham Post Office, Rajulakshmi School,
                  Governorpet-520002, Vijayawada, Andhra Pradesh
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#C86B4C] shrink-0" />
                <a
                  href="tel:+919701990090"
                  className="hover:text-[#C86B4C] transition-colors font-medium text-gray-800"
                >
                  +91 9701990090
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#C86B4C] shrink-0" />
                <a
                  href="mailto:gharsansarvij@gmail.com"
                  className="hover:text-[#C86B4C] transition-colors text-gray-800"
                >
                  gharsansarvj@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter Subscription (Span 2) */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C86B4C] mb-3.5 font-sans">
                Join Our Newsletter
              </h4>
              <p className="text-xs text-gray-650 mb-3.5 leading-relaxed font-normal">
                Get latest updates, offers and interior inspiration.
              </p>
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#DCD5C9] rounded-full pl-3.5 pr-10 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#C86B4C] transition-all shadow-2xs"
                  required
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1 w-7 h-7 rounded-full bg-[#C86B4C] hover:bg-[#B35E42] text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                >
                  {subscribed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-gray-500 gap-3">
          <p>© 2026 Ghar Sansar. All rights reserved.</p>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link to="/privacy-policy" className="hover:text-[#C86B4C] transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link to="/privacy-policy" className="hover:text-[#C86B4C] transition-colors">
              Terms &amp; Conditions
            </Link>
            <span>|</span>
            <Link to="/privacy-policy" className="hover:text-[#C86B4C] transition-colors">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;