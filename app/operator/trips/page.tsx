import Link from "next/link";
import { Radar, Ship, Waves, Activity, Signal, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getVesselStatus } from "@/lib/validators/tracking";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/ui/stats-card";
import { StatusChip } from "@/components/ui/status-chip";

export default async function OperatorTripsPage() {
  const user = await requireRole(["OPERATOR"]);

  // Fetch operator's active trips (accepted bookings with funded escrow)
  const activeTrips = await prisma.booking.findMany({
    where: {
      operatorId: user.id,
      status: "ACCEPTED",
      escrow: {
        status: "FUNDED",
      },
      start: {
        lte: new Date(), // Trip has started
      },
      end: {
        gte: new Date(), // Trip hasn't ended
      },
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
        },
      },
      escrow: true,
    },
    orderBy: {
      start: "desc",
    },
  });

  // Get latest tracking event for each trip
  const tripsWithTracking = await Promise.all(
    activeTrips.map(async (trip) => {
      const latestEvent = await prisma.trackingEvent.findFirst({
        where: { vesselId: trip.vessel.id },
        orderBy: { ts: "desc" },
      });

      return {
        ...trip,
        latestTracking: latestEvent,
      };
    })
  );

  // Calculate statistics
  const stats = {
    total: activeTrips.length,
    active: tripsWithTracking.filter(
      (t) => getVesselStatus(t.latestTracking) === "ACTIVE"
    ).length,
    stale: tripsWithTracking.filter(
      (t) => getVesselStatus(t.latestTracking) === "STALE"
    ).length,
    offline: tripsWithTracking.filter(
      (t) => getVesselStatus(t.latestTracking) === "OFFLINE"
    ).length,
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24">
      <PageHeader
        title="Active Trips"
        description="Monitor your active vessel charters in real-time"
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/operator/analytics">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            <Link href="/operator/bookings">
              <Button variant="outline">Booking Requests</Button>
            </Link>
          </div>
        }
      />

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Active" value={stats.total} icon={Ship} variant="primary" />
        <StatsCard
          label="Tracking Active"
          value={stats.active}
          icon={Activity}
          variant="success"
        />
        <StatsCard
          label="Tracking Stale"
          value={stats.stale}
          icon={Radar}
          variant="warning"
        />
        <StatsCard
          label="Offline Signals"
          value={stats.offline}
          icon={Signal}
          variant="default"
        />
      </section>

      {tripsWithTracking.length === 0 ? (
        <Card className="slide-up flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border/70 bg-muted/30 p-12 text-center text-sm text-muted-foreground">
          <Waves className="h-12 w-12 text-muted-foreground" />
          <p className="text-base text-foreground">No active trips in progress</p>
          <Link href="/search">
            <Button size="lg">Browse Vessels</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tripsWithTracking.map((trip) => {
            const specs = trip.vessel.specs as any;
            const thumbnail = trip.vessel.media[0]?.url;
            const vesselStatus = getVesselStatus(trip.latestTracking);

            return (
              <Card
                key={trip.id}
                className="slide-up overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
                  {/* Vessel Image */}
                  {thumbnail && (
                    <div className="flex-shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted">
                      <img
                        src={thumbnail}
                        alt={specs.name}
                        className="h-44 w-60 object-cover"
                      />
                    </div>
                  )}

                  {/* Trip Details */}
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold text-foreground">
                          {specs.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {trip.vessel.type} • {trip.vessel.homePort}
                        </p>
                      </div>
                      <StatusChip
                        label={vesselStatus}
                        variant={
                          vesselStatus === "ACTIVE"
                            ? "success"
                            : vesselStatus === "STALE"
                            ? "warning"
                            : "muted"
                        }
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                          Charter Period
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(trip.start).toLocaleDateString()} -{" "}
                          {new Date(trip.end).toLocaleDateString()}
                        </p>
                      </div>

                      {trip.latestTracking && (
                        <>
                          <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                              Last Position
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {trip.latestTracking.lat.toFixed(4)}°,{" "}
                              {trip.latestTracking.lng.toFixed(4)}°
                            </p>
                          </div>
                          <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                              Last Update
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {new Date(trip.latestTracking.ts).toLocaleString()}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link href={`/operator/trips/${trip.id}`}>
                        <Button size="lg">
                          View Tracking
                        </Button>
                      </Link>
                      <Link href={`/operator/bookings/${trip.id}`}>
                        <Button variant="outline" size="lg">
                          Booking Details
                        </Button>
                      </Link>
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
