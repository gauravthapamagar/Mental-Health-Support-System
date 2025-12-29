import { useEffect, useRef, useState } from "react";
import { Activity, TrendingUp, Stethoscope, Check } from "lucide-react";

export default function AIFeaturesSection() {
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
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const features = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Smart Health Metrics",
      description:
        "Wake up to actionable health summaries, personalized based on your sleep, mood, movement, and input.",
      image: "/images/home/match.png",
      points: [
        "Personalized specs every morning",
        "Trend detection across time",
        "Custom action plans",
      ],
      color: "blue",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Habit-Based Recommendation",
      description:
        "No clunky setup—connect your favorite devices or just type how you feel. AddAction adapts either way.",
      image: "/images/home/companion.png",
      points: [
        "Syncs with Apple Health & Fitbit",
        "Tracks mood, energy, and stress",
        "Supports manual or automatic data",
      ],
      color: "purple",
    },
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: "AI Symptom Checker",
      description:
        "From breathing guides to burnout prevention, AddAction helps you build mental resilience.",
      image: "/images/home/insights.png",
      points: [
        "On-demand mindfulness tools",
        "Guided stress check-ins",
        "AI-powered emotional tracking",
      ],
      color: "teal",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600",
      teal: "from-teal-500 to-teal-600",
    };
    return colors[color];
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4">
            Our Mission
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            AI That Understands You, Not Just Your Data
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            We go beyond step counters and calorie logs. AddAction offers
            context-aware health coaching, habit support, and real-time insights
            — like a wellness team in your pocket.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-12 transition-all duration-700 ${
                visibleItems.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-16"
              }`}
            >
              {/* Image Side */}
              <div
                className={`w-full lg:w-[52%] transition-all duration-700 delay-200 ${
                  visibleItems.includes(index)
                    ? "opacity-100 translate-x-0"
                    : index % 2 === 0
                    ? "opacity-0 -translate-x-12"
                    : "opacity-0 translate-x-12"
                }`}
              >
                <div className="relative group">
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(
                      feature.color
                    )} rounded-3xl blur-3xl opacity-15 group-hover:opacity-25 transition-opacity duration-500 scale-95`}
                  ></div>

                  {/* Image Container */}
                  <div className="relative flex items-center justify-center">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-auto relative z-10 rounded-2xl drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div
                className={`w-full lg:w-1/2 transition-all duration-700 delay-300 ${
                  visibleItems.includes(index)
                    ? "opacity-100 translate-x-0"
                    : index % 2 === 0
                    ? "opacity-0 translate-x-12"
                    : "opacity-0 -translate-x-12"
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${getColorClasses(
                    feature.color
                  )} rounded-2xl shadow-lg mb-6`}
                >
                  <span className="text-white">{feature.icon}</span>
                </div>

                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  {feature.title}
                </h3>

                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="space-y-3">
                  {feature.points.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 bg-gradient-to-br ${getColorClasses(
                          feature.color
                        )} rounded-full flex items-center justify-center mt-0.5`}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
