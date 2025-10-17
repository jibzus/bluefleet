import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: Breadcrumb[];
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function Breadcrumbs({
  items,
  backHref,
  backLabel,
  className,
}: BreadcrumbsProps) {
  if (!items?.length && !backHref) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
        >
          <span aria-hidden>←</span>
          <span>{backLabel ?? "Back"}</span>
        </Link>
      ) : null}

      {items?.length ? (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
          {backHref ? <span className="text-muted-foreground">/</span> : null}
          <ol className="flex flex-wrap items-center gap-2 text-muted-foreground">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li key={item.label} className="flex items-center gap-2">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "font-medium",
                        isLast ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast ? <span className="text-muted-foreground">/</span> : null}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}
    </div>
  );
}

