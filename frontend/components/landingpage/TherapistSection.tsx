"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, MessageSquare, Linkedin, Loader2 } from "lucide-react";
import Link from "next/link";

// Consistent tag styling based on your screenshots
const getTagStyle = (index: number) => {
  const styles = [
    "bg-emerald-50 text-emerald-700 border-emerald-100",
    "bg-purple-50 text-purple-700 border-purple-100",
    "bg-blue-50 text-blue-700 border-blue-100",
    "bg-rose-50 text-rose-700 border-rose-100",
  ];
  return styles[index % styles.length];
};

const TherapistsSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // FINAL FETCH FIX: Using the exact logic from your working FindTherapist page
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true);
        // Using direct fetch to ensure no API utility configuration issues
        const response = await fetch(
          "http://127.0.0.1:8000/api/public/therapists/",
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        const therapistList = Array.isArray(data) ? data : data.results || [];

        // CRITICAL: Ensure therapist and user objects exist before setting state
        const validTherapists = therapistList.filter((t: any) => t && t.user);

        setTherapists(validTherapists);
      } catch (error) {
        console.error("Error loading therapists in section:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapists();
  }, []);

  // Entrance Animation Logic
  useEffect(() => {
    if (therapists.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 },
    );
    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });
    return () => observer.disconnect();
  }, [therapists]);

  // Carousel Auto-scroll
  useEffect(() => {
    if (therapists.length === 0 || loading) return;
    const interval = setInterval(() => {
      if (!isHovering && scrollContainerRef.current) {
        const nextIndex = (currentIndex + 1) % therapists.length;
        const cardWidth = 340 + 32;
        scrollContainerRef.current.scrollTo({
          left: nextIndex * cardWidth,
          behavior: "smooth",
        });
        setCurrentIndex(nextIndex);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex, isHovering, therapists.length, loading]);

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Meet Our Compassionate Therapists
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Highly skilled professionals dedicated to providing personalized
            care.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">
              Loading professionals...
            </p>
          </div>
        ) : (
          <>
            <div
              ref={scrollContainerRef}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="flex overflow-x-auto pb-12 gap-8 snap-x snap-mandatory no-scrollbar px-4"
            >
              {therapists.length > 0 ? (
                therapists.map((therapist, index) => (
                  <div
                    key={therapist.id || index}
                    data-index={index}
                    ref={(el) => (cardRefs.current[index] = el)}
                    className={`flex-none w-[340px] snap-center group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-700 ease-out border border-slate-100 overflow-hidden flex flex-col ${
                      visibleCards.includes(index)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-16"
                    }`}
                    style={{
                      height: "540px",
                      transitionDelay: `${(index % 3) * 100}ms`,
                    }}
                  >
                    {/* Image */}
                    <div className="h-60 bg-slate-200 relative overflow-hidden">
                      {therapist.profile_picture ? (
                        <img
                          src={therapist.profile_picture}
                          alt={therapist.user.full_name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                          <span className="text-5xl font-bold">
                            {therapist.user.full_name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">
                        {therapist.user.full_name}
                      </h3>
                      <p className="text-emerald-600 font-bold text-sm mb-5">
                        {therapist.profession_type} •{" "}
                        {therapist.years_of_experience || 0} Yrs Exp
                      </p>

                      <div className="flex-grow">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          Specialties
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {therapist.specialization_tags
                            ?.slice(0, 3)
                            .map((tag: string, i: number) => (
                              <span
                                key={i}
                                className={`px-4 py-1.5 rounded-full text-[11px] font-bold border ${getTagStyle(i)}`}
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                        <Link
                          href={`/find-therapist/${therapist.id}`}
                          className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600"
                        >
                          View Profile <ArrowRight className="w-4 h-4" />
                        </Link>
                        <MessageSquare className="w-5 h-5 text-slate-300 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-10 text-slate-500">
                  No therapists available to display.
                </div>
              )}
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-4">
              {therapists.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const cardWidth = 340 + 32;
                    scrollContainerRef.current?.scrollTo({
                      left: index * cardWidth,
                      behavior: "smooth",
                    });
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-500 ${currentIndex === index ? "bg-blue-600 w-10" : "bg-slate-200 w-2"}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="text-center mt-16">
          <Link
            href="/find-therapist"
            className="inline-flex items-center px-10 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg"
          >
            View All Therapists <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TherapistsSection;
