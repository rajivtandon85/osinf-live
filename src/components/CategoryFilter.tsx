"use client";

import { Category, CategoryId } from "@/types/feed";
import { CATEGORIES } from "@/lib/sources";

interface CategoryFilterProps {
  selected: CategoryId | "all";
  onSelect: (cat: CategoryId | "all") => void;
  counts: Partial<Record<CategoryId | "all", number>>;
}

const ALL_OPTION = {
  id: "all" as const,
  label: "All Sources",
  icon: "◈",
  color: "text-white/70",
  bgColor: "bg-white/5",
  borderColor: "border-white/10",
};

export function CategoryFilter({ selected, onSelect, counts }: CategoryFilterProps) {
  const options = [ALL_OPTION, ...Object.values(CATEGORIES)];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((cat) => {
        const isSelected = selected === cat.id;
        const count = counts[cat.id as CategoryId | "all"] ?? 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id as CategoryId | "all")}
            className={`
              flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium
              ring-1 transition-all duration-150
              ${
                isSelected
                  ? `${cat.color} ${cat.bgColor} ${cat.borderColor} ring-current/50`
                  : "text-white/40 bg-transparent border-transparent ring-white/10 hover:text-white/60 hover:ring-white/20"
              }
            `}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            {count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${
                  isSelected ? "bg-white/10" : "bg-white/5"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
