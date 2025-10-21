import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
			},
			size: {
				default: "px-4 py-2 text-sm",
				sm: "px-3 py-1.5 text-xs",
				lg: "px-6 py-3 text-base",
				icon: "h-9 w-9"
			}
		},
		defaultVariants: {
			variant: "default",
			size: "default"
		}
	}
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
	);
}
