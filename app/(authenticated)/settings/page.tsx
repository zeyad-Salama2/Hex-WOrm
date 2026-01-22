export default function SettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Settings</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Manage workspace preferences, integrations, and permissions.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
        Coming next: sender domains, role management, and API tokens.
      </div>
    </section>
  );
}
