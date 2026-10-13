"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_MODELS,
  PROVIDERS,
  PROVIDER_LABELS,
  type ProviderId,
} from "@/lib/ai/types";

type KeySummary = {
  provider: ProviderId;
  label: string | null;
  lastFour: string | null;
  createdAt: string;
};

const inputClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-500";

export function ApiKeysManager() {
  const [keys, setKeys] = useState<KeySummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [provider, setProvider] = useState<ProviderId>("openrouter");
  const [apiKey, setApiKey] = useState("");
  const [label, setLabel] = useState("");
  const [notice, setNotice] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  async function load() {
    const res = await fetch("/api/keys");
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys);
    }
    setLoaded(true);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/keys")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          setKeys(data?.keys ?? []);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        apiKey,
        label: label.trim() || undefined,
      }),
    });
    if (res.ok) {
      setApiKey("");
      setLabel("");
      setNotice({ type: "ok", text: "API key saved." });
      await load();
    } else {
      const data = await res.json().catch(() => null);
      setNotice({
        type: "error",
        text: data?.error ?? "Failed to save the key.",
      });
    }
  }

  async function remove(prov: ProviderId) {
    setNotice(null);
    const res = await fetch(`/api/keys?provider=${prov}`, {
      method: "DELETE",
    });
    setNotice({
      type: res.ok ? "ok" : "error",
      text: res.ok ? "API key removed." : "Failed to remove the key.",
    });
    await load();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="provider" className="text-sm font-medium">
              Provider
            </label>
            <select
              id="provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value as ProviderId)}
              className={inputClass}
            >
              {PROVIDERS.map((prov) => (
                <option key={prov} value={prov}>
                  {PROVIDER_LABELS[prov]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="label" className="text-sm font-medium">
              Label <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              id="label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="e.g. Work account"
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="api-key" className="text-sm font-medium">
            API key
          </label>
          <input
            id="api-key"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={`Paste your ${PROVIDER_LABELS[provider]} key`}
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} font-mono`}
          />
        </div>
        {notice ? (
          <p
            role="status"
            className={`text-sm ${
              notice.type === "ok" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {notice.text}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={!apiKey.trim()}
          className="rounded-full bg-zinc-50 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
        >
          Save key
        </button>
      </form>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Saved keys
        </h2>
        {!loaded ? (
          <p className="mt-3 text-sm text-zinc-500">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No keys saved yet. Add one above.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {keys.map((key) => (
              <li
                key={key.provider}
                className="flex items-center justify-between rounded-lg border border-zinc-900 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {PROVIDER_LABELS[key.provider]}
                    {key.label ? <span className="text-zinc-500"> · {key.label}</span> : null}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {key.lastFour ? `…${key.lastFour}` : "Saved"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(key.provider)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-zinc-500">
        Tip: the default model for {PROVIDER_LABELS[provider]} on the chat page
        is {DEFAULT_MODELS[provider]} — edit it there.
      </p>
    </div>
  );
}