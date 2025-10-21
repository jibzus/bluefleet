import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsBar } from "./StatsBar";

export function HeroSection() {
  return (
    <section className="fade-in relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 dark:from-blue-950/20 dark:to-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-200/40 to-transparent blur-3xl dark:from-blue-900/30" />
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Lease Vessels in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Minutes
            </span>
            , Not Months
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            The first digital marketplace for offshore vessel leasing. Real-time
            tracking, secure escrow, and built-in compliance—all in one
            platform.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/search">
              <Button size="lg" className="w-full sm:w-auto">
                Find Vessels Now
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
        <StatsBar />
      </div>
    </section>
  );
}
