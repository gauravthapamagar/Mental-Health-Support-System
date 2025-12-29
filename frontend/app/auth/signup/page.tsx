"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Import your Auth Context
import {
  User,
  Mail,
  Lock,
  Phone,
  Briefcase,
  Heart,
  Eye,
  EyeOff,
  ArrowRight,
  Calendar,
  Award,
  BookOpen,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  GraduationCap,
  Loader2, // Added for loading state
} from "lucide-react";

export default function SignupPage() {
  const { register } = useAuth(); // Hook from your AuthContext
  const [role, setRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
    date_of_birth: "",
    license_number: "",
    specialization: "",
  });

  const commonFields = [
    { name: "username", placeholder: "Username", icon: User, type: "text" },
    { name: "email", placeholder: "Email Address", icon: Mail, type: "email" },
    { name: "phone", placeholder: "Phone Number", icon: Phone, type: "tel" },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  // --- INTEGRATION LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // Prepare payload exactly as backend expects
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.password2,
      role: role,
      phone: formData.phone,
    };

    if (role === "patient") {
      payload.date_of_birth = formData.date_of_birth;
    } else {
      payload.license_number = formData.license_number;
      payload.specialization = formData.specialization;
    }

    try {
      await register(payload);
      // Redirection logic
      if (role === "therapist") {
        router.push("/therapist/dashboard");
      } else {
        router.push("/patient/dashboard");
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data) {
        const firstKey = Object.keys(data)[0];
        setErrorMsg(`${firstKey}: ${data[firstKey][0]}`);
      } else {
        setErrorMsg("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 min-h-screen flex flex-col lg:flex-row">
        {/* LEFT SIDE: Form */}
        <div className="w-full lg:w-[45%] flex items-center py-12">
          <div className="max-w-md w-full">
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">
                  MentalSathi
                </span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Create account
              </h1>
              <p className="text-slate-600 text-sm">
                Already have an account?{" "}
                <span
                  className="text-blue-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => router.push("/auth/login")}
                >
                  Log in
                </span>
              </p>
            </header>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Switcher */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: "patient", label: "Patient", icon: Heart },
                  { id: "therapist", label: "Therapist", icon: Briefcase },
                ].map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl text-sm font-semibold transition-all border-2 ${
                      role === r.id
                        ? "bg-blue-50 border-blue-600 text-blue-600"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    <r.icon className="w-5 h-5" />
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Input Fields */}
              <div className="space-y-3">
                {commonFields.map((field) => (
                  <FormInput
                    key={field.name}
                    {...field}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                  />
                ))}

                {role === "patient" ? (
                  <FormInput
                    name="date_of_birth"
                    type="date"
                    icon={Calendar}
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                  />
                ) : (
                  <>
                    <FormInput
                      name="license_number"
                      placeholder="License Number"
                      icon={Award}
                      value={formData.license_number}
                      onChange={handleInputChange}
                    />
                    <FormInput
                      name="specialization"
                      placeholder="Specialization"
                      icon={BookOpen}
                      value={formData.specialization}
                      onChange={handleInputChange}
                    />
                  </>
                )}

                {/* Password Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    name="password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    icon={Lock}
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <div className="relative">
                    <FormInput
                      name="password2"
                      placeholder="Confirm"
                      type={showPassword ? "text" : "password"}
                      icon={Lock}
                      value={formData.password2}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 z-20"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2 group mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create {role} account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: Information Section (PRESERVED) */}
        <div className="hidden lg:flex w-[55%] pt-24 pb-12 flex-col items-center justify-start pl-12">
          <div className="max-w-xl w-full space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    MentalSathi Platform
                  </h3>
                  <p className="text-sm text-slate-600">8th Semester Project</p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed mb-8 italic">
                "Our mission is to bridge the gap between mental health
                professionals and those seeking support through a seamless,
                secure, and user-friendly digital interface."
              </p>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  icon={Shield}
                  title="Secure Data"
                  desc="Encrypted user profiles."
                  color="text-blue-600"
                />
                <InfoCard
                  icon={GraduationCap}
                  title="Academic"
                  desc="Build with Next.js & TailwindCSS."
                  color="text-purple-600"
                />
              </div>
            </div>

            <div className="space-y-4">
              <FeatureBar
                icon={CheckCircle2}
                title="Verified Roles"
                desc="Specific data collection for patients vs licensed therapists."
                bg="bg-green-100"
                iconColor="text-green-600"
              />
              <FeatureBar
                icon={Zap}
                title="Responsive"
                desc="Optimized for mobile, tablet, and desktop viewing."
                bg="bg-blue-100"
                iconColor="text-blue-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- HELPER SUB-COMPONENTS --- */

const FormInput = ({
  name,
  placeholder,
  icon: Icon,
  type = "text",
  onChange,
  value,
}) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
    <input
      required
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 transition-colors"
    />
  </div>
);

const InfoCard = ({ icon: Icon, title, desc, color }) => (
  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
    <Icon className={`w-6 h-6 ${color} mb-2`} />
    <h4 className="font-semibold text-slate-900 text-sm mb-1">{title}</h4>
    <p className="text-xs text-slate-600">{desc}</p>
  </div>
);

const FeatureBar = ({ icon: Icon, title, desc, bg, iconColor }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
    <div className={`p-2 ${bg} rounded-lg`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div>
      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      <p className="text-xs text-slate-600">{desc}</p>
    </div>
  </div>
);
