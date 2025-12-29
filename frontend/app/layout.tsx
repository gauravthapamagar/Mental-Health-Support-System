// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext"; // Import the provider
import "./globals.css";

// Fonts
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
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

export const metadata: Metadata = {
  title: "MentalSathi",
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
        className={`${manrope.variable} antialiased`}
      >
        {/* Wrap children here */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
