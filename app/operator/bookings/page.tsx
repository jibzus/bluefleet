import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBookingStatus } from "@/lib/validators/booking";

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
    <main className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Bookings</h1>
        <p className="text-gray-600">
          Manage your vessel booking requests and active charters
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid gap-4 md:grid-cols-5">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Requested</p>
          <p className="text-2xl font-bold text-blue-600">{stats.requested}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Countered</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.countered}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Accepted</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </Card>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mb-4 text-6xl">📋</div>
          <h3 className="mb-2 text-xl font-semibold">No bookings yet</h3>
          <p className="mb-6 text-gray-600">
            Start by searching for vessels and requesting a booking
          </p>
          <Link href="/search">
            <Button>Browse Vessels</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const specs = booking.vessel.specs as any;
            const terms = booking.terms as any;
            const statusInfo = formatBookingStatus(booking.status);
            const thumbnail = booking.vessel.media[0]?.url || "/placeholder-vessel.jpg";

            return (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Vessel Image */}
                  <div className="h-48 w-full bg-gray-200 md:h-auto md:w-64">
                    <img
                      src={thumbnail}
                      alt={specs.name || "Vessel"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="mb-1 text-xl font-semibold">
                          {specs.name || "Unnamed Vessel"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.vessel.type} • {booking.vessel.homePort}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusInfo.color === "blue"
                            ? "bg-blue-100 text-blue-800"
                            : statusInfo.color === "yellow"
                            ? "bg-yellow-100 text-yellow-800"
                            : statusInfo.color === "green"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="mb-4 grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium">
                          {new Date(booking.start).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium">
                          {new Date(booking.end).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">
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
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Purpose</p>
                        <p className="text-sm">{terms.purpose}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Owner</p>
                      <p className="text-sm font-medium">
                        {booking.vessel.owner.name || booking.vessel.owner.email}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/operator/bookings/${booking.id}`}>
                        <Button>View Details</Button>
                      </Link>
                      {booking.status === "REQUESTED" && (
                        <Link href={`/operator/bookings/${booking.id}`}>
                          <Button variant="outline">Cancel Request</Button>
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

