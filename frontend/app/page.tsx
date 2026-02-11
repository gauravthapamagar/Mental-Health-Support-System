"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

// Your existing icons and components
import ThinkIcon from "@/public/icons/thinkmain.svg";
import PlusIcon from "@/public/icons/plus.svg";
import HealthIcon from "@/public/icons/health.svg";
import OurMission from "@/components/landingpage/OurMission";
import WhyUs from "@/components/landingpage/WhyUs";
import TherapistsSection from "@/components/landingpage/TherapistSection";
import Header from "@/components/Header";
import WhoIsItFor from "@/components/landingpage/WhoisFor";
import AudienceSection from "@/components/landingpage/Options";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  // ✅ FIXED: Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "patient") {
        router.replace("/patient");
      } else if (user.role === "therapist") {
        router.replace("/therapist/dashboard");
      } else if (user.role === "admin") {
        router.replace("/admin");
      }
    }
  }, [user, isAuthenticated, loading, router]);

  // --- LOADING STATE (Prevents flickering) ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Show loading state while redirect is in progress
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const scrollToSection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // --- YOUR EXISTING LANDING PAGE CONTENT ---
  return (
    <div>
      <main>
        <Header />
        <section className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 overflow-hidden">
          {/* Animated Mental Health Shapes - Hidden on Mobile for Performance */}
          <div className="absolute inset-0 pointer-events-none hidden sm:block">
            <div className="absolute top-20 left-5 sm:top-25 sm:left-10 animate-float-slow">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                className="text-blue-300/40 sm:w-16 sm:h-16"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <div className="absolute top-24 right-5 sm:top-32 sm:right-20 animate-float-slow w-10 h-10 sm:w-16 sm:h-16">
              <ThinkIcon className="w-full h-full text-blue-400/30" />
            </div>

            <div className="absolute bottom-40 left-5 sm:bottom-32 sm:left-20 animate-float-slow w-8 h-8 sm:w-13 sm:h-13">
              <PlusIcon className="w-full h-full text-blue-300/35" />
            </div>

            <div className="absolute top-1/2 right-10 sm:right-40 w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-blue-300/30 animate-pulse-medium"></div>

            <div className="absolute bottom-40 right-1/3 sm:bottom-32 sm:right-1/2 animate-float-slow w-16 h-12 sm:w-25 sm:h-15">
              <HealthIcon className="w-full h-full text-blue-300/25" />
            </div>

            <div className="absolute top-1/3 left-1/4 animate-float-fast">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                className="text-blue-200/40 sm:w-10 sm:h-10"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <div className="absolute top-32 left-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-blue-300/25 animate-spin-very-slow"></div>

            <div className="absolute bottom-16 left-1/4 sm:bottom-20 sm:left-1/3 w-14 h-14 sm:w-20 sm:h-20 rounded-lg border-4 border-blue-200/30 animate-pulse-slow"></div>
          </div>

          {/* Background Image on Right - Hidden on Mobile */}
          <div className="absolute right-0 top-0 w-full h-full sm:w-1/2 flex items-center justify-end pointer-events-none hidden sm:flex">
            <div className="relative w-full h-full">
              <Image
                src="/images/home/bannerleft-01.png"
                alt="Mental Health Banner"
                fill
                className="object-contain object-right"
                priority
              />
            </div>
          </div>

          {/* Content Container */}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 min-h-screen flex flex-col justify-center">
            <div className="max-w-2xl">
              {/* Purpose Badge - Responsive */}
              <div className="inline-block mb-3 sm:mb-4 lg:mb-6">
                <span className="px-2.5 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs sm:text-sm lg:text-base font-medium text-gray-700 border border-gray-200">
                  OUR PURPOSE
                </span>
              </div>

              {/* Main Heading - Highly Responsive */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-5 lg:mb-6 leading-tight tracking-tight">
                Join CarePair &<br />
                Shape The<br />
                Future of Health
              </h1>

              {/* CTA Buttons - Responsive Layout */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 lg:mb-12 w-full sm:w-auto">
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-blue-600 text-white font-semibold text-sm sm:text-base lg:text-lg rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-center"
                >
                  Get Matched
                </Link>
                <button
                  onClick={(e) => scrollToSection("how-it-works", e)}
                  className="w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-white/80 backdrop-blur-sm text-gray-900 font-semibold text-sm sm:text-base lg:text-lg rounded-lg hover:bg-white transition-all shadow-md hover:shadow-lg border border-gray-200 cursor-pointer text-center"
                >
                  Learn how it works
                </button>
              </div>

              {/* Scroll Down Button - Responsive */}
              <button 
                onClick={(e) => scrollToSection("mission", e)}
                className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-medium">Scroll Down</span>
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:translate-y-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <style jsx>{`
          @keyframes float-slow {
            0%,
            100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(5deg);
            }
          }
          @keyframes float-medium {
            0%,
            100% {
              transform: translateY(0px) translateX(0px);
            }
            50% {
              transform: translateY(-15px) translateX(10px);
            }
          }
          @keyframes float-fast {
            0%,
            100% {
              transform: translateY(0px) scale(1);
            }
            50% {
              transform: translateY(-25px) scale(1.1);
            }
          }
          @keyframes pulse-slow {
            0%,
            100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.1);
            }
          }
          @keyframes spin-very-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }
          .animate-float-medium {
            animation: float-medium 5s ease-in-out infinite;
          }
          .animate-float-fast {
            animation: float-fast 4s ease-in-out infinite;
          }
          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }
          .animate-spin-very-slow {
            animation: spin-very-slow 20s linear infinite;
          }
        `}</style>

        <div id="mission">
          <OurMission />
        </div>
        <AudienceSection />
        <div id="how-it-works">
          <WhoIsItFor />
        </div>
        <TherapistsSection />
        <WhyUs />
        <Footer />
      </main>
    </div>
  );
}