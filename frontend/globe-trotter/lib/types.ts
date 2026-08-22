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

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  bio: string;
  avatar: string;
  role: "traveler" | "admin";
  language: string;
  currency: string;
  travelStyle: string[];
  totalTrips: number;
  countriesVisited: number;
  totalSavings: number;
}

export interface ActivityItem {
  id: string;
  name: string;
  city: string;
  country: string;
  category: "Adventure" | "Sightseeing" | "Culinary" | "Relaxation" | "Culture" | "Nature";
  cost: number;
  durationHours: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  location: string;
  tag: string;
  bestTime?: string;
}

export interface ItineraryActivity {
  id: string;
  activityId?: string;
  timeSlot: string;
  title: string;
  description: string;
  location: string;
  category: string;
  cost: number;
  duration: string;
  completed?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  city: string;
  activities: ItineraryActivity[];
  totalDayExpense: number;
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
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  description: string;
  status: "ongoing" | "upcoming" | "completed";
  estimatedBudget: number;
  actualExpense: number;
  sections: ItinerarySection[];
  days: ItineraryDay[];
  expenseBreakdown: TripExpenseBreakdown;
  isPublic: boolean;
  sharesCount: number;
  likesCount: number;
  tags: string[];
  companionAvatars?: string[];
}

export interface DestinationCity {
  id: string;
  name: string;
  country: string;
  region: "Europe" | "Asia" | "Americas" | "Oceania" | "Africa";
  image: string;
  tagline: string;
  costIndex: "$" | "$$" | "$$$" | "$$$$";
  popularityScore: number;
  avgDailyCost: number;
  bestSeason: string;
  activitiesCount: number;
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    location: string;
    verified: boolean;
  };
  tripTitle: string;
  destination: string;
  coverImage: string;
  summary: string;
  daysDuration: number;
  budgetTotal: number;
  likes: number;
  likedByMe?: boolean;
  commentsCount: number;
  sharesCount: number;
  tags: string[];
  createdAt: string;
  clonedCount: number;
  tripData: Partial<Trip>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Traveler" | "Admin" | "Moderator";
  status: "Active" | "Inactive" | "Suspended";
  joinDate: string;
  tripsCount: number;
  spentTotal: number;
}

export interface AdminStats {
  totalUsers: number;
  activeTrips: number;
  totalRevenue: number;
  avgBudget: number;
  userGrowth: number;
  topCities: { name: string; tripsCount: number; percentage: number; color: string }[];
  topActivities: { name: string; bookings: number; revenue: number }[];
  monthlyEngagement: { month: string; users: number; trips: number }[];
}
