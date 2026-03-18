import "dotenv/config";
import { FastMCP } from "fastmcp";

// ── Tool registrations ────────────────────────────────────────────────────────
import { registerTool as registerMentalHealthBenchmark } from "./tools/mentalHealthBenchmark.js";
import { registerTool as registerSectorSnapshot        } from "./tools/sectorSnapshot.js";
import { registerTool as registerBasicAlertGuidance    } from "./tools/basicAlertGuidance.js";
import { registerTool as registerInstitutionSnapshot   } from "./tools/institutionSnapshot.js";
import { registerTool as registerTrendDaily            } from "./tools/institutionTrendDaily.js";
import { registerTool as registerAlertCheck            } from "./tools/institutionAlertCheck.js";

// ── Server setup ──────────────────────────────────────────────────────────────
const server = new FastMCP({
  name:    "WellPulse MCP",
  version: "1.0.0",
});

registerMentalHealthBenchmark(server);
registerSectorSnapshot(server);
registerBasicAlertGuidance(server);
registerInstitutionSnapshot(server);
registerTrendDaily(server);
registerAlertCheck(server);

// ── Start ─────────────────────────────────────────────────────────────────────
const MCP_PORT = parseInt(process.env.MCP_PORT || "8383", 10);

server.start({
  transportType: "httpStream",
  httpStream: { port: MCP_PORT },
});

console.log(`[WellPulse MCP] Server running on http://localhost:${MCP_PORT}/mcp`);
console.log(`[WellPulse MCP] SSE endpoint at http://localhost:${MCP_PORT}/sse`);
