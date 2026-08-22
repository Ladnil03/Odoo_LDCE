# GlobeTrotter — Handoff Context

> A new agent should read this file before touching the codebase. It explains **where the project is**, **what's done**, **what's not**, and **how to keep moving**.

---

## 0. TL;DR

- **Project**: `D:\OODO-LDCE\Odoo_LDCE\` — full-stack travel planner ("GlobeTrotter").
- **Stack**: Next.js 16 (app router, client-side routing) + FastAPI + Postgres (Neon) + SQLAlchemy 2 async + Tailwind 4.
- **Goal of this task**: full UI redesign + wired-up dynamic data. **No static / mock data on any screen.**
- **Design direction chosen by user**: **white & ivory editorial** (NOT dark glassmorphic, NOT neon). Serif display headlines, sans body, monospace numerics, hairline borders, paper texture, eyebrow labels.
- **Backend status**: complete. All routes + seed.
- **Frontend status**: design system, AppContext, Navbar, SharedTripModal, LoginScreen, RegisterScreen are done. **8 screens still need rewriting** (see §6) using the same pattern.
- **Tokens have been exhausted** for the current session — this doc is the handoff.

---

## 1. Directory map

```
D:\OODO-LDCE\Odoo_LDCE\
├── backend/
│   ├── app/
│   │   ├── auth/         # JWT, signup/login/me
│   │   ├── trips/        # CRUD + share slug + public route
│   │   ├── stops/        # city stops under a trip
│   │   ├── catalog/      # cities + activities (search)
│   │   ├── itinerary/    # days + scheduled activities
│   │   ├── budget/       # trip budget snapshots
│   │   ├── admin/        # admin overview + users
│   │   ├── community/    # posts, likes, comments (NEW)
│   │   ├── bootstrap/    # idempotent seeder + status (NEW)
│   │   ├── main.py
│   │   ├── db.py
│   │   └── models.py
│   ├── requirements.txt
│   └── README.md
└── frontend/globe-trotter/
    ├── app/
    │   ├── globals.css          # design tokens (white/ivory) — DO NOT EDIT in spirit, only extend
    │   ├── layout.tsx
    │   └── page.tsx             # routes to one of 13 screens via currentScreen
    ├── components/
    │   ├── Navbar.tsx           # DONE
    │   ├── NotificationToast.tsx# DONE
    │   ├── UiBits.tsx           # DONE (shared components — use these!)
    │   └── screens/             # each screen is one file
    │       ├── LoginScreen.tsx           # DONE
    │       ├── RegisterScreen.tsx        # DONE
    │       ├── HomeScreen.tsx            # TODO
    │       ├── CreateTripScreen.tsx      # TODO
    │       ├── ItineraryBuilderScreen.tsx # TODO
    │       ├── MyTripsScreen.tsx         # TODO
    │       ├── ProfileScreen.tsx         # TODO
    │       ├── ActivitySearchScreen.tsx  # TODO
    │       ├── ItineraryViewScreen.tsx   # TODO
    │       ├── CommunityScreen.tsx       # TODO
    │       ├── CalendarScreen.tsx        # TODO
    │       ├── AdminScreen.tsx           # TODO
    │       └── SharedTripModal.tsx       # DONE
    ├── context/
    │   └── AppContext.tsx        # DONE — single React Context, drives everything
    ├── lib/
    │   ├── api.ts                # DONE — typed API client with auto-refresh
    │   ├── format.ts             # DONE — mappers from backend → UI
    │   └── types.ts              # DONE — UI-friendly types
    └── package.json
```

---

## 2. Backend — what's there

### 2.1 Modules and key endpoints

| Module     | Routes (prefix + notable endpoints)                            |
|------------|----------------------------------------------------------------|
| `auth`     | `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `PATCH /auth/me` |
| `trips`    | `GET /trips`, `POST /trips`, `GET /trips/{id}`, `PATCH /trips/{id}`, `DELETE /trips/{id}`, `POST /trips/{id}/share`, `GET /trips/public/{slug}` |
| `stops`    | `POST /trips/{id}/stops`, `DELETE /trips/{id}/stops/{stop_id}` |
| `catalog`  | `GET /catalog/cities?q=`, `GET /catalog/cities/{id}`, `GET /catalog/activities?q=&city_id=` |
| `itinerary`| `GET /trips/{id}/itinerary`, `POST /trips/{id}/days`, `POST /days/{dayId}/activities`, `DELETE /days/{dayId}/activities/{activityId}` |
| `budget`   | `GET /trips/{id}/budget`                                       |
| `admin`    | `GET /admin/overview`, `GET /admin/users`, `PATCH /admin/users/{id}/role` |
| `community`| `GET /community/posts`, `POST /community/posts`, `DELETE /community/posts/{id}`, `POST /community/posts/{id}/like`, `GET /community/posts/{id}/comments`, `POST /community/posts/{id}/comments` |
| `bootstrap`| `GET /bootstrap/status`, `POST /bootstrap/run` (idempotent)    |

