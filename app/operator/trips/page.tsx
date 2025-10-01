import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getVesselStatus } from "@/lib/validators/tracking";

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
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Active Trips</h1>
        <p className="mt-1 text-gray-600">
          Monitor your active vessel charters in real-time
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Active</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Tracking Active</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Tracking Stale</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.stale}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Offline</p>
          <p className="text-3xl font-bold text-gray-600">{stats.offline}</p>
        </Card>
      </div>

      {/* Trips List */}
      {tripsWithTracking.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No active trips</p>
          <Link href="/search">
            <Button>Browse Vessels</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tripsWithTracking.map((trip) => {
            const specs = trip.vessel.specs as any;
            const thumbnail = trip.vessel.media[0]?.url;
            const vesselStatus = getVesselStatus(trip.latestTracking);

            const statusColors = {
              ACTIVE: "bg-green-100 text-green-800",
              STALE: "bg-yellow-100 text-yellow-800",
              OFFLINE: "bg-gray-100 text-gray-800",
            };

            return (
              <Card key={trip.id} className="p-6">
                <div className="flex gap-6">
                  {/* Vessel Image */}
                  {thumbnail && (
                    <div className="flex-shrink-0">
                      <img
                        src={thumbnail}
                        alt={specs.name}
                        className="h-32 w-48 rounded-lg object-cover"
                      />
                    </div>
                  )}

                  {/* Trip Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{specs.name}</h3>
                        <p className="text-sm text-gray-600">
                          {trip.vessel.type} • {trip.vessel.homePort}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[vesselStatus]}`}
                      >
                        {vesselStatus}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-3">
                      <div>
                        <p className="text-xs text-gray-600">Charter Period</p>
                        <p className="text-sm font-medium">
                          {new Date(trip.start).toLocaleDateString()} -{" "}
                          {new Date(trip.end).toLocaleDateString()}
                        </p>
                      </div>

                      {trip.latestTracking && (
                        <>
                          <div>
                            <p className="text-xs text-gray-600">Last Position</p>
                            <p className="text-sm font-medium">
                              {trip.latestTracking.lat.toFixed(4)}°,{" "}
                              {trip.latestTracking.lng.toFixed(4)}°
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Last Update</p>
                            <p className="text-sm font-medium">
                              {new Date(trip.latestTracking.ts).toLocaleString()}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link href={`/operator/trips/${trip.id}`}>
                        <Button>View Tracking</Button>
                      </Link>
                      <Link href={`/operator/bookings/${trip.id}`}>
                        <Button variant="outline">
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

