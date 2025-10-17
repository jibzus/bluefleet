import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function KYCStatusPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  // Get user's KYC records
  const kycRecords = await prisma.kycRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const latestKyc = kycRecords[0];

  const statusConfig = {
    DRAFT: {
      color: "gray",
      icon: "📝",
      title: "Draft",
      description: "Your application is saved as a draft. Complete and submit it to start the review process.",
    },
    SUBMITTED: {
      color: "blue",
      icon: "⏳",
      title: "Under Review",
      description: "Your application is being reviewed by our compliance team. This typically takes 2-3 business days.",
    },
    APPROVED: {
      color: "green",
      icon: "✅",
      title: "Approved",
      description: "Your KYC/KYB verification has been approved. You now have full access to all platform features.",
    },
    REJECTED: {
      color: "red",
      icon: "❌",
      title: "Rejected",
      description: "Your application was not approved. Please review the feedback below and resubmit.",
    },
  };

  const status = latestKyc?.status || "DRAFT";
  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <main className="mx-auto max-w-4xl p-6">
      <PageHeader
        title="KYC/KYB Status"
        description="Track your verification application status"
        backHref="/dashboard"
        backLabel="Back to Dashboard"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "KYC Status" },
        ]}
      />

      {!latestKyc ? (
        <Card className="p-8 text-center">
          <div className="mb-4 text-4xl">📋</div>
          <h2 className="mb-2 text-xl font-semibold">No KYC Application Found</h2>
          <p className="mb-6 text-gray-600">
            You haven't started your KYC/KYB verification yet.
          </p>
          <Link href="/kyc">
            <Button>Start KYC Application</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{config.icon}</div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{config.title}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      config.color === "green"
                        ? "bg-green-100 text-green-800"
                        : config.color === "blue"
                        ? "bg-blue-100 text-blue-800"
                        : config.color === "red"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-gray-600">{config.description}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Application Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Submitted</dt>
                <dd>{new Date(latestKyc.createdAt).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-600">Last Updated</dt>
                <dd>{new Date(latestKyc.updatedAt).toLocaleDateString()}</dd>
              </div>
              {latestKyc.reviewerId && (
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-600">Reviewed By</dt>
                  <dd>Compliance Team</dd>
                </div>
              )}
            </dl>
          </Card>

          {status === "REJECTED" && (
            <Card className="border-red-200 bg-red-50 p-6">
              <h3 className="mb-2 font-semibold text-red-900">Rejection Reason</h3>
              <p className="mb-4 text-sm text-red-800">
                {/* TODO: Add rejection notes from reviewer */}
                Please ensure all documents are clear and valid. Contact support if you need assistance.
              </p>
              <Link href="/kyc">
                <Button variant="outline">Resubmit Application</Button>
              </Link>
            </Card>
          )}

          {status === "APPROVED" && (
            <Card className="border-green-200 bg-green-50 p-6">
              <h3 className="mb-2 font-semibold text-green-900">
                🎉 Verification Complete
              </h3>
              <p className="mb-4 text-sm text-green-800">
                You can now access all platform features including vessel listings, bookings, and payments.
              </p>
              <div className="flex gap-3">
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
                {user.role === "OWNER" && (
                  <Link href="/owner/vessels/new">
                    <Button variant="outline">List a Vessel</Button>
                  </Link>
                )}
                {user.role === "OPERATOR" && (
                  <Link href="/search">
                    <Button variant="outline">Search Vessels</Button>
                  </Link>
                )}
              </div>
            </Card>
          )}

          {kycRecords.length > 1 && (
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Application History</h3>
              <div className="space-y-2">
                {kycRecords.map((record, index) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        Application #{kycRecords.length - index}
                      </span>
                      <span className="ml-2 text-gray-500">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
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
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