### 2.2 DB / patterns

- **Async SQLAlchemy 2.x** with `asyncpg`. Base in `app/models.py`.
- **UUID primary keys** (`from app.models import GUID`). All IDs are strings to the frontend.
- **Eager loading** via `selectinload` — important for performance on `/trips/{id}/itinerary`.
- **GIN full-text indexes** on `cities.name` and `activities.name` for `q=` search.
- **Errors** as typed exceptions in `app/main.py`: `NotFoundError`, `ForbiddenError`, `ConflictError`, `UnauthorizedError`, `BadRequestError`. They map to 404/403/409/401/400 with a `{detail: "..."}` body.
- **Auth middleware**: `Depends(get_current_user)` extracts Bearer JWT. Refresh tokens are stored in `refresh_tokens` table.
- **`main.py`** wires all routers. Both `community_router` and `bootstrap_router` are already included.

### 2.3 Bootstrap / seed

`POST /bootstrap/run` is **idempotent**. Call it on first run from the frontend. It creates:

- 12 cities (Paris, Tokyo, Kyoto, Lisbon, Marrakech, Reykjavik, Rome, Bali, NYC, Cape Town, Istanbul, Seoul)
- 19 activities across categories (museums, food, outdoors, culture, nightlife)
- 4 users — **seed these exactly**:
  - `demo@globetrotter.io` / `demo12345` (role: `traveller`)
  - `elena@globetrotter.io` / `elena12345`
  - `kenji@globetrotter.io` / `kenji12345`
  - `admin@globetrotter.io` / `admin12345` (role: `admin`)
- 4 trips owned by the demo user
- 3 community posts with realistic likes/comments

`GET /bootstrap/status` returns `{empty: true}` if nothing exists; bootstrap the API checks **counts** (users / trips / cities / activities) — when all are >0, it skips.

---

## 3. Frontend — AppContext (already wired)

`context/AppContext.tsx` is the **single source of truth**. Every screen consumes it via `useApp()`. Do **not** introduce another state library.

### 3.1 AppContext shape (verbatim — use these names)

```ts
interface AppContextType {
  // routing
  currentScreen: ScreenId;
  navigateTo: (s: ScreenId, opts?: { shareSlug?: string }) => void;

  // bootstrap
  bootstrapStatus: "idle" | "checking" | "running" | "ready" | "error";
  bootstrapMessage: string | null;

  // auth
  user: User | null;
  isAuthed: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;

  // trips
  trips: Trip[];
  tripsLoading: boolean;
  refreshTrips: () => Promise<void>;
  createTrip: (input: CreateTripInput) => Promise<Trip | null>;
  deleteTrip: (id: string) => Promise<void>;
  shareTrip: (id: string) => Promise<string | null>;     // returns share slug
  cloneTrip: (id: string) => Promise<Trip | null>;

  // itinerary
  itinerary: Itinerary | null;
  itineraryLoading: boolean;
  refreshItinerary: (tripId: string) => Promise<void>;
  addStop: (tripId: string, cityId: string) => Promise<void>;
  removeStop: (tripId: string, stopId: string) => Promise<void>;
  assignActivity: (tripId: string, activityId: string, payload: AssignPayload) => Promise<void>;
  removeActivity: (tripId: string, dayId: string, activityId: string) => Promise<void>;

  // budget
  budget: BudgetSnapshot | null;
  refreshBudget: (tripId: string) => Promise<void>;

  // catalog
  cities: City[];
  refreshCities: () => Promise<void>;

  // community
  communityPosts: CommunityPost[];
  refreshCommunity: () => Promise<void>;
  toggleLikePost: (id: string) => Promise<void>;
  addCommentToPost: (id: string, body: string) => Promise<void>;
  loadComments: (id: string) => Promise<CommunityComment[]>;
  publishTripToCommunity: (tripId: string, body: string) => Promise<void>;

  // admin
  adminOverview: AdminOverview | null;
  adminStats: AdminStats | null;
  adminUsers: AdminUser[];
  refreshAdmin: () => Promise<void>;
  updateAdminUserRole: (id: string, role: string) => Promise<void>;

  // toasts
  toasts: Toast[];
  showToast: (title: string, body?: string, kind?: ToastKind) => void;
  removeToast: (id: string) => void;

  // shared-trip modal
  sharedModalTrip: Trip | null;
  openSharedTrip: (t: Trip) => void;
  closeSharedTrip: () => void;
}
```

