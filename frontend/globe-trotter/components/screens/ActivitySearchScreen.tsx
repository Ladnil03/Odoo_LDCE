"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  MapPin,
  Clock,
  Star,
  Plus,
  Check,
  Sparkles,
} from "lucide-react";
import { TiltCard } from "../3d/TiltCard";
import { MagneticButton } from "../3d/MagneticButton";
import { ActivityItem } from "@/lib/types";

export const ActivitySearchScreen: React.FC = () => {
  const {
    activities,
    activeTrip,
    addActivityToTripDay,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "price-low" | "price-high" | "duration">("rating");
  const [addedActivityIds, setAddedActivityIds] = useState<string[]>([]);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);

  const categories = ["All", "Adventure", "Culture", "Culinary", "Sightseeing", "Nature"];

  const filteredActivities = activities
    .filter((act) => {
      const matchesSearch =
        act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === "All" || act.category === selectedCategory;
      const matchesCity = selectedCity === "All" || act.city.includes(selectedCity);

      return matchesSearch && matchesCat && matchesCity;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-low") return a.cost - b.cost;
      if (sortBy === "price-high") return b.cost - a.cost;
      if (sortBy === "duration") return a.durationHours - b.durationHours;
      return 0;
    });

  const handleAddActivity = (activity: ActivityItem) => {
    if (!activeTrip) {
      showToast("Select a Trip", "Please create or select an active trip first.", "warning");
      return;
    }

    addActivityToTripDay(activeTrip.id, selectedDayNumber, {
      id: `act-${Date.now()}`,
      activityId: activity.id,
      timeSlot: activity.bestTime || "11:00 AM",
      title: activity.name,
      description: activity.description,
      location: activity.location,
      category: activity.category,
      cost: activity.cost,
      duration: `${activity.durationHours}h`,
    });

    setAddedActivityIds((prev) => [...prev, activity.id]);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Wireframe Tag Banner */}
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs text-[#2C5E3B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C5E3B]" />
            <span className="font-bold">Wireframe Screen 8: Activity Search Pages / City Search Page</span>
          </div>
          <span className="text-[11px] text-[#555555]">
            Search Bar • Group by • Filter • Sort by • Option and its details
          </span>
        </div>

        {/* Search & Filter Toolbar (Matching Wireframe 8) */}
        <div className="p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search input (Wireframe: 'Paragliding') */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bar .... (e.g. Paragliding, Louvre, Scuba diving, Food crawl)"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
              />
            </div>

            {/* Controls: Group by, Filter, Sort by */}
            <div className="flex items-center gap-2">
              {/* Group By Filter */}
              <div className="relative min-w-[130px]">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#777777]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full pl-8 pr-6 py-2 bg-[#FAF9F6] border border-[#E6E4DC] text-xs font-semibold rounded-xl text-[#222222] focus:outline-none cursor-pointer"
                >
                  <option value="All">Group by: All Cities</option>
                  <option value="Paris">Paris, France</option>
                  <option value="Tokyo">Tokyo, Japan</option>
                  <option value="Interlaken">Interlaken, Swiss Alps</option>
                  <option value="New York">New York City</option>
                  <option value="Bali">Bali, Indonesia</option>
                  <option value="Cape Town">Cape Town, South Africa</option>
                </select>
              </div>

              {/* Filter */}
              <div className="relative min-w-[120px]">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#777777]">
                  <Filter className="w-3.5 h-3.5" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-8 pr-6 py-2 bg-[#FAF9F6] border border-[#E6E4DC] text-xs font-semibold rounded-xl text-[#222222] focus:outline-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      Filter: {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="relative min-w-[130px]">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#777777]">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-8 pr-6 py-2 bg-[#FAF9F6] border border-[#E6E4DC] text-xs font-semibold rounded-xl text-[#222222] focus:outline-none cursor-pointer"
                >
                  <option value="rating">Sort by: Top Rated</option>
                  <option value="price-low">Sort: Price (Low to High)</option>
                  <option value="price-high">Sort: Price (High to Low)</option>
                  <option value="duration">Sort: Duration</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target Day Scheduler bar */}
          {activeTrip && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs">
              <div className="flex items-center gap-2 text-[#2C5E3B] font-bold">
                <Sparkles className="w-4 h-4 text-[#DD9F2A]" />
                <span>Assign to Trip: <strong className="text-[#222222]">{activeTrip.title}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#555555]">Schedule on:</span>
                <select
                  value={selectedDayNumber}
                  onChange={(e) => setSelectedDayNumber(Number(e.target.value))}
                  className="px-2.5 py-1 bg-white border border-[#E6E4DC] rounded-xl text-[#222222] font-black text-xs"
                >
                  {Array.from({ length: Math.min(activeTrip.durationDays, 10) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Day {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Header (Matching Wireframe 8 "Results") */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#222222]">Results ({filteredActivities.length})</h2>
          <span className="text-xs text-[#555555]">Showing verified excursions & activities</span>
        </div>

        {/* Results Stack (Matching Wireframe 8 layout) */}
        <div className="space-y-3">
          {filteredActivities.map((act) => {
            const isAdded = addedActivityIds.includes(act.id);

            return (
              <TiltCard
                key={act.id}
                maxTilt={2}
                className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-sm hover:border-[#2C5E3B] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div className="w-24 h-20 rounded-2xl overflow-hidden shrink-0 relative">
                    <img src={act.image} alt={act.name} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#2C5E3B] text-[9px] font-bold text-white uppercase">
                      {act.category}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#222222] truncate">{act.name}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#DD9F2A]/20 text-[#222222] border border-[#DD9F2A]/30 shrink-0">
                        {act.tag}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666]">
                      <span className="flex items-center gap-1 text-[#2C5E3B] font-bold">
                        <MapPin className="w-3 h-3" />
                        {act.city}, {act.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#777777]" />
                        {act.durationHours} Hours ({act.bestTime || "Morning"})
                      </span>
                      <span className="flex items-center gap-1 text-[#DD9F2A] font-black">
                        <Star className="w-3 h-3 fill-[#DD9F2A]" />
                        {act.rating} ({act.reviewsCount} reviews)
                      </span>
                    </div>

                    <p className="text-xs text-[#555555] line-clamp-1 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E6E4DC] shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-[#777777] font-semibold">Estimated Cost</div>
                    <div className="text-lg font-black text-[#2C5E3B]">${act.cost}</div>
                  </div>

                  <MagneticButton
                    variant={isAdded ? "secondary" : "amber"}
                    size="sm"
                    onClick={() => handleAddActivity(act)}
                    glow={!isAdded}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#2C5E3B]" />
                        <span>Added to Day {selectedDayNumber}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add to Trip</span>
                      </>
                    )}
                  </MagneticButton>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
