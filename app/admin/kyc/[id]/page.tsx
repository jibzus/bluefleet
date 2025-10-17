import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { KYCReviewActions } from "@/components/admin/KYCReviewActions";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function KYCReviewPage({ params }: { params: { id: string } }) {
  const user = await requireRole(["ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  const kycRecord = await prisma.kycRecord.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      reviewer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!kycRecord) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold">KYC Record Not Found</h1>
        </Card>
      </main>
    );
  }

  const fields = kycRecord.fields as any;
  const { personalInfo, businessDetails, documents, verification } = fields;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <PageHeader
        title="KYC/KYB Review"
        description={`Review application for ${kycRecord.user.name || kycRecord.user.email}`}
        backHref="/admin/kyc"
        backLabel="Back to KYC Dashboard"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "KYC", href: "/admin/kyc" },
          { label: kycRecord.user.name || kycRecord.user.email || "Application" },
        ]}
      />

      <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <span
            className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${
              kycRecord.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : kycRecord.status === "REJECTED"
                ? "bg-red-100 text-red-800"
                : kycRecord.status === "SUBMITTED"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {kycRecord.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Submitted</p>
          <p className="font-medium">{new Date(kycRecord.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">User Information</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-600">Name</dt>
              <dd className="mt-1">{kycRecord.user.name || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Email</dt>
              <dd className="mt-1">{kycRecord.user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Role</dt>
              <dd className="mt-1">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm">
                  {kycRecord.user.role}
                </span>
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Personal/Company Information</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-600">Entity Type</dt>
              <dd className="mt-1">{personalInfo?.entityType || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Full Name</dt>
              <dd className="mt-1">{personalInfo?.fullName || "N/A"}</dd>
            </div>
            {personalInfo?.entityType === "COMPANY" && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Company Name</dt>
                  <dd className="mt-1">{personalInfo?.companyName || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Registration Number</dt>
                  <dd className="mt-1">{personalInfo?.registrationNumber || "N/A"}</dd>
                </div>
              </>
            )}
            {personalInfo?.entityType === "INDIVIDUAL" && (
              <div>
                <dt className="text-sm font-medium text-gray-600">Date of Birth</dt>
                <dd className="mt-1">{personalInfo?.dateOfBirth || "N/A"}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-600">Nationality</dt>
              <dd className="mt-1">{personalInfo?.nationality || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Phone Number</dt>
              <dd className="mt-1">{personalInfo?.phoneNumber || "N/A"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Business Details</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-600">Business Address</dt>
              <dd className="mt-1">{businessDetails?.businessAddress || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">City</dt>
              <dd className="mt-1">{businessDetails?.city || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">State</dt>
              <dd className="mt-1">{businessDetails?.state || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Country</dt>
              <dd className="mt-1">{businessDetails?.country || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Postal Code</dt>
              <dd className="mt-1">{businessDetails?.postalCode || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Business Type</dt>
              <dd className="mt-1">{businessDetails?.businessType || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Years in Business</dt>
              <dd className="mt-1">{businessDetails?.yearsInBusiness || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Tax ID</dt>
              <dd className="mt-1">{businessDetails?.taxId || "N/A"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Uploaded Documents</h2>
          <div className="space-y-3">
            {documents?.identificationDoc && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">Identification Document</span>
                <a
                  href={documents.identificationDoc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View →
                </a>
              </div>
            )}
            {documents?.proofOfAddress && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">Proof of Address</span>
                <a
                  href={documents.proofOfAddress}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View →
                </a>
              </div>
            )}
            {documents?.businessRegistration && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">Business Registration</span>
                <a
                  href={documents.businessRegistration}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View →
                </a>
              </div>
            )}
            {documents?.taxCertificate && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">Tax Certificate</span>
                <a
                  href={documents.taxCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View →
                </a>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Verification & Consent</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={verification?.agreeToTerms ? "text-green-600" : "text-gray-400"}>
                {verification?.agreeToTerms ? "✓" : "○"}
              </span>
              <span>Agreed to Terms and Conditions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={verification?.agreeToPrivacy ? "text-green-600" : "text-gray-400"}>
                {verification?.agreeToPrivacy ? "✓" : "○"}
              </span>
              <span>Agreed to Privacy Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={verification?.certifyTruthfulness ? "text-green-600" : "text-gray-400"}>
                {verification?.certifyTruthfulness ? "✓" : "○"}
              </span>
              <span>Certified information truthfulness</span>
            </div>
          </div>
        </Card>

        {kycRecord.status === "SUBMITTED" && (
          <KYCReviewActions kycId={kycRecord.id} />
        )}

        {kycRecord.reviewer && (
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Review Information</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-600">Reviewed By</dt>
                <dd className="mt-1">{kycRecord.reviewer.name || kycRecord.reviewer.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Review Date</dt>
                <dd className="mt-1">{new Date(kycRecord.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </Card>
        )}
      </div>
    </main>
  );
}
