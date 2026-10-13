"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEFAULT_MODELS,
  PROVIDERS,
  PROVIDER_LABELS,
  type ProviderId,
} from "@/lib/ai/types";

type Props = {
  initialId: string | null;
  initialChats: { id: string; title: string }[];
  initialMessages?: UIMessage[];
};

const selectClass =
  "rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-300 outline-none focus:border-zinc-500";

function useStoredValue(key: string): string | null {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    () => window.localStorage.getItem(key),
    () => null,
  );
}

function setStored(key: string, value: string) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      newValue: value,
      storageArea: window.localStorage,
    }),
  );
}

export function ChatClient({
  initialId,
  initialChats,
  initialMessages = [],
}: Props) {
  const router = useRouter();
  const chatId = useRef(initialId ?? crypto.randomUUID());
  const [input, setInput] = useState("");

  const storedProvider = useStoredValue("ariel:provider");
  const storedModel = useStoredValue("ariel:model");
  const provider: ProviderId =
    storedProvider && PROVIDERS.includes(storedProvider as ProviderId)
      ? (storedProvider as ProviderId)
      : "openrouter";
  const model = storedModel ?? DEFAULT_MODELS[provider];

  const { messages, sendMessage, status, error, stop } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  function updateProvider(next: ProviderId) {
    setStored("ariel:provider", next);
    setStored("ariel:model", DEFAULT_MODELS[next]);
  }

  function updateModel(next: string) {
    setStored("ariel:model", next);
  }

  function send(text: string) {
    if (!text || status === "streaming") return;
    sendMessage(
      { text },
      { body: { chatId: chatId.current, provider, model } },
    );
    setInput("");
  }

  return (
    <div className="flex w-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-900 p-3 md:flex">
        <button
          type="button"
          onClick={() => router.replace("/chat")}
          className="rounded-lg border border-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-600"
        >
          New chat
        </button>
        {initialChats.length > 0 ? (
          <nav className="mt-4 flex flex-col gap-1">
            {initialChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat?id=${chat.id}`}
                className={`truncate rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 ${
                  chat.id === initialId ? "bg-zinc-900 text-zinc-100" : ""
                }`}
              >
                {chat.title}
              </Link>
            ))}
          </nav>
        ) : (
          <p className="mt-4 px-3 text-sm text-zinc-500 text-wrap">
            Your chats will appear here.
          </p>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-900 px-4 py-3">
          <div className="flex items-center gap-2">
            <select
              aria-label="Provider"
              value={provider}
              onChange={(event) =>
                updateProvider(event.target.value as ProviderId)
              }
              className={selectClass}
            >
              {PROVIDERS.map((prov) => (
                <option key={prov} value={prov}>
                  {PROVIDER_LABELS[prov]}
                </option>
              ))}
            </select>
            <input
              aria-label="Model"
              value={model}
              spellCheck={false}
              onChange={(event) => updateModel(event.target.value)}
              className={`${selectClass} w-56 font-mono`}
            />
          </div>
          {status === "streaming" ? (
            <button
              type="button"
              onClick={() => stop()}
              className="text-sm text-zinc-400 hover:text-zinc-100"
            >
              Stop
            </button>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-xl pt-16 text-center">
              <h2 className="text-xl font-semibold tracking-tight">
                What do you want to work on?
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Pick your provider and model above — your saved key is used
                automatically. If none is set, add one in{" "}
                <Link
                  href="/settings"
                  className="underline hover:text-zinc-200"
                >
                  settings
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`text-sm leading-7 ${
                    message.role === "user"
                      ? "self-end rounded-2xl rounded-br-md bg-zinc-800 px-4 py-3 text-zinc-100"
                      : "self-start text-zinc-200"
                  }`}
                >
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <p key={index} className="whitespace-pre-wrap">
                        {part.text}
                      </p>
                    ) : null,
                  )}
                </div>
              ))}
              {status === "error" && error ? (
                <p role="alert" className="text-sm text-red-400">
                  {error.message}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(input.trim());
          }}
          className="border-t border-zinc-900 px-4 py-4"
        >
          <div className="mx-auto flex max-w-2xl gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(input.trim());
                }
              }}
              rows={1}
              placeholder="Message…"
              className="max-h-40 min-h-11 flex-1 resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || status === "streaming"}
              className="shrink-0 rounded-lg bg-zinc-50 px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}