"""CLI commands for database initialization, seeding mock data, and admin user creation."""

import asyncio
import csv
from datetime import date, time
import sys
import uuid
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.catalog.models import Activity, City
from app.core.database import async_session, engine, Base
from app.core.security import hash_password
from app.itinerary.models import TripActivity
from app.stops.models import Stop
from app.trips.models import Trip, TripShare, TripCopy
from nanoid import generate as generate_nanoid

DATA_DIR = Path(__file__).parent.parent / "data"


async def init_db() -> None:
    """Create all database tables."""
    print("Connecting to PostgreSQL and creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")


async def seed_cities_and_activities(session: AsyncSession) -> dict[str, uuid.UUID]:
    """Seed cities and activities from CSV files using bulk querying."""
    cities_file = DATA_DIR / "cities.csv"
    activities_file = DATA_DIR / "activities.csv"

    if not cities_file.exists():
        print(f"ERROR: {cities_file} not found")
        return {}

    # 1. Fetch all existing cities in 1 query
    existing_cities_res = await session.execute(select(City))
    existing_cities = existing_cities_res.scalars().all()
    city_id_map: dict[str, uuid.UUID] = {
        f"{c.name}_{c.country}": c.id for c in existing_cities
    }

    new_cities = []
    with open(cities_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            city_key = f"{row['name']}_{row['country']}"
            if city_key not in city_id_map:
                city_id = uuid.uuid4()
                city_id_map[city_key] = city_id
                new_cities.append(City(
                    id=city_id,
                    name=row["name"],
                    country=row["country"],
                    region=row.get("region") or None,
                    cost_index=float(row.get("cost_index", 1.0)),
                    popularity_score=int(row.get("popularity_score", 50)),
                    lat=float(row["lat"]),
                    lng=float(row["lng"]),
                ))

    if new_cities:
        session.add_all(new_cities)
        await session.flush()
    print(f"[+] Seeded {len(new_cities)} new destination cities ({len(city_id_map)} total)")

    if not activities_file.exists():
        print(f"ERROR: {activities_file} not found")
        return city_id_map

    # 2. Fetch all existing activities in 1 query
    existing_acts_res = await session.execute(select(Activity.name, Activity.city_id))
    existing_act_set = {(name, cid) for name, cid in existing_acts_res.all()}

    new_activities = []
    with open(activities_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            city_key = f"{row['city_name']}_{row['city_country']}"
            city_id = city_id_map.get(city_key)
            if city_id is None:
                continue

            if (row["name"], city_id) not in existing_act_set:
                new_activities.append(Activity(
                    id=uuid.uuid4(),
                    city_id=city_id,
                    name=row["name"],
                    category=row["category"],
                    cost=float(row.get("cost", 0)),
                    duration_minutes=int(row.get("duration_minutes", 60)),
                    description=row.get("description") or None,
                    image_url=row.get("image_url") or None,
                ))
                existing_act_set.add((row["name"], city_id))

    if new_activities:
        session.add_all(new_activities)
        await session.flush()
    print(f"[+] Seeded {len(new_activities)} new activities ({len(existing_act_set)} total)")
    return city_id_map


async def seed_users(session: AsyncSession) -> dict[str, User]:
    """Seed demo and admin users."""
    users_data = [
        {"email": "admin@globetrotter.com", "name": "Admin User", "role": "admin", "pass": "admin12345"},
        {"email": "alice@example.com", "name": "Alice Explorer", "role": "user", "pass": "password123"},
        {"email": "bob@example.com", "name": "Bob Traveler", "role": "user", "pass": "password123"},
    ]
    users_map: dict[str, User] = {}

    for u_data in users_data:
        existing = await session.execute(select(User).where(User.email == u_data["email"]))
        user = existing.scalar_one_or_none()
        if user is None:
            user = User(
                id=uuid.uuid4(),
                email=u_data["email"],
                password_hash=hash_password(u_data["pass"]),
                name=u_data["name"],
                role=u_data["role"],
            )
            session.add(user)
            await session.flush()
            print(f"[+] Created user: {u_data['email']} ({u_data['role']})")
        else:
            print(f"[+] User already exists: {u_data['email']}")
        users_map[u_data["email"]] = user

    return users_map


async def seed_mock_trips(session: AsyncSession, users_map: dict[str, User], city_id_map: dict[str, uuid.UUID]) -> None:
    """Seed realistic mock trips, stops, activities, and shares."""
    alice = users_map.get("alice@example.com")
    bob = users_map.get("bob@example.com")

    if not alice or not bob:
        return

    # Check if trips already seeded
    existing_trip = await session.execute(select(Trip).where(Trip.owner_id == alice.id))
    if existing_trip.scalars().first() is not None:
        print("[+] Mock trips already present in database")
        return

    # ──────────────────────────────────────────────────────────
    # Trip 1: Grand Japan Expedition (Alice)
    # ──────────────────────────────────────────────────────────
    tokyo_id = city_id_map.get("Tokyo_Japan")
    kyoto_id = city_id_map.get("Kyoto_Japan")
    osaka_id = city_id_map.get("Osaka_Japan")

    trip1_slug = generate_nanoid(size=12)
    trip1 = Trip(
        id=uuid.uuid4(),
        owner_id=alice.id,
        name="Grand Japan Autumn Expedition",
        description="A 10-day cultural journey through Tokyo, Kyoto, and Osaka during the autumn foliage season.",
        start_date=date(2026, 10, 10),
        end_date=date(2026, 10, 20),
        daily_budget=220.0,
        base_currency="USD",
        cover_photo="https://images.unsplash.com/photo-1503899036084-c55cdd92da26",
        is_public=True,
        share_slug=trip1_slug,
    )
    session.add(trip1)
    await session.flush()

    # Share record
    session.add(TripShare(
        id=uuid.uuid4(),
        trip_id=trip1.id,
        permission="view",
    ))

    # Stops for Trip 1
    if tokyo_id:
        stop1_tokyo = Stop(
            id=uuid.uuid4(),
            trip_id=trip1.id,
            city_id=tokyo_id,
            order_index=0,
            arrival_date=date(2026, 10, 10),
            departure_date=date(2026, 10, 14),
        )
        session.add(stop1_tokyo)
        await session.flush()

        # Add activities in Tokyo
        tokyo_acts = (await session.execute(
            select(Activity).where(Activity.city_id == tokyo_id).limit(3)
        )).scalars().all()
        for i, act in enumerate(tokyo_acts):
            session.add(TripActivity(
                id=uuid.uuid4(),
                stop_id=stop1_tokyo.id,
                activity_id=act.id,
                scheduled_date=date(2026, 10, 11 + (i % 3)),
                scheduled_time=time(10 + i * 3, 0),
                cost_override=act.cost if act.cost > 0 else 25.0,
                order_index=i,
            ))

    if kyoto_id:
        stop2_kyoto = Stop(
            id=uuid.uuid4(),
            trip_id=trip1.id,
            city_id=kyoto_id,
            order_index=1,
            arrival_date=date(2026, 10, 14),
            departure_date=date(2026, 10, 17),
        )
        session.add(stop2_kyoto)
        await session.flush()

        kyoto_acts = (await session.execute(
            select(Activity).where(Activity.city_id == kyoto_id).limit(3)
        )).scalars().all()
        for i, act in enumerate(kyoto_acts):
            session.add(TripActivity(
                id=uuid.uuid4(),
                stop_id=stop2_kyoto.id,
                activity_id=act.id,
                scheduled_date=date(2026, 10, 15 + (i % 2)),
                scheduled_time=time(9 + i * 4, 0),
                cost_override=act.cost,
                order_index=i,
            ))

    if osaka_id:
        stop3_osaka = Stop(
            id=uuid.uuid4(),
            trip_id=trip1.id,
            city_id=osaka_id,
            order_index=2,
            arrival_date=date(2026, 10, 17),
            departure_date=date(2026, 10, 20),
        )
        session.add(stop3_osaka)
        await session.flush()

        osaka_acts = (await session.execute(
            select(Activity).where(Activity.city_id == osaka_id).limit(2)
        )).scalars().all()
        for i, act in enumerate(osaka_acts):
            session.add(TripActivity(
                id=uuid.uuid4(),
                stop_id=stop3_osaka.id,
                activity_id=act.id,
                scheduled_date=date(2026, 10, 18),
                scheduled_time=time(12 + i * 4, 30),
                cost_override=act.cost if act.cost > 0 else 40.0,
                order_index=i,
            ))

    # ──────────────────────────────────────────────────────────
    # Trip 2: Mediterranean Summer Escape (Alice)
    # ──────────────────────────────────────────────────────────
    rome_id = city_id_map.get("Rome_Italy")
    paris_id = city_id_map.get("Paris_France")
    barcelona_id = city_id_map.get("Barcelona_Spain")

    trip2 = Trip(
        id=uuid.uuid4(),
        owner_id=alice.id,
        name="Mediterranean Wonders",
        description="Exploring Rome, Paris, and Barcelona architectural and gastronomic icons.",
        start_date=date(2026, 7, 5),
        end_date=date(2026, 7, 18),
        daily_budget=250.0,
        base_currency="EUR",
        cover_photo="https://images.unsplash.com/photo-1552832230-c0197dd311b5",
        is_public=False,
    )
    session.add(trip2)
    await session.flush()

    if rome_id:
        s_rome = Stop(id=uuid.uuid4(), trip_id=trip2.id, city_id=rome_id, order_index=0, arrival_date=date(2026, 7, 5), departure_date=date(2026, 7, 9))
        session.add(s_rome)
        await session.flush()
        rome_acts = (await session.execute(select(Activity).where(Activity.city_id == rome_id).limit(2))).scalars().all()
        for i, act in enumerate(rome_acts):
            session.add(TripActivity(id=uuid.uuid4(), stop_id=s_rome.id, activity_id=act.id, scheduled_date=date(2026, 7, 6), order_index=i))

    if paris_id:
        s_paris = Stop(id=uuid.uuid4(), trip_id=trip2.id, city_id=paris_id, order_index=1, arrival_date=date(2026, 7, 9), departure_date=date(2026, 7, 14))
        session.add(s_paris)
        await session.flush()
        paris_acts = (await session.execute(select(Activity).where(Activity.city_id == paris_id).limit(2))).scalars().all()
        for i, act in enumerate(paris_acts):
            session.add(TripActivity(id=uuid.uuid4(), stop_id=s_paris.id, activity_id=act.id, scheduled_date=date(2026, 7, 10), order_index=i))

    # ──────────────────────────────────────────────────────────
    # Trip 3: American Coast Highlights (Bob)
    # ──────────────────────────────────────────────────────────
    ny_id = city_id_map.get("New York_United States")
    sf_id = city_id_map.get("San Francisco_United States")

    trip3 = Trip(
        id=uuid.uuid4(),
        owner_id=bob.id,
        name="USA East to West Coast Highlights",
        description="Iconic urban adventures across New York and San Francisco.",
        start_date=date(2026, 9, 1),
        end_date=date(2026, 9, 10),
        daily_budget=200.0,
        base_currency="USD",
        cover_photo="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
        is_public=True,
        share_slug=generate_nanoid(size=12),
    )
    session.add(trip3)
    await session.flush()

    if ny_id:
        s_ny = Stop(id=uuid.uuid4(), trip_id=trip3.id, city_id=ny_id, order_index=0, arrival_date=date(2026, 9, 1), departure_date=date(2026, 9, 5))
        session.add(s_ny)
        await session.flush()
        ny_acts = (await session.execute(select(Activity).where(Activity.city_id == ny_id).limit(2))).scalars().all()
        for i, act in enumerate(ny_acts):
            session.add(TripActivity(id=uuid.uuid4(), stop_id=s_ny.id, activity_id=act.id, scheduled_date=date(2026, 9, 2), order_index=i))

    if sf_id:
        s_sf = Stop(id=uuid.uuid4(), trip_id=trip3.id, city_id=sf_id, order_index=1, arrival_date=date(2026, 9, 5), departure_date=date(2026, 9, 10))
        session.add(s_sf)
        await session.flush()
        sf_acts = (await session.execute(select(Activity).where(Activity.city_id == sf_id).limit(2))).scalars().all()
        for i, act in enumerate(sf_acts):
            session.add(TripActivity(id=uuid.uuid4(), stop_id=s_sf.id, activity_id=act.id, scheduled_date=date(2026, 9, 6), order_index=i))

    print(f"[+] Seeded 3 mock trips with stops, scheduled activities, and public shares")


async def seed_all() -> None:
    """Complete seeding routine: tables, cities, activities, users, mock trips."""
    try:
        await init_db()
        async with async_session() as session:
            city_id_map = await seed_cities_and_activities(session)
            users_map = await seed_users(session)
            await seed_mock_trips(session, users_map, city_id_map)
            await session.commit()
        print("\n[SUCCESS] ALL MOCK DATA SEEDED SUCCESSFULLY TO POSTGRESQL!")
    finally:
        await engine.dispose()


def main() -> None:
    """CLI entry point."""
    if len(sys.argv) < 2 or sys.argv[1] in ("--help", "-h"):
        print("GlobeTrotter Database CLI:")
        print("  python -m app.cli init-db")
        print("  python -m app.cli seed-all")
        print("  python -m app.cli seed-data")
        print("  python -m app.cli create-admin <email> <password> [name]")
        return

    command = sys.argv[1]

    if command == "init-db":
        async def _init():
            try:
                await init_db()
            finally:
                await engine.dispose()
        asyncio.run(_init())
    elif command in ("seed-all", "seed"):
        asyncio.run(seed_all())
    elif command == "seed-data":
        async def _run():
            try:
                await init_db()
                async with async_session() as s:
                    await seed_cities_and_activities(s)
                    await s.commit()
            finally:
                await engine.dispose()
        asyncio.run(_run())
    elif command == "create-admin":
        if len(sys.argv) < 4:
            print("Usage: python -m app.cli create-admin <email> <password> [name]")
            sys.exit(1)
        email = sys.argv[2]
        password = sys.argv[3]
        name = sys.argv[4] if len(sys.argv) > 4 else "Admin"
        async def _admin():
            try:
                await init_db()
                async with async_session() as s:
                    user = User(
                        id=uuid.uuid4(),
                        email=email,
                        password_hash=hash_password(password),
                        name=name,
                        role="admin",
                    )
                    s.add(user)
                    await s.commit()
                    print(f"Created admin: {email}")
            finally:
                await engine.dispose()
        asyncio.run(_admin())
    else:
        print(f"Unknown command: {command}")


if __name__ == "__main__":
    main()
