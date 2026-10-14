import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbUserOrNull } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";

const RenameSchema = z.object({
  title: z.string().trim().min(1).max(80),
});

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
      messages: { orderBy: { position: "asc" } },
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

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/chats/[id]">,
) {
  const dbUser = await getDbUserOrNull();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = RenameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Title must be 1–80 characters." },
      { status: 400 },
    );
  }

  const { id } = await ctx.params;
  const { count } = await prisma.chat.updateMany({
    where: { id, userId: dbUser.id },
    data: { title: parsed.data.title },
  });

  if (count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ chat: { id, title: parsed.data.title } });
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/chats/[id]">,
) {
  const dbUser = await getDbUserOrNull();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { count } = await prisma.chat.deleteMany({
    where: { id, userId: dbUser.id },
  });

  if (count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
