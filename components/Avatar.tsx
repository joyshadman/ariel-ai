"use client";

import Image from "next/image";
import { useState } from "react";

export function Avatar({
  name,
  email,
  src,
  size = 36,
  className = "",
}: {
  name: string | null;
  email: string;
  src: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = (name?.[0] ?? email[0] ?? "A").toUpperCase();

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-coral font-semibold text-white ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}