All mappers live in `lib/format.ts`. **Always go through the context — never call APIs directly from a screen.**

### 3.2 Available APIs in `lib/api.ts`

Exported namespaces: `bootstrapApi`, `authApi`, `tripsApi`, `stopsApi`, `catalogApi`, `itineraryApi`, `budgetApi`, `adminApi`, `communityApi`.

Plus two error classes:
- `ApiError` — non-2xx response with `status` and `body`.
- `ApiNetworkError` — fetch threw.

Auth refresh logic: on 401, refresh once via `authApi.refresh()`, retry the call. If that fails, clear tokens. **Use `apiFetch` (the private helper) when calling custom endpoints.**

---

## 4. Design system — what to use

### 4.1 Tokens (defined in `app/globals.css`)

```css
--surface-page:      #ffffff
--surface-ivory:     #faf7f1
--surface-cream:     #f5f1e8
--surface-paper:     #fdfbf6
--surface-elevated:  #ffffff
--surface-sunken:    #f7f3ea

--ink-primary:       #1a1a1a
--ink-secondary:     #4a4a4a
--ink-tertiary:      #7a7a7a

--border-hairline:   #ebe7dc
--border-default:    #d6d2c4

--accent-pop:        #c2410c    (warm burnt-orange, used sparingly)
--accent-pop-soft:   #fef3ec
--accent-positive:   #15803d
--accent-warning:    #b45309
```

Custom utilities already in `globals.css`:
- `.paper` — subtle paper-grain texture (drop on hero/page backgrounds).
- `.hairline`, `.hairline-r`, `.hairline-t`, `.hairline-b` — 1px borders that match `--border-hairline`. **Prefer these over raw `border-*` classes.**
- `.eyebrow` — small uppercase tracked label, monospace, ink-tertiary.
- `.display` — serif headline class (use for `h1`/`h2`/`h3`).
- `.font-mono` — JetBrains Mono / Geist Mono for numerics.

Type scale used everywhere:
- Hero: `text-[64px]` to `text-[80px]`, leading 0.9–0.95
- Section: `text-[28px]` to `text-[34px]`
- Card title: `text-[18px]` to `text-[22px]`
- Body: `text-[14px]` to `text-[15px]`, text-[var(--ink-secondary)]
- Meta: `text-[12px]`, text-[var(--ink-tertiary)]

### 4.2 Shared components — `components/UiBits.tsx`

**Use these. Don't reinvent buttons / cards / avatars.**

| Component         | Purpose                                                         |
|-------------------|-----------------------------------------------------------------|
| `<Button>`        | `variant` primary/ghost/outline/danger; `size` sm/md/lg; `loading`|
| `<Card>`          | `rounded-2xl bg-elevated hairline`, optional `elevated`         |
| `<Eyebrow>`       | Wrap text — gives the small tracked label                       |
| `<SectionHeading>`| Optional `eyebrow`, `title`, `description`, `action`            |
| `<Skeleton>`      | `className` only — height/width controlled by className          |
| `<EmptyState>`    | `icon`, `title`, `description`, `action`                        |
| `<Tag>`           | `tone` default/accent                                           |
| `<Avatar>`        | `name`, `size` — auto-generates initials if no src              |
| `<Reveal>`        | Fades children in on mount                                      |
| `<StatPill>`      | `label`, `value`, `tone` — for KPIs                             |

