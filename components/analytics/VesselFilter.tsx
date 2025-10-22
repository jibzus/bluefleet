"use client";

import type { VesselFilterOption } from "@/lib/validators/analytics";
import { cn } from "@/lib/utils";

interface VesselFilterProps {
  options: VesselFilterOption[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
}

export function VesselFilter({ options, selectedId, onChange, disabled }: VesselFilterProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-muted-foreground">Vessel filter</span>
      <select
        className={cn(
          "h-10 min-w-[240px] rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
        )}
        value={selectedId ?? "all"}
        disabled={disabled}
        onChange={(event) => {
          const value = event.target.value;
          onChange(value === "all" ? null : value);
        }}
      >
        <option value="all">All vessels</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name} ({option.type}) · {option.bookingCount} booking{option.bookingCount === 1 ? "" : "s"}
          </option>
        ))}
      </select>
    </label>
  );
}

