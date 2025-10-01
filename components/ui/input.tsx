import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border px-3 text-sm outline-none",
        "placeholder:text-gray-500 focus:ring-2 focus:ring-primary/30",
        className
      )}
      {...props}
    />
  );
});
