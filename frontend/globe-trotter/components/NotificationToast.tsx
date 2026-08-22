"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const NotificationToast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isWarning = toast.type === "warning";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#E6E4DC] shadow-2xl text-[#222222]"
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#2C5E3B]" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-[#DD9F2A]" />}
                {!isSuccess && !isWarning && <Info className="w-5 h-5 text-[#2C5E3B]" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#222222] leading-tight">{toast.title}</h4>
                {toast.desc && <p className="text-xs text-[#555555] mt-0.5 leading-relaxed">{toast.desc}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-[#888888] hover:text-[#222222] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
