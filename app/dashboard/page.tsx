import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(auth)/actions";
import Link from "next/link";

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/(auth)/signin");
  }

  // Get user's KYC status
  const kycRecord = await prisma.kycRecord.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const roleContent = {
    ADMIN: {
      title: "Admin Dashboard",
      description: "Manage users, vessels, and platform settings",
      features: [
        "User management",
        "Vessel approvals",
        "KYC/KYB reviews",
        "Platform analytics",
        "Compliance monitoring",
      ],
    },
    OWNER: {
      title: "Owner Dashboard",
      description: "Manage your vessel fleet and bookings",
      features: [
        "List new vessels",
        "Manage vessel details",
        "View booking requests",
        "Track active leases",
        "Revenue analytics",
      ],
    },
    OPERATOR: {
      title: "Operator Dashboard",
      description: "Find and lease vessels for your operations",
      features: [
        "Search available vessels",
        "Submit booking requests",
        "Manage active leases",
        "Track vessel locations",
        "Payment history",
      ],
    },
    REGULATOR: {
      title: "Regulator Dashboard",
      description: "Monitor compliance and vessel certifications",
      features: [
        "View all vessels",
        "Compliance reports",
        "Certification tracking",
        "Audit logs",
        "Export data",
      ],
    },
  };

  const content = roleContent[user.role];

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{content.title}</h1>
          <p className="mt-1 text-gray-600">Welcome back, {user.name || user.email}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>

      {/* KYC Status Banner */}
      {!kycRecord && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h2 className="mb-2 font-semibold text-yellow-900">
                Complete Your KYC/KYB Verification
              </h2>
              <p className="mb-4 text-sm text-yellow-800">
                To access all platform features, you need to complete your Know Your Customer (KYC) verification.
              </p>
              <Link href="/kyc">
                <Button>Start KYC Application</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {kycRecord?.status === "SUBMITTED" && (
        <Card className="mb-6 border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⏳</div>
            <div className="flex-1">
              <h2 className="mb-2 font-semibold text-blue-900">
                KYC Application Under Review
              </h2>
              <p className="mb-4 text-sm text-blue-800">
                Your application is being reviewed by our compliance team. You'll receive an email notification once the review is complete.
              </p>
              <Link href="/kyc/status">
                <Button variant="outline">Check Status</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {kycRecord?.status === "REJECTED" && (
        <Card className="mb-6 border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">❌</div>
            <div className="flex-1">
              <h2 className="mb-2 font-semibold text-red-900">
                KYC Application Rejected
              </h2>
              <p className="mb-4 text-sm text-red-800">
                Your KYC application was not approved. Please review the feedback and resubmit.
              </p>
              <div className="flex gap-3">
                <Link href="/kyc/status">
                  <Button variant="outline">View Details</Button>
                </Link>
                <Link href="/kyc">
                  <Button>Resubmit Application</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {kycRecord?.status === "APPROVED" && (
        <Card className="mb-6 border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">✅</div>
            <div className="flex-1">
              <h2 className="mb-2 font-semibold text-green-900">
                KYC Verified
              </h2>
              <p className="text-sm text-green-800">
                Your account is fully verified. You have access to all platform features.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-2 text-lg font-semibold">Your Role</h2>
          <p className="mb-4 text-sm text-gray-600">{content.description}</p>
          <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {user.role}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-2 text-lg font-semibold">Account Info</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium text-gray-600">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Name</dt>
              <dd>{user.name || "Not set"}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold">Available Features</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {content.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </Card>

      {/* Quick Links for Admin */}
      {user.role === "ADMIN" && (
        <Card className="mt-6 p-6">
          <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/admin/kyc">
              <Button variant="outline" className="w-full justify-start">
                📋 KYC/KYB Reviews
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" disabled>
              👥 User Management
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              🚢 Vessel Approvals
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              📊 Analytics
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>🚧 Work in Progress:</strong> WP-1 (Auth & RBAC) and WP-2 (KYC/KYB) are complete.
          Additional features will be implemented in upcoming work packages.
        </p>
      </div>
    </main>
  );
}
