import { requireRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/layout/PageHeader";

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
    <main className="mx-auto max-w-4xl p-6">
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
        {/* Payment Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Settings</h2>
          <SettingsForm initialSettings={settings} />
        </Card>

        {/* Feature Flags */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Feature Flags</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Signup Enabled</p>
                <p className="text-sm text-gray-600">
                  Allow new users to sign up
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded ${
                  settings.signupEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {settings.signupEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Booking Enabled</p>
                <p className="text-sm text-gray-600">
                  Allow users to create bookings
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded ${
                  settings.bookingEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {settings.bookingEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-gray-600">
                  Put platform in maintenance mode
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded ${
                  settings.maintenanceMode
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {settings.maintenanceMode ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </Card>

        {/* System Configuration */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">System Configuration</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AIS Polling Interval</p>
                <p className="text-sm text-gray-600">
                  How often to poll AIS data
                </p>
              </div>
              <span className="font-bold">{settings.aisPollingInterval} min</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Expiry Alert Days</p>
                <p className="text-sm text-gray-600">
                  Days before expiry to send alerts
                </p>
              </div>
              <span className="font-bold">{settings.expiryAlertDays} days</span>
            </div>
          </div>
        </Card>

        {/* Payment Providers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Providers</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Paystack (Primary)</p>
                <p className="text-sm text-gray-600">
                  Primary payment provider
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded ${
                  settings.paystackEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {settings.paystackEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Flutterwave (Fallback)</p>
                <p className="text-sm text-gray-600">
                  Fallback payment provider
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded ${
                  settings.flutterwaveEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {settings.flutterwaveEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
