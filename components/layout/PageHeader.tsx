import { Breadcrumbs, type Breadcrumb } from "./Breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  backLabel,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "fade-in mb-10 flex flex-col gap-6 sm:gap-8",
        className,
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-4">
          <Breadcrumbs
            items={breadcrumbs}
            backHref={backHref}
            backLabel={backLabel}
            className={cn(
              "flex flex-wrap gap-2 text-xs font-medium text-muted-foreground",
              breadcrumbs || backHref ? undefined : "hidden",
            )}
          />
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h1>
          </div>
          {description
            ? typeof description === "string"
              ? (
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  {description}
                </p>
                )
              : (
                <div className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  {description}
                </div>
                )
            : null}
        </div>
        {actions ? (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
