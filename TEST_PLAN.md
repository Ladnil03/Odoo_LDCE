# GlobeTrotter — Master QA Test Plan

## 1. System Inventory

### 1.1 API Endpoints Inventory

| Router / Module | Method | Path | Auth Required | Permissions / Role | Description |
|---|---|---|---|---|---|
| **Health** | `GET` | `/health` | No | Public | Service health & liveness probe |
| **Auth** | `POST` | `/auth/signup` | No | Public | Register new user account |
| **Auth** | `POST` | `/auth/login` | No | Public | Authenticate user & issue JWT pair |
| **Auth** | `POST` | `/auth/refresh` | No | Bearer (Refresh Token) | Rotate / refresh access token |
| **Auth** | `GET` | `/auth/me` | Yes | Authenticated (`user` / `admin`) | Fetch current user profile |
| **Trips** | `POST` | `/trips` | Yes | `user` / `admin` | Create new trip |
| **Trips** | `GET` | `/trips` | Yes | `user` / `admin` | List user's active trips (paginated) |
| **Trips** | `GET` | `/trips/{trip_id}` | Yes | Owner (`user` / `admin`) | Get trip detail with stops |
| **Trips** | `PATCH` | `/trips/{trip_id}` | Yes | Owner (`user` / `admin`) | Update trip metadata/budget |
| **Trips** | `DELETE` | `/trips/{trip_id}` | Yes | Owner (`user` / `admin`) | Soft-delete trip |
| **Trips** | `POST` | `/trips/{trip_id}/share` | Yes | Owner (`user` / `admin`) | Generate share slug & enable public view |
| **Trips** | `DELETE` | `/trips/{trip_id}/share` | Yes | Owner (`user` / `admin`) | Revoke public sharing |
| **Trips** | `GET` | `/trips/public/{slug}` | No | Public | View public shared trip (read-only) |
| **Trips** | `POST` | `/trips/{trip_id}/copy` | Yes | `user` / `admin` (Owner or Public) | Deep-clone trip + stops + activities |
| **Stops** | `POST` | `/trips/{trip_id}/stops` | Yes | Trip Owner | Append a city stop to trip |
| **Stops** | `GET` | `/trips/{trip_id}/stops` | Yes | Trip Owner | List stops in itinerary order |
| **Stops** | `DELETE` | `/trips/{trip_id}/stops/{stop_id}` | Yes | Trip Owner | Remove stop & compact index |
| **Stops** | `PUT` | `/trips/{trip_id}/stops/reorder` | Yes | Trip Owner | Atomically reorder stops sequence |
| **Catalog** | `GET` | `/cities` | No | Public | List / search destination cities |
| **Catalog** | `GET` | `/cities/search` | No | Public | FTS search & filter destination cities |
| **Catalog** | `GET` | `/cities/{city_id}` | No | Public | Retrieve destination city detail |
| **Catalog** | `GET` | `/cities/{city_id}/activities` | No | Public | List bookable activities in a city |
| **Catalog** | `GET` | `/activities` | No | Public | List / filter activities |
| **Catalog** | `GET` | `/activities/search` | No | Public | Search activities by category/cost/duration |
| **Catalog** | `GET` | `/activities/{activity_id}` | No | Public | Retrieve activity detail |
| **Itinerary** | `GET` | `/trips/{trip_id}/itinerary` | Yes | Trip Owner | Hierarchical Stop → Day → Activity view |
| **Itinerary** | `POST` | `/trips/{trip_id}/stops/{stop_id}/activities` | Yes | Trip Owner | Assign activity to stop with schedule |
| **Itinerary** | `DELETE` | `/trips/{trip_id}/stops/{stop_id}/activities/{activity_id}` | Yes | Trip Owner | Remove activity from stop |
| **Itinerary** | `DELETE` | `/trips/{trip_id}/itinerary/activities/{activity_id}` | Yes | Trip Owner | Remove activity by assignment ID |
| **Itinerary** | `PATCH` | `/trips/{trip_id}/stops/{stop_id}/activities/{activity_id}` | Yes | Trip Owner | Update date/time/cost override |
| **Itinerary** | `GET` | `/trips/{trip_id}/calendar` | Yes | Trip Owner | Date-keyed calendar schedule structure |
| **Itinerary** | `GET` | `/trips/{trip_id}/itinerary/calendar` | Yes | Trip Owner | Alias calendar endpoint |
| **Itinerary** | `PATCH` | `/trip-activities/{trip_activity_id}/reschedule` | Yes | Trip Owner | Fast drag-and-drop reschedule |
| **Budget** | `GET` | `/trips/{trip_id}/budget` | Yes | Trip Owner | Full CTE budget breakdown (total/cat/day/stop) |
| **Budget** | `GET` | `/trips/{trip_id}/budget/daily` | Yes | Trip Owner | Per-day budget with overbudget flags |
| **Budget** | `GET` | `/trips/{trip_id}/budget/category` | Yes | Trip Owner | Category expenditure summary |
| **Admin** | `GET` | `/admin/analytics/overview` | Yes | `admin` only | Platform KPI counts (users, trips, cities) |
| **Admin** | `GET` | `/admin/analytics/trips-over-time` | Yes | `admin` only | Weekly/monthly trip volume trends |
| **Admin** | `GET` | `/admin/analytics/top-cities` | Yes | `admin` only | Top destinations by stop count |
| **Admin** | `GET` | `/admin/analytics/top-activities` | Yes | `admin` only | Top assigned activities |
| **Admin** | `GET` | `/admin/analytics/budget-stats` | Yes | `admin` only | Average, median, revenue stats |
| **Admin** | `GET` | `/admin/users` | Yes | `admin` only | Paginated user management table |
| **Admin** | `PATCH` | `/admin/users/{user_id}/role` | Yes | `admin` only | Promote / demote user role |

