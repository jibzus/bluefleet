"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import type { StatusDistributionDatum } from "@/lib/validators/analytics";

interface StatusDistributionChartProps {
  data: StatusDistributionDatum[];
  total: number;
}

export function StatusDistributionChart({ data, total }: StatusDistributionChartProps) {
  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Booking status distribution</CardTitle>
      <div className="h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No bookings available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={70}
                outerRadius={110}
                dataKey="count"
                nameKey="status"
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}`, name]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-4 text-center">
        <p className="text-2xl font-semibold text-foreground">{total}</p>
        <p className="text-xs text-muted-foreground">Total bookings</p>
      </div>
    </Card>
  );
}

