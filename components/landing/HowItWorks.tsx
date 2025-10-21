import { ProcessFlow } from "./ProcessFlow";

export function HowItWorks() {
  const operatorSteps = [
    {
      number: 1,
      title: "Search",
      description: "Find vessels using advanced filters. Results in <1s.",
      icon: "🔍",
    },
    {
      number: 2,
      title: "Request",
      description: "Submit booking request with dates and terms.",
      icon: "📝",
    },
    {
      number: 3,
      title: "Contract",
      description: "E-sign contract with secure escrow payment.",
      icon: "✍️",
    },
    {
      number: 4,
      title: "Track",
      description: "Monitor vessel location with real-time AIS.",
      icon: "📍",
    },
  ];

  const ownerSteps = [
    {
      number: 1,
      title: "List",
      description: "Add your vessel with specs and availability.",
      icon: "➕",
    },
    {
      number: 2,
      title: "Review",
      description: "Receive requests from verified operators.",
      icon: "👀",
    },
    {
      number: 3,
      title: "Accept",
      description: "Approve bookings and finalize contracts.",
      icon: "✅",
    },
    {
      number: 4,
      title: "Earn",
      description: "Get paid securely via escrow (7% platform fee).",
      icon: "💰",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="fade-in bg-muted/30 py-20"
      aria-labelledby="how-it-works-title"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 id="how-it-works-title" className="mb-4 text-4xl font-bold">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple, transparent process for operators and owners
          </p>
        </div>
        <div className="grid gap-12 lg:grid-cols-2">
          <ProcessFlow title="For Operators" steps={operatorSteps} />
          <ProcessFlow title="For Owners" steps={ownerSteps} />
        </div>
      </div>
    </section>
  );
}
