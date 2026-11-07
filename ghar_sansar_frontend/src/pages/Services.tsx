import React from "react";
import { motion } from "framer-motion";
import { Check, Calendar, Phone, MessageSquare, Home, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useServices } from "../context/ServiceContext";

// Normalize image URLs
const fixImageUrl = (url: string | undefined) => {
  if (!url) return "";
  let fixed = url
    .replace(/^https?:\/\/https?:\/\//, "https://")
    .replace(/\s/g, "%20")
    .replace(/([^:]\/)\/+/g, "$1");
  if (fixed.startsWith("http://backend.gharsansar.website") || fixed.startsWith("http://lx70r6zsef")) {
    fixed = fixed.replace(/^http:/, "https:");
  }
  return fixed;
};

const Services: React.FC = () => {
  const { services } = useServices();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(false);
  }, [services]);

  const handleEnquire = (serviceTitle: string) => {
    const text = `Hello Ghar Sansar, I am interested in inquiring about your "${serviceTitle}" service. Please share details and consultation availability.`;
    window.open(`https://wa.me/919248344434?text=${encodeURIComponent(text)}`, "_blank", "noopener noreferrer");
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen font-poppins pt-20 sm:pt-24 pb-16 sm:pb-20 flex flex-col selection:bg-[#F7EBE4] selection:text-[#7D3219] antialiased">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs sm:text-[13px] text-gray-500 font-medium mb-4">
          <Link to="/" className="hover:text-[#7D3219] transition-colors flex items-center gap-1.5 cursor-pointer">
            <Home size={14} className="shrink-0 text-gray-500" />
            <span>Home</span>
          </Link>
          <span className="text-gray-400 select-none px-0.5">&gt;</span>
          <span className="text-gray-900 font-semibold">Services</span>
        </nav>

        {/* Editorial Text-Only Header (No top banner images, clean and uncluttered) */}
        <div className="pb-6 border-b border-[#E8E2D8] mb-8">
          <span className="text-[11px] sm:text-xs font-medium tracking-[0.24em] text-[#7D3219] uppercase font-sans mb-1.5 block">
            Craftsmanship • Turnkey Execution
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-poppins font-normal text-gray-950 tracking-tight mb-2">
            Home & Interior Services
          </h1>
          <p className="text-xs sm:text-sm text-[#736B63] max-w-2xl font-normal leading-relaxed">
            From custom modular kitchens to full residential transformations, our in-house specialists bring bespoke design, premium materials, and on-site precision to every project.
          </p>
        </div>

        {/* Services List / Grid */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#D9B4A4] border-t-[#7D3219] animate-spin"></div>
          </div>
        ) : !services || services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#E8E2D8] p-8 shadow-2xs">
            <p className="text-gray-500 text-sm font-normal">No services currently listed. Please contact our team directly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-14">
            {services.map((s, index) => (
              <motion.div
                key={s.id || `service-${index}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="group bg-white rounded-xl border border-[#E8E2D8] hover:border-[#D9B4A4] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(125,50,25,0.06)] hover:-translate-y-1 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
                onClick={() => handleEnquire(s.title)}
              >
                <div>
                  {/* Service Image */}
                  <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-[#FAF8F5] mb-3.5 border border-[#E8E2D8]">
                    {s.image ? (
                      <img
                        src={fixImageUrl(s.image)}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-[#FAF8F5]">
                        <Sparkles size={24} className="opacity-40 text-stone-400" />
                      </div>
                    )}
                  </div>

                  {/* Category Pill Tag */}
                  {(s.subcategory_name || s.category_name) && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#7D3219] bg-[#F7EBE4] border border-[#D9B4A4] px-2 py-0.5 rounded-md mb-2 inline-block">
                      {s.subcategory_name || s.category_name}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="font-poppins text-base sm:text-lg font-normal text-gray-950 mb-1.5 leading-snug group-hover:text-[#7D3219] transition-colors">
                    {s.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-[#6B7280] font-normal leading-relaxed line-clamp-3 mb-3.5">
                    {s.description}
                  </p>

                  {/* Features List */}
                  {s.features && s.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {s.features.map((feature, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF7F2] border border-[#E8E2D8] rounded-md text-[11px] font-normal text-gray-700"
                        >
                          <Check size={11} className="text-[#7D3219] stroke-[2.5] shrink-0" />
                          <span>{feature}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Row: Price & Book Enquiry CTA */}
                <div className="pt-3 border-t border-[#E8E2D8] mt-auto">
                  {s.price ? (
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-poppins text-lg sm:text-[21px] font-normal text-gray-950 tracking-tight">
                            ₹{Number(s.price).toLocaleString("en-IN")}
                          </span>
                          {s.actual_price && Number(s.actual_price) > Number(s.price) && (
                            <span className="font-poppins text-xs sm:text-sm text-[#8C827A] line-through font-normal">
                              ₹{Number(s.actual_price).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8C827A] font-normal block">
                          (Estimated starting package)
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {/* Lightest Brown Family CTA Button with Micro-Curve */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnquire(s.title);
                    }}
                    className="w-full py-2.5 px-3 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] text-xs font-poppins font-medium rounded-md shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <Calendar size={13} className="text-[#7D3219] shrink-0" />
                    <span>Book Consultation</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Compact Consultation Banner (Clean, Typographic, No Giant Image) */}
        <div className="bg-white rounded-xl border border-[#E8E2D8] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="text-center md:text-left">
            <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.24em] text-[#7D3219] uppercase font-sans mb-1 block">
              Direct Assistance
            </span>
            <h2 className="text-xl sm:text-2xl font-poppins font-normal text-gray-950 tracking-tight mb-1">
              Need a Custom Interior Solution?
            </h2>
            <p className="text-xs sm:text-sm text-[#736B63] font-normal leading-relaxed max-w-xl">
              Talk directly with our senior site managers and project leads in Vijayawada for bespoke quotes and physical material inspections.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
            <a
              href="tel:+918121135980"
              className="px-4 py-2.5 bg-white hover:bg-[#FAF7F2] text-gray-800 border border-[#E8E2D8] hover:border-[#7D3219] rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Phone size={13} className="text-gray-700" />
              <span>+91 81211 35980</span>
            </a>
            <a
              href="https://wa.me/919248344434?text=Hello%20Ghar%20Sansar%2C%20I%20would%20like%20to%20consult%20about%20interior%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#F7EBE4] hover:bg-[#EFE0D7] text-[#7D3219] border border-[#D9B4A4] hover:border-[#7D3219] rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <MessageSquare size={13} className="text-[#7D3219]" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Services;
