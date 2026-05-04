import React from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  BookOpen,
  MessageSquare,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      title: "My Appointments",
      description: "View appointments",
      icon: Calendar,
      href: "/therapist/appointments",
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "My Patients",
      description: "View all clients",
      icon: Users,
      href: "/therapist/my-patients",
      gradient: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "Write Blog",
      description: "Share insights",
      icon: BookOpen,
      href: "/therapist/my-blogs",
      gradient: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
    },
   
    
    {
      title: "Settings",
      description: "Manage profile",
      icon: Settings,
      href: "/therapist/profile",
      gradient: "from-slate-500 to-slate-600",
      bgColor: "bg-slate-50",
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Quick Actions
            </h2>
            <p className="text-gray-600 text-sm mt-1">Navigate your practice with ease</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center mx-auto max-w-5xl">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group relative flex flex-col items-center p-5 rounded-2xl border-2 border-transparent hover:border-white transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 ${action.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <div className="relative z-10 flex flex-col items-center w-full">
                {/* Icon container */}
                <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${action.gradient} text-white mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-2xl`}>
                  <action.icon className="w-7 h-7" strokeWidth={2.5} />
                  
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-2xl bg-white/30 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                </div>
                
                {/* Text content */}
                <div className="text-center">
                  <h3 className="text-sm font-bold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                    {action.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${action.gradient} rounded-full group-hover:w-12 transition-all duration-300`}></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;