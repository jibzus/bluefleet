import { z } from "zod";
import type { Prisma } from "@prisma/client";

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

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export type OperatorAnalyticsBooking = Prisma.BookingGetPayload<{
  include: {
    vessel: {
      select: {
        id: true;
        slug: true;
        type: true;
        specs: true;
        homePort: true;
        ownerId: true;
      };
    };
    escrow: true;
    contract: true;
  };
}>;

export interface OperatorMetricSummary {
  activeBookings: number;
  totalSpent: number;
  vesselsChartered: number;
  pendingRequests: number;
  successRate: number;
  averageDuration: number;
  acceptedBookings: number;
  totalRequests: number;
}

export interface BookingTrendPoint {
  month: string;
  requested: number;
  accepted: number;
  cancelled: number;
}

export interface SpendingByTypeDatum {
  vesselType: string;
  totalSpent: number;
  bookingCount: number;
}

export interface StatusDistributionDatum {
  status: string;
  count: number;
  fill: string;
  [key: string]: string | number;
}

export interface MonthlySpendingDatum {
  month: string;
  monthlySpend: number;
  cumulativeSpend: number;
}

export interface CostByDurationDatum {
  bookingId: string;
  duration: number;
  cost: number;
  vesselType: string;
}

export interface VesselTimelineBooking {
  id: string;
  start: string;
  end: string;
  status: string;
}

export interface VesselTimelineItem {
  vesselId: string;
  vesselName: string;
  vesselType: string;
  bookings: VesselTimelineBooking[];
}

export interface VesselComparisonRow {
  vesselId: string;
  vesselName: string;
  vesselType: string;
  charterCount: number;
  totalDays: number;
  totalSpent: number;
  avgDailyRate: number;
  lastUsed?: string;
}

export interface PaymentSummary {
  pendingAmount: number;
  fundedAmount: number;
  releasedAmount: number;
  failedCount: number;
  currency: string;
}

export interface PaymentHistoryRow {
  id: string;
  date: string;
  vesselName: string;
  amount: number;
  fee: number;
  provider: string;
  status: string;
}

export interface BudgetTracking {
  monthlyLimit: number;
  currentMonthSpend: number;
  projectedSpend: number;
  utilizationPercent: number;
  isOverBudget: boolean;
}

export interface BookingFunnelMetrics {
  requested: number;
  countered: number;
  accepted: number;
  cancelled: number;
  conversionRate: number;
}

export interface ResponseTimeMetrics {
  averageHours: number;
  fastestHours: number;
  slowestHours: number;
  byVesselType: Array<{ vesselType: string; averageHours: number }>;
}

export interface AcceptanceRateMetrics {
  overallRate: number;
  byVesselType: Array<{ vesselType: string; rate: number }>;
  byOwner: Array<{ ownerId: string; rate: number }>;
  trend: Array<{ month: string; rate: number }>;
}

export interface TripCompletionMetrics {
  completedTrips: number;
  earlyTerminations: number;
  tripExtensions: number;
  completionRate: number;
}

export interface EfficiencyBreakdownItem {
  value: number;
  weight: number;
  score: number;
}

export interface OperationalEfficiencyScore {
  score: number;
  breakdown: {
    bookingSuccessRate: EfficiencyBreakdownItem;
    averageResponseTime: EfficiencyBreakdownItem;
    tripCompletionRate: EfficiencyBreakdownItem;
    paymentSuccessRate: EfficiencyBreakdownItem;
  };
}

export interface VesselFilterOption {
  id: string;
  name: string;
  type: string;
  bookingCount: number;
}

