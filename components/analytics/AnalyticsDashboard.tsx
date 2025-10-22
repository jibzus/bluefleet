"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Anchor,
  Calendar,
  CheckCircle,
  Clock,
  Clock3,
  DollarSign,
  Download,
  Ship,
  TrendingUp,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/validators/analytics";
import type {
  OperatorAnalyticsPayload,
  OperatorAnalyticsBooking,
} from "@/lib/validators/analytics";
import { BookingTrendsChart } from "./BookingTrendsChart";
import { SpendingByTypeChart } from "./SpendingByTypeChart";
import { StatusDistributionChart } from "./StatusDistributionChart";
import { MonthlySpendingChart } from "./MonthlySpendingChart";
import { CostByDurationChart } from "./CostByDurationChart";
import { VesselUtilizationTimeline } from "./VesselUtilizationTimeline";
import { VesselComparisonTable } from "./VesselComparisonTable";
import { PaymentHistoryTable } from "./PaymentHistoryTable";
import { TimeFilter, type DateRangeFilter } from "./TimeFilter";
import { VesselFilter } from "./VesselFilter";
import { AnalyticsLoading } from "./AnalyticsLoading";
import { EmptyAnalytics } from "./EmptyAnalytics";

interface AnalyticsDashboardProps {
  initialData: OperatorAnalyticsPayload;
  initialFilter: DateRangeFilter;
  initialVesselId: string | null;
}

function useAnalyticsState(
  initialData: OperatorAnalyticsPayload,
  initialFilter: DateRangeFilter,
  initialVesselId: string | null,
) {
  const [data, setData] = useState(initialData);
  const [filter, setFilter] = useState<DateRangeFilter>(initialFilter);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(initialVesselId);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    setSelectedVessel(initialVesselId);
  }, [initialVesselId]);

  return { data, setData, filter, setFilter, selectedVessel, setSelectedVessel };
}

export function AnalyticsDashboard({ initialData, initialFilter, initialVesselId }: AnalyticsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, setData, filter, setFilter, selectedVessel, setSelectedVessel } = useAnalyticsState(
    initialData,
    initialFilter,
    initialVesselId,
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currency = useMemo(() => data.paymentSummary.currency || "NGN", [data.paymentSummary.currency]);

  const updateQueryParams = (nextFilter: DateRangeFilter, vesselId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFilter.startDate) {
      params.set("startDate", nextFilter.startDate);
    } else {
      params.delete("startDate");
    }

    if (nextFilter.endDate) {
      params.set("endDate", nextFilter.endDate);
    } else {
      params.delete("endDate");
    }

    if (vesselId) {
      params.set("vesselId", vesselId);
    } else {
      params.delete("vesselId");
    }

    startTransition(() => {
      router.push(`/operator/analytics?${params.toString()}`);
    });
  };

  const fetchAnalytics = async (nextFilter: DateRangeFilter, vesselId: string | null) => {
    const params = new URLSearchParams();
    if (nextFilter.startDate) params.set("startDate", nextFilter.startDate);
    if (nextFilter.endDate) params.set("endDate", nextFilter.endDate);
    if (vesselId) params.set("vesselId", vesselId);

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/operator?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load analytics data");
      }

      const payload = (await response.json()) as OperatorAnalyticsPayload;
      setData(payload);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFilterChange = (nextFilter: DateRangeFilter) => {
    setFilter(nextFilter);
    void fetchAnalytics(nextFilter, selectedVessel);
    updateQueryParams(nextFilter, selectedVessel);
  };

  const handleVesselChange = (vesselId: string | null) => {
    setSelectedVessel(vesselId);
    void fetchAnalytics(filter, vesselId);
    updateQueryParams(filter, vesselId);
  };

  if (isFetching && !data.bookings.length && !initialData.bookings.length) {
    return <AnalyticsLoading />;
  }

  if (!data.bookings.length && !isFetching) {
    return <EmptyAnalytics />;
  }

  const activeTrips = data.bookings.filter((booking) => {
    if (booking.status !== "ACCEPTED") return false;
    if (booking.escrow?.status !== "FUNDED") return false;
    const now = Date.now();
    const start = new Date(booking.start).getTime();
    const end = new Date(booking.end).getTime();
    return start <= now && end >= now;
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24">
      <PageHeader
        title="Analytics dashboard"
        description="Monitor booking performance, spending, and vessel utilisation"
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/operator/bookings">
              <Button variant="outline">View bookings</Button>
            </Link>
            <Link href="/operator/trips">
              <Button variant="outline">Active trips</Button>
            </Link>
            <Button variant="default">
              <Download className="mr-2 h-4 w-4" />
              Export report
            </Button>
          </div>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <TimeFilter value={filter} onChange={handleFilterChange} isLoading={isFetching || isPending} />
        <div className="flex flex-col gap-4">
          <VesselFilter
            options={data.vessels}
            selectedId={selectedVessel}
            onChange={handleVesselChange}
            disabled={isFetching || isPending}
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard label="Active bookings" value={data.metrics.activeBookings} icon={Ship} variant="primary" />
        <StatsCard
          label="Total spent"
          value={formatCurrency(data.metrics.totalSpent, currency)}
          icon={DollarSign}
          variant="success"
        />
        <StatsCard
          label="Vessels chartered"
          value={data.metrics.vesselsChartered}
          icon={Anchor}
          variant="info"
        />
        <StatsCard
          label="Pending requests"
          value={data.metrics.pendingRequests}
          icon={Clock3}
          variant="warning"
        />
        <StatsCard
          label="Success rate"
          value={`${data.metrics.successRate.toFixed(1)}%`}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          label="Avg duration"
          value={`${data.metrics.averageDuration.toFixed(1)} days`}
          icon={Calendar}
          variant="info"
        />
      </section>

      <FinancialSummaryCards summary={data.paymentSummary} currency={currency} isLoading={isFetching || isPending} />

      <section className="grid gap-6 lg:grid-cols-2">
        <BookingTrendsChart data={data.bookingTrends} />
        <SpendingByTypeChart data={data.spendingByType} currency={currency} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <StatusDistributionChart data={data.statusDistribution} total={data.metrics.totalRequests} />
        <MonthlySpendingChart data={data.monthlySpending} currency={currency} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <CostByDurationChart data={data.costByDuration} currency={currency} />
        <OperationalMetrics
          funnel={data.bookingFunnel}
          responseTime={data.responseTime}
          efficiency={data.efficiency}
          budget={data.budget}
          currency={currency}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <VesselUtilizationTimeline data={data.vesselTimeline} />
        <ActiveTripsCard bookings={activeTrips} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <VesselComparisonTable data={data.vesselComparison} currency={currency} />
        <PaymentHistoryTable payments={data.paymentHistory} currency={currency} />
      </section>
    </main>
  );
}

