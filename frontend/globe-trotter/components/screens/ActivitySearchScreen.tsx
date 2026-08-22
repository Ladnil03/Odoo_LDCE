"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Search,
  Clock,
  Plus,
  Check,
  Sparkles,
} from "lucide-react";
import { Card, Eyebrow, Button, Tag, EmptyState, Reveal } from "../UiBits";
import { catalogApi } from "@/lib/api";
import { mapActivity, formatCurrency } from "@/lib/format";
import { ActivityItem } from "@/lib/types";

export const ActivitySearchScreen: React.FC = () => {
  const {
    cities,
    activeTrip,
    trips,
    itinerary,
    assignActivity,
    showToast,
    navigateTo,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedActivityIds, setAddedActivityIds] = useState<string[]>([]);

  const currentTrip = activeTrip || trips[0];
  const stops = itinerary.length > 0 ? itinerary : [];

  useEffect(() => {
    let active = true;
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const res = await catalogApi.searchActivities({
          query: searchQuery || undefined,
          city_id: selectedCityId || undefined,
        });
        if (active) {
          setActivitiesList((res.items || []).map(mapActivity));
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchActivities, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCityId]);

  const filtered = activitiesList.filter((act) => {
    if (selectedCategory === "All") return true;
    return act.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleAdd = async (act: ActivityItem) => {
    if (!currentTrip) {
      showToast("Select a Trip", "Please create or select an active trip first.", "warning");
      return;
    }
    const stopId = stops[0]?.stopId;
    if (!stopId) {
      showToast("Add a City Stop First", "Please add a stop in Itinerary Builder before scheduling activities.", "warning");
      navigateTo("itinerary-builder", currentTrip.id);
      return;
    }

    try {
      await assignActivity(currentTrip.id, stopId, act.id);
      setAddedActivityIds((prev) => [...prev, act.id]);
      showToast("Activity Scheduled", `"${act.name}" added to ${stops[0].cityName}.`, "success");
    } catch (err: any) {
      showToast("Assignment failed", err?.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] py-8 px-4 sm:px-6 lg:px-8 paper">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[var(--surface-paper)] hairline text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent-pop)]" />
            <span className="font-semibold">Curated Experiences & Excursions Database</span>
          </div>
          <span className="text-[11px] text-[var(--ink-tertiary)] font-mono">
            FASTAPI FULL-TEXT SEARCH
          </span>
        </div>

        {/* Search Bar & Filters */}
        <Card className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities by keyword (e.g., Louvre, Paragliding, Ramen, Temple, Wine)..."
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="px-3 py-2 bg-[var(--surface-paper)] hairline text-[12px] font-medium rounded-lg text-[var(--ink-primary)] cursor-pointer"
              >
                <option value="">All Destinations</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-[var(--surface-paper)] hairline text-[12px] font-medium rounded-lg text-[var(--ink-primary)] cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="activity">Activities</option>
                <option value="culture">Culture</option>
                <option value="food">Food & Dining</option>
                <option value="transport">Transport</option>
                <option value="stay">Lodging</option>
              </select>
            </div>
          </div>

          {currentTrip && (
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-hairline)] text-[12px]">
              <span className="text-[var(--ink-secondary)]">
                Active Expedition Target: <strong>{currentTrip.title}</strong>
              </span>
              <span className="text-[var(--ink-tertiary)] font-mono">
                {stops.length > 0 ? `Target Leg: ${stops[0].cityName}` : "No stops configured yet"}
              </span>
            </div>
          )}
        </Card>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[20px] font-bold text-[var(--ink-primary)]">
              Activity Results ({filtered.length})
            </h3>
            {isLoading && <span className="text-[12px] text-[var(--ink-tertiary)] animate-pulse font-mono">Querying catalog...</span>}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-8 h-8" />}
              title="No activities match query"
              description="Try broader search keywords or reset the destination filter."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((act) => {
                const isAdded = addedActivityIds.includes(act.id);
                return (
                  <Card key={act.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-[var(--ink-primary)] transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Tag tone="default">{act.category.toUpperCase()}</Tag>
                        <span className="font-mono text-[14px] font-bold text-[var(--ink-primary)]">
                          {formatCurrency(act.cost)}
                        </span>
                      </div>

                      <h4 className="text-[16px] font-bold text-[var(--ink-primary)]">{act.name}</h4>

                      {act.description && (
                        <p className="text-[13px] text-[var(--ink-secondary)] line-clamp-2 leading-relaxed">
                          {act.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-[12px]">
                      <span className="text-[var(--ink-tertiary)] flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {act.durationMinutes ? `${act.durationMinutes}m duration` : "Flexible"}
                      </span>

                      <Button
                        variant={isAdded ? "outline" : "primary"}
                        size="sm"
                        onClick={() => handleAdd(act)}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Assigned</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Journey</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
