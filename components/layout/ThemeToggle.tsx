"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = () => {
		if (!mounted) {
			return;
		}

		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	};

	const iconClasses = "h-[1.1rem] w-[1.1rem] transition-all";

	return (
		<Button type="button" variant="ghost" size="icon" onClick={toggleTheme} className="relative rounded-full" aria-label="Toggle theme">
			<Sun className={`${iconClasses} rotate-0 scale-100 dark:-rotate-90 dark:scale-0`} />
			<Moon className={`${iconClasses} absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100`} />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
