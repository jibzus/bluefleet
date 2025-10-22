import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildOperatorAnalyticsPayload,
  type OperatorAnalyticsBooking,
} from "@/lib/validators/analytics";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import type { DateRangeFilter, DateRangePreset } from "@/components/analytics/TimeFilter";

interface AnalyticsPageSearchParams {
  startDate?: string;
  endDate?: string;
  vesselId?: string;
}

function deriveDefaultRange(): { preset: DateRangePreset; startDate: Date; endDate: Date } {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 90);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { preset: "90days", startDate: start, endDate: end };
}

export default async function OperatorAnalyticsPage({
  searchParams,
}: {
  searchParams: AnalyticsPageSearchParams;
}) {
  const user = await requireRole(["OPERATOR"]);

  const { preset, startDate, endDate } = (() => {
    const providedStart = searchParams.startDate ? new Date(searchParams.startDate) : null;
    const providedEnd = searchParams.endDate ? new Date(searchParams.endDate) : null;

    if (providedStart || providedEnd) {
      return {
        preset: "custom" as DateRangePreset,
        startDate: providedStart ?? deriveDefaultRange().startDate,
        endDate: providedEnd ?? deriveDefaultRange().endDate,
      };
    }

    return deriveDefaultRange();
  })();

  const whereClause: Record<string, unknown> = {
    operatorId: user.id,
  };

  if (startDate || endDate) {
    whereClause.createdAt = {} as Record<string, Date>;
    if (startDate) {
      (whereClause.createdAt as Record<string, Date>).gte = startDate;
    }
    if (endDate) {
      (whereClause.createdAt as Record<string, Date>).lte = endDate;
    }
  }

  if (searchParams.vesselId) {
    whereClause.vesselId = searchParams.vesselId;
  }

  const bookings = (await prisma.booking.findMany({
    where: whereClause,
    include: {
      vessel: {
        select: {
          id: true,
          slug: true,
          type: true,
          specs: true,
          homePort: true,
          ownerId: true,
        },
      },
      escrow: true,
      contract: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as OperatorAnalyticsBooking[];

  const payload = buildOperatorAnalyticsPayload(bookings);

  const initialFilter: DateRangeFilter = {
    preset,
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null,
  };

  return (
    <AnalyticsDashboard
      initialData={payload}
      initialFilter={initialFilter}
      initialVesselId={searchParams.vesselId ?? null}
    />
  );
}

