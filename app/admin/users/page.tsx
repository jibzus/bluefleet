import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function AdminUsersPage() {
  const user = await requireRole(["ADMIN"]);

  // Fetch all users with KYC status
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      kyc: {
        select: {
          status: true,
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          vessels: true,
          bookings: true,
        },
      },
    },
  });

  // Calculate statistics
  const stats = {
    total: users.length,
    owners: users.filter((u) => u.role === "OWNER").length,
    operators: users.filter((u) => u.role === "OPERATOR").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    regulators: users.filter((u) => u.role === "REGULATOR").length,
  };

  return (
    <main className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="User Management"
        description="Manage users, roles, and permissions"
        backHref="/admin"
        backLabel="Back to Admin Dashboard"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users" },
        ]}
      />

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Owners</p>
          <p className="text-3xl font-bold">{stats.owners}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Operators</p>
          <p className="text-3xl font-bold">{stats.operators}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Admins</p>
          <p className="text-3xl font-bold">{stats.admins}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Regulators</p>
          <p className="text-3xl font-bold">{stats.regulators}</p>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">KYC Status</th>
                <th className="text-left py-3 px-4">Vessels</th>
                <th className="text-left py-3 px-4">Bookings</th>
                <th className="text-left py-3 px-4">Joined</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const kycStatus = u.kyc[0]?.status || "NOT_STARTED";
                const kycColors = {
                  APPROVED: "bg-green-100 text-green-800",
                  SUBMITTED: "bg-yellow-100 text-yellow-800",
                  REJECTED: "bg-red-100 text-red-800",
                  DRAFT: "bg-gray-100 text-gray-800",
                  NOT_STARTED: "bg-gray-100 text-gray-800",
                };

                return (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{u.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          kycColors[kycStatus as keyof typeof kycColors]
                        }`}
                      >
                        {kycStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {u._count.vessels}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {u._count.bookings}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/users/${u.id}`}>
                        <Button variant="outline">View</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
