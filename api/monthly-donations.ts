const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
        COALESCE(SUM(amount), 0)::numeric(12,2)            AS total
      FROM public.donations
      GROUP BY 1
      ORDER BY 1
    `);

    res.status(200).json({
      success: true,
      series: rows.map(r => ({ month: r.month, total: Number(r.total) })),
    });
  } catch (err) {
    console.error('monthly-donations.js error:', err && err.message ? err.message : err);
    res.status(500).json({ success: false, message: 'Failed to load monthly data' });
  }
};
