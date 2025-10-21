import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trendLabel?: string;
  trendIcon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "info" | "primary";
  className?: string;
}

const variantStyles: Record<
  NonNullable<StatsCardProps["variant"]>,
  { icon: string; trend: string }
> = {
  default: {
    icon:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    trend:
      "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
  },
  success: {
    icon:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    trend:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  warning: {
    icon:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    trend:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  },
  info: {
    icon: "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
    trend: "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
  },
  primary: {
    icon:
      "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground",
    trend:
      "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground",
  },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  trendLabel,
  trendIcon: TrendIcon,
  variant = "default",
  className,
}: StatsCardProps) {
  const variantClass = variantStyles[variant];

  return (
    <Card
      className={cn(
        "slide-up group h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {trendLabel ? (
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                variantClass.trend,
              )}
            >
              {TrendIcon ? <TrendIcon className="h-3.5 w-3.5" /> : null}
              {trendLabel}
            </span>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
            variantClass.icon,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
