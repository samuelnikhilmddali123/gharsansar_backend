// src/pages/Home.tsx
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Package,
  Eye,
  MessageSquare,
  Home as HomeIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import ProductCard from "../components/ProductCard";

const Home: React.FC = () => {
  const { products } = useProducts();
  const navigate = useNavigate();

  // How We Work steps matching reference image
  const workSteps = [
    {
      number: "01",
      icon: Eye,
      title: "Browse & Select",
      description:
        "Explore a curated collection of products and interior design galleries, & select from our design services that match your style.",
    },
    {
      number: "02",
      icon: MessageSquare,
      title: "Consultation",
      description:
        "Connect with our design experts for personalized advice and customization based on your space and preferences.",
    },
    {
      number: "03",
      icon: Truck,
      title: "We Deliver",
      description:
        "Experience hassle-free delivery, installation and support. We handle everything for you.",
    },
    {
      number: "04",
      icon: HomeIcon,
      title: "Enjoy",
      description:
        "Transform your space and enjoy a beautiful, functional home with our designs and products.",
    },
  ];

  // 6 Interior Works matching reference image
  const interiorWorks = [
    {
      title: "Wallpaper Rolls",
      count: "35+ Designs",
      image: "/images/wallapaper rolls.jpg",
      link: "/interior-design?category=wallpaper_rolls",
    },
    {
      title: "Wallpapers",
      count: "18+ Designs",
      image: "/images/wallpapers.jpg",
      link: "/interior-design?category=wallpaper",
    },
    {
      title: "3d wallpapers",
      count: "12+ Designs",
      image: "/images/3d wallapapers.jpg",
      link: "/interior-design?category=3dbokka",
    },
    {
      title: "WALLART AFFECTS",
      count: "5+ Designs",
      image: "/images/wall art effect.jpg",
      link: "/interior-design?category=wallart",
    },
    {
      title: "Vinyl Flooring",
      count: "15+ Designs",
      image: "/images/vinyl flooring.jpg",
      link: "/interior-design?category=vinyl_flooring",
    },
    {
      title: "Natural Vertical Garden",
      count: "12+ Designs",
      image: "/images/natural vertical garden.jpg",
      link: "/interior-design?category=artificial_vertical_garden",
    },
  ];

  // Trust Badges matching reference image
  const trustBadges = [
    {
      icon: Truck,
      title: "Express Delivery",
      description: "Fast and reliable shipping across India",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      description: "100% secure payment processing",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock customer support",
    },
    {
      icon: Package,
      title: "Easy Returns",
      description: "Product can be returned or exchanged",
    },
  ];

  // Filter products for Recent Products carousel
  const [productPage, setProductPage] = useState(0);

  const recentProducts = useMemo(() => {
    // Prioritize Sonu cookware items as shown in reference image
    const sonuItems = products.filter(
      (p) =>
        p.title?.toLowerCase().includes("sonu") ||
        p.category?.toLowerCase().includes("sonu")
    );
    const otherItems = products.filter((p) => !sonuItems.includes(p));
    return [...sonuItems, ...otherItems];
  }, [products]);

  const maxPages = Math.max(1, Math.ceil(recentProducts.length / 4));
  const currentRecentProducts = recentProducts.slice(
    productPage * 4,
    productPage * 4 + 4
  );

  const prevProductPage = () => {
    setProductPage((prev) => (prev > 0 ? prev - 1 : maxPages - 1));
  };

  const nextProductPage = () => {
    setProductPage((prev) => (prev + 1 < maxPages ? prev + 1 : 0));
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans text-gray-900 flex flex-col">
      {/* SEO Headings for Regional Keywords */}
      <div className="sr-only">
        <h2>Best Interior Designers in Vijayawada, Andhra Pradesh</h2>
        <h2>Best Interior Designers in Guntur, Andhra Pradesh</h2>
        <h2>Best Interior Designers in Eluru, Andhra Pradesh</h2>
        <h2>Best Interior Designers in Hyderabad, Telangana</h2>
        <h2>Interior Design Services Vijayawada</h2>
        <h2>Ghar Sansar - #1 Interior Designers Vijayawada</h2>
      </div>

      {/* 1. Hero Section - Centered Luxury Layout matching Reference Design with Blurred Backdrop */}
      <section className="relative min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
        {/* Luxury Background Image with Soft Gaussian Blur & Cinematic Dark Overlay - Full Viewport Cover */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/sunlit_luxe_temple_lounge.png"
            alt="Interior Design Solutions - Sunlit Luxe Temple Lounge"
            className="w-full h-full object-cover object-center scale-105 filter blur-[4px] brightness-[0.68] contrast-[1.08]"
          />
          {/* Moody Luxury Cinematic Overlays */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          {/* Centered Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center -mt-6 sm:-mt-10 lg:-mt-12"
          >
            {/* Spaced Eyebrow Tag matching 2nd image */}
            <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-medium tracking-[0.35em] text-[#D4AF37] uppercase drop-shadow-sm font-sans">
                B E A U T I F U L &nbsp; S P A C E S
              </span>
            </div>

            {/* Elegant Centered Serif Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-wide leading-[1.12] mb-5 sm:mb-6 max-w-4xl drop-shadow-lg">
              Best Interior Designers in
              <span className="block italic font-light text-[#F3E2C7] mt-2">
                Andhra Pradesh &amp; Telangana
              </span>
            </h1>

            {/* Subtitle description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-200 font-light max-w-2xl mx-auto leading-relaxed mb-7 sm:mb-8 drop-shadow-md">
              Transform your space into a story of comfort, elegance, and timeless design with bespoke decor collections and award-winning interior design services.
            </p>

            {/* CTA Buttons - Warm caramel rounded-full button matching 2nd image */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/interior-design"
                className="bg-[#C89A65] hover:bg-[#B58752] text-black px-8 py-4 rounded-full shadow-2xl transition-all duration-300 font-semibold uppercase tracking-wider text-xs inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                Explore Our Designs
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                to="/products"
                className="border border-white/30 hover:border-white bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full backdrop-blur-md transition-all duration-300 font-semibold uppercase tracking-wider text-xs inline-flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg"
              >
                Shop Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. How We Work Section matching Reference Design */}
      <section className="py-16 sm:py-20 relative bg-[#FAF8F5]">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-gray-900 tracking-tight">
              How We Work
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-xl mx-auto font-normal leading-relaxed">
              From browsing to delivery, we make your home transformation journey seamless.
            </p>
          </div>

          {/* 4 Steps Row with Connecting Arrows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {workSteps.map((step, idx) => (
              <div key={step.number} className="relative flex flex-col items-center">
                {/* Step Card */}
                <div className="w-full h-full bg-white rounded-2xl p-6 sm:p-7 border border-[#E8E5DC] shadow-2xs hover:shadow-md transition-all duration-300 text-center flex flex-col items-center group">
                  {/* Step Number */}
                  <span className="text-xs font-semibold text-[#9E472A] tracking-wider mb-3">
                    {step.number}
                  </span>

                  {/* Icon Circle */}
                  <div className="w-14 h-14 rounded-full bg-[#FAF3EC] text-[#9E472A] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                    <step.icon size={22} className="stroke-[1.8]" />
                  </div>

                  {/* Step Title */}
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs text-gray-500 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Arrow between cards on desktop */}
                {idx < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -right-3 text-gray-400 z-10 pointer-events-none">
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Start Your Journey Button */}
          <div className="mt-12 text-center">
            <Link
              to="/interior-design"
              className="inline-flex items-center gap-2 bg-[#0a2e22] hover:bg-[#061d15] text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-full shadow-sm transition-all hover:gap-3 cursor-pointer"
            >
              <span>START YOUR JOURNEY</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Our Interior Works Section matching Reference Design */}
      <section className="py-14 sm:py-18 bg-[#F7F5F0] border-y border-[#E8E5DC]">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#9E472A] uppercase block mb-1">
                INTERIOR DESIGN SERVICES
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 font-normal tracking-tight">
                Our Interior Works
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                Transform your space with our professional interior design solutions.
              </p>
            </div>

            <Link
              to="/interior-design"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-800 bg-white border border-[#E8E5DC] hover:border-gray-400 px-4 py-2 rounded-full shadow-2xs transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span>View All Designs</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* 6 Cards Grid (2 rows of 3 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {interiorWorks.map((work) => (
              <Link
                key={work.title}
                to={work.link}
                className="group relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-[#ece6dc] cursor-pointer block bg-[#111]"
              >
                {/* Background Image */}
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay for perfect readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Bottom Content Row */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-200 transition-colors">
                      {work.title}
                    </h3>
                    <p className="text-xs text-white/80 font-normal mt-0.5">
                      {work.count}
                    </p>
                  </div>

                  {/* Circular Arrow Button */}
                  <div className="w-8 h-8 rounded-full bg-white/90 group-hover:bg-white text-gray-900 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Recent Products Section matching Reference Design */}
      <section className="py-14 sm:py-18 bg-[#FAF8F5]">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Row with Title & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 font-normal tracking-tight">
                Recent Products
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                — Check out our latest arrivals for your home.
              </p>
            </div>

            {/* Right Controls: View All + Prev/Next Arrows */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-800 bg-white border border-[#E8E5DC] hover:border-gray-400 px-4 py-2 rounded-full shadow-2xs transition-colors cursor-pointer"
              >
                <span>View all Products</span>
                <ArrowRight size={13} />
              </Link>
              <button
                type="button"
                onClick={prevProductPage}
                aria-label="Previous products"
                className="w-8 h-8 rounded-full border border-[#E8E5DC] bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextProductPage}
                aria-label="Next products"
                className="w-8 h-8 rounded-full border border-[#E8E5DC] bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* 4 Product Cards in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {currentRecentProducts.map((product, idx) => (
              <ProductCard key={product.id || idx} product={product} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Custom Interior Design Services Split Banner matching Reference Design */}
      <section className="py-8 sm:py-12 bg-[#FAF8F5]">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden bg-white border border-[#E8E5DC] shadow-sm grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Left Image */}
            <div className="w-full h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] overflow-hidden bg-gray-100">
              <img
                src="/images/custom_interior_banner.jpg"
                alt="Custom Interior Design Services"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Text Content */}
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-[#FAF8F5] to-white relative">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#9E472A] uppercase mb-2">
                TURNING HOUSES INTO HOMES
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 font-normal tracking-tight mb-4 leading-[1.15]">
                Custom Interior
                <br />
                Design Services
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-7 max-w-md leading-relaxed font-normal">
                From concept to completion, we deliver personalized interior solutions that reflect your style and needs.
              </p>
              <Link
                to="/interior-design"
                className="inline-flex items-center gap-2 bg-[#0a2e22] hover:bg-[#061d15] text-white text-xs font-bold px-7 py-3.5 rounded-full self-start shadow-sm transition-all hover:gap-3 cursor-pointer"
              >
                <span>Our design services</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Trust Badges Bar matching Reference Design */}
      <section className="py-6 sm:py-10 bg-[#FAF8F5]">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E8E5DC] rounded-2xl p-6 sm:p-8 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustBadges.map((badge) => (
                <div key={badge.title} className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#FAF3EC] text-[#9E472A] flex items-center justify-center shrink-0">
                    <badge.icon size={19} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{badge.title}</h4>
                    <p className="text-[11px] text-gray-500 font-normal mt-0.5">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Beautiful Homes Start Here Gallery Banner matching Reference Design */}
      <section className="py-8 sm:py-12 pb-16 sm:pb-24 bg-[#FAF8F5]">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F2ECE1] border border-[#E6DDD0] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#9E472A] uppercase mb-2">
                GET INSPIRED
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 font-normal tracking-tight mb-3 leading-tight">
                Beautiful Homes
                <br />
                Start Here
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-7 leading-relaxed font-normal">
                Explore our latest interior design projects, décor ideas, and home essentials to create a space that's truly yours.
              </p>
              <Link
                to="/interior-design"
                className="inline-flex items-center gap-2 bg-[#0a2e22] hover:bg-[#061d15] text-white text-xs font-bold px-7 py-3.5 rounded-full self-start shadow-sm transition-all hover:gap-3 cursor-pointer"
              >
                <span>Explore Gallery</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right 3 Gallery Images */}
            <div className="lg:col-span-8 grid grid-cols-3 gap-3.5 sm:gap-4">
              {/* Image 1: Dining */}
              <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-sm border border-black/5 group bg-gray-100">
                <img
                  src="/images/gallery_dining.jpg"
                  alt="Modern Dining Room Interior Design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Image 2: Living Room */}
              <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-sm border border-black/5 group bg-gray-100">
                <img
                  src="/images/gallery_living.jpg"
                  alt="Contemporary Living Room Interior Design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Image 3: Bedroom */}
              <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-sm border border-black/5 group bg-gray-100">
                <img
                  src="/images/gallery_bedroom.jpg"
                  alt="Luxury Master Bedroom Interior Design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;