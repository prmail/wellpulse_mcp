<div align="center">

<img src="https://raw.githubusercontent.com/prmail/Wellness Pulse_mcp/main/Wellness Pulse.jpeg" alt="Wellness Pulse Logo" width="120" style="border-radius: 16px;" />

<h1>Wellness Pulse MCP</h1>

<p><strong>Plug your AI into real wellbeing intelligence — one connection, instant insight.</strong></p>

<p>
  <a href="https://wpulse.org/"><img src="https://img.shields.io/badge/Website-wpulse.org-0ea5e9?style=for-the-badge&logo=globe&logoColor=white" alt="Website" /></a>
  <a href="https://wpulse.org/mcp/"><img src="https://img.shields.io/badge/Status-Live-22c55e?style=for-the-badge&logo=statuspage&logoColor=white" alt="Status" /></a>
  <a href="https://claude.ai"><img src="https://img.shields.io/badge/Claude-Compatible-8b5cf6?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude" /></a>
  <a href="https://cursor.sh"><img src="https://img.shields.io/badge/Cursor-Compatible-3b82f6?style=for-the-badge&logo=cursor&logoColor=white" alt="Cursor" /></a>
  <a href="https://wpulse.org/"><img src="https://img.shields.io/badge/License-Institutional-1e3a5f?style=for-the-badge&logo=licenseplate&logoColor=white" alt="License" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Protocol-MCP%202025--03--26-f97316?style=for-the-badge" alt="MCP Protocol" />
  <img src="https://img.shields.io/badge/Transport-HTTP%20Stream%20%7C%20SSE-ec4899?style=for-the-badge" alt="Transport" />
  <img src="https://img.shields.io/badge/Data-CDC%20PLACES%20%2B%20Institutional-10b981?style=for-the-badge" alt="Data Sources" />
  <img src="https://img.shields.io/badge/Privacy-No%20Tracking%20%7C%20No%20IDs-6366f1?style=for-the-badge&logo=shield&logoColor=white" alt="Privacy" />
</p>

<br />

> **Wellness Pulse MCP** is a plug-and-play intelligence layer that turns raw wellbeing data into clear, actionable insights for AI systems.  
> One integration connects your copilots, agents, and dashboards to trusted public benchmarks and live institutional wellness signals — no analyst required.

</div>

---

## 🧠 What Is Wellness Pulse MCP?

Wellness Pulse MCP is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that bridges the gap between raw wellbeing data and AI-powered understanding.

With a **single integration**, your AI gets access to:

- 📊 **CDC PLACES public benchmarks** — trusted mental health data for any ZIP code or county in the US
- 🏢 **Institutional wellness signals** — live trends, snapshots, and alert checks from your organization's Wellness Pulse data
- 🗣️ **Plain-English explanations** — AI-ready summaries returned alongside structured JSON

Built for fast **"ask → answer"** workflows in copilots, automations, and AI dashboards — no human analysis needed in the loop.

---

## ✨ Why Teams Add Wellness Pulse MCP

| Capability | What It Unlocks |
|---|---|
| 📖 **Instant Narrative** | Your AI explains *"what changed and why it matters"* without a human analyst. |
| 📍 **CDC Benchmarks** | County-level mental distress context for marketing decks, reports, and grant applications. |
| 📡 **Live Institution Signals** | Daily trends + alert checks that catch wellbeing drops before they become crises. |
| 🔌 **One Integration** | Add the MCP once — reuse it across every copilot, agent, and dashboard your team runs. |
| 🔒 **Privacy-First** | No user tracking. No identifiers. Trusted by institutions that take privacy seriously. |

---

## 🏗️ Architecture Overview

![Wellness Pulse Architecture](https://raw.githubusercontent.com/prmail/Wellness Pulse_mcp/main/Flowchart.png)

---

## 🛠️ Available Tools

### 🌍 Public Benchmark Tools

#### `get_mental_health_benchmark`
Fetches CDC PLACES **Frequent Mental Distress (FMD)** data for a given ZIP code or county FIPS.

**Arguments:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `zip` | string | optional* | 5-digit US ZIP code |
| `county_fips` | string | optional* | County FIPS code |

*At least one of `zip` or `county_fips` is required.*

**Returns:** `scope`, `values`, `national_percentile_rank` (optional), `marketing_copy`

**Example use case:** *"What's the CDC mental distress benchmark for ZIP 94597?"*

---

#### `get_basic_alert_guidance`
Returns **default alert thresholds** based on organization size and location type — no institution ID needed.

**Arguments:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `org_size` | string | ✅ | e.g. `"small"`, `"medium"`, `"large"` |
| `location_type` | string | ✅ | e.g. `"urban"`, `"rural"`, `"suburban"` |

**Example use case:** *"What alert thresholds should we use for a mid-size suburban institution?"*

---

### 🏢 Institution Data Tools

> These tools require a valid institution identifier (`institution_id`) from your Wellness Pulse account.

#### `get_institution_snapshot`
A **point-in-time snapshot** of wellness data for your institution over a given window.

**Arguments:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `institution_id` | string | ✅ | Your Wellness Pulse institution ID |
| `window_days` | integer | ✅ | Look-back window in days (e.g. `30`, `90`) |

**Returns:** `response_count`, `avg_wellness_score`, `last_response_at`

---

#### `get_institution_trend_daily`
Fetches a **daily time-series** of wellness scores and response counts.

**Arguments:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `institution_id` | string | ✅ | Your Wellness Pulse institution ID |
| `window_days` | integer | ✅ | Number of days to include |

**Returns:** Array of `{ day, avg_wellness, responses }` objects

**Example use case:** *"What's our wellness trend for the last 90 days?"*

---

#### `get_institution_alert_check`
**Compares last 7 days vs prior 7 days** and flags significant drops.

**Arguments:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `institution_id` | string | ✅ | Your Wellness Pulse institution ID |

**Returns:** `drop_pct`, `alert` (boolean flag)

**Example use case:** *"Did we drop week-over-week? Should we be concerned?"*

---

#### `get_sector_snapshot`
Sector-level aggregated wellness data across institutions.

**Arguments:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `sector` | string | ✅ | Sector identifier |
| `window_days` | integer | ✅ | Look-back window in days |

**Returns:** `institutions_with_responses`, `total_responses`, `avg_wellness_score`

---

## 🚀 Getting Started

### Step 1 — Add to Your AI Client

#### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "Wellness Pulse": {
      "url": "https://wpulse.org/mcp/",
      "transport": "http-stream"
    }
  }
}
```

#### Cursor (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "Wellness Pulse": {
      "url": "https://wpulse.org/mcp/",
      "transport": "http-stream"
    }
  }
}
```

