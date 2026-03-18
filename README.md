# WellPulse MCP

**Plug your AI into real wellbeing intelligence.**

One connection gives your AI credible public benchmarks (CDC PLACES) plus institution-specific wellness signals — trends, snapshots, and alert checks — from your WellPulse data, returned in plain JSON.

---

## Why teams add this

| | |
|---|---|
| **Instant narrative** | Your AI can explain "what changed" without a human analyst |
| **Benchmarks that sell** | CDC county mental distress context for marketing and reports |
| **Institution signals** | Daily trends + alert checks to catch issues early |
| **One integration** | Add the MCP once; reuse across copilots, agents, dashboards |

---

## How it works

```
AI app / agent
   │  (MCP tools)
   ▼
WellPulse MCP (this server)
   ├─ Public benchmarks (CDC PLACES)
   └─ Institution data (your DB)
   ▼
Plain-English insights + structured JSON
```

Designed for fast "ask → answer" loops in copilots and automations.

---

## What you can ask

- *"What's our wellness trend for the last 90 days?"*
- *"Did we drop week-over-week? Why might that matter?"*
- *"What's the CDC mental distress benchmark for this ZIP?"*
- *"Write a short exec update with numbers and context."*

---

## Available Tools

| Tool | Description |
|---|---|
| `get_mental_health_benchmark` | CDC PLACES frequent mental distress (FMD) for a `zip` or `county_fips`; returns scope, values, optional `national_percentile_rank`, and `marketing_copy` |
| `get_sector_snapshot` | Sector-level snapshot over a window; returns `institutions_with_responses`, `total_responses`, `avg_wellness_score` |
| `get_basic_alert_guidance` | Default alert thresholds by `org_size` and `location_type` |
| `get_institution_snapshot` | Counts, `avg_wellness_score`, `last_response_at` for an institution over a window |
| `get_institution_trend_daily` | Daily series of `{ day, avg_wellness, responses }` |
| `get_institution_alert_check` | Compares last 7d vs prior 7d; returns `drop_pct` and `alert` flag |

---

## Endpoints

| Transport | URL |
|---|---|
| HTTP Stream | `https://wellpulse.org/mcp` |
| SSE | `https://wellpulse.org/sse` |

Use JSON-RPC. For HTTP streaming, include: `Accept: application/json, text/event-stream`

---

## Quickstart (cURL)

### 1 — Initialize session

```bash
curl -s https://wellpulse.org/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": { "name": "example", "version": "1.0.0" }
    }
  }'
```

Capture the `mcp-session-id` response header for subsequent calls.

### 2 — List tools

```bash
curl -s https://wellpulse.org/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: <SESSION_ID>" \
  -d '{ "jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {} }'
```

### 3 — Call a tool

```bash
curl -s https://wellpulse.org/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: <SESSION_ID>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_mental_health_benchmark",
      "arguments": { "zip": "94597" }
    }
  }'
```

---

## Running locally

### Prerequisites
- Node.js 18+
- PostgreSQL database with the WellPulse schema (`pulse` schema, `search_path` set accordingly)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your real DB credentials and preferred port

# 3. Start the server
npm start
```

The server starts at `http://localhost:8383` by default (configurable via `MCP_PORT` in `.env`).

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | *(required)* |
| `DB_USER` | Database user | *(required)* |
| `DB_PASSWORD` | Database password | *(required)* |
| `MCP_PORT` | Port the MCP server listens on | `8383` |

---

## Project structure

```
wellpulse-mcp/
├── .env.example              ← environment variable template
├── .gitignore
├── package.json
└── src/
    ├── index.js              ← entry point
    ├── db.js                 ← shared PostgreSQL pool
    └── tools/
        ├── mentalHealthBenchmark.js
        ├── sectorSnapshot.js
        ├── basicAlertGuidance.js
        ├── institutionSnapshot.js
        ├── institutionTrendDaily.js
        └── institutionAlertCheck.js
```

---

## Notes

- ZIP codes are resolved to county FIPS automatically via public APIs (zippopotam.us + FCC).
- If county-level CDC data is unavailable, responses include a national fallback with `scope: "national_fallback"`.
- Institution tools require a valid `institution_id` present in your database.

---

© 2026 Wellness Pulse
