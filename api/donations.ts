const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const {
      donorName,
      donorEmail,
      amount,
      donationType,
      donorPhone,
      donorAddress,
      publicMessage,
      isAnonymous,
    } = body;

    const amt = Number(amount);
    if (!donorName || !donorEmail || !Number.isFinite(amt)) {
      res.status(400).json({ success: false, message: 'Missing or invalid fields' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO public.donations
       (donor_name, donor_email, amount, donation_type, donor_phone, donor_address, public_message, is_anonymous)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, created_at`,
      [
        donorName,
        donorEmail,
        amt,
        donationType || 'monetary',
        donorPhone || null,
        donorAddress || null,
        publicMessage || null,
        Boolean(isAnonymous),
      ]
    );

    res.status(201).json({
      success: true,
      id: result.rows[0].id,
      createdAt: result.rows[0].created_at,
    });
  } catch (err) {
    console.error('donations.js error:', err && err.message ? err.message : err);
    res.status(500).json({ success: false, message: 'Failed to save donation' });
  }
};
