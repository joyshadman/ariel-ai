import type { UIMessage } from "ai";
import { getDbUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { ChatClient } from "./chat-client";

export const metadata = {
  title: "Chat",
};

export const instant = false;

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const dbUser = await getDbUser();
  const { id } = await searchParams;

  const [chats, activeChat] = await Promise.all([
    prisma.chat.findMany({
      where: { userId: dbUser.id },
      select: { id: true, title: true },
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
  ]);

  const initialMessages: UIMessage[] | undefined = activeChat
    ? (activeChat.messages.map((message) => ({
        id: message.id,
        role: message.role as UIMessage["role"],
        parts: message.parts as UIMessage["parts"],
      })) as UIMessage[])
    : undefined;

  return (
    <div className="flex w-full">
      <ChatClient
        key={id ?? "new"}
        initialId={id ?? null}
        initialChats={chats}
        initialMessages={initialMessages}
      />
    </div>
  );
}