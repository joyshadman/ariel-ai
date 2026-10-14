import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbUserOrNull } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { createServerSupabase } from "@/lib/supabase/server";

const ProfileSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export async function PATCH(req: Request) {
  const dbUser = await getDbUserOrNull();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Name must be 1–60 characters." },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id: dbUser.id },
    data: { name: parsed.data.name },
  });

  const supabase = await createServerSupabase();
  await supabase.auth.updateUser({ data: { full_name: parsed.data.name } });

  return NextResponse.json({ name: user.name });
}
