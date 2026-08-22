"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  ArrowDown,
  Plus,
  Trash2,
  Share2,
  Download,
  Clock,
  PieChart,
  AlertTriangle,
} from "lucide-react";
import { TiltCard } from "../3d/TiltCard";
import { MagneticButton } from "../3d/MagneticButton";

export const ItineraryViewScreen: React.FC = () => {
  const {
    activeTrip,
    trips,
    setActiveTripId,
    removeActivityFromTripDay,
    addActivityToTripDay,
    setSharedModalTrip,
    showToast,
  } = useApp();

  const currentTrip = activeTrip || trips[0];
  const [selectedDayTab, setSelectedDayTab] = useState<number>(1);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityCost, setNewActivityCost] = useState(50);
  const [newActivityTime, setNewActivityTime] = useState("03:00 PM");
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const days = currentTrip?.days.length > 0
    ? currentTrip.days
    : [
        {
          dayNumber: 1,
          date: currentTrip?.startDate || "2024-01-09",
          city: currentTrip?.destination || "Paris",
          totalDayExpense: 340,
          activities: [
            {
              id: "act-init-1",
              timeSlot: "10:30 AM",
              title: "Check-in at Boutique Hotel & Espresso",
              description: "Settle into room, store baggage, and enjoy welcome artisan café breakfast.",
              location: "Historic District Center",
              category: "Lodging",
              cost: 0,
              duration: "1.5h",
              completed: true,
            },
            {
              id: "act-init-2",
              timeSlot: "02:00 PM",
              title: "Old Town Heritage & Historic Squares Tour",
              description: "Explore classical architecture, cobblestone alleyways, and fountain plazas.",
              location: "City Center",
              category: "Sightseeing",
              cost: 35,
              duration: "2.5h",
              completed: true,
            },
            {
              id: "act-init-3",
              timeSlot: "07:30 PM",
              title: "Traditional 3-Course Gourmet Dinner",
              description: "Authentic local delicacies paired with fine regional wine.",
              location: "Rue Gourmande",
              category: "Culinary",
              cost: 95,
              duration: "2h",
              completed: false,
            },
          ],
        },
        {
          dayNumber: 2,
          date: currentTrip?.startDate || "2024-01-10",
          city: currentTrip?.destination || "Paris",
          totalDayExpense: 220,
          activities: [
            {
              id: "act-init-4",
              timeSlot: "09:30 AM",
              title: "Top Landmark VIP Skip-the-Line Visit",
              description: "Pre-booked early morning access to iconic monuments and scenic viewpoints.",
              location: "Grand Avenue",
              category: "Culture",
              cost: 85,
              duration: "3h",
              completed: false,
            },
            {
              id: "act-init-5",
              timeSlot: "08:00 PM",
              title: "Evening River Cruise & Sunset Skyline Lights",
              description: "Panoramic riverboat cruise with champagne and live acoustic music.",
              location: "Pier Terminal",
              category: "Relaxation",
              cost: 135,
              duration: "2h",
              completed: false,
            },
          ],
        },
      ];

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrip || !newActivityTitle) return;

    addActivityToTripDay(currentTrip.id, selectedDayTab, {
      id: `custom-act-${Date.now()}`,
      timeSlot: newActivityTime,
      title: newActivityTitle,
      description: "Custom planned travel milestone.",
      location: currentTrip.destination,
      category: "Activity",
      cost: Number(newActivityCost),
      duration: "2h",
    });

    setNewActivityTitle("");
    setIsAddingCustom(false);
  };

  const currentDayData = days.find((d) => d.dayNumber === selectedDayTab) || days[0];

  const totalTripActual = days.reduce((sum, d) => sum + d.totalDayExpense, 0) + (currentTrip?.expenseBreakdown?.transport || 600) + (currentTrip?.expenseBreakdown?.stay || 800);
  const targetBudget = currentTrip?.estimatedBudget || 2000;
  const isOverBudget = totalTripActual > targetBudget;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Wireframe Tag Banner */}
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs text-[#2C5E3B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C5E3B]" />
            <span className="font-bold">
              Wireframe Screen 9: Itinerary View Screen with Budget Section
            </span>
          </div>
          <span className="text-[11px] text-[#555555]">
            Day-wise Layout • Physical Activity Flow ($\downarrow$) • Expense Column
          </span>
        </div>

        {/* Top Controls & Trip Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#2C5E3B] font-bold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                Itinerary for: <strong className="text-[#222222]">{currentTrip?.destination}, {currentTrip?.country}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#222222]">{currentTrip?.title}</h1>
          </div>

          {/* Trip Selector & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={currentTrip?.id}
              onChange={(e) => setActiveTripId(e.target.value)}
              className="bg-[#FAF9F6] text-[#222222] font-black text-xs rounded-xl px-3 py-2 border border-[#E6E4DC] focus:outline-none cursor-pointer"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSharedModalTrip(currentTrip)}
              className="px-3.5 py-2 rounded-xl bg-[#DD9F2A] hover:bg-[#C58B1E] text-[#222222] text-xs font-black shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share (Screen 13)</span>
            </button>

            <button
              onClick={() => showToast("Exporting PDF", "Generating printable travel voucher...", "success")}
              className="p-2 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#2C5E3B] border border-[#E6E4DC] cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {days.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayTab(day.dayNumber)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                selectedDayTab === day.dayNumber
                  ? "bg-[#2C5E3B] text-white shadow-md shadow-[#2C5E3B]/20 border border-[#2C5E3B]"
                  : "bg-white text-[#555555] hover:text-[#222222] border border-[#E6E4DC]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Day {day.dayNumber}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedDayTab === day.dayNumber ? "bg-white text-[#2C5E3B]" : "bg-[#FAF9F6] text-[#2C5E3B]"
              }`}>
                ${day.totalDayExpense}
              </span>
            </button>
          ))}

          <button
            onClick={() => {
              showToast("New Day Added", `Day ${days.length + 1} added to itinerary flow.`, "success");
            }}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-[#FAF9F6] text-[#2C5E3B] text-xs font-bold border border-dashed border-[#2C5E3B]/40 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Day</span>
          </button>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1 & 2: Itinerary Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md">
              {/* Header row matching wireframe 9 */}
              <div className="grid grid-cols-12 gap-3 pb-3 mb-4 border-b border-[#E6E4DC] text-xs font-black uppercase tracking-wider text-[#555555]">
                <div className="col-span-3 text-[#2C5E3B]">Day Timeline</div>
                <div className="col-span-6">Physical Activity Flow</div>
                <div className="col-span-3 text-right text-[#2C5E3B]">Expense ($)</div>
              </div>

              {/* Day Activities Sequence */}
              <div className="space-y-4">
                {currentDayData?.activities.map((act, index) => {
                  const isLast = index === currentDayData.activities.length - 1;

                  return (
                    <div key={act.id} className="space-y-3">
                      <div className="grid grid-cols-12 gap-3 items-center p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E6E4DC] hover:border-[#2C5E3B] transition-all">
                        {/* Day / Time slot */}
                        <div className="col-span-3">
                          <div className="text-[10px] font-black uppercase text-[#2C5E3B] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {act.timeSlot}
                          </div>
                          <div className="text-[11px] text-[#777777] font-semibold">{act.duration}</div>
                        </div>

                        {/* Physical Activity Title & Desc (Matching Wireframe 9) */}
                        <div className="col-span-6">
                          <div className="text-xs font-bold text-[#222222] line-clamp-1">
                            {act.title}
                          </div>
                          <div className="text-[11px] text-[#666666] line-clamp-1">
                            {act.description}
                          </div>
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white text-[#2C5E3B] border border-[#E6E4DC]">
                            {act.location}
                          </span>
                        </div>

                        {/* Expense Column (Matching Wireframe 9) */}
                        <div className="col-span-3 flex items-center justify-end gap-2 text-right">
                          <div className="text-sm font-black text-[#2C5E3B]">
                            ${act.cost}
                          </div>
                          <button
                            onClick={() =>
                              removeActivityFromTripDay(currentTrip.id, selectedDayTab, act.id)
                            }
                            className="p-1 rounded text-[#888888] hover:text-rose-600 transition-colors"
                            title="Remove activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Directional Sequence Arrow (Matching Wireframe 9 $\downarrow$) */}
                      {!isLast && (
                        <div className="flex justify-center my-1">
                          <div className="p-1 rounded-full bg-[#2C5E3B]/10 text-[#2C5E3B] border border-[#2C5E3B]/20">
                            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Activity button */}
              <div className="mt-5 pt-4 border-t border-[#E6E4DC]">
                {isAddingCustom ? (
                  <form onSubmit={handleAddCustomActivity} className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Activity name (e.g. Sunset drinks at rooftop)"
                          value={newActivityTitle}
                          onChange={(e) => setNewActivityTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222]"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Cost ($)"
                          value={newActivityCost}
                          onChange={(e) => setNewActivityCost(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingCustom(false)}
                        className="px-3 py-1 text-xs text-[#666666]"
                      >
                        Cancel
                      </button>
                      <MagneticButton variant="amber" size="sm" type="submit">
                        <span>Add to Timeline</span>
                      </MagneticButton>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingCustom(true)}
                    className="w-full py-2.5 rounded-2xl border border-dashed border-[#2C5E3B]/40 hover:border-[#2C5E3B] text-[#2C5E3B] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#2C5E3B]" />
                    <span>+ Add Custom Activity to Day {selectedDayTab}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Live Budget & Financial Breakdown */}
          <div className="space-y-4">
            <TiltCard
              maxTilt={3}
              className="p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md text-[#222222] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DC]">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#2C5E3B]" />
                  <h3 className="text-sm font-black text-[#222222]">Trip Budget Breakdown</h3>
                </div>
                <span className="text-[10px] uppercase font-bold bg-[#2C5E3B]/10 text-[#2C5E3B] px-2 py-0.5 rounded-full border border-[#2C5E3B]/20">
                  Live Sync
                </span>
              </div>

              {/* Progress & Target */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#555555]">Total Estimated vs Target:</span>
                  <span className="font-black text-[#222222]">
                    ${totalTripActual} / ${targetBudget}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#FAF9F6] border border-[#E6E4DC] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget
                        ? "bg-rose-500"
                        : "bg-[#2C5E3B]"
                    }`}
                    style={{
                      width: `${Math.min((totalTripActual / targetBudget) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Overbudget alert */}
              {isOverBudget && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Exceeds target budget by ${totalTripActual - targetBudget}</span>
                </div>
              )}

              {/* Category Breakdown Table */}
              <div className="space-y-2 text-xs pt-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC]">
                  <span className="text-[#555555]">Flights & Transit</span>
                  <span className="font-bold text-[#222222]">
                    ${currentTrip?.expenseBreakdown?.transport || 600}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC]">
                  <span className="text-[#555555]">Hotel & Stays</span>
                  <span className="font-bold text-[#222222]">
                    ${currentTrip?.expenseBreakdown?.stay || 800}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC]">
                  <span className="text-[#555555]">Activities & Tours</span>
                  <span className="font-bold text-[#2C5E3B]">
                    ${days.reduce((s, d) => s + d.totalDayExpense, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC]">
                  <span className="text-[#555555]">Meals & Dining</span>
                  <span className="font-bold text-[#222222]">
                    ${currentTrip?.expenseBreakdown?.meals || 200}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6E4DC] flex items-center justify-between text-xs">
                <span className="text-[#555555]">Average Daily Cost:</span>
                <span className="font-black text-[#2C5E3B]">
                  ${Math.round(totalTripActual / (currentTrip?.durationDays || 7))} / day
                </span>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </div>
  );
};
