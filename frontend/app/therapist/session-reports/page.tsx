import SessionReportsDashboard from "@/components/therapist/SessionReportsDashboard";
import Header from "@/components/Header";

export const metadata = {
  title: "Session Reports | Therapist Dashboard",
  description: "Track and manage patient session reports and progress notes",
};

export default function SessionReportsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <SessionReportsDashboard />
      </main>
    </>
  );
}
