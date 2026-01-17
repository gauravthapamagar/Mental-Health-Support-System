"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";

const categories = [
  { id: "all", label: "For You", color: "blue" },
  { id: "anxiety", label: "Anxiety", color: "purple" },
  { id: "depression", label: "Depression", color: "indigo" },
  { id: "mindfulness", label: "Mindfulness", color: "green" },
  { id: "stress", label: "Stress Management", color: "yellow" },
  { id: "sleep", label: "Sleep", color: "pink" },
  { id: "relationships", label: "Relationships", color: "red" },
  { id: "saved", label: "Saved", color: "gray" },
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
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-2 px-6 py-3 border rounded-lg transition-colors ${
            showAdvancedFilters
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Filter size={20} />
          <span className="font-medium hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeCategory === category.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Advanced Filters</h3>
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reading time
              </label>
              <select
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All lengths</option>
                <option value="quick">Quick read (1-3 min)</option>
                <option value="medium">Medium (4-7 min)</option>
                <option value="long">In-depth (8+ min)</option>
              </select>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content type
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All types</option>
                <option value="guide">Guides</option>
                <option value="tips">Tips & Tricks</option>
                <option value="research">Research-based</option>
                <option value="personal">Personal Stories</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(activeCategory !== "all" ||
            searchQuery ||
            sortBy !== "recent" ||
            readTime !== "all") && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">
                  Active filters:
                </span>

                {activeCategory !== "all" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                    {categories.find((c) => c.id === activeCategory)?.label}
                    <button
                      onClick={() => setActiveCategory("all")}
                      className="hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}

                {sortBy !== "recent" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                    Sort: {sortBy}
                    <button
                      onClick={() => setSortBy("recent")}
                      className="hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}

                {readTime !== "all" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                    Time: {readTime}
                    <button
                      onClick={() => setReadTime("all")}
                      className="hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
