import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrackingDashboard } from "@/components/tracking/TrackingDashboard";

export default async function TripTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRole(["OPERATOR"]);

  // Fetch booking with tracking data
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      vessel: {
        include: {
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
  });

  if (!booking) {
    notFound();
  }

  // Check authorization
  if (booking.operatorId !== user.id) {
    notFound();
  }

  const specs = booking.vessel.specs as any;

  return (
    <main className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/operator/trips"
            className="text-sm text-blue-600 hover:underline mb-2 block"
          >
            ← Back to Active Trips
          </Link>
          <h1 className="text-3xl font-bold">{specs.name}</h1>
          <p className="mt-1 text-gray-600">
            {booking.vessel.type} • {booking.vessel.homePort}
          </p>
        </div>
        <Link href={`/operator/bookings/${booking.id}`}>
          <Button variant="outline">View Booking Details</Button>
        </Link>
      </div>

      {/* Charter Info */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Charter Information</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600">Charter Period</p>
            <p className="font-medium">
              {new Date(booking.start).toLocaleDateString()} -{" "}
              {new Date(booking.end).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Days Remaining</p>
            <p className="font-medium">
              {Math.ceil(
                (new Date(booking.end).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Escrow Status</p>
            <p className="font-medium">{booking.escrow?.status || "N/A"}</p>
          </div>
        </div>
      </Card>

      {/* Tracking Dashboard */}
      <TrackingDashboard
        vesselId={booking.vessel.id}
        bookingId={booking.id}
        vesselName={specs.name}
      />
    </main>
  );
}

