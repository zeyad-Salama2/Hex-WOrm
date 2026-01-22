import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
      <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
            HexWOrm Admin Console
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900">
            Welcome to your phishing simulation dashboard
          </h1>
          <p className="text-sm text-zinc-500">
            Use the navigation below to review campaign performance, update
            templates, and manage workspace settings.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Go to dashboard
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
          >
            View login screen
          </Link>
        </div>

        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500">

          <span className="font-medium"></span> 
        </div>
      </div>
    </main>
  );
}
