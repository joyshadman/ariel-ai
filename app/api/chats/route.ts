import { NextResponse } from "next/server";
import { getDbUserOrNull } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";

export async function GET() {
  const dbUser = await getDbUserOrNull();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chats = await prisma.chat.findMany({
    where: { userId: dbUser.id },
    select: { id: true, title: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ chats });
}