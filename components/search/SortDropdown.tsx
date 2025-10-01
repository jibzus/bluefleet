"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "year-new", label: "Year: Newest First" },
  { value: "year-old", label: "Year: Oldest First" },
];

export function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "recent";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "recent") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">Sort by:</label>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="rounded-lg border px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

