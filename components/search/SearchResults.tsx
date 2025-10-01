import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SortDropdown } from "./SortDropdown";
import { ActiveFilters } from "./ActiveFilters";

interface SearchResultsProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function SearchResults({ searchParams }: SearchResultsProps) {
  const startTime = Date.now();

  // Parse search params
  const query = (searchParams.q as string) || "";
  const type = (searchParams.type as string) || "";
  const status = (searchParams.status as string) || "ACTIVE"; // Default to ACTIVE only
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice as string) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice as string) : undefined;
  const currency = (searchParams.currency as string) || "";
  const location = (searchParams.location as string) || "";
  const minYear = searchParams.minYear ? parseInt(searchParams.minYear as string) : undefined;
  const maxYear = searchParams.maxYear ? parseInt(searchParams.maxYear as string) : undefined;
  const noxCompliant = searchParams.noxCompliant === "true";
  const soxCompliant = searchParams.soxCompliant === "true";
  const availableFrom = (searchParams.availableFrom as string) || "";
  const sort = (searchParams.sort as string) || "recent";

  // Build where clause
  const where: any = {
    status: status || "ACTIVE", // Only show active vessels by default
  };

  // Type filter
  if (type) {
    where.type = type;
  }

  // Location filter (homePort contains)
  if (location) {
    where.homePort = {
      contains: location,
      mode: "insensitive",
    };
  }

  // Text search (name, type, homePort)
  if (query) {
    where.OR = [
      {
        specs: {
          path: ["name"],
          string_contains: query,
        },
      },
      {
        type: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        homePort: {
          contains: query,
          mode: "insensitive",
        },
      },
    ];
  }

  // Fetch vessels
  const vessels = await prisma.vessel.findMany({
    where,
    include: {
      media: {
        orderBy: { sort: "asc" },
        take: 1,
      },
      certs: true,
      availability: true,
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" }, // Simple sort for now, client-side sort for JSON fields
  });

  // Client-side filtering for JSON fields (pricing, year, emissions)
  let filteredVessels = vessels.filter((vessel) => {
    const specs = vessel.specs as any;
    const pricing = specs.pricing || {};
    const emissions = specs.emissions || vessel.emissions || {};

    // Price filter
    if (minPrice !== undefined && pricing.dailyRate < minPrice) return false;
    if (maxPrice !== undefined && pricing.dailyRate > maxPrice) return false;

    // Currency filter
    if (currency && pricing.currency !== currency) return false;

    // Year filter
    if (minYear !== undefined && specs.yearBuilt < minYear) return false;
    if (maxYear !== undefined && specs.yearBuilt > maxYear) return false;

    // Emissions filter
    if (noxCompliant && !emissions.noxCompliant) return false;
    if (soxCompliant && !emissions.soxCompliant) return false;

    // Availability filter
    if (availableFrom) {
      const targetDate = new Date(availableFrom);
      const hasAvailability = vessel.availability.some((slot: any) => {
        return new Date(slot.start) <= targetDate && new Date(slot.end) >= targetDate;
      });
      if (!hasAvailability) return false;
    }

    return true;
  });

  // Client-side sorting for JSON fields
  filteredVessels = applySorting(filteredVessels, sort);

  const queryTime = Date.now() - startTime;

  return (
    <div>
      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {filteredVessels.length} vessel{filteredVessels.length !== 1 ? "s" : ""} found
            <span className="ml-2 text-xs text-gray-400">({queryTime}ms)</span>
          </p>
        </div>
        <SortDropdown />
      </div>

      {/* Active Filters */}
      <ActiveFilters searchParams={searchParams} />

      {/* Results Grid */}
      {filteredVessels.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h3 className="mb-2 text-xl font-semibold">No vessels found</h3>
          <p className="mb-6 text-gray-600">
            Try adjusting your filters or search query
          </p>
          <Link href="/search">
            <Button variant="outline">Clear all filters</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredVessels.map((vessel) => {
            const specs = vessel.specs as any;
            const pricing = specs.pricing || {};
            const emissions = specs.emissions || vessel.emissions || {};
            const thumbnail = vessel.media[0]?.url || "/placeholder-vessel.jpg";

            return (
              <Card key={vessel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={thumbnail}
                    alt={specs.name || "Vessel"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-2 top-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      {vessel.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">
                    {specs.name || "Unnamed Vessel"}
                  </h3>

                  <div className="mb-4 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Type:</span> {vessel.type}
                    </p>
                    <p>
                      <span className="font-medium">Home Port:</span>{" "}
                      {vessel.homePort || "N/A"}
                    </p>
                    {specs.yearBuilt && (
                      <p>
                        <span className="font-medium">Year:</span> {specs.yearBuilt}
                      </p>
                    )}
                    {pricing.dailyRate && (
                      <p className="text-base font-semibold text-primary">
                        {pricing.currency || "USD"} {pricing.dailyRate.toLocaleString()}/day
                      </p>
                    )}
                  </div>

                  {/* Compliance Badges */}
                  {(emissions.noxCompliant || emissions.soxCompliant) && (
                    <div className="mb-4 flex gap-2">
                      {emissions.noxCompliant && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          NOx ✓
                        </span>
                      )}
                      {emissions.soxCompliant && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          SOx ✓
                        </span>
                      )}
                    </div>
                  )}

                  {/* Availability */}
                  {vessel.availability.length > 0 && (
                    <p className="mb-4 text-xs text-gray-500">
                      {vessel.availability.length} availability period
                      {vessel.availability.length !== 1 ? "s" : ""}
                    </p>
                  )}

                  {/* Actions */}
                  <Link href={`/vessel/${vessel.slug}`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function applySorting(vessels: any[], sort: string) {
  const sorted = [...vessels];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => {
        const aPrice = (a.specs as any).pricing?.dailyRate || 0;
        const bPrice = (b.specs as any).pricing?.dailyRate || 0;
        return aPrice - bPrice;
      });
    case "price-desc":
      return sorted.sort((a, b) => {
        const aPrice = (a.specs as any).pricing?.dailyRate || 0;
        const bPrice = (b.specs as any).pricing?.dailyRate || 0;
        return bPrice - aPrice;
      });
    case "year-new":
      return sorted.sort((a, b) => {
        const aYear = (a.specs as any).yearBuilt || 0;
        const bYear = (b.specs as any).yearBuilt || 0;
        return bYear - aYear;
      });
    case "year-old":
      return sorted.sort((a, b) => {
        const aYear = (a.specs as any).yearBuilt || 0;
        const bYear = (b.specs as any).yearBuilt || 0;
        return aYear - bYear;
      });
    case "recent":
    default:
      return sorted.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
}

