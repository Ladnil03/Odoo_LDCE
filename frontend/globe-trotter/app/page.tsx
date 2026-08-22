"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { NotificationToast } from "@/components/NotificationToast";
import { SharedTripModal } from "@/components/screens/SharedTripModal";

import { LoginScreen } from "@/components/screens/LoginScreen";
import { RegisterScreen } from "@/components/screens/RegisterScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { CreateTripScreen } from "@/components/screens/CreateTripScreen";
import { ItineraryBuilderScreen } from "@/components/screens/ItineraryBuilderScreen";
import { MyTripsScreen } from "@/components/screens/MyTripsScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { ActivitySearchScreen } from "@/components/screens/ActivitySearchScreen";
import { ItineraryViewScreen } from "@/components/screens/ItineraryViewScreen";
import { CommunityScreen } from "@/components/screens/CommunityScreen";
import { CalendarScreen } from "@/components/screens/CalendarScreen";
import { AdminScreen } from "@/components/screens/AdminScreen";

import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/UiBits";

function MainContent() {
  const { currentScreen, bootstrapStatus } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return <LoginScreen />;
      case "register":
        return <RegisterScreen />;
      case "home":
        return <HomeScreen />;
      case "create-trip":
        return <CreateTripScreen />;
      case "itinerary-builder":
        return <ItineraryBuilderScreen />;
      case "my-trips":
        return <MyTripsScreen />;
      case "profile":
        return <ProfileScreen />;
      case "search":
        return <ActivitySearchScreen />;
      case "itinerary-view":
        return <ItineraryViewScreen />;
      case "community":
        return <CommunityScreen />;
      case "calendar":
        return <CalendarScreen />;
      case "admin":
        return <AdminScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page)] flex flex-col text-[var(--ink-primary)] font-sans">
      <Navbar />

      <main className="flex-1">
        {bootstrapStatus === "running" || bootstrapStatus === "checking" ? (
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
            <Skeleton className="h-72 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56" />
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <SharedTripModal />
      <NotificationToast />

      <footer className="hairline-t bg-[var(--surface-page)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[var(--ink-tertiary)]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--ink-primary)]">GlobeTrotter</span>
            <span>· A quieter way to plan a trip.</span>
          </div>
          <div className="flex items-center gap-5">
            <span>v1 · {new Date().getFullYear()}</span>
            <span>Built for travellers, not algorithms.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
