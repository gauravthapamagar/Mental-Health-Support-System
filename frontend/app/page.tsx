"use client";
import Image from "next/image";
import Link from "next/link";
import ThinkIcon from "@/public/icons/thinkmain.svg";
import PlusIcon from "@/public/icons/plus.svg";
import HealthIcon from "@/public/icons/health.svg";
import OurMission from "@/components/landingpage/OurMission";
import WhyUs from "@/components/landingpage/WhyUs";
import TherapistsSection from "@/components/landingpage/TherapistSection";
import Header from "@/components/Header";
import WhoIsItFor from "@/components/landingpage/WhoisFor";
import AudienceSection from "@/components/landingpage/Options";

export default function Home() {
  return (
    <div>
      <main>
        <Header />
        <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 overflow-hidden">
          {/* Animated Mental Health Shapes */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Heart Shape - Top Left */}
            <div className="absolute top-25 left-10 animate-float-slow">
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                className="text-blue-300/40"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Brain Icon - Top Right */}
            <div className="absolute top-32 right-20 animate-float-slow w-16 h-16">
              <ThinkIcon className="w-full h-full text-blue-400/30" />
            </div>
            {/* Lotus/Meditation Icon - Bottom Left */}
            <div className="absolute bottom-32 left-20 animate-float-slow w-13 h-13">
              <PlusIcon className="w-full h-full text-blue-300/35" />
            </div>
            {/* Circle - Middle Right */}
            <div className="absolute top-1/2 right-40 w-16 h-16 rounded-full bg-blue-300/30 animate-pulse-medium"></div>

            {/* Wave Pattern - Top
            <div className="absolute bottom-32 right-1/2 animate-float-slow w-30 h-20">
              <WaveIcon className="w-full h-full text-blue-300/25" />
            </div> */}
            {/* Peace/Calm Hand Icon - Bottom Right */}
            <div className="absolute bottom-32 right-1/2 animate-float-slow w-25 h-15">
              <HealthIcon className="w-full h-full text-blue-300/25" />
            </div>
            {/* Small Heart - Middle Left */}
            <div className="absolute top-1/3 left-1/4 animate-float-fast">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                className="text-blue-200/40"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Square with Rounded Corners - Top Center */}
            <div className="absolute top-40 left-1/2 w-12 h-12 rounded-lg bg-blue-300/25 animate-spin-very-slow"></div>

            {/* Ring/Circle Outline - Bottom Center */}
            <div className="absolute bottom-20 left-1/3 w-20 h-20 rounded-lg border-4 border-blue-200/30 animate-pulse-slow"></div>
          </div>

          {/* Background Image on Right */}
          <div className="absolute right-10 top-5 w-1/2 h-full flex items-center justify-end pointer-events-none">
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
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 min-h-screen flex flex-col justify-center">
            <div className="max-w-2xl">
              {/* Tag */}
              <div className="inline-block mb-6">
                <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                  OUR PURPOSE
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-base md:text-xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Join MentalSathi &<br />
                Shape The
                <br />
                Future of Health
              </h1>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link
                  href="/get-matched"
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Matched
                </Link>
                <Link
                  href="/how-it-works"
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-900 font-semibold rounded-lg hover:bg-white transition-all shadow-md hover:shadow-lg border border-gray-200"
                >
                  Learn how it works
                </Link>
              </div>

              {/* Scroll Down */}
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group">
                <span className="text-sm font-medium">Scroll Down</span>
                <svg
                  className="w-5 h-5 group-hover:translate-y-1 transition-transform"
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

        {/* Add Custom CSS for Animations */}
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
        <OurMission />
        <AudienceSection />
        <WhoIsItFor />
        <TherapistsSection />
        <WhyUs />
      </main>
    </div>
  );
}
