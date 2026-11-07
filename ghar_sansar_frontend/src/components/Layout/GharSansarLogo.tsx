import React from "react";
import { Link } from "react-router-dom";

interface GharSansarLogoProps {
  variant?: "light" | "dark";
  showSubtitle?: boolean;
  className?: string;
  imgClassName?: string;
}

export const GharSansarIcon: React.FC<{ className?: string; color?: string }> = ({
  className = "h-[25px] sm:h-[27px] w-auto shrink-0 object-contain",
}) => (
  <img
    src="/images/ghar_sansar_logo.webp"
    alt="Ghar Sansar"
    className={className}
    onError={(e) => {
      const target = e.currentTarget;
      if (!target.dataset.fallback) {
        target.dataset.fallback = "1";
        target.src = "/ghar_sansar_logo_nav.png";
      } else if (target.dataset.fallback === "1") {
        target.dataset.fallback = "2";
        target.src = "/ghar sansar logo.svg";
      }
    }}
  />
);

export const GharSansarLogo: React.FC<GharSansarLogoProps> = ({
  variant = "light",
  className = "",
  imgClassName = "h-[25px] sm:h-[27px] w-auto object-contain",
}) => {
  return (
    <Link
      to="/"
      aria-label="Ghar Sansar Home"
      className={`inline-flex items-center justify-center transition-transform hover:scale-[1.02] ${className}`}
    >
      <img
        src="/images/ghar_sansar_logo.webp"
        alt="Ghar Sansar"
        className={`${imgClassName} transition-transform group-hover:scale-105`}
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.dataset.fallback) {
            target.dataset.fallback = "1";
            target.src = "/ghar_sansar_logo_nav.png";
          } else if (target.dataset.fallback === "1") {
            target.dataset.fallback = "2";
            target.src = "/ghar sansar logo.svg";
          }
        }}
      />
    </Link>
  );
};

export default GharSansarLogo;