Forms/inputs (when needed inline, see LoginScreen): use the same pattern —
```tsx
<input className="w-full" />
```
Tailwind's preflight already gives them a base. Override padding to feel editorial: `px-3 py-2.5 text-[13px] rounded-lg hairline bg-[var(--surface-elevated)]` — or wrap in a `<div className="hairline rounded-lg ...">` if you want a bordered look.

### 4.3 Motion

- Framer Motion is **`motion/react`** (not `framer-motion`). `import { motion, AnimatePresence } from "motion/react"`.
- Page transitions already handled in `app/page.tsx` via `AnimatePresence`.
- Use `<Reveal>` for on-mount fade-ups.

---

## 5. Screen patterns — copy these

### 5.1 Login/Register pattern (DONE — replicate)

Structure:
```
<div min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 paper>
  <div hidden lg:flex flex-col justify-between p-12 hairline-r>  {/* editorial left panel */}
  <div flex items-center justify-center p-6 sm:p-12>             {/* form */}
    <motion.form initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
```

Left panel: `Eyebrow`, `display h1`, descriptive paragraph, optional demo credentials card.
Right panel: `Eyebrow`, `display h2`, inputs, `Button`, footer link.

Form inputs: `<label>` with span, then a `<div relative>` containing a lucide icon `<X className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-tertiary)]" />` and an `<input>` with `className="w-full pl-10"`.

Submit: `setSubmitting(true)` → call context method → `setSubmitting(false)` → navigate on success. Use `showToast("...", "...", "warning")` for validation.

### 5.2 SharedTripModal pattern (DONE — replicate modal pattern)

`AnimatePresence` → motion overlay → motion card → `onClick={close}` on overlay / `e.stopPropagation()` on card. Footer with ghost button.

---

## 6. Screens still to build (in priority order)

> Each one is ~150–300 lines. All consume `useApp()` only. **No `useEffect(()=>setData(mock))` anywhere.**

### 6.1 HomeScreen (Task #8) — TODO
- Editorial hero with `display` headline.
- Stats row pulled from `trips.length` and `communityPosts.length`.
- Two-column recent trips (from `trips`) + community highlights (from `communityPosts`).
- CTA strip → "Plan a new trip" navigates to `create-trip`.
- All cards use `<Card>`, `<Eyebrow>`, `<Tag>`, `<Avatar>`.

### 6.2 CreateTripScreen (Task #10) — TODO
- Single-page form: title, description, start/end date pickers, cover photo URL, daily budget, status.
- City picker — multi-select using `cities` from context, search input that hits `catalogApi.searchCities`.
- On submit: `await createTrip(input)` → navigate to `itinerary-builder`.
- Show errors via `showToast`.

### 6.3 ItineraryBuilderScreen + MyTripsScreen (Task #11) — TODO
- **MyTripsScreen**: grid of trip cards from `trips`. Filter by status. Actions: Open, Share (calls `shareTrip(id)`), Delete, Clone.
- **ItineraryBuilderScreen**: tabs — Overview / Stops / Day-by-day / Budget.
  - Stops tab: list cities in trip, add via `addStop(tripId, cityId)` from a city picker.
  - Day-by-day: load `itinerary` via `refreshItinerary(tripId)`. Render days, list activities per day, drag-drop or "Add activity" picker → `assignActivity(...)`.
  - Budget tab: `<StatPill>` row + a breakdown list rendered from `budget`.

### 6.4 ActivitySearchScreen (Task #16) — TODO
- Search bar → calls `catalogApi.searchActivities(q, cityId)`.
- Filters: city (from `cities`), category.
- Each result card → "Add to trip" opens a small popover listing trips, calls `assignActivity`.

### 6.5 ItineraryViewScreen (Task #16) — TODO
- Read-only render of a single trip's itinerary. Same builder layout, no editing.
- Public-preview: if `openSharedTrip` was triggered, the data comes from `tripsApi.getPublicTrip(slug)` — see SharedTripModal for the reference shape.

### 6.6 CommunityScreen (Task #16) — TODO
- Feed of `communityPosts`, each shows author `<Avatar>`, body, photo, like count.
- Like button: `toggleLikePost(id)` — optimistic toggle using `post.likedByMe`.
- Comments: collapsible thread per post, fetched via `loadComments(id)`. Add via `addCommentToPost`.
- "Publish a trip" modal: pick trip from `trips`, enter body, call `publishTripToCommunity`.

