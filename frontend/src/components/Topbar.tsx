"use client"; 
// Needed because we will use document.cookie and window.location

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
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-8">
      
      {/* Left Side - Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Overview
        </p>
        <p className="text-sm font-medium text-zinc-800">
          Admin – phishing simulation platform
        </p>
      </div>

      {/* Right Side - Logout Button */}
      <button
        onClick={handleLogout}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
      >
        Logout
      </button>

    </header>
  );
}
