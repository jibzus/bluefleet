"use client";

import { useMemo, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import type { VesselComparisonRow } from "@/lib/validators/analytics";
import { formatCurrency } from "@/lib/validators/analytics";

interface VesselComparisonTableProps {
  data: VesselComparisonRow[];
  currency: string;
}

type SortKey = keyof Pick<
  VesselComparisonRow,
  "charterCount" | "totalDays" | "totalSpent" | "avgDailyRate" | "lastUsed"
>;

export function VesselComparisonTable({ data, currency }: VesselComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("totalSpent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedData = useMemo(() => {
    const next = [...data];
    next.sort((a, b) => {
      const aValue = a[sortKey] ?? 0;
      const bValue = b[sortKey] ?? 0;
      if (aValue === bValue) return 0;
      const direction = sortDir === "asc" ? 1 : -1;
      if (sortKey === "lastUsed") {
        return (new Date(aValue || 0).getTime() - new Date(bValue || 0).getTime()) * direction;
      }
      return (Number(aValue) - Number(bValue)) * direction;
    });
    return next;
  }, [data, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "lastUsed" ? "desc" : "desc");
    }
  };

  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Vessel comparison</CardTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Vessel</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th
                className="px-3 py-2 font-medium"
                onClick={() => handleSort("charterCount")}
              >
                <button type="button" className="flex items-center gap-1 uppercase tracking-wide">
                  Charters
                  {sortKey === "charterCount" ? <span>{sortDir === "asc" ? "↑" : "↓"}</span> : null}
                </button>
              </th>
              <th className="px-3 py-2 font-medium" onClick={() => handleSort("totalDays")}>
                <button type="button" className="flex items-center gap-1 uppercase tracking-wide">
                  Days
                  {sortKey === "totalDays" ? <span>{sortDir === "asc" ? "↑" : "↓"}</span> : null}
                </button>
              </th>
              <th className="px-3 py-2 font-medium" onClick={() => handleSort("totalSpent")}>
                <button type="button" className="flex items-center gap-1 uppercase tracking-wide">
                  Total spent
                  {sortKey === "totalSpent" ? <span>{sortDir === "asc" ? "↑" : "↓"}</span> : null}
                </button>
              </th>
              <th className="px-3 py-2 font-medium" onClick={() => handleSort("avgDailyRate")}>
                <button type="button" className="flex items-center gap-1 uppercase tracking-wide">
                  Avg daily rate
                  {sortKey === "avgDailyRate" ? <span>{sortDir === "asc" ? "↑" : "↓"}</span> : null}
                </button>
              </th>
              <th className="px-3 py-2 font-medium" onClick={() => handleSort("lastUsed")}>
                <button type="button" className="flex items-center gap-1 uppercase tracking-wide">
                  Last used
                  {sortKey === "lastUsed" ? <span>{sortDir === "asc" ? "↑" : "↓"}</span> : null}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((vessel) => (
              <tr key={vessel.vesselId} className="border-b border-border/40 text-sm text-foreground last:border-0">
                <td className="px-3 py-3 font-medium">{vessel.vesselName}</td>
                <td className="px-3 py-3 text-muted-foreground">{vessel.vesselType}</td>
                <td className="px-3 py-3 text-right">{vessel.charterCount}</td>
                <td className="px-3 py-3 text-right">{vessel.totalDays}</td>
                <td className="px-3 py-3 text-right">{formatCurrency(vessel.totalSpent, currency)}</td>
                <td className="px-3 py-3 text-right">{formatCurrency(vessel.avgDailyRate, currency)}</td>
                <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                  {vessel.lastUsed ? new Date(vessel.lastUsed).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

