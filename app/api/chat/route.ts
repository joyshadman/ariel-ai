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
  createFreeModel,
  createProviderModel,
  freeTierApiKey,
  providerToDb,
  PROVIDERS,
} from "@/lib/ai/providers";
import { FREE_DAILY_LIMIT, FREE_PROVIDER } from "@/lib/ai/types";
import { claimFreeMessage, refundFreeMessage } from "@/lib/ai/usage";

export const maxDuration = 60;

const ChatRequestSchema = z.object({
  chatId: z.string().min(1).max(100),
  provider: z.enum([...PROVIDERS, FREE_PROVIDER]),
  model: z.string().min(1).max(200),
  messages: z.array(z.unknown()).min(1).max(200),
});

const FREE_HISTORY_LIMIT = 30;

function messageText(message: Pick<UIMessage, "parts">): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join(" ")
    .trim();
}

function errorMessage(error: unknown): string {
  const status =
    typeof error === "object" && error && "statusCode" in error
      ? (error as { statusCode?: number }).statusCode
      : undefined;
  if (status === 401 || status === 403) {
    return "The provider rejected the API key. Check it in Settings.";
  }
  if (status === 402) {
    return "The provider account is out of credit.";
  }
  if (status === 404) {
    return "That model isn't available for this provider.";
  }
  if (status === 429) {
    return "The provider is rate limiting requests. Try again in a moment.";
  }
  return "The model failed to respond. Please try again.";
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

  const { chatId, provider, model } = parsed.data;
  const incoming = parsed.data.messages as Array<{
    id: string;
    role: UIMessage["role"];
    parts: UIMessage["parts"];
  }>;

  const existing = await prisma.chat.findUnique({ where: { id: chatId } });
  if (existing && existing.userId !== dbUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let languageModel;
  let freeEventId: string | null = null;

  if (provider === FREE_PROVIDER) {
    const apiKey = freeTierApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "The free model is unavailable right now. Add your own key in Settings." },
        { status: 503 },
      );
    }
    const claim = await claimFreeMessage(dbUser.id);
    if (!claim.ok) {
      return NextResponse.json(
        {
          error: `You've used all ${FREE_DAILY_LIMIT} free messages for today. They reset at 00:00 UTC — or add your own API key in Settings for unlimited chats.`,
        },
        { status: 429 },
      );
    }
    freeEventId = claim.eventId;
    languageModel = createFreeModel(apiKey);
  } else {
    const storedKey = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId: dbUser.id,
          provider: providerToDb(provider),
        },
      },
    });
    if (!storedKey) {
      return NextResponse.json(
        { error: `No API key saved for ${provider}. Add one in Settings, or switch to Ariel Free.` },
        { status: 400 },
      );
    }
    languageModel = createProviderModel(provider, decryptSecret(storedKey), model);
  }

  const chat =
    existing ??
    (await prisma.chat.create({ data: { id: chatId, userId: dbUser.id } }));

  const history =
    provider === FREE_PROVIDER ? incoming.slice(-FREE_HISTORY_LIMIT) : incoming;

  const result = streamText({
    model: languageModel,
    instructions:
      "You are Ariel, a helpful, warm and concise AI assistant. Format answers in plain text with short paragraphs and simple lists.",
    maxOutputTokens: provider === FREE_PROVIDER ? 2048 : 4096,
    messages: await convertToModelMessages(
      history as Array<Omit<UIMessage, "id">>,
    ),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error("Chat stream failed", provider, errorMessage(error));
        if (freeEventId) {
          refundFreeMessage(freeEventId).catch(() => {});
          freeEventId = null;
        }
        return errorMessage(error);
      },
      onEnd: async ({ messages: generated }) => {
        try {
          const seen = new Set(incoming.map((message) => message.id));
          const all = [
            ...incoming,
            ...generated.filter(
              (message) => !seen.has(message.id) && messageText(message),
            ),
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
          const autoTitle =
            (firstUser ? messageText(firstUser).slice(0, 60) : "") ||
            "New chat";
          await prisma.chat.update({
            where: { id: chat.id },
            data:
              chat.title === "New chat"
                ? { title: autoTitle }
                : { updatedAt: new Date() },
          });
        } catch (error) {
          console.error("Failed to persist chat", error);
        }
      },
    }),
  });
}
