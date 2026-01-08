"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { authAPI } from "@/lib/api";
import {
  Mail,
  Lock,
  Heart,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Key,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      // ✅ redirect handled by AuthContext
    } catch (err: any) {
      const data = err.response?.data;
      setErrorMsg(data?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity cursor-pointer"
        onClick={() => router.push("/")}
      />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* LEFT SIDE */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-white/80">
          <header className="mb-10">
            <div
              className="flex items-center gap-2 mb-8 cursor-pointer group"
              onClick={() => router.push("/")}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">CarePair</span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">
              Don't have an account?{" "}
              <span
                className="text-blue-600 font-semibold cursor-pointer hover:underline"
                onClick={() => router.push("/auth/signup")}
              >
                Create one for free
              </span>
            </p>
          </header>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-4 bg-white/50 border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <footer className="mt-10 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-3 text-slate-400">
              <ShieldCheck className="w-5 h-5" />
              <p className="text-[10px] uppercase tracking-widest font-bold">
                Secure Enterprise-grade Encryption
              </p>
            </div>
          </footer>
        </div>

        {/* RIGHT SIDE (UNCHANGED) */}
        <div className="hidden lg:flex bg-gradient-to-br from-blue-600 to-indigo-700 p-16 flex-col justify-between relative overflow-hidden rounded-r-[2.5rem] -ml-[1px] border-l border-white/10">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-6">
              Your journey to <br />
              <span className="text-blue-200">mental wellness</span> <br />
              continues here.
            </h2>
          </div>
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <p className="text-white/90 italic text-lg mb-4">
              {" "}
              "Healing takes courage, and we all have courage, even if we have
              to dig a little to find it."{" "}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-400" />
              <div>
                <p className="text-white font-bold text-sm">Tori Amos</p>
                <p className="text-white/60 text-xs">Mental Health Advocate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
