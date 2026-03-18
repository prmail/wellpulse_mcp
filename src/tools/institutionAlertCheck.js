import { z } from "zod";
import pool from "../db.js";

export function registerTool(server) {
  server.addTool({
    name: "get_institution_alert_check",
    description:
      "Alert check: compares last 7d vs prior 7d avg wellness for a drop. " +
      "Inputs: institution_id (number), drop_threshold_pct (default 15). " +
      "Outputs: averages {last7, prior7}, drop_pct, threshold_pct, alert (boolean).",
    parameters: z.object({
      institution_id:     z.number().int().positive().describe("Institution ID from the database"),
      drop_threshold_pct: z.number().positive().default(15).describe("Percent drop threshold to trigger alert, default 15"),
    }),
    execute: async ({ institution_id, drop_threshold_pct }) => {
      const client = await pool.connect();
      try {
        const { rows } = await client.query(`
          WITH last7 AS (
            SELECT AVG(r.wellness_score) AS avg_last7
            FROM responses r
            JOIN surveys s ON r.survey_id = s.id
            WHERE s.institution_id = $1
              AND r.created_at >= NOW() - interval '7 days'
              AND r.wellness_score IS NOT NULL
          ),
          prior7 AS (
            SELECT AVG(r.wellness_score) AS avg_prior7
            FROM responses r
            JOIN surveys s ON r.survey_id = s.id
            WHERE s.institution_id = $1
              AND r.created_at >= NOW() - interval '14 days'
              AND r.created_at <  NOW() - interval '7 days'
              AND r.wellness_score IS NOT NULL
          )
          SELECT last7.avg_last7, prior7.avg_prior7
          FROM last7, prior7
        `, [institution_id]);

        const row      = rows[0] || {};
        const avgLast  = row.avg_last7  != null ? Number(row.avg_last7)  : null;
        const avgPrior = row.avg_prior7 != null ? Number(row.avg_prior7) : null;

        let dropPct = null;
        let alert   = false;
        if (avgLast != null && avgPrior != null && avgPrior > 0) {
          dropPct = ((avgPrior - avgLast) / avgPrior) * 100.0;
          alert   = dropPct >= drop_threshold_pct;
        }

        return JSON.stringify({
          institution_id,
          averages:      { last7: avgLast, prior7: avgPrior },
          drop_pct:      dropPct != null ? Number(dropPct.toFixed(2)) : null,
          threshold_pct: drop_threshold_pct,
          alert,
        }, null, 2);
      } finally {
        client.release();
      }
    },
  });
}
