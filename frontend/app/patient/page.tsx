"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import {
  Brain,
  Activity,
  Calendar,
  MessageSquare,
  Shield,
  Heart,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Clock,
  Star,
  BarChart3,
  BookOpen,
  Sparkles,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
} from "lucide-react";

export default function PatientLandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract first name from full_name
  const firstName = user?.full_name?.split(" ")[0] || "there";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  d="M12 2v20M2 12h20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-900">CarePair</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Pricing
            </a>

            {/* Notifications Icon */}
            <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-transparent group-hover:border-blue-600 transition-all flex items-center justify-center text-blue-700 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 origin-top-right z-50">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate mt-1">
                      {user?.full_name || user?.email}
                    </p>
                  </div>
                  <Link
                    href="/patient/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>

                  <Link
                    href="/patient/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top duration-300">
            <a
              href="#features"
              className="text-slate-600 hover:text-slate-900 py-2"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-600 hover:text-slate-900 py-2"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-slate-600 hover:text-slate-900 py-2"
            >
              Pricing
            </a>
            <button
              onClick={() => router.push("/patient/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold w-full"
            >
              Go to Dashboard
            </button>
            <button
              onClick={logout}
              className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all font-semibold w-full"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section - Personalized Welcome */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6 border border-blue-100">
              <Sparkles className="w-4 h-4" />
              Welcome Back, {firstName}!
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Your Mental Health Journey Starts{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Here
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Access your personalized dashboard to connect with your therapist,
              track your progress, and continue your journey toward wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/patient/dashboard")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all text-lg font-bold flex items-center justify-center gap-2 group"
              >
                Access Dashboard{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/patient/appointments")}
                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all text-lg font-bold"
              >
                Book Appointment
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-slate-600 font-medium">
                  Account Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-slate-600 font-medium">
                  HIPAA Compliant
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 relative overflow-hidden shadow-2xl border border-blue-500/20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoNHYzMGgtNHptMC0xNWg0djEwaC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

              <div className="relative text-white space-y-6">
                <h3 className="text-2xl font-bold mb-6">
                  Your Personalized Care
                </h3>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">Next Session</div>
                      <div className="text-blue-100 text-sm">
                        Schedule your appointment
                      </div>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm">
                    Connect with your matched therapist
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">Track Progress</div>
                      <div className="text-blue-100 text-sm">
                        View your wellness insights
                      </div>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm">
                    Monitor your mental health journey
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-4">
                    <Clock className="w-6 h-6 text-blue-200" />
                    <p className="text-white/90 text-sm">
                      24/7 access to your care tools
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Calendar,
              title: "Appointments",
              desc: "View & Schedule",
              route: "/patient/appointments",
              color: "blue",
              bgColor: "bg-blue-50",
              borderColor: "border-blue-100",
              hoverBorder: "hover:border-blue-300",
            },
            {
              icon: MessageSquare,
              title: "Messages",
              desc: "Chat with therapist",
              route: "/patient/messages",
              color: "indigo",
              bgColor: "bg-indigo-50",
              borderColor: "border-indigo-100",
              hoverBorder: "hover:border-indigo-300",
            },
            {
              icon: BookOpen,
              title: "Journal",
              desc: "Daily reflections",
              route: "/patient/journal",
              color: "purple",
              bgColor: "bg-purple-50",
              borderColor: "border-purple-100",
              hoverBorder: "hover:border-purple-300",
            },
            {
              icon: Activity,
              title: "Care Plan",
              desc: "Your exercises",
              route: "/patient/care-plan",
              color: "pink",
              bgColor: "bg-pink-50",
              borderColor: "border-pink-100",
              hoverBorder: "hover:border-pink-300",
            },
          ].map((card, i) => (
            <div
              key={i}
              onClick={() => router.push(card.route)}
              className={`${card.bgColor} rounded-2xl p-6 shadow-sm border ${card.borderColor} ${card.hoverBorder} hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group`}
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br from-${card.color}-600 to-${card.color}-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <card.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-slate-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-6 lg:px-8 py-20 bg-slate-50/50 rounded-[3rem] my-12"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Your Wellness
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            CarePair provides comprehensive tools and support for your mental
            health journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "AI-Powered Insights",
              color: "purple",
              bgColor: "from-purple-50 to-white",
              borderColor: "border-purple-100",
              features: [
                "Real-time mood tracking",
                "Behavioral pattern analysis",
                "Personalized recommendations",
              ],
            },
            {
              icon: Users,
              title: "Expert Therapists",
              color: "blue",
              bgColor: "from-blue-50 to-white",
              borderColor: "border-blue-100",
              features: [
                "Licensed professionals",
                "94% match success rate",
                "Specialized care approaches",
              ],
            },
            {
              icon: Shield,
              title: "Secure & Private",
              color: "cyan",
              bgColor: "from-cyan-50 to-white",
              borderColor: "border-cyan-100",
              features: [
                "HIPAA compliant platform",
                "End-to-end encryption",
                "Your data is protected",
              ],
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${feature.bgColor} p-8 rounded-3xl border-2 ${feature.borderColor} hover:shadow-xl transition-all`}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-600 to-${feature.color}-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${feature.color}-600/20`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {feature.title}
              </h3>
              <ul className="space-y-3">
                {feature.features.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle
                      className={`w-5 h-5 text-${feature.color}-600 mt-0.5 flex-shrink-0`}
                    />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-6 lg:px-8 py-20"
      >
        <h2 className="text-4xl lg:text-5xl font-bold text-center text-slate-900 mb-4">
          Getting Started is Easy
        </h2>
        <p className="text-center text-slate-600 text-lg mb-16 max-w-2xl mx-auto">
          Your personalized wellness journey in simple steps
        </p>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              icon: MessageSquare,
              title: "Complete Profile",
              desc: "Tell us about your needs and preferences",
              color: "blue",
            },
            {
              icon: Brain,
              title: "Get Matched",
              desc: "AI finds your perfect therapist match",
              color: "indigo",
            },
            {
              icon: Calendar,
              title: "Book Session",
              desc: "Schedule at your convenience",
              color: "purple",
            },
            {
              icon: TrendingUp,
              title: "Track Progress",
              desc: "Monitor and celebrate your growth",
              color: "pink",
            },
          ].map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-white p-8 rounded-3xl shadow-md border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all h-full">
                <div
                  className={`w-14 h-14 bg-gradient-to-br from-${step.color}-600 to-${step.color}-500 text-white rounded-2xl flex items-center justify-center mb-6 text-xl font-bold shadow-lg`}
                >
                  {i + 1}
                </div>
                <step.icon
                  className={`w-12 h-12 text-${step.color}-600 mb-4`}
                />
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8">
                  <ArrowRight className="w-8 h-8 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 lg:p-16 text-center relative overflow-hidden border border-blue-500/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoNHYzMGgtNHptMC0xNWg0djEwaC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Continue Your Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Access your personalized dashboard and take the next step toward
              wellness
            </p>
            <button
              onClick={() => router.push("/patient/dashboard")}
              className="px-8 py-4 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 hover:shadow-2xl hover:-translate-y-1 transition-all text-lg font-bold inline-flex items-center gap-2 group"
            >
              Go to Dashboard{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
