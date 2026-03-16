import type { ComponentPropsWithoutRef } from "react";

type PanelProps = ComponentPropsWithoutRef<"div">;

export default function Panel({ className = "", children, ...props }: PanelProps) {
  return (
    <div
      className={[
        "rounded-xl border border-[color:var(--border)] bg-[color:var(--panel2)] p-4",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
