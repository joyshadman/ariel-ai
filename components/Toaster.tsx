"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      closeButton
      toastOptions={{
        style: {
          background: "var(--color-white)",
          color: "var(--color-ink)",
          border: "1px solid var(--color-line)",
          borderRadius: 14,
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          boxShadow: "0 25px 65px rgba(63,48,43,.16)",
        },
        classNames: {
          success: "[&_[data-icon]]:text-green-ink",
          error: "[&_[data-icon]]:text-error",
        },
      }}
    />
  );
}
