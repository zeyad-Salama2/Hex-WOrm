import Sidebar from "@/src/components/Sidebar";
import Topbar from "@/src/components/Topbar";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Sidebar />
      <div className="flex min-h-screen flex-col pl-64">
        <Topbar />
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
