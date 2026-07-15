import type { Metadata } from "next";
import "./globals.css";
import "./official-ui.css";

export const metadata: Metadata = {
  title: "WorkshopLM",
  description: "Turn raw thinking into finished work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
