"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  value: string;
  label: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (categoryValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryValue === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryValue);
    }

    params.delete("page"); // Reset to page 1 when changing category

    router.push(`/blog?${params.toString()}`);
  };

  const allCategories = [{ value: "all", label: "All Posts" }, ...categories];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((category) => (
        <button
          key={category.value}
          onClick={() => handleCategoryChange(category.value)}
          className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
            selectedCategory === category.value
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300"
          }`}
        >
          {category.label}
        </button>
      ))}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
