"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const targetAudience = [
  {
    category: "Individuals",
    title: "Seeking Support",
    description:
      "People navigating life's challenges who need a safe space to talk and professional guidance to find their peace.",
    imageUrl: "/images/home/doc1.jpeg",
    badge: "Patient",
  },
  {
    category: "Specialists",
    title: "Health Professionals",
    description:
      "Licensed therapists looking to expand their practice, manage appointments, and connect with patients seamlessly.",
    imageUrl: "/images/home/doc1.jpeg",
    badge: "Therapist",
  },
  {
    category: "Corporate",
    title: "Busy Professionals",
    description:
      "High-performers dealing with stress, burnout, or work-life balance who require flexible, remote mental health support.",
    imageUrl: "/images/home/doc1.jpeg",
    badge: "Workplace",
  },
];

export default function WhoIsItFor() {
  const [visibleItems, setVisibleItems] = useState([]);
  const itemRefs = useRef([]);

  useEffect(() => {
    const observers = [];

    itemRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }
          });
        },
        {
          threshold: 0.15, // Triggers when 15% of the card is visible
          rootMargin: "0px 0px -50px 0px",
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest">
            Audience
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Who is MentalSathi For?
          </h2>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Whether you're looking for guidance or providing it—MentalSathi
            meets you where you are with professional tools and compassionate
            care.
          </p>
        </div>

        {/* Audience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {targetAudience.map((item, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`group relative flex flex-col transition-all duration-1000 ease-out ${
                visibleItems.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-16"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Image Container */}
              <div className="relative h-72 w-full overflow-hidden rounded-3xl mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500 bg-slate-100">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  priority={index === 0} // Optional: Prioritize the first image
                />
                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-grow">
                <span className="text-blue-600 text-xs font-black uppercase tracking-wider mb-2">
                  {item.badge}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-[15px]">
                  {item.description}
                </p>
              </div>

              {/* Decorative line on hover */}
              <div className="mt-6 h-1 w-0 bg-blue-600 transition-all duration-300 group-hover:w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
