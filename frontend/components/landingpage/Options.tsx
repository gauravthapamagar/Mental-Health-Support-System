import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

const careOptions = [
  {
    title: "Psychiatry",
    desc: "The right prescription medication for you.",
    color: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    title: "Therapy",
    desc: "Care proven to help with life's challenges.",
    color: "bg-orange-100",
    textColor: "text-orange-700",
  },
  {
    title: "Psychiatry + Therapy",
    desc: "Prescription medication and therapy support.",
    color: "bg-teal-100",
    textColor: "text-teal-700",
    tag: "Most Common",
  },
  {
    title: "Teen Care",
    desc: "Therapy for teens, with medication if appropriate.",
    color: "bg-green-100",
    textColor: "text-green-700",
    tag: "Ages 13+",
  },
];

export default function CareOptions() {
  const [visibleCards, setVisibleCards] = useState([]);
  const [ctaVisible, setCtaVisible] = useState(false);
  const cardRefs = useRef([]);
  const ctaRef = useRef(null);

  useEffect(() => {
    const observers = [];

    // Observe cards
    cardRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: "0px 0px -50px 0px",
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    // Observe CTA
    if (ctaRef.current) {
      const ctaObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCtaVisible(true);
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: "0px 0px -50px 0px",
        }
      );

      ctaObserver.observe(ctaRef.current);
      observers.push(ctaObserver);
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <section className="py-24 bg-slate-100/100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">
            Our Care Options
          </p>
          <h2 className="text-4xl font-bold text-slate-900">
            Affordable help, with or without insurance
          </h2>
          <p className="mt-4 text-slate-500">
            Get started with a free assessment, and we'll match you with a
            personalized plan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {careOptions.map((option, idx) => (
            <div
              key={idx}
              ref={(el) => (cardRefs.current[idx] = el)}
              className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-700 flex flex-col border border-slate-100 ${
                visibleCards.includes(idx)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div
                className={`${option.color} p-8 flex flex-col h-44 relative`}
              >
                {option.tag && (
                  <span className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter text-slate-600">
                    {option.tag}
                  </span>
                )}
                <div
                  className={`w-8 h-8 rounded-full border-2 border-current ${option.textColor} mb-auto opacity-40`}
                />
                <h3 className={`text-2xl font-bold ${option.textColor}`}>
                  {option.title}
                </h3>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <p className="text-slate-500 mb-6">{option.desc}</p>
                <button className="mt-auto text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Area */}
        <div
          ref={ctaRef}
          className={`flex flex-col items-center transition-all duration-700 ${
            ctaVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-black px-10 py-5 rounded-2xl shadow-lg shadow-teal-200 transition-all uppercase tracking-widest mb-8 active:scale-95">
            Start with a free assessment
          </button>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {[
              "Appointments in as little as 2 days",
              "Medicare and Medicaid accepted",
              "Free assessment and recommendation",
            ].map((text, idx) => (
              <div
                key={text}
                className={`flex items-center gap-2 text-sm font-semibold text-slate-600 transition-all duration-500`}
                style={{
                  transitionDelay: ctaVisible ? `${idx * 100 + 200}ms` : "0ms",
                  opacity: ctaVisible ? 1 : 0,
                  transform: ctaVisible ? "translateY(0)" : "translateY(12px)",
                }}
              >
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
