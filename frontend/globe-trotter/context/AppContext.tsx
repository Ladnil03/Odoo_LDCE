"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  ScreenType,
  UserProfile,
  Trip,
  DestinationCity,
  CommunityPost,
  CommunityComment,
  AdminStats,
  AdminUser,
  AdminOverview,
  BudgetSnapshot,
  ItineraryStop,
} from "@/lib/types";
import {
  adminApi,
  authApi,
  bootstrapApi,
  budgetApi,
  catalogApi,
  communityApi,
  getAccessToken,
  itineraryApi,
  tripsApi,
} from "@/lib/api";
import {
  mapAdminStats,
  mapAdminUser,
  mapBudget,
  mapCity,
  mapCommunityComment,
  mapCommunityPost,
  mapItinerary,
  mapTrip,
} from "@/lib/format";

// ──────────────────────────────────────────────────────────
// Toast helpers
// ──────────────────────────────────────────────────────────

interface ToastInfo {
  id: string;
  title: string;
  desc?: string;
  type?: "success" | "info" | "warning" | "error";
}

interface AppContextType {
  // Navigation
  currentScreen: ScreenType;
  navigateTo: (screen: ScreenType, tripId?: string) => void;

  // Bootstrap
  bootstrapStatus: "idle" | "checking" | "running" | "ready" | "error";
  bootstrapMessage: string | null;

  // Auth & user
  user: UserProfile | null;
  isAuthed: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  switchRole: (role: "traveler" | "admin") => Promise<void>;

  // Trips
  trips: Trip[];
  tripsLoading: boolean;
  activeTripId: string | null;
  activeTrip: Trip | null;
  setActiveTripId: (id: string | null) => void;
  refreshTrips: () => Promise<void>;
  createTrip: (data: {
    title: string;
    destination: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    estimatedBudget?: number;
    coverImage?: string;
    baseCurrency?: string;
  }) => Promise<Trip>;
  deleteTrip: (id: string) => Promise<void>;
  shareTrip: (id: string) => Promise<string | null>;
  cloneTrip: (sourceId: string) => Promise<Trip | null>;

  // Itinerary
  itinerary: ItineraryStop[];
  itineraryLoading: boolean;
  itineraryTripName: string;
  itineraryTotal: number;
  refreshItinerary: (tripId: string) => Promise<void>;
  addStop: (tripId: string, cityId: string, arrival?: string, departure?: string) => Promise<void>;
  removeStop: (tripId: string, stopId: string) => Promise<void>;
  assignActivity: (
    tripId: string,
    stopId: string,
    activityId: string,
    opts?: { date?: string; time?: string },
  ) => Promise<void>;
  removeActivity: (tripId: string, tripActivityId: string) => Promise<void>;

  // Budget
  budget: BudgetSnapshot | null;
  budgetLoading: boolean;
  refreshBudget: (tripId: string) => Promise<void>;

  // Catalog
  cities: DestinationCity[];
  citiesLoading: boolean;
  refreshCities: () => Promise<void>;

  // Community
  communityPosts: CommunityPost[];
  communityLoading: boolean;
  refreshCommunity: () => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  addCommentToPost: (postId: string, body: string) => Promise<void>;
  loadComments: (postId: string) => Promise<CommunityComment[]>;
  publishTripToCommunity: (
    tripId: string,
    payload: { title: string; summary?: string; tags?: string[]; destination?: string; cover?: string; days?: number; budget?: number },
  ) => Promise<CommunityPost | null>;
  deleteCommunityPost: (postId: string) => Promise<void>;

  // Admin
  adminOverview: AdminOverview | null;
  adminStats: AdminStats | null;
  adminUsers: AdminUser[];
  adminLoading: boolean;
  refreshAdmin: () => Promise<void>;
  updateAdminUserRole: (userId: string, role: string) => Promise<void>;

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedRegion: string;
  setSelectedRegion: (r: string) => void;

  // Toasts
  toasts: ToastInfo[];
  showToast: (title: string, desc?: string, type?: ToastInfo["type"]) => void;
  removeToast: (id: string) => void;

