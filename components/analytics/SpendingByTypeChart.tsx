"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import type { SpendingByTypeDatum } from "@/lib/validators/analytics";
import { formatCurrency } from "@/lib/validators/analytics";

interface SpendingByTypeChartProps {
  data: SpendingByTypeDatum[];
  currency: string;
}

export function SpendingByTypeChart({ data, currency }: SpendingByTypeChartProps) {
  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Spending by vessel type</CardTitle>
      <div className="h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No spend recorded for the selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(value, currency)}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="vesselType"
                className="text-xs text-muted-foreground"
                width={110}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value, currency)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="totalSpent" name="Total spent" fill="hsl(var(--chart-1))" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

