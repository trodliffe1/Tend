#!/usr/bin/env python3
"""
Find upcoming events in your area (next 7 days) using OpenAI Responses API + web_search.

Prereqs:
  pip install --upgrade openai pydantic python-dotenv

Env:
  Create a .env file in this directory with:
    OPENAI_API_KEY=sk-your-key-here

Run:
  python event_api_tester.py
  python event_api_tester.py --days 10 --max-events 30 --no-cache
  python event_api_tester.py --location "Brooklyn, New York" --country US --city "New York" --region "New York"
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sqlite3
import sys
import warnings
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, date, timezone
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError

# Load environment variables from .env file
load_dotenv()

try:
    # Python 3.9+
    from zoneinfo import ZoneInfo
except Exception as e:  # pragma: no cover
    raise RuntimeError("zoneinfo not available. Use Python 3.9+.") from e


# ----------------------------
# Structured output schema
# ----------------------------

class Event(BaseModel):
    title: str = Field(..., description="Event name/title")
    start_datetime_local: str = Field(..., description="Start datetime in local timezone, ISO-like string")
    end_datetime_local: Optional[str] = Field(None, description="End datetime in local timezone, ISO-like string if known")
    venue: Optional[str] = None
    address: Optional[str] = None
    area_hint: Optional[str] = Field(
        None,
        description="A short hint like 'Hackney', 'Islington', 'Walthamstow', 'Stratford', etc."
    )
    category: Optional[str] = Field(None, description="e.g., live music, comedy, art, markets, family, talks, sport")
    price: Optional[str] = Field(None, description="e.g., Free, £10, £10–£20")
    booking_url: Optional[str] = Field(None, description="URL for booking/tickets")
    source_name: Optional[str] = Field(None, description="Where it was found (e.g., venue site, Eventbrite)")
    source_url: Optional[str] = Field(None, description="URL of the source page")
    short_description: Optional[str] = None


class QueryWindow(BaseModel):
    start_date: str = Field(..., description="Start date in ISO format (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date in ISO format (YYYY-MM-DD)")
    timezone: str = Field(..., description="Timezone used (e.g., Europe/London)")


class LocationInfo(BaseModel):
    country: str = Field(..., description="Country code (e.g., GB, US)")
    city: str = Field(..., description="City name")
    region: Optional[str] = Field(None, description="Region or state")
    constraints: Optional[str] = Field(None, description="Any location constraints applied")


class EventResults(BaseModel):
    query_window: QueryWindow = Field(..., description="The date range queried")
    location: LocationInfo = Field(..., description="Location information for the search")
    events: list[Event] = Field(..., description="Events list")
    notes: Optional[str] = Field(None, description="Any caveats/assumptions/filters used")


# ----------------------------
# Simple SQLite cache
# ----------------------------

@dataclass
class CacheConfig:
    path: Path
    ttl_seconds: int = 6 * 60 * 60  # 6 hours


class SqliteCache:
    def __init__(self, cfg: CacheConfig):
        self.cfg = cfg
        self.cfg.path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self.cfg.path) as con:
            con.execute(
                """
                CREATE TABLE IF NOT EXISTS cache (
                    k TEXT PRIMARY KEY,
                    created_utc INTEGER NOT NULL,
                    v TEXT NOT NULL
                )
                """
            )

    @staticmethod
    def _now_utc_epoch() -> int:
        return int(datetime.now(timezone.utc).timestamp())

    def get(self, key: str) -> Optional[str]:
        with sqlite3.connect(self.cfg.path) as con:
            row = con.execute("SELECT created_utc, v FROM cache WHERE k = ?", (key,)).fetchone()
            if not row:
                return None
            created_utc, v = row
            if self._now_utc_epoch() - int(created_utc) > self.cfg.ttl_seconds:
                return None
            return v

    def set(self, key: str, value: str) -> None:
        with sqlite3.connect(self.cfg.path) as con:
            con.execute(
                "INSERT OR REPLACE INTO cache(k, created_utc, v) VALUES (?, ?, ?)",
                (key, self._now_utc_epoch(), value),
            )


# ----------------------------
# OpenAI call helpers
# ----------------------------

def stable_cache_key(payload: dict) -> str:
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def safe_model_dump(obj: Any) -> dict:
    """Works across SDK object types. Suppresses Pydantic serialization warnings for unknown types."""
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")
        if hasattr(obj, "model_dump"):
            return obj.model_dump()
        if hasattr(obj, "dict"):
            return obj.dict()
        if isinstance(obj, dict):
            return obj
        return {"value": str(obj)}


def extract_web_sources(resp_dump: dict) -> list[dict]:
    """
    If include=["web_search_call.action.sources"] was set, sources may appear under output items.
    We return a best-effort list of source dicts.
    """
    sources: list[dict] = []
    out = resp_dump.get("output", [])
    for item in out:
        if item.get("type") == "web_search_call":
            action = item.get("action") or {}
            # In some SDK versions, sources might be nested differently.
            for s in action.get("sources", []) or []:
                if isinstance(s, dict):
                    sources.append(s)
    return sources


@dataclass
class LocationConfig:
    """Configuration for event search location."""
    description: str  # Human-readable location for prompt (e.g., "North and East London")
    country: str      # ISO country code (e.g., "GB", "US")
    city: str         # City name for API location bias
    region: str       # Region/state for API location bias
    timezone: str     # Timezone for date handling (e.g., "Europe/London")


# Default location configuration
DEFAULT_LOCATION = LocationConfig(
    description="East London",
    country="GB",
    city="London",
    region="London",
    timezone="Europe/London",
)


def build_prompt(start_d: date, end_d: date, max_events: int, location: LocationConfig) -> str:
    return f"""
