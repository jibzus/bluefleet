import Link from "next/link";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  OctagonX,
  Ship,
  Users,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/ui/stats-card";
import { StatusChip } from "@/components/ui/status-chip";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  // Get user's KYC status
  const kycRecord = await prisma.kycRecord.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const roleContent = {
    ADMIN: {
      title: "Admin Dashboard",
      description: "Manage users, vessels, and platform settings",
      features: [
        "User management",
        "Vessel approvals",
        "KYC/KYB reviews",
        "Platform analytics",
        "Compliance monitoring",
      ],
    },
    OWNER: {
      title: "Owner Dashboard",
      description: "Manage your vessel fleet and bookings",
      features: [
        "List new vessels",
        "Manage vessel details",
        "View booking requests",
        "Track active leases",
        "Revenue analytics",
      ],
    },
    OPERATOR: {
      title: "Operator Dashboard",
      description: "Find and lease vessels for your operations",
      features: [
        "Search available vessels",
        "Submit booking requests",
        "Manage active leases",
        "Track vessel locations",
        "Payment history",
      ],
    },
    REGULATOR: {
      title: "Regulator Dashboard",
      description: "Monitor compliance and vessel certifications",
      features: [
        "View all vessels",
        "Compliance reports",
        "Certification tracking",
        "Audit logs",
        "Export data",
      ],
    },
  };

  const content = roleContent[user.role];

  type StatConfig = {
    label: string;
    value: string;
    icon: LucideIcon;
    variant: "default" | "success" | "warning" | "info" | "primary";
    trendLabel?: string;
    trendIcon?: LucideIcon;
  };

  const stats: StatConfig[] = [
    {
      label: "Your Role",
      value: content.title.replace(" Dashboard", ""),
      icon: Users,
      variant: "info",
    },
    {
      label: "Feature Access",
      value: `${content.features.length}+ tools`,
      icon: ClipboardCheck,
      variant: "success",
      trendLabel: "All core modules unlocked",
      trendIcon: TrendingUp,
    },
  ];

  if (user.role === "OWNER") {
    stats.push({
      label: "Active Listings",
      value: `${await prisma.vessel.count({
        where: { ownerId: user.id, status: "ACTIVE" },
      })}`,
      icon: Ship,
      variant: "primary",
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24">
      <PageHeader
        title={content.title}
        description={`Welcome back, ${user.name || user.email}`}
      />

      {/* KYC Status */}
      <section className="grid gap-4 sm:grid-cols-2">
        {!kycRecord && (
          <Card className="slide-up border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-900/20">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/80 p-3 text-amber-600 shadow-sm dark:bg-amber-900/50">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <StatusChip label="Action Required" variant="warning" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Complete Your KYC/KYB Verification
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                  Finish identity checks to unlock secure escrow, bookings, and
                  compliance dashboards.
                </p>
                <Button size="lg" asChild>
                  <Link href="/kyc">
                    Start Verification
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {kycRecord?.status === "SUBMITTED" && (
          <Card className="slide-up border-sky-200 bg-sky-50 p-6 dark:border-sky-900/40 dark:bg-sky-900/20">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/80 p-3 text-sky-600 shadow-sm dark:bg-sky-900/50">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <StatusChip label="In Review" variant="info" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Compliance Team Reviewing
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-sky-800 dark:text-sky-200">
                  Expect confirmation within 24 hours. You&apos;ll receive an
                  email once it&apos;s complete.
                </p>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/kyc/status">
                    Check Status
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {kycRecord?.status === "REJECTED" && (
          <Card className="slide-up border-rose-200 bg-rose-50 p-6 dark:border-rose-900/40 dark:bg-rose-900/20">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/80 p-3 text-rose-600 shadow-sm dark:bg-rose-900/40">
                <OctagonX className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <StatusChip label="Needs Attention" variant="danger" />
                  <h2 className="text-xl font-semibold text-foreground">
                    KYC Application Rejected
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-rose-800 dark:text-rose-100">
                  Review the feedback notes and resubmit updated documentation to
                  continue using BlueFleet.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/kyc/status">View Details</Link>
                  </Button>
                  <Button size="lg" asChild>
                    <Link href="/kyc">Resubmit Application</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {kycRecord?.status === "APPROVED" && (
          <Card className="slide-up border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-900/20">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/80 p-3 text-emerald-600 shadow-sm dark:bg-emerald-900/40">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <StatusChip label="Verified" variant="success" />
                  <h2 className="text-xl font-semibold text-foreground">
                    KYC Complete — You&apos;re Verified
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
                  Enjoy full platform access including escrow protection,
                  real-time tracking, and compliance insights.
                </p>
              </div>
            </div>
          </Card>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <StatsCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            variant={item.variant}
            trendLabel={item.trendLabel}
            trendIcon={item.trendIcon}
          />
        ))}
        <Card className="slide-up h-full rounded-2xl border border-dashed border-border/70 bg-muted/40 p-6 backdrop-blur">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-4">
              <StatusChip label="Quick Start" variant="primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                {content.description}
              </h2>
              <p className="text-sm text-muted-foreground">
                Use the shortcuts below to jump into your most common actions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {user.role === "OWNER" ? (
                <Button asChild>
                  <Link href="/owner/vessels/new">
                    List a Vessel
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/search">
                    Find Vessels
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="slide-up rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-foreground">
                Available Features
              </h2>
              <p className="text-sm text-muted-foreground">
                Tailored capabilities based on your role.
              </p>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {content.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-foreground"
              >
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="slide-up rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            Account Snapshot
          </h2>
          <dl className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <dt className="font-medium uppercase tracking-wide text-xs text-muted-foreground/80">
                Email
              </dt>
              <dd className="text-base text-foreground">{user.email}</dd>
            </div>
            <div className="space-y-1">
              <dt className="font-medium uppercase tracking-wide text-xs text-muted-foreground/80">
                Name
              </dt>
              <dd className="text-base text-foreground">
                {user.name || "Not set"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="font-medium uppercase tracking-wide text-xs text-muted-foreground/80">
                Role
              </dt>
              <dd>
                <StatusChip label={user.role} variant="primary" />
              </dd>
            </div>
          </dl>
        </Card>
      </section>

      {user.role === "ADMIN" && (
        <Card className="slide-up rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Admin Quick Links
              </h2>
              <p className="text-sm text-muted-foreground">
                Access the controls you use most frequently.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/admin/kyc">
              <Button
                variant="outline"
                className="h-auto w-full justify-between rounded-xl border-border px-5 py-4 text-left text-base font-medium text-foreground shadow-sm transition-all hover:-translate-y-1 hover:bg-muted/60"
              >
                KYC & KYB Reviews
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-auto w-full justify-between rounded-xl border-border px-5 py-4 text-left text-base font-medium text-muted-foreground shadow-sm"
              disabled
            >
              User Management
              <Lock className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-auto w-full justify-between rounded-xl border-border px-5 py-4 text-left text-base font-medium text-muted-foreground shadow-sm"
              disabled
            >
              Vessel Approvals
              <Lock className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-auto w-full justify-between rounded-xl border-border px-5 py-4 text-left text-base font-medium text-muted-foreground shadow-sm"
              disabled
            >
              Analytics
              <Lock className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <Card className="slide-up rounded-2xl border border-dashed border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>
            <strong className="font-semibold text-foreground">
              Platform roadmap:
            </strong>{" "}
            WP-1 (Auth & RBAC) and WP-2 (KYC/KYB) are live. Upcoming releases
            will introduce analytics dashboards and automated compliance alerts.
          </span>
        </p>
      </Card>
    </main>
  );
}
