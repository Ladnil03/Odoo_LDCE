"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Search,
  MapPin,
  Calendar,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { Card, Eyebrow, Button, Tag, EmptyState, Reveal } from "../UiBits";
import { Trip } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/format";

export const MyTripsScreen: React.FC = () => {
  const {
    trips,
    deleteTrip,
    navigateTo,
    setActiveTripId,
    openSharedTrip,
    shareTrip,
  } = useApp();

  const [searchFilter, setSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "upcoming" | "completed">("all");

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesTab = activeTab === "all" || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const ongoingTrips = filteredTrips.filter((t) => t.status === "ongoing");
  const upcomingTrips = filteredTrips.filter((t) => t.status === "upcoming");
  const completedTrips = filteredTrips.filter((t) => t.status === "completed");

  const renderTripCard = (trip: Trip) => (
    <Card
      key={trip.id}
      className="p-6 space-y-4 hover:border-[var(--ink-primary)] transition-all flex flex-col md:flex-row gap-6 items-stretch"
    >
      <div className="relative w-full md:w-56 h-40 rounded-xl overflow-hidden bg-[var(--surface-sunken)] shrink-0">
        {trip.coverImage ? (
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--ink-tertiary)]">
            <Compass className="w-8 h-8" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <Tag tone={trip.status === "ongoing" ? "accent" : "default"}>
            {trip.status.toUpperCase()}
          </Tag>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[12px] text-[var(--ink-tertiary)] flex items-center gap-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-pop)]" />
              {trip.destination}
            </span>
            <span className="font-mono text-[14px] font-bold text-[var(--ink-primary)]">
              {formatCurrency(trip.estimatedBudget || 0)}
            </span>
          </div>

          <h3 className="text-[20px] font-bold text-[var(--ink-primary)] leading-snug">
            {trip.title}
          </h3>

          {trip.description && (
            <p className="text-[13px] text-[var(--ink-secondary)] line-clamp-2 leading-relaxed mt-1">
              {trip.description}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3 text-[12px]">
          <div className="text-[var(--ink-tertiary)] font-mono">
            {formatDate(trip.startDate)} — {formatDate(trip.endDate)} ({trip.durationDays} days)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTripId(trip.id);
                navigateTo("itinerary-view", trip.id);
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveTripId(trip.id);
                navigateTo("itinerary-builder", trip.id);
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Builder</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await shareTrip(trip.id);
                openSharedTrip(trip);
              }}
              title="Share Itinerary"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTrip(trip.id)}
              className="text-rose-600 hover:bg-rose-50"
              title="Delete Trip"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] py-8 px-4 sm:px-6 lg:px-8 paper">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[var(--surface-paper)] hairline text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent-pop)]" />
            <span className="font-semibold">Itinerary Portfolio Management</span>
          </div>
          <span className="text-[11px] text-[var(--ink-tertiary)] font-mono">
            {trips.length} REGISTERED JOURNEYS
          </span>
        </div>

        {/* Toolbar */}
        <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search your journeys by title or destination..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-[var(--surface-paper)] hairline rounded-lg">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                  activeTab === "all" ? "bg-[var(--surface-elevated)] text-[var(--ink-primary)] shadow-sm hairline" : "text-[var(--ink-secondary)]"
                }`}
              >
                All ({trips.length})
              </button>
              <button
                onClick={() => setActiveTab("ongoing")}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                  activeTab === "ongoing" ? "bg-[var(--surface-elevated)] text-[var(--ink-primary)] shadow-sm hairline" : "text-[var(--ink-secondary)]"
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                  activeTab === "upcoming" ? "bg-[var(--surface-elevated)] text-[var(--ink-primary)] shadow-sm hairline" : "text-[var(--ink-secondary)]"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                  activeTab === "completed" ? "bg-[var(--surface-elevated)] text-[var(--ink-primary)] shadow-sm hairline" : "text-[var(--ink-secondary)]"
                }`}
              >
                Completed
              </button>
            </div>

            <Button variant="primary" size="md" onClick={() => navigateTo("create-trip")}>
              <Plus className="w-4 h-4" />
              <span>Plan Trip</span>
            </Button>
          </div>
        </Card>

        {filteredTrips.length === 0 ? (
          <EmptyState
            icon={<Compass className="w-8 h-8" />}
            title="No matching itineraries found"
            description="Create your first custom expedition or adjust search filters."
            action={
              <Button variant="primary" size="md" onClick={() => navigateTo("create-trip")}>
                + Plan a New Trip
              </Button>
            }
          />
        ) : (
          <div className="space-y-8">
            {(activeTab === "all" || activeTab === "ongoing") && ongoingTrips.length > 0 && (
              <div className="space-y-4">
                <Eyebrow className="text-[var(--accent-pop)]">Active & Ongoing Journeys</Eyebrow>
                <div className="space-y-4">{ongoingTrips.map(renderTripCard)}</div>
              </div>
            )}

            {(activeTab === "all" || activeTab === "upcoming") && upcomingTrips.length > 0 && (
              <div className="space-y-4">
                <Eyebrow>Scheduled & Upcoming</Eyebrow>
                <div className="space-y-4">{upcomingTrips.map(renderTripCard)}</div>
              </div>
            )}

            {(activeTab === "all" || activeTab === "completed") && completedTrips.length > 0 && (
              <div className="space-y-4">
                <Eyebrow>Travel Archives</Eyebrow>
                <div className="space-y-4">{completedTrips.map(renderTripCard)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
