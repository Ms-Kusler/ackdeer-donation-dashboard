// api/monthly-donations.js
import pool from "./_db.js";

/**
 * Returns last 12 months (including current) with summed amounts.
 * Output shape:
 * { ok: true, data: [{ month: "2025-09", total: 1234.56 }, ...] }
 */
export default async function handler(_req, res) {
  try {
    const q = await pool.query(
      `
      SELECT
        to_char(date_trunc('month', created_at AT TIME ZONE 'UTC'), 'YYYY-MM') AS month,
        COALESCE(SUM(amount), 0)::float AS total
      FROM donations
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 12;
      `
    );

    // sort ascending for charting
    const data = q.rows
      .map(r => ({ month: r.month, total: Number(r.total) }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error("[/api/monthly-donations] ERROR:", err);
    res.status(500).json({ ok: false, error: "Failed to load monthly donations" });
  }
}
