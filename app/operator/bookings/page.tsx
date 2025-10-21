import Link from "next/link";
import { CalendarCheck, CalendarX, Clock3, Ship, ClipboardList, Inbox } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBookingStatus } from "@/lib/validators/booking";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/ui/stats-card";
import { StatusChip } from "@/components/ui/status-chip";

export default async function OperatorBookingsPage() {
  const user = await requireRole(["OPERATOR"]);

  // Fetch operator's bookings
  const bookings = await prisma.booking.findMany({
    where: {
      operatorId: user.id,
    },
    include: {
      vessel: {
        select: {
          id: true,
          slug: true,
          type: true,
          specs: true,
          homePort: true,
          media: {
            orderBy: { sort: "asc" },
            take: 1,
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      contract: true,
      escrow: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate statistics
  const stats = {
    total: bookings.length,
    requested: bookings.filter((b) => b.status === "REQUESTED").length,
    countered: bookings.filter((b) => b.status === "COUNTERED").length,
    accepted: bookings.filter((b) => b.status === "ACCEPTED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24">
      <PageHeader
        title="My Bookings"
        description="Manage your vessel booking requests and active charters"
        actions={
          <Link href="/search">
            <Button variant="outline">Browse Vessels</Button>
          </Link>
        }
      />

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Total Bookings" value={stats.total} icon={ClipboardList} variant="primary" />
        <StatsCard
          label="Requested"
          value={stats.requested}
          icon={Clock3}
          variant="info"
        />
        <StatsCard
          label="Countered"
          value={stats.countered}
          icon={CalendarCheck}
          variant="warning"
        />
        <StatsCard
          label="Accepted"
          value={stats.accepted}
          icon={Ship}
          variant="success"
        />
        <StatsCard
          label="Cancelled"
          value={stats.cancelled}
          icon={CalendarX}
          variant="default"
        />
      </section>

      {bookings.length === 0 ? (
        <Card className="slide-up flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border/70 bg-muted/30 p-12 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-2xl font-semibold text-foreground">No bookings yet</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Start by searching for vessels and requesting a booking
          </p>
          <Link href="/search">
            <Button size="lg">Browse Vessels</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const specs = booking.vessel.specs as any;
            const terms = booking.terms as any;
            const statusInfo = formatBookingStatus(booking.status);
            const thumbnail = booking.vessel.media[0]?.url || "/placeholder-vessel.jpg";

            return (
              <Card
                key={booking.id}
                className="slide-up overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Vessel Image */}
                  <div className="h-56 w-full bg-muted md:h-auto md:w-72">
                    <img
                      src={thumbnail}
                      alt={specs.name || "Vessel"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold text-foreground">
                          {specs.name || "Unnamed Vessel"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.vessel.type} • {booking.vessel.homePort}
                        </p>
                      </div>
                      <StatusChip
                        label={statusInfo.label}
                        variant={
                          statusInfo.color === "blue"
                            ? "info"
                            : statusInfo.color === "yellow"
                            ? "warning"
                            : statusInfo.color === "green"
                            ? "success"
                            : "danger"
                        }
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                          Start Date
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(booking.start).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                          End Date
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(booking.end).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                          Duration
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {Math.ceil(
                            (new Date(booking.end).getTime() -
                              new Date(booking.start).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </p>
                      </div>
                    </div>

                    {terms.purpose && (
                      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                          Purpose
                        </p>
                        <p className="mt-2 text-sm text-foreground">{terms.purpose}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                        Owner
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {booking.vessel.owner.name || booking.vessel.owner.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link href={`/operator/bookings/${booking.id}`}>
                        <Button size="lg">View Details</Button>
                      </Link>
                      {booking.status === "REQUESTED" && (
                        <Link href={`/operator/bookings/${booking.id}`}>
                          <Button variant="outline" size="lg">
                            Cancel Request
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
