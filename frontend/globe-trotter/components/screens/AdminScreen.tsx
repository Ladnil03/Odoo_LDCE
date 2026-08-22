"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Trash2,
  Lock,
  Crown,
  RefreshCw,
} from "lucide-react";
import { Card, Eyebrow, Button, Tag, StatPill } from "../UiBits";

export const AdminScreen: React.FC = () => {
  const {
    adminOverview,
    adminStats,
    adminUsers,
    adminLoading,
    refreshAdmin,
    updateAdminUserRole,
    communityPosts,
    deleteCommunityPost,
    isAdmin,
    switchRole,
    updateUser,
    showToast,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "moderation">("overview");
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (isAdmin) {
      refreshAdmin();
    }
  }, [isAdmin, refreshAdmin]);

  const filteredUsers = adminUsers.filter((u) => {
    return (
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] p-8 flex items-center justify-center paper">
        <Card className="p-8 sm:p-10 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-pop-soft)] text-[var(--accent-pop)] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <Eyebrow className="text-[var(--accent-pop)]">RBAC Protected</Eyebrow>
            <h2 className="display text-[24px] text-[var(--ink-primary)] mt-1">Administrator Area</h2>
            <p className="text-[13px] text-[var(--ink-tertiary)] mt-1">
              You are currently authenticated as a standard traveler. Elevate your role to inspect system telemetries.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => switchRole("admin")}
            >
              <Crown className="w-4 h-4" />
              <span>Elevate to Admin Mode</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateTo("home")}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] py-8 px-4 sm:px-6 lg:px-8 paper">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[var(--surface-paper)] hairline text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-positive)]" />
            <span className="font-semibold">Platform Management & Telemetry Console</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refreshAdmin} loading={adminLoading}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Stats</span>
            </Button>
            <span className="text-[11px] text-[var(--ink-tertiary)] font-mono">
              ROLE: SUPERADMIN
            </span>
          </div>
        </div>

        {/* High-Level Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 space-y-1">
            <StatPill
              label="Total Registered Users"
              value={adminOverview?.totalUsers ?? adminStats?.totalUsers ?? adminUsers.length}
            />
          </Card>
          <Card className="p-5 space-y-1">
            <StatPill
              label="Active Expeditions"
              value={adminOverview?.totalTrips ?? adminStats?.totalTrips ?? 0}
              tone="positive"
            />
          </Card>
          <Card className="p-5 space-y-1">
            <StatPill
              label="Activities Scheduled"
              value={adminOverview?.totalActivitiesAssigned ?? adminStats?.totalActivitiesAssigned ?? 0}
            />
          </Card>
          <Card className="p-5 space-y-1">
            <StatPill
              label="Indexed Cities"
              value={adminOverview?.totalCities ?? adminStats?.totalCities ?? 0}
            />
          </Card>
        </div>

        {/* Tab Navigation */}
        <Card className="p-2 flex items-center gap-2 max-w-md">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === "overview"
                ? "bg-[var(--ink-primary)] text-white shadow-sm"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            }`}
          >
            Destinations & Trends
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === "users"
                ? "bg-[var(--ink-primary)] text-white shadow-sm"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            }`}
          >
            User RBAC ({adminUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("moderation")}
            className={`flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === "moderation"
                ? "bg-[var(--ink-primary)] text-white shadow-sm"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            }`}
          >
            Moderation ({communityPosts.length})
          </button>
        </Card>

        {/* TAB 1: Destinations & Trends */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-[16px] font-bold text-[var(--ink-primary)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--accent-pop)]" />
                Top Traveled Cities
              </h3>

              <div className="space-y-2 pt-2">
                {(adminStats?.topCities || []).length === 0 ? (
                  <p className="text-[13px] text-[var(--ink-tertiary)] italic">No destination analytics yet.</p>
                ) : (
                  adminStats?.topCities?.map((city, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[var(--surface-paper)] hairline flex items-center justify-between text-[13px]"
                    >
                      <span className="font-semibold text-[var(--ink-primary)]">{city.name}</span>
                      <Tag>{city.count || city.tripsCount || 0} Journeys</Tag>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-[16px] font-bold text-[var(--ink-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-pop)]" />
                Top Scheduled Activities
              </h3>

              <div className="space-y-2 pt-2">
                {(adminStats?.topActivities || []).length === 0 ? (
                  <p className="text-[13px] text-[var(--ink-tertiary)] italic">No activity booking analytics yet.</p>
                ) : (
                  adminStats?.topActivities?.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[var(--surface-paper)] hairline flex items-center justify-between text-[13px]"
                    >
                      <span className="font-semibold text-[var(--ink-primary)]">{act.name}</span>
                      <Tag tone="accent">{act.count || act.bookings || 0} Bookings</Tag>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: User RBAC Management */}
        {activeTab === "users" && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--ink-primary)]">User RBAC & Accounts</h3>
                <p className="text-[12px] text-[var(--ink-tertiary)]">Manage user access permissions in real time</p>
              </div>

              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user..."
                className="px-3 py-1.5 bg-[var(--surface-paper)] hairline rounded-lg text-[12px] text-[var(--ink-primary)] focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border-hairline)] text-[11px] font-mono text-[var(--ink-tertiary)] uppercase">
                    <th className="py-2.5 px-3">Name / Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Registered</th>
                    <th className="py-2.5 px-3">Trips</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--surface-paper)] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[var(--ink-primary)]">{u.name}</div>
                        <div className="text-[11px] text-[var(--ink-tertiary)] font-mono">{u.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => updateAdminUserRole(u.id, e.target.value)}
                          className="px-2 py-1 bg-[var(--surface-paper)] hairline rounded-md text-[12px] font-mono cursor-pointer"
                        >
                          <option value="user">User</option>
                          <option value="traveller">Traveller</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[var(--ink-tertiary)]">
                        {u.joinDate || "—"}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[var(--ink-primary)]">
                        {u.tripsCount}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showToast("User Audit", `Viewing audit events for ${u.name}`, "info")}
                        >
                          Logs
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 3: Community Moderation */}
        {activeTab === "moderation" && (
          <Card className="p-6 space-y-4">
            <h3 className="text-[16px] font-bold text-[var(--ink-primary)]">Community Post Moderation</h3>
            <div className="space-y-3">
              {communityPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-[var(--surface-paper)] hairline flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-[14px] font-bold text-[var(--ink-primary)]">{post.title || post.tripTitle}</h4>
                    <p className="text-[12px] text-[var(--ink-tertiary)]">
                      By {post.author.name} • {post.destination} • {post.likesCount ?? post.likes ?? 0} Likes
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showToast("Approved", "Post verified for community journal.", "success")}
                      className="text-emerald-700"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCommunityPost(post.id)}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
