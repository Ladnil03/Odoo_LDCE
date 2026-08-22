"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { ScreenType } from "@/lib/types";
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Search,
  Plus,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { initials } from "@/lib/format";

const NAV: { label: string; screen: ScreenType; icon: React.ElementType; adminOnly?: boolean }[] = [
  { label: "Discover", screen: "home", icon: Compass },
  { label: "My trips", screen: "my-trips", icon: MapPin },
  { label: "Activities", screen: "search", icon: Search },
  { label: "Calendar", screen: "calendar", icon: Calendar },
  { label: "Community", screen: "community", icon: Users },
  { label: "Admin", screen: "admin", icon: ShieldCheck, adminOnly: true },
];

export const Navbar: React.FC = () => {
  const {
    currentScreen,
    navigateTo,
    user,
    isAuthed,
    isAdmin,
    switchRole,
    logout,
    bootstrapStatus,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--surface-page)]/85 backdrop-blur-md hairline-b">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* Brand */}
        <button
          onClick={() => navigateTo("home")}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-[var(--ink-primary)] flex items-center justify-center">
            <Compass className="w-4 h-4 text-[var(--surface-page)]" />
          </span>
          <span className="font-semibold text-[15px] tracking-tight text-[var(--ink-primary)]">
            GlobeTrotter
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.label}
                onClick={() => navigateTo(item.screen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--surface-sunken)] text-[var(--ink-primary)]"
                    : "text-[var(--ink-tertiary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Interactive RBAC Switcher */}
          {isAuthed && (
            <button
              onClick={() => switchRole(isAdmin ? "traveler" : "admin")}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold hairline transition-all cursor-pointer ${
                isAdmin
                  ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                  : "bg-[var(--surface-paper)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--ink-primary)]"
              }`}
              title={isAdmin ? "Switch to Demo Traveler" : "Elevate to Demo Admin"}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? "text-amber-700" : "text-[var(--accent-positive)]"}`} />
              <span>{isAdmin ? "Admin (Officer)" : "Traveler (Aarav)"}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/5">Switch</span>
            </button>
          )}

          {isAuthed ? (
            <>
              <button
                onClick={() => navigateTo("create-trip")}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--ink-primary)] text-[var(--surface-page)] text-[13px] font-medium hover:bg-[var(--ink-secondary)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.4} />
                New trip
              </button>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="w-9 h-9 rounded-full overflow-hidden bg-[var(--surface-sunken)] flex items-center justify-center hairline hover:ring-2 hover:ring-[var(--ink-primary)]/10 transition-shadow"
                >
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] font-semibold text-[var(--ink-secondary)]">
                      {initials(`${user?.firstName ?? ""} ${user?.lastName ?? ""}`) || "G"}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-12 w-56 rounded-xl bg-[var(--surface-elevated)] hairline shadow-xl shadow-[var(--ink-primary)]/5 py-1.5 z-50"
                    >
                      <div className="px-4 py-3 hairline-b">
                        <p className="text-[13px] font-semibold text-[var(--ink-primary)]">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[11px] text-[var(--ink-tertiary)] truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigateTo("profile");
                        }}
                        className="w-full text-left px-4 py-2 text-[13px] hover:bg-[var(--surface-sunken)]"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigateTo("my-trips");
                        }}
                        className="w-full text-left px-4 py-2 text-[13px] hover:bg-[var(--surface-sunken)]"
                      >
                        My trips
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-[13px] hover:bg-[var(--surface-sunken)] flex items-center gap-2 text-[var(--accent-warning)]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigateTo("login")}
                className="hidden sm:block px-3 py-1.5 text-[13px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              >
                Sign in
              </button>
              <button
                onClick={() => navigateTo("register")}
                className="px-3.5 py-2 rounded-lg bg-[var(--ink-primary)] text-[var(--surface-page)] text-[13px] font-medium hover:bg-[var(--ink-secondary)] transition-colors"
              >
                Create account
              </button>
            </>
          )}

          {/* Mobile menu */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-9 h-9 rounded-lg hairline flex items-center justify-center"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden overflow-hidden hairline-b bg-[var(--surface-page)]"
          >
            <div className="px-5 py-4 space-y-1">
              {NAV.map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setOpen(false);
                      navigateTo(item.screen);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[var(--ink-secondary)] hover:bg-[var(--surface-sunken)]"
                  >
                    <Icon className="w-4 h-4" strokeWidth={2.2} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bootstrap banner */}
      {bootstrapStatus === "error" && (
        <div className="hairline-b bg-[var(--surface-sunken)]">
          <div className="max-w-7xl mx-auto px-5 py-2 text-[12px] text-[var(--ink-tertiary)] flex items-center justify-between gap-3">
            <span>
              <span className="font-semibold text-[var(--accent-warning)]">Backend offline.</span>{" "}
              Start the FastAPI server at <code className="px-1 py-0.5 rounded bg-[var(--surface-cream)]">http://127.0.0.1:8000</code> for live data.
            </span>
            <span className="text-[10px] uppercase tracking-widest">Showing static demo</span>
          </div>
        </div>
      )}
    </header>
  );
};
