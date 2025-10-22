"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DateRangePreset =
  | "today"
  | "week"
  | "month"
  | "30days"
  | "90days"
  | "year"
  | "all"
  | "custom";

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string | null;
  endDate: string | null;
}

interface TimeFilterProps {
  value: DateRangeFilter;
  onChange: (filter: DateRangeFilter) => void;
  isLoading?: boolean;
}

interface PresetOption {
  label: string;
  value: DateRangePreset;
}

const PRESETS: PresetOption[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Last 90 Days", value: "90days" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
  { label: "Custom", value: "custom" },
];

function formatInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = (day + 6) % 7; // convert Sunday=0 to Monday=0
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfWeek(date: Date): Date {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function subtractDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

function calculatePresetRange(preset: DateRangePreset): { startDate: string | null; endDate: string | null } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  switch (preset) {
    case "today": {
      const start = new Date(now);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case "week": {
      const start = startOfWeek(now);
      const end = endOfWeek(now);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case "month": {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case "30days": {
      const start = subtractDays(now, 30);
      return { startDate: start.toISOString(), endDate: new Date().toISOString() };
    }
    case "90days": {
      const start = subtractDays(now, 90);
      return { startDate: start.toISOString(), endDate: new Date().toISOString() };
    }
    case "year": {
      const start = startOfYear(now);
      const end = endOfYear(now);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case "all": {
      return { startDate: null, endDate: null };
    }
    case "custom":
    default:
      return { startDate: null, endDate: null };
  }
}

export function TimeFilter({ value, onChange, isLoading }: TimeFilterProps) {
  const [activePreset, setActivePreset] = useState<DateRangePreset>(value.preset);
  const [customStart, setCustomStart] = useState<string>(value.startDate ? value.startDate.slice(0, 10) : "");
  const [customEnd, setCustomEnd] = useState<string>(value.endDate ? value.endDate.slice(0, 10) : "");

  useEffect(() => {
    setActivePreset(value.preset);
    setCustomStart(value.startDate ? value.startDate.slice(0, 10) : "");
    setCustomEnd(value.endDate ? value.endDate.slice(0, 10) : "");
  }, [value]);

  const presetRanges = useMemo(() => {
    const entries: Record<DateRangePreset, { startDate: string | null; endDate: string | null }> = {
      today: calculatePresetRange("today"),
      week: calculatePresetRange("week"),
      month: calculatePresetRange("month"),
      "30days": calculatePresetRange("30days"),
      "90days": calculatePresetRange("90days"),
      year: calculatePresetRange("year"),
      all: calculatePresetRange("all"),
      custom: { startDate: null, endDate: null },
    };
    return entries;
  }, []);

  const handlePresetClick = (preset: DateRangePreset) => {
    setActivePreset(preset);

    if (preset === "custom") {
      onChange({ preset, startDate: customStart || null, endDate: customEnd || null });
      return;
    }

    const range = presetRanges[preset];
    onChange({ preset, ...range });
  };

  const handleCustomStartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setCustomStart(nextValue);
    if (nextValue && customEnd) {
      onChange({ preset: "custom", startDate: new Date(nextValue).toISOString(), endDate: new Date(customEnd).toISOString() });
    }
  };

  const handleCustomEndChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setCustomEnd(nextValue);
    if (customStart && nextValue) {
      onChange({ preset: "custom", startDate: new Date(customStart).toISOString(), endDate: new Date(nextValue).toISOString() });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant={activePreset === preset.value ? "default" : "outline"}
            size="sm"
            disabled={isLoading}
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {activePreset === "custom" ? (
        <div className="flex flex-col gap-4 sm:flex-row">
          <label className="flex flex-1 flex-col text-sm">
            <span className="mb-1 font-medium text-muted-foreground">Start date</span>
            <input
              type="date"
              className={cn(
                "h-10 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors",
                "focus:border-primary focus:ring-2 focus:ring-primary/20",
              )}
              value={customStart}
              max={customEnd || undefined}
              onChange={handleCustomStartChange}
            />
          </label>
          <label className="flex flex-1 flex-col text-sm">
            <span className="mb-1 font-medium text-muted-foreground">End date</span>
            <input
              type="date"
              className={cn(
                "h-10 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors",
                "focus:border-primary focus:ring-2 focus:ring-primary/20",
              )}
              value={customEnd}
              min={customStart || undefined}
              onChange={handleCustomEndChange}
            />
          </label>
        </div>
      ) : null}

      {value.startDate && value.endDate && value.preset !== "custom" ? (
        <p className="text-xs text-muted-foreground">
          Showing data from {formatInputDate(new Date(value.startDate))} to {formatInputDate(new Date(value.endDate))}
        </p>
      ) : null}
    </div>
  );
}

