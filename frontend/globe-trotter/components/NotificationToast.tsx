"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const COLORS = {
  success: "text-[var(--accent-positive)]",
  info: "text-[var(--ink-secondary)]",
  warning: "text-[var(--accent-warning)]",
  error: "text-[var(--accent-pop)]",
};

export const NotificationToast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-[360px]">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type ?? "info"];
          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => removeToast(t.id)}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="text-left flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--surface-elevated)] hairline shadow-lg shadow-[var(--ink-primary)]/5"
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${COLORS[t.type ?? "info"]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--ink-primary)]">{t.title}</p>
                {t.desc && (
                  <p className="text-[12px] text-[var(--ink-tertiary)] mt-0.5">{t.desc}</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
