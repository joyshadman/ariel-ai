"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icon, type IconName } from "@/components/Icon";
import { useNavigation } from "@/components/navigation";
import {
  DEFAULT_MODELS,
  FREE_DAILY_LIMIT,
  FREE_MODEL,
  FREE_PROVIDER,
  freeMessagesRemaining,
  PROVIDERS,
  PROVIDER_LABELS,
  type ChatProviderId,
  type ProviderId,
} from "@/lib/ai/types";
import { ChatSidebar, type ChatSummary, type SidebarUser } from "./chat-sidebar";

type Props = {
  initialId: string | null;
  initialChats: ChatSummary[];
  initialMessages: UIMessage[];
  connectedProviders: ProviderId[];
  freeUsedToday: number;
  user: SidebarUser;
};

type Choice = {
  id: string;
  provider: ChatProviderId;
  model: string;
  label: string;
  hint: string;
};

const choices: Choice[] = [
  {
    id: "free",
    provider: FREE_PROVIDER,
    model: FREE_MODEL,
    label: "Ariel Free",
    hint: `gpt-oss-120b · ${FREE_DAILY_LIMIT}/day`,
  },
  ...PROVIDERS.map((provider) => ({
    id: provider,
    provider,
    model: DEFAULT_MODELS[provider],
    label: PROVIDER_LABELS[provider],
    hint: DEFAULT_MODELS[provider],
  })),
];

const STORAGE_KEY = "ariel:choice";
const CHOICE_EVENT = "ariel:choice-change";

const suggestions: {
  icon: IconName;
  title: string;
  body: string;
  prompt: string;
}[] = [
  {
    icon: "brain",
    title: "Summarise a document",
    body: "Turn a long thread into the five things that matter.",
    prompt: "Summarise the key points of a long document for me.",
  },
  {
    icon: "send",
    title: "Draft a message",
    body: "Write a warm, concise email in your own voice.",
    prompt: "Help me draft a friendly follow-up email.",
  },
  {
    icon: "spark",
    title: "Explain a concept",
    body: "Get a plain-language answer with a good analogy.",
    prompt: "Explain how vector embeddings work, simply.",
  },
  {
    icon: "check",
    title: "Plan my week",
    body: "Shape scattered tasks into a calm, ordered plan.",
    prompt: "Help me plan a focused, realistic week.",
  },
];

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join("");
}

function subscribeToChoice(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHOICE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHOICE_EVENT, callback);
  };
}

function getChoiceSnapshot(): string {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && choices.some((choice) => choice.id === stored)
    ? stored
    : "free";
}

function useStoredChoice() {
  const value = useSyncExternalStore(
    subscribeToChoice,
    getChoiceSnapshot,
    () => "free",
  );

  const update = useCallback((next: string) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHOICE_EVENT));
  }, []);

  return [value, update] as const;
}

