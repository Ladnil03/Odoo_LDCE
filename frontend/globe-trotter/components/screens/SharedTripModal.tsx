"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  X,
  Share2,
  Copy,
  Check,
  MapPin,
  Calendar,
  QrCode,
  Globe2,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { MagneticButton } from "../3d/MagneticButton";

export const SharedTripModal: React.FC = () => {
  const { sharedModalTrip, setSharedModalTrip, createTrip, navigateTo, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!sharedModalTrip) return null;

  const publicUrl = `https://globetrotter.io/share/${sharedModalTrip.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast("Link Copied!", "Public itinerary URL copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClone = () => {
    const cloned = createTrip({
      title: `${sharedModalTrip.title} (Forked)`,
      destination: sharedModalTrip.destination,
      country: sharedModalTrip.country,
      startDate: sharedModalTrip.startDate,
      endDate: sharedModalTrip.endDate,
      durationDays: sharedModalTrip.durationDays,
      estimatedBudget: sharedModalTrip.estimatedBudget,
      description: sharedModalTrip.description,
      coverImage: sharedModalTrip.coverImage,
      tags: [...sharedModalTrip.tags, "SharedFork"],
    });

    setSharedModalTrip(null);
    navigateTo("itinerary-view", cloned.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-xl rounded-3xl bg-white border border-[#E6E4DC] shadow-2xl p-6 text-[#222222] space-y-5 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DC]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#2C5E3B]" />
            <h2 className="text-base font-black text-[#222222]">Public Shareable Itinerary</h2>
          </div>
          <button
            onClick={() => setSharedModalTrip(null)}
            className="p-1 rounded-lg text-[#777777] hover:text-[#222222] hover:bg-[#FAF9F6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trip Preview Banner */}
        <div className="relative h-40 rounded-2xl overflow-hidden">
          <img
            src={sharedModalTrip.coverImage}
            alt={sharedModalTrip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E4329] via-[#1E4329]/40 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-base font-black text-white">{sharedModalTrip.title}</h3>
            <div className="flex items-center gap-2 text-xs text-[#FAF9F6]">
              <MapPin className="w-3 h-3 text-[#DD9F2A]" />
              <span>
                {sharedModalTrip.destination}, {sharedModalTrip.country}
              </span>
              <span>•</span>
              <Calendar className="w-3 h-3 text-[#DD9F2A]" />
              <span>{sharedModalTrip.durationDays} Days</span>
            </div>
          </div>
        </div>

        {/* Public Share URL Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#222222]">
            Shareable Public Link
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC]">
            <Globe2 className="w-4 h-4 text-[#2C5E3B] ml-1 shrink-0" />
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 bg-transparent text-xs text-[#222222] font-semibold focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-lg bg-[#2C5E3B] hover:bg-[#1E4329] text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Simulated QR Code Box */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E6E4DC]">
          <div className="w-16 h-16 rounded-xl bg-white border border-[#E6E4DC] p-1 flex items-center justify-center shrink-0 shadow-sm">
            <QrCode className="w-14 h-14 text-[#222222]" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-[#222222]">Scan with Mobile Camera</div>
            <p className="text-[11px] text-[#555555] leading-relaxed">
              Instant mobile read-only access for travel companions and family on WhatsApp or Apple Wallet.
            </p>
          </div>
        </div>

        {/* Actions: Clone / Fork this Trip */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#E6E4DC]">
          <div className="text-xs text-[#555555] font-semibold">
            Budget Target: <strong className="text-[#2C5E3B] font-black">${sharedModalTrip.estimatedBudget}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSharedModalTrip(null)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#666666] hover:text-[#222222]"
            >
              Close
            </button>
            <MagneticButton variant="amber" size="sm" onClick={handleClone} glow>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clone to My Itineraries</span>
            </MagneticButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
