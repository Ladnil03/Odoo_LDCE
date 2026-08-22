"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
} from "lucide-react";
import { motion } from "motion/react";
import { TiltCard } from "../3d/TiltCard";

export const CalendarScreen: React.FC = () => {
  const { navigateTo, setActiveTripId } = useApp();

  const [currentMonth, setCurrentMonth] = useState("January 2024");
  const [selectedDay, setSelectedDay] = useState<number | null>(10);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const calendarCells = [];
  for (let i = 0; i < 1; i++) {
    calendarCells.push({ dayNumber: null, isCurrentMonth: false });
  }
  for (let d = 1; d <= 31; d++) {
    calendarCells.push({ dayNumber: d, isCurrentMonth: true });
  }

  const getTripForDay = (day: number | null) => {
    if (!day) return [];
    const matched = [];
    if (day >= 9 && day <= 14) {
      matched.push({
        id: "trip-paris-01",
        title: "PARIS TRIP",
        color: "bg-[#2C5E3B] text-white border-[#2C5E3B]",
        tag: "Paris Art & Gastronomy",
      });
    }
    if (day >= 15 && day <= 22) {
      matched.push({
        id: "trip-nyc-02",
        title: "NYC - GETAWAY",
        color: "bg-[#DD9F2A] text-[#222222] border-[#DD9F2A]",
        tag: "Broadway & Skyline",
      });
    }
    if (day >= 16 && day <= 23) {
      matched.push({
        id: "trip-japan-03",
        title: "JAPAN ADVENTURE",
        color: "bg-[#3D7D50] text-white border-[#3D7D50]",
        tag: "Winter Onsen & Fuji",
      });
    }
    return matched;
  };

  const selectedDayTrips = getTripForDay(selectedDay);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Wireframe Tag Banner */}
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs text-[#2C5E3B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C5E3B]" />
            <span className="font-bold">Wireframe Screen 11: Calendar View Screen</span>
          </div>
          <span className="text-[11px] text-[#555555]">
            Multi-Day Span Bars • Interactive Day Cell Inspection • Timeline Sync
          </span>
        </div>

        {/* Calendar Card (Matching Wireframe 11 layout) */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-xl space-y-6">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E4DC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2C5E3B]/10 text-[#2C5E3B] border border-[#2C5E3B]/20 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#222222]">Calendar View</h1>
                <p className="text-xs text-[#555555]">Global travel timeline and multi-day itinerary spans</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth("December 2023")}
                className="p-2 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#222222] border border-[#E6E4DC] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-4 py-2 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC] text-sm font-black text-[#222222] min-w-[150px] text-center">
                {currentMonth}
              </span>

              <button
                onClick={() => setCurrentMonth("February 2024")}
                className="p-2 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#222222] border border-[#E6E4DC] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="space-y-2">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-[#555555] py-2 border-b border-[#E6E4DC]">
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className={idx === 0 || idx === 6 ? "text-[#2C5E3B]" : ""}>
                  {day}
                </div>
              ))}
            </div>

            {/* Date Cells Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                const dayNum = cell.dayNumber;
                const cellTrips = getTripForDay(dayNum);
                const isSelected = selectedDay === dayNum;

                if (!dayNum) {
                  return (
                    <div
                      key={idx}
                      className="min-h-[90px] rounded-2xl bg-[#FAF9F6]/50 border border-transparent opacity-30"
                    />
                  );
                }

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`min-h-[95px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#2C5E3B]/10 border-[#2C5E3B] ring-2 ring-[#2C5E3B]/30 shadow-md"
                        : cellTrips.length > 0
                        ? "bg-[#FAF9F6] border-[#E6E4DC] hover:border-[#2C5E3B]"
                        : "bg-white border-[#E6E4DC] hover:bg-[#FAF9F6]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? "text-[#2C5E3B] font-black" : "text-[#222222]"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {cellTrips.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DD9F2A] animate-ping" />
                      )}
                    </div>

                    {/* Trip Span Tags in Cell */}
                    <div className="space-y-1 my-1">
                      {cellTrips.map((tr, tIdx) => (
                        <div
                          key={tIdx}
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border truncate ${tr.color}`}
                        >
                          {tr.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Details Panel */}
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#E6E4DC] space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E4DC]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#DD9F2A]" />
                  <h3 className="text-sm font-bold text-[#222222]">
                    Scheduled Itineraries for January {selectedDay}, 2024
                  </h3>
                </div>
                <span className="text-xs text-[#2C5E3B] font-bold">
                  {selectedDayTrips.length} Active Trip(s)
                </span>
              </div>

              {selectedDayTrips.length === 0 ? (
                <p className="text-xs text-[#555555]">
                  No active travels scheduled on this date. Click &ldquo;+ Plan a Trip&rdquo; to add new stops!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDayTrips.map((tr, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-[#E6E4DC] flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#222222]">{tr.title}</div>
                        <div className="text-[11px] text-[#555555]">{tr.tag}</div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTripId(tr.id);
                          navigateTo("itinerary-view", tr.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#2C5E3B] hover:bg-[#1E4329] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Plan</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
