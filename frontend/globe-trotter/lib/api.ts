/**
 * GlobeTrotter Typed API Client
 * ─────────────────────────────────────────────────────────
 * Single source of truth for backend calls. Adds:
 *   • automatic JWT refresh on 401
 *   • in-memory cache of the last error so screens can show context
 *   • type signatures that match `lib/types.ts`
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ── Token storage ────────────────────────────────────────
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gt_access_token");
}
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gt_refresh_token");
}
export function setTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("gt_access_token", access);
  localStorage.setItem("gt_refresh_token", refresh);
}
export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("gt_access_token");
  localStorage.removeItem("gt_refresh_token");
}

// ── Core fetch wrapper with auto-refresh ─────────────────
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new ApiNetworkError(`Could not reach ${url}. Is the backend running?`);
  }

  // Auto-refresh on 401 (except for the auth endpoints themselves)
  if (
    response.status === 401 &&
    endpoint !== "/auth/login" &&
    endpoint !== "/auth/refresh" &&
    endpoint !== "/auth/signup"
  ) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const newTokens = await refreshRes.json();
          setTokens(newTokens.access_token, newTokens.refresh_token);
          headers.set("Authorization", `Bearer ${newTokens.access_token}`);
          response = await fetch(url, { ...options, headers });
        } else {
          clearTokens();
        }
      } catch {
        clearTokens();
      }
    }
  }

  if (response.status === 204) return {} as T;

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.detail) detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch {
      // ignore JSON parse failure
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as T;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
export class ApiNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiNetworkError";
  }
}

// ── Bootstrap ────────────────────────────────────────────
export const bootstrapApi = {
  async status() {
    return await apiRequest<{
      needs_bootstrap: boolean;
      cities: number;
      activities: number;
      users: number;
      trips: number;
      community_posts: number;
    }>("/bootstrap/status");
  },
  async run() {
    return await apiRequest<{
      ok: boolean;
      message: string;
      cities_added: number;
      activities_added: number;
      users_added: number;
      trips_added: number;
      posts_added: number;
    }>("/bootstrap/run", { method: "POST" });
  },
};

// ── Auth ─────────────────────────────────────────────────
export const authApi = {
  async signup(data: { email: string; password: string; name: string }) {
    const res = await apiRequest<{ access_token: string; refresh_token: string; token_type: string }>(
      "/auth/signup",
      { method: "POST", body: JSON.stringify(data) },
    );
    setTokens(res.access_token, res.refresh_token);
    return res;
  },
  async login(data: { email: string; password: string }) {
    const res = await apiRequest<{ access_token: string; refresh_token: string; token_type: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(data) },
    );
    setTokens(res.access_token, res.refresh_token);
    return res;
  },
  async getMe() {
    return await apiRequest<{
      id: string;
      email: string;
      name: string;
      avatar_url?: string | null;
      role: string;
      created_at: string;
    }>("/auth/me");
  },
  async updateProfile(data: { name?: string; avatar_url?: string | null }) {
    return await apiRequest("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return await apiRequest<{ avatar_url: string; message: string }>(
      "/auth/avatar",
      { method: "POST", body: formData },
    );
  },
  logout() {
    clearTokens();
  },
};

// ── Trips ────────────────────────────────────────────────
export const tripsApi = {
  async listTrips(page = 1, pageSize = 50) {
    return await apiRequest<{
      items: any[];
      total: number;
      page: number;
      page_size: number;
    }>(`/trips?page=${page}&page_size=${pageSize}`);
  },
  async getTrip(tripId: string) {
    return await apiRequest(`/trips/${tripId}`);
  },
  async createTrip(data: {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    cover_photo?: string;
    daily_budget?: number;
    base_currency?: string;
  }) {
    return await apiRequest("/trips", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  async updateTrip(tripId: string, data: any) {
    return await apiRequest(`/trips/${tripId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  async deleteTrip(tripId: string) {
    return await apiRequest(`/trips/${tripId}`, { method: "DELETE" });
  },
  async shareTrip(tripId: string) {
    return await apiRequest<{ share_slug: string; public_url: string }>(
      `/trips/${tripId}/share`,
      { method: "POST" },
    );
  },
  async unshareTrip(tripId: string) {
    return await apiRequest(`/trips/${tripId}/share`, { method: "DELETE" });
  },
  async copyTrip(tripId: string) {
    return await apiRequest<{ new_trip_id: string; message: string }>(
      `/trips/${tripId}/copy`,
      { method: "POST" },
    );
  },
  async getPublicTrip(slug: string) {
    return await apiRequest(`/public/trips/${slug}`);
  },
};

// ── Stops ────────────────────────────────────────────────
export const stopsApi = {
  async listStops(tripId: string) {
    return await apiRequest<any[]>(`/trips/${tripId}/stops`);
  },
  async addStop(tripId: string, data: { city_id: string; arrival_date?: string; departure_date?: string }) {
    return await apiRequest(`/trips/${tripId}/stops`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  async removeStop(tripId: string, stopId: string) {
    return await apiRequest(`/trips/${tripId}/stops/${stopId}`, {
      method: "DELETE",
    });
  },
  async reorderStops(tripId: string, orderedIds: string[]) {
    return await apiRequest<any[]>(`/trips/${tripId}/stops/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ ordered_ids: orderedIds }),
    });
  },
};

// ── Catalog ──────────────────────────────────────────────
export const catalogApi = {
  async searchCities(query?: string, country?: string, region?: string) {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (country) params.append("country", country);
    if (region) params.append("region", region);
    return await apiRequest<{ items: any[]; total: number }>(
      `/cities?${params.toString()}`,
    );
  },
  async getCity(cityId: string) {
    return await apiRequest(`/cities/${cityId}`);
  },
  async searchActivities(opts: {
    query?: string;
    city_id?: string;
    category?: string;
    max_cost?: number;
    max_duration?: number;
  } = {}) {
    const params = new URLSearchParams();
    if (opts.query) params.append("query", opts.query);
    if (opts.city_id) params.append("city_id", opts.city_id);
    if (opts.category && opts.category !== "All") params.append("category", opts.category.toLowerCase());
    if (opts.max_cost) params.append("max_cost", String(opts.max_cost));
    if (opts.max_duration) params.append("max_duration", String(opts.max_duration));
    return await apiRequest<{ items: any[]; total: number }>(
      `/activities?${params.toString()}`,
    );
  },
  async getCityActivities(cityId: string, category?: string) {
    const params = category ? `?category=${category.toLowerCase()}` : "";
    return await apiRequest<any[]>(`/cities/${cityId}/activities${params}`);
  },
};

// ── Itinerary ────────────────────────────────────────────
export const itineraryApi = {
  async getFullItinerary(tripId: string) {
    return await apiRequest(`/trips/${tripId}/itinerary`);
  },
  async assignActivity(
    tripId: string,
    stopId: string,
    data: {
      activity_id: string;
      scheduled_date?: string;
      scheduled_time?: string;
      cost_override?: number;
    },
  ) {
    return await apiRequest(`/trips/${tripId}/stops/${stopId}/activities`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  async removeActivity(tripId: string, tripActivityId: string) {
    return await apiRequest(`/trips/${tripId}/itinerary/activities/${tripActivityId}`, {
      method: "DELETE",
    });
  },
  async rescheduleActivity(
    tripActivityId: string,
    data: { new_date?: string; new_time?: string; new_order_index?: number },
  ) {
    return await apiRequest(`/trip-activities/${tripActivityId}/reschedule`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  async getCalendarView(tripId: string) {
    return await apiRequest<{ trip_id: string; calendar: Record<string, any> }>(
      `/trips/${tripId}/calendar`,
    );
  },
};

// ── Budget ───────────────────────────────────────────────
export const budgetApi = {
  async getFullBudget(tripId: string) {
    return await apiRequest(`/trips/${tripId}/budget`);
  },
};

// ── Admin ────────────────────────────────────────────────
export const adminApi = {
  async getOverview() {
    return await apiRequest<{
      total_users: number;
      total_trips: number;
      total_activities_assigned: number;
      total_cities: number;
    }>("/admin/analytics/overview");
  },
  async getTripsOverTime(bucket: "week" | "month" = "month") {
    return await apiRequest<{ buckets: { period: string; count: number }[]; bucket_type: string }>(
      `/admin/analytics/trips-over-time?bucket=${bucket}`,
    );
  },
  async getTopCities(limit = 8) {
    return await apiRequest<{ cities: { id: string; name: string; count: number }[] }>(
      `/admin/analytics/top-cities?limit=${limit}`,
    );
  },
  async getTopActivities(limit = 8) {
    return await apiRequest<{ activities: { id: string; name: string; count: number }[] }>(
      `/admin/analytics/top-activities?limit=${limit}`,
    );
  },
  async getBudgetStats() {
    return await apiRequest<{
      average_trip_budget: number;
      median_trip_budget: number;
      total_revenue_potential: number;
      category_distribution: Record<string, number>;
    }>("/admin/analytics/budget-stats");
  },
  async listUsers(page = 1, pageSize = 50) {
    return await apiRequest<{
      items: any[];
      total: number;
      page: number;
      page_size: number;
    }>(`/admin/users?page=${page}&page_size=${pageSize}`);
  },
  async updateUserRole(userId: string, role: string) {
    return await apiRequest(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
};

// ── Community ────────────────────────────────────────────
export const communityApi = {
  async listPosts(page = 1, pageSize = 20) {
    return await apiRequest<{
      items: any[];
      total: number;
      page: number;
      page_size: number;
    }>(`/community/posts?page=${page}&page_size=${pageSize}`);
  },
  async createPost(data: {
    trip_id: string;
    title: string;
    summary?: string;
    destination?: string;
    country?: string;
    cover_image?: string;
    tags?: string[];
    days_duration?: number;
    budget_total?: number;
  }) {
    return await apiRequest("/community/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  async toggleLike(postId: string) {
    return await apiRequest<{ liked: boolean; likes_count: number }>(
      `/community/posts/${postId}/like`,
      { method: "POST" },
    );
  },
  async addComment(postId: string, body: string) {
    return await apiRequest(`/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },
  async listComments(postId: string) {
    return await apiRequest<any[]>(`/community/posts/${postId}/comments`);
  },
  async deletePost(postId: string) {
    return await apiRequest(`/community/posts/${postId}`, { method: "DELETE" });
  },
};
