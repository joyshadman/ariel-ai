"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { useNavigation, type Page } from "./navigation";
import { useSessionUser, type SessionUser } from "./use-session-user";

const links: { label: string; page: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Chat", page: "chat" },
  { label: "Pricing", page: "pricing" },
  { label: "About", page: "about" },
];

export function Header() {
  const { page, navigate } = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { ready, user } = useSessionUser();

  const go = (target: Page) => {
    setMenuOpen(false);
    navigate(target);
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-[82px] w-full max-w-[1200px] items-center justify-between px-5 min-[700px]:px-8">
        <Logo onClick={() => go("home")} />

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 min-[700px]:flex"
        >
          {links.map((link) => {
            const active = page === link.page;
            return (
              <button
                key={link.page}
                type="button"
                onClick={() => go(link.page)}
                aria-current={active ? "page" : undefined}
                className={`group relative text-[15px] transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] origin-center scale-x-0 rounded-full bg-coral/40 transition-transform duration-300 group-hover:scale-x-100" />
                {active ? (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full bg-coral"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="hidden min-w-[220px] items-center justify-end gap-2 min-[700px]:flex">
          {!ready ? null : user ? (
            <>
              <Button kind="secondary" onClick={() => go("chat")}>
                Open chat
              </Button>
              <ProfileButton user={user} onClick={() => go("profile")} />
            </>
          ) : (
            <>
              <Button kind="ghost" onClick={() => go("login")}>
                Sign in
              </Button>
              <Button kind="primary" onClick={() => go("signup")}>
                Get started
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 min-[700px]:hidden">
          {ready && user ? (
            <ProfileButton user={user} onClick={() => go("profile")} />
          ) : null}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink"
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen ? (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-line bg-paper min-[700px]:hidden"
          >
            <nav
              aria-label="Mobile"
              className="mx-auto flex w-full max-w-[1200px] flex-col gap-1 px-5 py-4"
            >
              {links.map((link) => (
                <button
                  key={link.page}
                  type="button"
                  onClick={() => go(link.page)}
                  className={`rounded-xl px-3 py-3 text-left text-[15px] ${
                    page === link.page
                      ? "bg-coral-soft text-coral-dark"
                      : "text-ink hover:bg-panel-3"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <Button kind="secondary" onClick={() => go("profile")}>
                      Profile settings
                    </Button>
                    <Button kind="primary" onClick={() => go("chat")}>
                      Open chat
                    </Button>
                  </>
                ) : (
                  <>
                    <Button kind="secondary" onClick={() => go("login")}>
                      Sign in
                    </Button>
                    <Button kind="primary" onClick={() => go("signup")}>
                      Get started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function ProfileButton({
  user,
  onClick,
}: {
  user: SessionUser;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Profile settings"
      title={user.name ?? user.email}
      className="rounded-full ring-offset-2 ring-offset-paper transition hover:ring-2 hover:ring-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
    >
      <Avatar name={user.name} email={user.email} src={user.avatarUrl} size={40} />
    </button>
  );
}
