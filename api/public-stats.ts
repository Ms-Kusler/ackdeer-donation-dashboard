const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COALESCE(SUM(amount), 0)::numeric(12,2) AS total_amount,
        COUNT(*)::int                        AS total_donations,
        COUNT(DISTINCT donor_email)::int     AS donors
      FROM public.donations
    `);

    const r = rows[0] || {};
    res.status(200).json({
      success: true,
      totalAmount: Number(r.total_amount || 0),
      totalDonations: Number(r.total_donations || 0),
      totalDonors: Number(r.donors || 0),
    });
  } catch (err) {
    console.error('public-stats.js error:', err && err.message ? err.message : err);
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
};
