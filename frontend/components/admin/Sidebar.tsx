"use client";
import {
  BarChart3,
  Users,
  UserCheck,
  FileText,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: <BarChart3 size={20} />, label: "Overview", href: "/admin" },
    { icon: <Users size={20} />, label: "Users", href: "/admin/users" },
    {
      icon: <UserCheck size={20} />,
      label: "Verification",
      href: "/admin/therapists",
    },
    { icon: <FileText size={20} />, label: "Blogs", href: "/admin/blogs" },
    {
      icon: <ClipboardList size={20} />,
      label: "Surveys",
      href: "/admin/surveys",
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
      <div className="p-6 border-b border-gray-200 flex items-center space-x-2">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
          +
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">CarePair</h1>
          <p className="text-xs text-gray-500">Admin Dashboard</p>
        </div>
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
              pathname === item.href
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
