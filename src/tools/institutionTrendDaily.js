import { z } from "zod";
import pool from "../db.js";

export function registerTool(server) {
  server.addTool({
    name: "get_institution_trend_daily",
    description:
      "Daily average wellness trend for an institution. " +
      "Inputs: institution_id (number), window_days (default 90). " +
      "Outputs: series of { day, avg_wellness, responses } sorted ASC.",
    parameters: z.object({
      institution_id: z.number().int().positive().describe("Institution ID from the database"),
      window_days:    z.number().int().positive().default(90).describe("Lookback window in days (default 90)"),
    }),
    execute: async ({ institution_id, window_days }) => {
      const client = await pool.connect();
      try {
        const { rows } = await client.query(`
          SELECT
            DATE_TRUNC('day', r.created_at)::date AS day,
            AVG(r.wellness_score)                  AS avg_wellness,
            COUNT(*)                               AS responses
          FROM responses r
          JOIN surveys s ON r.survey_id = s.id
          WHERE s.institution_id = $1
            AND r.created_at >= NOW() - ($2 || ' days')::interval
            AND r.wellness_score IS NOT NULL
          GROUP BY 1
          ORDER BY 1 ASC
        `, [institution_id, window_days]);

        const series = rows.map((r) => ({
          day:          r.day,
          avg_wellness: r.avg_wellness != null ? Number(r.avg_wellness) : null,
          responses:    Number(r.responses || 0),
        }));

        return JSON.stringify({ institution_id, window_days, series }, null, 2);
      } finally {
        client.release();
      }
    },
  });
}
