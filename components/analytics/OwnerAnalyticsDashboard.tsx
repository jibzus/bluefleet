"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Anchor,
  BarChart3,
  CheckCircle2,
  Clock3,
  DollarSign,
  LifeBuoy,
  Ship,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/validators/analytics";
import type { OwnerAnalyticsPayload } from "@/lib/validators/analytics";
import { RevenueTrendsChart } from "./RevenueTrendsChart";
import { RevenueByTypeChart } from "./RevenueByTypeChart";
import { StatusDistributionChart } from "./StatusDistributionChart";
import { MonthlyRevenueChart } from "./MonthlyRevenueChart";
import { VesselUtilizationTimeline } from "./VesselUtilizationTimeline";
import { OperatorDistributionChart } from "./OperatorDistributionChart";
import { VesselComparisonTable } from "./VesselComparisonTable";
import { PaymentHistoryTable } from "./PaymentHistoryTable";
import { TimeFilter, type DateRangeFilter } from "./TimeFilter";
import { VesselFilter } from "./VesselFilter";
import { AnalyticsLoading } from "./AnalyticsLoading";
import { EmptyAnalytics } from "./EmptyAnalytics";

interface OwnerAnalyticsDashboardProps {
  initialData: OwnerAnalyticsPayload;
  initialFilter: DateRangeFilter;
  initialVesselId: string | null;
  ownerIdParam: string | null;
}

