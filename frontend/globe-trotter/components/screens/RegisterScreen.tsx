"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe2,
  Camera,
  Sparkles,
  ArrowRight,
  Compass,
} from "lucide-react";
import { motion } from "motion/react";
import { TiltCard } from "../3d/TiltCard";
import { MagneticButton } from "../3d/MagneticButton";

export const RegisterScreen: React.FC = () => {
  const { navigateTo, user, updateUser, showToast } = useApp();

  const [formData, setFormData] = useState({
    firstName: user.firstName || "Aarav",
    lastName: user.lastName || "Shah",
    email: user.email || "aarav.travels@globetrotter.io",
    phone: user.phone || "+91 98765 43210",
    city: user.city || "Ahmedabad",
    country: user.country || "India",
    bio: user.bio || "Passionate world explorer, photographer, and alpine hiker.",
    avatar: user.avatar,
  });

  const avatarOptions = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      country: formData.country,
      bio: formData.bio,
      avatar: formData.avatar,
    });
    showToast("Registration Complete!", "Your new GlobeTrotter account has been created.", "success");
    navigateTo("home");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#FAF9F6]">
      {/* Glow Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#2C5E3B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#DD9F2A]/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Wireframe Tag */}
        <div className="mb-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#2C5E3B]/10 text-[#2C5E3B] border border-[#2C5E3B]/20">
            <Compass className="w-3.5 h-3.5" />
            Wireframe Screen 2: Registration Screen
          </span>
        </div>

        <TiltCard
          maxTilt={4}
          className="bg-white border border-[#E6E4DC] p-6 sm:p-8 shadow-xl text-[#222222]"
        >
          {/* Header & Photo Selector */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3 group">
              <div className="w-24 h-24 rounded-full p-1 bg-[#2C5E3B] shadow-md shadow-[#2C5E3B]/20">
                <img
                  src={formData.avatar}
                  alt="Profile Photo"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute bottom-1 right-1 p-1.5 rounded-full bg-[#DD9F2A] text-[#222222] border-2 border-white shadow">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              {avatarOptions.map((av, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, avatar: av })}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                    formData.avatar === av
                      ? "border-[#2C5E3B] scale-110 shadow-md shadow-[#2C5E3B]/30"
                      : "border-[#E6E4DC] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={av} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[#222222]">Create Traveler Profile</h2>
            <p className="text-xs text-[#555555] mt-1">
              Join the global network of passionate explorers and journey architects
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First Name"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>
            </div>

            {/* Email Address & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>
            </div>

            {/* City & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. San Francisco"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">Country</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. United States"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information .... */}
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1.5">
                Additional Information / Travel Bio & Preferences ....
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about your favorite trip styles (e.g. hiking, gastronomy, solo backpacking, photography)..."
                className="w-full p-3 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
              />
            </div>

            {/* Register Users CTA button */}
            <div className="pt-2">
              <MagneticButton
                type="submit"
                variant="amber"
                size="lg"
                className="w-full"
                glow
              >
                <Sparkles className="w-4 h-4" />
                <span>Register Users</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          </form>

          {/* Back to Login */}
          <div className="mt-5 text-center text-xs text-[#555555]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigateTo("login")}
              className="text-[#2C5E3B] font-extrabold hover:underline cursor-pointer"
            >
              Sign In Here (Screen 1)
            </button>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
};