  // Public share modal
  sharedModalTrip: Trip | null;
  openSharedTrip: (trip: Trip) => void;
  closeSharedTrip: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ── Local fallback user (used when API is offline so the demo still renders) ──
const FALLBACK_USER: UserProfile = {
  id: "guest",
  firstName: "Guest",
  lastName: "Traveller",
  email: "",
  phone: "",
  city: "",
  country: "",
  bio: "",
  avatar: "",
  role: "traveler",
  language: "English",
  currency: "USD ($)",
  travelStyle: [],
  totalTrips: 0,
  countriesVisited: 0,
  totalSavings: 0,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");

  // Bootstrap state
  const [bootstrapStatus, setBootstrapStatus] = useState<AppContextType["bootstrapStatus"]>("idle");
  const [bootstrapMessage, setBootstrapMessage] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState<UserProfile | null>(null);

  // Trips
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  // Itinerary
  const [itinerary, setItinerary] = useState<ItineraryStop[]>([]);
  const [itineraryTripName, setItineraryTripName] = useState("");
  const [itineraryTotal, setItineraryTotal] = useState(0);
  const [itineraryLoading, setItineraryLoading] = useState(false);

  // Budget
  const [budget, setBudget] = useState<BudgetSnapshot | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  // Catalog
  const [cities, setCities] = useState<DestinationCity[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Community
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);

  // Admin
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");

  // Toasts
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Shared modal
  const [sharedModalTrip, setSharedModalTrip] = useState<Trip | null>(null);

  // ── Toast helpers ──
  const showToast = useCallback(
    (title: string, desc?: string, type: ToastInfo["type"] = "info") => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { id, title, desc, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    [],
  );
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Bootstrap & Initial Auth on first mount ──
  useEffect(() => {
    let cancelled = false;
    async function init() {
      setBootstrapStatus("checking");
      try {
        const status = await bootstrapApi.status();
        if (cancelled) return;
        if (status.needs_bootstrap) {
          setBootstrapStatus("running");
          setBootstrapMessage("Preparing travel database…");
          const res = await bootstrapApi.run();
          if (cancelled) return;
          setBootstrapMessage(
            `Loaded ${res.cities_added} cities, ${res.activities_added} activities, ${res.users_added} travellers, ${res.trips_added} sample trips.`,
          );
        } else {
          setBootstrapMessage(
            `${status.cities} cities · ${status.activities} activities · ${status.users} travellers ready.`,
          );
        }
        setBootstrapStatus("ready");

        // Auto-login to demo user if no token exists in localStorage
        if (!getAccessToken()) {
          try {
            await authApi.login({ email: "demo@globetrotter.io", password: "demo12345" });
          } catch (e) {
            console.warn("Auto demo login skipped", e);
          }
        }

        if (getAccessToken()) {
          const me = await authApi.getMe();
          if (cancelled) return;
          const [first, ...rest] = (me.name ?? "").split(" ");
          setUser({
            ...FALLBACK_USER,
            id: me.id,
            firstName: first || me.name,
            lastName: rest.join(" "),
            email: me.email,
            avatar: me.avatar_url ?? FALLBACK_USER.avatar,
            role: me.role === "admin" ? "admin" : "traveler",
          });
        }
      } catch (err: any) {
        if (cancelled) return;
        setBootstrapStatus("error");
        setBootstrapMessage(err?.message ?? "Could not reach the backend.");
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthed = !!user && !!getAccessToken();
  const isAdmin = user?.role === "admin";

  // ── Trips ──
  const refreshTrips = useCallback(async () => {
    if (!getAccessToken()) {
      setTrips([]);
      return;
    }
    setTripsLoading(true);
    try {
      const res = await tripsApi.listTrips();
      const mapped = (res.items ?? []).map(mapTrip);
      setTrips(mapped);
      if (mapped.length > 0) {
        setActiveTripId((prev) => (prev ? prev : mapped[0].id));
      }
    } catch (err: any) {
      showToast("Couldn't load trips", err?.message, "error");
      setTrips([]);
    } finally {
      setTripsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (bootstrapStatus === "ready" && isAuthed) {
      refreshTrips();
    }
  }, [bootstrapStatus, isAuthed, refreshTrips]);

  // ── Catalog ──
  const refreshCities = useCallback(async () => {
    setCitiesLoading(true);
    try {
      const res = await catalogApi.searchCities();
      setCities((res.items ?? []).map(mapCity));
    } catch (err: any) {
      showToast("Couldn't load cities", err?.message, "error");
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (bootstrapStatus === "ready") {
      refreshCities();
    }
  }, [bootstrapStatus, refreshCities]);

  // ── Community ──
  const refreshCommunity = useCallback(async () => {
    setCommunityLoading(true);
    try {
      const res = await communityApi.listPosts();
      setCommunityPosts((res.items ?? []).map(mapCommunityPost));
    } catch (err: any) {
      showToast("Couldn't load community", err?.message, "error");
      setCommunityPosts([]);
    } finally {
      setCommunityLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (bootstrapStatus === "ready") {
      refreshCommunity();
    }
  }, [bootstrapStatus, refreshCommunity]);

  // ── Auth actions ──
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        await authApi.login({ email, password });
        const me = await authApi.getMe();
        const [first, ...rest] = (me.name ?? "").split(" ");
        setUser({
          ...FALLBACK_USER,
          id: me.id,
          firstName: first || me.name,
          lastName: rest.join(" "),
          email: me.email,
          avatar: me.avatar_url ?? "",
          role: me.role === "admin" ? "admin" : "traveler",
        });
        showToast("Welcome back", `Signed in as ${me.name}`, "success");
        return true;
      } catch (err: any) {
        showToast("Sign-in failed", err?.message ?? "Check your credentials", "error");
        return false;
      }
    },
    [showToast],
  );

  const signup = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      try {
        await authApi.signup({ email, password, name });
        const me = await authApi.getMe();
        const [first, ...rest] = (me.name ?? "").split(" ");
        setUser({
          ...FALLBACK_USER,
          id: me.id,
          firstName: first || name,
          lastName: rest.join(" "),
          email: me.email,
          avatar: me.avatar_url ?? "",
          role: "traveler",
        });
        showToast("Account created", `Welcome to GlobeTrotter, ${first || name}.`, "success");
        return true;
      } catch (err: any) {
        showToast("Sign-up failed", err?.message ?? "Try a different email", "error");
        return false;
      }
    },
    [showToast],
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setTrips([]);
    setActiveTripId(null);
    showToast("Signed out", "Come back soon.", "info");
    setCurrentScreen("home");
  }, [showToast]);

  const refreshMe = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      const [first, ...rest] = (me.name ?? "").split(" ");
      setUser((prev) => ({
        ...(prev ?? FALLBACK_USER),
        id: me.id,
        firstName: first || me.name,
        lastName: rest.join(" "),
        email: me.email,
        avatar: me.avatar_url ?? prev?.avatar ?? "",
        role: me.role === "admin" ? "admin" : "traveler",
      }));
    } catch (err: any) {
      showToast("Couldn't refresh profile", err?.message, "error");
    }
  }, [showToast]);

