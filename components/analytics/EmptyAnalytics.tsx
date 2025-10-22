import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyAnalytics() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 pb-24 text-center">
      <Card className="flex w-full flex-col items-center gap-6 rounded-3xl border border-dashed border-border/70 bg-muted/20 p-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BarChart3 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">No analytics yet</h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Start booking vessels on BlueFleet to unlock performance insights, spending trends, and vessel utilisation analytics.
          </p>
        </div>
        <Link href="/search">
          <Button size="lg">Browse vessels</Button>
        </Link>
      </Card>
    </main>
  );
}

