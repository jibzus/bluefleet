import { Card } from "@/components/ui/card";

export function AnalyticsLoading() {
  const cardSkeleton = (
    <Card className="animate-pulse rounded-2xl border border-border/60 bg-muted/30 p-6">
      <div className="mb-4 h-4 w-1/2 rounded bg-muted" />
      <div className="mb-3 h-8 w-2/3 rounded bg-muted" />
      <div className="h-6 w-1/3 rounded bg-muted" />
    </Card>
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24">
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card
            key={index}
            className="animate-pulse rounded-2xl border border-border/60 bg-muted/30 p-6"
          >
            <div className="mb-4 h-4 w-1/2 rounded bg-muted" />
            <div className="mb-3 h-8 w-2/3 rounded bg-muted" />
            <div className="h-6 w-1/3 rounded bg-muted" />
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-[320px] animate-pulse rounded-2xl border border-border/60 bg-muted/30" />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="h-[200px] animate-pulse rounded-2xl border border-border/60 bg-muted/30" />
        ))}
      </section>

      <section className="grid gap-6">
        {cardSkeleton}
        <Card className="h-[320px] animate-pulse rounded-2xl border border-border/60 bg-muted/30" />
      </section>
    </main>
  );
}

