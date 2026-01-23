"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Award,
  Globe,
  ArrowLeft,
  Loader2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import BookAppointmentModal from "@/components/patient/BookAppointmentModal";

export default function PatientTherapistProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [therapist, setTherapist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    async function fetchTherapist() {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Fetching therapist with ID:", id);

        const response = await fetch(
          `http://127.0.0.1:8000/api/public/therapists/${id}/`,
        );

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        console.log("✅ Therapist data received:", data);

        setTherapist(data);
      } catch (error: any) {
        console.error("❌ Error fetching therapist data:", error);
        setError(error.message || "Failed to load therapist profile");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTherapist();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Link
          href="/patient/therapists"
          className="text-blue-600 hover:underline"
        >
          Back to therapists
        </Link>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="p-10 text-center">
        <div className="mb-4">Therapist not found.</div>
        <Link
          href="/patient/therapists"
          className="text-blue-600 hover:underline"
        >
          Back to therapists
        </Link>
      </div>
    );
  }

  // DATA MAPPING - Handle both possible response structures
  const specialties =
    therapist.specializations || therapist.specialization_tags || [];

  const fullName =
    therapist.user?.full_name || therapist.full_name || "Therapist";

  const profilePic = therapist.profile_picture
    ? therapist.profile_picture.startsWith("http")
      ? therapist.profile_picture
      : `http://127.0.0.1:8000${therapist.profile_picture}`
    : null;

  return (
    <div className="w-full">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/patient/therapists"
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-medium">Back to all therapists</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-full aspect-square rounded-[2rem] overflow-hidden bg-slate-100 mb-6 border border-slate-50">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-slate-300">
                  {fullName.charAt(0)}
                </div>
              )}
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {fullName}
              </h1>
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">
                {therapist.profession_type || "THERAPIST"}
              </p>
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full bg-[#1D61FF] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Calendar size={20} />
              Book Session
            </button>

            <div className="w-full mt-8 pt-6 border-t border-slate-50 space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <Award size={18} className="text-emerald-500" />
                <span className="text-sm font-medium">
                  {therapist.years_of_experience || 0} Years Experience
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Globe size={18} className="text-blue-500" />
                <span className="text-sm font-medium">
                  Languages:{" "}
                  {therapist.languages_spoken?.join(", ") || "English"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
            {/* About Section */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                About Me
              </h2>
              <p className="text-slate-500 leading-relaxed text-lg">
                {therapist.bio || "No bio provided yet."}
              </p>
            </section>

            {/* Specialties Section */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-slate-900 mb-5">
                Specialties
              </h2>
              <div className="flex flex-wrap gap-3">
                {specialties.length > 0 ? (
                  specialties.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-6 py-2.5 bg-slate-50 text-slate-600 rounded-full text-sm font-semibold border border-slate-100 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400 italic">
                    No specialties listed yet.
                  </p>
                )}
              </div>
            </section>

            {/* Availability Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-slate-900">
                  Weekly Schedule
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {therapist.availability_slots &&
                Object.keys(therapist.availability_slots).length > 0 ? (
                  Object.entries(therapist.availability_slots).map(
                    ([day, times]: any) => {
                      const hasSlots = Array.isArray(times) && times.length > 0;
                      return (
                        <div
                          key={day}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            hasSlots
                              ? "bg-blue-50/50 border-blue-100"
                              : "bg-slate-50/50 border-slate-100 opacity-60"
                          }`}
                        >
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            {day.slice(0, 3)}
                          </p>
                          <p
                            className={`text-sm font-bold ${hasSlots ? "text-blue-700" : "text-slate-400"}`}
                          >
                            {hasSlots ? `${times[0]}` : "Off"}
                          </p>
                        </div>
                      );
                    },
                  )
                ) : (
                  <div className="col-span-full p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400 italic">
                    General schedule not provided. Click "Book Session" to see
                    specific available dates.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookAppointmentModal
          therapistId={Number(id)}
          therapistName={fullName}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={() => {
            setIsBookingModalOpen(false);
            router.push("/patient/appointments");
          }}
        />
      )}
    </div>
  );
}
