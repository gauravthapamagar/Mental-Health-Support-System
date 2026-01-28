"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { publicAPI } from "@/lib/api"; // Add this import
import {
  MessageSquare,
  Calendar,
  Award,
  Globe,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function TherapistProfilePage() {
  const { id } = useParams();
  const [therapist, setTherapist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchTherapist() {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Fetching therapist with ID:", id);

        // Use publicAPI instead of fetch
        const data = await publicAPI.getTherapistDetail(Number(id));

        console.log("✅ Therapist data received:", data);
        setTherapist(data);
      } catch (error: any) {
        console.error("❌ Error fetching therapist:", error);
        setError(
          error.response?.data?.detail ||
            error.message ||
            "Failed to load therapist profile",
        );
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchTherapist();
  }, [id]);

  const handleBookSession = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/find-therapist/${id}`);
    } else {
      // Navigate to patient therapist booking page
      router.push(`/patient/therapists/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              href="/find-therapist"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all therapists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Therapist Not Found
            </h1>
            <p className="text-slate-600 mb-6">
              This therapist profile is not available.
            </p>
            <Link
              href="/find-therapist"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all therapists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 lg:px-8 py-12 md:py-20">
        {/* Navigation / Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/find-therapist"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to all therapists</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Profile Card (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-100 mb-6 relative">
                {therapist.profile_picture ? (
                  <img
                    src={
                      therapist.profile_picture.startsWith("http")
                        ? therapist.profile_picture
                        : `http://127.0.0.1:8000${therapist.profile_picture}`
                    }
                    alt={therapist.user?.full_name || "Therapist"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-slate-300">
                    {therapist.user?.full_name?.charAt(0) || "?"}
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                  {therapist.user?.full_name || "Unknown"}
                </h1>
                <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
                  {therapist.profession_type || "Therapist"}
                </p>

                <div className="pt-4">
                  <button
                    onClick={handleBookSession}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" /> Book Session
                  </button>
                </div>
              </div>

              {/* Quick Info Grid inside Left Column */}
              <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-medium">
                    {therapist.years_of_experience || 0} Years Experience
                  </span>
                </div>
                {therapist.languages_spoken &&
                  therapist.languages_spoken.length > 0 && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium">
                        Languages: {therapist.languages_spoken.join(", ")}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
              <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  About Me
                </h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {therapist.bio || "No bio provided yet."}
                </p>
              </section>

              {therapist.specialization_tags &&
                therapist.specialization_tags.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                      Specialties
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {therapist.specialization_tags.map(
                        (tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-full text-sm font-semibold border border-slate-100 shadow-sm"
                          >
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                  </section>
                )}

              {therapist.availability_slots &&
                Object.keys(therapist.availability_slots).length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <h2 className="text-xl font-bold text-slate-900">
                        Availability
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(therapist.availability_slots).map(
                        ([day, times]: any) => {
                          const hasSlots =
                            Array.isArray(times) && times.length > 0;
                          return (
                            <div
                              key={day}
                              className={`p-5 rounded-2xl border transition-all ${
                                hasSlots
                                  ? "bg-blue-50/30 border-blue-100 hover:border-blue-300"
                                  : "bg-slate-50 border-slate-100 opacity-60"
                              }`}
                            >
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                {day.slice(0, 3)}
                              </p>
                              <p className="text-sm font-bold text-slate-800">
                                {hasSlots ? times[0] : "Closed"}
                              </p>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </section>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
