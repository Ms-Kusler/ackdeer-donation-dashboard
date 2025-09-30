// api/donations.js
import pool from "./_db.js";

/**
 * POST /api/donations
 * Body JSON:
 * {
 *   donorName: string,
 *   donorEmail: string,
 *   amount: number|string,
 *   donationType?: string,        // 'monetary' | 'in-kind' | etc.
 *   donorPhone?: string|null,
 *   donorAddress?: string|null,
 *   publicMessage?: string|null,
 *   isAnonymous?: boolean
 * }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const bodyText = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? "");
    const data = typeof req.body === "object" && req.body !== null ? req.body : JSON.parse(bodyText || "{}");

    const donorName = (data.donorName || "").trim();
    const donorEmail = (data.donorEmail || "").trim();
    const amount = Number(data.amount);
    const donationType = (data.donationType || "monetary").trim();
    const donorPhone = data.donorPhone ?? null;
    const donorAddress = data.donorAddress ?? null;
    const publicMessage = data.publicMessage ?? null;
    const isAnonymous = Boolean(data.isAnonymous);

    if (!donorName || !donorEmail || !Number.isFinite(amount)) {
      return res.status(400).json({ ok: false, error: "Missing or invalid fields (donorName, donorEmail, amount)" });
    }

    const sql = `
      INSERT INTO donations
        (donor_name, donor_email, amount, donation_type, donor_phone, donor_address, public_message, is_anonymous, created_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id
    `;

    const params = [donorName, donorEmail, amount, donationType, donorPhone, donorAddress, publicMessage, isAnonymous];

    const result = await pool.query(sql, params);

    return res.status(200).json({ ok: true, id: result.rows[0]?.id ?? null });
  } catch (err) {
    console.error("[/api/donations] ERROR:", err?.message || err, err?.stack);
    return res.status(500).json({ ok: false, error: err?.message || "Internal Server Error" });
  }
}
