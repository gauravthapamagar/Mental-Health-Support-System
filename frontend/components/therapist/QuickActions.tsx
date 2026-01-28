import React from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  BookOpen,
  MessageSquare,
  FileText,
  Settings,
} from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      title: "My Patients",
      description: "View all patients",
      icon: Users,
      href: "/therapist/my-patients",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Write Blog",
      description: "Share insights",
      icon: BookOpen,
      href: "/therapist/my-blogs",
      color: "bg-green-500 hover:bg-green-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="group flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <div
              className={`p-3 rounded-xl ${action.color} text-white mb-3 group-hover:scale-110 transition-transform`}
            >
              <action.icon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 text-center mb-1">
              {action.title}
            </h3>
            <p className="text-xs text-gray-500 text-center">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
