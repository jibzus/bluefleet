import { z } from "zod";

// Analytics Query Schema
export const analyticsQuerySchema = z.object({
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  vesselId: z.string().optional(),
  ownerId: z.string().optional(),
  operatorId: z.string().optional(),
  groupBy: z.enum(["day", "week", "month", "year"]).default("month"),
});

// Pricing Suggestion Schema
export const pricingSuggestionSchema = z.object({
  vesselId: z.string().min(1, "Vessel ID is required"),
  suggestedDailyRate: z.number().min(0),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  rationale: z.string(),
  factors: z.record(z.any()),
});

// Analytics Metrics Types
export interface VesselUtilization {
  vesselId: string;
  vesselName: string;
  totalDays: number;
  bookedDays: number;
  utilizationRate: number; // percentage
  revenue: number;
  bookingCount: number;
  averageCharterDuration: number; // days
}

export interface RevenueMetrics {
  totalRevenue: number;
  platformFees: number;
  ownerEarnings: number;
  bookingCount: number;
  averageBookingValue: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

export interface PerformanceKPIs {
  totalVessels: number;
  activeVessels: number;
  totalBookings: number;
  acceptedBookings: number;
  conversionRate: number; // percentage
  averageResponseTime: number; // hours
  averageUtilization: number; // percentage
  totalRevenue: number;
  revenueGrowth: number; // percentage
}

export interface MarketInsights {
  topVesselTypes: Array<{
    type: string;
    count: number;
    averageRate: number;
  }>;
  demandTrends: Array<{
    month: string;
    bookings: number;
    trend: "UP" | "DOWN" | "STABLE";
  }>;
  pricingBenchmarks: Array<{
    vesselType: string;
    minRate: number;
    maxRate: number;
    avgRate: number;
  }>;
}

// Calculate vessel utilization
export async function calculateVesselUtilization(
  vesselId: string,
  startDate: Date,
  endDate: Date,
  bookings: any[]
): Promise<VesselUtilization> {
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let bookedDays = 0;
  let revenue = 0;

  for (const booking of bookings) {
    const bookingStart = new Date(booking.start);
    const bookingEnd = new Date(booking.end);
    const days = Math.ceil(
      (bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    bookedDays += days;

    // Calculate revenue from booking terms
    const terms = booking.terms as any;
    revenue += terms.totalCost || 0;
  }

  const utilizationRate = totalDays > 0 ? (bookedDays / totalDays) * 100 : 0;
  const averageCharterDuration =
    bookings.length > 0 ? bookedDays / bookings.length : 0;

  return {
    vesselId,
    vesselName: "", // Will be filled by caller
    totalDays,
    bookedDays,
    utilizationRate,
    revenue,
    bookingCount: bookings.length,
    averageCharterDuration,
  };
}

// Calculate revenue metrics
export function calculateRevenueMetrics(
  bookings: any[],
  platformFeePercent: number = 7
): RevenueMetrics {
  let totalRevenue = 0;
  const revenueByMonth: Map<string, { revenue: number; bookings: number }> =
    new Map();

  for (const booking of bookings) {
    const terms = booking.terms as any;
    const revenue = terms.totalCost || 0;
    totalRevenue += revenue;

    // Group by month
    const month = new Date(booking.createdAt).toISOString().slice(0, 7); // YYYY-MM
    const existing = revenueByMonth.get(month) || { revenue: 0, bookings: 0 };
    revenueByMonth.set(month, {
      revenue: existing.revenue + revenue,
      bookings: existing.bookings + 1,
    });
  }

  const platformFees = totalRevenue * (platformFeePercent / 100);
  const ownerEarnings = totalRevenue - platformFees;
  const averageBookingValue =
    bookings.length > 0 ? totalRevenue / bookings.length : 0;

  return {
    totalRevenue,
    platformFees,
    ownerEarnings,
    bookingCount: bookings.length,
    averageBookingValue,
    revenueByMonth: Array.from(revenueByMonth.entries()).map(
      ([month, data]) => ({
        month,
        revenue: data.revenue,
        bookings: data.bookings,
      })
    ),
  };
}

// Calculate performance KPIs
export function calculatePerformanceKPIs(
  vessels: any[],
  bookings: any[]
): PerformanceKPIs {
  const totalVessels = vessels.length;
  const activeVessels = new Set(bookings.map((b) => b.vesselId)).size;
  const totalBookings = bookings.length;
  const acceptedBookings = bookings.filter(
    (b) => b.status === "ACCEPTED"
  ).length;
  const conversionRate =
    totalBookings > 0 ? (acceptedBookings / totalBookings) * 100 : 0;

  // Calculate average response time (time from request to acceptance/rejection)
  let totalResponseTime = 0;
  let responseCount = 0;

  for (const booking of bookings) {
    if (booking.status !== "REQUESTED") {
      const created = new Date(booking.createdAt).getTime();
      const updated = new Date(booking.updatedAt).getTime();
      totalResponseTime += (updated - created) / (1000 * 60 * 60); // hours
      responseCount++;
    }
  }

  const averageResponseTime =
    responseCount > 0 ? totalResponseTime / responseCount : 0;

  // Calculate total revenue
  let totalRevenue = 0;
  for (const booking of bookings) {
    const terms = booking.terms as any;
    totalRevenue += terms.totalCost || 0;
  }

  return {
    totalVessels,
    activeVessels,
    totalBookings,
    acceptedBookings,
    conversionRate,
    averageResponseTime,
    averageUtilization: 0, // Will be calculated separately
    totalRevenue,
    revenueGrowth: 0, // Will be calculated with historical data
  };
}

// Generate pricing suggestion based on rules
export function generatePricingSuggestion(
  vessel: any,
  marketData: {
    avgRateForType: number;
    demandLevel: "LOW" | "MEDIUM" | "HIGH";
    seasonality: "LOW" | "MEDIUM" | "HIGH";
    utilizationRate: number;
  }
): {
  suggestedDailyRate: number;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  rationale: string;
  factors: Record<string, any>;
} {
  const specs = vessel.specs as any;
  const currentRate = specs.pricing?.dailyRate || 0;
  const { avgRateForType, demandLevel, seasonality, utilizationRate } =
    marketData;

  let suggestedRate = avgRateForType;
  const factors: Record<string, any> = {
    currentRate,
    marketAverage: avgRateForType,
    demandLevel,
    seasonality,
    utilizationRate,
  };

  // Adjust for demand
  if (demandLevel === "HIGH") {
    suggestedRate *= 1.15; // +15%
    factors.demandAdjustment = "+15%";
  } else if (demandLevel === "LOW") {
    suggestedRate *= 0.9; // -10%
    factors.demandAdjustment = "-10%";
  }

  // Adjust for seasonality
  if (seasonality === "HIGH") {
    suggestedRate *= 1.1; // +10%
    factors.seasonalityAdjustment = "+10%";
  } else if (seasonality === "LOW") {
    suggestedRate *= 0.95; // -5%
    factors.seasonalityAdjustment = "-5%";
  }

  // Adjust for utilization
  if (utilizationRate > 80) {
    suggestedRate *= 1.1; // High utilization = increase price
    factors.utilizationAdjustment = "+10% (high demand)";
  } else if (utilizationRate < 30) {
    suggestedRate *= 0.9; // Low utilization = decrease price
    factors.utilizationAdjustment = "-10% (low demand)";
  }

  // Determine confidence
  let confidence: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  if (utilizationRate > 50 && demandLevel !== "LOW") {
    confidence = "HIGH";
  } else if (utilizationRate < 20 || demandLevel === "LOW") {
    confidence = "LOW";
  }

  // Generate rationale
  const rationale = `Based on market average (${avgRateForType.toLocaleString()} NGN/day) for ${
    vessel.type
  }, current ${demandLevel.toLowerCase()} demand, ${seasonality.toLowerCase()} season, and ${utilizationRate.toFixed(
    0
  )}% utilization rate.`;

  return {
    suggestedDailyRate: Math.round(suggestedRate),
    confidence,
    rationale,
    factors,
  };
}

// Format currency
export function formatCurrency(amount: number, currency: string = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Calculate growth rate
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

