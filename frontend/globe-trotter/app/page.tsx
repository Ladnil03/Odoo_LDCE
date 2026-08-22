"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { ScreenNavigator } from "@/components/ScreenNavigator";
import { NotificationToast } from "@/components/NotificationToast";
import { SharedTripModal } from "@/components/screens/SharedTripModal";

// Screens
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

function MainContent() {
  const { currentScreen } = useApp();

  const renderActiveScreen = () => {
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
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col text-[#222222] selection:bg-[#DD9F2A]/30 selection:text-[#222222] font-sans">
      <Navbar />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating 12-Screen Navigator for Evaluator */}
      <ScreenNavigator />

      {/* Public Share Modal (Screen 13) */}
      <SharedTripModal />

      {/* Floating Animated Toasts */}
      <NotificationToast />

      {/* Footer */}
      <footer className="border-t border-[#E6E4DC] bg-white py-8 px-4 text-center text-xs text-[#666666]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#2C5E3B]">GlobeTrotter</span>
            <span>• Empowering Personalized Multi-City Travel Planning</span>
          </div>
          <div>
            Built with Next.js App Router, Tailwind CSS & Motion 3D Physics
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
