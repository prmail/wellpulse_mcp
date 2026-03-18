import { z } from "zod";
import pool from "../db.js";

export function registerTool(server) {
  server.addTool({
    name: "get_institution_snapshot",
    description:
      "Institution snapshot over a lookback window. " +
      "Inputs: institution_id (number), window_days (default 30). " +
      "Outputs: total_responses, avg_wellness_score, last_response_at.",
    parameters: z.object({
      institution_id: z.number().int().positive().describe("Institution ID from the database"),
      window_days:    z.number().int().positive().default(30).describe("Lookback window in days (default 30)"),
    }),
    execute: async ({ institution_id, window_days }) => {
      const client = await pool.connect();
      try {
        const { rows } = await client.query(`
          WITH inst_res AS (
            SELECT r.wellness_score, r.created_at
            FROM responses r
            JOIN surveys s ON r.survey_id = s.id
            WHERE s.institution_id = $1
              AND r.created_at >= NOW() - ($2 || ' days')::interval
              AND r.wellness_score IS NOT NULL
          )
          SELECT
            COUNT(*)            AS total_responses,
            AVG(wellness_score) AS avg_wellness,
            MAX(created_at)     AS last_response_at
          FROM inst_res
        `, [institution_id, window_days]);

        const row = rows[0] || {};
        return JSON.stringify({
          institution_id,
          window_days,
          total_responses:   Number(row.total_responses || 0),
          avg_wellness_score: row.avg_wellness != null ? Number(row.avg_wellness) : null,
          last_response_at:   row.last_response_at || null,
        }, null, 2);
      } finally {
        client.release();
      }
    },
  });
}
