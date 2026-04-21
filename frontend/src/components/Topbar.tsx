"use client";
// Needed because we will use document.cookie and window.location

import { useRouter } from "next/navigation";
import CyberButton from "@/src/components/ui/CyberButton";
import { clearAuthTokenCookie } from "@/src/lib/api/client";

export default function Topbar() {
  const router = useRouter();

  // ==========================
  // Logout Function
  // ==========================
  const handleLogout = () => {
    clearAuthTokenCookie();
    router.push("/login?logged_out=1");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--panel)] px-8">
      {/* Left Side - Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
          OVERVIEW
        </p>
        <p className="text-sm font-medium text-[color:var(--muted)]">
          Admin - phishing simulation platform
        </p>
      </div>

      {/* Right Side - Logout Button */}
      <CyberButton onClick={handleLogout}>Logout</CyberButton>
    </header>
  );
}
