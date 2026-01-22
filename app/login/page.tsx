export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Admin Access
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Sign in to HexWOrm
          </h1>
          <p className="text-sm text-zinc-500">
            Use your operator credentials to manage campaigns and templates.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border  -dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500">
          login is not yet implemented.
          </div>
          <button className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-800">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