export function ChatClient({
  initialId,
  initialChats,
  initialMessages,
  connectedProviders,
  freeUsedToday,
  user,
}: Props) {
  const { navigate } = useNavigation();
  const router = useRouter();
  const chatId = useRef(initialId ?? crypto.randomUUID());
  const [input, setInput] = useState("");
  const [choiceId, setChoiceId] = useStoredChoice();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(initialId);
  const [renamed, setRenamed] = useState<Record<string, string>>({});
  const [deleted, setDeleted] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, setMessages, stop, clearError } =
    useChat({
      id: initialId ?? "new",
      messages: initialMessages,
      transport: new DefaultChatTransport({ api: "/api/chat" }),
      onFinish: () => router.refresh(),
    });

  const busy = status === "streaming" || status === "submitted";
  const choice = choices.find((item) => item.id === choiceId) ?? choices[0];
  const chats = useMemo(
    () =>
      initialChats
        .filter((chat) => !deleted.includes(chat.id))
        .map((chat) => ({ ...chat, title: renamed[chat.id] ?? chat.title })),
    [initialChats, deleted, renamed],
  );
  const freeRemaining = freeMessagesRemaining(freeUsedToday);
  const isFree = choice.provider === FREE_PROVIDER;
  const needsKey =
    !isFree && !connectedProviders.includes(choice.provider as ProviderId);
  const outOfFree = isFree && freeRemaining === 0;
  const blocked = needsKey || outOfFree;
  const options = useMemo(
    () =>
      choices.map((option) =>
        option.id === "free"
          ? {
              ...option,
              hint: `${freeRemaining} of ${FREE_DAILY_LIMIT} left today`,
            }
          : option,
      ),
    [freeRemaining],
  );
  const errorText = useMemo(() => {
    if (!error) return null;
    try {
      const parsed = JSON.parse(error.message) as { error?: string };
      return parsed.error ?? error.message;
    } catch {
      return error.message;
    }
  }, [error]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  function send(raw: string) {
    const text = raw.trim();
    if (!text || busy || blocked) return;
    setActiveId(chatId.current);
    sendMessage(
      { text },
      {
        body: {
          chatId: chatId.current,
          provider: choice.provider,
          model: choice.model,
        },
      },
    );
    setInput("");
  }

  function newChat() {
    chatId.current = crypto.randomUUID();
    setActiveId(null);
    setMessages([]);
    clearError();
    setInput("");
    router.replace("/chat");
  }

  async function renameChat(id: string, title: string) {
    setRenamed((prev) => ({ ...prev, [id]: title }));
    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Couldn't rename the chat.");
      }
      toast.success("Chat renamed.");
      router.refresh();
      return true;
    } catch (failure) {
      setRenamed((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.error(
        failure instanceof Error ? failure.message : "Couldn't rename the chat.",
      );
      return false;
    }
  }

  async function deleteChat(id: string) {
    try {
      const res = await fetch(`/api/chats/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Couldn't delete the chat.");
      }
      setDeleted((prev) => [...prev, id]);
      toast.success("Chat deleted.");
      if (id === activeId || id === chatId.current) {
        newChat();
      } else {
        router.refresh();
      }
      return true;
    } catch (failure) {
      toast.error(
        failure instanceof Error ? failure.message : "Couldn't delete the chat.",
      );
      return false;
    }
  }

  const sidebar = (onNavigate?: () => void) => (
    <ChatSidebar
      chats={chats}
      activeId={activeId}
      user={user}
      freeRemaining={freeRemaining}
      onNewChat={newChat}
      onRename={renameChat}
      onDelete={deleteChat}
      onNavigate={onNavigate}
    />
  );

  const lastMessage = messages[messages.length - 1];
  const showTyping =
    busy && (!lastMessage || lastMessage.role === "user" || !messageText(lastMessage));

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-paper">
      <aside className="hidden w-[270px] shrink-0 border-r border-line bg-panel min-[700px]:block">
        {sidebar()}
      </aside>

      <AnimatePresence>
        {drawerOpen ? (
          <div className="fixed inset-0 z-50 min-[700px]:hidden">
            <motion.button
              type="button"
              aria-label="Close conversations"
              onClick={() => setDrawerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/30"
            />
            <motion.aside
              role="dialog"
              aria-label="Conversations"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute inset-y-0 left-0 w-[290px] max-w-[85vw] border-r border-line bg-panel shadow-[0_25px_65px_rgba(63,48,43,.16)]"
            >
              {sidebar(() => setDrawerOpen(false))}
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-line bg-paper/85 px-4 backdrop-blur-md min-[700px]:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open conversations"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink min-[700px]:hidden"
            >
              <Icon name="menu" size={16} />
            </button>
            <button
              type="button"
              aria-label="New conversation"
              onClick={newChat}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink min-[700px]:hidden"
            >
              <Icon name="plus" size={16} />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-display text-[18px] tracking-[-.01em] text-ink">
                Ariel 1.0
              </span>
              <span className="rounded-full bg-coral-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[.14em] text-coral-dark">
                Beta
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              aria-label="Open settings"
              onClick={() => navigate("settings")}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink min-[700px]:hidden"
            >
              <Icon name="key" size={15} />
            </button>
            <button
              type="button"
              aria-label="Choose model"
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[12px] font-medium text-ink transition-colors hover:border-coral"
            >
              <Icon name="brain" size={15} className="text-coral" />
              <span className="hidden min-[520px]:inline">{choice.label}</span>
              <span className="min-[520px]:hidden">Model</span>
            </button>
            <AnimatePresence>
              {pickerOpen ? (
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+8px)] z-30 w-[280px] overflow-hidden rounded-[15px] border border-line bg-white p-1.5 shadow-[0_25px_65px_rgba(63,48,43,.16)]"
                >
                  {options.map((option) => {
                    const connected =
                      option.provider === FREE_PROVIDER ||
                      connectedProviders.includes(option.provider as ProviderId);
                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setChoiceId(option.id);
                            setPickerOpen(false);
                          }}
                          className={`flex w-full items-start justify-between gap-3 rounded-[11px] px-3 py-2.5 text-left transition-colors ${
                            option.id === choice.id
                              ? "bg-coral-soft"
                              : "hover:bg-panel-3"
                          }`}
                        >
                          <span className="flex flex-col">
                            <span className="text-[12px] font-medium text-ink">
                              {option.label}
                            </span>
                            <span className="text-[11px] text-muted">
                              {option.hint}
                              {!connected ? " · add key" : ""}
                            </span>
                          </span>
                          {option.id === choice.id ? (
                            <Icon
                              name="check"
                              size={14}
                              className="mt-0.5 text-coral-dark"
                            />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              ) : null}
            </AnimatePresence>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-4 pb-40 pt-8 min-[700px]:px-6">
            {messages.length === 0 && !busy ? (
              <Welcome onPick={send} />
            ) : (
              <>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className={
                      message.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div
                      className={`max-w-[86%] whitespace-pre-wrap rounded-[17px] px-4 py-3 text-[13px] leading-6 min-[700px]:max-w-[76%] ${
                        message.role === "user"
                          ? "bg-ink text-white"
                          : "border border-line bg-white text-ink"
                      }`}
                    >
                      {messageText(message)}
                    </div>
                  </motion.div>
                ))}
                {showTyping ? <TypingDots /> : null}
              </>
            )}
          </div>
        </div>

        {blocked && !error ? (
          <div className="px-4 pb-28 min-[700px]:px-6">
            <div
              role="status"
              className="mx-auto flex w-full max-w-[720px] flex-wrap items-center justify-between gap-3 rounded-[13px] border border-line bg-coral-soft px-4 py-3 text-[12px] leading-5 text-coral-dark"
            >
              <span>
                {outOfFree
                  ? `You've used all ${FREE_DAILY_LIMIT} free messages today. They reset at 00:00 UTC.`
                  : `No ${choice.label} key saved yet.`}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {needsKey ? (
                  <button
                    type="button"
                    onClick={() => setChoiceId("free")}
                    className="font-medium underline"
                  >
                    Use Ariel Free
                  </button>
                ) : null}
                <Link href="/settings" className="font-medium underline">
                  Add an API key
                </Link>
              </span>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="px-4 pb-2 min-[700px]:px-6">
            <div className="mx-auto mb-24 flex w-full max-w-[720px] items-start justify-between gap-3 rounded-[13px] border border-error-soft bg-error-soft px-4 py-3 text-[12px] leading-5 text-error">
              <span>{errorText}</span>
              <button
                type="button"
                onClick={clearError}
                className="shrink-0 font-medium underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6 min-[700px]:px-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="pointer-events-auto flex w-full max-w-[720px] items-end gap-2 rounded-[17px] border border-line bg-white p-2 shadow-[0_25px_65px_rgba(63,48,43,.16)] transition-colors focus-within:border-coral focus-within:ring-[3px] focus-within:ring-coral-soft"
          >
            <label htmlFor="composer" className="sr-only">
              Message Ariel
            </label>
            <textarea
              id="composer"
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
              disabled={blocked}
              placeholder={blocked ? "Choose another model to continue…" : "Ask Ariel anything…"}
              className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] text-ink outline-none placeholder:text-muted"
            />
            {busy ? (
              <button
                type="button"
                aria-label="Stop generating"
                onClick={() => stop()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-coral"
              >
                <Icon name="trash" size={16} />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || blocked}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-white transition-opacity disabled:opacity-40"
              >
                <Icon name="send" size={17} />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function Welcome({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      className="flex flex-col items-center pt-10 text-center min-[700px]:pt-16"
    >
      <motion.span
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="grid h-16 w-16 place-items-center rounded-full bg-coral-soft text-coral"
      >
        <Icon name="spark" size={28} />
      </motion.span>
      <motion.h1
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="mt-5 font-display text-[34px] leading-tight tracking-[-.025em] text-ink min-[700px]:text-[44px]"
      >
        Where shall we begin?
      </motion.h1>
      <motion.p
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="mt-3 max-w-[420px] text-[14px] leading-7 text-muted"
      >
        Start free with the built-in model, or bring your own key for unlimited
        chats. Your key, your models, your pace.
      </motion.p>

      <div className="mt-10 grid w-full gap-3 min-[700px]:grid-cols-2">
        {suggestions.map((suggestion) => (
          <motion.button
            key={suggestion.title}
            type="button"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => onPick(suggestion.prompt)}
            className="flex items-start gap-3 rounded-[18px] border border-line bg-white p-4 text-left transition-shadow hover:shadow-[0_25px_65px_rgba(63,48,43,.12)]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-coral-soft text-coral-dark">
              <Icon name={suggestion.icon} size={18} />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[13px] font-medium text-ink">
                {suggestion.title}
              </span>
              <span className="text-[12px] leading-5 text-muted">
                {suggestion.body}
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-[17px] border border-line bg-white px-4 py-4">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="h-2 w-2 rounded-full bg-muted"
            initial={{ y: 0, opacity: 0.4 }}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
