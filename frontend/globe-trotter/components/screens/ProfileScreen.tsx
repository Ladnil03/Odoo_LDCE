"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Mail,
  MapPin,
  Edit2,
  Check,
  Eye,
} from "lucide-react";
import { Card, Eyebrow, Button, Tag, Avatar, StatPill, Reveal } from "../UiBits";
import { formatCurrency } from "@/lib/format";

export const ProfileScreen: React.FC = () => {
  const { user, updateUser, switchRole, trips, navigateTo, setActiveTripId, showToast } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "Aarav");
  const [lastName, setLastName] = useState(user?.lastName || "Shah");
  const [bio, setBio] = useState(
    user?.bio || "Architect & nomad photographer. Passionate about alpine hikes and cultural routes."
  );
  const [city, setCity] = useState(user?.city || "Ahmedabad");
  const [country, setCountry] = useState(user?.country || "India");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      if (user.bio) setBio(user.bio);
      if (user.city) setCity(user.city);
      if (user.country) setCountry(user.country);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        firstName,
        lastName,
        bio,
        city,
        country,
      });
      setIsEditing(false);
      showToast("Profile Updated", "Your traveler profile has been saved.", "success");
    } catch (err: any) {
      showToast("Update Failed", err?.message, "error");
    }
  };

  const preplannedTrips = trips.filter((t) => t.status === "upcoming" || t.status === "ongoing");
  const previousTrips = trips.filter((t) => t.status === "completed");

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] py-8 px-4 sm:px-6 lg:px-8 paper">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[var(--surface-paper)] hairline text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent-pop)]" />
            <span className="font-semibold">Explorer Account & Itinerary History</span>
          </div>
          <span className="text-[11px] text-[var(--ink-tertiary)] font-mono">
            ROLE: {(user?.role || "traveler").toUpperCase()}
          </span>
        </div>

        {/* Profile Card */}
        <Card className="p-8 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar
              name={`${firstName} ${lastName}`}
              src={user?.avatar}
              size={84}
            />

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="display text-[26px] sm:text-[32px] text-[var(--ink-primary)]">
                    {firstName} {lastName}
                  </h1>
                  <p className="text-[13px] text-[var(--ink-tertiary)] mt-0.5 flex items-center gap-2 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-pop)]" />
                    <span>{city}, {country}</span>
                    <span>•</span>
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user?.email || "demo@globetrotter.io"}</span>
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Close Edit" : "Edit Profile"}</span>
                </Button>
              </div>

              <p className="text-[14px] text-[var(--ink-secondary)] leading-relaxed max-w-prose">
                &ldquo;{bio}&rdquo;
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--border-hairline)] max-w-xl">
            <StatPill label="Total Journeys" value={trips.length} />
            <StatPill label="Active Legs" value={preplannedTrips.length} />
            <StatPill label="Completed" value={previousTrips.length} />
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSave} className="pt-6 border-t border-[var(--border-hairline)] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1 uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1 uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1 uppercase tracking-wider">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1 uppercase tracking-wider">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1 uppercase tracking-wider">
                  Biography & Travel Philosophy
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Preplanned Journeys */}
        <div className="space-y-4">
          <Eyebrow>Active & Upcoming Journeys ({preplannedTrips.length})</Eyebrow>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {preplannedTrips.map((t) => (
              <Card key={t.id} className="p-5 flex flex-col justify-between space-y-3">
                <div>
                  <Tag tone="accent">{t.durationDays} Days</Tag>
                  <h4 className="text-[16px] font-bold text-[var(--ink-primary)] mt-2">{t.title}</h4>
                  <p className="text-[12px] text-[var(--ink-tertiary)]">{t.destination}</p>
                </div>

                <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
                  <span className="font-mono text-[13px] font-bold text-[var(--ink-primary)]">
                    {formatCurrency(t.estimatedBudget)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTripId(t.id);
                      navigateTo("itinerary-view", t.id);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
