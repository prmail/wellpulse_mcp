import { z } from "zod";
import pool from "../db.js";

/**
 * Resolves a US ZIP code → 5-digit county FIPS string using two public APIs:
 *   1. zippopotam.us  — ZIP → lat/lon
 *   2. FCC Area API   — lat/lon → county FIPS
 */
async function resolveCountyFipsFromZip(zipCode) {
  const digits = String(zipCode).replace(/\D+/g, "");
  if (!digits || digits.length < 3) return null;

  const zipRes = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(digits)}`);
  if (!zipRes.ok) return null;

  const zipData = await zipRes.json().catch(() => null);
  const place = zipData && Array.isArray(zipData.places) && zipData.places[0];
  if (!place?.latitude || !place?.longitude) return null;

  const fccRes = await fetch(
    `https://geo.fcc.gov/api/census/area?format=json&lat=${encodeURIComponent(place.latitude)}&lon=${encodeURIComponent(place.longitude)}`
  );
  if (!fccRes.ok) return null;

  const fccData = await fccRes.json().catch(() => null);
  const fipsRaw = fccData?.results?.[0]?.county_fips;
  if (!fipsRaw) return null;

  const onlyDigits = String(fipsRaw).replace(/\D+/g, "");
  return onlyDigits ? onlyDigits.padStart(5, "0") : null;
}

/** Fetches the national median + average FMD from the DB. */
async function getNationalStats(client) {
  const { rows } = await client.query(`
    SELECT
      percentile_cont(0.5) WITHIN GROUP (ORDER BY value_pct) AS median_fmd,
      AVG(value_pct) AS avg_fmd
    FROM public_mental_health_prevalence
    WHERE source = 'CDC_PLACES'
      AND year = 2021
      AND measure_id = 'FMD'
  `);
  const row = rows[0] || {};
  return {
    median: row.median_fmd != null ? Number(row.median_fmd) : null,
    avg:    row.avg_fmd    != null ? Number(row.avg_fmd)    : null,
  };
}

