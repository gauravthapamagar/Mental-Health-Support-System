"use client";
import { Video, Phone, MapPin, Star, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

interface TherapistCardProps {
  id: string;
  name: string;
  title: string;
  experience: string;
  matchScore: number;
  specialties: string[];
  availability: "Available" | "Limited" | "Unavailable";
  formats: ("Video" | "In-Person" | "Phone" | "Online" | "Offline" | "Both")[];
  image: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  fees?: number | string;
  address?: string;
  onBookClick: () => void;
}

export default function TherapistCard({
  id,
  name,
  title,
  experience,
  matchScore,
  specialties,
  availability,
  formats,
  image,
  bio,
  rating = 4.9,
  reviewCount = 127,
  fees,
  address,
  onBookClick,
}: TherapistCardProps) {
  const getAvailabilityColor = () => {
    switch (availability) {
      case "Available":
        return "bg-green-100 text-green-700 border-green-200";
      case "Limited":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Unavailable":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format?.toLowerCase()) {
      case "video":
      case "online":
        return <Video size={16} className="text-blue-600" />;
      case "in-person":
      case "offline":
        return <MapPin size={16} className="text-green-600" />;
      case "phone":
        return <Phone size={16} className="text-purple-600" />;
      case "both":
        return <Video size={16} className="text-blue-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  // Logic to handle images vs initials
  const isImageUrl = image && (image.includes("/") || image.startsWith("http"));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
            {isImageUrl ? (
              <img
                src={image || "/placeholder.svg"}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `<span class="text-2xl font-bold text-white">${name.charAt(0)}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {image || name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900">{name}</h3>
               
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor()}`}
                >
                  {availability}
                </span>
              </div>

              <p className="text-gray-600 mb-2">
                {title} • {experience} experience
              </p>

              {address && (
                <div className="flex items-start gap-2 mb-3 text-gray-600">
                  <MapPin size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{address}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-gray-900">{rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({reviewCount} reviews)
                  </span>
                </div>

                {/* Add Fees Display */}
                {fees && (
  <div className="flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
    <span className="text-green-600 text-base font-bold">₹</span>
    <span className="text-sm font-bold text-green-700">
      {fees}/session
    </span>
  </div>
)}
</div>

              <div className="flex flex-wrap gap-2 mb-3">
                {specialties && specialties.length > 0 ? (
                  specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">
                    No specialties listed
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">
                  Available formats:
                </span>
                <div className="flex items-center gap-2">
                  {formats && formats.length > 0 ? (
                    formats.map((format, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {getFormatIcon(format)}
                        <span className="text-xs font-medium text-gray-700 capitalize">
                          {format}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Not specified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-shrink-0">
          <Link
            href={`/patient/therapists/${id}`}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
          >
            View Profile
          </Link>
          <button
            onClick={onBookClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
