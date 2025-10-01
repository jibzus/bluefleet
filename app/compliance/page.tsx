import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getComplianceStats, getExpiringCompliance } from "@/lib/compliance/compliance-engine";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function CompliancePage() {
  const user = await requireRole(["REGULATOR", "ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  const stats = await getComplianceStats();
  const expiringRecords = await getExpiringCompliance(30);

  // Get all compliance records
  const allRecords = await prisma.complianceRecord.findMany({
    include: {
      verifier: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Limit for performance
  });

  const isRegulator = user.role === "REGULATOR";

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isRegulator ? "Regulator Console" : "Compliance Dashboard"}
        </h1>
        <p className="mt-2 text-gray-600">
          {isRegulator
            ? "Read-only view of vessel compliance and certifications"
            : "Monitor vessel compliance, certifications, and expiry alerts"}
        </p>
        {isRegulator && (
          <div className="mt-4 rounded-lg border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              🔒 <strong>Read-Only Access:</strong> You have view-only permissions.
              All compliance data is immutable and verified by administrators.
            </p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="mt-2 text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{stats.pending}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.expiringSoon}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </Card>
      </div>

      {/* Expiring Soon Alert */}
      {expiringRecords.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h2 className="mb-2 font-semibold text-yellow-900">
                {expiringRecords.length} Compliance Record(s) Expiring Within 30 Days
              </h2>
              <p className="mb-4 text-sm text-yellow-800">
                The following compliance records will expire soon.
              </p>
              <div className="space-y-2">
                {expiringRecords.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg bg-white p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">{record.type}</span>
                      <span className="ml-2 text-gray-500">
                        Vessel ID: {record.vesselId.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-yellow-700">
                        Expires: {record.expiresAt ? new Date(record.expiresAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {expiringRecords.length > 5 && (
                <p className="mt-3 text-sm text-yellow-700">
                  + {expiringRecords.length - 5} more expiring records
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* All Compliance Records */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Compliance Records</h2>
          <div className="flex gap-2">
            <select className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Types</option>
              <option value="NIMASA">NIMASA</option>
              <option value="NIPEX">NIPEX</option>
              <option value="SOLAS">SOLAS</option>
              <option value="IMO">IMO</option>
              <option value="FLAG_STATE">Flag State</option>
              <option value="PORT_STATE">Port State</option>
              <option value="INSURANCE">Insurance</option>
              <option value="CREW_CERT">Crew Certification</option>
            </select>
            <select className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="EXPIRED">Expired</option>
              <option value="REJECTED">Rejected</option>
              <option value="UNDER_REVIEW">Under Review</option>
            </select>
          </div>
        </div>

        {allRecords.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No compliance records yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-600">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Vessel ID</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Verified By</th>
                  <th className="pb-3">Expires</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allRecords.map((record) => (
                  <tr key={record.id} className="text-sm">
                    <td className="py-4">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                        {record.type}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-xs text-gray-600">
                      {record.vesselId.slice(0, 12)}...
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          record.status === "VERIFIED"
                            ? "bg-green-100 text-green-800"
                            : record.status === "EXPIRED"
                            ? "bg-red-100 text-red-800"
                            : record.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : record.status === "UNDER_REVIEW"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600">
                      {record.verifier?.name || "Not verified"}
                    </td>
                    <td className="py-4 text-gray-600">
                      {record.expiresAt
                        ? new Date(record.expiresAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-4 text-gray-600">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/compliance/${record.id}`}
                        className="text-primary hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Export Options (Admin only) */}
      {!isRegulator && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="mb-2 font-semibold">Export Compliance Data</h3>
            <p className="mb-4 text-sm text-gray-600">
              Download compliance records for audit and reporting
            </p>
            <button className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
              Export CSV
            </button>
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 font-semibold">Immutable Document Log</h3>
            <p className="mb-4 text-sm text-gray-600">
              View SHA-256 hashes of all uploaded documents
            </p>
            <Link href="/admin/compliance/documents">
              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                View Log →
              </button>
            </Link>
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 font-semibold">Verification Audit Trail</h3>
            <p className="mb-4 text-sm text-gray-600">
              Review all compliance verification actions
            </p>
            <Link href="/admin/compliance/audit">
              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                View Audit →
              </button>
            </Link>
          </Card>
        </div>
      )}
    </main>
  );
}

