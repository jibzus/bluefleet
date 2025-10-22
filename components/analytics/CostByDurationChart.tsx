"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import type { CostByDurationDatum } from "@/lib/validators/analytics";
import { formatCurrency } from "@/lib/validators/analytics";

interface CostByDurationChartProps {
  data: CostByDurationDatum[];
  currency: string;
}

export function CostByDurationChart({ data, currency }: CostByDurationChartProps) {
  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Charter cost by duration</CardTitle>
      <div className="h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No accepted bookings to analyse.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="duration"
                name="Duration"
                unit="d"
                className="text-xs text-muted-foreground"
              />
              <YAxis
                type="number"
                dataKey="cost"
                name="Cost"
                tickFormatter={(value) => formatCurrency(value, currency)}
                className="text-xs text-muted-foreground"
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value: number, name: string) =>
                  name === "duration" ? [`${value} days`, "Duration"] : [formatCurrency(value, currency), "Cost"]
                }
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Scatter data={data} name="Bookings" fill="hsl(var(--chart-1))" />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

