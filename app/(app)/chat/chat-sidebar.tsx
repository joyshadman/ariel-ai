"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { useNavigation } from "@/components/navigation";

export type ChatSummary = { id: string; title: string; updatedAt: string };

export type SidebarUser = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

function groupChats(chats: ChatSummary[]) {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const today: ChatSummary[] = [];
  const earlier: ChatSummary[] = [];

  for (const chat of chats) {
    if (new Date(chat.updatedAt).getTime() >= dayAgo) {
      today.push(chat);
    } else {
      earlier.push(chat);
    }
  }

  return [
    { group: "Today", items: today },
    { group: "Earlier", items: earlier },
  ].filter((section) => section.items.length > 0);
}

export function ChatSidebar({
  chats,
  activeId,
  user,
  freeRemaining,
  onNewChat,
  onRename,
  onDelete,
  onNavigate,
}: {
  chats: ChatSummary[];
  activeId: string | null;
  user: SidebarUser;
  freeRemaining: number;
  onNewChat: () => void;
  onRename: (id: string, title: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onNavigate?: () => void;
}) {
  const { navigate } = useNavigation();
  const grouped = groupChats(chats);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[64px] items-center px-5">
        <Logo markSize={28} onClick={() => navigate("home")} />
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onNavigate?.();
          }}
          className="flex w-full items-center gap-2 rounded-[13px] border border-line bg-white px-4 py-3 text-[13px] font-medium text-ink transition-colors hover:border-coral hover:text-coral-dark"
        >
          <Icon name="plus" size={16} />
          New conversation
        </button>
      </div>

      <nav
        aria-label="Conversation history"
        className="mt-6 flex-1 overflow-y-auto px-3 pb-4"
      >
        {grouped.length === 0 ? (
          <p className="px-2 text-[12px] leading-5 text-muted">
            Your conversations will appear here.
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.group} className="mb-5">
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-muted">
                {group.group}
              </p>
              <ul className="flex flex-col gap-1">
                <AnimatePresence initial={false}>
                  {group.items.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      active={chat.id === activeId}
                      onRename={onRename}
                      onDelete={onDelete}
                      onNavigate={onNavigate}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          ))
        )}
      </nav>

      <div className="border-t border-line p-3">
        <button
          type="button"
          onClick={() => navigate("profile")}
          aria-label="Profile settings"
          className="flex w-full items-center gap-3 rounded-[13px] px-3 py-2.5 text-left transition-colors hover:bg-white"
        >
          <Avatar
            name={user.name}
            email={user.email}
            src={user.avatarUrl}
            size={36}
          />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-medium text-ink">
              {user.name ?? user.email}
            </span>
            <span className="block truncate text-[11px] text-muted">
              {freeRemaining > 0
                ? `${freeRemaining} free messages left today`
                : "Free messages used up"}
            </span>
          </span>
          <Icon name="key" size={15} className="shrink-0 text-muted" />
        </button>
      </div>
    </div>
  );
}

function ChatItem({
  chat,
  active,
  onRename,
  onDelete,
  onNavigate,
}: {
  chat: ChatSummary;
  active: boolean;
  onRename: (id: string, title: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onNavigate?: () => void;
}) {
  const [mode, setMode] = useState<"idle" | "renaming" | "confirming">("idle");
  const [draft, setDraft] = useState(chat.title);
  const [pending, setPending] = useState(false);

  async function commitRename() {
    const title = draft.trim();
    if (!title || title === chat.title) {
      setDraft(chat.title);
      setMode("idle");
      return;
    }
    setPending(true);
    const ok = await onRename(chat.id, title);
    setPending(false);
    if (!ok) setDraft(chat.title);
    setMode("idle");
  }

  async function confirmDelete() {
    setPending(true);
    const ok = await onDelete(chat.id);
    if (!ok) {
      setPending(false);
      setMode("idle");
    }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden"
    >
      {mode === "renaming" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            commitRename();
          }}
          className="px-1 py-0.5"
        >
          <label htmlFor={`rename-${chat.id}`} className="sr-only">
            Chat name
          </label>
          <input
            id={`rename-${chat.id}`}
            autoFocus
            value={draft}
            maxLength={80}
            disabled={pending}
            onChange={(event) => setDraft(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setDraft(chat.title);
                setMode("idle");
              }
            }}
            className="w-full rounded-[11px] border border-coral bg-white px-3 py-2 text-[13px] text-ink outline-none ring-[3px] ring-coral-soft"
          />
        </form>
      ) : mode === "confirming" ? (
        <div
          role="group"
          aria-label={`Delete ${chat.title}`}
          className="flex items-center justify-between gap-2 rounded-[11px] bg-error-soft px-3 py-2"
        >
          <span className="truncate text-[12px] text-error">Delete chat?</span>
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={pending}
              className="rounded-full bg-error px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              disabled={pending}
              className="rounded-full px-2 py-1 text-[11px] font-medium text-muted hover:text-ink"
            >
              Cancel
            </button>
          </span>
        </div>
      ) : (
        <div
          className={`group relative flex items-center rounded-[11px] transition-colors hover:bg-white ${
            active ? "bg-white" : ""
          }`}
        >
          <Link
            href={`/chat?id=${chat.id}`}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`block min-w-0 flex-1 truncate px-3 py-2.5 text-[13px] transition-colors group-hover:text-ink ${
              active ? "text-ink" : "text-muted"
            }`}
          >
            {chat.title}
          </Link>
          <span className="flex shrink-0 items-center gap-0.5 pr-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            <button
              type="button"
              aria-label={`Rename ${chat.title}`}
              onClick={() => {
                setDraft(chat.title);
                setMode("renaming");
              }}
              className="grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-panel-3 hover:text-ink"
            >
              <Icon name="edit" size={14} />
            </button>
            <button
              type="button"
              aria-label={`Delete ${chat.title}`}
              onClick={() => setMode("confirming")}
              className="grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-error-soft hover:text-error"
            >
              <Icon name="trash" size={14} />
            </button>
          </span>
        </div>
      )}
    </motion.li>
  );
}
