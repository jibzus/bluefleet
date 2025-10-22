"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import type { BookingTrendPoint } from "@/lib/validators/analytics";

interface BookingTrendsChartProps {
  data: BookingTrendPoint[];
}

const formatMonth = (value: string) => {
  const date = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export function BookingTrendsChart({ data }: BookingTrendsChartProps) {
  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Booking trends</CardTitle>
      <div className="h-[320px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No booking activity in the selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                className="text-xs text-muted-foreground"
              />
              <YAxis className="text-xs text-muted-foreground" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => [value, "Bookings"]}
                labelFormatter={formatMonth}
              />
              <Legend />
              <Line type="monotone" dataKey="requested" name="Requested" stroke="hsl(var(--chart-1))" strokeWidth={2} />
              <Line type="monotone" dataKey="accepted" name="Accepted" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="hsl(var(--chart-3))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

