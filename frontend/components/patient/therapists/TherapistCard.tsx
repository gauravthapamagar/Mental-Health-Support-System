"use client";
import { Video, Phone, MapPin, Star, Clock } from "lucide-react";
import Link from "next/link";

interface TherapistCardProps {
  id: string;
  name: string;
  title: string;
  experience: string;
  matchScore: number;
  specialties: string[];
  availability: "Available" | "Limited" | "Unavailable";
  formats: ("Video" | "In-Person" | "Phone")[];
  image: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
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
  onBookClick,
}: TherapistCardProps) {
  // CONFIG: Change this to your actual Django server URL
  const BACKEND_URL = "http://127.0.0.1:8000";

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
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  // Logic to handle images vs initials
  const isImageUrl = image && (image.includes("/") || image.startsWith("http"));
  const finalImageUrl =
    image && image.startsWith("/") ? `${BACKEND_URL}${image}` : image;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
            {isImageUrl ? (
              <img
                src={finalImageUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML = `<span class="text-2xl font-bold text-white">${name.charAt(0)}</span>`;
                }}
              />
            ) : (
              <span className="text-2xl font-bold text-white">{image}</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-bold border border-green-200">
                  {matchScore}% Match
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor()}`}
                >
                  {availability}
                </span>
              </div>

              <p className="text-gray-600 mb-2">
                {title} • {experience} experience
              </p>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900">{rating}</span>
                </div>
                <span className="text-sm text-gray-500">
                  ({reviewCount} reviews)
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">
                  Available formats:
                </span>
                <div className="flex items-center gap-2">
                  {formats.map((format) => (
                    <div
                      key={format}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {getFormatIcon(format)}
                      <span className="text-xs font-medium text-gray-700 capitalize">
                        {format}
                      </span>
                    </div>
                  ))}
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
