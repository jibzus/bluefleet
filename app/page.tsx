import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">BlueFleet</h1>
        <p className="text-lg text-gray-600">
          Digital Vessel Leasing Marketplace
        </p>
      </div>

      {user ? (
        <div className="rounded-lg bg-blue-50 p-6">
          <p className="mb-4 text-sm text-blue-900">
            Welcome back, <strong>{user.name || user.email}</strong>!
          </p>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
            <Link href="/search">
              <Button variant="outline">Search Vessels</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-6 text-gray-600">
            Start by signing in or exploring available vessels.
          </p>
          <div className="flex gap-3">
            <Link href="/signin">
              <Button>Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">Create account</Button>
            </Link>
            <Link href="/search">
              <Button variant="ghost">Browse vessels</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="mb-2 font-semibold">For Operators</h3>
          <p className="text-sm text-gray-600">
            Find and lease vessels for your maritime operations with transparent pricing and compliance.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="mb-2 font-semibold">For Owners</h3>
          <p className="text-sm text-gray-600">
            List your vessels and connect with verified operators. Manage bookings and track revenue.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="mb-2 font-semibold">Compliance First</h3>
          <p className="text-sm text-gray-600">
            Built-in compliance tracking, immutable documentation, and regulatory oversight.
          </p>
        </div>
      </div>
    </main>
  );
}
