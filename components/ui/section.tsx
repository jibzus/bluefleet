import { cn } from "@/lib/utils";

interface SectionProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  centered?: boolean;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}

export function Section({
  title,
  description,
  centered,
  className,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <section className={cn("fade-in", className)}>
      <div
        className={cn(
          "mx-auto max-w-6xl px-6",
          centered ? "text-center" : undefined,
          containerClassName,
        )}
      >
        {(title || description) && (
          <header
            className={cn(
              "mb-10",
              centered ? "mx-auto max-w-3xl space-y-3" : "space-y-3",
            )}
          >
            {title ? (
              <h2 className="text-4xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-lg text-muted-foreground">{description}</p>
            ) : null}
          </header>
        )}
        <div className="space-y-6">{children}</div>
      </div>
    </section>
  );
}
