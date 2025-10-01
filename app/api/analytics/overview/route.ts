import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  analyticsQuerySchema,
  calculateRevenueMetrics,
  calculatePerformanceKPIs,
} from "@/lib/validators/analytics";

// GET /api/analytics/overview - Get platform-wide analytics
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Validate query
    const validation = analyticsQuerySchema.safeParse({
      startDate,
      endDate,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Fetch data based on user role
    let whereClause: any = {};

    if (user.role === "OWNER") {
      // Owners see only their vessels' data
      whereClause = {
        vessel: {
          ownerId: user.id,
        },
      };
    } else if (user.role === "OPERATOR") {
      // Operators see only their bookings
      whereClause = {
        operatorId: user.id,
      };
    } else if (user.role !== "ADMIN") {
      // Regulators and others have no access
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Add date filter
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        vessel: {
          select: {
            id: true,
            type: true,
            specs: true,
          },
        },
      },
    });

    // Fetch vessels (for owners and admins)
    let vessels: any[] = [];
    if (user.role === "OWNER") {
      vessels = await prisma.vessel.findMany({
        where: { ownerId: user.id },
      });
    } else if (user.role === "ADMIN") {
      vessels = await prisma.vessel.findMany();
    }

    // Calculate metrics
    const revenueMetrics = calculateRevenueMetrics(bookings);
    const performanceKPIs = calculatePerformanceKPIs(vessels, bookings);

    // Calculate booking status breakdown
    const statusBreakdown = {
      requested: bookings.filter((b) => b.status === "REQUESTED").length,
      countered: bookings.filter((b) => b.status === "COUNTERED").length,
      accepted: bookings.filter((b) => b.status === "ACCEPTED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    };

    // Calculate vessel type breakdown
    const vesselTypeBreakdown: Record<string, number> = {};
    for (const booking of bookings) {
      const type = booking.vessel.type;
      vesselTypeBreakdown[type] = (vesselTypeBreakdown[type] || 0) + 1;
    }

    return NextResponse.json({
      revenueMetrics,
      performanceKPIs,
      statusBreakdown,
      vesselTypeBreakdown,
      period: {
        startDate: startDate || "all time",
        endDate: endDate || "now",
      },
    });
  } catch (error: any) {
    console.error("Error fetching analytics overview:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

