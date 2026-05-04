import ProgressDashboard from "@/components/patient/ProgressDashboard";

export const metadata = {
  title: "Your Progress | Mental Health Platform",
  description: "Track your mental health journey and see your progress over time",
};

export default function ProgressPage() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
            <p className="text-gray-600 mt-2">
              Track your mental health journey and see how you're improving over time
            </p>
          </div>
          <ProgressDashboard />
        </div>
      </main>
    </>
  );
}
