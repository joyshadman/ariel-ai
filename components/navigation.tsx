"use client";

import { createContext, useCallback, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";

export type Page =
  | "home"
  | "chat"
  | "pricing"
  | "about"
  | "login"
  | "signup"
  | "forgot-password"
  | "settings"
  | "profile";

const ROUTES: Record<Page, string> = {
  home: "/",
  chat: "/chat",
  pricing: "/pricing",
  about: "/about",
  login: "/login",
  signup: "/signup",
  "forgot-password": "/forgot-password",
  settings: "/settings",
  profile: "/settings#account",
};

export function pageFromPathname(pathname: string): Page {
  if (pathname.startsWith("/chat")) return "chat";
  if (pathname.startsWith("/pricing")) return "pricing";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/signup")) return "signup";
  if (pathname.startsWith("/login")) return "login";
  if (pathname.startsWith("/forgot-password")) return "forgot-password";
  return "home";
}

export interface NavigationValue {
  page: Page;
  navigate: (page: Page) => void;
}

export const NavigationContext = createContext<NavigationValue>({
  page: "home",
  navigate: () => {},
});

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navigate = useCallback(
    (next: Page) => {
      router.push(ROUTES[next]);
    },
    [router],
  );

  return (
    <NavigationContext.Provider
      value={{ page: pageFromPathname(pathname), navigate }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationValue {
  return useContext(NavigationContext);
}
