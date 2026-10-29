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
  ArrowUpRight,
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
      gridSpan: "lg:col-span-8 lg:row-span-2",
      aspectRatio: "aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10]",
      featured: true,
      tag: "FEATURED DISCIPLINE",
    },
    {
      title: "Wallpapers",
      count: "18+ Designs",
      image: "/images/wallpapers.jpg",
      link: "/interior-design?category=wallpaper",
      gridSpan: "lg:col-span-4 lg:row-span-1",
      aspectRatio: "aspect-[4/3] sm:aspect-[4/3] lg:aspect-[16/11]",
      featured: false,
      tag: "SURFACE DESIGN",
    },
    {
      title: "3D Wallpapers",
      count: "12+ Designs",
      image: "/images/3d wallapapers.jpg",
      link: "/interior-design?category=3dbokka",
      gridSpan: "lg:col-span-4 lg:row-span-1",
      aspectRatio: "aspect-[4/3] sm:aspect-[4/3] lg:aspect-[16/11]",
      featured: false,
      tag: "DIMENSIONAL TEXTURE",
    },
    {
      title: "Wall Art Affects",
      count: "5+ Designs",
      image: "/images/wall art effect.jpg",
      link: "/interior-design?category=wallart",
      gridSpan: "lg:col-span-4 lg:row-span-1",
      aspectRatio: "aspect-[4/3] sm:aspect-[4/3] lg:aspect-[16/11]",
      featured: false,
      tag: "STATEMENT FINISHES",
    },
    {
      title: "Vinyl Flooring",
      count: "15+ Designs",
      image: "/images/vinyl flooring.jpg",
      link: "/interior-design?category=vinyl_flooring",
      gridSpan: "lg:col-span-4 lg:row-span-1",
      aspectRatio: "aspect-[4/3] sm:aspect-[4/3] lg:aspect-[16/11]",
      featured: false,
      tag: "ARCHITECTURAL FLOORING",
    },
    {
      title: "Natural Vertical Garden",
      count: "12+ Designs",
      image: "/images/natural vertical garden.jpg",
      link: "/interior-design?category=artificial_vertical_garden",
      gridSpan: "lg:col-span-4 lg:row-span-1",
      aspectRatio: "aspect-[4/3] sm:aspect-[4/3] lg:aspect-[16/11]",
      featured: false,
      tag: "BIOPHILIC LIVING",
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
    <div className="bg-[#FAF8F5] min-h-screen font-sans text-[#121614] flex flex-col selection:bg-[#12241C] selection:text-[#FAF8F5]">
      {/* SEO Headings for Regional Keywords */}
      <div className="sr-only">
        <h2>Best Interior Designers in Vijayawada, Andhra Pradesh</h2>
        <h2>Best Interior Designers in Guntur, Andhra Pradesh</h2>
        <h2>Best Interior Designers in Eluru, Andhra Pradesh</h2>
        <h2>Best Interior Designers in Hyderabad, Telangana</h2>
        <h2>Interior Design Services Vijayawada</h2>
        <h2>Ghar Sansar - #1 Interior Designers Vijayawada</h2>
      </div>

      {/* 1. HERO SECTION - Cinematic Art-Directed Architectural Presentation */}
      <section className="relative min-h-screen min-h-[100dvh] w-full flex flex-col justify-between pt-24 sm:pt-28 pb-10 sm:pb-14 overflow-hidden">
        {/* Luxury Background Image with Cinematic Art Direction (Crisp, High Contrast, Layered Vignette) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/sunlit_luxe_temple_lounge.png"
            alt="Interior Design Solutions - Sunlit Luxe Temple Lounge"
            className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000 ease-out"
          />
          {/* Layered Multi-Stop Dark Vignettes for Supreme Legibility & Mood */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/85 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/25 to-black/70 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/30 to-transparent pointer-events-none" />
        </div>

        {/* Floating Top Architectural Tag */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex items-center justify-between text-white/70 text-[11px] sm:text-xs font-mono tracking-widest uppercase border-b border-white/15 pb-3"
          >
            <span>INTERIOR STUDIO &amp; HOME DECOR</span>
            <span className="hidden sm:inline">EST. 2026 • ANDHRA PRADESH &amp; TELANGANA</span>
          </motion.div>
        </div>

        {/* Center Editorial Hero Content */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center my-auto py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Architectural Eyebrow with Delicate Hairlines */}
            <div className="inline-flex items-center justify-center gap-3 mb-5 sm:mb-7">
              <span className="w-8 sm:w-12 h-px bg-[#C5A059]" />
              <span className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-[#C5A059] uppercase drop-shadow-sm">
                B E A U T I F U L &nbsp; S P A C E S
              </span>
              <span className="w-8 sm:w-12 h-px bg-[#C5A059]" />
            </div>

            {/* Majestic Display Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.1] mb-6 max-w-4xl drop-shadow-2xl font-normal">
              Best Interior Designers in
              <span className="block italic font-light text-[#F4EADB] mt-1.5 sm:mt-2">
                Andhra Pradesh &amp; Telangana
              </span>
            </h1>

            {/* Subtitle description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-200/90 font-light max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 drop-shadow-md">
              Transform your space into a story of comfort, elegance, and timeless design with bespoke decor collections and award-winning interior design services.
            </p>

            {/* Editorial CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                to="/interior-design"
                className="w-full sm:w-auto bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A1410] px-8 py-4 rounded-full shadow-[0_10px_30px_rgba(197,160,89,0.35)] transition-all duration-300 font-semibold uppercase tracking-[0.18em] text-xs inline-flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95"
              >
                <span>Explore Our Designs</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto border border-white/35 hover:border-white bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full backdrop-blur-md transition-all duration-300 font-semibold uppercase tracking-[0.18em] text-xs inline-flex items-center justify-center hover:scale-[1.03] active:scale-95 shadow-lg"
              >
                <span>Shop Now</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom Architectural Scroll Indicator */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="inline-flex flex-col items-center gap-2 text-white/60 text-[10px] tracking-[0.25em] uppercase"
          >
            <span>SCROLL TO EXPLORE</span>
            <div className="w-px h-6 bg-gradient-to-b from-[#C5A059] to-transparent animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* 2. REFINED SERVICE / TRUST INFORMATION STRIP */}
      <section className="relative z-20 -mt-6 sm:-mt-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1560px] mx-auto bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-8 lg:p-9 shadow-[0_12px_36px_rgba(11,21,17,0.06)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#EFEAE0]">
            {trustBadges.map((badge, idx) => (
              <div
                key={badge.title}
                className={`flex items-start gap-4 ${
                  idx > 0 ? "pt-4 sm:pt-0 sm:pl-6 lg:pl-8" : ""
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#ECE5D8] text-[#12241C] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <badge.icon size={20} className="stroke-[1.8] text-[#C5A059]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold tracking-wider uppercase text-[#121614] mb-1">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-[#6F7973] font-normal leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW WE WORK - Sophisticated Process Experience */}
      <section className="py-20 sm:py-28 relative bg-[#FAF8F5]">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Section Header */}
          <div className="max-w-2xl mx-auto text-center mb-16 sm:mb-20">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-2">
              METHODOLOGY
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#121614] tracking-tight">
              How We Work
            </h2>
            <div className="w-12 h-px bg-[#C5A059] mx-auto my-4" />
            <p className="text-xs sm:text-sm text-[#66726B] font-light leading-relaxed">
              From browsing to delivery, we make your home transformation journey seamless.
            </p>
          </div>

          {/* Process Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
            {workSteps.map((step, idx) => (
              <div
                key={step.number}
                className="relative bg-white rounded-2xl p-7 sm:p-8 border border-[#E7E2D7] hover:border-[#12241C]/40 shadow-[0_4px_20px_rgba(11,21,17,0.03)] hover:shadow-[0_16px_36px_rgba(11,21,17,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Step Top: Large Editorial Numeral + Delicate Icon */}
                <div>
                  <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#F0EBE1]">
                    <span className="text-3xl sm:text-4xl font-serif text-[#C5A059] font-light">
                      {step.number}
                    </span>
                    <div className="w-11 h-11 rounded-full bg-[#FAF8F5] border border-[#ECE5D8] text-[#12241C] flex items-center justify-center group-hover:bg-[#12241C] group-hover:text-[#FAF8F5] transition-colors duration-300">
                      <step.icon size={19} className="stroke-[1.8]" />
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#121614] mb-3 tracking-tight font-serif">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-[13px] text-[#66726B] leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>

                {/* Subtitle bottom indicator */}
                <div className="mt-8 pt-4 border-t border-[#F5F2EA] flex items-center justify-between text-[11px] font-mono tracking-wider text-[#A69F92]">
                  <span>STAGE 0{idx + 1}</span>
                  <ArrowRight size={13} className="text-[#C5A059] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* Start Your Journey Button */}
          <div className="mt-14 sm:mt-16 text-center">
            <Link
              to="/interior-design"
              className="inline-flex items-center gap-3 bg-[#12241C] hover:bg-[#1C362A] text-[#FAF8F5] text-xs font-semibold uppercase tracking-[0.2em] px-9 py-4 rounded-full shadow-[0_10px_25px_rgba(18,36,28,0.2)] transition-all duration-300 hover:gap-4 hover:scale-[1.02] cursor-pointer"
            >
              <span>START YOUR JOURNEY</span>
              <ArrowRight size={14} className="text-[#C5A059]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. OUR INTERIOR WORKS - Premium Visual Gallery with Asymmetric Rhythm */}
      <section className="py-20 sm:py-28 bg-[#F5F2EB] border-y border-[#E5DFD3]">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-2">
                INTERIOR DESIGN SERVICES
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#121614] font-normal tracking-tight">
                Our Interior Works
              </h2>
              <p className="text-xs sm:text-sm text-[#66726B] mt-2 font-light max-w-xl">
                Transform your space with our professional interior design solutions.
              </p>
            </div>

            <Link
              to="/interior-design"
              className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-[#121614] bg-white border border-[#DCD5C7] hover:border-[#12241C] px-6 py-3 rounded-full shadow-2xs transition-all duration-200 shrink-0 self-start md:self-auto hover:bg-[#FAF8F5]"
            >
              <span>View All Designs</span>
              <ArrowRight size={13} className="text-[#C5A059]" />
            </Link>
          </div>

          {/* Asymmetric Gallery Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
            {interiorWorks.map((work) => (
              <Link
                key={work.title}
                to={work.link}
                className={`group relative ${work.gridSpan} ${work.aspectRatio} rounded-2xl overflow-hidden border border-[#DDD5C7] shadow-[0_8px_24px_rgba(11,21,17,0.06)] cursor-pointer block bg-[#0B1511]`}
              >
                {/* Background Image with Slow Smooth Zoom */}
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Multilayered Dark Gradient Overlay for Supreme Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 group-hover:from-black/95 group-hover:via-black/40 transition-colors duration-500" />

                {/* Top Discipline Tag */}
                <div className="absolute top-4 sm:top-5 left-4 sm:left-5 z-10 flex items-center gap-2">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-mono px-2.5 py-1 rounded-sm bg-black/60 backdrop-blur-md text-[#E8E2D5] border border-white/10">
                    {work.tag}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex items-end justify-between gap-4 z-10">
                  <div>
                    <span className="text-xs font-mono tracking-widest text-[#C5A059] block mb-1 uppercase">
                      {work.count}
                    </span>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-normal text-white tracking-tight group-hover:text-[#F4EADB] transition-colors duration-300">
                      {work.title}
                    </h3>
                  </div>

                  {/* Circular Architectural Arrow Button */}
                  <div className="w-10 h-10 rounded-full bg-white/95 group-hover:bg-[#C5A059] text-gray-900 group-hover:text-black flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 shadow-md">
                    <ArrowUpRight size={17} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RECENT PRODUCTS SECTION */}
      <section className="py-20 sm:py-28 bg-[#FAF8F5]">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Header Row with Title & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-14">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C5A059] uppercase block mb-2">
                COLLECTIONS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif text-[#121614] font-normal tracking-tight leading-tight">
                Recent Products
              </h2>
              <p className="text-xs sm:text-sm text-[#66726B] mt-2 font-light">
                — Check out our latest arrivals for your home.
              </p>
            </div>

            {/* Right Controls: View All + Carousel Buttons */}
            <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#121614] bg-white border border-[#DFD9CD] hover:border-[#12241C] px-5 py-2.5 rounded-full shadow-2xs transition-all duration-200 cursor-pointer"
              >
                <span>View all Products</span>
                <ArrowRight size={13} className="text-[#C5A059]" />
              </Link>
              <button
                type="button"
                onClick={prevProductPage}
                aria-label="Previous products"
                className="w-9 h-9 rounded-full border border-[#DFD9CD] bg-white hover:border-[#12241C] hover:bg-[#12241C] text-gray-700 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextProductPage}
                aria-label="Next products"
                className="w-9 h-9 rounded-full border border-[#DFD9CD] bg-white hover:border-[#12241C] hover:bg-[#12241C] text-gray-700 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* 4 Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 items-stretch">
            {currentRecentProducts.map((product, idx) => (
              <ProductCard key={product.id || idx} product={product} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. CUSTOM INTERIOR DESIGN SERVICES - Editorial Split Composition */}
      <section className="py-12 sm:py-20 bg-[#FAF8F5]">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="rounded-3xl overflow-hidden bg-[#0D1C15] border border-white/10 shadow-[0_20px_50px_rgba(11,21,17,0.15)] grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Image (7 cols) */}
            <div className="lg:col-span-7 min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] overflow-hidden relative group">
              <img
                src="/images/custom_interior_banner.jpg"
                alt="Custom Interior Design Services"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0D1C15] hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1C15] via-transparent to-transparent lg:hidden" />
              <div className="absolute top-6 left-6 z-10">
                <span className="text-[10px] font-mono tracking-[0.25em] uppercase px-3 py-1 bg-black/60 backdrop-blur-md text-[#C5A059] border border-white/10 rounded-sm">
                  BESPOKE ARCHITECTURE
                </span>
              </div>
            </div>

            {/* Right Text Content (5 cols) */}
            <div className="lg:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-center text-[#EAE6DF] relative">
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C5A059] uppercase mb-3 block">
                TURNING HOUSES INTO HOMES
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal tracking-tight mb-5 leading-[1.15]">
                Custom Interior
                <br />
                Design Services
              </h2>

              <p className="text-xs sm:text-sm text-[#A8A296] mb-8 max-w-md leading-relaxed font-light">
                From concept to completion, we deliver personalized interior solutions that reflect your style and needs.
              </p>

              <Link
                to="/interior-design"
                className="inline-flex items-center gap-3 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A1410] text-xs font-semibold uppercase tracking-[0.18em] px-8 py-4 rounded-full self-start shadow-md transition-all duration-300 hover:gap-4 hover:scale-[1.02] cursor-pointer"
              >
                <span>Our design services</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BEAUTIFUL HOMES / INSPIRATION GALLERY */}
      <section className="py-16 sm:py-24 pb-20 sm:pb-32 bg-[#FAF8F5]">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="bg-[#F2ECE1] border border-[#E0D7C9] rounded-3xl p-8 sm:p-12 lg:p-14 shadow-[0_12px_36px_rgba(11,21,17,0.05)] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C5A059] uppercase mb-3 block">
                GET INSPIRED
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#121614] font-normal tracking-tight mb-4 leading-tight">
                Beautiful Homes
                <br />
                Start Here
              </h2>
              <div className="w-12 h-px bg-[#C5A059] mb-5" />
              <p className="text-xs sm:text-sm text-[#66726B] mb-8 leading-relaxed font-light">
                Explore our latest interior design projects, décor ideas, and home essentials to create a space that's truly yours.
              </p>
              <Link
                to="/interior-design"
                className="inline-flex items-center gap-3 bg-[#12241C] hover:bg-[#1C362A] text-[#FAF8F5] text-xs font-semibold uppercase tracking-[0.18em] px-8 py-4 rounded-full self-start shadow-sm transition-all duration-300 hover:gap-4 hover:scale-[1.02] cursor-pointer"
              >
                <span>Explore Gallery</span>
                <ArrowRight size={14} className="text-[#C5A059]" />
              </Link>
            </div>

            {/* Right 3 Gallery Images with Varied Proportions */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {/* Image 1: Dining */}
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-sm border border-black/5 group bg-[#0B1511]">
                <img
                  src="/images/gallery_dining.jpg"
                  alt="Modern Dining Room Interior Design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className="text-[10px] font-mono tracking-widest text-[#C5A059] block uppercase">
                    01 / RESIDENCE
                  </span>
                  <span className="text-sm font-serif text-white font-normal">
                    Modern Dining Room
                  </span>
                </div>
              </div>

              {/* Image 2: Living Room (Elevated Visual Stagger) */}
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-sm border border-black/5 group bg-[#0B1511] sm:-translate-y-3 sm:shadow-lg transition-transform duration-500">
                <img
                  src="/images/gallery_living.jpg"
                  alt="Contemporary Living Room Interior Design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className="text-[10px] font-mono tracking-widest text-[#C5A059] block uppercase">
                    02 / RESIDENCE
                  </span>
                  <span className="text-sm font-serif text-white font-normal">
                    Contemporary Living Room
                  </span>
                </div>
              </div>

              {/* Image 3: Bedroom */}
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-sm border border-black/5 group bg-[#0B1511]">
                <img
                  src="/images/gallery_bedroom.jpg"
                  alt="Luxury Master Bedroom Interior Design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className="text-[10px] font-mono tracking-widest text-[#C5A059] block uppercase">
                    03 / RESIDENCE
                  </span>
                  <span className="text-sm font-serif text-white font-normal">
                    Luxury Master Bedroom
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
