"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Search,
  Filter,
  ArrowUpDown,
  Heart,
  MessageCircle,
  Copy,
  MapPin,
  CheckCircle2,
  Users,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TiltCard } from "../3d/TiltCard";
import { MagneticButton } from "../3d/MagneticButton";
import { CommunityPost } from "@/lib/types";

export const CommunityScreen: React.FC = () => {
  const {
    communityPosts,
    toggleLikePost,
    cloneCommunityTrip,
    showToast,
  } = useApp();

  const [searchFilter, setSearchFilter] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortBy, setSortBy] = useState<"trending" | "likes" | "recent">("trending");
  const [commentModalPost, setCommentModalPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState("");

  const tags = ["All", "SwissAlps", "TokyoSecret", "ParisGuide", "Paragliding", "Foodie", "Scuba"];

  const filteredPosts = communityPosts
    .filter((post) => {
      const matchesSearch =
        post.tripTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
        post.destination.toLowerCase().includes(searchFilter.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesTag =
        selectedTag === "All" ||
        post.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "likes") return b.likes - a.likes;
      return 0;
    });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    showToast("Comment Published!", `"${commentText}" posted to community thread.`, "success");
    setCommentText("");
    setCommentModalPost(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Wireframe Tag Banner */}
        <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#2C5E3B]/10 border border-[#2C5E3B]/20 text-xs text-[#2C5E3B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C5E3B]" />
            <span className="font-bold">Wireframe Screen 10: Community Tab Screen</span>
          </div>
          <span className="text-[11px] text-[#555555]">
            Share Experiences • Search & Filter • 1-Click &ldquo;Copy Trip&rdquo;
          </span>
        </div>

        {/* Community Header & Search Toolbar (Matching Wireframe 10) */}
        <div className="p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E4DC]">
            <div>
              <h1 className="text-2xl font-black text-[#222222] flex items-center gap-2">
                <Users className="w-6 h-6 text-[#2C5E3B]" />
                GlobeTrotter Community Hub
              </h1>
              <p className="text-xs text-[#555555] mt-0.5">
                Community section where all users share their experiences, budget tips, and allow one-click trip copying.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#2C5E3B]/10 text-[#2C5E3B] text-xs font-bold border border-[#2C5E3B]/20">
              {filteredPosts.length} Shared Itineraries
            </span>
          </div>

          {/* Search, Group by, Filter, Sort by Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search bar .... (Search shared trip stories, user reviews, destinations)"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-sm text-[#222222] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Filter by Tag */}
              <div className="relative min-w-[120px]">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#777777]">
                  <Filter className="w-3.5 h-3.5" />
                </div>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full pl-8 pr-6 py-2 bg-[#FAF9F6] border border-[#E6E4DC] text-xs font-semibold rounded-xl text-[#222222] focus:outline-none cursor-pointer"
                >
                  {tags.map((t) => (
                    <option key={t} value={t}>
                      {t === "All" ? "Filter: All Tags" : `#${t}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="relative min-w-[130px]">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#777777]">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-8 pr-6 py-2 bg-[#FAF9F6] border border-[#E6E4DC] text-xs font-semibold rounded-xl text-[#222222] focus:outline-none cursor-pointer"
                >
                  <option value="trending">Sort by: Trending</option>
                  <option value="likes">Sort by: Most Liked</option>
                  <option value="recent">Sort by: Recent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Community Feed Post Cards */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <TiltCard
              key={post.id}
              maxTilt={2}
              className="p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-md hover:border-[#2C5E3B] transition-all space-y-4"
            >
              {/* Author Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#2C5E3B]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#222222]">{post.author.name}</span>
                      {post.author.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E3B]" />
                      )}
                    </div>
                    <div className="text-[11px] text-[#777777] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#2C5E3B]" />
                      <span>{post.author.location}</span>
                      <span className="text-[#CCCCCC]">•</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-black text-[#2C5E3B] bg-[#2C5E3B]/10 px-2.5 py-1 rounded-full border border-[#2C5E3B]/20">
                  ${post.budgetTotal} Budget
                </span>
              </div>

              {/* Title & Cover Image */}
              <div className="space-y-2">
                <h3 className="text-lg font-black text-[#222222] tracking-tight">{post.tripTitle}</h3>
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.tripTitle}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-xs font-bold text-[#222222] shadow-md flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2C5E3B]" />
                    <span>{post.destination}</span>
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#2C5E3B] text-xs font-bold text-white shadow-md">
                    {post.daysDuration} Days
                  </div>
                </div>
              </div>

              {/* Story Description */}
              <p className="text-xs text-[#444444] leading-relaxed bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E6E4DC]">
                {post.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] text-[#2C5E3B] font-bold bg-[#2C5E3B]/10 px-2.5 py-0.5 rounded-lg border border-[#2C5E3B]/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Bar (Like, Comment, Copy Trip) */}
              <div className="pt-3 border-t border-[#E6E4DC] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Like Button */}
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      post.likedByMe
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-[#FAF9F6] text-[#555555] hover:text-[#222222] border border-[#E6E4DC]"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.likedByMe ? "fill-rose-600 text-rose-600" : ""}`} />
                    <span>{post.likes}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => setCommentModalPost(post)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#555555] text-xs font-bold border border-[#E6E4DC] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#2C5E3B]" />
                    <span>{post.commentsCount} comments</span>
                  </button>
                </div>

                {/* 1-Click "Copy Trip" / Clone Feature with Warm Amber CTA */}
                <MagneticButton
                  variant="amber"
                  size="sm"
                  onClick={() => cloneCommunityTrip(post)}
                  glow
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Trip to My Plans</span>
                </MagneticButton>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* Comment Modal */}
        <AnimatePresence>
          {commentModalPost && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md p-6 rounded-3xl bg-white border border-[#E6E4DC] shadow-2xl text-[#222222] space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DC]">
                  <h3 className="text-sm font-bold text-[#222222] flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#2C5E3B]" />
                    Community Comments
                  </h3>
                  <button
                    onClick={() => setCommentModalPost(null)}
                    className="text-xs text-[#777777] hover:text-[#222222]"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC] text-xs space-y-1">
                    <div className="font-bold text-[#2C5E3B]">Marcus Wright</div>
                    <p className="text-[#555555] text-[11px]">
                      Did you book the paragliding in advance or on the spot? Incredible photos!
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC] text-xs space-y-1">
                    <div className="font-bold text-[#2C5E3B]">Sophia Chen</div>
                    <p className="text-[#555555] text-[11px]">
                      Just cloned this itinerary! Adding 2 days in Zurich as well.
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment or ask for tips..."
                    className="flex-1 px-3 py-2 bg-[#FAF9F6] border border-[#E6E4DC] rounded-xl text-xs text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#2C5E3B]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-[#2C5E3B] hover:bg-[#1E4329] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
