import StatsGrid from "@/components/patient/dashboard/StatsGrid";
import UpcomingSessions from "@/components/patient/dashboard/UpcomingSessions";
import CarePlan from "@/components/patient/dashboard/CarePlan";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Good morning, Sugam</h1>
        <p className="text-gray-600">
          Here is what is happening with your health today.
        </p>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <UpcomingSessions />
        </div>
        <div>
          <CarePlan />
        </div>
      </div>
    </div>
  );
}
