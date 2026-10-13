import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDbUserOrNull } from "@/lib/auth/dal";
import { encryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { PROVIDERS, providerToDb } from "@/lib/ai/providers";

const KeySchema = z.object({
  provider: z.enum(PROVIDERS),
  apiKey: z.string().min(1).max(512),
  label: z.string().max(100).optional(),
});

export async function GET() {
  const dbUser = await getDbUserOrNull();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: dbUser.id },
    select: {
      provider: true,
      label: true,
      lastFour: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    keys: keys.map((key) => ({
      provider: key.provider.toLowerCase(),
      label: key.label,
      lastFour: key.lastFour,
      createdAt: key.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const dbUser = await getDbUserOrNull();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = KeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const encrypted = encryptSecret(parsed.data.apiKey);

  await prisma.apiKey.upsert({
    where: {
      userId_provider: {
        userId: dbUser.id,
        provider: providerToDb(parsed.data.provider),
      },
    },
    update: {
      ...encrypted,
      label: parsed.data.label,
      lastFour: parsed.data.apiKey.slice(-4),
    },
    create: {
      userId: dbUser.id,
      provider: providerToDb(parsed.data.provider),
      ...encrypted,
      label: parsed.data.label,
      lastFour: parsed.data.apiKey.slice(-4),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const dbUser = await getDbUserOrNull();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = req.nextUrl.searchParams.get("provider");
  if (!provider || !(PROVIDERS as readonly string[]).includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  await prisma.apiKey.deleteMany({
    where: {
      userId: dbUser.id,
      provider: providerToDb(provider as (typeof PROVIDERS)[number]),
    },
  });

  return NextResponse.json({ ok: true });
}