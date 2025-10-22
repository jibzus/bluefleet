"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import type { MonthlySpendingDatum } from "@/lib/validators/analytics";
import { formatCurrency } from "@/lib/validators/analytics";

interface MonthlySpendingChartProps {
  data: MonthlySpendingDatum[];
  currency: string;
}

const formatMonth = (value: string) => {
  const date = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short" });
};

export function MonthlySpendingChart({ data, currency }: MonthlySpendingChartProps) {
  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Monthly spending trend</CardTitle>
      <div className="h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No spending recorded in this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickFormatter={formatMonth} className="text-xs text-muted-foreground" />
              <YAxis
                yAxisId="left"
                tickFormatter={(value) => formatCurrency(value, currency)}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => formatCurrency(value, currency)}
                className="text-xs text-muted-foreground"
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value, currency)}
                labelFormatter={(value) => formatMonth(String(value))}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="monthlySpend" name="Monthly spend" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativeSpend"
                name="Cumulative spend"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

