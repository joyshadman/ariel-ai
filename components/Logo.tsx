"use client";

import { Icon } from "./Icon";

export interface LogoProps {
  onClick?: () => void;
  markSize?: number;
  className?: string;
}

export function Logo({ onClick, markSize = 34, className = "" }: LogoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ariel home"
      className={`flex items-center gap-2.5 ${className}`}
    >
      <span
        className="grid shrink-0 place-items-center rounded-full bg-coral text-white"
        style={{ width: markSize, height: markSize }}
      >
        <Icon name="spark" size={Math.round(markSize * 0.52)} />
      </span>
      <span className="font-display text-[26px] leading-none tracking-[-.02em] text-ink">
        ariel
      </span>
    </button>
  );
}
