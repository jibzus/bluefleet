import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { UserRoleForm } from "@/components/admin/UserRoleForm";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const currentUser = await requireRole(["ADMIN"]);

  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      kyc: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
      vessels: {
        select: {
          id: true,
          slug: true,
          type: true,
          specs: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      bookings: {
        select: {
          id: true,
          status: true,
          start: true,
          end: true,
          createdAt: true,
          vessel: {
            select: {
              id: true,
              slug: true,
              type: true,
              specs: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Get first KYC record
  const kycRecord = user.kyc[0] || null;

  return (
    <main className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="User Details"
        description="View and manage user information"
        backHref="/admin/users"
        backLabel="Back to User Management"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: user.name || user.email || "User" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">User Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {user.role}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">KYC Status</p>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    kycRecord?.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : kycRecord?.status === "SUBMITTED"
                      ? "bg-yellow-100 text-yellow-800"
                      : kycRecord?.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {kycRecord?.status || "NOT_STARTED"}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Role Management */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold mb-3">Change Role</h3>
              <UserRoleForm userId={user.id} currentRole={user.role} />
            </div>
          </Card>

          {/* Statistics */}
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Vessels</p>
                <p className="font-bold">{user.vessels.length}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Bookings</p>
                <p className="font-bold">{user.bookings.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vessels */}
          {user.vessels.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Vessels</h2>
              <div className="space-y-3">
                {user.vessels.map((vessel) => {
                  const specs = vessel.specs as any;
                  return (
                    <div
                      key={vessel.id}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <div>
                        <p className="font-medium">{specs.name || "Unknown"}</p>
                        <p className="text-sm text-gray-600">{vessel.type}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            vessel.status === "PUBLISHED"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {vessel.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(vessel.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Bookings */}
          {user.bookings.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
              <div className="space-y-3">
                {user.bookings.map((booking) => {
                  const specs = booking.vessel.specs as any;
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <div>
                        <p className="font-medium">
                          {specs.name || "Unknown Vessel"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.start).toLocaleDateString()} -{" "}
                          {new Date(booking.end).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            booking.status === "ACCEPTED"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "REQUESTED"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* KYC Details */}
          {kycRecord && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">KYC Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      kycRecord.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : kycRecord.status === "SUBMITTED"
                        ? "bg-yellow-100 text-yellow-800"
                        : kycRecord.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {kycRecord.status}
                  </span>
                </div>
                <div>
                  <Link href="/admin/kyc">
                    <Button variant="outline">View KYC Details</Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
