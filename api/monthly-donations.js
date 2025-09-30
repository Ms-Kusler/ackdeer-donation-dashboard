// api/monthly-donations.js
import pool from "./_db.js";

export default async function handler(_req, res) {
  try {
    const client = await pool.connect();
    try {
      const q = `
        SELECT
          to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
          COALESCE(SUM(amount),0)::numeric(12,2)              AS total_amount
        FROM donations
        GROUP BY 1
        ORDER BY 1 ASC
      `;
      const { rows } = await client.query(q);
      res.status(200).json({ success: true, data: rows });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to load monthly donations" });
  }
}
