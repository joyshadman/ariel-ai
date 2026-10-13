import Link from "next/link";
import { getAuthUser } from "@/lib/auth/dal";
import { logoutAction } from "@/app/(auth)/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-900">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-semibold tracking-tight hover:text-zinc-300"
            >
              Ariel AI
            </Link>
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <Link href="/chat" className="hover:text-zinc-100">
                Chat
              </Link>
              <Link href="/settings" className="hover:text-zinc-100">
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-zinc-500 sm:inline">
              {user?.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-zinc-400 hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="flex flex-1">{children}</main>
    </div>
  );
}