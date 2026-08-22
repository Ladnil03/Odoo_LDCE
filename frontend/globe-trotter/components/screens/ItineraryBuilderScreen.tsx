"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  MapPin,
  Plus,
  Trash2,
  Eye,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, Eyebrow, Button, Tag, StatPill, EmptyState, Reveal } from "../UiBits";
import { formatCurrency, formatDate } from "@/lib/format";

export const ItineraryBuilderScreen: React.FC = () => {
  const {
    activeTrip,
    trips,
    setActiveTripId,
    itinerary,
    itineraryLoading,
    itineraryTripName,
    itineraryTotal,
    refreshItinerary,
    addStop,
    removeStop,
    cities,
    assignActivity,
    removeActivity,
    budget,
    refreshBudget,
    navigateTo,
    showToast,
  } = useApp();

  const currentTrip = activeTrip || trips[0];

  const [activeTab, setActiveTab] = useState<"stops" | "timeline" | "budget">("stops");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [isAddingStop, setIsAddingStop] = useState(false);

  useEffect(() => {
    if (currentTrip?.id) {
      refreshItinerary(currentTrip.id);
      refreshBudget(currentTrip.id);
    }
  }, [currentTrip?.id, refreshItinerary, refreshBudget]);

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrip || !selectedCityId) return;
    try {
      await addStop(currentTrip.id, selectedCityId);
      setIsAddingStop(false);
      setSelectedCityId("");
      showToast("Stop Added", "City leg added to your expedition.", "success");
    } catch (err: any) {
      showToast("Failed to add stop", err?.message, "error");
    }
  };

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

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] py-8 px-4 sm:px-6 lg:px-8 paper">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[var(--surface-paper)] hairline text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent-pop)]" />
            <span className="font-semibold">Itinerary Architecture Studio</span>
          </div>
          <span className="text-[11px] text-[var(--ink-tertiary)] font-mono">
            EXPEDITION: {currentTrip.title.toUpperCase()}
          </span>
        </div>

        {/* Trip Switcher & Summary Card */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Eyebrow className="mb-1">Active Journey</Eyebrow>
              <div className="flex items-center gap-3">
                <select
                  value={currentTrip.id}
                  onChange={(e) => setActiveTripId(e.target.value)}
                  className="bg-[var(--surface-paper)] text-[var(--ink-primary)] font-bold text-[16px] rounded-lg px-3 py-1.5 hairline cursor-pointer focus:outline-none"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.destination})
                    </option>
                  ))}
                </select>
                <Tag tone="accent">{currentTrip.durationDays} Days</Tag>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono">
                <div className="text-[11px] text-[var(--ink-tertiary)]">Calculated Total</div>
                <div className="text-[20px] font-bold text-[var(--ink-primary)]">
                  {formatCurrency(budget?.totalCost || itineraryTotal || currentTrip.estimatedBudget || 0)}
                </div>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => navigateTo("itinerary-view", currentTrip.id)}
              >
                <Eye className="w-4 h-4" />
                <span>Read-Only View</span>
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-hairline)]">
            <button
              onClick={() => setActiveTab("stops")}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === "stops"
                  ? "bg-[var(--ink-primary)] text-white"
                  : "text-[var(--ink-secondary)] hover:bg-[var(--surface-sunken)]"
              }`}
            >
              City Stops ({itinerary.length})
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === "timeline"
                  ? "bg-[var(--ink-primary)] text-white"
                  : "text-[var(--ink-secondary)] hover:bg-[var(--surface-sunken)]"
              }`}
            >
              Day-by-Day Timeline
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === "budget"
                  ? "bg-[var(--ink-primary)] text-white"
                  : "text-[var(--ink-secondary)] hover:bg-[var(--surface-sunken)]"
              }`}
            >
              Budget Snapshot
            </button>
          </div>
        </Card>

        {/* TAB 1: City Stops */}
        {activeTab === "stops" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Eyebrow className="mb-0.5">Route Stops</Eyebrow>
                <h3 className="text-[20px] font-bold text-[var(--ink-primary)]">Cities in this Expedition</h3>
              </div>

              <Button variant="primary" size="sm" onClick={() => setIsAddingStop(true)}>
                <Plus className="w-4 h-4" />
                <span>Add Stopover</span>
              </Button>
            </div>

            {/* Add Stop Form */}
            {isAddingStop && (
              <Card className="p-5 border-[var(--ink-primary)] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-[var(--ink-primary)]">Select Stopover City</h4>
                  <button
                    onClick={() => setIsAddingStop(false)}
                    className="text-[12px] text-[var(--ink-tertiary)] hover:text-[var(--ink-primary)]"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleAddStop} className="flex gap-3">
                  <select
                    required
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] cursor-pointer focus:outline-none"
                  >
                    <option value="">Select city from catalog...</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.country} ({c.region})
                      </option>
                    ))}
                  </select>

                  <Button type="submit" variant="primary" size="md">
                    Confirm Stop
                  </Button>
                </form>
              </Card>
            )}

            {itinerary.length === 0 ? (
              <Card className="p-8 text-center">
                <MapPin className="w-8 h-8 text-[var(--ink-tertiary)] mx-auto mb-2" />
                <h4 className="text-[15px] font-bold text-[var(--ink-primary)]">No stops added yet</h4>
                <p className="text-[13px] text-[var(--ink-tertiary)] mt-1">
                  Add the first destination or layover city to generate day schedules.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {itinerary.map((stop, idx) => (
                  <Card
                    key={stop.stopId}
                    className="p-5 flex items-center justify-between hover:border-[var(--ink-primary)] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[var(--surface-sunken)] hairline flex items-center justify-center font-mono text-[12px] font-bold text-[var(--ink-secondary)]">
                        {idx + 1}
                      </div>

                      <div>
                        <div className="text-[16px] font-bold text-[var(--ink-primary)]">
                          {stop.cityName}
                        </div>
                        <div className="text-[12px] text-[var(--ink-tertiary)]">
                          {stop.cityCountry || "Destination Leg"} • {stop.days.length} Days allocated
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[13px] font-bold text-[var(--ink-primary)]">
                        {formatCurrency(stop.stopTotal || 0)}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStop(currentTrip.id, stop.stopId)}
                        className="text-rose-600 hover:bg-rose-50"
                        title="Remove Stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Day-by-Day Timeline */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Eyebrow className="mb-0.5">Chronology</Eyebrow>
                <h3 className="text-[20px] font-bold text-[var(--ink-primary)]">Day-wise Itinerary Grid</h3>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTo("search")}
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-pop)]" />
                <span>Browse Activity Catalog</span>
              </Button>
            </div>

            {itinerary.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-8 h-8 text-[var(--ink-tertiary)] mx-auto mb-2" />
                <h4 className="text-[15px] font-bold text-[var(--ink-primary)]">Timeline not populated</h4>
                <p className="text-[13px] text-[var(--ink-tertiary)] mt-1">
                  Add stops in the &quot;City Stops&quot; tab to build the day-wise itinerary timeline.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {itinerary.map((stop) => (
                  <div key={stop.stopId} className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-[var(--border-hairline)]">
                      <MapPin className="w-4 h-4 text-[var(--accent-pop)]" />
                      <h4 className="text-[16px] font-bold text-[var(--ink-primary)]">
                        {stop.cityName} ({stop.cityCountry})
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {stop.days.map((day, dayIdx) => (
                        <Card key={dayIdx} className="p-4 space-y-3">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="font-bold text-[var(--ink-primary)] font-mono">
                              Day {dayIdx + 1} {day.dayDate ? `— ${formatDate(day.dayDate)}` : ""}
                            </span>
                            <span className="font-mono text-[var(--ink-tertiary)]">
                              Day Total: {formatCurrency(day.dayTotal || 0)}
                            </span>
                          </div>

                          {day.activities.length === 0 ? (
                            <div className="p-3 rounded-lg bg-[var(--surface-paper)] text-center text-[11px] text-[var(--ink-tertiary)]">
                              No activities scheduled for this day yet. Add via Catalog or Search.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {day.activities.map((act) => (
                                <div
                                  key={act.id}
                                  className="p-2.5 rounded-lg bg-[var(--surface-paper)] hairline flex items-center justify-between text-[12px]"
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-[var(--ink-tertiary)]" />
                                    <span className="font-mono text-[11px] text-[var(--ink-tertiary)]">
                                      {act.scheduledTime || "Anytime"}
                                    </span>
                                    <span className="font-semibold text-[var(--ink-primary)]">
                                      {act.title}
                                    </span>
                                    <Tag>{act.category || "activity"}</Tag>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-[var(--ink-primary)]">
                                      {formatCurrency(act.cost || 0)}
                                    </span>
                                    <button
                                      onClick={() => removeActivity(currentTrip.id, act.id)}
                                      className="text-[var(--ink-tertiary)] hover:text-rose-600"
                                      title="Remove from day"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Budget Snapshot */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Eyebrow className="mb-0.5">Financial Audit</Eyebrow>
                <h3 className="text-[20px] font-bold text-[var(--ink-primary)]">Trip Expense Breakdown</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4">
                <StatPill label="Total Cost" value={formatCurrency(budget?.totalCost || 0)} />
              </Card>
              <Card className="p-4">
                <StatPill label="Daily Budget" value={formatCurrency(budget?.dailyBudget || 0)} />
              </Card>
              <Card className="p-4">
                <StatPill label="Activity Share" value={formatCurrency(budget?.byCategory.activity || 0)} />
              </Card>
              <Card className="p-4">
                <StatPill label="Food & Dining" value={formatCurrency(budget?.byCategory.food || 0)} />
              </Card>
            </div>

            {budget?.byCategory && (
              <Card className="p-6 space-y-4">
                <h4 className="text-[15px] font-bold text-[var(--ink-primary)]">Category Allocation</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-3 rounded-xl bg-[var(--surface-paper)] hairline">
                    <span className="eyebrow block mb-1">Transport</span>
                    <span className="font-mono text-[16px] font-bold text-[var(--ink-primary)]">
                      {formatCurrency(budget.byCategory.transport)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-paper)] hairline">
                    <span className="eyebrow block mb-1">Stay / Hotels</span>
                    <span className="font-mono text-[16px] font-bold text-[var(--ink-primary)]">
                      {formatCurrency(budget.byCategory.stay)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-paper)] hairline">
                    <span className="eyebrow block mb-1">Activities</span>
                    <span className="font-mono text-[16px] font-bold text-[var(--ink-primary)]">
                      {formatCurrency(budget.byCategory.activity)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-paper)] hairline">
                    <span className="eyebrow block mb-1">Food & Meals</span>
                    <span className="font-mono text-[16px] font-bold text-[var(--ink-primary)]">
                      {formatCurrency(budget.byCategory.food)}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
