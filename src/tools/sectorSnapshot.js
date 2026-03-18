import { z } from "zod";
import pool from "../db.js";

export function registerTool(server) {
  server.addTool({
    name: "get_sector_snapshot",
    description:
      "Sector-level wellness snapshot over a lookback window. " +
      "Inputs: sector (string), window_days (number, default 90). " +
      "Outputs: institutions_with_responses, total_responses, avg_wellness_score, note.",
    parameters: z.object({
      sector: z.string().describe("Institution business_type, e.g. 'academic', 'medical', 'communities', 'startup'"),
      window_days: z.number().positive().default(90).describe("Lookback window in days (default 90)"),
    }),
    execute: async ({ sector, window_days: windowDays }) => {
      const client = await pool.connect();
      try {
        const { rows } = await client.query(`
          WITH sector_inst AS (
            SELECT id
            FROM institutions
            WHERE business_type = $1
          ),
          sector_res AS (
            SELECT r.wellness_score
            FROM responses r
            JOIN surveys s ON r.survey_id = s.id
            JOIN sector_inst si ON si.id = s.institution_id
            WHERE r.created_at >= NOW() - ($2 || ' days')::interval
              AND r.wellness_score IS NOT NULL
          )
          SELECT
            (SELECT COUNT(DISTINCT s.institution_id)
               FROM responses r
               JOIN surveys s ON r.survey_id = s.id
               JOIN sector_inst si ON si.id = s.institution_id
            ) AS institutions_with_responses,
            (SELECT COUNT(*) FROM sector_res) AS total_responses,
            (SELECT AVG(wellness_score) FROM sector_res) AS avg_wellness
        `, [sector, windowDays]);

        const row = rows[0] || {};
        return JSON.stringify({
          sector,
          window_days: windowDays,
          institutions_with_responses: Number(row.institutions_with_responses || 0),
          total_responses:             Number(row.total_responses || 0),
          avg_wellness_score:
            row.avg_wellness != null ? Number(row.avg_wellness) : null,
          note: "Early directional data from current Wellness Pulse customers in this sector; not yet a full industry benchmark.",
        }, null, 2);
      } finally {
        client.release();
      }
    },
  });
}
