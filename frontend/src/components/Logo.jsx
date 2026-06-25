import React from "react";

export const Logo = ({ size = "md", variant = "dark" }) => {
  const color = variant === "light" ? "#F7F4EC" : "#14532D";
  const accent = "#2E9E44";
  const sizes = {
    sm: { text: "text-base", svg: 18 },
    md: { text: "text-xl sm:text-2xl", svg: 22 },
    lg: { text: "text-3xl sm:text-4xl", svg: 32 },
  }[size];

  return (
    <div className="flex flex-col items-center leading-none select-none" data-testid="logo-mark">
      {/* two-tone leaf above wordmark */}
      <svg width={sizes.svg} height={sizes.svg * 0.7} viewBox="0 0 32 22" className="mb-1">
        <path d="M16 21 C5 21, 1 11, 16 1 C 16 9, 16 17, 16 21Z" fill={accent} />
        <path d="M16 21 C27 21, 31 11, 16 1 C 16 9, 16 17, 16 21Z" fill={color} opacity="0.85" />
      </svg>
      <span className={`font-serif-display tracking-[0.25em] ${sizes.text}`} style={{ color }}>
        DIVINARTE
      </span>
      {size === "lg" && (
        <span className="font-body text-[10px] tracking-[0.4em] mt-1 uppercase" style={{ color, opacity: 0.7 }}>
          Cosmética natural artesanal
        </span>
      )}
    </div>
  );
};
