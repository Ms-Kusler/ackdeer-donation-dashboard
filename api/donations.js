// api/donations.js
import pool from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const {
      donorName,
      donorEmail,
      amount,
      donationType,
      donorPhone = null,
      donorAddress = null,
      publicMessage = null,
      isAnonymous = false
    } = req.body || {};

    if (!donorName || !donorEmail || amount == null || !donationType) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const client = await pool.connect();
    try {
      const sql = `
        INSERT INTO donations
          (donor_name, donor_email, amount, donation_type, donor_phone, donor_address, public_message, is_anonymous)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id, created_at
      `;
      const params = [donorName, donorEmail, amount, donationType, donorPhone, donorAddress, publicMessage, isAnonymous];
      const { rows } = await client.query(sql, params);

      res.status(200).json({
        success: true,
        donation: {
          id: rows[0].id,
          donorName,
          donorEmail,
          amount,
          donationType,
          createdAt: rows[0].created_at
        }
      });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to record donation" });
  }
}