export function registerTool(server) {
  server.addTool({
    name: "get_mental_health_benchmark",
    description:
      "CDC PLACES frequent mental distress (FMD) benchmark. " +
      "Inputs: zip (string) or county_fips (5-digit). If neither provided, returns national summary. " +
      "Outputs: scope (county|national|national_fallback), core values (pct and CI), optional national_percentile_rank, and marketing_copy.",
    parameters: z.object({
      zip: z.string().optional().describe("US ZIP code, e.g. 94597"),
      county_fips: z.string().optional().describe("5-digit county FIPS code; overrides zip if both are provided"),
    }),
    execute: async ({ zip, county_fips }) => {
      const client = await pool.connect();
      try {
        // ── No location provided → national summary ─────────────────────────
        if (!zip && !county_fips) {
          const { median, avg } = await getNationalStats(client);
          const copy =
            median != null && avg != null
              ? `Across U.S. counties, about ${median.toFixed(1)}–${avg.toFixed(1)}% of adults report frequent mental distress (CDC PLACES 2021). Wellness Pulse helps you move your organization below that risk band.`
              : null;
          return JSON.stringify({
            success: true,
            scope: "national",
            data: {
              median_frequent_mental_distress_pct: median != null ? Number(median.toFixed(1)) : null,
              avg_frequent_mental_distress_pct:    avg    != null ? Number(avg.toFixed(1))    : null,
            },
            marketing_copy: copy,
          }, null, 2);
        }

        // ── Resolve county FIPS ─────────────────────────────────────────────
        let targetFips = null;
        if (county_fips) {
          const cleaned = String(county_fips).replace(/\D+/g, "").padStart(5, "0");
          targetFips = cleaned || null;
        } else if (zip) {
          targetFips = await resolveCountyFipsFromZip(zip);
        }

        // ── FIPS resolution failed → national fallback ──────────────────────
        if (!targetFips) {
          const { median, avg } = await getNationalStats(client);
          const copy =
            median != null && avg != null
              ? `County-level CDC PLACES data is not available for this input, so we use the national benchmark instead. Across U.S. counties, about ${median.toFixed(1)}–${avg.toFixed(1)}% of adults report frequent mental distress (CDC PLACES 2021). Wellness Pulse helps you move your organization below that risk band.`
              : null;
          return JSON.stringify({
            success: true,
            scope: "national_fallback",
            data: {
              frequent_mental_distress_pct:  avg    != null ? Number(avg.toFixed(1))    : null,
              national_median_fmd_pct:       median != null ? Number(median.toFixed(1)) : null,
            },
            marketing_copy: copy,
          }, null, 2);
        }

        // ── County-level lookup ─────────────────────────────────────────────
        const countyRes = await client.query(`
          SELECT geography_code, geography_name, value_pct, lower_ci, upper_ci
          FROM public_mental_health_prevalence
          WHERE source = 'CDC_PLACES'
            AND year = 2021
            AND measure_id = 'FMD'
            AND geography_level = 'county'
            AND geography_code = $1
          LIMIT 1
        `, [targetFips]);

        const county = countyRes.rows[0];
        if (!county) {
          const { median, avg } = await getNationalStats(client);
          const copy =
            median != null && avg != null
              ? `County-level CDC PLACES data is not available for this ZIP, so we use the national benchmark instead. Across U.S. counties, about ${median.toFixed(1)}–${avg.toFixed(1)}% of adults report frequent mental distress (CDC PLACES 2021). Wellness Pulse helps you move your organization below that risk band.`
              : null;
          return JSON.stringify({
            success: true,
            scope: "national_fallback",
            data: {
              frequent_mental_distress_pct:  avg    != null ? Number(avg.toFixed(1))    : null,
              national_median_fmd_pct:       median != null ? Number(median.toFixed(1)) : null,
            },
            marketing_copy: copy,
          }, null, 2);
        }

        // ── Percentile rank within all counties ─────────────────────────────
        const pct = Number(county.value_pct);
        const prRes = await client.query(`
          SELECT 100.0 * SUM(CASE WHEN value_pct <= $1 THEN 1 ELSE 0 END) / COUNT(*) AS percentile_rank
          FROM public_mental_health_prevalence
          WHERE source = 'CDC_PLACES'
            AND year = 2021
            AND measure_id = 'FMD'
            AND geography_level = 'county'
        `, [pct]);
        const pr =
          prRes.rows[0]?.percentile_rank != null
            ? Number(prRes.rows[0].percentile_rank)
            : null;

        const name         = county.geography_name;
        const valueRounded = Number(pct.toFixed(1));
        const copyParts    = [
          `In ${name}, about ${valueRounded}% of adults report frequent mental distress (CDC PLACES 2021).`,
        ];
        if (pr != null) {
          if      (pr > 60) copyParts.push("That places this county above most U.S. counties for mental distress risk.");
          else if (pr < 40) copyParts.push("That places this county below most U.S. counties for mental distress risk.");
          else              copyParts.push("That's roughly in the middle of U.S. counties for mental distress risk.");
        }
        copyParts.push(`Wellness Pulse helps organizations in ${name} track real-time wellbeing and respond before distress turns into burnout or dropout.`);

        return JSON.stringify({
          success: true,
          scope: "county",
          data: {
            county_fips:                   county.geography_code,
            county_name:                   county.geography_name,
            frequent_mental_distress_pct:  valueRounded,
            lower_ci:                      county.lower_ci != null ? Number(county.lower_ci) : null,
            upper_ci:                      county.upper_ci != null ? Number(county.upper_ci) : null,
            national_percentile_rank:      pr != null ? Number(pr.toFixed(1)) : null,
          },
          marketing_copy: copyParts.join(" "),
        }, null, 2);
      } finally {
        client.release();
      }
    },
  });
}