function FinancialSummaryCards({
  summary,
  currency,
  isLoading,
}: {
  summary: OperatorAnalyticsPayload["paymentSummary"];
  currency: string;
  isLoading: boolean;
}) {
  const delta = summary.releasedAmount - summary.pendingAmount;
  const trendIcon = delta >= 0 ? ArrowUpRight : ArrowDownRight;
  const trendLabel = delta === 0 ? "No change" : `${delta >= 0 ? "+" : "-"}${formatCurrency(Math.abs(delta), currency)}`;

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        label="Pending payments"
        value={formatCurrency(summary.pendingAmount, currency)}
        icon={Clock}
        variant="warning"
        trendIcon={trendIcon}
        trendLabel={trendLabel}
        className={isLoading ? "animate-pulse" : undefined}
      />
      <StatsCard
        label="Funded escrow"
        value={formatCurrency(summary.fundedAmount, currency)}
        icon={Shield}
        variant="info"
        className={isLoading ? "animate-pulse" : undefined}
      />
      <StatsCard
        label="Completed payments"
        value={formatCurrency(summary.releasedAmount, currency)}
        icon={CheckCircle}
        variant="success"
        className={isLoading ? "animate-pulse" : undefined}
      />
      <StatsCard
        label="Failed transactions"
        value={summary.failedCount}
        icon={XCircle}
        variant="default"
        className={isLoading ? "animate-pulse" : undefined}
      />
    </section>
  );
}

function OperationalMetrics({
  funnel,
  responseTime,
  efficiency,
  budget,
  currency,
}: {
  funnel: OperatorAnalyticsPayload["bookingFunnel"];
  responseTime: OperatorAnalyticsPayload["responseTime"];
  efficiency: OperatorAnalyticsPayload["efficiency"];
  budget: OperatorAnalyticsPayload["budget"];
  currency: string;
}) {
  return (
    <div className="grid gap-6">
      <BookingFunnelCard funnel={funnel} />
      <ResponseTimeCard metrics={responseTime} />
      <EfficiencyScoreCard efficiency={efficiency} />
      <BudgetCard budget={budget} currency={currency} />
    </div>
  );
}

