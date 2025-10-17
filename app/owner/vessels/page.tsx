import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function OwnerVesselsPage() {
  const user = await requireRole(["OWNER", "ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  // Get user's vessels
  const vessels = await prisma.vessel.findMany({
    where: {
      ownerId: user.id,
    },
    include: {
      media: {
        orderBy: { sort: "asc" },
        take: 1, // Get first image for thumbnail
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
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate statistics
  const totalVessels = vessels.length;
  const activeVessels = vessels.filter((v) => v.status === "ACTIVE").length;
  const draftVessels = vessels.filter((v) => v.status === "DRAFT").length;
  const totalBookings = vessels.reduce((sum, v) => sum + v.bookings.length, 0);

  return (
    <main className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="My Vessels"
        description="Manage your vessel listings and availability"
        actions={
          <Link href="/owner/vessels/new">
            <Button className="bg-primary text-white">+ Add New Vessel</Button>
          </Link>
        }
      />

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vessels</p>
              <p className="mt-2 text-3xl font-bold">{totalVessels}</p>
            </div>
            <div className="text-4xl">🚢</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{activeVessels}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{draftVessels}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bookings</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{totalBookings}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </Card>
      </div>

      {/* Vessels List */}
      {vessels.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 text-6xl">🚢</div>
          <h2 className="mb-2 text-xl font-semibold">No vessels yet</h2>
          <p className="mb-6 text-gray-600">
            Get started by adding your first vessel listing
          </p>
          <Link href="/owner/vessels/new">
            <Button className="bg-primary text-white">
              + Add Your First Vessel
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vessels.map((vessel) => {
            const specs = vessel.specs as any;
            const pricing = specs.pricing || {};
            const thumbnail = vessel.media[0]?.url || "/placeholder-vessel.jpg";

            return (
              <Card key={vessel.id} className="overflow-hidden">
                {/* Vessel Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={thumbnail}
                    alt={specs.name || "Vessel"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-2 top-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        vessel.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : vessel.status === "DRAFT"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {vessel.status}
                    </span>
                  </div>
                </div>

                {/* Vessel Info */}
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">
                    {specs.name || "Unnamed Vessel"}
                  </h3>
                  <div className="mb-4 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Type:</span> {vessel.type}
                    </p>
                    <p>
                      <span className="font-medium">Home Port:</span>{" "}
                      {vessel.homePort || "N/A"}
                    </p>
                    {pricing.dailyRate && (
                      <p>
                        <span className="font-medium">Rate:</span>{" "}
                        {pricing.currency || "USD"} {pricing.dailyRate.toLocaleString()}/day
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Bookings:</span>{" "}
                      {vessel.bookings.length}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/owner/vessels/${vessel.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/vessel/${vessel.slug}`} className="flex-1">
                      <Button variant="ghost" className="w-full">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      {vessels.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="mb-2 font-semibold">Bulk Update Availability</h3>
            <p className="mb-4 text-sm text-gray-600">
              Update availability for multiple vessels at once
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 font-semibold">Export Vessel Data</h3>
            <p className="mb-4 text-sm text-gray-600">
              Download your vessel listings as CSV
            </p>
            <Button variant="outline" className="w-full" disabled>
              Export CSV
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 font-semibold">Performance Analytics</h3>
            <p className="mb-4 text-sm text-gray-600">
              View booking rates and revenue insights
            </p>
            <Link href="/owner/analytics">
              <Button variant="outline" className="w-full" disabled>
                View Analytics
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </main>
  );
}
