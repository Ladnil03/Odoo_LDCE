/**
 * Mappers from backend response shapes → UI-facing domain types.
 * Keeping these in one place means the rest of the UI never sees UUIDs,
 * snake_case, or backend-specific field names.
 */

import type {
  Trip,
  TripStatus,
  DestinationCity,
  ActivityItem,
  CommunityPost,
  CommunityComment,
  AdminUser,
  AdminStats,
  CalendarEntry,
  ItineraryStop,
  ItineraryDay,
  ItineraryActivity,
  BudgetSnapshot,
} from "./types";

// ── Cities ───────────────────────────────────────────────
export function mapCity(raw: any): DestinationCity {
  return {
    id: raw.id,
    name: raw.name,
    country: raw.country,
    region: raw.region ?? null,
    costIndex: typeof raw.cost_index === "number" ? raw.cost_index : 1.0,
    popularityScore: raw.popularity_score ?? 0,
    lat: raw.lat ?? 0,
    lng: raw.lng ?? 0,
  };
}

// ── Activities ───────────────────────────────────────────
const CATEGORY_LABEL: Record<string, string> = {
  transport: "Transport",
  stay: "Stay",
  activity: "Activity",
  food: "Food",
};

export function categoryLabel(c: string): string {
  return CATEGORY_LABEL[c] ?? c;
}

export function mapActivity(raw: any): ActivityItem {
  return {
    id: raw.id,
    cityId: raw.city_id,
    name: raw.name,
    category: (raw.category ?? "activity") as ActivityItem["category"],
    cost: Number(raw.cost ?? 0),
    durationMinutes: raw.duration_minutes ?? 0,
    description: raw.description ?? null,
    imageUrl: raw.image_url ?? null,
  };
}

// ── Trips ────────────────────────────────────────────────
function daysBetween(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1);
}

function deriveStatus(start: string | null, end: string | null): TripStatus {
  if (!start) return "draft";
  const today = new Date();
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  if (today < s) return "upcoming";
  if (today > e) return "completed";
  return "ongoing";
}

export function mapTrip(raw: any): Trip {
  const duration = daysBetween(raw.start_date, raw.end_date);
  return {
    id: raw.id,
    title: raw.name ?? "Untitled trip",
    destination: raw.name?.split("→").pop()?.trim() ?? "Unknown",
    country: "",
    coverImage: raw.cover_photo ?? null,
    startDate: raw.start_date ?? null,
    endDate: raw.end_date ?? null,
    durationDays: duration,
    description: raw.description ?? null,
    status: deriveStatus(raw.start_date, raw.end_date),
    estimatedBudget: Number(raw.daily_budget ?? 0) * duration,
    actualExpense: 0,
    baseCurrency: raw.base_currency ?? "USD",
    isPublic: !!raw.is_public,
    shareSlug: raw.share_slug ?? null,
    sections: [],
    days: [],
    stops: [],
    expenseBreakdown: { transport: 0, stay: 0, activities: 0, meals: 0, miscellaneous: 0 },
    likesCount: 0,
    sharesCount: 0,
    tags: [],
  };
}

