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
  Heart,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowRight,
  Search,
} from "lucide-react";

// Dynamically import Header and Footer with no SSR to prevent hydration errors
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

export default function SupportPage() {
  const [mounted, setMounted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessModal(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setShowSuccessModal(false), 4000);
  };

  const faqs = [
    {
      question: "How do I book an appointment with a therapist?",
      answer:
        "To book an appointment, first browse our verified therapists on the home page. Click on a therapist's profile to view their availability, specialties, and fees. Then select a convenient time slot and confirm your booking. You'll receive a confirmation email with session details.",
      category: "Booking",
    },
    {
      question: "Are the therapists on CarePair verified professionals?",
      answer:
        "Yes, all therapists on CarePair undergo a rigorous verification process. We verify their licenses, credentials, years of experience, and professional certifications. Only verified therapists are allowed to accept patients and publish content on our platform.",
      category: "Trust",
    },
    {
      question: "Can I cancel or reschedule my appointment?",
      answer:
        "Yes, you can cancel or reschedule appointments up to 24 hours before the scheduled time without any charges. To do this, go to your dashboard, find the appointment, and select the reschedule or cancel option. Cancellations within 24 hours may incur a fee.",
      category: "Booking",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Absolutely. CarePair takes privacy and security very seriously. All personal and health information is encrypted and stored securely. We comply with healthcare data protection regulations and never share your information with third parties without your explicit consent.",
      category: "Security",
    },
    {
      question: "How do online therapy sessions work?",
      answer:
        "Online sessions are conducted via secure video calls through our platform. At your scheduled time, log into your account and click 'Join Session' on your dashboard. Make sure you have a stable internet connection, a quiet private space, and your camera and microphone are working.",
      category: "Sessions",
    },
    {
      question: "What if I'm not satisfied with my therapist?",
      answer:
        "We want you to have the best experience possible. If you're not satisfied with your therapist, you can switch to another one at any time. Simply browse other therapists on our platform and book with someone new. Your mental health journey is unique, and finding the right fit is important.",
      category: "Support",
    },
    {
      question: "Do you offer emergency mental health services?",
      answer:
        "CarePair is designed for scheduled therapy sessions and is not an emergency service. If you're experiencing a mental health crisis, please contact your local emergency services, crisis hotline, or visit the nearest emergency room immediately.",
      category: "Emergency",
    },
  ];

  const supportOptions = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@carepair.com",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Talk to our support team",
      contact: "+977 9812345678",
      gradient: "from-teal-500 to-emerald-500",
      bgGradient: "from-teal-50 to-emerald-50",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us in real-time",
      contact: "Available 9 AM - 6 PM",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
  ];

  const resources = [
    {
      icon: Book,
      title: "User Guide",
      description: "Step-by-step guide to using CarePair",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch tutorials on platform features",
      gradient: "from-rose-500 to-red-500",
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Detailed platform documentation",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: HelpCircle,
      title: "Community Forum",
      description: "Ask questions and share experiences",
      gradient: "from-green-500 to-teal-500",
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin mx-auto"></div>
            <Heart className="w-6 h-6 text-teal-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-slate-600 font-medium">Loading support center...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20"
      suppressHydrationWarning
    >
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-500">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-75"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-white animate-in zoom-in duration-700" />
                </div>
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">
                  Message Sent Successfully!
                </h3>
                <p className="text-slate-600">
                  We've received your message and will respond within 24 hours.
                  Check your email for updates.
                </p>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header />

      {/* Hero Section with Advanced Animation */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-300"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-2 border-teal-200 text-teal-700 px-6 py-2.5 rounded-full text-sm font-bold mb-8 animate-in slide-in-from-top duration-700 backdrop-blur-sm">
            <Heart className="w-4 h-4" />
            SUPPORT CENTER
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in slide-in-from-top duration-700 delay-100">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
              How Can We
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
              Help You Today?
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-top duration-700 delay-200">
            Find instant answers, connect with our support team, or explore our comprehensive help resources
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-3xl mx-auto relative animate-in slide-in-from-top duration-700 delay-300">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-white shadow-2xl">
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-5 pl-16 pr-16 rounded-2xl outline-none text-slate-700 placeholder:text-slate-400 bg-transparent text-lg"
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold rounded-lg">
                  {filteredFAQs.length} results
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options - Cleaner & more readable cards */}
<section className="py-20 max-w-7xl mx-auto px-6">
  <div className="text-center mb-16">
    <div className="inline-flex items-center gap-2 bg-purple-50 px-5 py-2 rounded-full text-purple-700 font-medium text-sm mb-6">
      <Sparkles className="w-5 h-5" />
      CONTACT US
    </div>
    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
      Get In Touch
    </h2>
    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
      Reach our support team through your preferred channel — we're here to help.
    </p>
  </div>

  <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
    {supportOptions.map((option, index) => (
      <div
        key={index}
        className="group relative animate-in fade-in slide-in-from-bottom duration-700"
        style={{ animationDelay: `${index * 120}ms` }}
      >
        {/* Card */}
        <div
          className={`
            relative h-full 
            bg-white rounded-2xl p-8 
            border border-gray-200 
            shadow-sm hover:shadow-xl 
            transition-all duration-400 
            group-hover:-translate-y-2
          `}
        >
          {/* Icon */}
          <div className="mb-7">
            <div
              className={`
                inline-flex items-center justify-center 
                w-16 h-16 rounded-xl 
                bg-gradient-to-br ${option.gradient} 
                text-white
                transition-transform duration-400 
                group-hover:scale-110
              `}
            >
              <option.icon className="w-8 h-8" />
            </div>
          </div>

          {/* Text content */}
          <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-gray-900">
            {option.title}
          </h3>

          <p className="text-gray-600 mb-6 leading-relaxed min-h-[3rem]">
            {option.description}
          </p>

          <div className="flex items-center gap-2">
            <div
              className={`
                font-semibold text-lg 
                bg-gradient-to-r ${option.gradient} 
                bg-clip-text text-transparent
              `}
            >
              {option.contact}
            </div>
            <ArrowRight
              className={`
                w-5 h-5 text-gray-400 
                transition-all duration-300 
                group-hover:text-indigo-600 group-hover:translate-x-1
              `}
            />
          </div>

          {/* Subtle hover overlay */}
          <div
            className={`
              absolute inset-0 rounded-2xl 
              bg-gradient-to-br ${option.gradient} 
              opacity-0 group-hover:opacity-[0.07] 
              transition-opacity duration-500 pointer-events-none
            `}
          />
        </div>
      </div>
    ))}
  </div>
</section>

      {/* FAQ Section - Enhanced Design */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-teal-100 px-4 py-2 rounded-full text-blue-700 font-semibold text-sm mb-4">
              <HelpCircle className="w-4 h-4" />
              FREQUENTLY ASKED
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Common Questions
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Quick answers to help you get the most out of CarePair
            </p>
          </div>

          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="group relative animate-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient Border on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl opacity-0 ${openFAQ === index ? 'opacity-100' : 'group-hover:opacity-100'} transition-opacity duration-300 blur-sm`}></div>
                
                {/* FAQ Card */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-white shadow-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left group-hover:bg-gradient-to-r group-hover:from-teal-50/50 group-hover:to-blue-50/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${openFAQ === index ? 'from-teal-500 to-blue-500' : 'from-slate-200 to-slate-300'} flex items-center justify-center transition-all duration-300`}>
                        <span className={`text-sm font-bold ${openFAQ === index ? 'text-white' : 'text-slate-600'}`}>
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 text-lg pr-4">
                        {faq.question}
                      </span>
                    </div>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${openFAQ === index ? 'bg-gradient-to-br from-teal-500 to-blue-500' : 'bg-slate-100'} flex items-center justify-center transition-all duration-300`}>
                      {openFAQ === index ? (
                        <Minus className="w-5 h-5 text-white" />
                      ) : (
                        <Plus className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                  </button>

                  {/* Answer with Smooth Animation */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-8 pb-6 pt-2">
                      <div className="pl-12 border-l-4 border-gradient-to-b from-teal-400 to-blue-500">
                        <p className="text-slate-600 leading-relaxed pl-4">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No results found
              </h3>
              <p className="text-slate-600">
                Try adjusting your search or browse all FAQs
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Resources Section - Card Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full text-amber-700 font-semibold text-sm mb-4">
            <Book className="w-4 h-4" />
            RESOURCES
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Helpful Resources
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore guides and tutorials to master CarePair
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="group relative animate-in slide-in-from-bottom duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Hover Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${resource.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl`}></div>
              
              {/* Card */}
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group-hover:scale-105">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${resource.gradient} blur-xl opacity-30 rounded-2xl`}></div>
                  <div className={`relative w-14 h-14 bg-gradient-to-br ${resource.gradient} rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}>
                    <resource.icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-slate-900 mb-3 text-xl">
                  {resource.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  {resource.description}
                </p>

                {/* Arrow */}
                <div className="flex items-center text-transparent bg-gradient-to-r bg-clip-text font-semibold group-hover:translate-x-2 transition-transform duration-300" style={{backgroundImage: `linear-gradient(to right, ${resource.gradient})`}}>
                  <span className={`bg-gradient-to-r ${resource.gradient} bg-clip-text`}>
                    Learn more
                  </span>
                  <ArrowRight className={`w-4 h-4 ml-2 bg-gradient-to-r ${resource.gradient} text-current`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form - Premium Design */}
      <section className="py-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-blue-600 to-purple-600">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold text-sm mb-6">
              <Send className="w-4 h-4" />
              CONTACT FORM
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Send us a message and we'll get back to you within 24 hours
            </p>
          </div>

          {/* Form Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-3xl blur-2xl"></div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-white/50">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500"></div>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 group-hover:border-slate-300"
                    placeholder="John Doe"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500"></div>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 group-hover:border-slate-300"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="mb-6 group">
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500"></div>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 group-hover:border-slate-300"
                  placeholder="What do you need help with?"
                />
              </div>

              <div className="mb-8 group">
                <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500"></div>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none resize-none transition-all duration-300 group-hover:border-slate-300"
                  placeholder="Describe your issue or question in detail..."
                />
              </div>

              <button
                type="submit"
                className="group relative w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold py-5 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-3 text-lg">
                  <Send className="w-6 h-6" />
                  Send Message
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}