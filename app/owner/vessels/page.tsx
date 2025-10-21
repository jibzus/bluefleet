import Link from "next/link";
import { redirect } from "next/navigation";
import { Ship, CheckCircle2, ClipboardList, Wrench, TrendingUp } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/ui/stats-card";
import { StatusChip } from "@/components/ui/status-chip";

export default async function OwnerVesselsPage() {
  const user = await requireRole(["OWNER", "ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  const vessels = await prisma.vessel.findMany({
    where: { ownerId: user.id },
    include: {
      media: {
        orderBy: { sort: "asc" },
        take: 1,
      },
      certs: true,
      availability: true,
      bookings: {
        where: {
          status: {
            in: ["REQUESTED", "ACCEPTED"],
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalVessels = vessels.length;
  const activeVessels = vessels.filter((v) => v.status === "ACTIVE").length;
  const draftVessels = vessels.filter((v) => v.status === "DRAFT").length;
  const totalBookings = vessels.reduce((sum, v) => sum + v.bookings.length, 0);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24">
      <PageHeader
        title="My Vessels"
        description="Manage your vessel listings and availability"
        actions={
          <Link href="/owner/vessels/new">
            <Button size="lg">+ Add New Vessel</Button>
          </Link>
        }
      />

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Vessels" value={totalVessels} icon={Ship} variant="primary" />
        <StatsCard label="Active" value={activeVessels} icon={CheckCircle2} variant="success" />
        <StatsCard label="Draft" value={draftVessels} icon={Wrench} variant="warning" />
        <StatsCard
          label="Open Bookings"
          value={totalBookings}
          icon={ClipboardList}
          variant="info"
        />
      </section>

      {vessels.length === 0 ? (
        <Card className="slide-up flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border/70 bg-muted/30 p-12 text-center">
          <Ship className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">No vessels yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Get started by adding your first vessel listing.
          </p>
          <Link href="/owner/vessels/new">
            <Button size="lg">+ Add Your First Vessel</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vessels.map((vessel) => {
            const specs = vessel.specs as Record<string, any>;
            const pricing = specs.pricing || {};
            const thumbnail = vessel.media[0]?.url || "/placeholder-vessel.jpg";

            return (
              <Card
                key={vessel.id}
                className="slide-up overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 bg-muted">
                  <img
                    src={thumbnail}
                    alt={specs.name || "Vessel"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-4 top-4">
                    <StatusChip
                      label={vessel.status}
                      variant={
                        vessel.status === "ACTIVE"
                          ? "success"
                          : vessel.status === "DRAFT"
                          ? "warning"
                          : "muted"
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-5 p-6 sm:p-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {specs.name || "Unnamed Vessel"}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <InfoRow label="Type" value={vessel.type} />
                      <InfoRow label="Home Port" value={vessel.homePort || "N/A"} />
                      {pricing.dailyRate ? (
                        <InfoRow
                          label="Day Rate"
                          value={`${pricing.currency || "USD"} ${pricing.dailyRate.toLocaleString()}/day`}
                        />
                      ) : null}
                      <InfoRow
                        label="Active Bookings"
                        value={vessel.bookings.length.toString()}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/owner/vessels/${vessel.id}`} className="flex-1">
                      <Button variant="outline" size="lg" className="w-full">
                        Edit Listing
                      </Button>
                    </Link>
                    <Link href={`/vessel/${vessel.slug}`} className="flex-1">
                      <Button variant="ghost" size="lg" className="w-full">
                        Preview
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {vessels.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="slide-up rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Bulk Update Availability
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Update availability for multiple vessels at once.
            </p>
            <Button variant="outline" size="lg" className="w-full" disabled>
              Coming Soon
            </Button>
          </Card>
          <Card className="slide-up rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Export Vessel Data
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Download your vessel listings as CSV.
            </p>
            <Button variant="outline" size="lg" className="w-full" disabled>
              Export CSV
            </Button>
          </Card>
          <Card className="slide-up rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Performance Analytics
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              View booking rates and revenue insights.
            </p>
            <Link href="/owner/analytics">
              <Button variant="outline" size="lg" className="w-full" disabled>
                View Analytics
              </Button>
            </Link>
          </Card>
        </section>
      ) : null}
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium text-foreground/80">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
