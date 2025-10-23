"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/validators/analytics";
import type { RevenueTrendDatum } from "@/lib/validators/analytics";

interface RevenueTrendsChartProps {
  data: RevenueTrendDatum[];
  currency: string;
}

const formatMonth = (value: string) => {
  const date = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export function RevenueTrendsChart({ data, currency }: RevenueTrendsChartProps) {
  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Revenue trends</CardTitle>
      <div className="h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No revenue recorded for the selected filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickFormatter={formatMonth} className="text-xs text-muted-foreground" />
              <YAxis
                className="text-xs text-muted-foreground"
                tickFormatter={(value) => formatCurrency(value, currency)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number, key: string) => [
                  formatCurrency(value, currency),
                  key === "revenue" ? "Revenue" : "Cumulative",
                ]}
                labelFormatter={formatMonth}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Monthly revenue"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="cumulativeRevenue"
                name="Cumulative revenue"
                stroke="hsl(var(--chart-2))"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
