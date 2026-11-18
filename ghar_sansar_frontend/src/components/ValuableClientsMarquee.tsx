import React, { useMemo } from "react";
import { valuableClients, ClientLogo } from "../data/valuableClients";
import { ShieldCheck, Award } from "lucide-react";

interface LogoCardProps {
  client: ClientLogo;
}

const LogoCard: React.FC<LogoCardProps> = ({ client }) => {
  return (
    <div
      className="group relative flex flex-col items-center justify-center h-20 sm:h-24 w-44 sm:w-56 shrink-0 bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#C86B4C]/70 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_24px_rgba(200,107,76,0.12)] px-4 py-3 mx-2 sm:mx-2.5 transition-all duration-300 hover:-translate-y-1 cursor-default select-none"
      title={`${client.name} — ${client.category}`}
    >
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <img
          src={client.src}
          alt={client.name}
          loading="lazy"
          className="max-h-12 sm:max-h-14 max-w-[130px] sm:max-w-[165px] w-auto h-auto object-contain transition-all duration-300 group-hover:scale-105"
        />
      </div>

      {/* Subtle bottom tag on hover */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
        <span className="bg-[#2B1B17] text-white text-[9.5px] font-medium px-2 py-0.5 rounded-full shadow-md border border-white/10 tracking-tight">
          {client.name}
        </span>
      </div>
    </div>
  );
};

const ValuableClientsMarquee: React.FC = () => {
  // Split into two balanced tracks for rich multi-tier presentation
  const { track1, track2 } = useMemo(() => {
    const half = Math.ceil(valuableClients.length / 2);
    const firstHalf = valuableClients.slice(0, half);
    const secondHalf = valuableClients.slice(half);
    // Duplicate both arrays to make seamless infinite loops
    return {
      track1: [...firstHalf, ...firstHalf],
      track2: [...secondHalf, ...secondHalf],
    };
  }, []);

  return (
    <section className="w-full bg-[#FAF7F2] py-8 sm:py-12 border-b border-[#E8E2D8] relative overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 mb-6 sm:mb-8 text-center">
        {/* Refined Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C86B4C]/10 border border-[#C86B4C]/25 text-[#C86B4C] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] mb-2.5">
          <Award className="w-3.5 h-3.5 text-[#C86B4C]" />
          <span>Our Valuable Clients</span>
        </div>

        {/* Section Heading */}
        <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl text-gray-950 font-normal tracking-tight">
          Trusted by Prestigious Institutions &amp; Iconic Brands
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-2xl mx-auto leading-relaxed">
          Proudly supplying, designing, and partnering with Andhra Pradesh &amp; Telangana&apos;s leading government authorities, healthcare networks, premier universities, luxury residences, and hospitality destinations.
        </p>
      </div>

      {/* Marquee Container with Left & Right Gradient Shadows */}
      <div className="relative w-full overflow-hidden">
        {/* Left Fade Gradient */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent z-10" />

        {/* Right Fade Gradient */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-l from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent z-10" />

        {/* Track 1: Right to Left (42s) */}
        <div className="flex w-full overflow-hidden mb-3.5 sm:mb-4">
          <div className="animate-marquee-rtl-track1 flex items-center py-1">
            {track1.map((client, idx) => (
              <LogoCard key={`t1-${client.id}-${idx}`} client={client} />
            ))}
          </div>
        </div>

        {/* Track 2: Right to Left (48s, staggered) */}
        <div className="flex w-full overflow-hidden">
          <div className="animate-marquee-rtl-track2 flex items-center py-1">
            {track2.map((client, idx) => (
              <LogoCard key={`t2-${client.id}-${idx}`} client={client} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Trust Highlights Footer */}
      <div className="w-full max-w-[1200px] mx-auto px-4 mt-6 sm:mt-8 pt-4 border-t border-[#E8E2D8]/60 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-gray-500 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C86B4C]" />
          <span>25+ Esteemed Institutional &amp; Corporate Clients</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C86B4C]" />
          <span>Trusted Across Andhra Pradesh &amp; Telangana</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>End-to-End Supply &amp; Bespoke Solutions</span>
        </div>
      </div>
    </section>
  );
};

export default ValuableClientsMarquee;
