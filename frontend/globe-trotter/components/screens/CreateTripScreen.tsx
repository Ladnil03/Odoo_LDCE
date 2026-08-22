"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  Plus,
  Check,
  ArrowRight,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { TiltCard } from "../3d/TiltCard";
import { MagneticButton } from "../3d/MagneticButton";

export const CreateTripScreen: React.FC = () => {
  const { navigateTo, createTrip, activities, showToast } = useApp();

  const [tripName, setTripName] = useState("Swiss Alps Alpine Escape");
  const [selectedCity, setSelectedCity] = useState("Interlaken & Swiss Alps");
  const [startDate, setStartDate] = useState("2024-04-10");
  const [endDate, setEndDate] = useState("2024-04-17");
  const [description, setDescription] = useState(
    "Thrilling 8-day expedition featuring tandem paragliding, scenic cogwheel trains, and cozy mountain chalets."
  );
  const [estimatedBudget, setEstimatedBudget] = useState(2400);
  const [coverPhoto, setCoverPhoto] = useState(
    "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80"
  );
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    "act-paraglide-alps",
  ]);

  const cityPresets = [
    {
      name: "Interlaken & Swiss Alps",
      country: "Switzerland",
      img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Paris",
      country: "France",
      img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Tokyo",
      country: "Japan",
      img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "New York City",
      country: "United States",
      img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80",
    },
    {
      name: "Bali & Ubud",
      country: "Indonesia",
      img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const toggleActivitySelection = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cityMatch = cityPresets.find((c) => c.name === selectedCity) || {
      country: "Global",
    };

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 7;

    const newTrip = createTrip({
      title: tripName,
      destination: selectedCity,
      country: cityMatch.country,
      startDate,
      endDate,
      durationDays,
      description,
      estimatedBudget: Number(estimatedBudget),
      coverImage: coverPhoto,
      tags: ["CustomPlan", selectedCity.split(" ")[0]],
    });

    showToast("Trip Created!", "Redirecting to Section Builder (Screen 5)...", "success");
    navigateTo("itinerary-builder", newTrip.id);
  };

  const suggestedActivities = activities.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Wireframe Tag Banner */}
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs text-[#2C5E3B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C5E3B]" />
            <span className="font-bold">Wireframe Screen 4: Create a New Trip</span>
          </div>
          <span className="text-[11px] text-[#555555]">
            Form Setup • Duration Sync • Suggestion Grid
          </span>
        </div>

        {/* Plan a new trip Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E4DC] shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E6E4DC]">
            <div>
              <h1 className="text-2xl font-black text-[#222222] tracking-tight">Plan a New Trip</h1>
              <p className="text-xs text-[#555555] mt-0.5">
                Set basic trip boundaries, travel dates, and estimate your initial target budget
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#2C5E3B]/10 text-[#2C5E3B] text-xs font-bold border border-[#2C5E3B]/20">
              Step 1 of 3
            </span>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Trip Name & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">
                  Trip Name / Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <Compass className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g. Summer in Swiss Alps"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">
                  Select a Place / City
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      const found = cityPresets.find((c) => c.name === e.target.value);
                      if (found) setCoverPhoto(found.img);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2C5E3B] cursor-pointer"
                  >
                    {cityPresets.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dates: Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1.5">
                  Estimated Budget ($ USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                </div>
              </div>
            </div>

            {/* Trip Description */}
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1.5">
                Trip Description & Highlights
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your travel vision, companions, and must-see goals..."
                className="w-full p-3 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
              />
            </div>

            {/* Cover Photo Selection */}
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#2C5E3B]" />
                Select Cover Photo
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {cityPresets.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCoverPhoto(preset.img)}
                    className={`relative rounded-2xl overflow-hidden h-20 cursor-pointer border-2 transition-all ${
                      coverPhoto === preset.img
                        ? "border-[#2C5E3B] ring-2 ring-[#2C5E3B]/40 scale-102"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={preset.img} alt={preset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#1E4329]/40 flex items-end p-1.5">
                      <span className="text-[10px] font-bold text-white truncate">{preset.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestion for Places to Visit / Activities to perform (Matching Wireframe 4) */}
            <div className="pt-4 border-t border-[#E6E4DC]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-[#222222] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#DD9F2A]" />
                    Suggestion for Places to Visit / Activities to Perform
                  </h3>
                  <p className="text-xs text-[#555555]">
                    Recommended experiences in {selectedCity} to pre-populate your itinerary
                  </p>
                </div>
                <span className="text-xs text-[#2C5E3B] font-bold">
                  {selectedActivities.length} selected
                </span>
              </div>

              {/* Suggestions Grid (Wireframe 4 layout: 2x3 cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedActivities.map((act) => {
                  const isSelected = selectedActivities.includes(act.id);
                  return (
                    <TiltCard
                      key={act.id}
                      maxTilt={4}
                      onClick={() => toggleActivitySelection(act.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#2C5E3B]/10 border-[#2C5E3B] ring-1 ring-[#2C5E3B]"
                          : "bg-[#FAF9F6] border-[#E6E4DC] hover:border-[#CCCCCC]"
                      }`}
                    >
                      <div className="relative h-28 rounded-xl overflow-hidden mb-3">
                        <img src={act.image} alt={act.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-black text-[#2C5E3B] shadow-sm">
                          ${act.cost}
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#2C5E3B] text-[9px] font-bold text-white uppercase">
                          {act.category}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-[#222222] line-clamp-1 mb-1">{act.name}</h4>
                      <p className="text-[11px] text-[#555555] line-clamp-2 leading-relaxed mb-3">
                        {act.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E6E4DC]">
                        <div className="flex items-center gap-1 text-[11px] text-[#DD9F2A] font-bold">
                          <Star className="w-3 h-3 fill-[#DD9F2A]" />
                          <span>{act.rating}</span>
                        </div>

                        <button
                          type="button"
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                            isSelected
                              ? "bg-[#2C5E3B] text-white"
                              : "bg-[#F0EFEA] text-[#222222] hover:bg-[#E5E2D8]"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            </div>

            {/* Save & Proceed CTA */}
            <div className="pt-6 flex items-center justify-end gap-3 border-t border-[#E6E4DC]">
              <button
                type="button"
                onClick={() => navigateTo("home")}
                className="px-5 py-2.5 text-xs font-bold text-[#555555] hover:text-[#222222] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <MagneticButton
                type="submit"
                variant="amber"
                size="lg"
                glow
              >
                <span>Save & Build Itinerary (Screen 5)</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
