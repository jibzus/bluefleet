import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusChip } from "@/components/ui/status-chip";

export default async function AdminSettingsPage() {
  const user = await requireRole(["ADMIN"]);

  // Fetch current settings
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/admin/settings`,
    {
      cache: "no-store",
    }
  );

  const { settings } = await response.json();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-24">
      <PageHeader
        title="Platform Settings"
        description="Configure platform fees, payment providers, and feature flags"
        backHref="/admin"
        backLabel="Back to Admin Dashboard"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
      />

      <div className="space-y-6">
        <Card className="slide-up rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Payment Settings</h2>
            <p className="text-sm text-muted-foreground">
              Update fees, escrow preferences, and provider configuration.
            </p>
          </div>
          <SettingsForm initialSettings={settings} />
        </Card>

        <Card className="slide-up rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground">Feature Flags</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Toggle core capabilities without deploying new code.
          </p>
          <div className="mt-6 space-y-4">
            <FeatureToggle
              label="Signup Enabled"
              description="Allow new users to sign up"
              enabled={settings.signupEnabled}
            />
            <FeatureToggle
              label="Booking Enabled"
              description="Allow users to create bookings"
              enabled={settings.bookingEnabled}
            />
            <FeatureToggle
              label="Maintenance Mode"
              description="Put platform in maintenance mode"
              enabled={settings.maintenanceMode}
              enabledLabel="Active"
              disabledLabel="Inactive"
              enabledVariant="warning"
            />
          </div>
        </Card>

        <Card className="slide-up rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground">System Configuration</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Operational parameters that power live data and alerts.
          </p>
          <div className="mt-6 space-y-4">
            <ConfigRow
              label="AIS Polling Interval"
              description="How often to poll AIS data"
              value={`${settings.aisPollingInterval} min`}
            />
            <ConfigRow
              label="Expiry Alert Days"
              description="Days before expiry to send alerts"
              value={`${settings.expiryAlertDays} days`}
            />
          </div>
        </Card>

        <Card className="slide-up space-y-5 rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Payment Providers</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Control which PSPs power escrow and payouts.
            </p>
          </div>
          <ProviderRow
            label="Paystack (Primary)"
            description="Primary payment provider"
            enabled={settings.paystackEnabled}
          />
          <ProviderRow
            label="Flutterwave (Fallback)"
            description="Fallback payment provider"
            enabled={settings.flutterwaveEnabled}
          />
        </Card>
      </div>
    </main>
  );
}

function FeatureToggle({
  label,
  description,
  enabled,
  enabledLabel = "Enabled",
  disabledLabel = "Disabled",
  enabledVariant = "success",
}: {
  label: string;
  description: string;
  enabled: boolean;
  enabledLabel?: string;
  disabledLabel?: string;
  enabledVariant?: "success" | "info" | "warning";
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <StatusChip
        label={enabled ? enabledLabel : disabledLabel}
        variant={enabled ? enabledVariant : "danger"}
      />
    </div>
  );
}

function ConfigRow({
  label,
  description,
  value,
}: {
  label: string;
  description: string;
  value: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/30 px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ProviderRow({
  label,
  description,
  enabled,
}: {
  label: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/30 px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <StatusChip label={enabled ? "Enabled" : "Disabled"} variant={enabled ? "success" : "danger"} />
    </div>
  );
}
