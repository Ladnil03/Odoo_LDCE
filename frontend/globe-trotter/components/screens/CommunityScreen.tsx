"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Compass,
  Search,
  Heart,
  MessageCircle,
  Copy,
  MapPin,
  Send,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, Eyebrow, Button, Tag, Avatar, EmptyState } from "../UiBits";
import { CommunityPost, CommunityComment } from "@/lib/types";
import { formatCurrency, relativeTime } from "@/lib/format";

export const CommunityScreen: React.FC = () => {
  const {
    communityPosts,
    toggleLikePost,
    addCommentToPost,
    loadComments,
    publishTripToCommunity,
    deleteCommunityPost,
    cloneTrip,
    trips,
    isAdmin,
    showToast,
    navigateTo,
  } = useApp();

  const [searchFilter, setSearchFilter] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, CommunityComment[]>>({});
  const [commentText, setCommentText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishTripId, setPublishTripId] = useState(trips[0]?.id || "");
  const [publishSummary, setPublishSummary] = useState("");

  const filteredPosts = communityPosts.filter((post) => {
    const title = post.title || post.tripTitle || "";
    const dest = post.destination || "";
    const authorName = post.author.name || "";
    const sum = post.summary || "";
    return (
      title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      dest.toLowerCase().includes(searchFilter.toLowerCase()) ||
      authorName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      sum.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  const handleOpenComments = async (postId: string) => {
    if (selectedPostId === postId) {
      setSelectedPostId(null);
      return;
    }
    setSelectedPostId(postId);
    try {
      const comments = await loadComments(postId);
      setPostComments((prev) => ({ ...prev, [postId]: comments }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addCommentToPost(postId, commentText);
      setCommentText("");
      const comments = await loadComments(postId);
      setPostComments((prev) => ({ ...prev, [postId]: comments }));
    } catch (err: any) {
      showToast("Comment failed", err?.message, "error");
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    const trip = trips.find((t) => t.id === publishTripId);
    if (!trip) return;
    try {
      await publishTripToCommunity(trip.id, {
        title: trip.title,
        summary: publishSummary || trip.description || "Shared travel expedition.",
        destination: trip.destination,
        days: trip.durationDays,
        budget: trip.estimatedBudget,
      });
      setIsPublishing(false);
      setPublishSummary("");
    } catch (err: any) {
      showToast("Publish failed", err?.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-primary)] py-8 px-4 sm:px-6 lg:px-8 paper">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between py-2 px-4 rounded-xl bg-[var(--surface-paper)] hairline text-xs text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent-pop)]" />
            <span className="font-semibold">Community Travel Journal & Peer Routes</span>
          </div>
          <span className="text-[11px] text-[var(--ink-tertiary)] font-mono">
            {communityPosts.length} SHARED STORIES
          </span>
        </div>

        {/* Toolbar & Publish Trigger */}
        <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search community itineraries by author, city, or story..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
            />
          </div>

          <Button variant="primary" size="md" onClick={() => setIsPublishing(true)}>
            <Plus className="w-4 h-4" />
            <span>Publish Your Trip</span>
          </Button>
        </Card>

        {/* Publish Modal / Form */}
        {isPublishing && (
          <Card className="p-6 border-[var(--ink-primary)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
              <h3 className="text-[16px] font-bold text-[var(--ink-primary)]">Publish Trip to Community</h3>
              <button onClick={() => setIsPublishing(false)} className="text-[12px] text-[var(--ink-tertiary)]">
                Cancel
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1 uppercase tracking-wider">
                  Select Trip to Share
                </label>
                <select
                  value={publishTripId}
                  onChange={(e) => setPublishTripId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] cursor-pointer focus:outline-none"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-primary)] mb-1 uppercase tracking-wider">
                  Story & Budget Advice
                </label>
                <textarea
                  rows={3}
                  required
                  value={publishSummary}
                  onChange={(e) => setPublishSummary(e.target.value)}
                  placeholder="Share highlights, tips, hidden gems, and travel budgeting insights..."
                  className="w-full p-3 bg-[var(--surface-paper)] hairline rounded-lg text-[13px] text-[var(--ink-primary)] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsPublishing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Publish to Community
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Community Feed */}
        {filteredPosts.length === 0 ? (
          <EmptyState
            icon={<Compass className="w-8 h-8" />}
            title="No community posts found"
            description="Be the first to publish your expedition to the community!"
            action={
              <Button variant="primary" size="md" onClick={() => setIsPublishing(true)}>
                + Publish a Trip
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => {
              const isOpen = selectedPostId === post.id;
              const comments = postComments[post.id] || [];
              const likes = post.likesCount ?? post.likes ?? 0;

              return (
                <Card key={post.id} className="p-6 space-y-4 hover:border-[var(--ink-primary)] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={post.author.name}
                        src={post.author.avatarUrl || post.author.avatar}
                        size={40}
                      />
                      <div>
                        <div className="text-[14px] font-bold text-[var(--ink-primary)]">
                          {post.author.name}
                        </div>
                        <div className="text-[11px] text-[var(--ink-tertiary)] flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-[var(--accent-pop)]" />
                          <span>{post.destination || "Worldwide"}</span>
                          <span>•</span>
                          <span>{relativeTime(post.createdAt || "")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag tone="accent">{post.daysDuration || 7} Days</Tag>
                      <span className="font-mono text-[13px] font-bold text-[var(--ink-primary)]">
                        {formatCurrency(post.budgetTotal || 0)}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => deleteCommunityPost(post.id)}
                          className="p-1.5 rounded text-[var(--ink-tertiary)] hover:text-rose-600"
                          title="Admin Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[18px] font-bold text-[var(--ink-primary)]">
                      {post.title || post.tripTitle}
                    </h3>
                    <p className="text-[14px] text-[var(--ink-secondary)] leading-relaxed mt-1.5">
                      {post.summary}
                    </p>
                  </div>

                  {/* Actions (Like, Comments) */}
                  <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={post.likedByMe ? "outline" : "ghost"}
                        size="sm"
                        onClick={() => toggleLikePost(post.id)}
                        className={post.likedByMe ? "text-rose-600 border-rose-200" : ""}
                      >
                        <Heart className={`w-3.5 h-3.5 ${post.likedByMe ? "fill-rose-600 text-rose-600" : ""}`} />
                        <span>{likes}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenComments(post.id)}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.commentsCount || comments.length || 0} Comments</span>
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (post.tripId) {
                          await cloneTrip(post.tripId);
                        } else {
                          showToast("Itinerary Cloned", "Copy added to your personal trips.", "success");
                        }
                        navigateTo("my-trips");
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Clone Itinerary</span>
                    </Button>
                  </div>

                  {/* Comments Thread */}
                  {isOpen && (
                    <div className="pt-4 border-t border-[var(--border-hairline)] space-y-3">
                      <div className="space-y-2">
                        {comments.length === 0 ? (
                          <p className="text-[12px] text-[var(--ink-tertiary)] italic">
                            No comments yet. Start the conversation!
                          </p>
                        ) : (
                          comments.map((c) => (
                            <div key={c.id} className="p-3 rounded-lg bg-[var(--surface-paper)] text-[12px] space-y-1">
                              <div className="flex items-center justify-between font-bold text-[var(--ink-primary)]">
                                <span>{c.author.name}</span>
                                <span className="font-mono text-[10px] text-[var(--ink-tertiary)]">
                                  {relativeTime(c.createdAt)}
                                </span>
                              </div>
                              <p className="text-[var(--ink-secondary)]">{c.body}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={(e) => handleSendComment(e, post.id)} className="flex gap-2 pt-2">
                        <input
                          type="text"
                          required
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a tip or question..."
                          className="flex-1 px-3 py-2 bg-[var(--surface-paper)] hairline rounded-lg text-[12px] text-[var(--ink-primary)] focus:outline-none"
                        />
                        <Button type="submit" variant="primary" size="sm">
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </Button>
                      </form>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
