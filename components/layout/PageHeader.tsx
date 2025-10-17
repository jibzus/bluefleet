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
    <div className={cn("mb-8 flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <Breadcrumbs
            items={breadcrumbs}
            backHref={backHref}
            backLabel={backLabel}
            className="mb-2"
          />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

