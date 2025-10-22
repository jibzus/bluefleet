import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { NavLink } from "./NavLink";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

type NavConfig = {
  label: string;
  href: string;
  roles?: Role[];
  exact?: boolean;
};

const sharedNav: NavConfig[] = [
  { label: "Dashboard", href: "/dashboard", roles: ["ADMIN", "OWNER", "OPERATOR", "REGULATOR"] },
  { label: "Search", href: "/search" },
];

const roleSpecificNav: Record<Role, NavConfig[]> = {
  ADMIN: [
    { label: "Admin", href: "/admin" },
    { label: "Compliance", href: "/compliance" },
  ],
  OWNER: [
    { label: "Vessels", href: "/owner/vessels" },
    { label: "Booking Requests", href: "/owner/bookings" },
  ],
  OPERATOR: [
    { label: "Bookings", href: "/operator/bookings" },
    { label: "Trips", href: "/operator/trips" },
    { label: "Analytics", href: "/operator/analytics" },
  ],
  REGULATOR: [{ label: "Compliance", href: "/compliance" }],
};

interface AppShellProps {
  children: React.ReactNode;
  hideNavigation?: boolean;
  className?: string;
}

function buildNav(role?: Role | null) {
  const roleNav = role ? roleSpecificNav[role] ?? [] : [];
  const items: NavConfig[] = [];

  sharedNav.forEach((item) => {
    if (item.roles && role && !item.roles.includes(role)) {
      return;
    }
    if (!role && item.roles?.length) {
      return;
    }
    items.push(item);
  });

  roleNav.forEach((item) => {
    if (!items.find((existing) => existing.href === item.href)) {
      items.push(item);
    }
  });

  if (!items.length) {
    items.push({ label: "Home", href: "/" });
    items.push({ label: "Search", href: "/search" });
  }

  return items;
}

export async function AppShell({
  children,
  hideNavigation,
  className,
}: AppShellProps) {
  const user = await getCurrentUser();
  const navItems = hideNavigation ? [] : buildNav(user?.role ?? null);

  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      {!hideNavigation ? (
        <header className="border-b bg-card">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-lg font-semibold">
                BlueFleet
              </Link>
              <nav className="hidden items-center gap-1 md:flex">
                {navItems.map((item) => (
                  <NavLink key={item.href} href={item.href} exact={item.exact}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <>
                  <span className="hidden text-sm text-muted-foreground md:block">
                    {user.name || user.email}
                  </span>
                  <form action={signOutAction}>
                    <Button variant="outline" size="sm">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/signin">
                    <Button variant="ghost" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Create account</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
      ) : null}

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
