import os
import time
from datetime import datetime

import click
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

# Configuration
DELAY = 0.67  # 90 requests/minute limit
START_YEAR = 2020  # Adjust as needed


class SongImporter:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    @staticmethod
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
            "page[number]": page,
        }
        response = requests.get("https://api.animethemes.moe/anime", params=params)
        response.raise_for_status()
        return response.json()

    @staticmethod
    def fetch_long_runners(page: int) -> dict:
        """Fetch long-running series (50+ episodes)"""
        params = {
            "filter[type]": "TV",
            "filter[episode_count][ge]": 50,
            "filter[has]": "animethemes",
            "include": "animethemes.song.artists,animethemes.animethemeentries.videos,images",
            "page[size]": 100,
            "page[number]": page,
        }
        response = requests.get("https://api.animethemes.moe/anime", params=params)
        response.raise_for_status()
        return response.json()

    @staticmethod
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
                rows.append(
                    {
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
                        "matches_played": 0,
                    }
                )
        return rows

    def upsert_to_supabase(self, rows: list) -> None:
        """Batch upsert to Supabase"""
        if not rows:
            return
        self.supabase.table("anime_songs").upsert(rows).execute()

    def scrape_all(self) -> None:
        current_year = datetime.now().year
        seasons = ["winter", "spring", "summer", "fall"]

        # 1. Scrape seasonal anime
        for year in range(START_YEAR, current_year + 1):
            for season in seasons:
                page = 1
                while True:
                    try:
                        data = self.fetch_anime_themes(year, season, page)
                        for anime in data.get("anime", []):
                            self.upsert_to_supabase(self.process_anime(anime))

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
                data = self.fetch_long_runners(page)
                for anime in data.get("anime", []):
                    self.upsert_to_supabase(self.process_anime(anime))

                if not data.get("links", {}).get("next"):
                    break
                page += 1
                time.sleep(DELAY)
            except Exception as e:
                print(f"Error long-runners page {page}: {e}")
                time.sleep(5)


@click.command()
@click.option(
    "--env-path",
    "-e",
    help="Path to the .env file",
)
def main(env_path: str) -> None:
    # Load .env file
    load_dotenv(dotenv_path=env_path)

    # Configuration
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    supabase: Client = create_client(supabase_url, supabase_key)
    song_importer = SongImporter(supabase)
    song_importer.scrape_all()
    print("Import completed!")


if __name__ == "__main__":
    main()
