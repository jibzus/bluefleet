import {
  Search,
  Radio,
  Shield,
  CheckCircle,
  DollarSign,
  Headphones,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Search,
    title: "Lightning-Fast Search",
    description:
      "Find the perfect vessel in under 1 second with our optimized search engine and advanced filters.",
  },
  {
    icon: Radio,
    title: "Real-Time AIS Tracking",
    description:
      "Monitor vessel locations with live AIS data updated every 15 minutes. Full transparency, always.",
  },
  {
    icon: Shield,
    title: "Secure Escrow Payments",
    description:
      "Protected transactions via Paystack and Flutterwave. Funds released only when you confirm delivery.",
  },
  {
    icon: CheckCircle,
    title: "Compliance Built-In",
    description:
      "Automated KYC verification, regulatory oversight, and immutable documentation for peace of mind.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description:
      "Just 7% platform fee. No hidden costs, no surprises. See exactly what you pay upfront.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Our team is always available to help with bookings, compliance, or technical issues.",
  },
];

export function BenefitsGrid() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Why Choose BlueFleet?</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need for seamless vessel leasing
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={benefit.title}
                className="slide-up group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
