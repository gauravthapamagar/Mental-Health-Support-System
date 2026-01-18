"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";

const categories = [
  { id: "all", label: "For You" },
  { id: "anxiety", label: "Anxiety" },
  { id: "depression", label: "Depression" },
  { id: "mindfulness", label: "Mindfulness" },
  { id: "stress", label: "Stress Management" },
  { id: "sleep", label: "Sleep" },
  { id: "relationships", label: "Relationships" },
  { id: "saved", label: "Saved" },
];

export default function ArticleFilters() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [readTime, setReadTime] = useState("all");

  const handleClearFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setSortBy("recent");
    setReadTime("all");
    setShowAdvancedFilters(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Search Bar and Filter Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title or keywords..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 border rounded-xl font-semibold transition-all shadow-sm ${
            showAdvancedFilters
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Filter size={18} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* 2. Category Pill Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all ${
              activeCategory === category.id
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* 3. Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-300 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Refine Search</h3>
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              Clear all filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sort By */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="relevant">Most Relevant</option>
                <option value="shortest">Shortest First</option>
                <option value="longest">Longest First</option>
              </select>
            </div>

            {/* Read Time */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Reading Time
              </label>
              <select
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="all">All lengths</option>
                <option value="quick">Quick read (1-3 min)</option>
                <option value="medium">Medium (4-7 min)</option>
                <option value="long">In-depth (8+ min)</option>
              </select>
            </div>

            {/* Content Type (Static example) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Content Type
              </label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                <option value="all">All types</option>
                <option value="guide">Guides</option>
                <option value="tips">Tips & Tricks</option>
                <option value="research">Research-based</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 4. Active Filters Summary Badges */}
      {(activeCategory !== "all" ||
        searchQuery ||
        sortBy !== "recent" ||
        readTime !== "all") && (
        <div className="flex items-center gap-3 flex-wrap animate-in fade-in duration-500">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">
            Active:
          </span>

          {activeCategory !== "all" && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100">
              {categories.find((c) => c.id === activeCategory)?.label}
              <button onClick={() => setActiveCategory("all")}>
                <X size={14} />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery("")}>
                <X size={14} />
              </button>
            </span>
          )}

          {sortBy !== "recent" && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100">
              Sort: {sortBy}
              <button onClick={() => setSortBy("recent")}>
                <X size={14} />
              </button>
            </span>
          )}

          {readTime !== "all" && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100">
              Time: {readTime}
              <button onClick={() => setReadTime("all")}>
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
