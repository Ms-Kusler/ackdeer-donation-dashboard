// api/public-stats.js
import pool from "./_db.js";

export default async function handler(_req, res) {
  try {
    // total amount
    const totalAmountQ = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount FROM donations;`
    );

    // number of donations (rows)
    const totalDonationsQ = await pool.query(
      `SELECT COUNT(*)::int AS total_donations FROM donations;`
    );

    // distinct donor emails engaged
    const donorsEngagedQ = await pool.query(
      `SELECT COUNT(DISTINCT donor_email)::int AS donors_engaged FROM donations WHERE donor_email IS NOT NULL AND donor_email <> '';`
    );

    const data = {
      totalAmount: Number(totalAmountQ.rows[0].total_amount || 0),
      totalDonations: totalDonationsQ.rows[0].total_donations || 0,
      donorsEngaged: donorsEngagedQ.rows[0].donors_engaged || 0
    };

    res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error("[/api/public-stats] ERROR:", err);
    res.status(500).json({ ok: false, error: "Failed to load public stats" });
  }
}
