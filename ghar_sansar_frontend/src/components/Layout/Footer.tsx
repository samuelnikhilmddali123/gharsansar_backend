import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Phone, MapPin, Youtube, ArrowUpRight } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B1511] text-[#EAE6DE] border-t border-white/10 relative overflow-hidden">
      {/* Subtle architectural ambient highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent" />
      
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
          {/* Col 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Link to="/" className="inline-flex items-center gap-3.5 mb-5 group">
                <img
                  src="/images/logo.png"
                  alt="Ghar Sansar"
                  className="w-10 h-10 rounded-full object-contain bg-white p-1 shadow-sm group-hover:scale-105 transition-transform"
                />
                <div>
                  <span className="text-xl font-serif tracking-[0.2em] font-bold text-white block">
                    GHAR SANSAR
                  </span>
                  <span className="text-[10px] text-[#A69F92] tracking-[0.25em] uppercase font-sans font-light">
                    Interior Studio &amp; Decor
                  </span>
                </div>
              </Link>

              <p className="text-[#A8A296] text-xs sm:text-[13px] leading-relaxed mb-8 max-w-sm font-light">
                Transform your home with our premium decor items and professional interior design services.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-2.5">
              <a
                href="https://www.facebook.com/GharSansarshop/"
                className="w-9 h-9 rounded-full border border-white/12 bg-white/5 hover:bg-[#C5A059] hover:border-[#C5A059] text-gray-300 hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>

              <a
                href="https://www.youtube.com/@gharsansar_shop"
                className="w-9 h-9 rounded-full border border-white/12 bg-white/5 hover:bg-[#C5A059] hover:border-[#C5A059] text-gray-300 hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>

              <a
                href="https://www.instagram.com/gharsansar_shop/"
                className="w-9 h-9 rounded-full border border-white/12 bg-white/5 hover:bg-[#C5A059] hover:border-[#C5A059] text-gray-300 hover:text-black flex items-center justify-center transition-all duration-300 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] uppercase font-bold tracking-[0.24em] mb-6 text-[#C5A059]">
              QUICK LINKS
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-[13px]">
              {[
                { label: "Products", to: "/products" },
                { label: "Interior Design", to: "/interior-design" },
                { label: "Blog", to: "/blog" },
                { label: "My Account", to: "/login" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[#B5AFA4] hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5 group"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#C5A059]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] uppercase font-bold tracking-[0.24em] mb-6 text-[#C5A059]">
              CATEGORIES
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-[13px]">
              {[
                { label: "ICU Flooring", to: "/interior-design?category=ICU%20Flooring" },
                { label: "Bubble Fountain", to: "/interior-design?category=Bubble%20Fountain" },
                { label: "Wallpaper Rolls", to: "/interior-design?category=Wallpaper%20Rolls" },
                { label: "Gym Flooring", to: "/interior-design?category=Gym%20Flooring" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-[#B5AFA4] hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5 group"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#C5A059]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact Us (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] uppercase font-bold tracking-[0.24em] mb-6 text-[#C5A059]">
              CONTACT US
            </h3>
            <ul className="space-y-4 text-xs sm:text-[13px]">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#C5A059] mt-0.5 shrink-0" />
                <span className="text-[#B5AFA4] font-light leading-relaxed">
                  D.No: 27-14-60, Near Buckingham Post Office, Rajagopalachari Street, Governerpet-520002
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <a
                  href="tel:+918121135980"
                  className="text-[#B5AFA4] hover:text-white transition-colors font-light"
                >
                  +91-8121135980
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <a
                  href="mailto:gharsansarshop@gmail.com"
                  className="text-[#B5AFA4] hover:text-white transition-colors font-light"
                >
                  gharsansarshop@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#8F897F] gap-4">
          <p className="font-light">
            © 2026 Gharsansar. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-light">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="opacity-30">|</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms &amp; Conditions</span>
            <span className="opacity-30">|</span>
            <span className="hover:text-white transition-colors cursor-pointer">Shipping Policy</span>
            <span className="opacity-30">|</span>
            <span className="hover:text-white transition-colors cursor-pointer">Return Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
