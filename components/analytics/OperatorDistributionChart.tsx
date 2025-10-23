"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/validators/analytics";
import type { OperatorDistributionDatum } from "@/lib/validators/analytics";

interface OperatorDistributionChartProps {
  data: OperatorDistributionDatum[];
  currency: string;
}

export function OperatorDistributionChart({ data, currency }: OperatorDistributionChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-6 space-y-1">
        <CardTitle>Top operators</CardTitle>
        <CardDescription>Identify which operators contribute the most revenue.</CardDescription>
      </div>
      <div className="h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No operator activity for the selected filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.slice(0, 8)}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                className="text-xs text-muted-foreground"
                tickFormatter={(value) => formatCurrency(value, currency)}
              />
              <YAxis
                type="category"
                dataKey="operatorName"
                className="text-xs text-muted-foreground"
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number, key: string, payload) => {
                  if (key === "totalRevenue") {
                    return [formatCurrency(value, currency), "Revenue"];
                  }
                  return [value, "Bookings"];
                }}
                labelFormatter={(value: string, payload) => {
                  const item = payload?.[0];
                  if (item?.payload?.operatorEmail) {
                    return `${value} (${item.payload.operatorEmail})`;
                  }
                  return value;
                }}
              />
              <Bar dataKey="totalRevenue" name="Revenue" fill="hsl(var(--chart-4))" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
