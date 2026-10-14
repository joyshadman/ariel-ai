"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export type ButtonKind = "primary" | "secondary" | "ghost";

export interface ButtonProps {
  kind?: ButtonKind;
  type?: "button" | "submit";
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

const base =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-coral-soft disabled:cursor-not-allowed disabled:opacity-60";

const kinds: Record<ButtonKind, string> = {
  primary: "bg-coral text-white hover:bg-coral-dark",
  secondary:
    "border border-line bg-white text-ink hover:border-coral hover:text-coral-dark",
  ghost: "text-muted hover:bg-panel-3 hover:text-ink",
};

export function Button({
  kind = "primary",
  type = "button",
  onClick,
  children,
  className = "",
  disabled = false,
  ariaLabel,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={`${base} ${kinds[kind]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
