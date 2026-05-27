# TrailForge

A local-first, offline-capable hiking and backpacking itinerary application built with React Native, Expo, and MapLibre.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Expo SDK 56 + Expo Router | File-based navigation, OTA updates |
| Language | TypeScript (strict) | End-to-end type safety |
| Map Engine | MapLibre React Native v11 | Open-source vector tile rendering |
| Styling | NativeWind v4 + Tailwind CSS 3 | Utility-first styling primitives |
| Local DB | WatermelonDB (SQLite) | Reactive offline-first data layer |
| Sync | PowerSync | Local-first conflict-free sync to Postgres |
| AI Backend | Python FastAPI + RAG microservice | Permit data, trail conditions, itinerary suggestions |

---

## Architecture: Local-First

TrailForge treats the local device as the **primary source of truth**. Network availability is a convenience, not a requirement.

```
┌─────────────────────────────────────────────────┐
│                  React Native App                │
│                                                 │
│  ┌──────────┐  ┌─────────────┐  ┌───────────┐  │
│  │ Map Tab  │  │  Itinerary  │  │   Gear    │  │
│  │ MapLibre │  │  Day Planner│  │  Checklist│  │
│  └────┬─────┘  └──────┬──────┘  └─────┬─────┘  │
│       └───────────────┼───────────────┘         │
│                       ▼                         │
│           ┌───────────────────────┐             │
│           │  WatermelonDB (SQLite)│             │
│           │  Reactive data layer  │             │
│           └──────────┬────────────┘             │
└──────────────────────┼──────────────────────────┘
                       │ Online only (background sync)
                       ▼
            ┌──────────────────────┐
            │  PowerSync + Postgres│
            │  Conflict-free CRDT  │
            └──────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Python RAG Backend  │
            │  FastAPI + LangChain │
            │  Trail DB + Permits  │
            └──────────────────────┘
```

### Data Flow

1. **Reads** always come from the local SQLite database — zero network latency.
2. **Writes** land in SQLite first, then PowerSync queues them for server reconciliation.
3. **Offline vector tiles** are downloaded via MapLibre's tile-cache layer so maps work without signal.
4. **AI suggestions** (permit windows, weather alerts, route optimizations) are pre-fetched and stored locally, refreshed when online.

---

## Map Stack

MapLibre React Native is used instead of Mapbox to keep the stack fully open-source and royalty-free.

- **Default style**: `https://demotiles.maplibre.org/style.json` (development)
- **Offline tiles**: MBTiles format, bundled or downloaded via MapLibre offline packs
- **Future**: OpenFreeMap or self-hosted PMTiles for production terrain tiles

> **Important**: MapLibre uses native code and does **not** work in Expo Go. You must use a development build:
> ```bash
> npx expo run:ios      # local iOS build
> npx expo run:android  # local Android build
> # or via EAS:
> eas build --profile development --platform ios
> ```

---

## AI / RAG Backend (Planned)

A separate Python microservice will power trail intelligence:

- **FastAPI** REST + WebSocket endpoints
- **LangChain** orchestration with tool-calling agents
- **ChromaDB** (or pgvector) vector store seeded with:
  - USGS trail data
  - Wilderness permit systems (Recreation.gov)
  - NOAA weather grids
  - Leave No Trace principles
- Communicates with the app via authenticated HTTPS; results are **cached locally in SQLite** so they survive offline sessions.

---

## Local Database Schema (Planned)

```sql
-- WatermelonDB models (defined in TypeScript, compiled to SQLite)
trips         (id, name, start_date, end_date, notes)
waypoints     (id, trip_id, lat, lng, name, elevation, type)
itinerary_days(id, trip_id, day_index, distance_km, notes)
gear_items    (id, name, weight_g, category, is_worn)
gear_lists    (id, trip_id, item_id, quantity)
offline_areas (id, trip_id, bbox, tile_zoom_min, tile_zoom_max, downloaded_at)
```

---

## Project Structure

```
trail-forge/
├── src/
│   ├── app/
│   │   ├── _layout.tsx         # Root layout + theme provider
│   │   ├── index.tsx           # Map tab (MapLibre full-screen)
│   │   ├── itinerary.tsx       # Day-planner tab
│   │   └── gear.tsx            # Base-weight calculator tab
│   ├── components/
│   │   ├── app-tabs.tsx        # Native tab bar (iOS/Android)
│   │   ├── app-tabs.web.tsx    # Web tab bar
│   │   └── ui/                 # Shared primitive components
│   ├── constants/
│   │   └── theme.ts            # Color tokens + spacing scale
│   ├── hooks/                  # Custom React hooks
│   └── global.css              # Tailwind directives + CSS vars
├── babel.config.js             # NativeWind Babel preset
├── metro.config.js             # NativeWind Metro plugin
├── tailwind.config.js          # Tailwind config (trail color tokens)
├── nativewind-env.d.ts         # NativeWind TypeScript types
└── app.json                    # Expo config (scheme: trailforge)
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start Metro bundler
npx expo start

# Run on device / simulator (required for MapLibre)
npx expo run:ios
npx expo run:android

# Web (map tab renders a fallback on web)
npx expo start --web
```

---

## Engineering Principles

- **Offline-first, sync-second**: every user action works without a network connection.
- **Open-source map stack**: no Mapbox token, no vendor lock-in.
- **Type-safe everywhere**: strict TypeScript, Zod validation at API boundaries.
- **Reactive data**: WatermelonDB observers drive UI updates without manual cache invalidation.
- **Privacy by default**: location data never leaves the device unless the user explicitly exports a trip.
