import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function AdminKYCPage() {
  const user = await requireRole(["ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  // Get all KYC records
  const kycRecords = await prisma.kycRecord.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = kycRecords.filter((r) => r.status === "SUBMITTED").length;
  const approvedCount = kycRecords.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = kycRecords.filter((r) => r.status === "REJECTED").length;

  return (
    <main className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="KYC/KYB Review Dashboard"
        description="Review and manage user verification applications"
        backHref="/admin"
        backLabel="Back to Admin Dashboard"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "KYC" },
        ]}
      />

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{pendingCount}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{rejectedCount}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">All Applications</h2>

        {kycRecords.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No KYC applications yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-600">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Submitted</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {kycRecords.map((record) => (
                  <tr key={record.id} className="text-sm">
                    <td className="py-4">
                      <div className="font-medium">{record.user.name || "N/A"}</div>
                    </td>
                    <td className="py-4 text-gray-600">{record.user.email}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                        {record.user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          record.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : record.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : record.status === "SUBMITTED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/admin/kyc/${record.id}`}
                        className="text-primary hover:underline"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  );
}