export interface OperatorAnalyticsPayload {
  bookings: OperatorAnalyticsBooking[];
  metrics: OperatorMetricSummary;
  bookingTrends: BookingTrendPoint[];
  spendingByType: SpendingByTypeDatum[];
  statusDistribution: StatusDistributionDatum[];
  monthlySpending: MonthlySpendingDatum[];
  costByDuration: CostByDurationDatum[];
  vesselTimeline: VesselTimelineItem[];
  vesselComparison: VesselComparisonRow[];
  paymentSummary: PaymentSummary;
  paymentHistory: PaymentHistoryRow[];
  budget: BudgetTracking;
  bookingFunnel: BookingFunnelMetrics;
  responseTime: ResponseTimeMetrics;
  acceptance: AcceptanceRateMetrics;
  tripCompletion: TripCompletionMetrics;
  efficiency: OperationalEfficiencyScore;
  vessels: VesselFilterOption[];
}

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: "hsl(var(--chart-1))",
  COUNTERED: "hsl(var(--chart-4))",
  ACCEPTED: "hsl(var(--chart-2))",
  CANCELLED: "hsl(var(--chart-5))",
};

function extractVesselName(booking: OperatorAnalyticsBooking): string {
  const specs = (booking.vessel?.specs as any) || {};
  return specs.name || "Unnamed Vessel";
}

function normalizeAmount(amount?: number | null): number {
  if (!amount) {
    return 0;
  }
  return amount > 100000 ? amount / 100 : amount;
}

function durationInDays(start: Date | string, end: Date | string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  if (Number.isNaN(diff) || diff <= 0) {
    return 0;
  }
  return Math.ceil(diff / DAY_IN_MS);
}

function bookingCost(booking: OperatorAnalyticsBooking): number {
  const terms = (booking.terms as any) || {};
  return typeof terms.totalCost === "number" ? terms.totalCost : 0;
}

export function calculateOperatorMetrics(
  bookings: OperatorAnalyticsBooking[],
): OperatorMetricSummary {
  const activeBookings = bookings.filter(
    (b) => b.status === "ACCEPTED" && b.escrow?.status === "FUNDED",
  ).length;

  const currentYear = new Date().getFullYear();
  const totalSpent = bookings
    .filter((b) => new Date(b.createdAt).getFullYear() === currentYear)
    .reduce((sum, b) => sum + bookingCost(b), 0);

  const vesselsChartered = new Set(bookings.map((b) => b.vesselId)).size;
  const pendingRequests = bookings.filter(
    (b) => b.status === "REQUESTED" || b.status === "COUNTERED",
  ).length;
  const acceptedBookings = bookings.filter((b) => b.status === "ACCEPTED").length;
  const totalRequests = bookings.length;
  const successRate = totalRequests > 0 ? (acceptedBookings / totalRequests) * 100 : 0;

  const averageDuration =
    acceptedBookings > 0
      ?
          bookings
            .filter((b) => b.status === "ACCEPTED")
            .reduce((sum, b) => sum + durationInDays(b.start, b.end), 0) /
        acceptedBookings
      : 0;

  return {
    activeBookings,
    totalSpent,
    vesselsChartered,
    pendingRequests,
    successRate,
    averageDuration,
    acceptedBookings,
    totalRequests,
  };
}

