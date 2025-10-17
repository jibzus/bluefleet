import { AppShell } from "@/components/layout/AppShell";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

