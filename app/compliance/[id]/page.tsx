import { redirect, notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getVerificationLog } from "@/lib/compliance/compliance-engine";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ComplianceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRole(["REGULATOR", "ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  const compliance = await prisma.complianceRecord.findUnique({
    where: { id: params.id },
    include: {
      verifier: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!compliance) {
    notFound();
  }

  const logs = await getVerificationLog(params.id);
  const isRegulator = user.role === "REGULATOR";

  return (
    <main className="mx-auto max-w-5xl p-6">
      <PageHeader
        title="Compliance Record Details"
        description={
          isRegulator
            ? "Read-only view"
            : "Review and verify compliance documentation"
        }
        backHref="/compliance"
        backLabel="Back to Compliance Dashboard"
        breadcrumbs={[
          { label: "Compliance", href: "/compliance" },
          { label: compliance.type },
        ]}
      />

      {isRegulator && (
        <Card className="mb-6 border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            🔒 <strong>Read-Only Access:</strong> You have view-only permissions.
            This compliance record is immutable and verified by administrators.
          </p>
        </Card>
      )}

      {/* Status Banner */}
      <Card
        className={`mb-6 p-6 ${
          compliance.status === "VERIFIED"
            ? "border-green-200 bg-green-50"
            : compliance.status === "EXPIRED"
            ? "border-red-200 bg-red-50"
            : compliance.status === "REJECTED"
            ? "border-red-200 bg-red-50"
            : compliance.status === "UNDER_REVIEW"
            ? "border-blue-200 bg-blue-50"
            : "border-yellow-200 bg-yellow-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">
            {compliance.status === "VERIFIED"
              ? "✅"
              : compliance.status === "EXPIRED"
              ? "❌"
              : compliance.status === "REJECTED"
              ? "❌"
              : compliance.status === "UNDER_REVIEW"
              ? "🔍"
              : "⏳"}
          </div>
          <div>
            <h2 className="font-semibold">Status: {compliance.status}</h2>
            <p className="text-sm text-gray-600">
              {compliance.status === "VERIFIED"
                ? "This compliance record has been verified"
                : compliance.status === "EXPIRED"
                ? "This compliance record has expired"
                : compliance.status === "REJECTED"
                ? "This compliance record was rejected"
                : compliance.status === "UNDER_REVIEW"
                ? "This compliance record is under review"
                : "This compliance record is pending verification"}
            </p>
          </div>
        </div>
      </Card>

      {/* Compliance Details */}
      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-xl font-semibold">Compliance Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Type</p>
              <p className="mt-1 font-medium">{compliance.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="mt-1">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    compliance.status === "VERIFIED"
                      ? "bg-green-100 text-green-800"
                      : compliance.status === "EXPIRED"
                      ? "bg-red-100 text-red-800"
                      : compliance.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : compliance.status === "UNDER_REVIEW"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {compliance.status}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Vessel ID</p>
              <p className="mt-1 font-mono text-sm">{compliance.vesselId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Certification ID</p>
              <p className="mt-1 font-mono text-sm">
                {compliance.certificationId || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Created At</p>
              <p className="mt-1">{new Date(compliance.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Updated At</p>
              <p className="mt-1">{new Date(compliance.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {compliance.expiresAt && (
            <div>
              <p className="text-sm font-medium text-gray-600">Expires At</p>
              <p className="mt-1 font-medium">
                {new Date(compliance.expiresAt).toLocaleDateString()}
                {new Date(compliance.expiresAt) < new Date() && (
                  <span className="ml-2 text-red-600">(Expired)</span>
                )}
                {new Date(compliance.expiresAt) > new Date() &&
                  new Date(compliance.expiresAt).getTime() - Date.now() <
                    30 * 24 * 60 * 60 * 1000 && (
                    <span className="ml-2 text-yellow-600">(Expiring Soon)</span>
                  )}
              </p>
            </div>
          )}

          {compliance.verifiedBy && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified By</p>
                <p className="mt-1">{compliance.verifier?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Verified At</p>
                <p className="mt-1">
                  {compliance.verifiedAt
                    ? new Date(compliance.verifiedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          )}

          {compliance.notes && (
            <div>
              <p className="text-sm font-medium text-gray-600">Notes</p>
              <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm">
                {compliance.notes}
              </p>
            </div>
          )}

          {compliance.metadata && (
            <div>
              <p className="text-sm font-medium text-gray-600">Metadata</p>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs">
                {JSON.stringify(compliance.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>

      {/* Verification Log */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Verification Audit Trail (Immutable)
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          All verification actions are logged and cannot be modified. This ensures
          compliance data integrity and auditability.
        </p>
        {logs.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No verification actions yet</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{log.action}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      By {log.performer.name} ({log.performer.email})
                    </p>
                    {log.notes && (
                      <p className="mt-2 text-sm text-gray-700">{log.notes}</p>
                    )}
                    {log.metadata && (
                      <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="ml-4 text-right text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
