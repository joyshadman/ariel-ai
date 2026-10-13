import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">Ariel AI</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-zinc-300 hover:text-zinc-50">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-zinc-50 px-4 py-2 font-medium text-zinc-900 hover:bg-zinc-200"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Bring your own key
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
          Chat with any model.
          <br />
          <span className="text-zinc-500">Your key. Your data.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
          Ariel connects OpenAI, Anthropic, Google Gemini, or OpenRouter with
          your own API key. Private, pay-as-you-go — no subscriptions, no
          inference marked up on top of your own usage.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-zinc-50 px-6 py-3 font-medium text-zinc-900 hover:bg-zinc-200"
          >
            Start chatting
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-zinc-800 px-6 py-3 font-medium text-zinc-300 hover:border-zinc-600 hover:text-zinc-50"
          >
            Sign in
          </Link>
        </div>

        <ul className="mt-20 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
          {["OpenAI", "Anthropic", "Google Gemini", "OpenRouter"].map(
            (provider) => (
              <li
                key={provider}
                className="rounded-full border border-zinc-800 px-4 py-2"
              >
                {provider}
              </li>
            ),
          )}
        </ul>
      </main>
    </div>
  );
}