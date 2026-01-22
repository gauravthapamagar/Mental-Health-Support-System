"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/patient/shared/Sidebar";
import { AuthProvider } from "@/context/authcontext"; //

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ✅ Check if current page is the landing page
  const isLandingPage = pathname === "/patient";

  const getPageTitle = () => {
    const pathParts = pathname.split("/").filter((part) => part !== "");
    const lastPart = pathParts[pathParts.length - 1] || "Dashboard";
    return (
      lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, " ")
    );
  };

  const pageTitle = getPageTitle();

  // ✅ Wrap the entire layout in AuthProvider so child components can use useAuth()
  return (
    <AuthProvider>
      {isLandingPage ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <div className="max-w-7xl w-full mx-auto px-6 lg:px-8">
              <header className="py-6">
                <nav className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  User Portal /{" "}
                  <span className="text-gray-600">{pageTitle}</span>
                </nav>
              </header>

              <main className="pb-10">{children}</main>
            </div>
          </div>
        </div>
      )}
    </AuthProvider>
  );
}
