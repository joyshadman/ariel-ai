export const DEFAULT_AUTH_REDIRECT = "/chat";

const GUEST_PATHS = ["/login", "/signup", "/forgot-password"];

export function isGuestPath(pathname: string): boolean {
  return GUEST_PATHS.some((p) => pathname.startsWith(p));
}

export function safeRedirectPath(
  value: unknown,
  fallback: string = DEFAULT_AUTH_REDIRECT,
): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return fallback;
  }
  const base = "http://ariel.invalid";
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return fallback;
  }
  if (url.origin !== base || isGuestPath(url.pathname)) {
    return fallback;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
