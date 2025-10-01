"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface PricingTabProps {
  data: any;
  onChange: (pricing: any) => void;
}

export function PricingTab({ data, onChange }: PricingTabProps) {
  const [pricing, setPricing] = useState(data || {
    dailyRate: "",
    currency: "USD",
    minimumDays: 1,
    securityDeposit: 0,
    fuelIncluded: false,
    crewIncluded: false,
  });

  useEffect(() => {
    onChange(pricing);
  }, [pricing]);

  const handleChange = (field: string, value: any) => {
    setPricing((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Pricing Configuration</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Daily Rate <span className="text-red-600">*</span>
            </label>
            <Input
              type="number"
              value={pricing.dailyRate || ""}
              onChange={(e) => handleChange("dailyRate", parseFloat(e.target.value))}
              placeholder="5000"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Currency <span className="text-red-600">*</span>
            </label>
            <select
              value={pricing.currency || "USD"}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="NGN">NGN (₦)</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Minimum Days
            </label>
            <Input
              type="number"
              value={pricing.minimumDays || 1}
              onChange={(e) => handleChange("minimumDays", parseInt(e.target.value))}
              min="1"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Security Deposit
            </label>
            <Input
              type="number"
              value={pricing.securityDeposit || 0}
              onChange={(e) => handleChange("securityDeposit", parseFloat(e.target.value))}
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={pricing.fuelIncluded || false}
              onChange={(e) => handleChange("fuelIncluded", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Fuel Included in Rate
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={pricing.crewIncluded || false}
              onChange={(e) => handleChange("crewIncluded", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Crew Included in Rate
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