You are an event-finding assistant. Your goal is to find AS MANY real, upcoming public events as possible
happening in {location.description} between {start_d.isoformat()} and {end_d.isoformat()} (inclusive),
timezone {location.timezone}.

IMPORTANT: Search multiple sources to maximize results. Try searching:
- Eventbrite for {location.city}
- Time Out {location.city}
- Local venue websites
- Meetup.com events
- Facebook events (if accessible)
- Local newspaper/magazine event listings

Target: Find at least {max_events} events. More is better.

Constraints:
- Only include events physically located in {location.description}.
- Include diverse categories: live music, comedy, theatre, art exhibitions, markets, food/drink,
  talks/lectures, workshops, family events, sports, networking, community events.
- Each event MUST have a source_url pointing to a page with event details.
- If price is unknown, set price to null.
- If end time is unknown, end_datetime_local can be null.
- Use concise descriptions (1-2 sentences).

Return results in the required JSON schema.
""".strip()


def fetch_events(
    client: OpenAI,
    start_d: date,
    end_d: date,
    max_events: int,
    model: str,
    location: LocationConfig,
) -> tuple[EventResults, dict]:
    """
    Calls Responses API with:
      - web_search tool (with configurable approximate location)
      - Structured Outputs parsing into EventResults
    """
    prompt = build_prompt(start_d, end_d, max_events, location)

    resp = client.responses.parse(
        model=model,
        input=[
            {
                "role": "system",
                "content": "You return only JSON that matches the provided schema. No extra text.",
            },
            {"role": "user", "content": prompt},
        ],
        # Structured Outputs via Pydantic
        text_format=EventResults,
        # Enable web search + user location bias
        tools=[
            {
                "type": "web_search",
                "user_location": {
                    "type": "approximate",
                    "country": location.country,
                    "city": location.city,
                    "region": location.region,
                },
            }
        ],
        tool_choice="auto",
        include=["web_search_call.action.sources"],
        # Allow more searches to find more events
        max_tool_calls=20,
    )

    parsed: EventResults = resp.output_parsed
    resp_dump = safe_model_dump(resp)
    return parsed, resp_dump


# ----------------------------
# CLI / main
# ----------------------------

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=7, help="How many days ahead (default: 7)")
    ap.add_argument("--max-events", type=int, default=25, help="Max events to return (default: 25)")
    ap.add_argument("--model", type=str, default="gpt-5.2-pro", help="Model name/snapshot")
    ap.add_argument("--start-date", type=str, default=None, help="YYYY-MM-DD (default: today in local timezone)")
    ap.add_argument("--no-cache", action="store_true", help="Disable cache")
    ap.add_argument("--out", type=str, default="events.json", help="Output JSON file")
    ap.add_argument("--debug-raw", action="store_true", help="Also write raw response JSON beside output")

    # Location arguments
    ap.add_argument("--location", type=str, default=None,
                    help="Location description for event search (e.g., 'Brooklyn, New York')")
    ap.add_argument("--country", type=str, default=None, help="ISO country code (e.g., 'US', 'GB')")
    ap.add_argument("--city", type=str, default=None, help="City name for API location bias")
    ap.add_argument("--region", type=str, default=None, help="Region/state for API location bias")
    ap.add_argument("--timezone", type=str, default=None,
                    help="Timezone (e.g., 'America/New_York', 'Europe/London')")
    args = ap.parse_args()

    if not os.getenv("OPENAI_API_KEY"):
        print("Missing OPENAI_API_KEY env var. Create a .env file with OPENAI_API_KEY=sk-...", file=sys.stderr)
        return 2

    # Build location config from args or use defaults
    if args.location:
        # If location is provided, require country/city/region or use sensible defaults
        location = LocationConfig(
            description=args.location,
            country=args.country or "US",
            city=args.city or args.location.split(",")[0].strip(),
            region=args.region or (args.location.split(",")[1].strip() if "," in args.location else ""),
            timezone=args.timezone or "America/New_York",
        )
    else:
        location = LocationConfig(
            description=args.location or DEFAULT_LOCATION.description,
            country=args.country or DEFAULT_LOCATION.country,
            city=args.city or DEFAULT_LOCATION.city,
            region=args.region or DEFAULT_LOCATION.region,
            timezone=args.timezone or DEFAULT_LOCATION.timezone,
        )

    tz = ZoneInfo(location.timezone)
    today_local = datetime.now(tz).date()
    start_d = date.fromisoformat(args.start_date) if args.start_date else today_local
    end_d = start_d + timedelta(days=max(args.days - 1, 0))

    # Cache setup
    cache = SqliteCache(CacheConfig(path=Path.home() / ".cache" / "openai" / "event_api_cache.sqlite"))
    cache_payload = {
        "v": 2,  # Bump version when prompt logic changes
        "model": args.model,
        "start": start_d.isoformat(),
        "end": end_d.isoformat(),
        "max_events": args.max_events,
        "location": location.description,
    }
    cache_key = stable_cache_key(cache_payload)

    if not args.no_cache:
        cached = cache.get(cache_key)
        if cached:
            Path(args.out).write_text(cached, encoding="utf-8")
            print(f"Wrote cached results to {args.out}")
            return 0

    client = OpenAI()

    try:
        parsed, raw = fetch_events(
            client=client,
            start_d=start_d,
            end_d=end_d,
            max_events=args.max_events,
            model=args.model,
            location=location,
        )
    except ValidationError as ve:
        print("Model output failed schema validation:\n", ve, file=sys.stderr)
        return 3
    except Exception as e:
        print("Request failed:\n", repr(e), file=sys.stderr)
        return 4

    # Convert to dict for JSON output
    data = parsed.model_dump()

    # Attach sources (best-effort) into notes to keep schema stable.
    sources = extract_web_sources(raw)
    if sources:
        data["notes"] = (data.get("notes") or "").strip()
        src_compact = [{"url": s.get("url"), "title": s.get("title")} for s in sources if s.get("url")]
        blob = "\nSources consulted (from web_search tool):\n" + json.dumps(src_compact[:50], indent=2)
        data["notes"] = (data["notes"] + "\n" + blob).strip()

    out_json = json.dumps(data, ensure_ascii=False, indent=2)
    Path(args.out).write_text(out_json, encoding="utf-8")
    print(f"Wrote {len(data.get('events', []))} events to {args.out}")

    if args.debug_raw:
        raw_path = str(Path(args.out).with_suffix(".raw_response.json"))
        Path(raw_path).write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote raw response to {raw_path}")

    if not args.no_cache:
        cache.set(cache_key, out_json)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
