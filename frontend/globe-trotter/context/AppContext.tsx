"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ScreenType,
  UserProfile,
  Trip,
  DestinationCity,
  ActivityItem,
  CommunityPost,
  AdminStats,
  AdminUser,
  ItinerarySection,
  ItineraryActivity,
} from "@/lib/types";
import {
  initialUser,
  sampleCities,
  sampleActivities,
  sampleTrips,
  sampleCommunityPosts,
  sampleAdminStats,
  sampleAdminUsers,
} from "@/lib/mock-data";

interface ToastInfo {
  id: string;
  title: string;
  desc?: string;
  type?: "success" | "info" | "warning";
}

interface AppContextType {
  currentScreen: ScreenType;
  navigateTo: (screen: ScreenType, tripId?: string) => void;
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  trips: Trip[];
  activeTripId: string | null;
  activeTrip: Trip | null;
  setActiveTripId: (id: string | null) => void;
  createTrip: (tripData: Partial<Trip>) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addSectionToTrip: (tripId: string, section: ItinerarySection) => void;
  deleteSectionFromTrip: (tripId: string, sectionId: string) => void;
  addActivityToTripDay: (tripId: string, dayNumber: number, activity: ItineraryActivity) => void;
  removeActivityFromTripDay: (tripId: string, dayNumber: number, activityId: string) => void;
  cities: DestinationCity[];
  activities: ActivityItem[];
  communityPosts: CommunityPost[];
  toggleLikePost: (postId: string) => void;
  cloneCommunityTrip: (post: CommunityPost) => void;
  adminStats: AdminStats;
  adminUsers: AdminUser[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  sortByOption: string;
  setSortByOption: (sort: string) => void;
  groupByOption: string;
  setGroupByOption: (group: string) => void;
  sharedModalTrip: Trip | null;
  setSharedModalTrip: (trip: Trip | null) => void;
  toasts: ToastInfo[];
  showToast: (title: string, desc?: string, type?: "success" | "info" | "warning") => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [trips, setTrips] = useState<Trip[]>(sampleTrips);
  const [activeTripId, setActiveTripId] = useState<string | null>("trip-paris-01");
  const [cities] = useState<DestinationCity[]>(sampleCities);
  const [activities] = useState<ActivityItem[]>(sampleActivities);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(sampleCommunityPosts);
  const [adminStats] = useState<AdminStats>(sampleAdminStats);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(sampleAdminUsers);

  // Global filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [sortByOption, setSortByOption] = useState("popular");
  const [groupByOption, setGroupByOption] = useState("none");
  const [sharedModalTrip, setSharedModalTrip] = useState<Trip | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Load from localStorage if available
  useEffect(() => {
    try {
      const savedTrips = localStorage.getItem("globetrotter_trips");
      if (savedTrips) {
        setTrips(JSON.parse(savedTrips));
      }
      const savedUser = localStorage.getItem("globetrotter_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }
  }, []);

  // Save trips to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("globetrotter_trips", JSON.stringify(trips));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }, [trips]);

  const showToast = (title: string, desc?: string, type: "success" | "info" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, desc, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (screen: ScreenType, tripId?: string) => {
    if (tripId) {
      setActiveTripId(tripId);
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0] || null;

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("globetrotter_user", JSON.stringify(updated));
      return updated;
    });
    showToast("Profile Updated", "Your travel preferences and information have been saved.", "success");
  };

  const createTrip = (tripData: Partial<Trip>): Trip => {
    const newId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      id: newId,
      title: tripData.title || "My Global Adventure",
      destination: tripData.destination || "Paris",
      country: tripData.country || "France",
      coverImage:
        tripData.coverImage ||
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
      startDate: tripData.startDate || "2024-03-01",
      endDate: tripData.endDate || "2024-03-07",
      durationDays: tripData.durationDays || 7,
      description: tripData.description || "Exciting customized travel journey.",
      status: "upcoming",
      estimatedBudget: tripData.estimatedBudget || 2000,
      actualExpense: tripData.actualExpense || 450,
      sections: tripData.sections || [
        {
          id: `sec-${Date.now()}-1`,
          title: "Flight & Transit Section",
          type: "travel",
          description: "Roundtrip bookings and local transit passes",
          startDate: tripData.startDate || "2024-03-01",
          endDate: tripData.startDate || "2024-03-01",
          budget: 600,
          actualCost: 550,
          destinationCity: tripData.destination || "Paris",
        },
        {
          id: `sec-${Date.now()}-2`,
          title: "Central Hotel & Stay",
          type: "stay",
          description: "Comfortable boutique stay in the city center",
          startDate: tripData.startDate || "2024-03-01",
          endDate: tripData.endDate || "2024-03-07",
          budget: 900,
          actualCost: 850,
          destinationCity: tripData.destination || "Paris",
        },
      ],
      days: [
        {
          dayNumber: 1,
          date: tripData.startDate || "2024-03-01",
          city: tripData.destination || "Paris",
          totalDayExpense: 120,
          activities: [
            {
              id: `act-${Date.now()}-1`,
              timeSlot: "11:00 AM",
              title: `Arrival & City Center Orientation`,
              description: "Check into accommodations and take a scenic orientation walk.",
              location: "City Center",
              category: "Sightseeing",
              cost: 40,
              duration: "2.5h",
            },
            {
              id: `act-${Date.now()}-2`,
              timeSlot: "07:00 PM",
              title: `Welcome Dinner & Local Tasting`,
              description: "Taste authentic traditional specialties and regional beverages.",
              location: "Historic Quarter",
              category: "Culinary",
              cost: 80,
              duration: "2h",
            },
          ],
        },
        {
          dayNumber: 2,
          date: tripData.startDate || "2024-03-02",
          city: tripData.destination || "Paris",
          totalDayExpense: 95,
          activities: [
            {
              id: `act-${Date.now()}-3`,
              timeSlot: "10:00 AM",
              title: `Top Highlights & Heritage Tour`,
              description: "Guided excursion to key landmarks and cultural museums.",
              location: "Old Town District",
              category: "Culture",
              cost: 95,
              duration: "3h",
            },
          ],
        },
      ],
      expenseBreakdown: {
        transport: 550,
        stay: 850,
        activities: 215,
        meals: 180,
        miscellaneous: 0,
      },
      isPublic: false,
      sharesCount: 0,
      likesCount: 0,
      tags: tripData.tags || ["Custom", "Adventure"],
      companionAvatars: [],
    };

    setTrips((prev) => [newTrip, ...prev]);
    setActiveTripId(newId);
    showToast("Trip Created Successfully!", `"${newTrip.title}" has been added to your itinerary manager.`, "success");
    return newTrip;
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, ...updates };
        }
        return t;
      })
    );
    showToast("Trip Updated", "All changes have been synced.", "info");
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    if (activeTripId === id) {
      const remaining = trips.filter((t) => t.id !== id);
      setActiveTripId(remaining.length > 0 ? remaining[0].id : null);
    }
    showToast("Trip Removed", "The trip has been deleted from your account.", "warning");
  };

  const addSectionToTrip = (tripId: string, section: ItinerarySection) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const updatedSections = [...t.sections, section];
          const newBudget = updatedSections.reduce((acc, curr) => acc + curr.budget, 0);
          return {
            ...t,
            sections: updatedSections,
            estimatedBudget: newBudget > 0 ? newBudget : t.estimatedBudget,
          };
        }
        return t;
      })
    );
    showToast("Section Added", `"${section.title}" added to itinerary structure.`, "success");
  };

  const deleteSectionFromTrip = (tripId: string, sectionId: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            sections: t.sections.filter((s) => s.id !== sectionId),
          };
        }
        return t;
      })
    );
    showToast("Section Removed", "Section removed from itinerary.", "info");
  };

  const addActivityToTripDay = (tripId: string, dayNumber: number, activity: ItineraryActivity) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          let dayFound = false;
          const updatedDays = t.days.map((day) => {
            if (day.dayNumber === dayNumber) {
              dayFound = true;
              return {
                ...day,
                activities: [...day.activities, activity],
                totalDayExpense: day.totalDayExpense + activity.cost,
              };
            }
            return day;
          });

          if (!dayFound) {
            updatedDays.push({
              dayNumber,
              date: t.startDate,
              city: t.destination,
              totalDayExpense: activity.cost,
              activities: [activity],
            });
          }

          const totalActual = updatedDays.reduce((acc, d) => acc + d.totalDayExpense, 0);

          return {
            ...t,
            days: updatedDays,
            actualExpense: totalActual,
          };
        }
        return t;
      })
    );
    showToast("Activity Scheduled!", `Added "${activity.title}" to Day ${dayNumber}.`, "success");
  };

  const removeActivityFromTripDay = (tripId: string, dayNumber: number, activityId: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const updatedDays = t.days.map((day) => {
            if (day.dayNumber === dayNumber) {
              const remainingActivities = day.activities.filter((a) => a.id !== activityId);
              const newDayTotal = remainingActivities.reduce((sum, a) => sum + a.cost, 0);
              return {
                ...day,
                activities: remainingActivities,
                totalDayExpense: newDayTotal,
              };
            }
            return day;
          });
          return { ...t, days: updatedDays };
        }
        return t;
      })
    );
    showToast("Activity Removed", "Activity removed from schedule.", "info");
  };

  const toggleLikePost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newLiked = !p.likedByMe;
          return {
            ...p,
            likedByMe: newLiked,
            likes: newLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const cloneCommunityTrip = (post: CommunityPost) => {
    const cloned: Partial<Trip> = {
      title: `${post.tripTitle} (Cloned)`,
      destination: post.destination,
      coverImage: post.coverImage,
      durationDays: post.daysDuration,
      estimatedBudget: post.budgetTotal,
      description: `Cloned from ${post.author.name}'s public itinerary on GlobeTrotter.`,
      tags: [...post.tags, "CommunityCopy"],
    };
    const created = createTrip(cloned);
    navigateTo("itinerary-view", created.id);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigateTo,
        user,
        updateUser,
        trips,
        activeTripId,
        activeTrip,
        setActiveTripId,
        createTrip,
        updateTrip,
        deleteTrip,
        addSectionToTrip,
        deleteSectionFromTrip,
        addActivityToTripDay,
        removeActivityFromTripDay,
        cities,
        activities,
        communityPosts,
        toggleLikePost,
        cloneCommunityTrip,
        adminStats,
        adminUsers,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedRegion,
        setSelectedRegion,
        sortByOption,
        setSortByOption,
        groupByOption,
        setGroupByOption,
        sharedModalTrip,
        setSharedModalTrip,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
