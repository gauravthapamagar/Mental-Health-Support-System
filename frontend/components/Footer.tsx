"use client";
import React from "react";
import Link from "next/link";
import { Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#e0e9f5] pt-16 pb-8 text-slate-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & Socials */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
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
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                CarePair
              </span>
            </Link>

            <div className="flex gap-4">
              <Link
                href="#"
                className="text-pink-500 hover:opacity-80 transition-opacity"
              >
                <Instagram className="w-6 h-6" />
              </Link>
              <Link
                href="#"
                className="text-sky-500 hover:opacity-80 transition-opacity"
              >
                <Twitter className="w-6 h-6" />
              </Link>
              <Link
                href="#"
                className="text-blue-600 hover:opacity-80 transition-opacity"
              >
                <Linkedin className="w-6 h-6" />
              </Link>
            </div>

            <p className="text-slate-500 max-w-xs leading-relaxed">
              Your partner in mental wellness. Connecting you with compassionate
              care.
            </p>
          </div>

          {/* QUICK Links */}
          <div>
            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-sm mb-6">
              Quick Links
            </h4>
            <ul className="space-y-4 font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-600 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-blue-600 transition-colors"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="/find-therapist"
                  className="hover:text-blue-600 transition-colors"
                >
                  Find a Therapist
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="hover:text-blue-600 transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn & Grow */}
          <div>
            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-sm mb-6">
              Learn & Grow
            </h4>
            <ul className="space-y-4 font-medium">
              <li>
                <Link
                  href="/blogs"
                  className="hover:text-blue-600 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Webinars
                </Link>
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  New
                </span>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Case Studies
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-sm mb-6">
              Company
            </h4>
            <ul className="space-y-4 font-medium">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Careers
                </Link>
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Hiring
                </span>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Partners
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">
            © {currentYear} CarePair. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <Link
              href="/privacy"
              className="hover:text-slate-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-900 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="hover:text-slate-900 transition-colors"
            >
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