function BookingFunnelCard({ funnel }: { funnel: OperatorAnalyticsPayload["bookingFunnel"] }) {
  const total = Math.max(funnel.requested, 1);

  const stages: Array<{ label: string; value: number; color: string }> = [
    { label: "Requested", value: funnel.requested, color: "bg-chart-1" },
    { label: "Countered", value: funnel.countered, color: "bg-chart-4" },
    { label: "Accepted", value: funnel.accepted, color: "bg-chart-2" },
    { label: "Cancelled", value: funnel.cancelled, color: "bg-chart-5" },
  ];

  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Booking funnel</CardTitle>
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.label} className="flex items-center gap-4">
            <div className="w-32 text-sm text-muted-foreground">{stage.label}</div>
            <div className="flex-1 rounded-full bg-muted">
              <div
                className={`h-8 rounded-full ${stage.color} flex items-center px-4 text-xs font-semibold text-white`}
                style={{ width: `${Math.max((stage.value / total) * 100, 2)}%` }}
              >
                {stage.value}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">
        Conversion rate: <span className="font-semibold text-foreground">{funnel.conversionRate.toFixed(1)}%</span>
      </div>
    </Card>
  );
}

function ResponseTimeCard({ metrics }: { metrics: OperatorAnalyticsPayload["responseTime"] }) {
  const topTypes = metrics.byVesselType.slice(0, 3);

  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Response time</CardTitle>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricStat label="Average" value={`${metrics.averageHours.toFixed(1)}h`} />
        <MetricStat label="Fastest" value={`${metrics.fastestHours.toFixed(1)}h`} />
        <MetricStat label="Slowest" value={`${metrics.slowestHours.toFixed(1)}h`} />
      </div>
      {topTypes.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">By vessel type</p>
          {topTypes.map((item) => (
            <div key={item.vesselType} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.vesselType}</span>
              <span className="font-medium text-foreground">{item.averageHours.toFixed(1)}h</span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function EfficiencyScoreCard({ efficiency }: { efficiency: OperatorAnalyticsPayload["efficiency"] }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(efficiency.score / 100) * circumference} ${circumference}`;

  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Operational efficiency</CardTitle>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative h-32 w-32">
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth={10} />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={10}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold text-foreground">{efficiency.score.toFixed(0)}</span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Score</span>
          </div>
        </div>
        <div className="grid flex-1 gap-3 text-sm">
          <EfficiencyRow label="Booking success" item={efficiency.breakdown.bookingSuccessRate} suffix="%" />
          <EfficiencyRow label="Response time" item={efficiency.breakdown.averageResponseTime} suffix="h" />
          <EfficiencyRow label="Trip completion" item={efficiency.breakdown.tripCompletionRate} suffix="%" />
          <EfficiencyRow label="Payment success" item={efficiency.breakdown.paymentSuccessRate} suffix="%" />
        </div>
      </div>
    </Card>
  );
}

function EfficiencyRow({
  label,
  item,
  suffix,
}: {
  label: string;
  item: { value: number; score: number };
  suffix: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">
        {item.value.toFixed(1)}{suffix}
      </span>
    </div>
  );
}

function BudgetCard({
  budget,
  currency,
}: {
  budget: OperatorAnalyticsPayload["budget"];
  currency: string;
}) {
  const percentage = Math.min(Math.max(budget.utilizationPercent, 0), 100);
  const isOver = budget.isOverBudget;

  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Monthly budget</CardTitle>
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Current spend</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(budget.currentMonthSpend, currency)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Budget limit</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(budget.monthlyLimit, currency)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className={`${isOver ? "bg-destructive" : "bg-primary"} h-2 rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {percentage.toFixed(1)}% utilised{isOver ? " · Over budget" : ""}
        </p>
      </div>
    </Card>
  );
}

function MetricStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ActiveTripsCard({ bookings }: { bookings: OperatorAnalyticsBooking[] }) {
  if (bookings.length === 0) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        <Activity className="h-6 w-6" />
        <p>No active trips at the moment.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardTitle className="mb-6">Active trips</CardTitle>
      <div className="space-y-4">
        {bookings.map((booking) => {
          const specs = (booking.vessel?.specs as any) || {};
          const daysRemaining = Math.max(
            0,
            Math.ceil(
              (new Date(booking.end).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            ),
          );

          return (
            <div key={booking.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{specs.name || "Unnamed vessel"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(booking.start).toLocaleDateString()} → {new Date(booking.end).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{daysRemaining} days</p>
                <p className="text-xs text-muted-foreground">remaining</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

