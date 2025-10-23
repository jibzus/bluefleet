"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/validators/analytics";
import type { MonthlyRevenueDatum } from "@/lib/validators/analytics";

interface MonthlyRevenueChartProps {
  data: MonthlyRevenueDatum[];
  currency: string;
}

const formatMonth = (value: string) => {
  const date = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export function MonthlyRevenueChart({ data, currency }: MonthlyRevenueChartProps) {
  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Monthly revenue insight</CardTitle>
      <div className="h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No monthly revenue data for the selected filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickFormatter={formatMonth} className="text-xs text-muted-foreground" />
              <YAxis
                yAxisId="left"
                className="text-xs text-muted-foreground"
                tickFormatter={(value) => formatCurrency(value, currency)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs text-muted-foreground"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number, key: string) => {
                  if (key === "revenue") {
                    return [formatCurrency(value, currency), "Revenue"];
                  }
                  return [value, "Bookings"];
                }}
                labelFormatter={formatMonth}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="Revenue"
                fill="hsl(var(--chart-1))"
                radius={[6, 6, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
