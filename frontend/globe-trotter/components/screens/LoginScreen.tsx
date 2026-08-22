"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, Sparkles, Compass } from "lucide-react";
import { motion } from "motion/react";
import { TiltCard } from "../3d/TiltCard";
import { MagneticButton } from "../3d/MagneticButton";

export const LoginScreen: React.FC = () => {
  const { navigateTo, user, updateUser, showToast } = useApp();
  const [emailOrUsername, setEmailOrUsername] = useState("aarav.travels@globetrotter.io");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Welcome Back!", `Logged in as ${user.firstName} ${user.lastName}`, "success");
    navigateTo("home");
  };

  const handleQuickDemo = (role: "traveler" | "admin") => {
    if (role === "admin") {
      updateUser({ role: "admin", firstName: "Admin", lastName: "Officer" });
      showToast("Admin Mode Activated", "Logged in with administrator privileges.", "info");
      navigateTo("admin");
    } else {
      updateUser({ role: "traveler", firstName: "Aarav", lastName: "Shah" });
      showToast("Traveler Mode Activated", "Logged in as Aarav Shah.", "success");
      navigateTo("home");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#FAF9F6]">
      {/* Background soft ambient accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#2C5E3B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#DD9F2A]/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Wireframe Tag */}
        <div className="mb-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#2C5E3B]/10 text-[#2C5E3B] border border-[#2C5E3B]/20">
            <Compass className="w-3.5 h-3.5" />
            Wireframe Screen 1: Login Screen
          </span>
        </div>

        <TiltCard
          maxTilt={5}
          className="bg-white border border-[#E6E4DC] p-6 sm:p-8 shadow-xl text-[#222222]"
        >
          {/* Header & Avatar */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full p-1 bg-[#2C5E3B] shadow-md shadow-[#2C5E3B]/20">
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#DD9F2A] border-2 border-white flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-[#222222]" />
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[#222222]">Welcome to GlobeTrotter</h2>
            <p className="text-xs text-[#555555] mt-1">
              Sign in to manage and experience your world itineraries
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1.5">
                Username or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#222222]">Password</label>
                <button
                  type="button"
                  onClick={() => showToast("Password Reset Link", "A recovery link has been sent to your registered email.", "info")}
                  className="text-[11px] text-[#2C5E3B] font-bold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#777777] hover:text-[#222222] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-[#444444] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#FAF9F6] border-[#E6E4DC] text-[#2C5E3B] focus:ring-[#2C5E3B] accent-[#2C5E3B]"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Login CTA with Warm Amber button */}
            <MagneticButton
              type="submit"
              variant="amber"
              size="lg"
              className="w-full mt-2"
              glow
            >
              <span>Login to Account</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </form>

          {/* Quick Demo Switchers */}
          <div className="mt-6 pt-4 border-t border-[#E6E4DC]">
            <div className="text-[11px] uppercase tracking-wider text-[#555555] text-center font-bold mb-2.5">
              1-Click Demo Profiles
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("traveler")}
                className="px-3 py-2 rounded-xl bg-[#2C5E3B]/10 hover:bg-[#2C5E3B]/20 text-[#2C5E3B] text-xs font-bold border border-[#2C5E3B]/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#2C5E3B]" />
                <span>Demo Traveler</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                className="px-3 py-2 rounded-xl bg-[#DD9F2A]/15 hover:bg-[#DD9F2A]/25 text-[#222222] text-xs font-bold border border-[#DD9F2A]/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#DD9F2A]" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>

          {/* Link to Registration */}
          <div className="mt-5 text-center text-xs text-[#555555]">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => navigateTo("register")}
              className="text-[#2C5E3B] font-extrabold hover:underline cursor-pointer"
            >
              Register Users (Screen 2)
            </button>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
};
