"use client";
import { useEffect, useState } from "react";
import TherapistCard from "@/components/patient/therapists/TherapistCard";
import BookAppointmentModal from "@/components/patient/BookAppointmentModal"; // We'll create this next
import { Search, Loader2 } from "lucide-react";
import { bookingAPI } from "@/lib/api";

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState<{id: number, name: string} | null>(null);
  
  // Filter States
  const [specialization, setSpecialization] = useState("");
  const [mode, setMode] = useState("");

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const data = await bookingAPI.listTherapists({ 
        specialization: specialization !== "All Specialties" ? specialization : "",
        mode: mode !== "All Formats" ? mode : "" 
      });
      setTherapists(data.results || []);
    } catch (error) {
      console.error("Error loading therapists", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, [specialization, mode]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Therapist</h1>
        <p className="text-gray-600">Browse therapists matched to your needs</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select 
          onChange={(e) => setSpecialization(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option>All Specialties</option>
          <option value="anxiety">Anxiety</option>
          <option value="depression">Depression</option>
          <option value="cbt">CBT</option>
        </select>

        <select 
          onChange={(e) => setMode(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option>All Formats</option>
          <option value="online">Video Call</option>
          <option value="offline">In-Person</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : therapists.length > 0 ? (
          therapists.map((t: any) => (
            <TherapistCard
              key={t.id}
              id={t.id}
              name={t.full_name}
              title={t.profession}
              experience={`${t.years_of_experience} years`}
              specialties={t.specialization || []}
              availability={t.is_verified ? "Verified" : "Available"}
              formats={[t.consultation_mode]}
              // We pass a function to open the modal
              onBookClick={() => setSelectedTherapist({ id: t.id, name: t.full_name })}
            />
          ))
        ) : (
          <p className="text-center py-20 text-gray-500">No therapists found matching your criteria.</p>
        )}
      </div>

      {/* The Booking Popup Modal */}
      {selectedTherapist && (
        <BookAppointmentModal
          therapistId={selectedTherapist.id}
          therapistName={selectedTherapist.name}
          onClose={() => setSelectedTherapist(null)}
          onSuccess={() => {
            alert("Appointment request sent!");
            setSelectedTherapist(null);
          }}
        />
      )}
    </div>
  );
}