  const updateUser = useCallback(
    async (updates: Partial<UserProfile>) => {
      const name = updates.firstName || updates.lastName
        ? `${updates.firstName ?? user?.firstName ?? ""} ${updates.lastName ?? user?.lastName ?? ""}`.trim()
        : undefined;
      try {
        await authApi.updateProfile({
          name,
          avatar_url: updates.avatar,
        });
        setUser((prev) => (prev ? { ...prev, ...updates } : prev));
        showToast("Profile updated", "Your changes have been saved.", "success");
      } catch (err: any) {
        // Apply locally anyway so the user sees feedback
        setUser((prev) => (prev ? { ...prev, ...updates } : prev));
        showToast("Saved locally", "Couldn't sync to the server yet.", "warning");
      }
    },
    [showToast, user?.firstName, user?.lastName],
  );

  // ── Trip mutations ──
  const createTrip = useCallback(
    async (data: {
      title: string;
      destination: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      estimatedBudget?: number;
      coverImage?: string;
      baseCurrency?: string;
    }): Promise<Trip> => {
      try {
        const res = await tripsApi.createTrip({
          name: data.title,
          description: data.description,
          start_date: data.startDate,
          end_date: data.endDate,
          cover_photo: data.coverImage,
          daily_budget: data.estimatedBudget,
          base_currency: data.baseCurrency ?? "USD",
        });
        const trip = mapTrip(res);
        setTrips((prev) => [trip, ...prev]);
        setActiveTripId(trip.id);
        showToast("Trip created", `"${trip.title}" is ready to plan.`, "success");
        return trip;
      } catch (err: any) {
        showToast("Couldn't create trip", err?.message, "error");
        throw err;
      }
    },
    [showToast],
  );

