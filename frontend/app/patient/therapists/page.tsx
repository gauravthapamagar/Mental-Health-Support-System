"use client";
import { useEffect, useState } from "react";
import TherapistCard from "@/components/patient/therapists/TherapistCard";
import BookAppointmentModal from "@/components/patient/BookAppointmentModal/page";
import { Search, Loader2 } from "lucide-react";
import { bookingAPI } from "@/lib/api";

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Filter States
  const [specialization, setSpecialization] = useState("");
  const [mode, setMode] = useState("");

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const data = await bookingAPI.listTherapists({
        specialization:
          specialization !== "All Specialties" ? specialization : "",
        mode: mode !== "All Formats" ? mode : "",
      });
      
      console.log("[v0] Full API Response:", data);
      if (data.results && data.results.length > 0) {
        console.log("[v0] First therapist object keys:", Object.keys(data.results[0]));
        console.log("[v0] First therapist full object:", JSON.stringify(data.results[0], null, 2));
      }
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
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : therapists.length > 0 ? (
          therapists.map((t: any) => {
            // Format profile picture URL
            let profilePicture = t.profile_picture;
            if (profilePicture && !profilePicture.startsWith('http')) {
              profilePicture = `http://127.0.0.1:8000${profilePicture}`;
            }
            
            // Construct address string - check both top-level and nested profile object
            const addressParts = [];
            
            // Try top-level fields first
            const addr1 = t.address_line_1 || t.profile?.address_line_1;
            const addr2 = t.address_line_2 || t.profile?.address_line_2;
            const city = t.city || t.profile?.city;
            const state = t.state || t.profile?.state;
            const postalCode = t.postal_code || t.profile?.postal_code;
            
            if (addr1) addressParts.push(addr1);
            if (addr2) addressParts.push(addr2);
            if (city) addressParts.push(city);
            if (state) addressParts.push(state);
            if (postalCode) addressParts.push(postalCode);
            
            const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : undefined;
            console.log("[v0] Therapist:", t.full_name, "Address:", fullAddress);

            return (
              <TherapistCard
                key={t.id}
                id={t.id.toString()}
                name={t.full_name}
                title={t.profession || 'Therapist'}
                experience={`${t.years_of_experience || 0} years`}
                matchScore={95}
                specialties={t.specialization || []}
                availability={t.is_verified ? "Available" : "Limited"}
                formats={t.consultation_mode ? [
                  t.consultation_mode.charAt(0).toUpperCase() + 
                  t.consultation_mode.slice(1)
                ] : ["Video"]}
                image={profilePicture || t.full_name.charAt(0)}
                bio={t.bio || ''}
                rating={4.9}
                reviewCount={127}
                fees={t.consultation_fees}
                address={fullAddress}
                onBookClick={() =>
                  setSelectedTherapist({ id: t.id, name: t.full_name })
                }
              />
            );
          })
        ) : (
          <p className="text-center py-20 text-gray-500">
            No therapists found matching your criteria.
          </p>
        )}
      </div>

      {/* The Booking Popup Modal */}
      {selectedTherapist && (
        <BookAppointmentModal
          therapistId={selectedTherapist.id}
          therapistName={selectedTherapist.name}
          onClose={() => setSelectedTherapist(null)}
          onSuccess={() => {
            // alert("Appointment request sent!");
            setSelectedTherapist(null);
          }}
        />
      )}
    </div>
  );
}