export function prepareBookingTrendData(
  bookings: OperatorAnalyticsBooking[],
): BookingTrendPoint[] {
  const monthlyData = new Map<string, BookingTrendPoint>();

  bookings.forEach((booking) => {
    const month = new Date(booking.createdAt).toISOString().slice(0, 7);
    if (!monthlyData.has(month)) {
      monthlyData.set(month, {
        month,
        requested: 0,
        accepted: 0,
        cancelled: 0,
      });
    }

    const entry = monthlyData.get(month)!;
    if (booking.status === "REQUESTED") entry.requested += 1;
    if (booking.status === "ACCEPTED") entry.accepted += 1;
    if (booking.status === "CANCELLED") entry.cancelled += 1;
  });

  return Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function prepareSpendingByTypeData(
  bookings: OperatorAnalyticsBooking[],
): SpendingByTypeDatum[] {
  const typeData = new Map<string, SpendingByTypeDatum>();

  bookings.forEach((booking) => {
    const vesselType = booking.vessel?.type || "Unknown";
    if (!typeData.has(vesselType)) {
      typeData.set(vesselType, {
        vesselType,
        totalSpent: 0,
        bookingCount: 0,
      });
    }

    const entry = typeData.get(vesselType)!;
    entry.totalSpent += bookingCost(booking);
    entry.bookingCount += 1;
  });

  return Array.from(typeData.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

export function prepareStatusDistributionData(
  bookings: OperatorAnalyticsBooking[],
): StatusDistributionDatum[] {
  const statusCounts = new Map<string, number>();

  bookings.forEach((booking) => {
    const count = statusCounts.get(booking.status) || 0;
    statusCounts.set(booking.status, count + 1);
  });

  return Array.from(statusCounts.entries())
    .map(([status, count]) => ({
      status,
      count,
      fill: STATUS_COLORS[status] || "hsl(var(--chart-1))",
    }))
    .sort((a, b) => b.count - a.count);
}

export function prepareMonthlySpendingData(
  bookings: OperatorAnalyticsBooking[],
): MonthlySpendingDatum[] {
  const monthlyTotals = new Map<string, number>();

  bookings.forEach((booking) => {
    const month = new Date(booking.createdAt).toISOString().slice(0, 7);
    monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + bookingCost(booking));
  });

  const months = Array.from(monthlyTotals.keys()).sort();
  let cumulative = 0;

  return months.map((month) => {
    const monthlySpend = monthlyTotals.get(month) || 0;
    cumulative += monthlySpend;
    return {
      month,
      monthlySpend,
      cumulativeSpend: cumulative,
    };
  });
}

export function prepareCostByDurationData(
  bookings: OperatorAnalyticsBooking[],
): CostByDurationDatum[] {
  return bookings
    .filter((booking) => booking.status === "ACCEPTED")
    .map((booking) => ({
      bookingId: booking.id,
      duration: durationInDays(booking.start, booking.end),
      cost: bookingCost(booking),
      vesselType: booking.vessel?.type || "Unknown",
    }));
}

export function prepareVesselTimelineData(
  bookings: OperatorAnalyticsBooking[],
): VesselTimelineItem[] {
  const vessels = new Map<string, VesselTimelineItem>();

  bookings.forEach((booking) => {
    const vesselId = booking.vesselId;
    if (!vessels.has(vesselId)) {
      vessels.set(vesselId, {
        vesselId,
        vesselName: extractVesselName(booking),
        vesselType: booking.vessel?.type || "Unknown",
        bookings: [],
      });
    }

    const entry = vessels.get(vesselId)!;
    entry.bookings.push({
      id: booking.id,
      start: new Date(booking.start).toISOString(),
      end: new Date(booking.end).toISOString(),
      status: booking.status,
    });
  });

  return Array.from(vessels.values()).map((item) => ({
    ...item,
    bookings: item.bookings.sort((a, b) => a.start.localeCompare(b.start)),
  }));
}

export function prepareVesselComparisonData(
  bookings: OperatorAnalyticsBooking[],
): VesselComparisonRow[] {
  const vessels = new Map<string, VesselComparisonRow>();

  bookings.forEach((booking) => {
    const vesselId = booking.vesselId;
    if (!vessels.has(vesselId)) {
      vessels.set(vesselId, {
        vesselId,
        vesselName: extractVesselName(booking),
        vesselType: booking.vessel?.type || "Unknown",
        charterCount: 0,
        totalDays: 0,
        totalSpent: 0,
        avgDailyRate: 0,
        lastUsed: undefined,
      });
    }

    const entry = vessels.get(vesselId)!;
    const duration = durationInDays(booking.start, booking.end);
    entry.charterCount += 1;
    entry.totalDays += duration;
    entry.totalSpent += bookingCost(booking);

    const endDate = new Date(booking.end).toISOString();
    if (!entry.lastUsed || entry.lastUsed < endDate) {
      entry.lastUsed = endDate;
    }
  });

  return Array.from(vessels.values()).map((entry) => ({
    ...entry,
    avgDailyRate: entry.totalDays > 0 ? entry.totalSpent / entry.totalDays : 0,
  }));
}

export function calculatePaymentSummary(
  bookings: OperatorAnalyticsBooking[],
): PaymentSummary {
  let pendingAmount = 0;
  let fundedAmount = 0;
  let releasedAmount = 0;
  let failedCount = 0;
  let currency = "NGN";

  bookings.forEach((booking) => {
    if (!booking.escrow) return;
    if (booking.escrow.currency) {
      currency = booking.escrow.currency;
    }

    const amount = normalizeAmount(booking.escrow.amount);

    if (booking.escrow.status === "PENDING" || booking.escrow.status === "PROCESSING") {
      pendingAmount += amount;
    } else if (booking.escrow.status === "FUNDED") {
      fundedAmount += amount;
    } else if (booking.escrow.status === "RELEASED") {
      releasedAmount += amount;
    } else if (booking.escrow.status === "FAILED" || booking.escrow.status === "DISPUTED") {
      failedCount += 1;
    }
  });

  return { pendingAmount, fundedAmount, releasedAmount, failedCount, currency };
}

export function preparePaymentHistory(
  bookings: OperatorAnalyticsBooking[],
): PaymentHistoryRow[] {
  return bookings
    .filter((booking) => Boolean(booking.escrow))
    .map((booking) => ({
      id: booking.escrow!.id,
      date: new Date(booking.createdAt).toISOString(),
      vesselName: extractVesselName(booking),
      amount: normalizeAmount(booking.escrow!.amount),
      fee: normalizeAmount(booking.escrow!.fee),
      provider: booking.escrow!.provider,
      status: booking.escrow!.status,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function calculateBudgetTracking(
  bookings: OperatorAnalyticsBooking[],
  monthlyLimit?: number,
): BudgetTracking {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthSpend = bookings
    .filter((booking) => {
      const createdAt = new Date(booking.createdAt);
      return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
    })
    .reduce((sum, booking) => sum + bookingCost(booking), 0);

  const upcomingSpend = bookings
    .filter((booking) => booking.status === "ACCEPTED" && new Date(booking.start) > now)
    .reduce((sum, booking) => sum + bookingCost(booking), 0);

  const distinctMonths = new Set(
    bookings.map((booking) => new Date(booking.createdAt).toISOString().slice(0, 7)),
  );
  const averageMonthlySpend =
    distinctMonths.size > 0
      ? bookings.reduce((sum, booking) => sum + bookingCost(booking), 0) / distinctMonths.size
      : currentMonthSpend;

  const resolvedLimit =
    typeof monthlyLimit === "number" && monthlyLimit > 0
      ? monthlyLimit
      : Math.max(averageMonthlySpend * 1.5, 1_000_000);

  const utilizationPercent = resolvedLimit > 0 ? (currentMonthSpend / resolvedLimit) * 100 : 0;
  const projectedSpend = currentMonthSpend + upcomingSpend;

  return {
    monthlyLimit: resolvedLimit,
    currentMonthSpend,
    projectedSpend,
    utilizationPercent,
    isOverBudget: currentMonthSpend > resolvedLimit,
  };
}

export function calculateBookingFunnel(
  bookings: OperatorAnalyticsBooking[],
): BookingFunnelMetrics {
  const requested = bookings.filter((b) => b.status === "REQUESTED").length;
  const countered = bookings.filter((b) => b.status === "COUNTERED").length;
  const accepted = bookings.filter((b) => b.status === "ACCEPTED").length;
  const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
  const total = bookings.length;
  const conversionRate = total > 0 ? (accepted / total) * 100 : 0;

  return { requested, countered, accepted, cancelled, conversionRate };
}

export function calculateResponseTimeMetrics(
  bookings: OperatorAnalyticsBooking[],
): ResponseTimeMetrics {
  const responseTimes: number[] = [];
  const byType = new Map<string, number[]>();

  bookings.forEach((booking) => {
    if (booking.status === "REQUESTED") return;
    const created = new Date(booking.createdAt).getTime();
    const updated = new Date(booking.updatedAt).getTime();
    const hours = (updated - created) / (1000 * 60 * 60);
    if (!Number.isFinite(hours) || hours < 0) return;

    responseTimes.push(hours);
    const type = booking.vessel?.type || "Unknown";
    if (!byType.has(type)) {
      byType.set(type, []);
    }
    byType.get(type)!.push(hours);
  });

  const averageHours =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
      : 0;
  const fastestHours = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
  const slowestHours = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

  const byVesselType = Array.from(byType.entries()).map(([vesselType, values]) => ({
    vesselType,
    averageHours: values.reduce((sum, value) => sum + value, 0) / values.length,
  }));

  return { averageHours, fastestHours, slowestHours, byVesselType };
}

export function calculateAcceptanceRates(
  bookings: OperatorAnalyticsBooking[],
): AcceptanceRateMetrics {
  const total = bookings.length;
  const accepted = bookings.filter((b) => b.status === "ACCEPTED").length;
  const overallRate = total > 0 ? (accepted / total) * 100 : 0;

  const typeStats = new Map<string, { total: number; accepted: number }>();
  const ownerStats = new Map<string, { total: number; accepted: number }>();
  const monthlyStats = new Map<string, { total: number; accepted: number }>();

  bookings.forEach((booking) => {
    const type = booking.vessel?.type || "Unknown";
    const ownerId = booking.vessel?.ownerId || "Unknown";
    const month = new Date(booking.createdAt).toISOString().slice(0, 7);

    if (!typeStats.has(type)) {
      typeStats.set(type, { total: 0, accepted: 0 });
    }
    if (!ownerStats.has(ownerId)) {
      ownerStats.set(ownerId, { total: 0, accepted: 0 });
    }
    if (!monthlyStats.has(month)) {
      monthlyStats.set(month, { total: 0, accepted: 0 });
    }

    typeStats.get(type)!.total += 1;
    ownerStats.get(ownerId)!.total += 1;
    monthlyStats.get(month)!.total += 1;

    if (booking.status === "ACCEPTED") {
      typeStats.get(type)!.accepted += 1;
      ownerStats.get(ownerId)!.accepted += 1;
      monthlyStats.get(month)!.accepted += 1;
    }
  });

  const byVesselType = Array.from(typeStats.entries()).map(([vesselType, stats]) => ({
    vesselType,
    rate: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0,
  }));

  const byOwner = Array.from(ownerStats.entries()).map(([ownerId, stats]) => ({
    ownerId,
    rate: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0,
  }));

  const trend = Array.from(monthlyStats.entries())
    .map(([month, stats]) => ({
      month,
      rate: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return { overallRate, byVesselType, byOwner, trend };
}

export function calculateTripCompletionMetrics(
  bookings: OperatorAnalyticsBooking[],
): TripCompletionMetrics {
  const now = Date.now();
  const completedTrips = bookings.filter(
    (booking) => booking.status === "ACCEPTED" && new Date(booking.end).getTime() < now,
  ).length;

  // Placeholder metrics for future enhancements
  const earlyTerminations = 0;
  const tripExtensions = 0;
  const totalTrips = completedTrips + earlyTerminations + tripExtensions;
  const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

  return { completedTrips, earlyTerminations, tripExtensions, completionRate };
}

export function calculateEfficiencyScore(
  bookings: OperatorAnalyticsBooking[],
  acceptanceRate: number,
  averageResponseHours: number,
  completionRate: number,
): OperationalEfficiencyScore {
  const bookingSuccessWeight = 0.4;
  const responseTimeWeight = 0.3;
  const completionWeight = 0.2;
  const paymentWeight = 0.1;

  const bookingSuccessScore = Math.min(Math.max(acceptanceRate, 0), 100);
  const responseTimeScore = Math.max(0, 100 - (averageResponseHours / 24) * 100);
  const completionScore = Math.min(Math.max(completionRate, 0), 100);

  const payments = bookings.filter((booking) => booking.escrow);
  const successfulPayments = payments.filter((booking) => booking.escrow?.status === "RELEASED").length;
  const paymentSuccessRate = payments.length > 0 ? (successfulPayments / payments.length) * 100 : 0;
  const paymentScore = Math.min(Math.max(paymentSuccessRate, 0), 100);

  const score =
    bookingSuccessScore * bookingSuccessWeight +
    responseTimeScore * responseTimeWeight +
    completionScore * completionWeight +
    paymentScore * paymentWeight;

  return {
    score,
    breakdown: {
      bookingSuccessRate: {
        value: acceptanceRate,
        weight: bookingSuccessWeight,
        score: bookingSuccessScore,
      },
      averageResponseTime: {
        value: averageResponseHours,
        weight: responseTimeWeight,
        score: responseTimeScore,
      },
      tripCompletionRate: {
        value: completionRate,
        weight: completionWeight,
        score: completionScore,
      },
      paymentSuccessRate: {
        value: paymentSuccessRate,
        weight: paymentWeight,
        score: paymentScore,
      },
    },
  };
}

export function buildVesselFilterOptions(
  bookings: OperatorAnalyticsBooking[],
): VesselFilterOption[] {
  const vessels = new Map<string, VesselFilterOption>();

  bookings.forEach((booking) => {
    const vesselId = booking.vesselId;
    if (!vessels.has(vesselId)) {
      vessels.set(vesselId, {
        id: vesselId,
        name: extractVesselName(booking),
        type: booking.vessel?.type || "Unknown",
        bookingCount: 0,
      });
    }

    vessels.get(vesselId)!.bookingCount += 1;
  });

  return Array.from(vessels.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function buildOperatorAnalyticsPayload(
  bookings: OperatorAnalyticsBooking[],
): OperatorAnalyticsPayload {
  const metrics = calculateOperatorMetrics(bookings);
  const bookingTrends = prepareBookingTrendData(bookings);
  const spendingByType = prepareSpendingByTypeData(bookings);
  const statusDistribution = prepareStatusDistributionData(bookings);
  const monthlySpending = prepareMonthlySpendingData(bookings);
  const costByDuration = prepareCostByDurationData(bookings);
  const vesselTimeline = prepareVesselTimelineData(bookings);
  const vesselComparison = prepareVesselComparisonData(bookings);
  const paymentSummary = calculatePaymentSummary(bookings);
  const paymentHistory = preparePaymentHistory(bookings);
  const budget = calculateBudgetTracking(bookings);
  const bookingFunnel = calculateBookingFunnel(bookings);
  const responseTime = calculateResponseTimeMetrics(bookings);
  const acceptance = calculateAcceptanceRates(bookings);
  const tripCompletion = calculateTripCompletionMetrics(bookings);
  const efficiency = calculateEfficiencyScore(
    bookings,
    acceptance.overallRate,
    responseTime.averageHours,
    tripCompletion.completionRate,
  );
  const vessels = buildVesselFilterOptions(bookings);

  return {
    bookings,
    metrics,
    bookingTrends,
    spendingByType,
    statusDistribution,
    monthlySpending,
    costByDuration,
    vesselTimeline,
    vesselComparison,
    paymentSummary,
    paymentHistory,
    budget,
    bookingFunnel,
    responseTime,
    acceptance,
    tripCompletion,
    efficiency,
    vessels,
  };
}

