import Sidebar from "@/src/components/Sidebar";
import Topbar from "@/src/components/Topbar";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <div className="fixed inset-y-0 left-0 z-30 w-64 border-r border-[color:var(--border)] bg-[color:var(--panel)]">
        <Sidebar />
      </div>
      <div className="ml-64 flex min-h-screen flex-col bg-[color:var(--bg)]">
        <div className="sticky top-0 z-20 h-20 border-b border-[color:var(--border)] bg-[color:var(--panel)]">
          <Topbar />
        </div>
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-[color:var(--bg)]">{children}</main>
      </div>
    </div>
  );
}
