"use client";

import React, { useEffect, useRef, useState } from "react";
import { Calendar, Users, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function WhyUsSection() {
  const [visibleItems, setVisibleItems] = useState([]);
  const [ctaVisible, setCtaVisible] = useState(false);

  const itemRefs = useRef([]);
  const ctaRef = useRef(null);

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Flexible Scheduling",
      description:
        "Book sessions that fit your lifestyle. Easily manage appointments and find times that work for you with our user-friendly platform.",
      color: "blue",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Licensed Therapists",
      description:
        "Connect with verified, experienced mental health professionals specializing in various areas to provide the best care for your needs.",
      color: "purple",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Safe & Confidential Space",
      description:
        "Your privacy is our top priority. All sessions and data are secured with end-to-end encryption and strictly confidential protocols.",
      color: "teal",
    },
  ];

  useEffect(() => {
    const observers = [];

    // Observe Feature Cards
    itemRefs.current.forEach((ref, index) => {
      if (!ref) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => [...new Set([...prev, index])]);
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(ref);
      observers.push(observer);
    });

    // Observe CTA Card
    if (ctaRef.current) {
      const ctaObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setCtaVisible(true);
        },
        { threshold: 0.2 }
      );
      ctaObserver.observe(ctaRef.current);
      observers.push(ctaObserver);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const getColorClasses = (color) => {
    const colors = {
      blue: { icon: "text-blue-600", iconBg: "bg-blue-100" },
      purple: { icon: "text-purple-600", iconBg: "bg-purple-100" },
      teal: { icon: "text-teal-600", iconBg: "bg-teal-100" },
    };
    return colors[color];
  };

  return (
    <section className="py-24 bg-gradient-to-br from-blue-100 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Why <span className="text-blue-600">We Are</span> The Right Choice
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            For Your Mental Health Journey
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            const isVisible = visibleItems.includes(index);

            return (
              <div
                key={index}
                ref={(el) => (itemRefs.current[index] = el)}
                className={`bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-700 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div
                  className={`w-14 h-14 ${colors.iconBg} rounded-2xl flex items-center justify-center mb-5`}
                >
                  <span className={colors.icon}>{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Card */}
        <div
          ref={ctaRef}
          className={`bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-10 md:p-12 shadow-xl shadow-blue-900/20 relative overflow-hidden transition-all duration-1000 ease-in-out ${
            ctaVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-20 scale-95"
          }`}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-4 max-w-2xl">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Shape Your Future Health
                </h3>
                <p className="text-blue-100 leading-relaxed">
                  Join us to embark on a personalized journey towards better
                  mental well-being. We match you with the right support to help
                  you thrive.
                </p>
              </div>
            </div>

            <button className="flex-shrink-0 bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 group">
              Find Your Therapist
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