function useAnalyticsState(
  initialData: OwnerAnalyticsPayload,
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

export function OwnerAnalyticsDashboard({
  initialData,
  initialFilter,
  initialVesselId,
  ownerIdParam,
}: OwnerAnalyticsDashboardProps) {
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

    if (ownerIdParam) {
      params.set("ownerId", ownerIdParam);
    }

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/owner/analytics?${query}` : "/owner/analytics");
    });
  };

  const fetchAnalytics = async (nextFilter: DateRangeFilter, vesselId: string | null) => {
    const params = new URLSearchParams();
    if (nextFilter.startDate) params.set("startDate", nextFilter.startDate);
    if (nextFilter.endDate) params.set("endDate", nextFilter.endDate);
    if (vesselId) params.set("vesselId", vesselId);
    if (ownerIdParam) params.set("ownerId", ownerIdParam);

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/owner?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load analytics data");
      }

      const payload = (await response.json()) as OwnerAnalyticsPayload;
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

  const paymentSummary = data.paymentSummary;
  const computeDurationDays = (start: Date | string, end: Date | string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    if (Number.isNaN(diff) || diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  const topRevenueVessel = data.vesselComparison
    .slice()
    .sort((a, b) => b.totalSpent - a.totalSpent)[0];
  const topDailyRateVessel = data.vesselComparison
    .slice()
    .sort((a, b) => b.avgDailyRate - a.avgDailyRate)[0];
  const longestCharter = data.bookings
    .filter((booking) => booking.status === "ACCEPTED")
    .map((booking) => ({
      booking,
      duration: computeDurationDays(booking.start, booking.end),
    }))
    .sort((a, b) => b.duration - a.duration)[0];
  const hasTrend = data.revenueTrends.length > 1;
  const latestRevenue = data.revenueTrends.at(-1)?.revenue ?? 0;
  const previousRevenue = data.revenueTrends.at(-2)?.revenue ?? 0;
  const revenueDelta =
    hasTrend && previousRevenue > 0 ? ((latestRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24">
      <PageHeader
        title="Owner analytics"
        description="Track fleet revenue, utilisation, and operator activity in real time."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/owner/vessels">
              <Button variant="outline">Manage vessels</Button>
            </Link>
            <Link href="/owner/bookings">
              <Button variant="outline">View booking requests</Button>
            </Link>
            <Button variant="default">
              <BarChart3 className="mr-2 h-4 w-4" />
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
        <StatsCard
          label="Total revenue (YTD)"
          value={formatCurrency(data.metrics.totalRevenue, currency)}
          icon={DollarSign}
          variant="success"
          trendLabel={
            hasTrend
              ? `${revenueDelta >= 0 ? "+" : "-"}${Math.abs(revenueDelta).toFixed(1)}% vs prev. month`
              : undefined
          }
        />
        <StatsCard
          label="Fleet utilisation"
          value={formatPercentage(data.metrics.fleetUtilization)}
          icon={TrendingUp}
          variant="info"
        />
        <StatsCard
          label="Avg daily rate"
          value={formatCurrency(data.metrics.avgDailyRate, currency)}
          icon={Anchor}
          variant="primary"
        />
        <StatsCard
          label="Pending escrow"
          value={formatCurrency(data.metrics.pendingEscrow, currency)}
          icon={Clock3}
          variant="warning"
        />
        <StatsCard
          label="Acceptance rate"
          value={formatPercentage(data.metrics.acceptanceRate)}
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          label="Active charters"
          value={data.metrics.activeCharters}
          icon={Ship}
          variant="primary"
        />
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Escrow pending release"
          value={formatCurrency(paymentSummary.pendingAmount, currency)}
          icon={Clock3}
          variant="warning"
        />
        <StatsCard
          label="Escrow funded"
          value={formatCurrency(paymentSummary.fundedAmount, currency)}
          icon={LifeBuoy}
          variant="info"
        />
        <StatsCard
          label="Escrow released"
          value={formatCurrency(paymentSummary.releasedAmount, currency)}
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard label="Failed transfers" value={paymentSummary.failedCount} icon={BarChart3} variant="default" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="p-6">
          <CardTitle>Booking overview</CardTitle>
          <CardDescription className="mb-6">
            Snapshot of total requests and cancellations across your fleet.
          </CardDescription>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total bookings</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{data.metrics.totalBookings}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cancelled bookings</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{data.metrics.cancelledBookings}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <CardTitle>Operator mix</CardTitle>
          <CardDescription className="mb-6">
            Understand how diversified your charter relationships are.
          </CardDescription>
          <div className="space-y-4">
            {data.operatorDistribution.slice(0, 3).map((item) => (
              <div key={item.operatorId} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.operatorName}</p>
                  <p className="text-xs text-muted-foreground">{item.operatorEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(item.totalRevenue, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.bookingCount} bookings</p>
                </div>
              </div>
            ))}
            {data.operatorDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accepted bookings yet.</p>
            ) : null}
          </div>
        </Card>
      </section>

      <RevenueTrendsChart data={data.revenueTrends} currency={currency} />

      <section className="grid gap-6 lg:grid-cols-2">
        <RevenueByTypeChart data={data.revenueByType} currency={currency} />
        <StatusDistributionChart data={data.statusDistribution} total={data.metrics.totalBookings} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <MonthlyRevenueChart data={data.monthlyRevenue} currency={currency} />
        <OperatorDistributionChart data={data.operatorDistribution} currency={currency} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <VesselUtilizationTimeline data={data.vesselTimeline} />
        <Card className="p-6">
          <CardTitle>Utilisation highlights</CardTitle>
          <CardDescription className="mb-6">
            Key takeaways from recent charter activity across your fleet.
          </CardDescription>
          <div className="space-y-5 text-sm text-foreground">
            {topRevenueVessel ? (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">Top earning vessel</p>
                  <p className="text-xs text-muted-foreground">{topRevenueVessel.vesselType}</p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrency(topRevenueVessel.totalSpent, currency)}
                </p>
              </div>
            ) : null}
            {topDailyRateVessel ? (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">Highest daily rate</p>
                  <p className="text-xs text-muted-foreground">{topDailyRateVessel.vesselType}</p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrency(topDailyRateVessel.avgDailyRate, currency)}
                </p>
              </div>
            ) : null}
            {longestCharter ? (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">Longest charter</p>
                  <p className="text-xs text-muted-foreground">
                    {(
                      (longestCharter.booking.vessel?.specs as Record<string, unknown>)?.["name"] as
                        | string
                        | undefined
                    ) ?? "Unnamed vessel"}
                  </p>
                </div>
                <p className="text-sm font-semibold">{longestCharter.duration} days</p>
              </div>
            ) : null}
            {!topRevenueVessel && !topDailyRateVessel && !longestCharter ? (
              <p className="text-sm text-muted-foreground">Not enough charter history to calculate insights yet.</p>
            ) : null}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <VesselComparisonTable data={data.vesselComparison} currency={currency} />
        <PaymentHistoryTable payments={data.paymentHistory} currency={currency} />
      </section>
    </main>
  );
}
