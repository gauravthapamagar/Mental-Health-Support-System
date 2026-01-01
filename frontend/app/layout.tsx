// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

// Metadata
export const metadata: Metadata = {
  title: {
    default: "MentalSathi",
    template: "%s | MentalSathi",
  },
  description: "Smart Mental Health Support Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${manrope.variable}
          antialiased
        `}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
