"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  ArrowDown,
  Share2,
  Clock,
  PieChart,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Card, Eyebrow, Button, Tag, StatPill, EmptyState, Reveal } from "../UiBits";
import { formatCurrency, formatDate } from "@/lib/format";

export const ItineraryViewScreen: React.FC = () => {
  const {
    activeTrip,
    trips,
    setActiveTripId,
    itinerary,
    itineraryTotal,
    refreshItinerary,
    budget,
    refreshBudget,
    openSharedTrip,
    shareTrip,
    navigateTo,
  } = useApp();

  const currentTrip = activeTrip || trips[0];
  const [selectedDayTab, setSelectedDayTab] = useState<number>(0);

  useEffect(() => {
    if (currentTrip?.id) {
      refreshItinerary(currentTrip.id);
      refreshBudget(currentTrip.id);
    }
  }, [currentTrip?.id, refreshItinerary, refreshBudget]);

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] p-8 flex items-center justify-center paper">
        <EmptyState
          icon={<Compass className="w-8 h-8" />}
          title="No Trip Selected"
          description="Create a trip first or pick one from your portfolio."
          action={
            <Button variant="primary" size="md" onClick={() => navigateTo("create-trip")}>
              + Create Trip
            </Button>
          }
        />
      </div>
    );
  }

  const allDays = itinerary.flatMap((stop) =>
    stop.days.map((day) => ({
      cityName: stop.cityName,
      cityCountry: stop.cityCountry,
      day,
    })),
  );

  const activeDayObj = allDays[selectedDayTab] || allDays[0];
  const totalCost = budget?.totalCost || itineraryTotal || currentTrip.estimatedBudget || 0;

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] py-8 px-4 sm:px-6 lg:px-8 paper">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[var(--surface-paper)] hairline text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent-pop)]" />
            <span className="font-semibold">Live Itinerary Summary & Day-Wise Breakdown</span>
          </div>
          <span className="text-[11px] text-[var(--ink-tertiary)] font-mono">
            CALCULATED BUDGET: {formatCurrency(totalCost)}
          </span>
        </div>

        {/* Journey Header Card */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[12px] text-[var(--ink-tertiary)] mb-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent-pop)]" />
                <span>
                  {currentTrip.destination} • {currentTrip.durationDays} Days
                </span>
              </div>
              <h1 className="display text-[28px] sm:text-[34px] text-[var(--ink-primary)]">
                {currentTrip.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={currentTrip.id}
                onChange={(e) => setActiveTripId(e.target.value)}
                className="bg-[var(--surface-paper)] text-[var(--ink-primary)] font-bold text-[13px] rounded-lg px-3 py-2 hairline cursor-pointer focus:outline-none"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="md"
                onClick={async () => {
                  await shareTrip(currentTrip.id);
                  openSharedTrip(currentTrip);
                }}
              >
                <Share2 className="w-4 h-4" />
                <span>Share Itinerary</span>
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => navigateTo("itinerary-builder", currentTrip.id)}
              >
                <span>Edit Itinerary</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Day Selector Ribbon */}
        {allDays.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {allDays.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayTab(idx)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all shrink-0 cursor-pointer ${
                  selectedDayTab === idx
                    ? "bg-[var(--ink-primary)] text-white shadow-sm"
                    : "bg-[var(--surface-elevated)] hairline text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                }`}
              >
                Day {idx + 1} ({item.cityName})
              </button>
            ))}
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Day Activities */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                <div>
                  <h3 className="text-[18px] font-bold text-[var(--ink-primary)]">
                    Day {selectedDayTab + 1}: {activeDayObj?.cityName || currentTrip.destination}
                  </h3>
                  <p className="text-[12px] text-[var(--ink-tertiary)] font-mono">
                    {activeDayObj?.day.dayDate ? formatDate(activeDayObj.day.dayDate) : "Scheduled Stop"}
                  </p>
                </div>
                <span className="font-mono text-[14px] font-bold text-[var(--ink-primary)]">
                  Day Total: {formatCurrency(activeDayObj?.day.dayTotal || 0)}
                </span>
              </div>

              {activeDayObj?.day.activities.length === 0 || !activeDayObj ? (
                <div className="p-8 text-center text-[13px] text-[var(--ink-tertiary)]">
                  No scheduled activities on this date yet. Open the builder to assign activities.
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {activeDayObj.day.activities.map((act, actIdx) => {
                    const isLast = actIdx === activeDayObj.day.activities.length - 1;
                    return (
                      <div key={act.id} className="space-y-3">
                        <div className="p-4 rounded-xl bg-[var(--surface-paper)] hairline flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-[var(--accent-pop)] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {act.scheduledTime || "Anytime"}
                              </span>
                              <Tag>{act.category || "activity"}</Tag>
                            </div>
                            <h4 className="text-[15px] font-bold text-[var(--ink-primary)]">{act.title}</h4>
                            {act.description && (
                              <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">
                                {act.description}
                              </p>
                            )}
                          </div>

                          <span className="font-mono text-[14px] font-bold text-[var(--ink-primary)] shrink-0">
                            {formatCurrency(act.cost)}
                          </span>
                        </div>

                        {!isLast && (
                          <div className="flex justify-center my-1">
                            <ArrowDown className="w-3.5 h-3.5 text-[var(--ink-tertiary)]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Budget Snapshot Sidepanel */}
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[var(--accent-pop)]" />
                  <h3 className="text-[16px] font-bold text-[var(--ink-primary)]">Budget Snapshot</h3>
                </div>
                <Tag tone="accent">SYNCED</Tag>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[var(--surface-paper)] hairline flex items-center justify-between text-[13px]">
                  <span className="text-[var(--ink-secondary)]">Transport & Transit</span>
                  <span className="font-mono font-bold text-[var(--ink-primary)]">
                    {formatCurrency(budget?.byCategory.transport || 0)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-paper)] hairline flex items-center justify-between text-[13px]">
                  <span className="text-[var(--ink-secondary)]">Lodging & Stays</span>
                  <span className="font-mono font-bold text-[var(--ink-primary)]">
                    {formatCurrency(budget?.byCategory.stay || 0)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-paper)] hairline flex items-center justify-between text-[13px]">
                  <span className="text-[var(--ink-secondary)]">Activities & Tours</span>
                  <span className="font-mono font-bold text-[var(--accent-positive)]">
                    {formatCurrency(budget?.byCategory.activity || 0)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-paper)] hairline flex items-center justify-between text-[13px]">
                  <span className="text-[var(--ink-secondary)]">Food & Dining</span>
                  <span className="font-mono font-bold text-[var(--ink-primary)]">
                    {formatCurrency(budget?.byCategory.food || 0)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
                <span className="text-[12px] text-[var(--ink-tertiary)]">Total Computed</span>
                <span className="font-mono text-[18px] font-bold text-[var(--ink-primary)]">
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
