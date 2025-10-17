import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Authentication | BlueFleet",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AppShell hideNavigation>{children}</AppShell>;
}

