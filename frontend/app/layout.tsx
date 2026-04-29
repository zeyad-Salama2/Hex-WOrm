import type { Metadata } from "next";
import type { ReactNode } from "react";
import QueryProvider from "@/src/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hex-WOrm",
  description: "Phishing simulation dashboard for managing campaigns and tracking results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
