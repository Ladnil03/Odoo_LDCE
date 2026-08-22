"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  User,
  Mail,
  Phone,
  MapPin,
  Globe2,
  Calendar,
  DollarSign,
  Edit2,
  Check,
  Eye,
  Sparkles,
  Award,
} from "lucide-react";
import { motion } from "motion/react";
import { TiltCard } from "../3d/TiltCard";
import { MagneticButton } from "../3d/MagneticButton";

export const ProfileScreen: React.FC = () => {
  const { user, updateUser, trips, navigateTo, setActiveTripId } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    city: user.city,
    country: user.country,
    bio: user.bio,
    language: user.language,
    currency: user.currency,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };

  const preplannedTrips = trips.filter((t) => t.status === "upcoming" || t.status === "ongoing");
  const previousTrips = trips.filter((t) => t.status === "completed");

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Wireframe Tag Banner */}
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs text-[#2C5E3B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C5E3B]" />
            <span className="font-bold">Wireframe Screen 7: User Profile Pages</span>
          </div>
          <span className="text-[11px] text-[#555555]">
            User Details Form • Preplanned Trips • Previous Trips
          </span>
        </div>

        {/* User Profile Header Card */}
        <TiltCard
          maxTilt={3}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E4DC] shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Image of the User */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-3xl p-1 bg-[#2C5E3B] shadow-md shadow-[#2C5E3B]/20">
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="w-full h-full rounded-[22px] object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#DD9F2A] text-[#222222] border-2 border-white shadow">
                <Award className="w-4 h-4" />
              </div>
            </div>

            {/* User Details with edit button */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-[#222222] flex items-center gap-2">
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#2C5E3B]/10 text-[#2C5E3B] border border-[#2C5E3B]/20 text-[10px] uppercase font-black tracking-wider">
                      Verified Explorer
                    </span>
                  </h1>
                  <p className="text-xs text-[#555555] mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2C5E3B]" />
                    <span>{user.city}, {user.country}</span>
                    <span className="text-[#CCCCCC]">•</span>
                    <Mail className="w-3.5 h-3.5 text-[#777777]" />
                    <span>{user.email}</span>
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#222222] text-xs font-bold border border-[#E6E4DC] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#2C5E3B]" />
                  <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
                </button>
              </div>

              <p className="text-xs text-[#444444] leading-relaxed bg-[#FAF9F6] p-3 rounded-2xl border border-[#E6E4DC]">
                &ldquo;{user.bio}&rdquo;
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {user.travelStyle.map((style, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#FAF9F6] text-[#2C5E3B] border border-[#E6E4DC]"
                  >
                    #{style}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Inline Edit Form if enabled */}
          {isEditing && (
            <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-[#E6E4DC] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-[#666666] hover:text-[#222222]"
                >
                  Cancel
                </button>
                <MagneticButton variant="primary" size="sm" type="submit">
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </MagneticButton>
              </div>
            </form>
          )}
        </TiltCard>

        {/* Preplanned Trips Cards (Matching Wireframe 7) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#222222] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2C5E3B]" />
                Preplanned Trips
              </h2>
              <p className="text-xs text-[#555555]">
                Scheduled itineraries queued up for execution
              </p>
            </div>
            <span className="text-xs text-[#2C5E3B] font-bold">{preplannedTrips.length} Trips</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {preplannedTrips.map((trip) => (
              <TiltCard
                key={trip.id}
                maxTilt={6}
                className="bg-white border border-[#E6E4DC] shadow-md flex flex-col justify-between p-4"
              >
                <div>
                  <div className="relative h-36 rounded-2xl overflow-hidden mb-3">
                    <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#2C5E3B] text-[10px] font-black text-white uppercase">
                      {trip.durationDays} Days
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#222222] line-clamp-1">{trip.title}</h3>
                  <div className="text-xs text-[#2C5E3B] font-bold mt-0.5">{trip.destination}, {trip.country}</div>
                  <p className="text-[11px] text-[#555555] line-clamp-2 mt-1.5 leading-relaxed">
                    {trip.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E6E4DC] flex items-center justify-between">
                  <div className="text-xs font-black text-[#2C5E3B]">${trip.estimatedBudget}</div>
                  <button
                    onClick={() => {
                      setActiveTripId(trip.id);
                      navigateTo("itinerary-view", trip.id);
                    }}
                    className="px-3 py-1 rounded-xl bg-[#2C5E3B]/10 hover:bg-[#2C5E3B] text-[#2C5E3B] hover:text-white text-xs font-bold border border-[#2C5E3B]/20 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View (Screen 9)</span>
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* Previous Trips Cards (Matching Wireframe 7) */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#222222] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#DD9F2A]" />
                Previous Trips
              </h2>
              <p className="text-xs text-[#555555]">
                Completed past adventures and travel archive
              </p>
            </div>
            <span className="text-xs text-[#666666] font-bold">{previousTrips.length} Trips</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {previousTrips.map((trip) => (
              <TiltCard
                key={trip.id}
                maxTilt={6}
                className="bg-white border border-[#E6E4DC] shadow-md flex flex-col justify-between p-4"
              >
                <div>
                  <div className="relative h-36 rounded-2xl overflow-hidden mb-3">
                    <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#FAF9F6] border border-[#E6E4DC] text-[10px] font-bold text-[#666666] uppercase">
                      Completed
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#222222] line-clamp-1">{trip.title}</h3>
                  <div className="text-xs text-[#2C5E3B] font-bold mt-0.5">{trip.destination}, {trip.country}</div>
                  <p className="text-[11px] text-[#555555] line-clamp-2 mt-1.5 leading-relaxed">
                    {trip.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E6E4DC] flex items-center justify-between">
                  <div className="text-xs font-black text-[#555555]">Spent: ${trip.actualExpense}</div>
                  <button
                    onClick={() => {
                      setActiveTripId(trip.id);
                      navigateTo("itinerary-view", trip.id);
                    }}
                    className="px-3 py-1 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#222222] text-xs font-bold border border-[#E6E4DC] flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View (Screen 9)</span>
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
