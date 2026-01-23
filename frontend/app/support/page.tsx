"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  Minus,
  Mail,
  Phone,
  MessageCircle,
  HelpCircle,
  Book,
  FileText,
  Video,
} from "lucide-react";

// Dynamically import Header and Footer with no SSR to prevent hydration errors
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

export default function SupportPage() {
  const [mounted, setMounted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for contacting us! We will get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const faqs = [
    {
      question: "How do I book an appointment with a therapist?",
      answer:
        "To book an appointment, first browse our verified therapists on the home page. Click on a therapist's profile to view their availability, specialties, and fees. Then select a convenient time slot and confirm your booking. You'll receive a confirmation email with session details.",
    },
    {
      question: "Are the therapists on CarePair verified professionals?",
      answer:
        "Yes, all therapists on CarePair undergo a rigorous verification process. We verify their licenses, credentials, years of experience, and professional certifications. Only verified therapists are allowed to accept patients and publish content on our platform.",
    },
    {
      question: "Can I cancel or reschedule my appointment?",
      answer:
        "Yes, you can cancel or reschedule appointments up to 24 hours before the scheduled time without any charges. To do this, go to your dashboard, find the appointment, and select the reschedule or cancel option. Cancellations within 24 hours may incur a fee.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Absolutely. CarePair takes privacy and security very seriously. All personal and health information is encrypted and stored securely. We comply with healthcare data protection regulations and never share your information with third parties without your explicit consent.",
    },
    {
      question: "How do online therapy sessions work?",
      answer:
        "Online sessions are conducted via secure video calls through our platform. At your scheduled time, log into your account and click 'Join Session' on your dashboard. Make sure you have a stable internet connection, a quiet private space, and your camera and microphone are working.",
    },
    {
      question: "What if I'm not satisfied with my therapist?",
      answer:
        "We want you to have the best experience possible. If you're not satisfied with your therapist, you can switch to another one at any time. Simply browse other therapists on our platform and book with someone new. Your mental health journey is unique, and finding the right fit is important.",
    },
    {
      question: "Do you offer emergency mental health services?",
      answer:
        "CarePair is designed for scheduled therapy sessions and is not an emergency service. If you're experiencing a mental health crisis, please contact your local emergency services, crisis hotline, or visit the nearest emergency room immediately.",
    },
  ];

  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@carepair.com",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Talk to our support team",
      contact: "+977 9812345678",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us in real-time",
      contact: "Available 9 AM - 6 PM",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const resources = [
    {
      icon: Book,
      title: "User Guide",
      description: "Step-by-step guide to using CarePair",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch tutorials on platform features",
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Detailed platform documentation",
    },
    {
      icon: HelpCircle,
      title: "Community Forum",
      description: "Ask questions and share experiences",
    },
  ];

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50"
      suppressHydrationWarning
    >
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-30"></div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            HELP CENTER
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            How Can We Help You?
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support
            team
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search for help articles, FAQs, guides..."
              className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none text-slate-700 shadow-sm"
            />
            <HelpCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-slate-600">
            Choose your preferred way to reach us
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {supportOptions.map((option, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition"
            >
              <div
                className={`w-14 h-14 ${option.bgColor} rounded-xl flex items-center justify-center mb-6`}
              >
                <option.icon className={`w-7 h-7 ${option.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {option.title}
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                {option.description}
              </p>
              <p className={`font-semibold ${option.iconColor}`}>
                {option.contact}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600">
              Quick answers to common questions about CarePair
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-100 transition"
                >
                  <span className="font-semibold text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  {openFAQ === index ? (
                    <Minus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-5">
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Helpful Resources
          </h2>
          <p className="text-slate-600">
            Explore guides and tutorials to make the most of CarePair
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition cursor-pointer group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                <resource.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">
                {resource.title}
              </h3>
              <p className="text-sm text-slate-600">{resource.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-blue-100">
              Send us a message and we'll get back to you within 24 hours
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none"
                placeholder="What do you need help with?"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none resize-none"
                placeholder="Describe your issue or question in detail..."
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg"
            >
              Send Message
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
