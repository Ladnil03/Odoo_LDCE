"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Layers,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Plane,
  Building,
  Sparkles,
  Utensils,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TiltCard } from "../3d/TiltCard";
import { MagneticButton } from "../3d/MagneticButton";
import { ItinerarySection } from "@/lib/types";

export const ItineraryBuilderScreen: React.FC = () => {
  const {
    activeTrip,
    trips,
    setActiveTripId,
    addSectionToTrip,
    deleteSectionFromTrip,
    navigateTo,
  } = useApp();

  const currentTrip = activeTrip || trips[0];

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionType, setSectionType] = useState<"travel" | "stay" | "activity" | "dining" | "custom">("activity");
  const [sectionDescription, setSectionDescription] = useState("");
  const [startDate, setStartDate] = useState(currentTrip?.startDate || "2024-01-10");
  const [endDate, setEndDate] = useState(currentTrip?.endDate || "2024-01-13");
  const [budget, setBudget] = useState(400);

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "travel":
        return Plane;
      case "stay":
        return Building;
      case "dining":
        return Utensils;
      default:
        return Sparkles;
    }
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrip) return;

    const newSec: ItinerarySection = {
      id: `sec-${Date.now()}`,
      title: sectionTitle || "New Travel Block",
      type: sectionType,
      description: sectionDescription || "Planned experiences and bookings for this time segment.",
      startDate,
      endDate,
      budget: Number(budget),
      actualCost: 0,
      destinationCity: currentTrip.destination,
    };

    addSectionToTrip(currentTrip.id, newSec);
    setIsAddingSection(false);
    setSectionTitle("");
    setSectionDescription("");
  };

  const totalCalculatedBudget = currentTrip?.sections.reduce((acc, s) => acc + s.budget, 0) || 0;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Wireframe Tag Banner */}
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs text-[#2C5E3B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C5E3B]" />
            <span className="font-bold">Wireframe Screen 5: Build Itinerary Screen</span>
          </div>
          <span className="text-[11px] text-[#555555]">
            Modular Section Cards • Date Ranges • Segment Budgets
          </span>
        </div>

        {/* Trip Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#2C5E3B] font-black">
              Active Trip Blueprint
            </div>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={currentTrip?.id}
                onChange={(e) => setActiveTripId(e.target.value)}
                className="bg-[#FAF9F6] text-[#222222] font-black text-base rounded-xl px-3 py-1.5 border border-[#E6E4DC] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B] cursor-pointer"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.destination})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-[#555555] font-semibold">Aggregated Budget</div>
              <div className="text-xl font-black text-[#2C5E3B]">
                ${totalCalculatedBudget}
              </div>
            </div>

            <MagneticButton
              variant="amber"
              size="sm"
              onClick={() => {
                if (currentTrip) navigateTo("itinerary-view", currentTrip.id);
              }}
            >
              <Eye className="w-4 h-4" />
              <span>Itinerary View (Screen 9)</span>
            </MagneticButton>
          </div>
        </div>

        {/* Stacked Section Cards (Matching Wireframe 5 layout) */}
        <div className="space-y-4">
          <AnimatePresence>
            {currentTrip?.sections.map((section, index) => {
              const Icon = getSectionIcon(section.type);
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <TiltCard
                    maxTilt={3}
                    className="p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-md hover:border-[#2C5E3B] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#2C5E3B]/10 text-[#2C5E3B] border border-[#2C5E3B]/20 flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#2C5E3B]">
                              Section {index + 1}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF9F6] text-[#555555] border border-[#E6E4DC] capitalize">
                              {section.type}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#222222] mt-0.5">
                            {section.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteSectionFromTrip(currentTrip.id, section.id)}
                        className="p-2 rounded-xl text-[#888888] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Section description */}
                    <p className="text-xs text-[#444444] leading-relaxed bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E6E4DC] mb-4">
                      {section.description ||
                        "All the necessary information about this section. This can be anything like travel section, hotel, or any other activity."}
                    </p>

                    {/* Bottom Metadata: Date Range & Budget (Matching Wireframe 5) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E6E4DC]">
                      <div className="flex items-center gap-2 text-xs text-[#444444] bg-[#FAF9F6] px-3 py-2 rounded-xl border border-[#E6E4DC]">
                        <Calendar className="w-4 h-4 text-[#2C5E3B] shrink-0" />
                        <span className="font-medium">
                          Date Range:{" "}
                          <strong className="text-[#222222]">
                            {section.startDate} to {section.endDate}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#444444] bg-[#FAF9F6] px-3 py-2 rounded-xl border border-[#E6E4DC]">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[#2C5E3B] shrink-0" />
                          <span>Budget of this section:</span>
                        </div>
                        <span className="font-black text-[#2C5E3B] text-sm">
                          ${section.budget}
                        </span>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add Another Section Button (Matching Wireframe 5) */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsAddingSection(true)}
            className="w-full py-4 rounded-3xl border-2 border-dashed border-[#2C5E3B]/40 hover:border-[#2C5E3B] bg-white hover:bg-[#FAF9F6] text-[#2C5E3B] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>+ Add another Section</span>
          </motion.button>
        </div>

        {/* Modal to Add Section */}
        <AnimatePresence>
          {isAddingSection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-lg p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-2xl text-[#222222] space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DC]">
                  <h3 className="text-lg font-black text-[#222222] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#2C5E3B]" />
                    Add Itinerary Section
                  </h3>
                  <button
                    onClick={() => setIsAddingSection(false)}
                    className="text-xs text-[#666666] hover:text-[#222222]"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleCreateSection} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#222222] mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      required
                      value={sectionTitle}
                      onChange={(e) => setSectionTitle(e.target.value)}
                      placeholder="e.g. Kyoto High Speed Train & Ryokan"
                      className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#222222] mb-1">
                        Section Category
                      </label>
                      <select
                        value={sectionType}
                        onChange={(e) => setSectionType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2C5E3B] cursor-pointer"
                      >
                        <option value="travel">Travel & Transit</option>
                        <option value="stay">Hotel & Lodging</option>
                        <option value="activity">Guided Activity</option>
                        <option value="dining">Culinary / Dining</option>
                        <option value="custom">Custom Milestone</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#222222] mb-1">
                        Allocated Budget ($)
                      </label>
                      <input
                        type="number"
                        required
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#222222] mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#222222] mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#222222] mb-1">
                      Section Notes & Logistics
                    </label>
                    <textarea
                      rows={3}
                      value={sectionDescription}
                      onChange={(e) => setSectionDescription(e.target.value)}
                      placeholder="Enter booking reference numbers, transit details, contact numbers..."
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingSection(false)}
                      className="px-4 py-2 text-xs font-bold text-[#666666] hover:text-[#222222]"
                    >
                      Cancel
                    </button>
                    <MagneticButton variant="amber" size="md" type="submit">
                      <span>Add Section</span>
                    </MagneticButton>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