---

### 1.2 Database Models & Constraints Inventory

| Table / Model | Column | Type | Constraints / Defaults | Description |
|---|---|---|---|---|
| **users** (`User`) | `id` | UUID | PK, default `uuid.uuid4()` | User identifier |
| | `email` | String(255) | Unique, Not Null, Index | User login email |
| | `password_hash` | String(255) | Not Null | Bcrypt password hash |
| | `name` | String(100) | Not Null | User display name |
| | `role` | String(20) | Not Null, Default `'user'` | Role (`user` or `admin`) |
| | `created_at` | DateTime | Server default `func.now()` | Creation timestamp |
| **trips** (`Trip`) | `id` | UUID | PK, default `uuid.uuid4()` | Trip identifier |
| | `owner_id` | UUID | FK `users.id` (CASCADE), Not Null, Index | Trip creator |
| | `name` | String(200) | Not Null | Trip name |
| | `start_date` | Date | Nullable | Trip start date |
| | `end_date` | Date | Nullable | Trip end date (must be >= start_date) |
| | `cover_photo` | String(500) | Nullable | Hero cover image URL |
| | `description` | Text | Nullable | Trip description / notes |
| | `is_public` | Boolean | Not Null, Default `False` | Public sharing flag |
| | `share_slug` | String(21) | Unique, Nullable, Index | Nanoid public link slug |
| | `daily_budget` | Float | Nullable | Daily spending target |
| | `base_currency`| String(3) | Not Null, Default `'USD'` | Currency code (ISO 4217) |
| | `deleted_at` | DateTime | Nullable | Soft-delete timestamp |
| | `created_at` | DateTime | Server default `func.now()` | Creation timestamp |
| **trip_shares** (`TripShare`) | `id` | UUID | PK | Share record ID |
| | `trip_id` | UUID | FK `trips.id` (CASCADE), Not Null, Index | Shared trip |
| | `shared_with_user_id`| UUID | FK `users.id` (CASCADE), Nullable | Target user (null if public) |
| | `permission` | String(10) | Not Null, Default `'view'` | Permission level (`view`, `edit`)|
| **trip_copies** (`TripCopy`) | `id` | UUID | PK | Copy audit ID |
| | `original_trip_id` | UUID | FK `trips.id` (SET NULL), Not Null | Source trip |
| | `copied_trip_id` | UUID | FK `trips.id` (CASCADE), Not Null | Newly created clone trip |
| | `copied_by` | UUID | FK `users.id` (CASCADE), Not Null | Cloner user |
| **stops** (`Stop`) | `id` | UUID | PK | Stop identifier |
| | `trip_id` | UUID | FK `trips.id` (CASCADE), Not Null, Index | Parent trip |
| | `city_id` | UUID | FK `cities.id` (RESTRICT), Not Null | Destination city |
| | `order_index` | Integer | Not Null, Default `0` | Sequential position in trip |
| | `arrival_date` | Date | Nullable | Arrival at city |
| | `departure_date`| Date | Nullable | Departure from city |
| **cities** (`City`) | `id` | UUID | PK | City identifier |
| | `name` | String(100) | Not Null | City name |
| | `country` | String(100) | Not Null | Country name |
| | `region` | String(100) | Nullable | Geographic region |
| | `cost_index` | Float | Not Null, Default `1.0` | Cost multiplier |
| | `popularity_score`| Integer | Not Null, Default `50` | Ranking score (1-100) |
| | `lat` / `lng` | Float | Not Null | Geographic coordinates |
| | `search_vector`| TSVECTOR | Generated Column, GIN Index | Full-text search vector |
| **activities** (`Activity`) | `id` | UUID | PK | Activity identifier |
| | `city_id` | UUID | FK `cities.id` (CASCADE), Not Null, Index | Host city |
| | `name` | String(200) | Not Null | Activity name |
| | `category` | String(20) | Not Null (`transport`/`stay`/`activity`/`food`)| Activity category |
| | `cost` | Float | Not Null, Default `0.0` | Base price in USD |
| | `duration_minutes`| Integer | Not Null, Default `60` | Duration in minutes |
| | `description` | Text | Nullable | Activity description |
| | `search_vector`| TSVECTOR | Generated Column, GIN Index | Full-text search vector |
| **trip_activities** (`TripActivity`) | `id` | UUID | PK | Assignment ID |
| | `stop_id` | UUID | FK `stops.id` (CASCADE), Not Null, Index | Assigned stop |
| | `activity_id` | UUID | FK `activities.id` (RESTRICT), Not Null | Selected activity |
| | `scheduled_date`| Date | Nullable | Planned date |
| | `scheduled_time`| Time | Nullable | Planned start time |
| | `cost_override`| Float | Nullable | Custom price override |
| | `order_index` | Integer | Not Null, Default `0` | Daily/stop sequence order |

