"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Search,
  MapPin,
  Plus,
  ArrowRight,
  Globe2,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Card, Eyebrow, Button, SectionHeading, Tag, Avatar, StatPill, Reveal } from "../UiBits";
import { formatDate, formatCurrency } from "@/lib/format";

export const HomeScreen: React.FC = () => {
  const {
    navigateTo,
    trips,
    tripsLoading,
    cities,
    user,
    setActiveTripId,
    communityPosts,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortByOption, setSortByOption] = useState("popular");
  const [activeTab, setActiveTab] = useState<string>("all");

  const regions = [
    { id: "all", name: "All Regions" },
    { id: "europe", name: "Europe" },
    { id: "asia", name: "Asia" },
    { id: "americas", name: "Americas" },
    { id: "africa", name: "Africa" },
  ];

  const filteredCities = cities
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion =
        activeTab === "all" ||
        (c.region && c.region.toLowerCase() === activeTab.toLowerCase());
      return matchesSearch && matchesRegion;
    })
    .sort((a, b) => {
      if (sortByOption === "name") {
        return a.name.localeCompare(b.name);
      }
      return (b.popularityScore || 0) - (a.popularityScore || 0);
    });

  const recentTrips = trips.slice(0, 3);
  const featuredCommunity = communityPosts.slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] pb-24 paper">
      {/* Editorial Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[var(--surface-paper)] hairline text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent-pop)]" />
            <span className="font-semibold">GlobeTrotter Editorial — Personalized Multi-City Travel System</span>
          </div>
          <span className="text-[11px] text-[var(--ink-tertiary)] hidden sm:inline font-mono">
            LIVE SYNC • NEON DB & FASTAPI BACKEND
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden bg-[var(--surface-ivory)] hairline p-8 sm:p-12 lg:p-16">
            <div className="max-w-3xl space-y-6">
              <Eyebrow className="text-[var(--accent-pop)]">The Grand Tour Modernized</Eyebrow>

              <h1 className="display text-[42px] sm:text-[60px] lg:text-[68px] leading-[0.95] text-[var(--ink-primary)]">
                Curate every stop, timeline & budget with precision.
              </h1>

              <p className="text-[15px] sm:text-[17px] text-[var(--ink-secondary)] max-w-2xl leading-relaxed">
                Connect multi-city routes, map daily activities with automated expense summaries, and clone peer-reviewed itineraries from the community.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigateTo("create-trip")}
                  className="bg-[var(--ink-primary)] text-white hover:bg-[var(--ink-secondary)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Plan a New Journey</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigateTo("my-trips")}
                >
                  <span>My Itineraries ({trips.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-[var(--border-hairline)] max-w-xl">
              <StatPill label="Active Journeys" value={trips.length} />
              <StatPill label="Curated Cities" value={cities.length} />
              <StatPill label="Community Routes" value={communityPosts.length} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Search & Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, regional stops, or activities..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] placeholder-[var(--ink-tertiary)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="px-3 py-2 bg-[var(--surface-paper)] hairline text-[12px] font-medium rounded-lg text-[var(--ink-primary)] cursor-pointer"
            >
              <option value="all">All Continents</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="americas">Americas</option>
              <option value="africa">Africa</option>
            </select>

            <select
              value={sortByOption}
              onChange={(e) => setSortByOption(e.target.value)}
              className="px-3 py-2 bg-[var(--surface-paper)] hairline text-[12px] font-medium rounded-lg text-[var(--ink-primary)] cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </Card>
      </section>

      {/* Featured Cities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <Eyebrow className="mb-1">Destination Catalog</Eyebrow>
            <h2 className="display text-[28px] text-[var(--ink-primary)]">Curated Destinations & Stopovers</h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-paper)] hairline rounded-lg">
            {regions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setActiveTab(reg.id)}
                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                  activeTab === reg.id
                    ? "bg-[var(--surface-elevated)] text-[var(--ink-primary)] shadow-sm hairline"
                    : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                }`}
              >
                {reg.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredCities.map((city) => (
            <Card
              key={city.id}
              onClick={() => {
                navigateTo("search");
              }}
              className="group cursor-pointer overflow-hidden p-3 hover:border-[var(--ink-primary)] transition-all flex flex-col justify-between h-48"
            >
              <div className="relative h-24 rounded-lg overflow-hidden bg-[var(--surface-sunken)]">
                {city.image ? (
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--ink-tertiary)]">
                    <Globe2 className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <div className="font-bold text-[13px] text-[var(--ink-primary)] leading-tight">{city.name}</div>
                <div className="text-[11px] text-[var(--ink-tertiary)] flex items-center justify-between mt-0.5">
                  <span>{city.country}</span>
                  <span className="font-mono text-[10px] font-semibold">{city.region}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Active & Preplanned Trips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Eyebrow className="mb-1">Your Portfolio</Eyebrow>
            <h2 className="display text-[28px] text-[var(--ink-primary)]">Upcoming & Active Itineraries</h2>
          </div>

          <Button variant="ghost" size="sm" onClick={() => navigateTo("my-trips")}>
            <span>View all ({trips.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {recentTrips.length === 0 ? (
          <Card className="p-12 text-center">
            <Compass className="w-10 h-10 text-[var(--ink-tertiary)] mx-auto mb-3" />
            <h3 className="text-[16px] font-semibold text-[var(--ink-primary)]">No itineraries created yet</h3>
            <p className="text-[13px] text-[var(--ink-tertiary)] mt-1 max-w-sm mx-auto">
              Start by planning your first multi-city trip with automated day-wise activity scheduling.
            </p>
            <div className="mt-5">
              <Button variant="primary" size="md" onClick={() => navigateTo("create-trip")}>
                + Plan a Trip
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentTrips.map((trip) => (
              <Card key={trip.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-[var(--ink-primary)] transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Tag tone={trip.status === "ongoing" ? "accent" : "default"}>
                      {trip.status.toUpperCase()}
                    </Tag>
                    <span className="font-mono text-[13px] font-bold text-[var(--ink-primary)]">
                      {formatCurrency(trip.estimatedBudget || 0)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[18px] font-bold text-[var(--ink-primary)] leading-snug">
                      {trip.title}
                    </h3>
                    <p className="text-[12px] text-[var(--ink-tertiary)] flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent-pop)]" />
                      <span>{trip.destination}</span>
                    </p>
                  </div>

                  {trip.description && (
                    <p className="text-[13px] text-[var(--ink-secondary)] line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--ink-tertiary)] font-mono">
                    {formatDate(trip.startDate)} • {trip.durationDays}d
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTripId(trip.id);
                        navigateTo("itinerary-view", trip.id);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActiveTripId(trip.id);
                        navigateTo("itinerary-builder", trip.id);
                      }}
                    >
                      Builder
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Community Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Eyebrow className="mb-1">Community Highlights</Eyebrow>
            <h2 className="display text-[28px] text-[var(--ink-primary)]">Peer-Reviewed Routes</h2>
          </div>

          <Button variant="ghost" size="sm" onClick={() => navigateTo("community")}>
            <span>Explore Community ({communityPosts.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredCommunity.map((post) => (
            <Card key={post.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={post.author.name} src={post.author.avatarUrl || post.author.avatar} size={36} />
                  <div>
                    <div className="text-[13px] font-bold text-[var(--ink-primary)]">{post.author.name}</div>
                    <div className="text-[11px] text-[var(--ink-tertiary)]">{post.destination}</div>
                  </div>
                </div>
                <Tag>{post.daysDuration} Days</Tag>
              </div>

              <h4 className="text-[16px] font-bold text-[var(--ink-primary)]">
                {post.title || post.tripTitle}
              </h4>
              <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed line-clamp-2">
                {post.summary}
              </p>

              <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-[12px]">
                <span className="font-mono text-[var(--ink-secondary)]">
                  {formatCurrency(post.budgetTotal || 0)} Est.
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateTo("community")}>
                  Inspect Story
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
