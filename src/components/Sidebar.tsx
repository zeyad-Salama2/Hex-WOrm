"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/campaigns", label: "Email Campaigns" },
  { href: "/templates", label: "Email Templates" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-zinc-200 bg-white px-4 py-6">
      <div className="px-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Admin control panel
        </p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900">HexWOrm</h1>
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-zinc-900 text-blue-500"
                  : "text-zinc-600 hover:bg-zinc-400 hover:text-red-500"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-lg border border-zinc-500 bg-zinc-900 p-3 text-xs text-zinc-500 ">
      </div>
    </aside>
  );
}
