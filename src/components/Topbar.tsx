export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Overview
        </p>
        <p className="text-sm font-medium text-zinc-800">
          Welcome back, operations team
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-300 hover:text-zinc-900">
          Invite
        </button>
        <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-2 text-xs font-semibold text-white">
          HW
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
        </div>
      </div>
    </header>
  );
}
