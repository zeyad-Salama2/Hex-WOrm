export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Overview
        </p>
        <p className="text-sm font-medium text-zinc-800">
          Admin  – phishing simulation platform
        </p>
      </div>
    </header>
  );
}
