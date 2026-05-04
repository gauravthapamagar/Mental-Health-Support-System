import { HelpCircle, MessageCircle, FileText, Phone } from "lucide-react";

export default function SupportPage() {
  const supportOptions = [
    {
      title: "Help Center",
      description: "Browse articles and guides on using CarePair.",
      icon: FileText,
      buttonText: "View Articles",
    },
    {
      title: "Live Chat",
      description: "Chat with our support team for immediate help.",
      icon: MessageCircle,
      buttonText: "Start Chat",
    },
    {
      title: "Direct Support",
      description: "Talk to a representative for complex issues.",
      icon: Phone,
      buttonText: "Call Now",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Support</h1>
        <p className="text-gray-600">How can we help you today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {supportOptions.map((option) => (
          <div
            key={option.title}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <option.icon size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
            <p className="text-gray-500 text-sm mb-6">{option.description}</p>
            <button className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors">
              {option.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
