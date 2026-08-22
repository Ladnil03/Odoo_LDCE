"""Idempotent seeding of demo data (cities, activities, users, trips, posts).

This is invoked at runtime by the frontend bootstrap endpoint. Safe to call
repeatedly — existing rows are detected and skipped.
"""

from __future__ import annotations

import uuid
from datetime import date, time, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.catalog.models import Activity, City
from app.community.models import CommunityPost
from app.core.security import hash_password
from app.itinerary.models import TripActivity
from app.stops.models import Stop
from app.trips.models import Trip
from nanoid import generate as generate_nanoid


# ── Static demo data (kept here so the runtime seed matches the frontend mocks) ──

_CITIES = [
    {"name": "Paris", "country": "France", "region": "Europe",
     "cost_index": 3.5, "popularity_score": 98, "lat": 48.8566, "lng": 2.3522,
     "tagline": "The City of Light, art galleries, and romantic boulevards",
     "best_season": "Apr - Oct", "avg_daily_cost": 185,
     "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80"},
    {"name": "Tokyo", "country": "Japan", "region": "Asia",
     "cost_index": 3.0, "popularity_score": 99, "lat": 35.6762, "lng": 139.6503,
     "tagline": "Futuristic neon metropolises meet ancient tranquil shrines",
     "best_season": "Mar - May, Sep - Nov", "avg_daily_cost": 170,
     "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80"},
    {"name": "New York City", "country": "United States", "region": "Americas",
     "cost_index": 4.0, "popularity_score": 96, "lat": 40.7128, "lng": -74.0060,
     "tagline": "The city that never sleeps, Broadway, and iconic skyline views",
     "best_season": "May - Oct", "avg_daily_cost": 240,
     "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80"},
    {"name": "Interlaken", "country": "Switzerland", "region": "Europe",
     "cost_index": 4.2, "popularity_score": 94, "lat": 46.6863, "lng": 7.8632,
     "tagline": "Glacial lakes, soaring snow peaks, and paragliding havens",
     "best_season": "Dec - Mar (Ski), Jun - Sep (Hikes)", "avg_daily_cost": 220,
     "image": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80"},
    {"name": "Bali", "country": "Indonesia", "region": "Asia",
     "cost_index": 1.2, "popularity_score": 95, "lat": -8.3405, "lng": 115.0920,
     "tagline": "Lush terraced paddies, sacred water temples, and coral reefs",
     "best_season": "May - Sep", "avg_daily_cost": 65,
     "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80"},
    {"name": "Cape Town", "country": "South Africa", "region": "Africa",
     "cost_index": 1.8, "popularity_score": 91, "lat": -33.9249, "lng": 18.4241,
     "tagline": "Dramatic Table Mountain vistas, coastal vineyards, and penguin colonies",
     "best_season": "Nov - Mar", "avg_daily_cost": 95,
     "image": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80"},
    {"name": "Rome", "country": "Italy", "region": "Europe",
     "cost_index": 2.8, "popularity_score": 95, "lat": 41.9028, "lng": 12.4964,
     "tagline": "Ancient ruins, Vatican treasures, and trattoria-lined streets",
     "best_season": "Apr - Jun, Sep - Oct", "avg_daily_cost": 150,
     "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80"},
    {"name": "Kyoto", "country": "Japan", "region": "Asia",
     "cost_index": 2.5, "popularity_score": 93, "lat": 35.0116, "lng": 135.7681,
     "tagline": "Bamboo groves, golden temples, and geisha districts",
     "best_season": "Mar - May, Oct - Nov", "avg_daily_cost": 140,
     "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80"},
    {"name": "Barcelona", "country": "Spain", "region": "Europe",
     "cost_index": 2.6, "popularity_score": 94, "lat": 41.3851, "lng": 2.1734,
     "tagline": "Gaudí masterworks, Mediterranean beaches, and tapas alleys",
     "best_season": "May - Jun, Sep", "avg_daily_cost": 145,
     "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80"},
    {"name": "Bangkok", "country": "Thailand", "region": "Asia",
     "cost_index": 1.4, "popularity_score": 92, "lat": 13.7563, "lng": 100.5018,
     "tagline": "Ornate temples, floating markets, and rooftop bars",
     "best_season": "Nov - Feb", "avg_daily_cost": 80,
     "image": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80"},
    {"name": "Lisbon", "country": "Portugal", "region": "Europe",
     "cost_index": 2.2, "popularity_score": 90, "lat": 38.7223, "lng": -9.1393,
     "tagline": "Pastel hilltops, melancholic fado, and custard tarts",
     "best_season": "Mar - Oct", "avg_daily_cost": 120,
     "image": "https://images.unsplash.com/photo-1588535391461-1fce47d7f68c?w=800&auto=format&fit=crop&q=80"},
    {"name": "Reykjavik", "country": "Iceland", "region": "Europe",
     "cost_index": 3.8, "popularity_score": 88, "lat": 64.1466, "lng": -21.9426,
     "tagline": "Northern lights, geothermal lagoons, and lava fields",
     "best_season": "Sep - Mar", "avg_daily_cost": 210,
     "image": "https://images.unsplash.com/photo-1490718720478-364a07a997cd?w=800&auto=format&fit=crop&q=80"},
]

_ACTIVITIES = [
    # Paris
    {"city": ("Paris", "France"), "name": "Louvre Museum After-Hours VIP Access",
     "category": "activity", "cost": 85, "duration_minutes": 210,
     "description": "Skip massive crowds to view the Mona Lisa, Venus de Milo, and French Crown Jewels with an art historian.",
     "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=80"},
    {"city": ("Paris", "France"), "name": "Seine River Luxury Dinner Cruise",
     "category": "food", "cost": 130, "duration_minutes": 150,
     "description": "Three-course gourmet French dining while floating under illuminated historic Parisian stone bridges.",
     "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=80"},
    {"city": ("Paris", "France"), "name": "Boutique Stay in Le Marais",
     "category": "stay", "cost": 220, "duration_minutes": 0,
     "description": "Heritage textile factory conversion with espresso bar and courtyard garden.",
     "image": "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&auto=format&fit=crop&q=80"},
    # Tokyo
    {"city": ("Tokyo", "Japan"), "name": "Shibuya & Shinjuku Midnight Street Food Crawl",
     "category": "food", "cost": 75, "duration_minutes": 180,
     "description": "Sample savory yakitori skewers, authentic tonkotsu ramen, and craft sake in Omoide Yokocho.",
     "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"},
    {"city": ("Tokyo", "Japan"), "name": "Mount Fuji 5th Station & Lake Kawaguchiko Onsen",
     "category": "activity", "cost": 120, "duration_minutes": 540,
     "description": "Scenic coach tour to Mt. Fuji with traditional hot spring onsen bath and matcha tasting ceremony.",
     "image": "https://images.unsplash.com/photo-1578637387939-43c525550085?w=800&auto=format&fit=crop&q=80"},
    {"city": ("Tokyo", "Japan"), "name": "Shinkansen Bullet Train Tokyo → Kyoto",
     "category": "transport", "cost": 110, "duration_minutes": 140,
     "description": "Reserved Green Car seat on the Nozomi shinkansen with panoramic Mount Fuji views.",
     "image": "https://images.unsplash.com/photo-1542931287-023b922fa89b?w=800&auto=format&fit=crop&q=80"},
    # NYC
    {"city": ("New York City", "United States"), "name": "Broadway Orchestra Experience & Backstage Pass",
     "category": "activity", "cost": 160, "duration_minutes": 180,
     "description": "Premium center orchestra seats for critically acclaimed stage productions plus exclusive backstage meet.",
     "image": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop&q=80"},
    {"city": ("New York City", "United States"), "name": "Summit One Vanderbilt Skyline Experience",
     "category": "activity", "cost": 65, "duration_minutes": 90,
     "description": "Glass-floor observation deck with mirrored ceiling above Grand Central.",
     "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80"},
    # Interlaken
    {"city": ("Interlaken", "Switzerland"), "name": "Tandem Paragliding over Jungfrau Alps",
     "category": "activity", "cost": 190, "duration_minutes": 180,
     "description": "Launch off 1,300m cliffs and glide over shimmering turquoise lakes with certified tandem pilots.",
     "image": "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&auto=format&fit=crop&q=80"},
    {"city": ("Interlaken", "Switzerland"), "name": "Jungfraujoch Top of Europe Cogwheel Train",
     "category": "activity", "cost": 215, "duration_minutes": 360,
     "description": "Ride the famous Jungfraubahn to Europe's highest railway station at 3,454m.",
     "image": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80"},
    # Bali
    {"city": ("Bali", "Indonesia"), "name": "Manta Point Scuba Diving & Nusa Penida Cruise",
     "category": "activity", "cost": 110, "duration_minutes": 360,
     "description": "Swim side-by-side with majestic giant oceanic manta rays in crystal-clear waters.",
     "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80"},
    {"city": ("Bali", "Indonesia"), "name": "Ubud Jungle Villa with Infinity Pool",
     "category": "stay", "cost": 90, "duration_minutes": 0,
     "description": "Bamboo eco villa overlooking the sacred Ayung river.",
     "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80"},
    # Cape Town
    {"city": ("Cape Town", "South Africa"), "name": "Aquila Big 5 Luxury Game Reserve Safari",
     "category": "activity", "cost": 155, "duration_minutes": 480,
     "description": "Open 4x4 safari tracking lions, rhinos, elephants, buffalos, and leopards in the Karoo valley.",
     "image": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=80"},
    # Rome
    {"city": ("Rome", "Italy"), "name": "Colosseum & Roman Forum Skip-the-Line Tour",
     "category": "activity", "cost": 75, "duration_minutes": 180,
     "description": "Guided walk through ancient gladiatorial arenas and senate ruins with an archaeologist.",
     "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80"},
    # Kyoto
    {"city": ("Kyoto", "Japan"), "name": "Arashiyama Bamboo Grove & Tenryu Temple",
     "category": "activity", "cost": 45, "duration_minutes": 150,
     "description": "Walk towering bamboo corridors and visit a 14th-century Zen temple garden.",
     "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80"},
    # Barcelona
    {"city": ("Barcelona", "Spain"), "name": "Sagrada Família Fast-Track & Park Güell",
     "category": "activity", "cost": 95, "duration_minutes": 240,
     "description": "Gaudí's still-unfinished masterpiece plus the mosaic hilltop park.",
     "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80"},
    # Bangkok
    {"city": ("Bangkok", "Thailand"), "name": "Grand Palace & Wat Pho Guided Tour",
     "category": "activity", "cost": 55, "duration_minutes": 240,
     "description": "Visit the royal complex and the temple of the reclining Buddha.",
     "image": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80"},
    # Lisbon
    {"city": ("Lisbon", "Portugal"), "name": "Tram 28 & Alfama Walking Tour",
     "category": "activity", "cost": 35, "duration_minutes": 180,
     "description": "Ride the iconic yellow tram and explore Lisbon's oldest quarter with a local guide.",
     "image": "https://images.unsplash.com/photo-1588535391461-1fce47d7f68c?w=800&auto=format&fit=crop&q=80"},
    # Reykjavik
    {"city": ("Reykjavik", "Iceland"), "name": "Blue Lagoon Geothermal Spa Day",
     "category": "activity", "cost": 110, "duration_minutes": 240,
     "description": "Soak in milky-blue silica-rich waters surrounded by lava fields.",
     "image": "https://images.unsplash.com/photo-1490718720478-364a07a997cd?w=800&auto=format&fit=crop&q=80"},
]

_USERS = [
    {"email": "demo@globetrotter.io", "name": "Aarav Shah", "role": "user", "password": "demo12345",
     "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"},
    {"email": "elena@globetrotter.io", "name": "Elena Rostova", "role": "user", "password": "demo12345",
     "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80"},
    {"email": "kenji@globetrotter.io", "name": "Kenji Takahashi", "role": "user", "password": "demo12345",
     "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"},
    {"email": "admin@globetrotter.io", "name": "Admin Officer", "role": "admin", "password": "admin12345",
     "avatar": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=80"},
]


async def get_status(db: AsyncSession) -> dict:
    """Return current population of the database."""
    cities = (await db.execute(select(func.count(City.id)))).scalar_one()
    activities = (await db.execute(select(func.count(Activity.id)))).scalar_one()
    users = (await db.execute(select(func.count(User.id)))).scalar_one()
    trips = (await db.execute(
        select(func.count(Trip.id)).where(Trip.deleted_at.is_(None))
    )).scalar_one()
    posts = (await db.execute(
        select(func.count(CommunityPost.id)).where(CommunityPost.is_published.is_(True))
    )).scalar_one()
    return {
        "cities": cities,
        "activities": activities,
        "users": users,
        "trips": trips,
        "community_posts": posts,
    }


async def run_bootstrap(db: AsyncSession) -> dict:
    """Idempotently seed cities, activities, users, trips, and community posts.

    Returns counts of new rows added.
    """
    counts = {
        "cities_added": 0,
        "activities_added": 0,
        "users_added": 0,
        "trips_added": 0,
        "posts_added": 0,
    }

    # ── Cities ──
    existing = {
        (c.name, c.country): c
        for c in (await db.execute(select(City))).scalars().all()
    }
    city_id_map: dict[tuple[str, str], uuid.UUID] = {
        k: v.id for k, v in existing.items()
    }
    for spec in _CITIES:
        key = (spec["name"], spec["country"])
        if key in city_id_map:
            continue
        cid = uuid.uuid4()
        city_id_map[key] = cid
        db.add(City(
            id=cid,
            name=spec["name"],
            country=spec["country"],
            region=spec["region"],
            cost_index=spec["cost_index"],
            popularity_score=spec["popularity_score"],
            lat=spec["lat"],
            lng=spec["lng"],
        ))
        counts["cities_added"] += 1
    await db.flush()

    # ── Activities ──
    existing_acts = {
        (a.name, a.city_id)
        for a in (await db.execute(select(Activity.name, Activity.city_id))).all()
    }
    for spec in _ACTIVITIES:
        city_id = city_id_map.get(spec["city"])
        if city_id is None:
            continue
        if (spec["name"], city_id) in existing_acts:
            continue
        db.add(Activity(
            id=uuid.uuid4(),
            city_id=city_id,
            name=spec["name"],
            category=spec["category"],
            cost=spec["cost"],
            duration_minutes=spec["duration_minutes"],
            description=spec["description"],
            image_url=spec["image"],
        ))
        existing_acts.add((spec["name"], city_id))
        counts["activities_added"] += 1
    await db.flush()

    # ── Users ──
    user_map: dict[str, User] = {}
    for spec in _USERS:
        existing_user = (
            await db.execute(select(User).where(User.email == spec["email"]))
        ).scalar_one_or_none()
        if existing_user is not None:
            user_map[spec["email"]] = existing_user
            continue
        u = User(
            id=uuid.uuid4(),
            email=spec["email"],
            name=spec["name"],
            role=spec["role"],
            avatar_url=spec["avatar"],
            password_hash=hash_password(spec["password"]),
        )
        db.add(u)
        await db.flush()
        user_map[spec["email"]] = u
        counts["users_added"] += 1

    # ── Trips (only if user has none) ──
    demo_user = user_map.get("demo@globetrotter.io")
    elena = user_map.get("elena@globetrotter.io")
    kenji = user_map.get("kenji@globetrotter.io")

    async def _user_has_trip(uid: uuid.UUID) -> bool:
        result = await db.execute(
            select(Trip).where(Trip.owner_id == uid, Trip.deleted_at.is_(None)).limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def _build_trip(
        *,
        owner: User,
        name: str,
        description: str,
        start: date,
        end: date,
        budget: float,
        currency: str,
        cover: str,
        is_public: bool,
        city_specs: list[tuple[str, str, date, date]],
        activity_indices: dict[tuple[str, str], list[tuple[int, date, time | None]]],
    ) -> Trip | None:
        if await _user_has_trip(owner.id):
            return None
        slug = generate_nanoid(size=12) if is_public else None
        trip = Trip(
            id=uuid.uuid4(),
            owner_id=owner.id,
            name=name,
            description=description,
            start_date=start,
            end_date=end,
            daily_budget=budget,
            base_currency=currency,
            cover_photo=cover,
            is_public=is_public,
            share_slug=slug,
        )
        db.add(trip)
        await db.flush()

        for idx, (cname, ccountry, arrival, departure) in enumerate(city_specs):
            cid = city_id_map.get((cname, ccountry))
            if cid is None:
                continue
            stop = Stop(
                id=uuid.uuid4(),
                trip_id=trip.id,
                city_id=cid,
                order_index=idx,
                arrival_date=arrival,
                departure_date=departure,
            )
            db.add(stop)
            await db.flush()

            acts = (
                await db.execute(
                    select(Activity).where(Activity.city_id == cid).order_by(Activity.id)
                )
            ).scalars().all()

            schedule = activity_indices.get((cname, ccountry), [])
            for order_i, (act_idx, d, t) in enumerate(schedule):
                if act_idx >= len(acts):
                    continue
                act = acts[act_idx]
                db.add(TripActivity(
                    id=uuid.uuid4(),
                    stop_id=stop.id,
                    activity_id=act.id,
                    scheduled_date=d,
                    scheduled_time=t,
                    cost_override=None,
                    order_index=order_i,
                ))

        counts["trips_added"] += 1
        return trip

    if demo_user:
        await _build_trip(
            owner=demo_user,
            name="Paris Art & Gastronomy Dream",
            description="Immersive 6-day cultural escape exploring classical art museums, Montmartre, and romantic Seine cruises.",
            start=date(2026, 3, 9), end=date(2026, 3, 14),
            budget=220.0, currency="USD",
            cover="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
            is_public=False,
            city_specs=[("Paris", "France", date(2026, 3, 9), date(2026, 3, 14))],
            activity_indices={
                ("Paris", "France"): [
                    (0, date(2026, 3, 10), time(9, 0)),
                    (1, date(2026, 3, 11), time(20, 30)),
                    (2, date(2026, 3, 9), time(15, 0)),
                ],
            },
        )
        await _build_trip(
            owner=demo_user,
            name="Japan Winter Wonders & Alpine Onsens",
            description="8-day journey through Tokyo and Kyoto — bullet trains, bamboo groves, and cedar onsens.",
            start=date(2026, 1, 16), end=date(2026, 1, 23),
            budget=280.0, currency="USD",
            cover="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
            is_public=False,
            city_specs=[
                ("Tokyo", "Japan", date(2026, 1, 16), date(2026, 1, 19)),
                ("Kyoto", "Japan", date(2026, 1, 19), date(2026, 1, 23)),
            ],
            activity_indices={
                ("Tokyo", "Japan"): [
                    (0, date(2026, 1, 17), time(19, 30)),
                    (1, date(2026, 1, 18), time(8, 0)),
                ],
                ("Kyoto", "Japan"): [
                    (0, date(2026, 1, 20), time(9, 30)),
                ],
            },
        )

    # Elena's published trips
    if elena:
        await _build_trip(
            owner=elena,
            name="10-Day Swiss Alps Grand Tour",
            description="From tandem paragliding above Interlaken to the cogwheel train to Jungfraujoch.",
            start=date(2026, 6, 1), end=date(2026, 6, 10),
            budget=245.0, currency="CHF",
            cover="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80",
            is_public=True,
            city_specs=[("Interlaken", "Switzerland", date(2026, 6, 1), date(2026, 6, 10))],
            activity_indices={
                ("Interlaken", "Switzerland"): [
                    (0, date(2026, 6, 2), time(9, 0)),
                    (1, date(2026, 6, 4), time(7, 30)),
                ],
            },
        )

    if kenji:
        await _build_trip(
            owner=kenji,
            name="Hidden Izakayas & Cyberpunk Tokyo",
            description="7-day curated itinerary of tiny 4-seat alley izakayas, retro arcades, and dawn shrine rituals.",
            start=date(2026, 4, 5), end=date(2026, 4, 12),
            budget=235.0, currency="JPY",
            cover="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
            is_public=True,
            city_specs=[("Tokyo", "Japan", date(2026, 4, 5), date(2026, 4, 12))],
            activity_indices={
                ("Tokyo", "Japan"): [
                    (0, date(2026, 4, 6), time(19, 30)),
                    (2, date(2026, 4, 7), time(10, 0)),
                ],
            },
        )

    await db.flush()

    # ── Community posts (built from existing public trips) ──
    post_count = (
        await db.execute(select(func.count(CommunityPost.id)))
    ).scalar_one()
    if post_count == 0:
        elena_user = user_map.get("elena@globetrotter.io") or demo_user
        kenji_user = user_map.get("kenji@globetrotter.io") or demo_user

        all_trips = (
            await db.execute(select(Trip).where(Trip.deleted_at.is_(None)))
        ).scalars().all()
        trips_by_owner = {t.owner_id: t.id for t in all_trips}
        fallback_trip_id = all_trips[0].id if all_trips else None

        posts_spec = [
            {
                "author": elena_user,
                "title": "10-Day Swiss Alps Grand Tour & Alpine Lakes",
                "summary": "From tandem paragliding above Interlaken to the cogwheel train to Jungfraujoch. Best mountain fondue tips and scenic hiking passes included.",
                "destination": "Interlaken, Switzerland",
                "cover_image": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80",
                "tags": "SwissAlps,Paragliding,Hikes,BudgetTips",
                "days_duration": 10,
                "budget_total": 2450.0,
                "likes_count": 184,
                "comments_count": 16,
            },
            {
                "author": kenji_user,
                "title": "Hidden Izakayas & Cyberpunk Tokyo Guide",
                "summary": "7-day curated itinerary of tiny 4-seat alley izakayas in Shinjuku, retro arcades in Akihabara, and tranquil dawn shrine rituals in Asakusa.",
                "destination": "Tokyo, Japan",
                "cover_image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
                "tags": "TokyoSecret,Foodie,Nightlife,Culture",
                "days_duration": 7,
                "budget_total": 1645.0,
                "likes_count": 242,
                "comments_count": 29,
            },
            {
                "author": demo_user,
                "title": "Parisian Art, Secret Cafes & Rooftop Sunsets",
                "summary": "Skip massive queues at the Louvre with early access, explore Montmartre cobblestone alleyways, and enjoy authentic 3-course bistro dining.",
                "destination": "Paris, France",
                "cover_image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
                "tags": "ParisGuide,Art,Culinary,Romantic",
                "days_duration": 6,
                "budget_total": 1320.0,
                "likes_count": 315,
                "comments_count": 42,
            },
        ]

        for ps in posts_spec:
            if ps["author"]:
                tid = trips_by_owner.get(ps["author"].id, fallback_trip_id)
                post = CommunityPost(
                    id=uuid.uuid4(),
                    trip_id=tid,
                    author_id=ps["author"].id,
                    title=ps["title"],
                    summary=ps["summary"],
                    destination=ps["destination"],
                    country=None,
                    cover_image=ps["cover_image"],
                    tags=ps["tags"],
                    days_duration=ps["days_duration"],
                    budget_total=ps["budget_total"],
                    likes_count=ps["likes_count"],
                    comments_count=ps["comments_count"],
                    shares_count=24,
                    clones_count=19,
                    is_published=True,
                )
                db.add(post)
                counts["posts_added"] += 1

    await db.flush()
    return counts
