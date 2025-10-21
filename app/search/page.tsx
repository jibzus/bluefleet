import { Suspense } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchBar } from "@/components/search/SearchBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";

export default function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24">
      <PageHeader
        title="Discover Vessels"
        description="Find the perfect vessel for your maritime operations"
      />

      <Card className="fade-in rounded-3xl border border-border/70 bg-card/95 p-6 shadow-lg backdrop-blur">
        <SearchBar />
      </Card>

      <section className="fade-in">
        <div className="mb-6 lg:hidden">
          <details className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors">
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-foreground transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Tap to refine your search
              </span>
            </summary>
            <div className="mt-4 border-t border-border/60 pt-4">
              <SearchFilters />
            </div>
          </details>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <Card className="sticky top-28 h-fit rounded-3xl border border-border bg-card/95 p-6 shadow-sm backdrop-blur">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                Refine Results
              </div>
              <SearchFilters />
            </Card>
          </aside>

          <div className="space-y-6">
            <Suspense fallback={<SearchResultsSkeleton />}>
              <SearchResults searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className="animate-pulse rounded-2xl border border-border/60 bg-muted/40 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <div className="h-32 rounded-xl bg-muted" />
            <div className="space-y-3">
              <div className="h-5 w-2/3 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted/70" />
              <div className="h-4 w-3/4 rounded bg-muted/60" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
