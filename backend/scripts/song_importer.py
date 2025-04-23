import os
import time
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv
from supabase import create_client, Client

# Get path to .env file in parent directory
env_path = Path(__file__).resolve().parents[1] / '.env'

# Load .env file
load_dotenv(dotenv_path=env_path)

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
DELAY = 0.67  # 90 requests/minute limit
START_YEAR = 2020  # Adjust as needed

# Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_anime_themes(year: int, season: str, page: int) -> dict:
    """Fetch anime themes for a specific season with pagination"""
    params = {
        "filter[year]": year,
        "filter[season]": season,
        "filter[has]": "animethemes",
        "include": "animethemes.song.artists,animethemes.animethemeentries.videos,images",
        "fields[anime]": "id,name,slug",
        "fields[image]": "path",
        "page[size]": 100,
        "page[number]": page
    }
    response = requests.get("https://api.animethemes.moe/anime", params=params)
    response.raise_for_status()
    return response.json()


def fetch_long_runners(page: int) -> dict:
    """Fetch long-running series (50+ episodes)"""
    params = {
        "filter[type]": "TV",
        "filter[episode_count][ge]": 50,
        "filter[has]": "animethemes",
        "include": "animethemes.song.artists,animethemes.animethemeentries.videos,images",
        "page[size]": 100,
        "page[number]": page
    }
    response = requests.get("https://api.animethemes.moe/anime", params=params)
    response.raise_for_status()
    return response.json()


def process_anime(anime: dict) -> list:
    """Convert API response to Supabase-ready rows"""
    rows = []
    anime_id = anime["id"]
    title = anime["name"]
    year = anime.get("year", datetime.now().year)
    season = anime.get("season", "unknown")

    # Get anime image (first available)
    image_url = None
    if "images" in anime:
        for img in anime["images"]:
            if img.get("path"):
                image_url = f"https://animethemes.moe/image/{img['path']}"
                break

    # Process themes
    for theme in anime.get("animethemes", []):
        for entry in theme.get("animethemeentries", []):
            rows.append({
                "id": f"{anime_id}-{theme['type']}-{theme['sequence']}",
                "created_at": datetime.now().isoformat(),
                "year": year,
                "season": season,
                "title": theme["song"]["title"],
                "artist": ", ".join(a["name"] for a in theme["song"]["artists"]),
                "type": f"{theme['type']} {theme['sequence']}",
                "image_url": image_url,
                "video_url": entry["videos"][0]["link"] if entry.get("videos") else None,
                "rating": 0,
                "matches_played": 0
            })
    return rows


def upsert_to_supabase(rows: list):
    """Batch upsert to Supabase"""
    if not rows:
        return
    supabase.table("anime_songs").upsert(rows).execute()


def scrape_all():
    current_year = datetime.now().year
    seasons = ["winter", "spring", "summer", "fall"]

    # 1. Scrape seasonal anime
    for year in range(START_YEAR, current_year + 1):
        for season in seasons:
            page = 1
            while True:
                try:
                    data = fetch_anime_themes(year, season, page)
                    for anime in data.get("anime", []):
                        upsert_to_supabase(process_anime(anime))

                    if not data.get("links", {}).get("next"):
                        break
                    page += 1
                    time.sleep(DELAY)
                except Exception as e:
                    print(f"Error {year} {season} page {page}: {e}")
                    time.sleep(5)

    # 2. Scrape long-running series
    page = 1
    while True:
        try:
            data = fetch_long_runners(page)
            for anime in data.get("anime", []):
                upsert_to_supabase(process_anime(anime))

            if not data.get("links", {}).get("next"):
                break
            page += 1
            time.sleep(DELAY)
        except Exception as e:
            print(f"Error long-runners page {page}: {e}")
            time.sleep(5)


if __name__ == "__main__":
    scrape_all()
    print("Import completed!")
