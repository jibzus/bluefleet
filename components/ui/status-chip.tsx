import { cn } from "@/lib/utils";

type StatusVariant =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "muted"
  | "primary";

const variantClasses: Record<StatusVariant, string> = {
  info: "bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300",
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  danger:
    "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300",
  muted: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary dark:text-primary-foreground",
};

interface StatusChipProps {
  label: string;
  icon?: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

export function StatusChip({
  label,
  icon,
  variant = "muted",
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
