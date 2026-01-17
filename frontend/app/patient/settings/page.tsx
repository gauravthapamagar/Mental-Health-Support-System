import { User, Bell, Lock, Globe } from "lucide-react";

export default function SettingsPage() {
  const sections = [
    {
      title: "Profile Information",
      icon: User,
      description: "Update your personal details and photo.",
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Manage how you receive alerts and reminders.",
    },
    {
      title: "Security",
      icon: Lock,
      description: "Change your password and enable 2FA.",
    },
    {
      title: "Preferences",
      icon: Globe,
      description: "Set your language and timezone.",
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 text-gray-500 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <section.icon size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:underline">
              Edit
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-red-50 rounded-xl border border-red-100">
        <h3 className="text-red-800 font-semibold mb-1">Danger Zone</h3>
        <p className="text-red-600 text-sm mb-4">
          Once you delete your account, there is no going back.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700">
          Delete Account
        </button>
      </div>
    </div>
  );
}
