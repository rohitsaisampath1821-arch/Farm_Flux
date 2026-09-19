import time
import requests
from sqlalchemy import text
from app.main import engine

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

def geocode(location, district, state):
    query = ", ".join(
        x for x in [location, district, state, "India"]
        if x
    )

    try:
        response = requests.get(
            NOMINATIM_URL,
            params={
                "q": query,
                "format": "json",
                "limit": 1
            },
            headers={
                "User-Agent": "KisanMitra/1.0"
            },
            timeout=10
        )

        response.raise_for_status()
        data = response.json()

        if not data:
            print(f"❌ Not found: {query}")
            return None

        lat = float(data[0]["lat"])
        lon = float(data[0]["lon"])

        print(f"✓ {query} -> {lat}, {lon}")
        return lat, lon

    except Exception as e:
        print(f"❌ Error: {query} -> {e}")
        return None


def populate_table(table):
    with engine.connect() as conn:
        rows = conn.execute(
            text(f"""
                SELECT sid, location, district, state
                FROM {table}
                WHERE latitude IS NULL
                   OR longitude IS NULL
            """)
        ).mappings().all()

    print(f"\n{table}: {len(rows)} records need coordinates\n")

    # Avoid geocoding the same city repeatedly.
    cache = {}

    for row in rows:
        key = (
            row["location"],
            row["district"],
            row["state"]
        )

        if key not in cache:
            cache[key] = geocode(*key)
            time.sleep(1)

        coordinates = cache[key]

        if not coordinates:
            continue

        lat, lon = coordinates

        with engine.begin() as conn:
            conn.execute(
                text(f"""
                    UPDATE {table}
                    SET latitude = :lat,
                        longitude = :lon
                    WHERE sid = :sid
                """),
                {
                    "lat": lat,
                    "lon": lon,
                    "sid": row["sid"]
                }
            )


if __name__ == "__main__":
    populate_table("farmers")
    populate_table("buyers")

    print("\n✓ Coordinate population completed.")