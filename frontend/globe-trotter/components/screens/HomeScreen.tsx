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
  Calendar,
  DollarSign,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Globe2,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { TiltCard } from "../3d/TiltCard";
import { MagneticButton } from "../3d/MagneticButton";

export const HomeScreen: React.FC = () => {
  const {
    navigateTo,
    trips,
    cities,
    user,
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    sortByOption,
    setSortByOption,
    groupByOption,
    setGroupByOption,
    setActiveTripId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"all" | "europe" | "asia" | "americas">("all");

  const regions = [
    { id: "all", name: "All Regions", count: cities.length },
    { id: "europe", name: "Europe", count: 2 },
    { id: "asia", name: "Asia", count: 2 },
    { id: "americas", name: "Americas", count: 1 },
  ];

  const filteredCities = cities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion =
      activeTab === "all" || c.region.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesRegion;
  });

  const recentTrips = trips.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] pb-20">
      {/* Wireframe Tag Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs text-[#2C5E3B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C5E3B]" />
            <span className="font-bold">Wireframe Screen 3: Main Landing Page / Dashboard</span>
          </div>
          <span className="text-[11px] text-[#555555] hidden sm:inline">
            Interactive Banner • Regional Hubs • Previous Trips • Quick Filters
          </span>
        </div>
      </div>

      {/* Main Banner Image / Hero Section (Matching Wireframe 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative rounded-3xl overflow-hidden border border-[#E6E4DC] shadow-xl min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-10 lg:p-12">
          {/* Background Image with Warm Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 hover:scale-100"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600&auto=format&fit=crop&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E4329] via-[#1E4329]/70 to-[#1E4329]/20" />

          {/* Banner Content */}
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DD9F2A]/30 text-[#FAF9F6] border border-[#DD9F2A]/50 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#DD9F2A]" />
              <span>Explore 180+ Curated World Itineraries</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Design Your Next{" "}
              <span className="text-[#DD9F2A]">
                Unforgettable
              </span>{" "}
              Global Journey.
            </h1>

            <p className="text-sm sm:text-base text-slate-100 max-w-2xl leading-relaxed">
              Multi-city stopovers, physical activity timelines, automated day-wise budgeting, and
              collaborative community travel itineraries.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <MagneticButton
                variant="amber"
                size="lg"
                onClick={() => navigateTo("create-trip")}
                glow
              >
                <Plus className="w-5 h-5" />
                <span>+ Plan a Trip (Screen 4)</span>
              </MagneticButton>

              <MagneticButton
                variant="glass"
                size="lg"
                onClick={() => navigateTo("my-trips")}
              >
                <span>View My Trips ({trips.length})</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          </div>

          {/* Quick Stat Highlights */}
          <div className="hidden lg:grid grid-cols-3 gap-4 absolute bottom-10 right-10 max-w-md z-10">
            <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/40 text-right shadow-lg">
              <div className="text-lg font-black text-[#2C5E3B]">{user.totalTrips} Trips</div>
              <div className="text-[11px] text-[#555555] font-semibold">Personal Logged Journeys</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/40 text-right shadow-lg">
              <div className="text-lg font-black text-[#DD9F2A]">{user.countriesVisited} Countries</div>
              <div className="text-[11px] text-[#555555] font-semibold">Explored Continents</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/40 text-right shadow-lg">
              <div className="text-lg font-black text-[#2C5E3B]">${user.totalSavings}</div>
              <div className="text-[11px] text-[#555555] font-semibold">Budget Optimized</div>
            </div>
          </div>
        </div>
      </section>

      {/* Wireframe Search Bar with Group By, Filter, and Sort By Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="p-4 rounded-3xl bg-white border border-[#E6E4DC] shadow-md flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bar .... (e.g. Paris, Tokyo, Alps, Paragliding, Museums)"
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B] transition-all"
            />
          </div>

          {/* Group By Control */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[130px]">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#777777]">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <select
                value={groupByOption}
                onChange={(e) => setGroupByOption(e.target.value)}
                className="w-full pl-8 pr-6 py-2 bg-[#FAF9F6] border border-[#E6E4DC] text-xs rounded-xl text-[#222222] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2C5E3B] cursor-pointer"
              >
                <option value="none">Group by: None</option>
                <option value="region">Group by: Region</option>
                <option value="budget">Group by: Budget</option>
                <option value="status">Group by: Status</option>
              </select>
            </div>

            {/* Filter Control */}
            <div className="relative min-w-[120px]">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#777777]">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full pl-8 pr-6 py-2 bg-[#FAF9F6] border border-[#E6E4DC] text-xs rounded-xl text-[#222222] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2C5E3B] cursor-pointer"
              >
                <option value="All">Filter: All Regions</option>
                <option value="Europe">Filter: Europe</option>
                <option value="Asia">Filter: Asia</option>
                <option value="Americas">Filter: Americas</option>
                <option value="Africa">Filter: Africa</option>
              </select>
            </div>

            {/* Sort By Control */}
            <div className="relative min-w-[130px]">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#777777]">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
              <select
                value={sortByOption}
                onChange={(e) => setSortByOption(e.target.value)}
                className="w-full pl-8 pr-6 py-2 bg-[#FAF9F6] border border-[#E6E4DC] text-xs rounded-xl text-[#222222] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2C5E3B] cursor-pointer"
              >
                <option value="popular">Sort by: Popularity</option>
                <option value="cost-low">Sort: Cost (Low to High)</option>
                <option value="cost-high">Sort: Cost (High to Low)</option>
                <option value="duration">Sort: Duration</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Top Regional Selections (Matching Wireframe 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-[#222222] flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-[#2C5E3B]" />
              Top Regional Selections
            </h2>
            <p className="text-xs text-[#555555]">
              Browse world destinations and pre-mapped travel sectors
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E6E4DC] rounded-xl shadow-sm">
            {regions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setActiveTab(reg.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === reg.id
                    ? "bg-[#2C5E3B] text-white shadow-sm"
                    : "text-[#555555] hover:text-[#222222]"
                }`}
              >
                {reg.name}
              </button>
            ))}
          </div>
        </div>

        {/* Regional Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredCities.map((city) => (
            <TiltCard
              key={city.id}
              maxTilt={8}
              onClick={() => {
                setSearchQuery(city.name);
                navigateTo("search");
              }}
              className="bg-white border border-[#E6E4DC] group cursor-pointer h-48 relative shadow-sm"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E4329] via-[#1E4329]/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <div className="text-xs font-bold text-white leading-tight group-hover:text-[#DD9F2A] transition-colors">
                  {city.name}
                </div>
                <div className="text-[10px] text-slate-200 flex items-center justify-between mt-0.5">
                  <span>{city.country}</span>
                  <span className="font-bold text-[#DD9F2A]">{city.costIndex}</span>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Previous Trips Section (Matching Wireframe 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-[#222222] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2C5E3B]" />
              Previous Trips & Active Itineraries
            </h2>
            <p className="text-xs text-[#555555]">
              Pick up where you left off or clone an existing plan
            </p>
          </div>

          <button
            onClick={() => navigateTo("my-trips")}
            className="text-xs font-bold text-[#2C5E3B] hover:text-[#1E4329] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Trips</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentTrips.map((trip) => {
            const isOngoing = trip.status === "ongoing";
            return (
              <TiltCard
                key={trip.id}
                maxTilt={5}
                className="bg-white border border-[#E6E4DC] shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                          isOngoing
                            ? "bg-[#2C5E3B] text-white border-[#2C5E3B]"
                            : trip.status === "upcoming"
                            ? "bg-[#DD9F2A] text-[#222222] border-[#DD9F2A]"
                            : "bg-white text-[#555555] border-[#E6E4DC]"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-xs font-black text-[#2C5E3B] shadow-sm">
                      ${trip.estimatedBudget}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] text-[#2C5E3B] mb-1 font-bold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{trip.destination}, {trip.country}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#222222] mb-2 line-clamp-1">{trip.title}</h3>
                    <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed mb-4">
                      {trip.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-[#555555] pt-2 border-t border-[#E6E4DC]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#2C5E3B]" />
                        <span>{trip.startDate} ({trip.durationDays}d)</span>
                      </div>
                      <div className="text-[#2C5E3B] font-bold">
                        {trip.sections.length} Sections
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActiveTripId(trip.id);
                      navigateTo("itinerary-view", trip.id);
                    }}
                    className="w-full py-2 rounded-xl bg-[#2C5E3B]/10 hover:bg-[#2C5E3B] text-[#2C5E3B] hover:text-white font-bold text-xs border border-[#2C5E3B]/30 text-center transition-all cursor-pointer"
                  >
                    View Plan (Screen 9)
                  </button>

                  <button
                    onClick={() => {
                      setActiveTripId(trip.id);
                      navigateTo("itinerary-builder", trip.id);
                    }}
                    className="w-full py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#222222] font-semibold text-xs border border-[#E6E4DC] text-center transition-colors cursor-pointer"
                  >
                    Edit Sections
                  </button>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* Plan a trip floating CTA at bottom right (Matching Wireframe 3) */}
      <div className="fixed bottom-6 right-6 z-30">
        <MagneticButton
          variant="amber"
          size="lg"
          onClick={() => navigateTo("create-trip")}
          className="shadow-2xl shadow-[#DD9F2A]/40"
          glow
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">+ Plan a Trip</span>
        </MagneticButton>
      </div>
    </div>
  );
};
