"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import {
  Search,
  MessageSquare,
  Linkedin,
  ArrowRight,
  Filter,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Helper to get random colors for tags if your backend doesn't provide them
const getTagColor = (index: number) => {
  const colors = [
    "bg-emerald-50 text-emerald-700",
    "bg-purple-50 text-purple-700",
    "bg-blue-50 text-blue-700",
    "bg-rose-50 text-rose-700",
  ];
  return colors[index % colors.length];
};

export default function FindTherapist() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    async function fetchTherapists() {
      try {
        setLoading(true);
        // Change this URL to your actual Django server address
        const response = await fetch(
          "http://127.0.0.1:8000/api/public/therapists/",
        );
        const data = await response.json();

        // DRF ListAPIView returns an array or a { results: [] } object if paginated
        setTherapists(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error("Error fetching therapists:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTherapists();
  }, []);

  const categories = [
    "All",
    "Anxiety",
    "Trauma",
    "Depression",
    "Relationships",
    "CBT",
  ];

  const filteredTherapists = therapists.filter((profile: any) => {
    const name = profile.user.full_name.toLowerCase();
    const role = profile.profession_type.toLowerCase();
    const tags = profile.specialization_tags || [];

    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      tags.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    if (selectedFilter === "All") return matchesSearch;

    const matchesFilter = tags.some(
      (tag: string) => tag.toLowerCase() === selectedFilter.toLowerCase(),
    );
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-8 pt-12 md:pt-20">
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2">
            Find Your Match
          </h1>
          <p className="text-slate-500 text-sm md:text-lg">
            Verified professionals ready to support your journey.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all shadow-sm border ${
                  selectedFilter === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTherapists.map((profile: any) => (
              <div
                key={profile.id}
                className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Profile Image - Using a UI Avatar since your model lacks an image field */}
                <div className="h-52 bg-slate-200 relative flex items-center justify-center overflow-hidden">
                  {profile.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt={profile.user.full_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-4xl font-bold uppercase text-slate-400">
                      {profile.user.full_name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {profile.user.full_name}
                  </h3>
                  <p className="text-teal-600 font-semibold text-sm mb-4 capitalize">
                    {profile.profession_type} •{" "}
                    {profile.years_of_experience || 0} yrs exp
                  </p>

                  <div className="mb-6 flex-grow">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Specialties
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialization_tags
                        ?.slice(0, 3)
                        .map((tag: string, i: number) => (
                          <span
                            key={i}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${getTagColor(i)}`}
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <Link
                      href={`/find-therapist/${profile.id}`} // Change profile.user.id to profile.id
                      className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      View Profile <ArrowRight className="w-4 h-4" />
                    </Link>
                    <div className="flex gap-1">
                      <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
