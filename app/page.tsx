import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

const LiveFleetMap = dynamic(() => import("@/components/maps/LiveFleetMap"), {
  ssr: false,
});

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">BlueFleet</h1>
          <p className="text-lg text-gray-600">
            Digital Vessel Leasing Marketplace
          </p>
        </div>

        <section className="mb-12">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Global Live Fleet Preview
              </h2>
              <p className="text-sm text-slate-500">
                Follow real-time vessel activity across major offshore corridors. Data shown
                below is simulated while we connect to live feeds.
              </p>
            </div>
            <div className="h-[420px] overflow-hidden rounded-b-2xl">
              <LiveFleetMap />
            </div>
          </div>
        </section>

        {user ? (
          <div className="rounded-lg bg-blue-50 p-6">
            <p className="mb-4 text-sm text-blue-900">
              Welcome back, <strong>{user.name || user.email}</strong>!
            </p>
            <div className="flex flex-wrap gap-3">
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
            <div className="flex flex-wrap gap-3">
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
    </AppShell>
  );
}
