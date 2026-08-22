"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
} from "lucide-react";
import { Card, Eyebrow, Button, Tag } from "../UiBits";
import { formatDate } from "@/lib/format";

export const CalendarScreen: React.FC = () => {
  const { trips, navigateTo, setActiveTripId } = useApp();

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0); // offset from current
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Generate calendar days for current view (focus on active trip's month if available)
  const initialDate = trips.length > 0 && trips[0].startDate ? new Date(trips[0].startDate) : new Date();
  const baseDate = new Date(initialDate.getFullYear(), initialDate.getMonth() + currentMonthIndex, 1);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const monthName = baseDate.toLocaleString("default", { month: "long", year: "numeric" });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarDays.push(d);
  }

  const getTripsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return trips.filter((t) => {
      if (!t.startDate) return false;
      const start = t.startDate.split("T")[0];
      const end = (t.endDate || t.startDate).split("T")[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  const selectedTrips = selectedDate ? trips.filter((t) => {
    if (!t.startDate) return false;
    const start = t.startDate.split("T")[0];
    const end = (t.endDate || t.startDate).split("T")[0];
    return selectedDate >= start && selectedDate <= end;
  }) : [];

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] py-8 px-4 sm:px-6 lg:px-8 paper">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[var(--surface-paper)] hairline text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent-pop)]" />
            <span className="font-semibold">Expedition Calendar & Itinerary Schedule</span>
          </div>
          <span className="text-[11px] text-[var(--ink-tertiary)] font-mono">
            MULTI-CITY SPAN VISUALIZER
          </span>
        </div>

        <Card className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)]">
            <div>
              <Eyebrow className="mb-0.5">Timeline View</Eyebrow>
              <h1 className="text-[22px] font-bold text-[var(--ink-primary)]">Global Calendar</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonthIndex((prev) => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="px-4 py-1.5 rounded-lg bg-[var(--surface-paper)] hairline text-[13px] font-bold text-[var(--ink-primary)] min-w-[160px] text-center font-mono">
                {monthName}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonthIndex((prev) => prev + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-mono font-bold text-[var(--ink-tertiary)] py-2 border-b border-[var(--border-hairline)]">
              {daysOfWeek.map((day, idx) => (
                <div key={idx}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dayNum, idx) => {
                if (dayNum === null) {
                  return (
                    <div
                      key={idx}
                      className="min-h-[85px] rounded-xl bg-[var(--surface-sunken)]/40 opacity-20"
                    />
                  );
                }

                const dayTrips = getTripsForDay(dayNum);
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const isSelected = selectedDate === dateStr;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[90px] p-2.5 rounded-xl hairline transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[var(--surface-paper)] ring-2 ring-[var(--ink-primary)]"
                        : dayTrips.length > 0
                        ? "bg-[var(--surface-paper)] hover:border-[var(--ink-primary)]"
                        : "bg-[var(--surface-elevated)] hover:bg-[var(--surface-paper)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-mono font-bold text-[var(--ink-primary)]">
                        {dayNum}
                      </span>
                      {dayTrips.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-pop)]" />
                      )}
                    </div>

                    <div className="space-y-1 my-1">
                      {dayTrips.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--ink-primary)] text-white truncate"
                        >
                          {t.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="p-5 rounded-xl bg-[var(--surface-paper)] hairline space-y-3 pt-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                <span className="text-[13px] font-bold text-[var(--ink-primary)] font-mono">
                  Scheduled for {formatDate(selectedDate)}
                </span>
                <Tag>{selectedTrips.length} active journeys</Tag>
              </div>

              {selectedTrips.length === 0 ? (
                <p className="text-[13px] text-[var(--ink-tertiary)]">
                  No expeditions scheduled for this date.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTrips.map((tr) => (
                    <div
                      key={tr.id}
                      className="p-3.5 rounded-lg bg-[var(--surface-elevated)] hairline flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[14px] font-bold text-[var(--ink-primary)]">{tr.title}</div>
                        <div className="text-[11px] text-[var(--ink-tertiary)] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[var(--accent-pop)]" />
                          <span>{tr.destination}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveTripId(tr.id);
                          navigateTo("itinerary-view", tr.id);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