---

### 1.3 Role & Permission Access Matrix

| Role | Public Routes | User Routes (Own Resources) | Other Users' Resources (IDOR) | Admin Routes |
|---|---|---|---|---|
| **Anonymous (No Token)** | Allowed (`/health`, `/cities`, `/activities`, `/trips/public/*`, `/auth/signup`, `/auth/login`) | Rejected (401 Unauthorized) | Rejected (401 Unauthorized) | Rejected (401 Unauthorized) |
| **Standard User** | Allowed | Allowed (Create, Read, Update, Delete own trips, stops, activities) | Forbidden (403 Forbidden / 404 Not Found) | Forbidden (403 Forbidden) |
| **Admin User** | Allowed | Allowed | Allowed on admin routes / Gated on user routes | Allowed (`/admin/*`, User Role Management) |

---

## 2. Test Execution & Coverage Strategy

### 2.1 Test Categories to Execute

1. **Happy Path Tests**: Valid inputs produce expected 200/201/204 status codes and properly structured JSON schemas.
2. **Input Validation Tests**: Malformed emails, short passwords (<8 chars), dates with `end_date < start_date`, invalid UUIDs, out-of-range parameters.
3. **Authentication & Token Tests**: Valid tokens, expired/invalid tokens, refresh token rotation, using access token as refresh token (rejected).
4. **Authorization & IDOR Isolation**: User A creating trips/stops/activities, and verifying User B cannot read, update, delete, or modify them.
5. **Idempotency & Side-Effects**: Soft deletion behavior (soft-deleted trips disappear from list and detail views), cascading deletes.
6. **Transactional Stop Reordering & Concurrency**: Validating strict sequence matching, missing/unknown ID detection, atomic order assignment, and concurrent operations.
7. **Business Logic & Budget Engine**:
   - Total trip cost calculation matching exact sums of activities / cost overrides.
   - Category aggregation grouping into transport, stay, activity, and food.
   - Daily cost aggregation with overbudget flag evaluated strictly against `daily_budget`.
   - Deep copy independence (modifying cloned trip does not mutate the source trip).
   - Public sharing privacy (public view omits owner PII, private trips return 404).
8. **Error Handling & Security**: Proper exception translation without leaking database tracebacks or internal exception classes.
