"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  mockupType: "search" | "vessel" | "booking" | "contract" | "tracking";
  screenshotPath?: string; // Path to actual screenshot
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: 1,
    title: "Search",
    description: "Find vessels using advanced filters. Results in <1s.",
    icon: "🔍",
    mockupType: "search",
    screenshotPath: "/images/booking-flow/search.png",
  },
  {
    id: 2,
    title: "Select Vessel",
    description: "Browse verified vessels with real-time availability.",
    icon: "🚢",
    mockupType: "vessel",
    screenshotPath: "/images/booking-flow/vessel-detail.png",
  },
  {
    id: 3,
    title: "Request",
    description: "Submit booking request with dates and terms.",
    icon: "📝",
    mockupType: "booking",
    screenshotPath: "/images/booking-flow/booking-dialog.png",
  },
  {
    id: 4,
    title: "Contract",
    description: "E-sign contract with secure escrow payment.",
    icon: "✍️",
    mockupType: "contract",
  },
  {
    id: 5,
    title: "Track",
    description: "Monitor vessel location with real-time AIS.",
    icon: "📍",
    mockupType: "tracking",
  },
];

const AUTO_ADVANCE_INTERVAL = 3000; // 3 seconds

export function BookingFlowDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance logic
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % FLOW_STEPS.length);
    }, AUTO_ADVANCE_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying]);

  // Intersection Observer for scroll trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setIsPlaying(true);
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleStepClick(index);
    } else if (e.key === "ArrowDown" && index < FLOW_STEPS.length - 1) {
      e.preventDefault();
      handleStepClick(index + 1);
    } else if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      handleStepClick(index - 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="fade-in py-20"
      aria-labelledby="booking-flow-title"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 id="booking-flow-title" className="mb-4 text-4xl font-bold">
            See How Easy It Is
          </h2>
          <p className="text-lg text-muted-foreground">
            From search to tracking in just 5 simple steps
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          {/* Steps List */}
          <div className="space-y-3">
            {FLOW_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                onMouseEnter={() => setIsPlaying(false)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  "group relative w-full rounded-2xl border p-6 text-left transition-all duration-300",
                  activeStep === index
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                )}
                aria-current={activeStep === index ? "step" : undefined}
                aria-label={`Step ${step.id}: ${step.title} - ${step.description}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-all duration-300",
                      activeStep === index
                        ? "bg-primary/10 ring-2 ring-primary ring-offset-2"
                        : "bg-muted group-hover:bg-primary/10"
                    )}
                    aria-hidden="true"
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Step {step.id}
                      </span>
                      {activeStep === index && (
                        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      )}
                    </div>
                    <h3 className="mb-1 text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar for active step */}
                {activeStep === index && isPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl bg-primary/20">
                    <div className="booking-flow-progress h-full bg-primary" />
                  </div>
                )}
              </button>
            ))}

            {/* Play/Pause Control */}
            <div className="flex items-center justify-center pt-4">
              <Button
                onClick={togglePlayPause}
                variant="outline"
                size="lg"
                className="gap-2"
                aria-label={isPlaying ? "Pause animation" : "Play animation"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Animated Mockup */}
          <div className="hidden lg:block">
            <Card className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/30 to-muted/10 p-8 shadow-xl">
              <div className="mockup-container relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl">
                <MockupContent
                  type={FLOW_STEPS[activeStep].mockupType}
                  isActive={true}
                  screenshotPath={FLOW_STEPS[activeStep].screenshotPath}
                />
              </div>

              {/* Decorative elements */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
            </Card>
          </div>

          {/* Mobile Mockup */}
          <div className="lg:hidden">
            <Card className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/30 to-muted/10 p-6 shadow-xl">
              <div className="mockup-container relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/50 bg-background shadow-lg">
                <MockupContent
                  type={FLOW_STEPS[activeStep].mockupType}
                  isActive={true}
                  screenshotPath={FLOW_STEPS[activeStep].screenshotPath}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

interface MockupContentProps {
  type: FlowStep["mockupType"];
  isActive: boolean;
  screenshotPath?: string;
}

function MockupContent({ type, isActive, screenshotPath }: MockupContentProps) {
  // Use screenshot if available, otherwise fall back to CSS mockup
  if (screenshotPath) {
    return (
      <div
        className={cn(
          "mockup-slide h-full w-full transition-opacity duration-500",
          isActive ? "opacity-100" : "opacity-0"
        )}
      >
        <img
          src={screenshotPath}
          alt={`${type} screenshot`}
          className="h-full w-full object-contain object-top"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to CSS mockups for steps without screenshots
  return (
    <div
      className={cn(
        "mockup-slide h-full w-full p-6 transition-opacity duration-500",
        isActive ? "opacity-100" : "opacity-0"
      )}
    >
      {type === "search" && <SearchMockup />}
      {type === "vessel" && <VesselMockup />}
      {type === "booking" && <BookingMockup />}
      {type === "contract" && <ContractMockup />}
      {type === "tracking" && <TrackingMockup />}
    </div>
  );
}

// Mockup Components
function SearchMockup() {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 h-10 rounded-lg bg-muted/50" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-8 rounded-md bg-muted/30" />
          <div className="h-8 rounded-md bg-muted/30" />
          <div className="h-8 rounded-md bg-primary/20" />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="slide-up flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-20 w-24 shrink-0 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted/50" />
              <div className="h-3 w-1/2 rounded bg-muted/30" />
              <div className="h-3 w-2/3 rounded bg-muted/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VesselMockup() {
  return (
    <div className="space-y-4">
      {/* Hero Image */}
      <div className="h-32 rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-600/30 shadow-lg" />

      {/* Vessel Info */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 h-6 w-2/3 rounded bg-muted/50" />
        <div className="mb-4 h-4 w-1/2 rounded bg-muted/30" />

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg bg-muted/20 p-3">
              <div className="mb-2 h-3 w-16 rounded bg-muted/40" />
              <div className="h-4 w-20 rounded bg-muted/50" />
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="h-12 rounded-xl bg-primary/80 shadow-lg" />
    </div>
  );
}

function BookingMockup() {
  return (
    <div className="space-y-4">
      {/* Dialog Header */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-2 h-5 w-1/2 rounded bg-muted/50" />
        <div className="h-3 w-3/4 rounded bg-muted/30" />
      </div>

      {/* Date Pickers */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 h-3 w-16 rounded bg-muted/40" />
          <div className="h-8 rounded-md bg-muted/30" />
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 h-3 w-16 rounded bg-muted/40" />
          <div className="h-8 rounded-md bg-muted/30" />
        </div>
      </div>

      {/* Terms */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-2 h-3 w-20 rounded bg-muted/40" />
        <div className="h-16 rounded-md bg-muted/20" />
      </div>

      {/* Cost Summary */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="mb-2 h-4 w-24 rounded bg-primary/30" />
        <div className="h-6 w-32 rounded bg-primary/40" />
      </div>

      {/* Submit Button */}
      <div className="h-12 rounded-xl bg-primary shadow-lg" />
    </div>
  );
}

function ContractMockup() {
  return (
    <div className="space-y-4">
      {/* Contract Header */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-2 h-5 w-2/3 rounded bg-muted/50" />
        <div className="h-3 w-1/2 rounded bg-muted/30" />
      </div>

      {/* Contract Terms */}
      <div className="space-y-2 rounded-lg border border-border bg-card p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 rounded bg-muted/30" style={{ width: `${90 - i * 10}%` }} />
        ))}
      </div>

      {/* Signature Area */}
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
        <div className="mb-3 h-4 w-32 rounded bg-primary/30" />
        <div className="h-20 rounded-lg border-2 border-primary/20 bg-background" />
      </div>

      {/* Sign Button */}
      <div className="h-12 rounded-xl bg-primary shadow-lg" />
    </div>
  );
}

function TrackingMockup() {
  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="relative h-40 overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950">
        {/* Map Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid h-full grid-cols-4 grid-rows-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="border border-blue-300 dark:border-blue-700" />
            ))}
          </div>
        </div>

        {/* Vessel Marker */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="h-6 w-6 animate-pulse rounded-full bg-primary shadow-lg" />
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
          </div>
        </div>
      </div>

      {/* Vessel Status */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <div className="h-4 w-24 rounded bg-muted/50" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 h-3 w-16 rounded bg-muted/30" />
            <div className="h-4 w-20 rounded bg-muted/50" />
          </div>
          <div>
            <div className="mb-1 h-3 w-16 rounded bg-muted/30" />
            <div className="h-4 w-20 rounded bg-muted/50" />
          </div>
        </div>
      </div>

      {/* AIS Update Info */}
      <div className="rounded-lg bg-muted/20 p-3">
        <div className="h-3 w-48 rounded bg-muted/40" />
      </div>
    </div>
  );
}

