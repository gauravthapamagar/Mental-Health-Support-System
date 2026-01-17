import QuizCard from "@/components/patient/quizzes/QuizCard";
import { Brain, Heart, Smile, Moon } from "lucide-react";

export default function QuizzesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mental Health Quizzes</h1>
        <p className="text-gray-600">Track your progress and gain insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuizCard
          id="gad-7"
          title="Anxiety Assessment"
          description="GAD-7 Scale"
          questions={7}
          icon={Brain}
          iconColor="text-blue-600"
          lastTaken="Dec 15, 2025"
          lastScore="Mild Anxiety"
        />

        <QuizCard
          id="phq-9"
          title="Depression Screening"
          description="PHQ-9 Scale"
          questions={9}
          icon={Heart}
          iconColor="text-purple-600"
          recommendedBy="Dr. Sarah Johnson"
        />

        <QuizCard
          id="stress"
          title="Stress Level Check"
          description="PSS Scale"
          questions={10}
          icon={Smile}
          iconColor="text-green-600"
        />

        <QuizCard
          id="sleep"
          title="Sleep Quality Assessment"
          description="Pittsburgh Sleep Quality Index"
          questions={19}
          icon={Moon}
          iconColor="text-indigo-600"
        />
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Your Progress</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Quizzes Completed</span>
            <span className="font-bold text-2xl">12</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Average Score Improvement</span>
            <span className="font-bold text-2xl text-green-600">+15%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
