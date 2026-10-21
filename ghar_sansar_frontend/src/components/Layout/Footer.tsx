import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0c2419] text-white border-t border-[#1b3d2c]">
      <div className="w-full max-w-[1880px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="flex flex-col">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/ghar_sansar_logo_nav.png"
                alt="Ghar Sansar"
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 font-light">
              Your trusted partner for home essentials, premium cookware, décor, gifts and more. Bringing elegance to every home.
            </p>
            <div className="flex items-center space-x-3">
              <a
                href="https://www.facebook.com/GharSansarshop/"
                className="w-8 h-8 rounded-none border border-white/20 hover:border-white text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://www.instagram.com/gharsansar_shop/" 
                className="w-8 h-8 rounded-none border border-white/20 hover:border-white text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://www.youtube.com/@gharsansar_shop" 
                className="w-8 h-8 rounded-none border border-white/20 hover:border-white text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://in.pinterest.com/" 
                className="w-8 h-8 rounded-none border border-white/20 hover:border-white text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.373-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-widest mb-5 text-[#c8a97e]">Quick Links</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
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
                <Link to="/return-gifts" className="text-gray-300 hover:text-white transition-colors">
                  Return Gifts
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-widest mb-5 text-[#c8a97e]">Categories</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/interior-design?category=Wallpaper%20Rolls" className="text-gray-300 hover:text-white transition-colors">
                  Wallpaper Rolls
                </Link>
              </li>
              <li>
                <Link to="/interior-design?category=Wallpapers" className="text-gray-300 hover:text-white transition-colors">
                  Wallpapers
                </Link>
              </li>
              <li>
                <Link to="/interior-design?category=3d%20wallpapers" className="text-gray-300 hover:text-white transition-colors">
                  3D Wallpapers
                </Link>
              </li>
              <li>
                <Link to="/interior-design?category=Vinyl%20Flooring" className="text-gray-300 hover:text-white transition-colors">
                  Vinyl Flooring
                </Link>
              </li>
              <li>
                <Link to="/interior-design?category=Blinds" className="text-gray-300 hover:text-white transition-colors">
                  Blinds
                </Link>
              </li>
              <li>
                <Link to="/interior-design?category=WALL%20ART%20AFFECTS" className="text-gray-300 hover:text-white transition-colors">
                  Wall Art Affects
                </Link>
              </li>
              <li>
                <Link to="/interior-design?category=Sliding%20%26%20Metal%20Door" className="text-gray-300 hover:text-white transition-colors">
                  Doors & Partitions
                </Link>
              </li>
              <li>
                <Link to="/interior-design" className="text-gray-300 hover:text-white transition-colors">
                  Others
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info & Ambient Decor Preview */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase font-bold tracking-widest mb-5 text-[#c8a97e]">Contact Us</h3>
              <ul className="space-y-3.5 text-xs sm:text-sm max-w-xs">
                <li className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-[#c8a97e] mt-0.5 shrink-0" />
                  <span className="text-gray-300 font-light leading-relaxed">
                    D.No: 27-14-60, Main Road, Rajagopalachari Street, Governorpet - 520002, Vijayawada, Andhra Pradesh
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-[#c8a97e] shrink-0" />
                  <span className="text-gray-300 font-light">+91-8121135980</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-[#c8a97e] shrink-0" />
                  <span className="text-gray-300 font-light">gharsansarshop@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Decorative Luxury Ambient Decor (Image 1 replacing Image 2) */}
            <div className="mt-6 w-full max-w-[280px] aspect-[16/10] rounded-none overflow-hidden border border-white/15 shadow-2xl group">
              <img
                src="/images/footer_ambient_lounge.jpg"
                alt="Luxury Home & Decor - Ghar Sansar"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
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
