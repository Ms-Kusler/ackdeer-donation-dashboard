// api/public-stats.js
import pool from "./_db.js";

export default async function handler(_req, res) {
  try {
    const client = await pool.connect();
    try {
      const q = `
        SELECT
          COUNT(*)::int                             AS total_records,
          COALESCE(SUM(amount),0)::numeric(12,2)   AS total_amount,
          COUNT(DISTINCT donor_email)::int         AS unique_donors
        FROM donations
      `;
      const { rows } = await client.query(q);
      const r = rows[0] || { total_records: 0, total_amount: 0, unique_donors: 0 };

      res.status(200).json({
        success: true,
        totals: {
          records: r.total_records,
          amountUsd: r.total_amount,
          donors: r.unique_donors
        }
      });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to load public stats" });
  }
}
