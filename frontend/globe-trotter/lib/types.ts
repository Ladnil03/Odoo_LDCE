/**
 * Domain types shared across screens, AppContext, and API client.
 */

export type ScreenType =
  | "login"
  | "register"
  | "home"
  | "create-trip"
  | "itinerary-builder"
  | "my-trips"
  | "profile"
  | "search"
  | "itinerary-view"
  | "community"
  | "calendar"
  | "admin";

export type TripStatus = "ongoing" | "upcoming" | "completed" | "draft";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
  avatar: string;
  role: "traveler" | "admin" | "moderator" | "user" | string;
  language?: string;
  currency?: string;
  travelStyle?: string[];
  totalTrips?: number;
  countriesVisited?: number;
  totalSavings?: number;
}

export interface DestinationCity {
  id: string;
  name: string;
  country: string;
  region: string | null;
  image?: string;
  tagline?: string;
  costIndex: number | string;
  popularityScore: number;
  avgDailyCost?: number;
  bestSeason?: string;
  activitiesCount?: number;
  lat?: number;
  lng?: number;
}

export interface ActivityItem {
  id: string;
  cityId?: string;
  name: string;
  city?: string;
  country?: string;
  category: "Adventure" | "Sightseeing" | "Culinary" | "Relaxation" | "Culture" | "Nature" | "transport" | "stay" | "activity" | "food" | string;
  cost: number;
  durationHours?: number;
  durationMinutes?: number;
  rating?: number;
  reviewsCount?: number;
  image?: string;
  imageUrl?: string | null;
  description: string | null;
  location?: string;
  tag?: string;
  bestTime?: string;
}

export interface ItineraryActivity {
  id: string;
  activityId?: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  costOverride?: number | null;
  timeSlot?: string;
  title: string;
  description?: string | null;
  location?: string;
  category?: string;
  cost: number;
  duration?: string;
  completed?: boolean;
}

export interface ItineraryDay {
  dayDate?: string | null;
  dayNumber?: number;
  date?: string;
  city?: string;
  activities: ItineraryActivity[];
  totalDayExpense?: number;
  dayTotal?: number;
}

export interface ItineraryStop {
  stopId: string;
  cityName: string;
  cityCountry: string;
  orderIndex: number;
  arrivalDate: string | null;
  departureDate: string | null;
  days: ItineraryDay[];
  stopTotal: number;
}

export interface ItinerarySection {
  id: string;
  title: string;
  type: "travel" | "stay" | "activity" | "dining" | "custom";
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  actualCost: number;
  destinationCity: string;
  notes?: string;
}

export interface TripExpenseBreakdown {
  transport: number;
  stay: number;
  activities: number;
  meals: number;
  miscellaneous: number;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  country?: string;
  coverImage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  durationDays: number;
  description?: string | null;
  status: TripStatus;
  estimatedBudget: number;
  actualExpense?: number;
  baseCurrency?: string;
  isPublic?: boolean;
  shareSlug?: string | null;
  sections?: ItinerarySection[];
  days?: ItineraryDay[];
  stops?: ItineraryStop[];
  expenseBreakdown?: TripExpenseBreakdown;
  sharesCount?: number;
  likesCount?: number;
  tags?: string[];
  companionAvatars?: string[];
}

export interface CommunityComment {
  id: string;
  postId: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    verified: boolean;
  };
}

export interface CommunityPost {
  id: string;
  tripId?: string;
  author: {
    id?: string;
    name: string;
    avatar?: string;
    avatarUrl?: string | null;
    location?: string | null;
    verified: boolean;
  };
  title?: string;
  tripTitle?: string;
  destination?: string | null;
  country?: string | null;
  coverImage?: string | null;
  summary?: string | null;
  daysDuration?: number;
  budgetTotal?: number;
  likes?: number;
  likesCount?: number;
  likedByMe?: boolean;
  commentsCount?: number;
  sharesCount?: number;
  clonesCount?: number;
  tags?: string[];
  createdAt?: string;
  clonedCount?: number;
  tripData?: any;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Traveler" | "Admin" | "Moderator" | "user" | "admin" | string;
  status?: "Active" | "Inactive" | "Suspended" | string;
  joinDate?: string;
  tripsCount: number;
  spentTotal?: number;
}

export interface AdminOverview {
  totalUsers: number;
  totalTrips: number;
  totalActivitiesAssigned: number;
  totalCities: number;
}

export interface AdminStats {
  totalUsers: number;
  activeTrips?: number;
  totalTrips?: number;
  totalActivitiesAssigned?: number;
  totalCities?: number;
  totalRevenue?: number;
  avgBudget?: number;
  userGrowth?: number;
  topCities?: { id?: string; name: string; tripsCount?: number; count?: number; percentage?: number; color?: string }[];
  topActivities?: { id?: string; name: string; bookings?: number; count?: number; revenue?: number }[];
  monthlyEngagement?: { month: string; users: number; trips: number }[];
  tripsOverTime?: { period: string; count: number }[];
  budgetStats?: {
    average_trip_budget: number;
    median_trip_budget: number;
    total_revenue_potential: number;
    category_distribution: Record<string, number>;
  } | null;
}

export interface BudgetSnapshot {
  tripId: string;
  totalCost: number;
  dailyBudget: number | null;
  currency: string;
  byCategory: {
    transport: number;
    stay: number;
    activity: number;
    food: number;
  };
  byDay: { dayDate: string | null; total: number; isOverbudget: boolean }[];
  byStop: { stopId: string; cityName: string; total: number }[];
}

export interface CalendarEntry {
  city: string;
  activities: {
    id: string;
    name: string;
    time: string | null;
    cost: number;
    category: string;
    durationMinutes: number;
  }[];
  dayTotal: number;
}
