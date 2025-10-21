import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Anchor,
  Gauge,
  Compass,
  Wind,
  Calendar,
  ShieldCheck,
  MapPin,
  CircleDollarSign,
  Clock,
  Droplets,
  Ruler,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { BookingRequestDialog } from "@/components/booking/BookingRequestDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusChip } from "@/components/ui/status-chip";

export default async function VesselDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await getCurrentUser();

  const vessel = await prisma.vessel.findUnique({
    where: { slug: params.slug },
    include: {
      media: {
        orderBy: { sort: "asc" },
      },
      certs: true,
      availability: {
        orderBy: { start: "asc" },
      },
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!vessel) {
    notFound();
  }

  const specs = vessel.specs as Record<string, any>;
  const pricing = specs.pricing || {};
  const emissions = specs.emissions || vessel.emissions || {};
  const isActive = vessel.status === "ACTIVE";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24">
      <PageHeader
        title={specs.name || "Unnamed Vessel"}
        description={
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
            <span className="inline-flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="h-4 w-4 text-primary" />
              {vessel.type} • {vessel.homePort || "Home port unavailable"}
            </span>
            <StatusChip
              label={vessel.status}
              variant={isActive ? "success" : "warning"}
            />
          </div>
        }
        backHref="/search"
        backLabel="Back to Search"
        breadcrumbs={[
          { label: "Search", href: "/search" },
          { label: specs.name || vessel.slug },
        ]}
      />

      <div className="fade-in overflow-hidden rounded-3xl border border-border/70 bg-muted/20 shadow-xl">
        {vessel.media.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-3">
            <div className="group relative md:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
              <img
                src={vessel.media[0].url}
                alt={vessel.media[0].alt || specs.name}
                className="h-full max-h-[480px] w-full object-cover"
              />
              <div className="absolute bottom-6 left-6 space-y-2 text-white">
                <StatusChip
                  label={isActive ? "Available" : "Unavailable"}
                  variant={isActive ? "success" : "warning"}
                  className="bg-white/10 text-white shadow-lg backdrop-blur"
                />
                <div className="rounded-2xl bg-black/60 px-4 py-3 shadow-lg backdrop-blur">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    {specs.classNotation || "Class Notation Pending"}
                  </p>
                  <p className="text-lg font-semibold">{specs.name || vessel.slug}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              {vessel.media.slice(1, 3).map((media, index) => (
                <img
                  key={index}
                  src={media.url}
                  alt={media.alt || `${specs.name} ${index + 2}`}
                  className="h-56 w-full object-cover"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-96 flex-col items-center justify-center gap-3 bg-muted/40 text-sm text-muted-foreground">
            <Anchor className="h-8 w-8 text-muted-foreground/70" />
            No imagery available yet
          </div>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          {specs.description ? (
            <Card className="slide-up space-y-4 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground/80">
                <Sparkles className="h-4 w-4 text-primary" />
                Vessel Overview
              </div>
              <p className="text-base leading-relaxed text-muted-foreground">
                {specs.description}
              </p>
            </Card>
          ) : null}

          <Card className="slide-up space-y-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <StatusChip label="Technical" variant="primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                Specifications
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <SpecItem icon={Ruler} label="Length" value={`${specs.length} m`} />
              <SpecItem icon={Ruler} label="Beam" value={`${specs.beam} m`} />
              <SpecItem icon={Droplets} label="Draft" value={`${specs.draft} m`} />
              <SpecItem
                icon={Gauge}
                label="Gross Tonnage"
                value={specs.grossTonnage?.toLocaleString() || "—"}
              />
              <SpecItem
                icon={Anchor}
                label="Deadweight"
                value={
                  specs.deadweight
                    ? `${specs.deadweight.toLocaleString()} tons`
                    : "—"
                }
              />
              <SpecItem icon={Calendar} label="Year Built" value={specs.yearBuilt} />
              <SpecItem icon={Compass} label="Flag" value={specs.flag || "—"} />
              {specs.imoNumber ? (
                <SpecItem icon={ShieldCheck} label="IMO Number" value={specs.imoNumber} />
              ) : null}
            </div>
          </Card>

          {(emissions.co2PerNm ||
            emissions.noxCompliant ||
            emissions.soxCompliant ||
            emissions.eediRating) && (
            <Card className="slide-up space-y-5 rounded-3xl border border-border bg-gradient-to-br from-emerald-50 via-card to-card p-8 shadow-sm dark:from-emerald-900/10">
              <div className="flex flex-wrap items-center gap-3">
                <StatusChip label="Sustainability" variant="success" />
                <h2 className="text-2xl font-semibold text-foreground">
                  Emissions Profile
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {emissions.co2PerNm ? (
                  <Metric
                    label="CO₂ per Nautical Mile"
                    value={`${emissions.co2PerNm} kg`}
                    icon={Wind}
                  />
                ) : null}
                {emissions.eediRating ? (
                  <Metric label="EEDI Rating" value={emissions.eediRating} icon={ShieldCheck} />
                ) : null}
                {emissions.noxCompliant ? (
                  <Metric label="NOx Compliance" value="Certified" icon={ShieldCheck} />
                ) : null}
                {emissions.soxCompliant ? (
                  <Metric label="SOx Compliance" value="Certified" icon={ShieldCheck} />
                ) : null}
              </div>
            </Card>
          )}

          {vessel.certs.length > 0 ? (
            <Card className="slide-up space-y-5 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <StatusChip label="Compliance" variant="info" />
                <h2 className="text-2xl font-semibold text-foreground">
                  Certifications
                </h2>
              </div>
              <div className="space-y-4">
                {vessel.certs.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded-2xl border border-border/70 bg-muted/40 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {cert.kind}
                      </h3>
                      <StatusChip
                        label={cert.status || "Verified"}
                        variant={
                          cert.status === "EXPIRED"
                            ? "danger"
                            : cert.status === "PENDING"
                            ? "warning"
                            : "success"
                        }
                      />
                    </div>
                    <dl className="mt-4 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                      {cert.issuer ? (
                        <div>
                          <dt className="font-medium uppercase tracking-wide text-xs">
                            Issuer
                          </dt>
                          <dd className="text-base text-foreground">{cert.issuer}</dd>
                        </div>
                      ) : null}
                      {cert.expiresAt ? (
                        <div>
                          <dt className="font-medium uppercase tracking-wide text-xs">
                            Expires
                          </dt>
                          <dd className="text-base text-foreground">
                            {new Date(cert.expiresAt).toLocaleDateString()}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {vessel.availability.length > 0 ? (
            <Card className="slide-up space-y-5 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <StatusChip label="Schedule" variant="primary" />
                <h2 className="text-2xl font-semibold text-foreground">
                  Availability
                </h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {vessel.availability.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" />
                      {new Date(slot.start).toLocaleDateString()}
                    </div>
                    <span className="text-muted-foreground">to</span>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      {new Date(slot.end).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card className="slide-up space-y-6 rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-8 shadow-xl">
            <div className="space-y-3">
              <StatusChip label="Daily Rate" variant="primary" />
              <p className="text-4xl font-semibold text-primary">
                {pricing.currency || "USD"}{" "}
                {pricing.dailyRate?.toLocaleString() || "N/A"}
              </p>
              {pricing.minimumDays > 1 ? (
                <p className="text-sm text-muted-foreground">
                  Minimum {pricing.minimumDays} days
                </p>
              ) : null}
            </div>

            {pricing.securityDeposit > 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card/80 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <CircleDollarSign className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Security Deposit</span>
                </div>
                <p className="mt-1">
                  {pricing.currency || "USD"}{" "}
                  {pricing.securityDeposit.toLocaleString()}
                </p>
              </div>
            ) : null}

            <div className="space-y-2 text-sm text-muted-foreground">
              {pricing.fuelIncluded ? <FeatureBadge label="Fuel included" /> : null}
              {pricing.crewIncluded ? <FeatureBadge label="Crew included" /> : null}
            </div>

            {user?.role === "OPERATOR" ? (
              <BookingRequestDialog
                vessel={{
                  id: vessel.id,
                  slug: vessel.slug,
                  specs,
                  availability: vessel.availability,
                }}
                pricing={pricing}
              />
            ) : (
              <Button size="lg" className="w-full" asChild>
                <Link href="/signin">Sign in to Book</Link>
              </Button>
            )}

            <div className="rounded-2xl border border-border/60 bg-card/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                Listed By
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {vessel.owner.name || vessel.owner.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Contact details unlock after booking confirmation.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
      <Icon className="mt-1 h-4 w-4 text-primary" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
          {label}
        </p>
        <p className="text-base font-medium text-foreground">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white/70 p-4 text-sm shadow-sm dark:bg-emerald-900/10">
      {Icon ? <Icon className="h-5 w-5 text-primary" /> : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
          {label}
        </p>
        <p className="text-base font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function FeatureBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <ShieldCheck className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}
