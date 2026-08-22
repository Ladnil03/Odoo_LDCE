"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Search,
  Users,
  TrendingUp,
  MapPin,
  Sparkles,
  PieChart as PieChartIcon,
  DollarSign,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";
import { TiltCard } from "../3d/TiltCard";

export const AdminScreen: React.FC = () => {
  const { adminStats, adminUsers, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<
    "manage-users" | "popular-cities" | "popular-activities" | "analytics"
  >("analytics");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredUsers = adminUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Wireframe Tag Banner */}
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs text-[#2C5E3B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C5E3B]" />
            <span className="font-bold">Wireframe Screen 12: Admin Panel Screen / Analytics Dashboard</span>
          </div>
          <span className="text-[11px] text-[#555555]">
            Manage Users • Popular Cities • Popular Activities • User Trends & Charts
          </span>
        </div>

        {/* High-Level KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TiltCard
            maxTilt={4}
            className="p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md"
          >
            <div className="flex items-center justify-between text-[#555555] text-xs mb-2">
              <span>Total Registered Users</span>
              <Users className="w-4 h-4 text-[#2C5E3B]" />
            </div>
            <div className="text-2xl font-black text-[#222222]">{adminStats.totalUsers.toLocaleString()}</div>
            <div className="text-[11px] text-[#2C5E3B] font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{adminStats.userGrowth}% this month</span>
            </div>
          </TiltCard>

          <TiltCard
            maxTilt={4}
            className="p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md"
          >
            <div className="flex items-center justify-between text-[#555555] text-xs mb-2">
              <span>Active Itineraries</span>
              <Compass className="w-4 h-4 text-[#DD9F2A]" />
            </div>
            <div className="text-2xl font-black text-[#222222]">{adminStats.activeTrips.toLocaleString()}</div>
            <div className="text-[11px] text-[#2C5E3B] font-semibold mt-1">
              Across 6 Continents
            </div>
          </TiltCard>

          <TiltCard
            maxTilt={4}
            className="p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md"
          >
            <div className="flex items-center justify-between text-[#555555] text-xs mb-2">
              <span>Total Travel Volume</span>
              <DollarSign className="w-4 h-4 text-[#2C5E3B]" />
            </div>
            <div className="text-2xl font-black text-[#222222]">
              ${(adminStats.totalRevenue / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-[#2C5E3B] font-semibold mt-1">
              Bookings & Estimates
            </div>
          </TiltCard>

          <TiltCard
            maxTilt={4}
            className="p-5 rounded-3xl bg-white border border-[#E6E4DC] shadow-md"
          >
            <div className="flex items-center justify-between text-[#555555] text-xs mb-2">
              <span>Avg. Trip Budget</span>
              <Activity className="w-4 h-4 text-[#DD9F2A]" />
            </div>
            <div className="text-2xl font-black text-[#222222]">${adminStats.avgBudget}</div>
            <div className="text-[11px] text-[#DD9F2A] font-bold mt-1">
              Optimized per Traveler
            </div>
          </TiltCard>
        </div>

        {/* Tab Navigation Toolbar (Matching Wireframe 12 tabs) */}
        <div className="p-4 rounded-3xl bg-white border border-[#E6E4DC] shadow-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F6] rounded-2xl border border-[#E6E4DC]">
            <button
              onClick={() => setActiveTab("manage-users")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "manage-users"
                  ? "bg-[#2C5E3B] text-white shadow-sm"
                  : "text-[#555555] hover:text-[#222222]"
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab("popular-cities")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "popular-cities"
                  ? "bg-[#2C5E3B] text-white shadow-sm"
                  : "text-[#555555] hover:text-[#222222]"
              }`}
            >
              Popular Cities
            </button>
            <button
              onClick={() => setActiveTab("popular-activities")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "popular-activities"
                  ? "bg-[#2C5E3B] text-white shadow-sm"
                  : "text-[#555555] hover:text-[#222222]"
              }`}
            >
              Popular Activities
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-[#2C5E3B] text-white shadow-sm"
                  : "text-[#555555] hover:text-[#222222]"
              }`}
            >
              User Trends and Analytics
            </button>
          </div>
        </div>

        {/* TAB 1: User Trends and Analytics */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Line Trend Chart */}
            <TiltCard
              maxTilt={2}
              className="p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-md space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DC]">
                <div>
                  <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2C5E3B]" />
                    Monthly User Growth & Itinerary Creation
                  </h3>
                  <p className="text-[11px] text-[#555555]">Platform adoption over the last 6 months</p>
                </div>
                <span className="text-xs font-black text-[#2C5E3B]">+24.8% YoY</span>
              </div>

              {/* Visual Simulated SVG Line Chart */}
              <div className="h-48 w-full flex items-end justify-between gap-2 pt-6 px-2">
                {adminStats.monthlyEngagement.map((item, idx) => {
                  const heightPercent = (item.users / 16000) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-bold text-[#2C5E3B] opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.users.toLocaleString()}
                      </div>
                      <div className="w-full max-w-[36px] bg-[#FAF9F6] border border-[#E6E4DC] rounded-t-xl h-32 flex items-end overflow-hidden">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }}
                          className="w-full bg-[#2C5E3B] rounded-t-xl"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#666666]">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </TiltCard>

            {/* Popular Cities Donut Distribution Chart */}
            <TiltCard
              maxTilt={2}
              className="p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-md space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DC]">
                <div>
                  <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-[#DD9F2A]" />
                    Top Destinations Share
                  </h3>
                  <p className="text-[11px] text-[#555555]">Percentage distribution of trips created</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {adminStats.topCities.map((city, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#222222]">{city.name}</span>
                      <span className="font-bold text-[#2C5E3B]">
                        {city.percentage}% ({city.tripsCount} trips)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#FAF9F6] border border-[#E6E4DC] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2C5E3B]"
                        style={{
                          width: `${city.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TiltCard>
          </div>
        )}

        {/* TAB 2: Manage Users */}
        {activeTab === "manage-users" && (
          <div className="p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E4DC]">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name or email address..."
                  className="w-full pl-10 pr-4 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] text-xs font-semibold rounded-xl text-[#222222]"
                >
                  <option value="All">All Roles</option>
                  <option value="Traveler">Traveler</option>
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                </select>
              </div>
            </div>

            {/* Users Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E4DC] text-[#555555] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 font-bold">User</th>
                    <th className="py-3 px-3 font-bold">Role</th>
                    <th className="py-3 px-3 font-bold">Status</th>
                    <th className="py-3 px-3 font-bold">Trips Created</th>
                    <th className="py-3 px-3 font-bold">Total Spend</th>
                    <th className="py-3 px-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E4DC]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#222222]">{user.name}</div>
                        <div className="text-[11px] text-[#777777]">{user.email}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2C5E3B]/10 text-[#2C5E3B] border border-[#2C5E3B]/20">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            user.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-[#FAF9F6] text-[#777777] border-[#E6E4DC]"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#222222]">
                        {user.tripsCount}
                      </td>
                      <td className="py-3.5 px-3 font-black text-[#2C5E3B]">
                        ${user.spentTotal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => showToast("User Logs", `Viewing activity for ${user.name}`, "info")}
                          className="px-2.5 py-1 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#2C5E3B] font-bold text-xs border border-[#E6E4DC] cursor-pointer"
                        >
                          View Logs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Popular Cities */}
        {activeTab === "popular-cities" && (
          <div className="p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-md space-y-4">
            <h3 className="text-base font-bold text-[#222222] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2C5E3B]" />
              Popular Destinations & Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminStats.topCities.map((city, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E6E4DC] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#2C5E3B]" />
                    <div>
                      <h4 className="text-sm font-bold text-[#222222]">{city.name}</h4>
                      <p className="text-xs text-[#555555]">{city.tripsCount} active traveler plans</p>
                    </div>
                  </div>
                  <span className="text-base font-black text-[#2C5E3B]">{city.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Popular Activities */}
        {activeTab === "popular-activities" && (
          <div className="p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-md space-y-4">
            <h3 className="text-base font-bold text-[#222222] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#DD9F2A]" />
              Top Booked Activities & Revenue
            </h3>
            <div className="space-y-3">
              {adminStats.topActivities.map((act, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E6E4DC] flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-bold text-[#222222]">{act.name}</div>
                    <div className="text-xs text-[#555555]">{act.bookings} bookings logged</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-[#2C5E3B]">
                      ${act.revenue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#777777]">Gross Volume</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
