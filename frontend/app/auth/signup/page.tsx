"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
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
  Loader2,
  Users,
  FileText,
} from "lucide-react";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<"patient" | "therapist">("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [genders, setGenders] = useState([]);
  const [professionTypes, setProfessionTypes] = useState([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password2: "",
    full_name: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    basic_health_info: "",
    terms_accepted: false,
    profession_type: "",
    license_id: "",
    years_of_experience: "",
  });

  // 🔗 Fetch dropdown metadata from backend
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Mock data
        const data = {
          genders: ["male", "female", "other"],
          profession_types: [
            "psychologist",
            "psychiatrist",
            "counselor",
            "therapist",
            "social_worker",
          ],
        };
        setGenders(data.genders);
        setProfessionTypes(data.profession_types);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMetadata();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errorMsg) setErrorMsg("");
  };

  // Update just the handleSubmit function in your signup page

  // Update just the handleSubmit function in your signup page

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.gender || !formData.date_of_birth) {
      setErrorMsg(
        "Please fill in all required fields (Gender and Date of Birth).",
      );
      return;
    }

    // Additional validation for therapist
    if (role === "therapist") {
      if (!formData.profession_type) {
        setErrorMsg("Please select a profession type.");
        return;
      }
      if (!formData.license_id) {
        setErrorMsg("Please enter your license ID.");
        return;
      }
      if (
        !formData.years_of_experience ||
        Number(formData.years_of_experience) < 0
      ) {
        setErrorMsg("Please enter valid years of experience.");
        return;
      }
    }

    setIsLoading(true);
    setErrorMsg(""); // Clear previous errors

    const payload: any = {
      email: formData.email,
      password: formData.password,
      password2: formData.password2,
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
    };

    if (role === "patient") {
      payload.emergency_contact_name = formData.emergency_contact_name;
      payload.emergency_contact_phone = formData.emergency_contact_phone;
      payload.basic_health_info = formData.basic_health_info || "";
      payload.terms_accepted = formData.terms_accepted;
    } else {
      payload.profession_type = formData.profession_type;
      payload.license_id = formData.license_id;
      payload.years_of_experience = Number(formData.years_of_experience);
    }

    console.log("Sending payload:", payload); // Debug log

    try {
      await register(role, payload);
      router.push(
        role === "therapist" ? "/therapist/dashboard" : "/patient/dashboard",
      );
    } catch (err: any) {
      console.log("Full error:", err);
      console.log("Error response:", err.response);
      console.log("Error data:", err.response?.data);

      const data = err.response?.data;

      if (data) {
        // Check if it's an object with error fields
        if (typeof data === "object") {
          // Try to find the first error message
          let errorMessage = "";

          // Priority order: error, email, then other fields
          if (data.error) {
            errorMessage = Array.isArray(data.error)
              ? data.error[0]
              : data.error;
          } else if (data.email) {
            errorMessage = Array.isArray(data.email)
              ? data.email[0]
              : data.email;
          } else if (data.password) {
            const pwdError = Array.isArray(data.password)
              ? data.password[0]
              : data.password;
            errorMessage = `Password: ${pwdError}`;
          } else {
            // Get first available error
            const firstKey = Object.keys(data)[0];
            if (firstKey) {
              const errorValue = data[firstKey];
              const msg = Array.isArray(errorValue)
                ? errorValue[0]
                : errorValue;
              const fieldName = firstKey
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
              errorMessage = `${fieldName}: ${msg}`;
            }
          }

          setErrorMsg(
            errorMessage ||
              "Registration failed. Please check your information.",
          );
        } else if (typeof data === "string") {
          setErrorMsg(data);
        }
      } else {
        setErrorMsg(
          "Registration failed. Please check your information and try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  const commonFields = [
    {
      name: "full_name",
      placeholder: "Full Name",
      icon: User,
      type: "text",
    },
    {
      name: "email",
      placeholder: "Email Address",
      icon: Mail,
      type: "email",
    },
    {
      name: "phone_number",
      placeholder: "Phone Number",
      icon: Phone,
      type: "tel",
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 min-h-screen flex flex-col lg:flex-row py-12">
        <div className="w-full lg:w-[45%] flex items-start">
          <div className="max-w-md w-full pb-12">
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
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
                <span className="text-xl font-bold text-slate-900">
                  CarePair
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

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <>
                    <FormInput
                      name="date_of_birth"
                      type="date"
                      icon={Calendar}
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />

                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                      <select
                        required
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 transition-colors appearance-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <FormInput
                      name="emergency_contact_name"
                      placeholder="Emergency Contact Name"
                      icon={User}
                      value={formData.emergency_contact_name}
                      onChange={handleInputChange}
                    />

                    <FormInput
                      name="emergency_contact_phone"
                      placeholder="Emergency Contact Phone"
                      icon={Phone}
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={handleInputChange}
                    />

                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400 z-10" />
                      <textarea
                        name="basic_health_info"
                        placeholder="Basic Health Information (optional)"
                        value={formData.basic_health_info}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 transition-colors resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <FormInput
                      name="date_of_birth"
                      type="date"
                      icon={Calendar}
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />

                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                      <select
                        required
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 transition-colors appearance-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                      <select
                        required
                        name="profession_type"
                        value={formData.profession_type}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 transition-colors appearance-none"
                      >
                        <option value="">Select Profession Type</option>
                        <option value="psychologist">Psychologist</option>
                        <option value="psychiatrist">Psychiatrist</option>
                        <option value="counselor">Counselor</option>
                        <option value="therapist">Therapist</option>
                        <option value="social_worker">Social Worker</option>
                      </select>
                    </div>

                    <FormInput
                      name="license_id"
                      placeholder="License ID"
                      icon={Award}
                      value={formData.license_id}
                      onChange={handleInputChange}
                    />

                    <FormInput
                      name="years_of_experience"
                      placeholder="Years of Experience"
                      icon={BookOpen}
                      type="number"
                      value={formData.years_of_experience}
                      onChange={handleInputChange}
                    />
                  </>
                )}

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

                {role === "patient" && (
                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleInputChange}
                      required
                      className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-xs text-slate-600 leading-relaxed">
                      I accept the terms and conditions and privacy policy
                    </label>
                  </div>
                )}
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

        <div className="hidden lg:flex w-[55%] pt-24 pb-12 flex-col items-center justify-start pl-12">
          <div className="max-w-xl w-full space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
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
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    CarePair Platform
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
