import dynamic from "next/dynamic";
import Link from "next/link";
import { HeroSection } from "@/components/landing/HeroSection";
import { BookingFlowDemo } from "@/components/landing/BookingFlowDemo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BenefitsGrid } from "@/components/landing/BenefitsGrid";
import { ChatButton } from "@/components/landing/ChatButton";
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
      <main className="flex flex-col gap-20 pb-24">
        <HeroSection />
        <BookingFlowDemo />
        <section className="fade-in">
          <div className="mx-auto max-w-6xl px-6">
            <div className="slide-up overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
              <div className="border-b border-border px-6 py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      Global Live Fleet Preview
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Follow real-time vessel activity across major offshore
                      corridors. Data shown below is simulated while live feeds
                      finalize.
                    </p>
                  </div>
                  <Link href="/search">
                    <Button variant="outline" size="lg">
                      Explore Vessels
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="h-[420px] overflow-hidden">
                <LiveFleetMap />
              </div>
            </div>
          </div>
        </section>
        <HowItWorks />
        <BenefitsGrid />
        <section className="fade-in">
          <div className="mx-auto max-w-5xl px-6">
            {user ? (
              <div className="slide-up rounded-2xl border border-primary/20 bg-primary/10 p-8 text-primary shadow-sm backdrop-blur-sm dark:bg-primary/20 dark:text-primary-foreground">
                <p className="mb-4 text-sm font-medium text-primary/80 dark:text-primary-foreground/80">
                  Welcome back,{" "}
                  <span className="font-semibold">
                    {user.name || user.email}
                  </span>
                  !
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard">
                    <Button size="lg">Go to Dashboard</Button>
                  </Link>
                  <Link href="/search">
                    <Button variant="outline" size="lg">
                      Search Vessels
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="slide-up rounded-2xl border border-border bg-card p-8 shadow-sm">
                <h3 className="mb-2 text-2xl font-semibold">
                  Get started with BlueFleet
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Create a free account to list vessels, manage bookings, and
                  connect with verified operators.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/signin">
                    <Button size="lg">Sign in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" size="lg">
                      Create account
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button variant="ghost" size="lg">
                      Browse vessels
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <ChatButton />
    </AppShell>
  );
}
