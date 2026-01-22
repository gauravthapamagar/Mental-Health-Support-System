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
      title: "Schedule Appointment",
      description: "Add new session",
      icon: Calendar,
      href: "/therapist/appointments/new",
      color: "bg-blue-500 hover:bg-blue-600",
    },
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
    {
      title: "Messages",
      description: "Chat with patients",
      icon: MessageSquare,
      href: "/therapist/messages",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Reports",
      description: "View analytics",
      icon: FileText,
      href: "/therapist/reports",
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      title: "Settings",
      description: "Manage profile",
      icon: Settings,
      href: "/therapist/profile",
      color: "bg-indigo-500 hover:bg-indigo-600",
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
