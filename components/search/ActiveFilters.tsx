"use client";

import { useRouter } from "next/navigation";

interface ActiveFiltersProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ActiveFilters({ searchParams }: ActiveFiltersProps) {
  const router = useRouter();

  const filters = Object.entries(searchParams).filter(
    ([key]) => !["q", "sort"].includes(key)
  );

  if (filters.length === 0) {
    return null;
  }

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams as any);
    params.delete(key);
    router.push(`/search?${params.toString()}`);
  };

  const getFilterLabel = (key: string, value: string | string[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    
    switch (key) {
      case "type":
        return `Type: ${val}`;
      case "status":
        return `Status: ${val}`;
      case "minPrice":
        return `Min Price: ${val}`;
      case "maxPrice":
        return `Max Price: ${val}`;
      case "currency":
        return `Currency: ${val}`;
      case "location":
        return `Location: ${val}`;
      case "minYear":
        return `From: ${val}`;
      case "maxYear":
        return `To: ${val}`;
      case "noxCompliant":
        return "NOx Compliant";
      case "soxCompliant":
        return "SOx Compliant";
      case "availableFrom":
        return `Available: ${new Date(val).toLocaleDateString()}`;
      default:
        return `${key}: ${val}`;
    }
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {filters.map(([key, value]) => (
        <button
          key={key}
          onClick={() => removeFilter(key)}
          className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
        >
          <span>{getFilterLabel(key, value!)}</span>
          <span className="text-xs">✕</span>
        </button>
      ))}
    </div>
  );
}

