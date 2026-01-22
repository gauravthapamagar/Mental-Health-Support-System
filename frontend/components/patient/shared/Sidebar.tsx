"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Calendar,
  Users,
  BookOpen,
  Brain,
  FileText,
  MessageSquare,
  Heart,
  Pill,
  ClipboardList,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
}

const mainNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    href: "/patient/dashboard",
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: Calendar,
    href: "/patient/appointments",
  },
  {
    id: "therapists",
    label: "Find Therapist",
    icon: Users,
    href: "/patient/therapists",
  },
];

const resourceNavItems: NavItem[] = [
  {
    id: "articles",
    label: "Articles",
    icon: BookOpen,
    href: "/patient/articles",
  },
  { id: "quizzes", label: "Quizzes", icon: Brain, href: "/patient/quizzes" },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: FileText,
    href: "/patient/flashcards",
  },
];

const toolsNavItems: NavItem[] = [
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    href: "/patient/messages",
  },
  { id: "journal", label: "Journal", icon: Heart, href: "/patient/journal" },
  {
    id: "medications",
    label: "Medications",
    icon: Pill,
    href: "/patient/medications",
  },
  {
    id: "care-plan",
    label: "Care Plan",
    icon: ClipboardList,
    href: "/patient/care-plan",
  },
];

const bottomNavItems: NavItem[] = [
  { id: "profile", label: "Profile", icon: User, href: "/patient/profile" },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/patient/settings",
  },
  {
    id: "support",
    label: "Support",
    icon: HelpCircle,
    href: "/patient/support",
  },
];

function NavSection({ title, items }: { title?: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="mb-6">
      {title && (
        <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <Icon
                size={20}
                className={isActive ? "text-white" : "text-gray-500"}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <Link
        href="/patient"
        className="flex items-center gap-3 p-6 border-b border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M12 2v20M2 12h20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-900">CarePair</span>
      </Link>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <NavSection items={mainNavItems} />
        <NavSection title="Resources" items={resourceNavItems} />
        <NavSection title="Tools" items={toolsNavItems} />
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 py-4 px-3">
        <NavSection items={bottomNavItems} />
      </div>
    </aside>
  );
}
