"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, viewportOnce } from "./anim";
import { useMounted } from "./use-mounted";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const mounted = useMounted();

  return (
    <motion.div
      initial="hidden"
      animate={mounted ? undefined : "hidden"}
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
