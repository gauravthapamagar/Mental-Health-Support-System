"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import {
  User,
  ClipboardCheck,
  Users,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";

type UserRole = "patient" | "therapist" | null;

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const userRole: UserRole = user?.role ?? null;

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine home/dashboard link
  const getHomeHref = () => {
    if (!isAuthenticated) return "/";
    if (userRole === "patient") return "/patient/dashboard";
    if (userRole === "therapist") return "/therapist/dashboard";
    return "/";
  };

  const homeHref = getHomeHref();

  const getProfileHref = () => {
    if (userRole === "therapist") return "/therapist/profile";
    if (userRole === "patient") return "/patient/profile";
    return "/auth/login";
  };

  const profileHref = getProfileHref();

  // Middle nav links based on role
  const getMiddleLinks = () => {
    const base = [
      { label: "Home", href: homeHref },
      { label: "How it works", href: "/how-it-works" },
      { label: "Blog", href: "/blog" },
    ];

    if (isAuthenticated) {
      if (userRole === "patient") {
        return [
          ...base,
          { label: "Find a therapist", href: "/find-therapist" },
          { label: "Support", href: "/support" },
        ];
      }

      if (userRole === "therapist") {
        return [
          ...base,
          { label: "Appointments", href: "/appointments" },
          { label: "Support", href: "/support" },
        ];
      }
    }

    return [...base, { label: "Support", href: "/support" }];
  };

  const navLinks = getMiddleLinks();

  const linkClassName = `
    relative text-gray-700 font-medium py-2
    after:absolute after:left-0 after:-bottom-1
    after:h-[2px] after:w-full
    after:bg-blue-600
    after:scale-x-0
    after:origin-center
    after:transition-transform after:duration-150
    hover:after:scale-x-100
  `;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/70 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href={homeHref}
            className="flex items-center space-x-2 shrink-0"
          >
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
            <span className="text-xl font-semibold text-gray-900">
              CarePair
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href} className={linkClassName}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/auth/login" className={linkClassName}>
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition-all"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 md:gap-5">
                {/* Patient / Therapist Button */}
                {userRole === "patient" && (
                  <Link
                    href="/patient/assessment"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Take Assessment</span>
                  </Link>
                )}
                {userRole === "therapist" && (
                  <Link
                    href="/my-patients"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    <Users className="w-4 h-4" />
                    <span>My Patients</span>
                  </Link>
                )}

                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-1 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-transparent group-hover:border-blue-600 transition-all flex items-center justify-center text-blue-700 shadow-sm">
                      <User className="w-6 h-6" />
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 origin-top-right">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400 font-medium">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user?.full_name || user?.email}
                        </p>
                      </div>
                      <Link
                        href={profileHref}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-gray-50"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100 flex flex-col space-y-4 bg-white rounded-b-2xl shadow-xl px-4 animate-in slide-in-from-top-2">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-semibold py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {!isAuthenticated ? (
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                <Link
                  href="/auth/login"
                  className="w-full py-3 text-center font-bold text-gray-700 bg-gray-50 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="w-full py-3 text-center font-bold text-white bg-blue-600 rounded-xl"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <Link
                  href={profileHref}
                  className="flex items-center gap-3 font-bold text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User /> Profile
                </Link>

                {userRole === "patient" && (
                  <Link href="/assessment" className="text-blue-600 font-bold">
                    Take Assessment
                  </Link>
                )}
                {userRole === "therapist" && (
                  <Link href="/my-patients" className="text-blue-600 font-bold">
                    My Patients
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-3 font-bold text-red-600 text-left"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
