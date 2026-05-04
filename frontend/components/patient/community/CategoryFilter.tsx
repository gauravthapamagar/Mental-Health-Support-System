import React from "react";
import { CommunityCategory } from "@/lib/api";
import { Layers } from "lucide-react";

interface CategoryFilterProps {
  categories: CommunityCategory[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-blue-600" />
        Categories
      </h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
            selectedCategory === null
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>All Topics</span>
            {selectedCategory === null && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
              selectedCategory === cat.slug
                ? "shadow-md transform scale-105"
                : "hover:shadow-sm hover:scale-102"
            }`}
            style={{
              backgroundColor:
                selectedCategory === cat.slug ? cat.color : cat.color + "10",
              color: selectedCategory === cat.slug ? "white" : cat.color,
            }}
          >
            {/* Background decoration */}
            <div
              className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
              style={{
                background: `linear-gradient(135deg, transparent 30%, ${cat.color} 100%)`,
              }}
            ></div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                {cat.icon && <span className="text-lg">{cat.icon}</span>}
                <span className="font-medium">{cat.name}</span>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  selectedCategory === cat.slug
                    ? "bg-white/20"
                    : "bg-white/50"
                }`}
              >
                {cat.post_count}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;