import type { ButtonHTMLAttributes } from "react";

type CyberButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function CyberButton({ className = "", type = "button", children, ...props }: CyberButtonProps) {
  return (
    <button
      type={type}
      className={[
        "rounded-full border border-[color:var(--border)] bg-[color:var(--panel2)] px-4 py-2 text-sm font-semibold text-[color:var(--text)] transition-colors duration-200 hover:border-[color:var(--accent)] hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/40",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
