// api/public-stats.js
import pool from "./_db.js";

/**
 * GET /api/public-stats
 * Returns high-level KPI counts
 */
export default async function handler(_req, res) {
  if (_req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const sql = `
      SELECT
        COUNT(*)::int                               AS donation_count,
        COALESCE(SUM(amount), 0)::float            AS total_amount,
        COUNT(DISTINCT donor_email)::int           AS donors_count
      FROM donations
    `;
    const { rows } = await pool.query(sql);
    const row = rows[0] || { donation_count: 0, total_amount: 0, donors_count: 0 };

    return res.status(200).json({
      ok: true,
      data: {
        donationCount: row.donation_count,
        totalAmount: row.total_amount,
        donorsCount: row.donors_count
      }
    });
  } catch (err) {
    console.error("[/api/public-stats] ERROR:", err?.message || err, err?.stack);
    return res.status(500).json({ ok: false, error: err?.message || "Internal Server Error" });
  }
}
