import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function KYCSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold">Application Submitted!</h1>
        <p className="mb-6 text-gray-600">
          Your KYC/KYB application has been successfully submitted for review.
        </p>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-left">
          <h2 className="mb-2 font-semibold text-blue-900">What happens next?</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">1.</span>
              <span>Our compliance team will review your application</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">2.</span>
              <span>You'll receive an email notification (typically within 2-3 business days)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">3.</span>
              <span>Once approved, you'll have full access to all platform features</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link href="/kyc/status" className="block">
            <Button variant="outline" className="w-full">
              Check Application Status
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Reference ID: KYC-{Date.now().toString(36).toUpperCase()}
        </p>
      </Card>
    </main>
  );
}

