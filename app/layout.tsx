import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BlueFleet",
  description: "Vessel leasing marketplace MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
