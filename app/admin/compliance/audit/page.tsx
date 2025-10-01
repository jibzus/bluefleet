import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function VerificationAuditPage() {
  const user = await requireRole(["ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  // Get all verification logs
  const logs = await prisma.verificationLog.findMany({
    include: {
      performer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      compliance: {
        select: {
          id: true,
          type: true,
          vesselId: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Limit for performance
  });

  // Get statistics
  const totalLogs = await prisma.verificationLog.count();
  const uniquePerformers = await prisma.verificationLog.groupBy({
    by: ["performedBy"],
  });

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <Link
          href="/admin/compliance"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Compliance Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Verification Audit Trail</h1>
        <p className="mt-2 text-gray-600">
          Complete log of all compliance verification actions
        </p>
      </div>

      {/* Info Banner */}
      <Card className="mb-6 border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">📋</div>
          <div className="flex-1">
            <h2 className="mb-2 font-semibold text-blue-900">
              Immutable Audit Trail
            </h2>
            <p className="text-sm text-blue-800">
              All compliance verification actions are logged in an append-only audit
              trail. This log cannot be modified or deleted, ensuring complete
              transparency and accountability for regulatory compliance.
            </p>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Actions</p>
              <p className="mt-2 text-3xl font-bold">{totalLogs}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Verifiers</p>
              <p className="mt-2 text-3xl font-bold">{uniquePerformers.length}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="mt-2 text-xl font-bold">
                {logs.length > 0
                  ? new Date(logs[0].createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="text-4xl">🕐</div>
          </div>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Audit Log</h2>
          <div className="flex gap-2">
            <select className="rounded-lg border px-3 py-2 text-sm">
              <option value="">All Actions</option>
              <option value="verify">Verifications</option>
              <option value="reject">Rejections</option>
              <option value="update">Updates</option>
            </select>
            <button className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
              Export CSV
            </button>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No verification actions yet
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Action Header */}
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-lg">
                        {log.action.includes("VERIFIED")
                          ? "✅"
                          : log.action.includes("REJECTED")
                          ? "❌"
                          : "🔄"}
                      </span>
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">
                          Compliance Type:{" "}
                          <span className="font-medium">{log.compliance.type}</span>
                        </p>
                      </div>
                    </div>

                    {/* Performer Info */}
                    <div className="mb-2 ml-9 text-sm text-gray-600">
                      <span className="font-medium">Performed by:</span>{" "}
                      {log.performer.name} ({log.performer.email})
                    </div>

                    {/* Vessel Info */}
                    <div className="mb-2 ml-9 text-sm text-gray-600">
                      <span className="font-medium">Vessel ID:</span>{" "}
                      <code className="rounded bg-gray-100 px-1 font-mono text-xs">
                        {log.compliance.vesselId}
                      </code>
                    </div>

                    {/* Notes */}
                    {log.notes && (
                      <div className="ml-9 mt-2 rounded-lg bg-gray-50 p-3 text-sm">
                        <p className="mb-1 font-medium text-gray-700">Notes:</p>
                        <p className="text-gray-700">{log.notes}</p>
                      </div>
                    )}

                    {/* Metadata */}
                    {log.metadata && (
                      <details className="ml-9 mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                          View metadata
                        </summary>
                        <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}

                    {/* Link to Compliance Record */}
                    <div className="ml-9 mt-3">
                      <Link
                        href={`/admin/compliance/${log.compliance.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View Compliance Record →
                      </Link>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Audit Trail Info */}
      <Card className="mt-6 p-6">
        <h3 className="mb-4 font-semibold">About the Audit Trail</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-lg">🔒</div>
            <div>
              <strong>Immutable:</strong> Once created, audit log entries cannot be
              modified or deleted. This ensures data integrity and prevents tampering.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-lg">👤</div>
            <div>
              <strong>Accountability:</strong> Every action is attributed to a specific
              user with timestamp, ensuring full accountability.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-lg">📊</div>
            <div>
              <strong>Compliance:</strong> The audit trail meets regulatory requirements
              for NDPR/GDPR and maritime compliance standards.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-lg">🔍</div>
            <div>
              <strong>Transparency:</strong> Regulators have read-only access to view
              all verification actions and ensure proper oversight.
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}

