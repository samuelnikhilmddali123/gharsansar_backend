// src/pages/Home.tsx

import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {

  ArrowRight,

  ArrowLeft,

  Play,

  X,

  Compass,

  Layers,

  Sparkles,

  ShieldCheck,
  Phone,
  MessageCircle,
  CheckCircle2,


} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import toast from "react-hot-toast";

const Home: React.FC = () => {

  const navigate = useNavigate();

  // Hero Carousel State

  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [

    {

      kicker: "BEAUTIFUL SPACES",

      titleLine1: "Best Interior",

      titleLine2: "Designers in",

      highlightLine1: "Andhra Pradesh",

      highlightLine2: "& Telangana",

      description:

        "Transform your space into a story of comfort, elegance, and timeless design with bespoke décor collections and award-winning interior design services.",

      image: "/images/design/exact_hero_vibrant_clean.jpg",

      primaryCta: "Explore Our Designs",

      primaryLink: "/interior-design",

      secondaryCta: "Shop Now",

      secondaryLink: "/products",

    },

    {

      kicker: "BESPOKE INTERIORS",

      titleLine1: "Luxury Living",

      titleLine2: "Tailored for",

      highlightLine1: "Vijayawada &",

      highlightLine2: "Amaravati",

      description:

        "Premium 3D wall panels, architectural lighting, vinyl flooring, and custom furniture crafted to perfection for your dream space.",

      image: "/images/design/exact_hero_vibrant_clean.jpg",

      primaryCta: "Our Interior Works",

      primaryLink: "/interior-design",

      secondaryCta: "View Catalog",

      secondaryLink: "/products",

    },

    {

      kicker: "TIMELESS ELEGANCE",

      titleLine1: "Crafting Homes",

      titleLine2: "That Truly",

      highlightLine1: "Feel Like",

      highlightLine2: "You",

      description:

        "From initial inspiration to final on-site installation, our dedicated design team handles every detail with craftsmanship and care.",

      image: "/images/design/exact_hero_vibrant_clean.jpg",

      primaryCta: "Book Consultation",

      primaryLink: "#consultation",

      secondaryCta: "Festive Gifts",

      secondaryLink: "/return-gifts",

    },

  ];

  // Quick 7 Categories with 1264x848 ultra-high-definition studio images

  const quickCategories = [

    {

      title: "Wallpaper Rolls",

      count: "120+ Designs",

      image: "/images/design/cat_wallpaper.jpg",

      link: "/interior-design?category=Wallpaper%20Rolls",

    },

    {

      title: "Wall Art Effects",

      count: "85+ Designs",

      image: "/images/design/cat_wallart.jpg",

      link: "/interior-design?category=Wall%20Art%20Effect",

    },

    {

      title: "Vinyl Flooring",

      count: "90+ Designs",

      image: "/images/design/cat_vinyl.jpg",

      link: "/interior-design?category=Vinyl%20Flooring",

    },

    {

      title: "3D Wallpapers",

      count: "100+ Designs",

      image: "/images/design/cat_3d.jpg",

      link: "/interior-design?category=3d%20Wallpapers",

    },

    {

      title: "Vertical Garden",

      count: "60+ Designs",

      image: "/images/design/cat_garden.jpg",

      link: "/interior-design?category=Natural%20Vertical%20Garden",

    },

    {

      title: "Interior Decor",

      count: "250+ Products",

      image: "/images/design/cat_decor.jpg",

      link: "/products",

    },

    {

      title: "Return Gifts",

      count: "150+ Gifts",

      image: "/images/design/cat_gifts.jpg",

      link: "/return-gifts",

    },

  ];

  // 3 Process Steps

  const processSteps = [

    {

      number: "01",

      title: "Share Your Ideas",

      description: "Tell us your style, space and requirements.",

      image: "/images/design/step_1_ideas.jpg",

    },

    {

      number: "02",

      title: "Get Expert Guidance",

      description: "Our designers create personalized plans.",

      image: "/images/design/step_2_guidance.jpg",

    },

    {

      number: "03",

      title: "We Deliver",

      description: "From products to installation, we handle it all.",

      image: "/images/design/step_3_deliver.jpg",

    },

  ];

  // 6 Interior Works for Asymmetric Portfolio

  const interiorWorks = [

    {

      title: "Wallpaper Rolls",

      image: "/images/design/work_wallpaper_exact.jpg",

      link: "/interior-design?category=Wallpaper%20Rolls",

    },

    {

      title: "3D Wallpapers",

      image: "/images/design/work_3d_exact.jpg",

      link: "/interior-design?category=3d%20Wallpapers",

    },

    {

      title: "Wall Art Effects",

      image: "/images/design/work_wallart_exact.jpg",

      link: "/interior-design?category=Wall%20Art%20Effect",

    },

    {

      title: "Vinyl Flooring",

      image: "/images/design/work_vinyl_exact.jpg",

      link: "/interior-design?category=Vinyl%20Flooring",

    },

    {

      title: "Natural Vertical Garden",

      image: "/images/design/work_garden_exact.jpg",

      link: "/interior-design?category=Natural%20Vertical%20Garden",

    },

    {

      title: "Interior Decor",

      image: "/images/design/work_decor_exact.jpg",

      link: "/products",

    },

  ];

  // 5 Featured Categories

  const featuredCategories = [

    {

      title: "Wallpaper Rolls",

      count: "120+ Designs",

      image: "/images/design/cat_wallpaper.jpg",

      link: "/interior-design?category=Wallpaper%20Rolls",

    },

    {

      title: "Vinyl Flooring",

      count: "80+ Designs",

      image: "/images/design/cat_vinyl.jpg",

      link: "/interior-design?category=Vinyl%20Flooring",

    },

    {

      title: "3D Wallpapers",

      count: "100+ Designs",

      image: "/images/design/cat_3d.jpg",

      link: "/interior-design?category=3d%20Wallpapers",

    },

    {

      title: "Interior Decor",

      count: "500+ Products",

      image: "/images/design/cat_decor.jpg",

      link: "/products",

    },

    {

      title: "Vertical Garden",

      count: "80+ Designs",

      image: "/images/design/cat_garden.jpg",

      link: "/interior-design?category=Natural%20Vertical%20Garden",

    },

  ];

  // 4 Inspiration Gallery items

  const galleryItems = [

    {

      title: "Modern Contemporary Living",

      location: "Governorpet, Vijayawada",

      image: "/images/design/gallery_1_hd.jpg",

      type: "Residential Interior",

    },

    {

      title: "Ambient Master Suite",

      location: "Benz Circle, Vijayawada",

      image: "/images/design/gallery_2_hd.jpg",

      type: "Master Bedroom",

    },

    {

      title: "Contemporary Family Dining",

      location: "Guntur",

      image: "/images/design/gallery_3_hd.jpg",

      type: "Family Dining",

    },

    {

      title: "Bas-Relief Media Feature Wall",

      location: "Hyderabad",

      image: "/images/design/gallery_4_hd.jpg",

      type: "Living Wall Art",

    },

  ];

  // Consultation Modal State

  const [isConsultModalOpen, setConsultModalOpen] = useState(false);

  const [consultForm, setConsultForm] = useState({

    name: "",

    phone: "",

    city: "Vijayawada",

    service: "Interior Design Consultation",

  });

  // Video Modal State

  const [isVideoModalOpen, setVideoModalOpen] = useState(false);

  // Active gallery lightbox preview

  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);

  const handleConsultSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    if (!consultForm.name || !consultForm.phone) {

      toast.error("Please fill in your name and phone number");

      return;

    }

    toast.success("Thank you! Connecting you to WhatsApp...");
    const waText = `Hello Ghar Sansar, I would like to book a free interior consultation.%0A*Name:* ${encodeURIComponent(consultForm.name)}%0A*Phone:* ${encodeURIComponent(consultForm.phone)}%0A*City:* ${encodeURIComponent(consultForm.city)}%0A*Service:* ${encodeURIComponent(consultForm.service)}`;
    window.open(`https://wa.me/919492664870?text=${waText}`, "_blank");
    setConsultModalOpen(false);

    setConsultForm({

      name: "",

      phone: "",

      city: "Vijayawada",

      service: "Interior Design Consultation",

    });

  };

  const nextSlide = () => {

    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);

  };

  const prevSlide = () => {

    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  };

  return (

    <div className="bg-[#FAF7F2] min-h-screen font-sans text-gray-900 flex flex-col selection:bg-[#C57053] selection:text-white antialiased">

      {/* Regional SEO metadata */}

      <div className="sr-only">

        <h2>Best Interior Designers in Vijayawada, Andhra Pradesh &amp; Telangana</h2>

        <p>

          Ghar Sansar provides luxury interior design, wallpapers, vinyl flooring,

          curtains, and bespoke decor for Andhra Pradesh and Telangana.

        </p>

      </div>

      {/* =========================================================================

          1. HERO SECTION (Cinematic Full-Bleed Composition Matching Target 1:1)

          ========================================================================= */}

      <section className="w-full pt-14 sm:pt-16 pb-2 sm:pb-2.5 lg:pb-3 px-2 sm:px-2.5 lg:px-3 bg-[#FAF7F2]">
        <div className="relative w-full max-w-[1680px] mx-auto h-[calc(100vh-64px)] sm:h-[calc(100vh-68px)] lg:h-[calc(100vh-72px)] min-h-[460px] flex items-center bg-[#181513] rounded-none overflow-hidden border-t-0 border-x-[3px] sm:border-x-[4px] border-b-[3px] sm:border-b-[4px] border-[#F6F1E8] shadow-xl shadow-stone-900/15">
          {/* Curved Photography Background */}
          <div className="absolute inset-0 z-0">

          <motion.img

            key={`hero-bg-${currentSlide}`}

            initial={{ opacity: 0.9, scale: 1.02 }}

            animate={{ opacity: 1, scale: 1 }}

            transition={{ duration: 0.8 }}

            src={heroSlides[currentSlide].image}

            alt="Best Interior Designers in Andhra Pradesh & Telangana"

            className="w-full h-full object-cover object-center"

          />

          {/* Subtle Dark Gradient Overlay across Left ~50% */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 via-45% to-transparent" />


        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10 flex flex-col justify-between h-full">
          {/* Main Editorial Text Area */}
          <div className="my-auto max-w-xl">
            {/* Eyebrow */}
            <div className="flex items-center space-x-2.5 mb-3.5">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#C86B4C] uppercase font-sans">
                {heroSlides[currentSlide].kicker}
              </span>
            </div>

            {/* Editorial Heading: 4 Distinct Lines with Terracotta Accent */}
            <motion.h1
              key={`hero-title-${currentSlide}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-poppins text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-[66px] leading-[1.08] font-normal text-white mb-5 tracking-tight"
            >
              {heroSlides[currentSlide].titleLine1}
              <br />
              {heroSlides[currentSlide].titleLine2}
              <br />
              <span className="text-[#C86B4C]">
                {heroSlides[currentSlide].highlightLine1}
              </span>
              <br />
              <span className="text-[#C86B4C]">
                {heroSlides[currentSlide].highlightLine2}
              </span>
            </motion.h1>

            {/* Narrative Paragraph */}
            <motion.p
              key={`hero-desc-${currentSlide}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xs sm:text-sm md:text-[14.5px] text-gray-200 font-normal leading-relaxed max-w-lg mb-8"
            >
              {heroSlides[currentSlide].description}
            </motion.p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <Link
                to={heroSlides[currentSlide].primaryLink}
                className="bg-[#C86B4C] hover:bg-[#B35E42] text-white px-7 sm:px-8 py-3.5 rounded-full font-medium tracking-wider text-xs uppercase inline-flex items-center space-x-2.5 transition-all shadow-md hover:shadow-lg hover:scale-102"
              >
                <span>{heroSlides[currentSlide].primaryCta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to={heroSlides[currentSlide].secondaryLink}
                className="border border-white/80 hover:border-white text-white hover:bg-white/10 px-7 sm:px-8 py-3.5 rounded-full font-medium tracking-wider text-xs uppercase inline-flex items-center transition-all"
              >
                <span>{heroSlides[currentSlide].secondaryCta}</span>
              </Link>
            </div>
          </div>


          {/* Bottom Controls Bar: Left Slider Controls + Right Watermark */}

          <div className="flex items-end justify-between pt-8">

            {/* Slider Controls */}

            <div className="flex items-center space-x-4 text-white">

              <div className="flex items-center space-x-2.5 text-xs font-poppins font-bold">

                {heroSlides.map((_, idx) => (

                  <button

                    key={idx}

                    onClick={() => setCurrentSlide(idx)}

                    className={`transition-colors cursor-pointer ${idx === currentSlide

                        ? "text-white font-bold"

                        : "text-white/40 hover:text-white/70 font-semibold"

                      }`}

                  >

                    0{idx + 1}

                  </button>

                ))}

              </div>

              {/* Progress Line */}

              <div className="w-16 h-[2.5px] bg-white/20 rounded-full overflow-hidden">

                <div

                  className="h-full bg-[#C86B4C] transition-all duration-500 rounded-full"

                  style={{

                    width: `${((currentSlide + 1) / heroSlides.length) * 100}%`,

                  }}

                />

              </div>

              {/* Arrow Buttons */}

              <div className="flex items-center space-x-2 text-white/80">

                <button

                  onClick={prevSlide}

                  aria-label="Previous slide"

                  className="w-7 h-7 rounded-full border border-white/30 hover:border-white text-white flex items-center justify-center transition-colors cursor-pointer"

                >

                  <ArrowLeft className="w-3.5 h-3.5" />

                </button>

                <button

                  onClick={nextSlide}

                  aria-label="Next slide"

                  className="w-7 h-7 rounded-full border border-white/30 hover:border-white text-white flex items-center justify-center transition-colors cursor-pointer"

                >

                  <ArrowRight className="w-3.5 h-3.5" />

                </button>

              </div>

            </div>

            {/* Right Brand Watermark */}

            <div className="hidden sm:flex items-center space-x-3 text-right">

              <div className="w-[1.5px] h-11 bg-white/40" />

              <div className="font-sans text-[10px] tracking-[0.24em] text-white/90 uppercase font-light leading-tight text-left">

                CRAFTING

                <br />

                HOMES

                <br />

                THAT FEEL

                <br />

                LIKE YOU

              </div>

            </div>

          </div>

        </div>

        </div>
      </section>

      {/* =========================================================================

          2. CATEGORY STRIP (7 Cards Horizontal Row directly below hero)

          ========================================================================= */}

      <section className="w-full bg-[#FAF7F2] pt-6 pb-2 sm:pt-8 sm:pb-3">

        <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-3.5 lg:gap-4">

            {quickCategories.map((cat) => (

              <Link

                key={cat.title}

                to={cat.link}

                className="group flex flex-col items-center cursor-pointer text-center bg-white hover:bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E8E2D8] hover:border-[#C86B4C]/60 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"

              >

                <div className="w-full aspect-[1.1/1] rounded-xl overflow-hidden bg-stone-100 shadow-2xs">

                  <img

                    src={cat.image}

                    alt={cat.title}

                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"

                  />

                </div>

                <span className="font-poppins text-xs sm:text-[13px] font-semibold text-gray-900 mt-2.5 group-hover:text-[#C86B4C] transition-colors leading-tight">

                  {cat.title}

                </span>

                <span className="font-poppins text-[10.5px] text-gray-500 font-normal mt-0.5">

                  {cat.count}

                </span>

              </Link>

            ))}

          </div>

        </div>

      </section>

      {/* =========================================================================

          3. COMPLETE INTERIOR SOLUTIONS ("From Inspiration to Installation")

          ========================================================================= */}

      <section className="w-full bg-[#FAF7F2] pt-4 pb-4 sm:pt-6 sm:pb-6 border-b border-[#E8E2D8]">

        <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-start">

            {/* Left Column (Span 4) */}

            <div className="lg:col-span-4 flex flex-col justify-start pt-1">

              <span className="text-[11px] font-semibold tracking-[0.24em] text-[#C86B4C] uppercase block mb-2">

                COMPLETE INTERIOR SOLUTIONS

              </span>

              <h2 className="font-poppins text-3xl sm:text-4xl lg:text-[42px] text-gray-950 leading-[1.12] font-normal mb-3.5 tracking-tight">

                From Inspiration

                <br />

                to Installation

              </h2>

              <p className="text-xs sm:text-sm text-gray-650 leading-relaxed mb-6 font-normal max-w-sm">

                We make your home transformation journey simple, seamless and

                stress-free.

              </p>

              <Link

                to="/interior-design"

                className="bg-[#C86B4C] hover:bg-[#B35E42] text-white px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-2 self-start transition-all shadow-xs hover:shadow-md"

              >

                <span>HOW IT WORKS</span>

                <ArrowRight className="w-3.5 h-3.5" />

              </Link>

            </div>

            {/* Right Column: 3 Process Steps (Span 8) */}

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 items-start relative">

              {processSteps.map((step, idx) => (

                <div key={step.number} className="relative flex flex-col group">

                  {/* Step Image (1800x1344 High Definition Photography) */}

                  <div className="w-full aspect-[1.25/1] rounded-2xl overflow-hidden bg-stone-100 shadow-xs border border-[#E8E2D8]/80 mb-3">

                    <img

                      src={step.image}

                      alt={step.title}

                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"

                    />

                  </div>

                  {/* Step Number in Terracotta */}

                  <span className="font-poppins text-xl sm:text-2xl font-bold text-[#C86B4C] leading-none mb-1.5 block">

                    {step.number}

                  </span>

                  {/* Step Title */}

                  <h3 className="font-poppins text-sm sm:text-base font-semibold text-gray-900 mb-1 leading-snug">

                    {step.title}

                  </h3>

                  {/* Step Description */}

                  <p className="text-xs text-gray-600 leading-relaxed font-normal">

                    {step.description}

                  </p>

                  {/* Connecting horizontal arrow between steps on desktop, aligned with image center */}

                  {idx < 2 && (

                    <div className="hidden md:flex absolute -right-3 lg:-right-4 top-[32%] -translate-y-1/2 z-10 text-stone-400">

                      <ArrowRight className="w-4 h-4 text-stone-400" />

                    </div>

                  )}

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================================

          4. OUR INTERIOR WORKS & CONSULTATION (Unified Single-View Layout)

          ========================================================================= */}

      <section className="w-full bg-[#FAF7F2] pt-4 pb-6 sm:pt-5 sm:pb-8 border-b border-[#E8E2D8]">

        <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">

          {/* Header Row */}

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-3.5 pb-2.5 border-b border-[#E8E2D8]/70">

            <div>

              <span className="text-[10px] font-semibold tracking-[0.24em] text-[#C86B4C] uppercase block mb-0.5">

                INTERIOR DESIGN SERVICES

              </span>

              <h2 className="font-poppins text-2xl sm:text-3xl text-gray-950 font-normal tracking-tight">

                Our Interior Works

              </h2>

            </div>

            <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">

              <Link

                to="/interior-design"

                className="text-xs font-semibold uppercase tracking-wider text-[#C86B4C] hover:text-[#B35E42] transition-colors inline-flex items-center gap-1.5 mr-2"

              >

                <span>View All Designs</span>

                <ArrowRight className="w-3.5 h-3.5" />

              </Link>

              <button

                onClick={() => navigate("/interior-design")}

                aria-label="Previous"

                className="w-7 h-7 rounded-full border border-gray-300 hover:border-gray-900 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"

              >

                <ArrowLeft className="w-3.5 h-3.5" />

              </button>

              <button

                onClick={() => navigate("/interior-design")}

                aria-label="Next"

                className="w-7 h-7 rounded-full border border-gray-300 hover:border-gray-900 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"

              >

                <ArrowRight className="w-3.5 h-3.5" />

              </button>

            </div>

          </div>

          {/* 5 Category Cards */}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 lg:gap-4 mb-4 sm:mb-5">

            {featuredCategories.map((cat) => (

              <Link

                key={cat.title}

                to={cat.link}

                className="group flex flex-col cursor-pointer"

              >

                {/* Image Frame with Floating Arrow Button */}

                <div className="w-full aspect-[1.3/1] rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100 shadow-xs border border-[#E8E2D8] relative mb-1.5">

                  <img

                    src={cat.image}

                    alt={cat.title}

                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"

                  />

                  {/* Floating Circular Arrow Button */}

                  <div className="absolute bottom-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-md flex items-center justify-center text-gray-800 group-hover:bg-[#C86B4C] group-hover:text-white transition-colors">

                    <ArrowRight className="w-3 h-3" />

                  </div>

                </div>

                {/* Caption Below */}

                <div>

                  <h3 className="font-poppins text-xs sm:text-[13px] font-semibold text-gray-900 group-hover:text-[#C86B4C] transition-colors leading-tight">

                    {cat.title}

                  </h3>

                  <p className="text-[10px] text-gray-500 font-normal mt-0.5">

                    {cat.count}

                  </p>

                </div>

              </Link>

            ))}

          </div>

          {/* Interior Consultation Banner (Combined in Same Layout) */}

          <div id="consultation" className="rounded-xl sm:rounded-2xl bg-[#542B1B] text-white p-5 sm:p-6 lg:p-7 shadow-xl overflow-hidden relative border border-[#6B3724]">
            {/* Integrated Right Architectural Lounge Photo with Smooth Gradient Blend */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[48%] lg:w-[42%] overflow-hidden pointer-events-none select-none">
              <img
                src="/images/design/consultation_lounge_right.jpg"
                alt="Interior Consultation Studio Lounge"
                className="w-full h-full object-cover object-center"
              />
              {/* Desktop horizontal blend */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#542B1B] via-[#542B1B]/75 sm:via-[#542B1B]/40 to-transparent" />
              {/* Mobile vertical blend */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#542B1B] via-[#542B1B]/60 to-transparent sm:hidden" />
            </div>

            {/* Content Foreground (Stacked safely on top of background & blend) */}
            <div className="relative z-10 max-w-2xl lg:max-w-3xl flex flex-col">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#E8A588] text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase mb-2 self-start backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-[#E09D82]" />
                <span>Complimentary 1-on-1 Design Session</span>
              </div>

              {/* Heading */}
              <h2 className="font-poppins text-xl sm:text-2xl lg:text-3xl font-normal tracking-tight text-white mb-2 leading-tight uppercase">
                BOOK A FREE INTERIOR CONSULTATION
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-[13px] text-stone-200/90 font-light leading-relaxed mb-4 max-w-xl">
                Meet our design specialists in Vijayawada &amp; Guntur. Get tailored 3D spatial concepts, curated material palettes, and transparent itemized cost estimations with zero obligation.
              </p>

              {/* 4 Feature Highlights Grid (Filled with clear, valuable service details) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-5 max-w-xl">
                <div className="flex items-start gap-2.5 bg-black/25 hover:bg-black/35 rounded-xl p-2.5 sm:p-3 border border-white/10 backdrop-blur-xs transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-[#C86B4C]/25 border border-[#C86B4C]/50 flex items-center justify-center shrink-0 text-[#E8A588] mt-0.5">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white leading-tight">
                      Personalized 3D Layouts
                    </h4>
                    <p className="text-[10.5px] text-stone-300/80 font-light mt-0.5 leading-snug">
                      Custom floorplans, lighting &amp; realistic 3D room renders
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-black/25 hover:bg-black/35 rounded-xl p-2.5 sm:p-3 border border-white/10 backdrop-blur-xs transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-[#C86B4C]/25 border border-[#C86B4C]/50 flex items-center justify-center shrink-0 text-[#E8A588] mt-0.5">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white leading-tight">
                      Curated Material Library
                    </h4>
                    <p className="text-[10.5px] text-stone-300/80 font-light mt-0.5 leading-snug">
                      Designer wallpapers, fluted louvers &amp; custom fabrics
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-black/25 hover:bg-black/35 rounded-xl p-2.5 sm:p-3 border border-white/10 backdrop-blur-xs transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-[#C86B4C]/25 border border-[#C86B4C]/50 flex items-center justify-center shrink-0 text-[#E8A588] mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white leading-tight">
                      Transparent Itemized Quotes
                    </h4>
                    <p className="text-[10.5px] text-stone-300/80 font-light mt-0.5 leading-snug">
                      Clear budget estimations with zero hidden surcharges
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-black/25 hover:bg-black/35 rounded-xl p-2.5 sm:p-3 border border-white/10 backdrop-blur-xs transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-[#C86B4C]/25 border border-[#C86B4C]/50 flex items-center justify-center shrink-0 text-[#E8A588] mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white leading-tight">
                      End-to-End Handover
                    </h4>
                    <p className="text-[10.5px] text-stone-300/80 font-light mt-0.5 leading-snug">
                      Precision site measurements to turnkey installation
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Trust Guarantees */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setConsultModalOpen(true)}
                  className="bg-[#C86B4C] hover:bg-[#B35E42] text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Book Free Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href="https://wa.me/919492664870?text=Hello%20Ghar%20Sansar!%20I%20would%20like%20to%20consult%20about%20interior%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-white transition-colors bg-[#25D366] hover:bg-[#20ba5a] px-4 py-2.5 rounded-full border border-[#25D366] shadow-sm font-medium cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Consultation</span>
                </a>

                <a
                  href="tel:+919701990090"
                  className="inline-flex items-center gap-2 text-xs text-stone-200 hover:text-white transition-colors bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-full border border-white/15 backdrop-blur-xs font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E8A588]" />
                  <span>+91 9701990090</span>
                </a>

                <span className="text-[11px] text-stone-300/85 font-light flex items-center gap-1.5 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  Complete Home Solutions, All Under One Roof
                </span>
              </div>
            </div>

            {/* Desktop Bottom-Right Trust Badge Overlay */}
            <div className="absolute right-6 bottom-6 hidden xl:flex items-center gap-3 bg-[#33180F]/90 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5 shadow-2xl z-20 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-[#C86B4C]/30 border border-[#C86B4C]/60 flex items-center justify-center shrink-0 text-[#E8A588]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white leading-tight">
                  500+ Homes Transformed
                </p>
                <p className="text-[9.5px] text-stone-300/80 font-light mt-0.5">
                  Rated 4.9/5 by Homeowners
                </p>
              </div>
            </div>
          </div>


        </div>

      </section>

      {/* =========================================================================

          7. INSPIRATION GALLERY ("Homes by Ghar Sansar" - Combined with Footer)

          ========================================================================= */}

      <section className="w-full bg-[#FAF7F2] pt-4 pb-5 sm:pt-5 sm:pb-6 border-b border-[#E8E2D8]/60">

        <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">

          {/* Header */}

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-3 pb-2 border-b border-[#E8E2D8]/70">

            <div>

              <span className="text-[10px] font-semibold tracking-[0.24em] text-[#C86B4C] uppercase block mb-0.5">

                INSPIRATION GALLERY

              </span>

              <h2 className="font-poppins text-2xl sm:text-3xl text-gray-950 font-normal tracking-tight">

                Homes by Ghar Sansar

              </h2>

            </div>

            <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">

              <Link

                to="/interior-design"

                className="text-xs font-semibold uppercase tracking-wider text-[#C86B4C] hover:text-[#B35E42] transition-colors inline-flex items-center gap-1.5 mr-2"

              >

                <span>View Gallery</span>

                <ArrowRight className="w-3.5 h-3.5" />

              </Link>

              <button

                onClick={() => navigate("/interior-design")}

                aria-label="Previous"

                className="w-7 h-7 rounded-full border border-gray-300 hover:border-gray-900 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"

              >

                <ArrowLeft className="w-3.5 h-3.5" />

              </button>

              <button

                onClick={() => navigate("/interior-design")}

                aria-label="Next"

                className="w-7 h-7 rounded-full border border-gray-300 hover:border-gray-900 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"

              >

                <ArrowRight className="w-3.5 h-3.5" />

              </button>

            </div>

          </div>

          {/* 4 Cards in a Single Row with Larger Images & Subtle Editorial Text */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
            {galleryItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveGalleryIndex(idx)}
                className="group flex flex-col cursor-pointer"
              >
                {/* Image Frame */}
                <div className="w-full aspect-[16/11] sm:aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-[#E8E2D8] bg-stone-900 relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Subtle Editorial Text Below Card */}
                <div className="mt-2 text-left">
                  <h4 className="font-poppins text-xs sm:text-[13px] font-semibold text-gray-900 group-hover:text-[#C86B4C] transition-colors leading-tight truncate">
                    {item.title}
                  </h4>
                  <div className="text-[10.5px] text-gray-500 font-normal mt-0.5 flex items-center justify-between">
                    <span>{item.location}</span>
                    <span className="text-[#C86B4C] font-medium text-[9.5px] tracking-wider uppercase">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </section>

      {/* =========================================================================

          CONSULTATION MODAL

          ========================================================================= */}

      <AnimatePresence>

        {isConsultModalOpen && (

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <motion.div

              initial={{ opacity: 0 }}

              animate={{ opacity: 1 }}

              exit={{ opacity: 0 }}

              onClick={() => setConsultModalOpen(false)}

              className="fixed inset-0 bg-black/60 backdrop-blur-xs"

            />

            <motion.div

              initial={{ opacity: 0, scale: 0.95, y: 15 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              exit={{ opacity: 0, scale: 0.95, y: 15 }}

              className="relative w-full max-w-lg bg-[#FAF7F2] rounded-xl p-6 sm:p-8 shadow-2xl border border-[#E8E2D8] z-10"

            >

              <button

                onClick={() => setConsultModalOpen(false)}

                className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-stone-200/50 cursor-pointer"

              >

                <X className="w-5 h-5" />

              </button>

              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C57053] block mb-1">

                Expert Guidance

              </span>

              <h3 className="font-poppins text-2xl sm:text-3xl font-normal text-gray-900 mb-2">

                Book Your Free Consultation

              </h3>

              <p className="text-xs text-gray-600 mb-6 leading-relaxed">

                Tell us about your home and our lead interior designer in

                Vijayawada will contact you with bespoke 3D concepts.

              </p>

              <form onSubmit={handleConsultSubmit} className="space-y-4">

                <div>

                  <label className="block text-xs font-medium text-gray-700 mb-1">

                    Your Name *

                  </label>

                  <input

                    type="text"

                    required

                    placeholder="Enter your name"

                    value={consultForm.name}

                    onChange={(e) =>

                      setConsultForm({ ...consultForm, name: e.target.value })

                    }

                    className="w-full bg-white border border-[#E2DDD5] rounded-md px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#C57053]"

                  />

                </div>

                <div>

                  <label className="block text-xs font-medium text-gray-700 mb-1">

                    Phone / WhatsApp Number *

                  </label>

                  <input

                    type="tel"

                    required

                    placeholder="+91 98765 43210"

                    value={consultForm.phone}

                    onChange={(e) =>

                      setConsultForm({ ...consultForm, phone: e.target.value })

                    }

                    className="w-full bg-white border border-[#E2DDD5] rounded-md px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#C57053]"

                  />

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <label className="block text-xs font-medium text-gray-700 mb-1">

                      City

                    </label>

                    <select

                      value={consultForm.city}

                      onChange={(e) =>

                        setConsultForm({ ...consultForm, city: e.target.value })

                      }

                      className="w-full bg-white border border-[#E2DDD5] rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#C57053]"

                    >

                      <option value="Vijayawada">Vijayawada</option>

                      <option value="Guntur">Guntur</option>

                      <option value="Eluru">Eluru</option>

                      <option value="Hyderabad">Hyderabad</option>

                      <option value="Other">Other AP / Telangana</option>

                    </select>

                  </div>

                  <div>

                    <label className="block text-xs font-medium text-gray-700 mb-1">

                      Service Interested In

                    </label>

                    <select

                      value={consultForm.service}

                      onChange={(e) =>

                        setConsultForm({

                          ...consultForm,

                          service: e.target.value,

                        })

                      }

                      className="w-full bg-white border border-[#E2DDD5] rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#C57053]"

                    >

                      <option value="Interior Design Consultation">

                        Full Interior Design

                      </option>

                      <option value="Wallpaper & 3D Wallpapers">

                        3D Wallpapers &amp; Wall Art

                      </option>

                      <option value="Vinyl & Wooden Flooring">

                        Vinyl / Wooden Flooring

                      </option>

                      <option value="Vertical Garden & Greenery">

                        Vertical Garden

                      </option>

                      <option value="Curtains & Motorized Blinds">

                        Curtains &amp; Blinds

                      </option>

                    </select>

                  </div>

                </div>

                <button

                  type="submit"

                  className="w-full mt-4 bg-[#C57053] hover:bg-[#B35E42] text-white py-3 rounded-md text-xs font-medium uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"

                >

                  <span>Submit Consultation Request</span>

                  <ArrowRight className="w-4 h-4" />

                </button>

              </form>

            </motion.div>

          </div>

        )}

      </AnimatePresence>

      {/* =========================================================================

          VIDEO SHOWCASE MODAL

          ========================================================================= */}

      <AnimatePresence>

        {isVideoModalOpen && (

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <motion.div

              initial={{ opacity: 0 }}

              animate={{ opacity: 1 }}

              exit={{ opacity: 0 }}

              onClick={() => setVideoModalOpen(false)}

              className="fixed inset-0 bg-black/80 backdrop-blur-md"

            />

            <motion.div

              initial={{ opacity: 0, scale: 0.95 }}

              animate={{ opacity: 1, scale: 1 }}

              exit={{ opacity: 0, scale: 0.95 }}

              className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl z-10 aspect-video flex items-center justify-center border border-white/20"

            >

              <button

                onClick={() => setVideoModalOpen(false)}

                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center cursor-pointer"

              >

                <X className="w-4 h-4" />

              </button>

              <video

                src="/videos/homedine.mp4"

                controls

                autoPlay

                className="w-full h-full object-cover"

              >

                Your browser does not support the video tag.

              </video>

            </motion.div>

          </div>

        )}

      </AnimatePresence>

      {/* =========================================================================

          GALLERY LIGHTBOX MODAL

          ========================================================================= */}

      <AnimatePresence>

        {activeGalleryIndex !== null && (

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <motion.div

              initial={{ opacity: 0 }}

              animate={{ opacity: 1 }}

              exit={{ opacity: 0 }}

              onClick={() => setActiveGalleryIndex(null)}

              className="fixed inset-0 bg-black/85 backdrop-blur-md"

            />

            <motion.div

              initial={{ opacity: 0, scale: 0.92 }}

              animate={{ opacity: 1, scale: 1 }}

              exit={{ opacity: 0, scale: 0.92 }}

              className="relative w-full max-w-3xl bg-neutral-900 rounded-xl overflow-hidden shadow-2xl z-10"

            >

              <button

                onClick={() => setActiveGalleryIndex(null)}

                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/70 text-white hover:bg-black flex items-center justify-center cursor-pointer"

              >

                <X className="w-4 h-4" />

              </button>

              <div className="aspect-[16/10] w-full bg-black">

                <img

                  src={galleryItems[activeGalleryIndex].image}

                  alt={galleryItems[activeGalleryIndex].title}

                  className="w-full h-full object-contain"

                />

              </div>

              <div className="p-5 text-white flex items-center justify-between">

                <div>

                  <h4 className="font-poppins text-base font-medium">

                    {galleryItems[activeGalleryIndex].title}

                  </h4>

                  <p className="text-xs text-stone-400">

                    {galleryItems[activeGalleryIndex].location}

                  </p>

                </div>

                <Link

                  to="/interior-design"

                  className="text-xs font-semibold text-[#D98267] hover:underline"

                >

                  Explore More Designs →

                </Link>

              </div>

            </motion.div>

          </div>

        )}

      </AnimatePresence>

    </div>

  );

};

export default Home;