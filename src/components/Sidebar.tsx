"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/campaigns", label: "Email Campaigns", icon: CampaignsIcon },
  { href: "/templates", label: "Email Templates", icon: TemplatesIcon },
  { href: "/reports", label: "Reports", icon: ReportsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z"
        fill="currentColor"
      />
    </svg>
  );
}

function CampaignsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2v.4l8 5 8-5V7H4zm16 10V9.6l-7.5 4.7a1 1 0 0 1-1 0L4 9.6V17h16z"
        fill="currentColor"
      />
    </svg>
  );
}

function TemplatesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 4h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"
        fill="currentColor"
      />
    </svg>
  );
}

function ReportsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 19h16v2H4v-2zm2-2h3V7H6v10zm5 0h3V3h-3v14zm5 0h3v-8h-3v8z"
        fill="currentColor"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm8.4 3.1-.9-.3a7.9 7.9 0 0 0-.6-1.4l.5-.8a1 1 0 0 0-.2-1.3l-1.4-1.4a1 1 0 0 0-1.3-.2l-.8.5a7.9 7.9 0 0 0-1.4-.6l-.3-.9a1 1 0 0 0-1-.7h-2a1 1 0 0 0-1 .7l-.3.9a7.9 7.9 0 0 0-1.4.6l-.8-.5a1 1 0 0 0-1.3.2L4.8 7.8a1 1 0 0 0-.2 1.3l.5.8a7.9 7.9 0 0 0-.6 1.4l-.9.3a1 1 0 0 0-.7 1v2a1 1 0 0 0 .7 1l.9.3c.2.5.3 1 .6 1.4l-.5.8a1 1 0 0 0 .2 1.3l1.4 1.4a1 1 0 0 0 1.3.2l.8-.5c.5.2 1 .4 1.4.6l.3.9a1 1 0 0 0 1 .7h2a1 1 0 0 0 1-.7l.3-.9c.5-.2 1-.3 1.4-.6l.8.5a1 1 0 0 0 1.3-.2l1.4-1.4a1 1 0 0 0 .2-1.3l-.5-.8c.2-.5.4-1 .6-1.4l.9-.3a1 1 0 0 0 .7-1v-2a1 1 0 0 0-.7-1z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-70 flex-col border-r border-zinc-200 bg-white px-4 py-6">
      <div className="px-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Admin control panel
        </p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900">HexWOrm</h1>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={[
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              ].join(" ")}
            >
              <Icon className="mr-3 h-4 w-4 text-current" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500">
        Logged in as <span className="font-medium text-zinc-700">Operator</span>
      </div>
    </aside>
  );
}