  const deleteTrip = useCallback(
    async (id: string) => {
      try {
        await tripsApi.deleteTrip(id);
        setTrips((prev) => prev.filter((t) => t.id !== id));
        setActiveTripId((prev) => (prev === id ? null : prev));
        showToast("Trip deleted", "It's been removed from your account.", "info");
      } catch (err: any) {
        showToast("Couldn't delete trip", err?.message, "error");
      }
    },
    [showToast],
  );

  const shareTrip = useCallback(
    async (id: string): Promise<string | null> => {
      try {
        const res = await tripsApi.shareTrip(id);
        setTrips((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isPublic: true, shareSlug: res.share_slug } : t)),
        );
        showToast("Trip shared", "Anyone with the link can view it now.", "success");
        return res.share_slug;
      } catch (err: any) {
        showToast("Couldn't share", err?.message, "error");
        return null;
      }
    },
    [showToast],
  );

  const cloneTrip = useCallback(
    async (sourceId: string): Promise<Trip | null> => {
      try {
        const res = await tripsApi.copyTrip(sourceId);
        await refreshTrips();
        showToast("Trip copied", "It's now in your account.", "success");
        return trips.find((t) => t.id === res.new_trip_id) ?? null;
      } catch (err: any) {
        showToast("Couldn't copy", err?.message, "error");
        return null;
      }
    },
    [refreshTrips, showToast, trips],
  );

  // ── Itinerary ──
  const refreshItinerary = useCallback(
    async (tripId: string) => {
      setItineraryLoading(true);
      try {
        const res = await itineraryApi.getFullItinerary(tripId);
        const mapped = mapItinerary(res);
        setItinerary(mapped.stops);
        setItineraryTripName(mapped.tripName);
        setItineraryTotal(mapped.totalCost);
      } catch (err: any) {
        showToast("Couldn't load itinerary", err?.message, "error");
        setItinerary([]);
      } finally {
        setItineraryLoading(false);
      }
    },
    [showToast],
  );

  const addStop = useCallback(
    async (tripId: string, cityId: string, arrival?: string, departure?: string) => {
      try {
        await tripsApi.getTrip(tripId); // ensure ownership
      } catch {
        // ignore
      }
      try {
        // use stopsApi directly
        const { stopsApi } = await import("@/lib/api");
        await stopsApi.addStop(tripId, {
          city_id: cityId,
          arrival_date: arrival,
          departure_date: departure,
        });
        await refreshItinerary(tripId);
        showToast("Stop added", "A new city is on your itinerary.", "success");
      } catch (err: any) {
        showToast("Couldn't add stop", err?.message, "error");
      }
    },
    [refreshItinerary, showToast],
  );

  const removeStop = useCallback(
    async (tripId: string, stopId: string) => {
      try {
        const { stopsApi } = await import("@/lib/api");
        await stopsApi.removeStop(tripId, stopId);
        await refreshItinerary(tripId);
        showToast("Stop removed", "Itinerary updated.", "info");
      } catch (err: any) {
        showToast("Couldn't remove stop", err?.message, "error");
      }
    },
    [refreshItinerary, showToast],
  );

  const assignActivity = useCallback(
    async (
      tripId: string,
      stopId: string,
      activityId: string,
      opts?: { date?: string; time?: string },
    ) => {
      try {
        await itineraryApi.assignActivity(tripId, stopId, {
          activity_id: activityId,
          scheduled_date: opts?.date,
          scheduled_time: opts?.time,
        });
        await refreshItinerary(tripId);
        showToast("Activity added", "It's been slotted into your day.", "success");
      } catch (err: any) {
        showToast("Couldn't add activity", err?.message, "error");
      }
    },
    [refreshItinerary, showToast],
  );

  const removeActivity = useCallback(
    async (tripId: string, tripActivityId: string) => {
      try {
        await itineraryApi.removeActivity(tripId, tripActivityId);
        await refreshItinerary(tripId);
        showToast("Activity removed", "Your day is lighter.", "info");
      } catch (err: any) {
        showToast("Couldn't remove activity", err?.message, "error");
      }
    },
    [refreshItinerary, showToast],
  );

  // ── Budget ──
  const refreshBudget = useCallback(
    async (tripId: string) => {
      setBudgetLoading(true);
      try {
        const res = await budgetApi.getFullBudget(tripId);
        setBudget(mapBudget(res));
      } catch (err: any) {
        showToast("Couldn't load budget", err?.message, "error");
        setBudget(null);
      } finally {
        setBudgetLoading(false);
      }
    },
    [showToast],
  );

  // Sync active trip itinerary & budget automatically
  useEffect(() => {
    if (activeTripId) {
      refreshItinerary(activeTripId);
      refreshBudget(activeTripId);
    }
  }, [activeTripId, refreshItinerary, refreshBudget]);

  const switchRole = useCallback(
    async (targetRole: "traveler" | "admin") => {
      try {
        if (targetRole === "admin") {
          await login("admin@globetrotter.io", "admin12345");
          showToast("Switched to SuperAdmin Role", "Elevated with full RBAC permissions.", "success");
          setCurrentScreen("admin");
        } else {
          await login("demo@globetrotter.io", "demo12345");
          showToast("Switched to Traveler Role", "Signed in as Aarav Shah.", "info");
          setCurrentScreen("home");
        }
      } catch (err: any) {
        showToast("Role Switch Failed", err?.message, "error");
      }
    },
    [login, showToast],
  );

  // ── Community mutations ──
  const toggleLikePost = useCallback(
    async (postId: string) => {
      // Optimistic update
      setCommunityPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const currentLikes = p.likesCount ?? p.likes ?? 0;
          const nextLikes = Math.max(0, currentLikes + (p.likedByMe ? -1 : 1));
          return {
            ...p,
            likedByMe: !p.likedByMe,
            likesCount: nextLikes,
            likes: nextLikes,
          };
        }),
      );
      try {
        const res = await communityApi.toggleLike(postId);
        setCommunityPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likedByMe: res.liked, likesCount: res.likes_count, likes: res.likes_count }
              : p,
          ),
        );
      } catch (err: any) {
        // Revert
        setCommunityPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            const currentLikes = p.likesCount ?? p.likes ?? 0;
            const nextLikes = Math.max(0, currentLikes + (p.likedByMe ? -1 : 1));
            return {
              ...p,
              likedByMe: !p.likedByMe,
              likesCount: nextLikes,
              likes: nextLikes,
            };
          }),
        );
        showToast("Couldn't update like", err?.message, "error");
      }
    },
    [showToast],
  );

  const addCommentToPost = useCallback(
    async (postId: string, body: string) => {
      try {
        await communityApi.addComment(postId, body);
        setCommunityPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentsCount: (p.commentsCount ?? 0) + 1 } : p)),
        );
        showToast("Comment posted", "Thanks for joining the conversation.", "success");
      } catch (err: any) {
        showToast("Couldn't post comment", err?.message, "error");
      }
    },
    [showToast],
  );

  const deleteCommunityPost = useCallback(
    async (postId: string) => {
      try {
        await communityApi.deletePost(postId);
        setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
        showToast("Post removed", "The post has been deleted.", "success");
      } catch (err: any) {
        showToast("Deletion failed", err?.message, "error");
      }
    },
    [showToast],
  );

  const loadComments = useCallback(async (postId: string): Promise<CommunityComment[]> => {
    try {
      const res = await communityApi.listComments(postId);
      return res.map(mapCommunityComment);
    } catch {
      return [];
    }
  }, []);

  const publishTripToCommunity = useCallback(
    async (
      tripId: string,
      payload: { title: string; summary?: string; tags?: string[]; destination?: string; cover?: string; days?: number; budget?: number },
    ): Promise<CommunityPost | null> => {
      try {
        const res = await communityApi.createPost({
          trip_id: tripId,
          title: payload.title,
          summary: payload.summary,
          destination: payload.destination,
          cover_image: payload.cover,
          tags: payload.tags ?? [],
          days_duration: payload.days ?? 0,
          budget_total: payload.budget ?? 0,
        });
        const post = mapCommunityPost(res);
        setCommunityPosts((prev) => [post, ...prev]);
        showToast("Published to community", "Others can now discover your itinerary.", "success");
        return post;
      } catch (err: any) {
        showToast("Couldn't publish", err?.message, "error");
        return null;
      }
    },
    [showToast],
  );

  // ── Admin ──
  const refreshAdmin = useCallback(async () => {
    if (!isAdmin) return;
    setAdminLoading(true);
    try {
      const [overview, topCities, topActivities, budgetStats, users] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getTopCities(8),
        adminApi.getTopActivities(8),
        adminApi.getBudgetStats(),
        adminApi.listUsers(1, 100),
      ]);
      setAdminOverview({
        totalUsers: overview.total_users ?? 0,
        totalTrips: overview.total_trips ?? 0,
        totalActivitiesAssigned: overview.total_activities_assigned ?? 0,
        totalCities: overview.total_cities ?? 0,
      });
      setAdminUsers((users.items ?? []).map(mapAdminUser));
      setAdminStats(
        mapAdminStats({
          ...overview,
          top_cities: topCities.cities,
          top_activities: topActivities.activities,
          budget_stats: budgetStats,
        }),
      );
    } catch (err: any) {
      showToast("Couldn't load admin data", err?.message, "error");
    } finally {
      setAdminLoading(false);
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    if (isAdmin && bootstrapStatus === "ready") {
      refreshAdmin();
    }
  }, [isAdmin, bootstrapStatus, refreshAdmin]);

  const updateAdminUserRole = useCallback(
    async (userId: string, role: string) => {
      try {
        await adminApi.updateUserRole(userId, role);
        setAdminUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
        showToast("Role updated", "Permissions have been changed.", "success");
      } catch (err: any) {
        showToast("Couldn't update role", err?.message, "error");
      }
    },
    [showToast],
  );

  // ── Navigation ──
  const navigateTo = useCallback(
    (screen: ScreenType, tripId?: string) => {
      if (screen === "admin" && !isAdmin) {
        showToast(
          "Admin only",
          "This area is reserved for administrators.",
          "warning",
        );
        return;
      }
      if (tripId) setActiveTripId(tripId);
      setCurrentScreen(screen);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [isAdmin, showToast],
  );

  const openSharedTrip = useCallback((trip: Trip) => setSharedModalTrip(trip), []);
  const closeSharedTrip = useCallback(() => setSharedModalTrip(null), []);

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId) ?? trips[0] ?? null,
    [trips, activeTripId],
  );

  const value: AppContextType = {
    currentScreen,
    navigateTo,
    bootstrapStatus,
    bootstrapMessage,
    user,
    isAuthed,
    isAdmin,
    login,
    signup,
    logout,
    refreshMe,
    updateUser,
    switchRole,
    trips,
    tripsLoading,
    activeTripId,
    activeTrip,
    setActiveTripId,
    refreshTrips,
    createTrip,
    deleteTrip,
    shareTrip,
    cloneTrip,
    itinerary,
    itineraryLoading,
    itineraryTripName,
    itineraryTotal,
    refreshItinerary,
    addStop,
    removeStop,
    assignActivity,
    removeActivity,
    budget,
    budgetLoading,
    refreshBudget,
    cities,
    citiesLoading,
    refreshCities,
    communityPosts,
    communityLoading,
    refreshCommunity,
    toggleLikePost,
    addCommentToPost,
    loadComments,
    publishTripToCommunity,
    deleteCommunityPost,
    adminOverview,
    adminStats,
    adminUsers,
    adminLoading,
    refreshAdmin,
    updateAdminUserRole,
    searchQuery,
    setSearchQuery,
    selectedRegion,
    setSelectedRegion,
    toasts,
    showToast,
    removeToast,
    sharedModalTrip,
    openSharedTrip,
    closeSharedTrip,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
