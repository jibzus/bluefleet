import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { BookingRequestDialog } from "@/components/booking/BookingRequestDialog";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function VesselDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await getCurrentUser();

  // Fetch vessel
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
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!vessel) {
    notFound();
  }

  const specs = vessel.specs as any;
  const pricing = specs.pricing || {};
  const emissions = specs.emissions || vessel.emissions || {};

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            <span>{specs.name || "Unnamed Vessel"}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                vessel.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {vessel.status}
            </span>
          </span>
        }
        description={`${vessel.type} • ${vessel.homePort}`}
        backHref="/search"
        backLabel="Back to Search"
        breadcrumbs={[
          { label: "Search", href: "/search" },
          { label: specs.name || vessel.slug },
        ]}
      />

      {/* Image Gallery */}
      <div className="mb-8">
        {vessel.media.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <img
                src={vessel.media[0].url}
                alt={vessel.media[0].alt || specs.name}
                className="h-96 w-full rounded-lg object-cover"
              />
            </div>
            <div className="grid gap-4">
              {vessel.media.slice(1, 3).map((media, index) => (
                <img
                  key={index}
                  src={media.url}
                  alt={media.alt || `${specs.name} ${index + 2}`}
                  className="h-44 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center rounded-lg bg-gray-200">
            <p className="text-gray-500">No images available</p>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">

          {/* Description */}
          {specs.description && (
            <Card className="mb-6 p-6">
              <h2 className="mb-3 text-xl font-semibold">Description</h2>
              <p className="text-gray-700">{specs.description}</p>
            </Card>
          )}

          {/* Specifications */}
          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-xl font-semibold">Specifications</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Length</p>
                <p className="font-medium">{specs.length}m</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Beam</p>
                <p className="font-medium">{specs.beam}m</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="font-medium">{specs.draft}m</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gross Tonnage</p>
                <p className="font-medium">{specs.grossTonnage?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deadweight</p>
                <p className="font-medium">{specs.deadweight?.toLocaleString()} tons</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year Built</p>
                <p className="font-medium">{specs.yearBuilt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Flag</p>
                <p className="font-medium">{specs.flag}</p>
              </div>
              {specs.imoNumber && (
                <div>
                  <p className="text-sm text-gray-600">IMO Number</p>
                  <p className="font-medium">{specs.imoNumber}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Emissions */}
          {(emissions.co2PerNm || emissions.noxCompliant || emissions.soxCompliant) && (
            <Card className="mb-6 p-6">
              <h2 className="mb-4 text-xl font-semibold">Emissions Profile</h2>
              <div className="space-y-3">
                {emissions.co2PerNm && (
                  <p>
                    <span className="text-sm text-gray-600">CO₂ per NM:</span>{" "}
                    <span className="font-medium">{emissions.co2PerNm} kg</span>
                  </p>
                )}
                {emissions.eediRating && (
                  <p>
                    <span className="text-sm text-gray-600">EEDI Rating:</span>{" "}
                    <span className="font-medium">{emissions.eediRating}</span>
                  </p>
                )}
                <div className="flex gap-2">
                  {emissions.noxCompliant && (
                    <span className="rounded bg-green-100 px-3 py-1 text-sm text-green-800">
                      NOx Compliant ✓
                    </span>
                  )}
                  {emissions.soxCompliant && (
                    <span className="rounded bg-green-100 px-3 py-1 text-sm text-green-800">
                      SOx Compliant ✓
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Certifications */}
          {vessel.certs.length > 0 && (
            <Card className="mb-6 p-6">
              <h2 className="mb-4 text-xl font-semibold">Certifications</h2>
              <div className="space-y-3">
                {vessel.certs.map((cert) => (
                  <div key={cert.id} className="rounded-lg border p-3">
                    <p className="font-medium">{cert.kind}</p>
                    {cert.issuer && (
                      <p className="text-sm text-gray-600">Issuer: {cert.issuer}</p>
                    )}
                    {cert.expiresAt && (
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(cert.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Availability */}
          {vessel.availability.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Availability</h2>
              <div className="space-y-2">
                {vessel.availability.map((slot) => (
                  <div key={slot.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">
                      {new Date(slot.start).toLocaleDateString()}
                    </span>
                    <span>→</span>
                    <span className="text-gray-600">
                      {new Date(slot.end).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Pricing Card */}
          <Card className="sticky top-6 p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600">Daily Rate</p>
              <p className="text-3xl font-bold text-primary">
                {pricing.currency || "USD"} {pricing.dailyRate?.toLocaleString() || "N/A"}
              </p>
              {pricing.minimumDays > 1 && (
                <p className="mt-1 text-sm text-gray-600">
                  Minimum {pricing.minimumDays} days
                </p>
              )}
            </div>

            {pricing.securityDeposit > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600">Security Deposit</p>
                <p className="font-medium">
                  {pricing.currency || "USD"} {pricing.securityDeposit.toLocaleString()}
                </p>
              </div>
            )}

            <div className="mb-6 space-y-2 text-sm">
              {pricing.fuelIncluded && (
                <p className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Fuel included
                </p>
              )}
              {pricing.crewIncluded && (
                <p className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Crew included
                </p>
              )}
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
              <Link href="/signin">
                <Button className="w-full">Sign in to Book</Button>
              </Link>
            )}

            {/* Owner Info */}
            <div className="mt-6 border-t pt-6">
              <p className="mb-2 text-sm text-gray-600">Listed by</p>
              <p className="font-medium">{vessel.owner.name || vessel.owner.email}</p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