### 6.7 CalendarScreen (Task #16) — TODO
- Monthly calendar. For each day in trip's range, show a card listing the activities scheduled that day.
- Data: build a `Map<date, CalendarEntry>` from `itinerary`.
- Use the format helper `mapCalendar` from `lib/format.ts`.

### 6.8 ProfileScreen (Task #16) — TODO
- Show `user`. Editable name + avatar URL via `updateUser`.
- Stats: trips count, cities visited (set of stop cities), total budget across trips.
- Role badge if `isAdmin`.

### 6.9 AdminScreen (Task #16) — TODO
- Tabs: Overview / Users.
- Overview: `<StatPill>` grid from `adminOverview` (totals) and `adminStats` (charts as simple bar list).
- Users: table from `adminUsers`, role dropdown per row → `updateAdminUserRole(id, role)`.
- Guard: if `!isAdmin`, show a gated `<EmptyState>`.

---

## 7. Things that have bitten us

1. **`mock-data.ts`** — do not import this anywhere. It still exists in the repo (kept off the render path). All data comes from the API via context.
2. **`border-default` does exist** but the design prefers `.hairline` utility for 1px hairlines. Use `.hairline` for cards, `.hairline-r/-t/-b/-l` for directional. The brand color is **burnt-orange `#c2410c`**, not red.
3. **UUIDs** are strings. Don't `parseInt(id)`.
4. **Dates** come back as ISO strings from Postgres — format with `formatDate` from `lib/format.ts`. ISO `datetime` strings are **UTC**; render in user's locale.
5. **Auth headers** — `apiFetch` injects the bearer token automatically (and refreshes on 401). Don't pass headers manually.
6. **PowerShell, not bash**, for filesystem commands. The CWD is already `D:\OODO-LDCE`.
7. **Next.js 16** — use `"use client"` at top of any file using hooks. Server-only APIs (e.g. `cookies()` async signatures) don't apply here since routing is client-side.
8. **`motion/react`** is the framer-motion v11+ name. Don't import from `framer-motion`.

---

## 8. Backend env / dev commands

- Python 3.11+, venv at `.venv/` typically.
- `DATABASE_URL` points to Neon (already set in the user's environment, but the bootstrap script will look for env vars — read `backend/app/bootstrap/service.py` to confirm).
- Run backend: `cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000`.
- Run frontend: `cd frontend\globe-trotter && pnpm dev` (or `npm run dev`).

---

## 9. Definition of done

For each screen you build:
1. All data is fetched via AppContext — no `import ... from "@/lib/mock-data"`.
2. Uses design system tokens (`var(--ink-*)`, `var(--surface-*)`, `.hairline`, `.eyebrow`, `.display`).
3. Uses shared `<UiBits>` components — don't make local `Button` etc.
4. Loading state shows `<Skeleton>` or button `loading` — never blank white.
5. Empty state uses `<EmptyState>`. Error path uses `showToast(title, body, "warning" | "error")`.
6. Renders on `>= sm` and `>= lg`. Mobile-first but layout breathes on desktop.

When all 13 screens are done, run:

```powershell
cd D:\OODO-LDCE\Odoo_LDCE\frontend\globe-trotter
npm run build
```

to validate the type-check and bundle.

---

## 10. Quick start for the next agent

```powershell
# 1. Read this file and skim lib/api.ts, context/AppContext.tsx, components/UiBits.tsx
# 2. Start backend
cd D:\OODO-LDCE\Odoo_LDCE\backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# 3. In another terminal, start frontend
cd D:\OODO-LDCE\Odoo_LDCE\frontend\globe-trotter
npm run dev

# 4. Hit http://localhost:3000 → it will run /bootstrap/run automatically.
#    log in with demo@globetrotter.io / demo12345.

# 5. Build remaining screens in this order:
#    HomeScreen → CreateTripScreen → MyTripsScreen/ItineraryBuilderScreen
#    → ActivitySearchScreen → ItineraryViewScreen → CommunityScreen
#    → CalendarScreen → ProfileScreen → AdminScreen

# 6. npm run build when done.
```

Good luck — the pattern is established. Mirror the **LoginScreen / RegisterScreen / SharedTripModal** files exactly.
