"use client";
// Needed because we will use document.cookie and window.location

import CyberButton from "@/src/components/ui/CyberButton";

export default function Topbar() {
  // ==========================
  // Logout Function
  // ==========================
  const handleLogout = () => {
    // Delete the authentication cookie
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Redirect to login page
    window.location.href = "/login";
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
