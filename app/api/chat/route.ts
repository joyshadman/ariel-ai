import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbUserOrNull } from "@/lib/auth/dal";
import { decryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import {
  createProviderModel,
  providerToDb,
  PROVIDERS,
} from "@/lib/ai/providers";

export const maxDuration = 60;

const ChatRequestSchema = z.object({
  chatId: z.string().min(1).max(100),
  provider: z.enum(PROVIDERS),
  model: z.string().min(1).max(200),
  messages: z.array(z.unknown()).min(1),
});

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join(" ")
    .trim();
}

export async function POST(req: Request) {
  const dbUser = await getDbUserOrNull();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const storedKey = await prisma.apiKey.findUnique({
    where: {
      userId_provider: {
        userId: dbUser.id,
        provider: providerToDb(parsed.data.provider),
      },
    },
  });

  if (!storedKey) {
    return NextResponse.json(
      { error: `No API key saved for ${parsed.data.provider}. Add one in Settings.` },
      { status: 400 },
    );
  }

  let chat = await prisma.chat.findUnique({ where: { id: parsed.data.chatId } });
  if (!chat) {
    chat = await prisma.chat.create({
      data: { id: parsed.data.chatId, userId: dbUser.id },
    });
  } else if (chat.userId !== dbUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = decryptSecret(storedKey);

  const result = streamText({
    model: createProviderModel(
      parsed.data.provider,
      apiKey,
      parsed.data.model,
    ),
    instructions:
      "You are Ariel, a helpful and concise AI assistant powered by the user's own API key.",
    maxOutputTokens: 4096,
    messages: await convertToModelMessages(
      parsed.data.messages as Array<Omit<UIMessage, "id">>,
    ),
  });

  const incoming = parsed.data.messages as Array<{
    id: string;
    role: UIMessage["role"];
    parts: UIMessage["parts"];
  }>;

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onEnd: async ({ messages: generated }) => {
        try {
          const seen = new Set(incoming.map((message) => message.id));
          const all = [
            ...incoming,
            ...generated.filter((message) => !seen.has(message.id)),
          ];
          await prisma.$transaction([
            prisma.message.deleteMany({ where: { chatId: chat.id } }),
            prisma.message.createMany({
              data: all.map((message, index) => ({
                chatId: chat.id,
                role: message.role,
                parts: message.parts as object,
                position: index,
              })),
            }),
          ]);

          const firstUser = all.find((message) => message.role === "user");
          if (firstUser) {
            const title = messageText(firstUser).slice(0, 60) || "New chat";
            await prisma.chat.update({
              where: { id: chat.id },
              data: { title },
            });
          }
        } catch (error) {
          console.error("Failed to persist chat", error);
        }
      },
    }),
  });
}