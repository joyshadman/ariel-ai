import Link from "next/link";
import { getDbUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { PROVIDER_LABELS } from "@/lib/ai/types";

export const instant = false;

export default async function DashboardPage() {
  const dbUser = await getDbUser();

  const [chats, keys] = await Promise.all([
    prisma.chat.findMany({
      where: { userId: dbUser.id },
      select: { id: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.apiKey.findMany({
      where: { userId: dbUser.id },
      select: { provider: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back{dbUser.name ? `, ${dbUser.name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        {keys.length === 0
          ? "Connect a provider API key to start chatting."
          : "Choose a model and pick up where you left off."}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/chat"
          className="rounded-full bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
        >
          New chat
        </Link>
        <Link
          href="/settings"
          className="rounded-full border border-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-600"
        >
          {keys.length === 0 ? "Add API key" : "Manage keys"}
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          API keys
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(PROVIDER_LABELS) as Array<keyof typeof PROVIDER_LABELS>).map(
            (provider) => {
              const configured = keys.some(
                (key) => key.provider.toLowerCase() === provider,
              );
              return (
                <span
                  key={provider}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    configured
                      ? "border-emerald-800 bg-emerald-950/40 text-emerald-300"
                      : "border-zinc-800 text-zinc-500"
                  }`}
                >
                  {PROVIDER_LABELS[provider]}
                  {configured ? " · configured" : " · not set"}
                </span>
              );
            },
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Recent chats
        </h2>
        {chats.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No chats yet. Start one from the button above.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {chats.map((chat) => (
              <li key={chat.id}>
                <Link
                  href={`/chat?id=${chat.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-900 px-4 py-3 hover:border-zinc-700"
                >
                  <span className="truncate text-sm">{chat.title}</span>
                  <span className="ml-4 shrink-0 text-xs text-zinc-500">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}