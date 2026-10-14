"use client";

import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "spark"
  | "arrow"
  | "check"
  | "plus"
  | "send"
  | "key"
  | "eye"
  | "brain"
  | "shield"
  | "card"
  | "menu"
  | "trash"
  | "edit"
  | "close"
  | "user";

const paths: Record<IconName, ReactNode> = {
  spark: (
    <path d="M12 3c.6 4.4 2.8 6.6 7 7-4.2.4-6.4 2.6-7 7-.6-4.4-2.8-6.6-7-7 4.2-.4 6.4-2.6 7-7Z" />
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.2 4.2L19 6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  send: <path d="M21 3 10.5 13.5M21 3l-6 18-4.5-7.5L3 9l18-6Z" />,
  key: (
    <>
      <circle cx="8" cy="16" r="3.5" />
      <path d="M10.6 13.4 20 4M16.2 4.6l2.6 2.6" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  brain: (
    <>
      <path d="M12 5.5a2.5 2.5 0 0 0-4.9-.7A2.6 2.6 0 0 0 5 7.5a2.6 2.6 0 0 0-.6 4.4A2.7 2.7 0 0 0 6 16.5a2.5 2.5 0 0 0 3.5 2.3A2.5 2.5 0 0 0 12 18.3Z" />
      <path d="M12 5.5a2.5 2.5 0 0 1 4.9-.7A2.6 2.6 0 0 1 19 7.5a2.6 2.6 0 0 1 .6 4.4A2.7 2.7 0 0 1 18 16.5a2.5 2.5 0 0 1-3.5 2.3A2.5 2.5 0 0 1 12 18.3Z" />
    </>
  ),
  shield: <path d="M12 3l7 3v5c0 4.4-2.9 7.8-7 9-4.1-1.2-7-4.6-7-9V6l7-3Z" />,
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c1.3-3.6 4.2-5.5 7.5-5.5s6.2 1.9 7.5 5.5" />
    </>
  ),
  trash: (
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  ),
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
