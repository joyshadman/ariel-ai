import { connection } from "next/server";
import type { UIMessage } from "ai";
import { avatarUrlOf, getDbUser, requireAuthUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { countFreeUsageToday } from "@/lib/ai/usage";
import type { ProviderId } from "@/lib/ai/types";
import { ChatClient } from "./chat-client";

export const metadata = {
  title: "Chat",
};

export const instant = false;

export default async function ChatPage({
  searchParams,
}: PageProps<"/chat">) {
  await connection();
  const [authUser, dbUser] = await Promise.all([requireAuthUser(), getDbUser()]);
  const { id: rawId } = await searchParams;
  const id = typeof rawId === "string" ? rawId : undefined;

  const [chats, activeChat, keys, freeUsedToday] = await Promise.all([
    prisma.chat.findMany({
      where: { userId: dbUser.id },
      select: { id: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    id
      ? prisma.chat.findFirst({
          where: { id, userId: dbUser.id },
          include: {
            messages: { orderBy: { position: "asc" } },
          },
        })
      : null,
    prisma.apiKey.findMany({
      where: { userId: dbUser.id },
      select: { provider: true },
    }),
    countFreeUsageToday(dbUser.id),
  ]);

  const initialMessages: UIMessage[] = activeChat
    ? (activeChat.messages.map((message) => ({
        id: message.id,
        role: message.role as UIMessage["role"],
        parts: message.parts as UIMessage["parts"],
      })) as UIMessage[])
    : [];

  const connectedProviders = keys.map(
    (key) => key.provider.toLowerCase() as ProviderId,
  );

  return (
    <ChatClient
      key={id ?? "new"}
      initialId={id ?? null}
      initialChats={chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        updatedAt: chat.updatedAt.toISOString(),
      }))}
      initialMessages={initialMessages}
      connectedProviders={connectedProviders}
      freeUsedToday={freeUsedToday}
      user={{
        email: dbUser.email,
        name: dbUser.name,
        avatarUrl: avatarUrlOf(authUser),
      }}
    />
  );
}
