import { z } from "zod";

// No DB needed — pure rule-of-thumb lookup table.
const THRESHOLDS = {
  small: { dropPercent: 20, minResponses: 5  },
  mid:   { dropPercent: 15, minResponses: 10 },
  large: { dropPercent: 10, minResponses: 20 },
};

export function registerTool(server) {
  server.addTool({
    name: "get_basic_alert_guidance",
    description:
      "Default alert thresholds by org_size and location_type (pre-learning baseline). " +
      "Inputs: org_size (small|mid|large), location_type (campus|ward|store|office|other). " +
      "Outputs: recommended_drop_pct, window_days, min_responses, rationale.",
    parameters: z.object({
      org_size: z
        .enum(["small", "mid", "large"])
        .describe("Rough size bucket of the organisation"),
      location_type: z
        .enum(["campus", "ward", "store", "office", "other"])
        .describe("Type of physical location being monitored"),
    }),
    execute: async ({ org_size: orgSize, location_type: locationType }) => {
      const base = THRESHOLDS[orgSize] ?? THRESHOLDS.mid;
      return JSON.stringify({
        org_size:             orgSize,
        location_type:        locationType,
        recommended_drop_pct: base.dropPercent,
        window_days:          7,
        min_responses:        base.minResponses,
        rationale:
          "Rule-of-thumb alert threshold based on reasonable volatility assumptions; " +
          "upgrade later with learned thresholds once more data accumulates.",
      }, null, 2);
    },
  });
}
