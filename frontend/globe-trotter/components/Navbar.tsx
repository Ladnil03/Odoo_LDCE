"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ScreenType } from "@/lib/types";
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  PlusCircle,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MagneticButton } from "./3d/MagneticButton";

export const Navbar: React.FC = () => {
  const { currentScreen, navigateTo, user, trips } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems: { label: string; screen: ScreenType; icon: React.ElementType }[] = [
    { label: "Dashboard", screen: "home", icon: Compass },
    { label: "My Trips", screen: "my-trips", icon: MapPin },
    { label: "Activities", screen: "search", icon: Sparkles },
    { label: "Timeline & Calendar", screen: "calendar", icon: Calendar },
    { label: "Community", screen: "community", icon: Users },
    { label: "Admin Analytics", screen: "admin", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FAF9F6]/90 border-b border-[#E6E4DC] text-[#222222] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand: Forest Green */}
        <div
          onClick={() => navigateTo("home")}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-[#2C5E3B] p-0.5 shadow-md shadow-[#2C5E3B]/20 group-hover:bg-[#1E4329] transition-all duration-300">
            <div className="w-full h-full bg-[#2C5E3B] rounded-[14px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#DD9F2A] group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-[#2C5E3B]">
                GlobeTrotter
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#DD9F2A]/20 text-[#222222] border border-[#DD9F2A]/40">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-[#555555] -mt-0.5 font-medium">Personalized Travel Planning</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => navigateTo(item.screen)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-[#2C5E3B] bg-[#2C5E3B]/10 border border-[#2C5E3B]/20"
                    : "text-[#555555] hover:text-[#222222] hover:bg-[#EAE8E0]/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#2C5E3B]" : "text-[#777777]"}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    className="absolute -bottom-1 left-3 right-3 h-0.5 bg-[#2C5E3B] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Plan Trip CTA with Warm Amber highlight */}
          <MagneticButton
            variant="amber"
            size="sm"
            onClick={() => navigateTo("create-trip")}
            className="hidden sm:inline-flex"
            glow
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Plan a Trip</span>
          </MagneticButton>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-[#EAE8E0] transition-colors border border-transparent hover:border-[#E6E4DC] cursor-pointer"
            >
              <img
                src={user.avatar}
                alt={user.firstName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#2C5E3B]"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[#222222] leading-tight">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[10px] text-[#2C5E3B] font-semibold">
                  {trips.length} Active Trips
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#777777] hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E6E4DC] shadow-xl p-2 z-50 text-[#222222]"
                  >
                    <div className="p-3 border-b border-[#E6E4DC]">
                      <div className="text-xs font-bold text-[#222222]">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-[11px] text-[#777777] truncate">{user.email}</div>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-[#2C5E3B] bg-[#2C5E3B]/10 px-2 py-1 rounded-lg font-semibold">
                        <span>{user.city}, {user.country}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigateTo("profile");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#222222] hover:bg-[#FAF9F6] rounded-xl transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-[#2C5E3B]" />
                        <span>Profile & Settings (Screen 7)</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigateTo("itinerary-builder");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#222222] hover:bg-[#FAF9F6] rounded-xl transition-colors text-left"
                      >
                        <Layers className="w-4 h-4 text-[#DD9F2A]" />
                        <span>Itinerary Builder (Screen 5)</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigateTo("admin");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#222222] hover:bg-[#FAF9F6] rounded-xl transition-colors text-left"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#2C5E3B]" />
                        <span>Admin Analytics (Screen 12)</span>
                      </button>

                      <div className="h-px bg-[#E6E4DC] my-1" />

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigateTo("login");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Switch User / Auth Screen</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
