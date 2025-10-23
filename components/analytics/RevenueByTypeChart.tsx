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
import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/validators/analytics";
import type { RevenueByTypeDatum } from "@/lib/validators/analytics";

interface RevenueByTypeChartProps {
  data: RevenueByTypeDatum[];
  currency: string;
}

export function RevenueByTypeChart({ data, currency }: RevenueByTypeChartProps) {
  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Revenue by vessel type</CardTitle>
      <div className="h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No accepted bookings for the selected filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                className="text-xs text-muted-foreground"
                tickFormatter={(value) => formatCurrency(value, currency)}
              />
              <YAxis type="category" dataKey="vesselType" className="text-xs text-muted-foreground" width={110} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => [formatCurrency(value, currency), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
