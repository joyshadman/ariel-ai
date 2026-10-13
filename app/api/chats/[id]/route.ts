import { NextResponse } from "next/server";
import { getDbUserOrNull } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/chats/[id]">,
) {
  const dbUser = await getDbUserOrNull();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const chat = await prisma.chat.findFirst({
    where: { id, userId: dbUser.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!chat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    chat: { id: chat.id, title: chat.title },
    messages: chat.messages.map((message) => ({
      id: message.id,
      role: message.role,
      parts: message.parts,
    })),
  });
}