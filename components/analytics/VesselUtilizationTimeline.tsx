"use client";

import { useMemo } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import type { VesselTimelineItem } from "@/lib/validators/analytics";

interface VesselUtilizationTimelineProps {
  data: VesselTimelineItem[];
}

function computeSpan(bookings: VesselTimelineItem["bookings"]) {
  if (bookings.length === 0) {
    return { start: 0, end: 0 };
  }
  const timestamps = bookings.flatMap((booking) => [new Date(booking.start).getTime(), new Date(booking.end).getTime()]);
  const start = Math.min(...timestamps);
  const end = Math.max(...timestamps);
  return { start, end };
}

export function VesselUtilizationTimeline({ data }: VesselUtilizationTimelineProps) {
  const hasData = data.some((item) => item.bookings.length > 0);

  const sortedData = useMemo(
    () =>
      data
        .map((item) => ({
          ...item,
          bookings: item.bookings.slice().sort((a, b) => a.start.localeCompare(b.start)),
        }))
        .sort((a, b) => a.vesselName.localeCompare(b.vesselName)),
    [data],
  );

  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Vessel utilization</CardTitle>
      {!hasData ? (
        <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">
          No charter history for the selected filters.
        </div>
      ) : (
        <div className="space-y-6">
          {sortedData.map((vessel) => {
            const span = computeSpan(vessel.bookings);
            const totalRange = Math.max(span.end - span.start, 1);

            return (
              <div key={vessel.vesselId} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{vessel.vesselName}</p>
                    <p className="text-xs text-muted-foreground">{vessel.vesselType}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {vessel.bookings.length} charter{vessel.bookings.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="relative h-9 w-full overflow-hidden rounded-full bg-muted">
                  {vessel.bookings.map((booking) => {
                    const start = new Date(booking.start).getTime();
                    const end = new Date(booking.end).getTime();
                    const width = Math.max(((end - start) / totalRange) * 100, 4);
                    const offset = ((start - span.start) / totalRange) * 100;

                    return (
                      <div
                        key={booking.id}
                        className="absolute top-0 h-full rounded-full bg-primary/80 text-[10px] font-medium text-primary-foreground"
                        style={{
                          width: `${width}%`,
                          left: `${Math.max(offset, 0)}%`,
                        }}
                        title={`${new Date(booking.start).toLocaleDateString()} → ${new Date(booking.end).toLocaleDateString()} (${booking.status.toLowerCase()})`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

