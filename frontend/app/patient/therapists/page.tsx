import TherapistCard from "@/components/patient/therapists/TherapistCard";
import { Search } from "lucide-react";

export default function TherapistsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Therapist</h1>
        <p className="text-gray-600">Browse therapists matched to your needs</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Specialties</option>
          <option>Anxiety</option>
          <option>Depression</option>
          <option>CBT</option>
          <option>PTSD</option>
        </select>

        <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Formats</option>
          <option>Video Call</option>
          <option>In-Person</option>
          <option>Phone</option>
        </select>
      </div>

      {/* Therapist List */}
      <div className="space-y-4">
        <TherapistCard
          id="1"
          name="Dr. Sarah Johnson"
          title="Clinical Psychologist"
          experience="12 years"
          matchScore={98}
          specialties={["Anxiety", "CBT", "Trauma"]}
          availability="Available"
          formats={["Video", "In-Person"]}
          image="SJ"
        />

        <TherapistCard
          id="2"
          name="Counsellor David Chen"
          title="CBT Specialist"
          experience="8 years"
          matchScore={85}
          specialties={["Depression", "CBT", "Mindfulness"]}
          availability="Available"
          formats={["Video"]}
          image="DC"
        />

        <TherapistCard
          id="3"
          name="Dr. Emily Rodriguez"
          title="Licensed Therapist"
          experience="15 years"
          matchScore={92}
          specialties={["PTSD", "Trauma", "EMDR"]}
          availability="Limited"
          formats={["Video", "Phone", "In-Person"]}
          image="ER"
        />
      </div>
    </div>
  );
}
