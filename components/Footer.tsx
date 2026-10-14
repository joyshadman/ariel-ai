"use client";

import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { useNavigation, type Page } from "./navigation";

const columns: { title: string; links: { label: string; page: Page }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Chat", page: "chat" },
      { label: "Pricing", page: "pricing" },
      { label: "Settings", page: "settings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", page: "about" },
      { label: "Get started", page: "signup" },
    ],
  },
];

export function Footer() {
  const { navigate } = useNavigation();

  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-14 min-[700px]:grid-cols-[1.4fr_1fr_1fr] min-[700px]:px-8">
        <div className="flex flex-col gap-4">
          <Logo onClick={() => navigate("home")} />
          <p className="max-w-[280px] text-[13px] leading-relaxed text-muted">
            One calm home for the models you already trust, powered by your own
            key.
          </p>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.14em] text-green-ink">
            <Icon name="shield" size={14} />
            Private by default
          </span>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[.18em] text-muted">
              {column.title}
            </h3>
            <ul className="flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => navigate(link.page)}
                    className="text-[14px] text-ink transition-colors hover:text-coral-dark"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-5 py-6 text-[12px] text-muted min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between min-[700px]:px-8">
          <span>© Ariel. All rights reserved.</span>
          <span>Bring your own key. No inference resold.</span>
        </div>
      </div>
    </footer>
  );
}
