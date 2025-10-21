import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <section className="space-y-6">
          <div>
            <h1 className="mb-4">Contact Support</h1>
            <p className="text-muted-foreground">
              Need help with a booking, compliance document, or technical issue?
              Send us a message and our support engineers will respond within 24
              hours.
            </p>
          </div>
          <form className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ada Lovelace"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Work email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-medium">
                How can we help?
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                placeholder="Share details about your request..."
              />
            </div>
            <div className="flex items-center gap-4">
              <Button type="submit" size="lg">
                Submit request
              </Button>
              <p className="text-sm text-muted-foreground">
                Prefer email? Reach us at{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href="mailto:support@bluefleet.io"
                >
                  support@bluefleet.io
                </a>
              </p>
            </div>
          </form>
        </section>
      </main>
    </AppShell>
  );
}