// ── Itinerary ────────────────────────────────────────────
function formatTime(timeStr: string | null): string {
  if (!timeStr) return "Anytime";
  const [h, m] = timeStr.split(":");
  const hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${ampm}`;
}

function formatDuration(min: number): string {
  if (!min) return "—";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function mapItinerary(raw: any): {
  tripName: string;
  stops: ItineraryStop[];
  totalCost: number;
} {
  return {
    tripName: raw.trip_name ?? "Untitled trip",
    stops: (raw.stops ?? []).map((s: any) => mapStop(s)),
    totalCost: Number(raw.total_cost ?? 0),
  };
}

export function mapStop(raw: any): ItineraryStop {
  return {
    stopId: raw.stop_id,
    cityName: raw.city_name ?? "Unknown",
    cityCountry: raw.city_country ?? "",
    orderIndex: raw.order_index ?? 0,
    arrivalDate: raw.arrival_date ?? null,
    departureDate: raw.departure_date ?? null,
    days: (raw.days ?? []).map((d: any) => mapDay(d)),
    stopTotal: Number(raw.stop_total ?? 0),
  };
}

function mapDay(raw: any): ItineraryDay {
  return {
    dayDate: raw.day_date ?? null,
    activities: (raw.activities ?? []).map((a: any) => mapItineraryActivity(a)),
    dayTotal: Number(raw.day_total ?? 0),
  };
}

export function mapItineraryActivity(raw: any): ItineraryActivity {
  const activity = raw.activity;
  const title = activity?.name ?? "Untitled activity";
  const category = activity?.category ?? "activity";
  const cost = Number(raw.cost_override ?? activity?.cost ?? 0);
  const durationMin = activity?.duration_minutes ?? 0;
  return {
    id: raw.id,
    activityId: activity?.id,
    scheduledDate: raw.scheduled_date ?? null,
    scheduledTime: formatTime(raw.scheduled_time),
    costOverride: raw.cost_override ?? null,
    title,
    description: activity ? null : "Activity deleted",
    category,
    cost,
    duration: formatDuration(durationMin),
  };
}

// ── Community ────────────────────────────────────────────
export function mapCommunityPost(raw: any): CommunityPost {
  return {
    id: raw.id,
    tripId: raw.trip_id,
    author: {
      id: raw.author?.id ?? "",
      name: raw.author?.name ?? "Unknown",
      avatarUrl: raw.author?.avatar_url ?? null,
      location: raw.author?.location ?? null,
      verified: !!raw.author?.verified,
    },
    title: raw.title ?? "",
    summary: raw.summary ?? null,
    destination: raw.destination ?? null,
    country: raw.country ?? null,
    coverImage: raw.cover_image ?? null,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    daysDuration: raw.days_duration ?? 0,
    budgetTotal: Number(raw.budget_total ?? 0),
    likesCount: raw.likes_count ?? 0,
    commentsCount: raw.comments_count ?? 0,
    sharesCount: raw.shares_count ?? 0,
    clonesCount: raw.clones_count ?? 0,
    createdAt: raw.created_at ?? "",
    likedByMe: !!raw.liked_by_me,
  };
}

export function mapCommunityComment(raw: any): CommunityComment {
  return {
    id: raw.id,
    postId: raw.post_id,
    body: raw.body ?? "",
    createdAt: raw.created_at ?? "",
    author: {
      id: raw.author?.id ?? "",
      name: raw.author?.name ?? "Unknown",
      avatarUrl: raw.author?.avatar_url ?? null,
      verified: !!raw.author?.verified,
    },
  };
}

// ── Admin ────────────────────────────────────────────────
export function mapAdminUser(raw: any): AdminUser {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    role: raw.role,
    joinDate: raw.created_at?.split("T")[0] ?? "",
    tripsCount: raw.trip_count ?? 0,
  };
}

export function mapAdminStats(raw: any): AdminStats {
  return {
    totalUsers: raw.total_users ?? 0,
    totalTrips: raw.total_trips ?? 0,
    totalActivitiesAssigned: raw.total_activities_assigned ?? 0,
    totalCities: raw.total_cities ?? 0,
    topCities: raw.top_cities ?? [],
    topActivities: raw.top_activities ?? [],
    tripsOverTime: raw.trips_over_time ?? [],
    budgetStats: raw.budget_stats ?? null,
  };
}

// ── Calendar ─────────────────────────────────────────────
export function mapCalendar(raw: any): Record<string, CalendarEntry> {
  return raw.calendar ?? {};
}

// ── Budget ───────────────────────────────────────────────
export function mapBudget(raw: any): BudgetSnapshot {
  return {
    tripId: raw.trip_id,
    totalCost: Number(raw.total_cost ?? 0),
    dailyBudget: raw.daily_budget ?? null,
    currency: raw.currency ?? "USD",
    byCategory: {
      transport: Number(raw.by_category?.transport ?? 0),
      stay: Number(raw.by_category?.stay ?? 0),
      activity: Number(raw.by_category?.activity ?? 0),
      food: Number(raw.by_category?.food ?? 0),
    },
    byDay: (raw.by_day ?? []).map((d: any) => ({
      dayDate: d.day_date,
      total: Number(d.total ?? 0),
      isOverbudget: !!d.is_overbudget,
    })),
    byStop: (raw.by_stop ?? []).map((s: any) => ({
      stopId: s.stop_id,
      cityName: s.city_name,
      total: Number(s.total ?? 0),
    })),
  };
}

// ── Format helpers ───────────────────────────────────────
export function formatCurrency(value: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

export function formatDate(value: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", opts).format(new Date(value));
  } catch {
    return value;
  }
}

export function relativeTime(iso: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.round(d / 30);
  return `${mo}mo ago`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