---

### Step 2 — Initialize a Session (via cURL)

```bash
curl -s https://wpulse.org/mcp/ \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": { "name": "my-app", "version": "1.0.0" }
    }
  }'
```

> 📌 Capture the `mcp-session-id` from the response headers — you'll need it for all subsequent calls.

---

### Step 3 — List Available Tools

```bash
curl -s https://wpulse.org/mcp/ \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: <YOUR_SESSION_ID>" \
  -d '{ "jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {} }'
```

---

### Step 4 — Call a Tool

**Example: Fetch CDC benchmark for a ZIP code**

```bash
curl -s https://wpulse.org/mcp/ \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: <YOUR_SESSION_ID>" \
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

**Example: Check institution alert status**

```bash
curl -s https://wpulse.org/mcp/ \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: <YOUR_SESSION_ID>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "get_institution_alert_check",
      "arguments": { "institution_id": "inst_abc123" }
    }
  }'
```

---

## 💬 Example Prompts to Ask Your AI

Once Wellness Pulse MCP is connected, try asking your AI:

```
"What's our wellness trend for the last 90 days?"
"Did we drop week-over-week? Why might that matter?"
"What's the CDC mental distress benchmark for ZIP 94597?"
"Write a short exec update with our wellness numbers and CDC context."
"Are we above or below the national average for mental distress?"
"Flag any alert conditions in our institution data this week."
"Summarize the sector snapshot and highlight any outliers."
```

---

## 🔌 Endpoints Reference

| Type | URL |
|---|---|
| **HTTP Stream** (canonical) | `https://wpulse.org/mcp/` |
| **HTTP Stream** (redirect) | `https://wpulse.org/mcp` |
| **SSE** | `https://wpulse.org/sse` |

**Required headers for HTTP Streaming:**
```
Content-Type: application/json
Accept: application/json, text/event-stream
```

All calls use **JSON-RPC 2.0**.

---

## 🔐 Privacy & Security

Wellness Pulse MCP is built with a **privacy-first architecture**:

- ✅ No user tracking or behavioral logging
- ✅ No personally identifiable information (PII) stored or transmitted
- ✅ Institution data is scoped and access-controlled per account
- ✅ All transport over HTTPS
- ✅ Designed for compliance-conscious environments (healthcare, education, HR)

---

## 🗺️ Use Cases

### 🏥 Healthcare & Employee Wellness Teams
Use daily trend monitoring and week-over-week alert checks to detect emerging burnout or distress signals before they escalate — and give clinical or HR leadership an AI-generated executive summary on demand.

### 🎓 Universities & Educational Institutions
Combine CDC county benchmarks with your student wellness survey data to contextualize scores relative to regional norms — ideal for accreditation reports and student affairs presentations.

### 📈 HR Tech & Wellness Platforms
Embed Wellness Pulse MCP into your existing copilot or dashboard product to instantly add benchmarked mental health context and trend narration — without building your own data pipeline.

### 📢 Public Health Communications
Pull CDC PLACES FMD data by ZIP or county to generate marketing copy, grant narratives, and community health reports grounded in authoritative public data.

### 🤖 AI Agents & Automations
Wire Wellness Pulse MCP into multi-step agents that periodically check for alert conditions, draft stakeholder updates, and route escalations — all without human-in-the-loop analysis.

---

## 📚 Resources

- 🌐 **Website:** [wpulse.org](https://wpulse.org/)
- 📖 **MCP Protocol Docs:** [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- 📊 **CDC PLACES Data:** [cdc.gov/places](https://www.cdc.gov/places/)
- 🐛 **Issues / Support:** [wpulse.org](https://wpulse.org/)

---

## 📄 License

This server is available under an **Institutional License**. Please visit [wpulse.org](https://wpulse.org/) for licensing details and institutional access.

---

<div align="center">

<img src="https://raw.githubusercontent.com/prmail/Wellness Pulse_mcp/main/Wellness Pulse.jpeg" alt="Wellness Pulse" width="60" />

<p>Built with care by the <strong>Wellness Pulse</strong> team.<br/>Helping organizations understand and act on wellbeing data — intelligently.</p>

<p>
  <a href="https://wpulse.org/">wpulse.org</a> •
  <a href="https://wpulse.org/mcp/">Live MCP Endpoint</a>
</p>

</div>
