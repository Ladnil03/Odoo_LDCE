"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ScreenType } from "@/lib/types";
import {
  Sparkles,
  Layers,
  ChevronUp,
  ChevronDown,
  Lock,
  UserPlus,
  Home,
  PlusSquare,
  ListOrdered,
  ListFilter,
  UserCheck,
  Search,
  Eye,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const ScreenNavigator: React.FC = () => {
  const { currentScreen, navigateTo, activeTrip, setSharedModalTrip } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const screens: { id: ScreenType; label: string; num: number; icon: React.ElementType; tag: string }[] = [
    { id: "login", label: "Login Screen", num: 1, icon: Lock, tag: "Wireframe 1" },
    { id: "register", label: "Registration Screen", num: 2, icon: UserPlus, tag: "Wireframe 2" },
    { id: "home", label: "Main Landing Page", num: 3, icon: Home, tag: "Wireframe 3" },
    { id: "create-trip", label: "Create a new Trip", num: 4, icon: PlusSquare, tag: "Wireframe 4" },
    { id: "itinerary-builder", label: "Build Itinerary Screen", num: 5, icon: ListOrdered, tag: "Wireframe 5" },
    { id: "my-trips", label: "User Trip Listing", num: 6, icon: ListFilter, tag: "Wireframe 6" },
    { id: "profile", label: "User Profile Pages", num: 7, icon: UserCheck, tag: "Wireframe 7" },
    { id: "search", label: "Activity Search / City Search", num: 8, icon: Search, tag: "Wireframe 8" },
    { id: "itinerary-view", label: "Itinerary View & Budget", num: 9, icon: Eye, tag: "Wireframe 9" },
    { id: "community", label: "Community Tab Screen", num: 10, icon: MessageSquare, tag: "Wireframe 10" },
    { id: "calendar", label: "Calendar View Screen", num: 11, icon: CalendarDays, tag: "Wireframe 11" },
    { id: "admin", label: "Admin Panel / Analytics", num: 12, icon: BarChart3, tag: "Wireframe 12" },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="mb-3 w-80 max-h-[75vh] overflow-y-auto rounded-3xl bg-white border border-[#E6E4DC] shadow-2xl p-3 text-[#222222] space-y-1 custom-scrollbar"
          >
            <div className="px-2 py-1.5 border-b border-[#E6E4DC] flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#2C5E3B]">
                  Screen Navigator
                </span>
                <p className="text-[10px] text-[#555555]">All 12 Wireframe & PDF Views</p>
              </div>
              <span className="text-[10px] bg-[#DD9F2A]/20 text-[#222222] font-bold px-2 py-0.5 rounded-full border border-[#DD9F2A]/40">
                12 Screens
              </span>
            </div>

            <div className="space-y-1 pt-1">
              {screens.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTo(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#2C5E3B] text-white font-bold shadow-md shadow-[#2C5E3B]/20"
                        : "hover:bg-[#FAF9F6] text-[#444444] hover:text-[#222222]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                          isActive ? "bg-white text-[#2C5E3B]" : "bg-[#F0EFEA] text-[#555555]"
                        }`}
                      >
                        {item.num}
                      </div>
                      <div className="truncate">
                        <div className="truncate font-medium">{item.label}</div>
                      </div>
                    </div>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#DD9F2A]" : "text-[#888888]"}`} />
                  </button>
                );
              })}
            </div>

            {/* Quick Share Itinerary Modal Trigger */}
            <div className="pt-2 border-t border-[#E6E4DC]">
              <button
                onClick={() => {
                  if (activeTrip) setSharedModalTrip(activeTrip);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#DD9F2A]/15 hover:bg-[#DD9F2A]/25 text-[#222222] text-xs font-bold border border-[#DD9F2A]/40 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#2C5E3B]" />
                  <span>Public Shared Itinerary (Modal)</span>
                </div>
                <span className="text-[9px] bg-[#2C5E3B] text-white px-1.5 py-0.5 rounded font-bold">Screen 13</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF9F6] text-[#222222] border border-[#E6E4DC] shadow-xl text-xs font-bold cursor-pointer group"
      >
        <div className="w-2 h-2 rounded-full bg-[#DD9F2A] animate-ping" />
        <Layers className="w-4 h-4 text-[#2C5E3B] group-hover:rotate-12 transition-transform" />
        <span className="text-[#2C5E3B] font-extrabold">12-Screen Navigator</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#666666]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#666666]" />}
      </motion.button>
    </div>
  );
};
