import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildOwnerAnalyticsPayload,
  type OwnerAnalyticsBooking,
} from "@/lib/validators/analytics";
import { OwnerAnalyticsDashboard } from "@/components/analytics/OwnerAnalyticsDashboard";
import type { DateRangeFilter, DateRangePreset } from "@/components/analytics/TimeFilter";

interface OwnerAnalyticsPageSearchParams {
  startDate?: string;
  endDate?: string;
  vesselId?: string;
  ownerId?: string;
}

function deriveDefaultRange(): { preset: DateRangePreset; startDate: Date; endDate: Date } {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 90);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { preset: "90days", startDate: start, endDate: end };
}

export default async function OwnerAnalyticsPage({
  searchParams,
}: {
  searchParams: OwnerAnalyticsPageSearchParams;
}) {
  const user = await requireRole(["OWNER", "ADMIN"]);

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

  const whereClause: Record<string, unknown> = {};

  if (user.role === "OWNER") {
    whereClause.vessel = { ownerId: user.id };
  } else if (searchParams.ownerId) {
    whereClause.vessel = { ownerId: searchParams.ownerId };
  }

  if (startDate || endDate) {
    const createdAt: Record<string, Date> = {};
    if (startDate) {
      createdAt.gte = startDate;
    }
    if (endDate) {
      createdAt.lte = endDate;
    }
    whereClause.createdAt = createdAt;
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
          type: true,
          specs: true,
          ownerId: true,
        },
      },
      operator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      escrow: true,
      contract: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as OwnerAnalyticsBooking[];

  const payload = buildOwnerAnalyticsPayload(bookings);

  const initialFilter: DateRangeFilter = {
    preset,
    startDate: startDate ? startDate.toISOString() : null,
    endDate: endDate ? endDate.toISOString() : null,
  };

  const ownerIdParam = user.role === "ADMIN" ? searchParams.ownerId ?? null : null;

  return (
    <OwnerAnalyticsDashboard
      initialData={payload}
      initialFilter={initialFilter}
      initialVesselId={searchParams.vesselId ?? null}
      ownerIdParam={ownerIdParam}
    />
  );
}
