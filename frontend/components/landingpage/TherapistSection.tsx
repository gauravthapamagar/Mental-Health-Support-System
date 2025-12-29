"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Linkedin, MessageSquare } from "lucide-react";

const therapists = [
  {
    id: 1,
    name: "Dr. Alisha Verma",
    title: "Clinical Psychologist",
    specialties: ["Anxiety & Depression", "Trauma", "CBT"],
    image: "/images/home/doctor1.jpg",
  },
  {
    id: 2,
    name: "Mr. Rahul Sharma",
    title: "Licensed MFT",
    specialties: ["Relationship Issues", "Family Dynamics", "Couples Therapy"],
    image: "/images/home/doctor2.webp",
  },
  {
    id: 3,
    name: "Dr. Priya Desai",
    title: "Psychiatrist",
    specialties: ["Medication Management", "Mood Disorders", "ADHD"],
    image: "/images/home/doctor3.webp",
  },
  {
    id: 4,
    name: "Dr. Marcus Cole",
    title: "Behavioral Therapist",
    specialties: ["Addiction Recovery", "Habit Breaking", "Mindfulness"],
    image: "/images/home/doctor7.jpg",
  },
  {
    id: 5,
    name: "Ms. Sarah Jenkins",
    title: "Child Psychologist",
    specialties: ["Adolescent Issues", "Learning Disabilities", "Play Therapy"],
    image: "/images/home/doctor4.jpeg",
  },
  {
    id: 6,
    name: "Dr. Omar Hassan",
    title: "Trauma Specialist",
    specialties: ["PTSD", "EMDR", "Grief Counseling"],
    image: "/images/home/doctor7.avif",
  },
];

const getTagStyle = (index) => {
  const styles = [
    "bg-teal-50 text-teal-700 border-teal-100",
    "bg-indigo-50 text-indigo-700 border-indigo-100",
    "bg-sky-50 text-sky-700 border-sky-100",
  ];
  return styles[index % styles.length];
};

const TherapistsSection = () => {
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Lazy loading state for entrance animations
  const [visibleCards, setVisibleCards] = useState([]);
  const cardRefs = useRef([]);

  // Entrance Animation Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px" }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
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
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, isHovering]);

  return (
    <section className="py-24 bg-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Meet Our Compassionate Therapists
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Highly skilled professionals dedicated to providing personalized
            care. Slide to find the right match for your journey.
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onPointerDown={() => setIsHovering(true)}
          className="flex overflow-x-auto pb-12 gap-8 snap-x snap-mandatory no-scrollbar px-2"
        >
          {therapists.map((therapist, index) => (
            <div
              key={therapist.id}
              data-index={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className={`flex-none w-[340px] snap-center group bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] overflow-hidden flex flex-col border border-slate-100 transition-all duration-1000 ease-out ${
                visibleCards.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{
                height: "520px",
                transitionDelay: `${(index % 3) * 150}ms`,
              }}
            >
              {/* Optimized Image Container */}
              <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/20 to-indigo-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <Image
                  src={therapist.image}
                  alt={therapist.name}
                  fill
                  sizes="340px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-grow relative z-20 bg-white">
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  {therapist.name}
                </h3>
                <p className="text-teal-700 font-medium mb-4 text-sm">
                  {therapist.title}
                </p>

                {/* Specialties */}
                <div className="mb-6 flex-grow">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                    Specialties
                  </h4>
                  <ul className="flex flex-wrap gap-2">
                    {therapist.specialties.map((specialty, i) => (
                      <li
                        key={i}
                        className={`text-xs font-medium px-3 py-1 rounded-full border ${getTagStyle(
                          i
                        )}`}
                      >
                        {specialty}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions & Social */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <a
                    href={`/therapists/${therapist.id}`}
                    className="text-slate-700 font-semibold hover:text-blue-700 transition-colors flex items-center gap-2 group/link text-sm"
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform text-blue-500" />
                  </a>
                  <div className="flex gap-4 text-slate-400">
                    <Linkedin className="w-5 h-5 hover:text-teal-600 cursor-pointer transition-colors" />
                    <MessageSquare className="w-5 h-5 hover:text-teal-600 cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Indicators */}
        <div className="flex justify-center gap-2 mt-6">
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
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "bg-blue-600 w-8"
                  : "bg-slate-300 hover:bg-blue-400"
              }`}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href="/find-a-therapist"
            className="group inline-flex items-center px-8 py-4 text-white bg-blue-600 hover:bg-blue-700 rounded-full font-semibold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            View All Therapists
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
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
