"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, Calendar, MapPin, Wallet } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { tripsApi } from "@/lib/api";
import { Button, Eyebrow, Skeleton } from "@/components/UiBits";

export const SharedTripModal: React.FC = () => {
  const { sharedModalTrip, closeSharedTrip } = useApp();
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState<{ stopId: string; cityName: string; stopTotal: number; days: any[] }[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (!sharedModalTrip?.shareSlug) {
      setStops([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    tripsApi
      .getPublicTrip(sharedModalTrip.shareSlug)
      .catch(() => null)
      .then(async (publicTrip: any) => {
        if (cancelled) return;
        if (!publicTrip) {
          setStops([]);
          setLoading(false);
          return;
        }
        try {
          const itin = await tripsApi.listTrips(1, 100);
          // We don't have a public-itinerary endpoint, fall back to summary
          setStops([]);
          setTotalCost(Number(publicTrip.daily_budget ?? 0) * 7);
        } catch {
          setStops([]);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sharedModalTrip?.shareSlug]);

  return (
    <AnimatePresence>
      {sharedModalTrip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-[var(--ink-primary)]/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeSharedTrip}
        >
          <motion.div
            initial={{ scale: 0.96, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--surface-page)] rounded-2xl max-w-xl w-full hairline shadow-2xl overflow-hidden"
          >
            <div className="flex items-start justify-between p-6 hairline-b">
              <div>
                <Eyebrow className="block mb-2">Public preview</Eyebrow>
                <h3 className="display text-[22px]">{sharedModalTrip.title}</h3>
                <p className="text-[13px] text-[var(--ink-tertiary)] mt-1">
                  Anyone with this link can view the itinerary.
                </p>
              </div>
              <button
                onClick={closeSharedTrip}
                className="w-8 h-8 rounded-lg hairline flex items-center justify-center hover:bg-[var(--surface-sunken)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Eyebrow className="block mb-1">Duration</Eyebrow>
                  <p className="text-[14px] font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--ink-tertiary)]" />
                    {sharedModalTrip.durationDays || "—"} days
                  </p>
                </div>
                <div>
                  <Eyebrow className="block mb-1">Budget</Eyebrow>
                  <p className="text-[14px] font-medium flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-[var(--ink-tertiary)]" />
                    ${sharedModalTrip.estimatedBudget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Eyebrow className="block mb-1">Status</Eyebrow>
                  <p className="text-[14px] font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--ink-tertiary)]" />
                    {sharedModalTrip.status}
                  </p>
                </div>
              </div>

              {loading ? (
                <Skeleton className="h-16" />
              ) : (
                <div className="rounded-xl bg-[var(--surface-sunken)] p-4 text-[13px] text-[var(--ink-secondary)]">
                  This is a public read-only preview. The full day-by-day itinerary is only visible to the owner.
                </div>
              )}

              <div className="flex items-center gap-2">
                <a
                  href={`/public/trips/${sharedModalTrip.shareSlug ?? ""}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ink-tertiary)] hover:text-[var(--ink-primary)]"
                >
                  <ExternalLink className="w-3 h-3" /> Open public URL
                </a>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 hairline-t bg-[var(--surface-sunken)]/60">
              <Button variant="ghost" onClick={closeSharedTrip}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
