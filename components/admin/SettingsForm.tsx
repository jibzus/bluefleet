"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  initialSettings: any;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update settings");
      }

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Platform Fee Percentage
        </label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={settings.platformFeePercentage}
          onChange={(e) =>
            setSettings({
              ...settings,
              platformFeePercentage: parseFloat(e.target.value),
            })
          }
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Percentage of booking value charged as platform fee
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Currency</label>
        <select
          value={settings.currency}
          onChange={(e) =>
            setSettings({ ...settings, currency: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        >
          <option value="NGN">NGN (Nigerian Naira)</option>
          <option value="USD">USD (US Dollar)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          AIS Polling Interval (minutes)
        </label>
        <input
          type="number"
          min="5"
          max="60"
          value={settings.aisPollingInterval}
          onChange={(e) =>
            setSettings({
              ...settings,
              aisPollingInterval: parseInt(e.target.value),
            })
          }
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          How often to poll AIS data (5-60 minutes)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Expiry Alert Days
        </label>
        <input
          type="number"
          min="1"
          max="90"
          value={settings.expiryAlertDays}
          onChange={(e) =>
            setSettings({
              ...settings,
              expiryAlertDays: parseInt(e.target.value),
            })
          }
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Days before expiry to send alerts (1-90 days)
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="paystackEnabled"
          checked={settings.paystackEnabled}
          onChange={(e) =>
            setSettings({ ...settings, paystackEnabled: e.target.checked })
          }
          className="rounded"
          disabled={loading}
        />
        <label htmlFor="paystackEnabled" className="text-sm font-medium">
          Enable Paystack (Primary)
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="flutterwaveEnabled"
          checked={settings.flutterwaveEnabled}
          onChange={(e) =>
            setSettings({ ...settings, flutterwaveEnabled: e.target.checked })
          }
          className="rounded"
          disabled={loading}
        />
        <label htmlFor="flutterwaveEnabled" className="text-sm font-medium">
          Enable Flutterwave (Fallback)
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="signupEnabled"
          checked={settings.signupEnabled}
          onChange={(e) =>
            setSettings({ ...settings, signupEnabled: e.target.checked })
          }
          className="rounded"
          disabled={loading}
        />
        <label htmlFor="signupEnabled" className="text-sm font-medium">
          Enable Signup
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="bookingEnabled"
          checked={settings.bookingEnabled}
          onChange={(e) =>
            setSettings({ ...settings, bookingEnabled: e.target.checked })
          }
          className="rounded"
          disabled={loading}
        />
        <label htmlFor="bookingEnabled" className="text-sm font-medium">
          Enable Booking
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.maintenanceMode}
          onChange={(e) =>
            setSettings({ ...settings, maintenanceMode: e.target.checked })
          }
          className="rounded"
          disabled={loading}
        />
        <label htmlFor="maintenanceMode" className="text-sm font-medium">
          Maintenance Mode
        </label>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
          Settings updated successfully!
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}

