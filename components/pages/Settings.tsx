"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logoutAction } from "@/app/(auth)/actions";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { useNavigation } from "@/components/navigation";
import {
  FREE_DAILY_LIMIT,
  FREE_MODEL,
  freeMessagesRemaining,
  PROVIDERS,
  PROVIDER_LABELS,
  type ProviderId,
} from "@/lib/ai/types";

export type KeySummary = {
  provider: ProviderId;
  label: string | null;
  lastFour: string | null;
};

const navItems = [
  { id: "providers", label: "Providers" },
  { id: "security", label: "Security" },
  { id: "account", label: "Profile" },
];

const hosts: Record<ProviderId, string> = {
  openrouter: "openrouter.ai",
  openai: "api.openai.com",
  anthropic: "api.anthropic.com",
  google: "generativelanguage.googleapis.com",
};

export function Settings({
  user,
  initialKeys,
  freeUsedToday,
}: {
  user: { email: string; name: string | null; avatarUrl: string | null };
  initialKeys: KeySummary[];
  freeUsedToday: number;
}) {
  const { navigate } = useNavigation();
  const [active, setActive] = useState("providers");
  const [keys, setKeys] = useState<KeySummary[]>(initialKeys);

  const goTo = (id: string) => {
    setActive(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!navItems.some((item) => item.id === id)) return;
    const frame = requestAnimationFrame(() => {
      setActive(id);
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function upsert(provider: ProviderId, summary: KeySummary) {
    setKeys((prev) => [
      ...prev.filter((key) => key.provider !== provider),
      summary,
    ]);
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-[64px] w-full max-w-[1100px] items-center justify-between px-5 min-[700px]:px-8">
          <div className="flex items-center gap-4">
            <Logo markSize={28} onClick={() => navigate("home")} />
            <span className="hidden text-[13px] text-muted min-[700px]:inline">
              Settings
            </span>
          </div>
          <Button kind="secondary" onClick={() => navigate("chat")}>
            Back to chat
            <Icon name="arrow" size={15} />
          </Button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1100px] flex-1 gap-10 px-5 py-10 min-[900px]:grid-cols-[220px_1fr] min-[700px]:px-8">
        <nav
          aria-label="Settings sections"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 min-[900px]:mx-0 min-[900px]:flex-col min-[900px]:overflow-visible min-[900px]:px-0 min-[900px]:pb-0"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              className={`shrink-0 rounded-[13px] px-4 py-2.5 text-left text-[13px] font-medium transition-colors ${
                active === item.id
                  ? "bg-white text-ink shadow-[0_10px_25px_rgba(63,48,43,.08)]"
                  : "text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex max-w-[680px] flex-col gap-10">
          <section id="providers" className="scroll-mt-24">
            <h1 className="font-display text-[30px] tracking-[-.025em] text-ink">
              API providers
            </h1>
            <p className="mt-2 text-[14px] leading-7 text-muted">
              Add a key once and Ariel talks straight to your provider. Keys are
              encrypted before they ever reach the database. Prefer not to add
              one? The built-in free model works without a key.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              <FreeTierCard used={freeUsedToday} />
              {PROVIDERS.map((provider) => (
                <ProviderCard
                  key={provider}
                  provider={provider}
                  summary={keys.find((key) => key.provider === provider) ?? null}
                  onSaved={(summary) => {
                    upsert(provider, summary);
                    toast.success(
                      `${PROVIDER_LABELS[provider]} key saved and encrypted.`,
                    );
                  }}
                  onRemoved={() => {
                    setKeys((prev) =>
                      prev.filter((key) => key.provider !== provider),
                    );
                    toast.success(`${PROVIDER_LABELS[provider]} key removed.`);
                  }}
                  onError={(text) => toast.error(text)}
                />
              ))}
            </div>
          </section>

          <section id="security" className="scroll-mt-24">
            <h2 className="font-display text-[24px] tracking-[-.02em] text-ink">
              Security
            </h2>
            <div className="mt-4 flex items-start gap-4 rounded-[22px] bg-ink p-6 text-white min-[700px]:p-8">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-coral">
                <Icon name="shield" size={22} />
              </span>
              <div>
                <p className="text-[15px] font-medium">
                  Encrypted at rest, never resold
                </p>
                <p className="mt-2 text-[13px] leading-7 text-ink-soft">
                  Keys are sealed with AES-256-GCM before storage and decrypted
                  only in memory at request time. When you use your own key,
                  requests go straight to your provider and are never billed to
                  Ariel credits.
                </p>
              </div>
            </div>
          </section>

          <section id="account" className="scroll-mt-24">
            <h2 className="font-display text-[24px] tracking-[-.02em] text-ink">
              Profile
            </h2>
            <ProfileCard user={user} />
          </section>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  summary,
  onSaved,
  onRemoved,
  onError,
}: {
  provider: ProviderId;
  summary: KeySummary | null;
  onSaved: (summary: KeySummary) => void;
  onRemoved: () => void;
  onError: (text: string) => void;
}) {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const connected = Boolean(summary);

  async function save() {
    const apiKey = value.trim();
    if (!apiKey) return;
    setPending(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        onError(data?.error ?? "Failed to save the key.");
        return;
      }
      setValue("");
      onSaved({ provider, label: null, lastFour: apiKey.slice(-4) });
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    setPending(true);
    try {
      const res = await fetch(`/api/keys?provider=${provider}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onRemoved();
      } else {
        onError("Failed to remove the key.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-[22px] border border-line bg-white p-6 min-[700px]:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-panel-3 text-ink">
            <Icon name="spark" size={20} />
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-medium text-ink">
              {PROVIDER_LABELS[provider]}
            </p>
            <p className="text-[12px] text-muted">{hosts[provider]}</p>
          </div>
        </div>
        <ConnectionBadge connected={connected} />
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label
          htmlFor={`${provider}-key`}
          className="text-[12px] font-medium text-ink"
        >
          API key
        </label>
        <input
          id={`${provider}-key`}
          type="password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={connected ? "Paste a new key to replace" : "sk-…"}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition placeholder:text-muted focus:border-coral focus:ring-[3px] focus:ring-coral-soft"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button kind="primary" onClick={save} disabled={!value.trim() || pending}>
          {connected ? "Update key" : "Save key"}
        </Button>
        {connected ? (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-muted transition-colors hover:border-error hover:text-error disabled:opacity-50"
          >
            <Icon name="trash" size={15} />
            Remove
          </button>
        ) : null}
        {summary?.lastFour ? (
          <span className="text-[12px] text-muted">
            Stored as{" "}
            <span className="font-medium text-ink">
              ••••{summary.lastFour}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ProfileCard({
  user,
}: {
  user: { email: string; name: string | null; avatarUrl: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [saved, setSaved] = useState(user.name ?? "");
  const [pending, setPending] = useState(false);
  const trimmed = name.trim();

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!trimmed || trimmed === saved) return;
    setPending(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "Couldn't update your name.");
        return;
      }
      setName(data.name);
      setSaved(data.name);
      toast.success("Profile updated.");
      router.refresh();
    } catch {
      toast.error("Couldn't update your name.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 rounded-[22px] border border-line bg-white p-6 min-[700px]:p-8">
      <div className="flex items-center gap-4">
        <Avatar
          name={saved || null}
          email={user.email}
          src={user.avatarUrl}
          size={56}
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-medium text-ink">
            {saved || "Ariel user"}
          </p>
          <p className="truncate text-[13px] text-muted">{user.email}</p>
          <p className="mt-1 text-[12px] text-muted">
            {user.avatarUrl
              ? "Profile picture from your Google account."
              : "Sign in with Google to use your profile picture."}
          </p>
        </div>
      </div>

      <form onSubmit={save} className="mt-6 flex flex-col gap-2">
        <label htmlFor="display-name" className="text-[12px] font-medium text-ink">
          Display name
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="display-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            placeholder="Your name"
            autoComplete="name"
            className="min-w-0 flex-1 rounded-[10px] border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition placeholder:text-muted focus:border-coral focus:ring-[3px] focus:ring-coral-soft"
          />
          <Button
            kind="primary"
            type="submit"
            disabled={pending || !trimmed || trimmed === saved}
          >
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>

      <form action={logoutAction} className="mt-6 border-t border-line pt-6">
        <Button kind="secondary" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
}

function FreeTierCard({ used }: { used: number }) {
  const remaining = freeMessagesRemaining(used);
  const percent = Math.round((remaining / FREE_DAILY_LIMIT) * 100);

  return (
    <div className="rounded-[22px] border border-line bg-white p-6 min-[700px]:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-coral-soft text-coral-dark">
            <Icon name="spark" size={20} />
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-medium text-ink">Ariel Free</p>
            <p className="text-[12px] text-muted">{FREE_MODEL} · no key needed</p>
          </div>
        </div>
        <span className="rounded-full bg-green px-3 py-1 text-[11px] font-semibold uppercase tracking-[.12em] text-green-ink">
          Included
        </span>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-[12px] text-muted">
          <span>Free messages today</span>
          <span className="font-medium text-ink">
            {remaining} of {FREE_DAILY_LIMIT} left
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Free messages remaining today"
          aria-valuemin={0}
          aria-valuemax={FREE_DAILY_LIMIT}
          aria-valuenow={remaining}
          className="mt-2 h-2 overflow-hidden rounded-full bg-panel-3"
        >
          <div className="h-full rounded-full bg-coral" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-[12px] text-muted">Resets daily at 00:00 UTC.</p>
      </div>
    </div>
  );
}

function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <span className="relative inline-flex h-[26px] min-w-[104px] items-center justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={connected ? "connected" : "disconnected"}
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -4 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`absolute inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[.12em] ${
            connected ? "bg-green text-green-ink" : "bg-panel-3 text-muted"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connected ? "bg-green-ink" : "bg-muted"
            }`}
          />
          {connected ? "Connected" : "Not connected"}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
