import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function AdminDashboardPage() {
  const user = await requireRole(["ADMIN"]);

  // Fetch platform statistics
  const [
    totalUsers,
    totalVessels,
    totalBookings,
    pendingKyc,
    pendingCompliance,
    activeCharters,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.vessel.count(),
    prisma.booking.count(),
    prisma.kycRecord.count({ where: { status: "SUBMITTED" } }),
    prisma.complianceRecord.count({ where: { status: "PENDING" } }),
    prisma.booking.count({
      where: {
        status: "ACCEPTED",
        start: { lte: new Date() },
        end: { gte: new Date() },
      },
    }),
  ]);

  // Get recent activity
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      vessel: {
        select: {
          id: true,
          slug: true,
          type: true,
          specs: true,
        },
      },
      operator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and management tools"
        breadcrumbs={[{ label: "Admin", href: "/admin" }]}
      />

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Vessels</p>
          <p className="text-3xl font-bold">{totalVessels}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-3xl font-bold">{totalBookings}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pending KYC</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingKyc}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pending Compliance</p>
          <p className="text-3xl font-bold text-yellow-600">
            {pendingCompliance}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Active Charters</p>
          <p className="text-3xl font-bold text-green-600">{activeCharters}</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users">
          <Card className="p-6 hover:bg-gray-50 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">👥 User Management</h3>
            <p className="text-sm text-gray-600">
              Manage users, roles, and permissions
            </p>
          </Card>
        </Link>

        <Link href="/admin/kyc">
          <Card className="p-6 hover:bg-gray-50 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">✅ KYC Review</h3>
            <p className="text-sm text-gray-600">
              Review pending KYC submissions
            </p>
            {pendingKyc > 0 && (
              <span className="mt-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                {pendingKyc} pending
              </span>
            )}
          </Card>
        </Link>

        <Link href="/admin/compliance">
          <Card className="p-6 hover:bg-gray-50 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">📋 Compliance</h3>
            <p className="text-sm text-gray-600">
              Review compliance records and documents
            </p>
            {pendingCompliance > 0 && (
              <span className="mt-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                {pendingCompliance} pending
              </span>
            )}
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="p-6 hover:bg-gray-50 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">⚙️ Settings</h3>
            <p className="text-sm text-gray-600">
              Configure platform settings and fees
            </p>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Users</h2>
            <Link href="/admin/users">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-gray-600">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {u.role}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking) => {
              const specs = booking.vessel.specs as any;
              return (
                <div key={booking.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{specs.name || "Unknown Vessel"}</p>
                    <p className="text-sm text-gray-600">{booking.operator.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      booking.status === "ACCEPTED"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "REQUESTED"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
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
      </div>
    </main>
  );
}
