import type { Metadata } from "next";
import "@excalidraw/excalidraw/index.css";
import "@workshoplm/ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkshopLM",
  description: "Turn raw thinking into professional knowledge work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
