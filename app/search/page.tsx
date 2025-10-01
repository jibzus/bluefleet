import { Suspense } from "react";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchBar } from "@/components/search/SearchBar";

export default function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <main className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Discover Vessels</h1>
        <p className="text-gray-600">
          Find the perfect vessel for your maritime operations
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Main Content: Filters + Results */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <SearchFilters />
        </aside>

        {/* Results */}
        <div className="flex-1">
          <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>
  );
}
