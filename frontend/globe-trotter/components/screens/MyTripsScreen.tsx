"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Search,
  Layers,
  MapPin,
  Calendar,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { TiltCard } from "../3d/TiltCard";
import { MagneticButton } from "../3d/MagneticButton";
import { Trip } from "@/lib/types";

export const MyTripsScreen: React.FC = () => {
  const {
    trips,
    deleteTrip,
    navigateTo,
    setActiveTripId,
    setSharedModalTrip,
  } = useApp();

  const [searchFilter, setSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "upcoming" | "completed">("all");

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.country.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesTab = activeTab === "all" || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const ongoingTrips = filteredTrips.filter((t) => t.status === "ongoing");
  const upcomingTrips = filteredTrips.filter((t) => t.status === "upcoming");
  const completedTrips = filteredTrips.filter((t) => t.status === "completed");

  const renderTripCard = (trip: Trip) => {
    const isOngoing = trip.status === "ongoing";
    const isUpcoming = trip.status === "upcoming";

    return (
      <TiltCard
        key={trip.id}
        maxTilt={4}
        className="p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md hover:border-[#2C5E3B] transition-all flex flex-col md:flex-row gap-5 items-stretch"
      >
        {/* Cover Photo */}
        <div className="relative w-full md:w-56 h-44 rounded-2xl overflow-hidden shrink-0">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2.5 left-2.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                isOngoing
                  ? "bg-[#2C5E3B] text-white border-[#2C5E3B]"
                  : isUpcoming
                  ? "bg-[#DD9F2A] text-[#222222] border-[#DD9F2A]"
                  : "bg-white text-[#555555] border-[#E6E4DC]"
              }`}
            >
              {trip.status}
            </span>
          </div>

          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-[11px] font-black text-[#2C5E3B] shadow-sm">
            ${trip.estimatedBudget}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-xs text-[#2C5E3B] font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {trip.destination}, {trip.country}
                </span>
              </div>

              {trip.companionAvatars && trip.companionAvatars.length > 0 && (
                <div className="flex -space-x-2">
                  {trip.companionAvatars.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Travel Companion"
                      className="w-5 h-5 rounded-full ring-2 ring-white object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            <h3 className="text-lg font-black text-[#222222] leading-snug mb-1">{trip.title}</h3>

            <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed mb-3">
              {trip.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-3 border-t border-[#E6E4DC] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-[#666666]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#2C5E3B]" />
                <strong className="text-[#222222]">{trip.startDate}</strong> ({trip.durationDays} days)
              </span>

              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#DD9F2A]" />
                <strong className="text-[#222222]">{trip.sections.length}</strong> Sections
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTripId(trip.id);
                  navigateTo("itinerary-view", trip.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#2C5E3B] hover:bg-[#1E4329] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#2C5E3B]/20 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#DD9F2A]" />
                <span>View (Screen 9)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTripId(trip.id);
                  navigateTo("itinerary-builder", trip.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#222222] font-semibold text-xs border border-[#E6E4DC] flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#2C5E3B]" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setSharedModalTrip(trip)}
                className="p-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#2C5E3B] border border-[#E6E4DC] cursor-pointer"
                title="Share Trip"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => deleteTrip(trip.id)}
                className="p-1.5 rounded-xl bg-[#FAF9F6] hover:bg-rose-50 text-[#888888] hover:text-rose-600 border border-[#E6E4DC] cursor-pointer"
                title="Delete Trip"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </TiltCard>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Wireframe Tag Banner */}
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs text-[#2C5E3B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C5E3B]" />
            <span className="font-bold">Wireframe Screen 6: User Trip Listing</span>
          </div>
          <span className="text-[11px] text-[#555555]">
            Categorized Sections: Ongoing • Up-coming • Completed
          </span>
        </div>

        {/* Header & Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search bar .... (Search by trip name, destination city, country)"
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
            />
          </div>

          {/* Filter Pills & CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-[#FAF9F6] rounded-2xl border border-[#E6E4DC]">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "all" ? "bg-[#2C5E3B] text-white" : "text-[#555555] hover:text-[#222222]"
                }`}
              >
                All ({trips.length})
              </button>
              <button
                onClick={() => setActiveTab("ongoing")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ongoing"
                    ? "bg-[#2C5E3B] text-white"
                    : "text-[#555555] hover:text-[#222222]"
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "upcoming"
                    ? "bg-[#DD9F2A] text-[#222222]"
                    : "text-[#555555] hover:text-[#222222]"
                }`}
              >
                Up-coming
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "completed"
                    ? "bg-[#EAE8E0] text-[#222222]"
                    : "text-[#555555] hover:text-[#222222]"
                }`}
              >
                Completed
              </button>
            </div>

            <MagneticButton
              variant="amber"
              size="sm"
              onClick={() => navigateTo("create-trip")}
              glow
            >
              <Plus className="w-4 h-4" />
              <span>+ Plan a Trip</span>
            </MagneticButton>
          </div>
        </div>

        {/* Section 1: Ongoing Trips */}
        {(activeTab === "all" || activeTab === "ongoing") && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-[#2C5E3B]/30">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2C5E3B] animate-pulse" />
              <h2 className="text-base font-black text-[#2C5E3B] uppercase tracking-wider">
                Ongoing Trips ({ongoingTrips.length})
              </h2>
            </div>

            {ongoingTrips.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#E6E4DC] text-center text-xs text-[#777777]">
                No active ongoing journeys right now.
              </div>
            ) : (
              <div className="space-y-4">{ongoingTrips.map(renderTripCard)}</div>
            )}
          </div>
        )}

        {/* Section 2: Up-coming Trips */}
        {(activeTab === "all" || activeTab === "upcoming") && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 pb-1 border-b border-[#DD9F2A]/40">
              <Calendar className="w-4 h-4 text-[#DD9F2A]" />
              <h2 className="text-base font-black text-[#222222] uppercase tracking-wider">
                Up-coming Trips ({upcomingTrips.length})
              </h2>
            </div>

            {upcomingTrips.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#E6E4DC] text-center text-xs text-[#777777]">
                No upcoming trips planned yet.
              </div>
            ) : (
              <div className="space-y-4">{upcomingTrips.map(renderTripCard)}</div>
            )}
          </div>
        )}

        {/* Section 3: Completed Trips */}
        {(activeTab === "all" || activeTab === "completed") && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E6E4DC]">
              <CheckCircle2 className="w-4 h-4 text-[#777777]" />
              <h2 className="text-base font-black text-[#666666] uppercase tracking-wider">
                Completed Trips ({completedTrips.length})
              </h2>
            </div>

            {completedTrips.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#E6E4DC] text-center text-xs text-[#777777]">
                No completed trips recorded yet.
              </div>
            ) : (
              <div className="space-y-4">{completedTrips.map(renderTripCard)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
