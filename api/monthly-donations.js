// api/monthly-donations.js
import pool from "./_db.js";

/**
 * GET /api/monthly-donations
 * Returns: [{ month: '2025-01', total: 1234.56 }, ...]
 */
export default async function handler(_req, res) {
  if (_req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const sql = `
      SELECT
        to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
        COALESCE(SUM(amount), 0)::float AS total
      FROM donations
      GROUP BY 1
      ORDER BY 1
    `;
    const { rows } = await pool.query(sql);
    return res.status(200).json({ ok: true, data: rows });
  } catch (err) {
    console.error("[/api/monthly-donations] ERROR:", err?.message || err, err?.stack);
    return res.status(500).json({ ok: false, error: err?.message || "Internal Server Error" });
  }
}
