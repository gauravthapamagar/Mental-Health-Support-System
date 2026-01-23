"use client";

import React, { useEffect, useRef, useState } from "react";
import { User, Stethoscope, ShieldCheck, Brain } from "lucide-react";

const userJourneys = [
  {
    icon: User,
    category: "For Patients",
    title: "Your Wellness Journey",
    description:
      "From personalized assessments and AI-guided support to connecting with licensed therapists—track your progress and access tools designed for your mental health.",
    features: [
      "Complete initial mental health assessment",
      "Chat with AI assistant for immediate support",
      "Search and book sessions with therapists",
      "Access recommended articles and quizzes",
      "Write and track your personal journal",
    ],
    color: "blue",
    badge: "User",
  },
  {
    icon: Stethoscope,
    category: "For Therapists",
    title: "Professional Practice Tools",
    description:
      "Expand your reach, manage appointments seamlessly, and leverage AI validation to ensure quality care—all while maintaining full control of your practice.",
    features: [
      "Manage availability and booking calendar",
      "Conduct secure therapy sessions",
      "Create and manage blog articles",
      "Review and validate AI-generated content",
      "View patient history and session notes",
    ],
    color: "emerald",
    badge: "Therapist",
  },
  {
    icon: ShieldCheck,
    category: "Platform Admin",
    title: "Quality & Compliance",
    description:
      "Oversee platform integrity with comprehensive admin tools—approve therapists, moderate content, and ensure compliance across all user interactions.",
    features: [
      "Approve and validate new therapists",
      "Manage user accounts and access",
      "Moderate therapist-generated content",
      "Review compliance and safety reports",
      "Oversee blogs, quizzes, and appointments",
    ],
    color: "violet",
    badge: "Admin",
  },
  {
    icon: Brain,
    category: "AI Component",
    title: "Intelligent Support",
    description:
      "Our AI enhances the platform by providing personalized recommendations, generating insights, and supporting both patients and therapists throughout their journey.",
    features: [
      "Suggest optimal user-therapist matches",
      "Generate quiz questions and flashcards",
      "Recommend relevant mental health articles",
      "Provide session summaries and insights",
      "Respond to user queries 24/7",
    ],
    color: "amber",
    badge: "AI-Powered",
  },
];

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    hover: "group-hover:bg-blue-600",
    border: "border-blue-200",
    gradient: "from-blue-500/10 to-blue-600/10",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    hover: "group-hover:bg-emerald-600",
    border: "border-emerald-200",
    gradient: "from-emerald-500/10 to-emerald-600/10",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    hover: "group-hover:bg-violet-600",
    border: "border-violet-200",
    gradient: "from-violet-500/10 to-violet-600/10",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    hover: "group-hover:bg-amber-600",
    border: "border-amber-200",
    gradient: "from-amber-500/10 to-amber-600/10",
  },
};

export default function UserJourneys() {
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
          threshold: 0.15,
          rootMargin: "0px 0px -50px 0px",
        },
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest">
            Platform Overview
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            How CarePair Works
          </h2>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A comprehensive mental health platform connecting patients,
            therapists, and AI-powered tools in one seamless experience.
          </p>
        </div>

        {/* Journey Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {userJourneys.map((journey, index) => {
            const Icon = journey.icon;
            const colors = colorClasses[journey.color];

            return (
              <div
                key={index}
                ref={(el) => (itemRefs.current[index] = el)}
                className={`group relative transition-all duration-1000 ease-out ${
                  visibleItems.includes(index)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-16"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className={`relative bg-white rounded-2xl p-8 shadow-sm border ${colors.border} hover:shadow-xl transition-all duration-500`}
                >
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`p-3 rounded-xl ${colors.bg} ${colors.hover} transition-colors duration-300`}
                    >
                      <Icon
                        className={`w-6 h-6 ${colors.text} group-hover:text-white transition-colors duration-300`}
                      />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-xs font-bold uppercase tracking-wider`}
                    >
                      {journey.badge}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <p
                      className={`${colors.text} text-xs font-black uppercase tracking-wider mb-2`}
                    >
                      {journey.category}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      {journey.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-[15px]">
                      {journey.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5">
                    {journey.features.map((feature, fIndex) => (
                      <div
                        key={fIndex}
                        className="flex items-start gap-3 text-sm text-slate-700"
                      >
                        <div
                          className={`mt-1 w-1.5 h-1.5 rounded-full ${colors.bg} ${colors.text} flex-shrink-0`}
                        />
                        <span className="leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Decorative gradient */}
                  <div
                    className={`absolute -bottom-px left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">
            Ready to start your journey with CarePair?
          </p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
}
