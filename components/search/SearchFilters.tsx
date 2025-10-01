"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VESSEL_TYPES = ["Cargo", "Tanker", "Container", "Bulk Carrier", "Tug", "Supply", "Other"];
const CURRENCIES = ["USD", "EUR", "GBP", "NGN"];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/search");
  };

  const hasFilters = Array.from(searchParams.keys()).some(
    (key) => !["q", "sort"].includes(key)
  );

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-xs">
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Vessel Type */}
        <div>
          <label className="mb-2 block text-sm font-medium">Vessel Type</label>
          <select
            value={searchParams.get("type") || ""}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Types</option>
            {VESSEL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={searchParams.get("status") || ""}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="mb-2 block text-sm font-medium">Daily Rate</label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min"
              value={searchParams.get("minPrice") || ""}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="number"
              placeholder="Max"
              value={searchParams.get("maxPrice") || ""}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Currency */}
        <div>
          <label className="mb-2 block text-sm font-medium">Currency</label>
          <select
            value={searchParams.get("currency") || ""}
            onChange={(e) => updateFilter("currency", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Currencies</option>
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="mb-2 block text-sm font-medium">Home Port</label>
          <input
            type="text"
            placeholder="e.g., Lagos"
            value={searchParams.get("location") || ""}
            onChange={(e) => updateFilter("location", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Year Built */}
        <div>
          <label className="mb-2 block text-sm font-medium">Year Built</label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="From"
              value={searchParams.get("minYear") || ""}
              onChange={(e) => updateFilter("minYear", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="number"
              placeholder="To"
              value={searchParams.get("maxYear") || ""}
              onChange={(e) => updateFilter("maxYear", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Compliance */}
        <div>
          <label className="mb-2 block text-sm font-medium">Compliance</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={searchParams.get("noxCompliant") === "true"}
                onChange={(e) =>
                  updateFilter("noxCompliant", e.target.checked ? "true" : "")
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">NOx Compliant</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={searchParams.get("soxCompliant") === "true"}
                onChange={(e) =>
                  updateFilter("soxCompliant", e.target.checked ? "true" : "")
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">SOx Compliant</span>
            </label>
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="mb-2 block text-sm font-medium">Available From</label>
          <input
            type="date"
            value={searchParams.get("availableFrom") || ""}
            onChange={(e) => updateFilter("availableFrom", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
    </Card>
  );
}

