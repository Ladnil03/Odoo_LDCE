"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  MapPin,
  Plus,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Card, Eyebrow, Button, Reveal } from "../UiBits";

export const CreateTripScreen: React.FC = () => {
  const { navigateTo, createTrip, cities, showToast, setActiveTripId } = useApp();

  const [tripName, setTripName] = useState("Swiss Alps Alpine Escape");
  const [selectedCity, setSelectedCity] = useState(cities[0]?.name || "Interlaken");
  const [startDate, setStartDate] = useState("2024-06-10");
  const [endDate, setEndDate] = useState("2024-06-18");
  const [description, setDescription] = useState(
    "Multi-city alpine expedition featuring panoramic train transfers, day hikes, and local culinary experiences."
  );
  const [estimatedBudget, setEstimatedBudget] = useState(2400);
  const [coverPhoto, setCoverPhoto] = useState(
    "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cities.length > 0) {
      if (!selectedCity || selectedCity === "Interlaken") {
        setSelectedCity(cities[0].name);
      }
      if (cities[0].image && (!coverPhoto || coverPhoto.includes("unsplash"))) {
        setCoverPhoto(cities[0].image);
      }
    }
  }, [cities]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newTrip = await createTrip({
        title: tripName,
        destination: selectedCity,
        description,
        startDate,
        endDate,
        estimatedBudget: Number(estimatedBudget),
        coverImage: coverPhoto,
      });

      if (newTrip && newTrip.id) {
        setActiveTripId(newTrip.id);
        showToast("Trip Created!", "Redirecting to your itinerary builder...", "success");
        navigateTo("itinerary-builder", newTrip.id);
      }
    } catch (err: any) {
      showToast("Creation failed", err?.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] py-8 px-4 sm:px-6 lg:px-8 paper">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[var(--surface-paper)] hairline text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent-pop)]" />
            <span className="font-semibold">Step 1 — Create Itinerary Blueprint</span>
          </div>
          <span className="text-[11px] text-[var(--ink-tertiary)] font-mono">AUTOMATED BUDGET SYNC</span>
        </div>

        <Reveal>
          <Card className="p-8 sm:p-10 space-y-8">
            <div className="border-b border-[var(--border-hairline)] pb-6">
              <Eyebrow className="mb-1 text-[var(--accent-pop)]">New Expedition</Eyebrow>
              <h1 className="display text-[32px] sm:text-[38px] text-[var(--ink-primary)]">
                Plan a Multi-City Trip
              </h1>
              <p className="text-[14px] text-[var(--ink-tertiary)] mt-1 max-w-prose">
                Define the primary destination, travel schedule, and baseline budget. You will assign stopovers and activity slots in the next step.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1.5 uppercase tracking-wider">
                    Journey Title
                  </label>
                  <input
                    type="text"
                    required
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="e.g. Summer in Swiss Alps"
                    className="w-full px-4 py-2.5 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1.5 uppercase tracking-wider">
                    Primary Destination
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] cursor-pointer focus:outline-none"
                  >
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}, {city.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1.5 uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1.5 uppercase tracking-wider">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1.5 uppercase tracking-wider">
                    Target Budget ($ USD)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1.5 uppercase tracking-wider">
                  Expedition Highlights & Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on travel companions, key landmarks, accommodation preferences..."
                  className="w-full p-3.5 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-2 uppercase tracking-wider">
                  Cover Photo Selection
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cities.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => c.image && setCoverPhoto(c.image)}
                      className={`relative rounded-xl overflow-hidden h-20 cursor-pointer hairline transition-all ${
                        coverPhoto === c.image
                          ? "ring-2 ring-[var(--ink-primary)]"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                        <span className="text-[11px] font-bold text-white truncate">{c.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border-hairline)] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigateTo("home")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                >
                  <span>Build Stops & Timeline</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </Reveal>
      </div>
    </div>
  );
};
