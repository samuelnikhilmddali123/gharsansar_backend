import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#00281b] text-white border-t border-white/10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <img
                src="/images/logo.png"
                alt="Ghar Sansar"
                className="w-10 h-10 rounded-full object-contain bg-white"
              />
              <span className="text-lg font-serif font-bold tracking-widest text-white">GHAR SANSAR</span>
            </Link>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 font-light max-w-xs">
              Transform your home with our premium decor items and professional interior design services.
            </p>
            <div className="flex items-center space-x-3">
              <a
                href="https://www.facebook.com/GharSansarshop/"
                className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>

              <a 
                href="https://www.youtube.com/@gharsansar_shop" 
                className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>

              <a 
                href="https://www.instagram.com/gharsansar_shop/" 
                className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-widest mb-6 text-[#a855f7]">QUICK LINKS</h3>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/interior-design" className="text-gray-300 hover:text-white transition-colors">
                  Interior Design
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-widest mb-6 text-[#a855f7]">CATEGORIES</h3>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/interior-design?category=ICU%20Flooring" className="text-gray-300 hover:text-white transition-colors">
                  ICU Flooring
                </Link>
              </li>
              <li>
                <Link to="/interior-design?category=Bubble%20Fountain" className="text-gray-300 hover:text-white transition-colors">
                  Bubble Fountain
                </Link>
              </li>
              <li>
                <Link to="/interior-design?category=Wallpaper%20Rolls" className="text-gray-300 hover:text-white transition-colors">
                  Wallpaper Rolls
                </Link>
              </li>
              <li>
                <Link to="/interior-design?category=Gym%20Flooring" className="text-gray-300 hover:text-white transition-colors">
                  Gym Flooring
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-widest mb-6 text-[#a855f7]">CONTACT US</h3>
            <ul className="space-y-4 text-xs sm:text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#a855f7] mt-0.5 shrink-0" />
                <span className="text-gray-300 font-light leading-relaxed">
                  D.No: 27-14-60, Near Buckingham Post Office, Rajagopalachari Street, Governerpet-520002
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#a855f7] shrink-0" />
                <span className="text-gray-300 font-light">+91-8121135980</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#a855f7] shrink-0" />
                <span className="text-gray-300 font-light">gharsansarshop@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p className="mb-4 md:mb-0">
            © 2026 Gharsansar. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 font-light">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span>|</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span>
            <span>|</span>
            <span className="hover:text-white transition-colors cursor-pointer">Shipping Policy</span>
            <span>|</span>
            <span className="hover:text-white transition-colors cursor-pointer">Return Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
