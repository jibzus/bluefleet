import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBookingStatus, calculateBookingCost } from "@/lib/validators/booking";
import { BookingActions } from "@/components/booking/BookingActions";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function OwnerBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRole(["OWNER"]);

  // Fetch booking
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      vessel: {
        include: {
          media: {
            orderBy: { sort: "asc" },
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
      operator: {
        select: {
          id: true,
          name: true,
          email: true,
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
  if (booking.vessel.owner.id !== user.id) {
    notFound();
  }

  const specs = booking.vessel.specs as any;
  const pricing = specs.pricing || {};
  const terms = booking.terms as any;
  const statusInfo = formatBookingStatus(booking.status);
  const thumbnail = booking.vessel.media[0]?.url || "/placeholder-vessel.jpg";
  const statusBadgeClass =
    statusInfo.color === "blue"
      ? "bg-blue-100 text-blue-800"
      : statusInfo.color === "yellow"
      ? "bg-yellow-100 text-yellow-800"
      : statusInfo.color === "green"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  // Calculate cost
  const cost = calculateBookingCost(
    pricing.dailyRate || 0,
    booking.start,
    booking.end,
    pricing.securityDeposit || 0
  );

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            <span>Booking Request</span>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusBadgeClass}`}>
              {statusInfo.label}
            </span>
          </span>
        }
        description={statusInfo.description}
        backHref="/owner/bookings"
        backLabel="Back to Booking Requests"
        breadcrumbs={[
          { label: "Booking Requests", href: "/owner/bookings" },
          { label: specs.name || "Request" },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Vessel Info */}
          <Card className="mb-6 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="h-48 w-full bg-gray-200 md:h-auto md:w-64">
                <img
                  src={thumbnail}
                  alt={specs.name || "Vessel"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="mb-2 text-xl font-semibold">
                  {specs.name || "Unnamed Vessel"}
                </h2>
                <p className="mb-4 text-gray-600">
                  {booking.vessel.type} • {booking.vessel.homePort}
                </p>
                <Link href={`/vessel/${booking.vessel.slug}`}>
                  <Button variant="outline">View Vessel Details</Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Booking Period */}
          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-xl font-semibold">Requested Period</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="text-lg font-medium">
                  {new Date(booking.start).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="text-lg font-medium">
                  {new Date(booking.end).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-medium">{cost.days} days</p>
              </div>
            </div>
          </Card>

          {/* Operator Request Details */}
          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-xl font-semibold">Request Details</h2>
            <div className="space-y-4">
              {terms.purpose && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Purpose</p>
                  <p className="mt-1">{terms.purpose}</p>
                </div>
              )}
              {terms.cargoType && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Cargo Type</p>
                  <p className="mt-1">{terms.cargoType}</p>
                </div>
              )}
              {terms.route && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Route</p>
                  <p className="mt-1">{terms.route}</p>
                </div>
              )}
              {terms.estimatedCrew && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Estimated Crew</p>
                  <p className="mt-1">{terms.estimatedCrew} members</p>
                </div>
              )}
              {terms.specialRequirements && (
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Special Requirements
                  </p>
                  <p className="mt-1">{terms.specialRequirements}</p>
                </div>
              )}
              {terms.customClauses && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Custom Clauses</p>
                  <p className="mt-1">{terms.customClauses}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          {terms.history && terms.history.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Negotiation History</h2>
              <div className="space-y-4">
                {terms.history.map((entry: any, index: number) => (
                  <div key={index} className="border-l-2 border-gray-300 pl-4">
                    <p className="text-sm text-gray-600">
                      {new Date(entry.updatedAt).toLocaleString()}
                    </p>
                    {entry.note && <p className="mt-1">{entry.note}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Cost Summary */}
          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-xl font-semibold">Revenue Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Rate:</span>
                <span className="font-medium">
                  {pricing.currency || "USD"} {pricing.dailyRate?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{cost.days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {pricing.currency || "USD"} {cost.subtotal.toLocaleString()}
                </span>
              </div>
              {cost.securityDeposit > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-medium">
                    {pricing.currency || "USD"} {cost.securityDeposit.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-lg">
                <span className="font-semibold">Total Revenue:</span>
                <span className="font-bold text-green-600">
                  {pricing.currency || "USD"} {cost.total.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Operator Info */}
          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-xl font-semibold">Operator</h2>
            <p className="font-medium">
              {booking.operator.name || booking.operator.email}
            </p>
            <p className="text-sm text-gray-600">{booking.operator.email}</p>
          </Card>

          {/* Actions */}
          <BookingActions booking={booking} userRole="OWNER" />
        </div>
      </div>
    </main>
  );
}
