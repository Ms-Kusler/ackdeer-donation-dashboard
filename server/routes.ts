// server/routes.ts
import type { Express, Request, Response } from "express";
import { Pool } from "pg";

/**
 * Neon (Postgres) connection.
 * Make sure DATABASE_URL is set in your hosting env (Vercel/Render/Railway).
 * Example: postgres://user:pass@host/db?sslmode=require
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Helper for safe numeric parsing from JSON body.
 */
function toNumber(n: unknown): number | null {
  const num = typeof n === "string" ? Number(n) : (n as number);
  return Number.isFinite(num) ? num : null;
}

export async function registerRoutes(app: Express): Promise<void> {
  // Healthcheck
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  /**
   * POST /api/donations
   * Persist a donation submitted from the front-end form.
   * Expects JSON body matching SimpleDonationForm.tsx submit payload.
   */
  app.post("/api/donations", async (req: Request, res: Response) => {
    try {
      const {
        donorName,
        donorEmail,
        amount,
        donationType,
        donorPhone,
        donorAddress,
        publicMessage,
        isAnonymous,
      } = (req.body ?? {}) as {
        donorName?: string;
        donorEmail?: string;
        amount?: number | string;
        donationType?: string;
        donorPhone?: string | null;
        donorAddress?: string | null;
        publicMessage?: string | null;
        isAnonymous?: boolean;
      };

      const amountNumber = toNumber(amount);

      if (!donorName || !donorEmail || amountNumber === null || amountNumber < 0) {
        return res
          .status(400)
          .json({ success: false, message: "Missing or invalid required fields" });
      }

      const result = await pool.query(
        `INSERT INTO public.donations
          (donor_name, donor_email, amount, donation_type, donor_phone, donor_address, public_message, is_anonymous)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id, created_at`,
        [
          donorName,
          donorEmail,
          amountNumber,
          donationType ?? "monetary",
          donorPhone ?? null,
          donorAddress ?? null,
          publicMessage ?? null,
          Boolean(isAnonymous),
        ]
      );

      return res.status(201).json({
        success: true,
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at,
      });
    } catch (err: any) {
      console.error("Error saving donation:", err?.message || err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to save donation" });
    }
  });

  /**
   * GET /api/public-stats
   * Aggregates for KPI cards (total amount, total donors, total entries).
   */
  app.get("/api/public-stats", async (_req: Request, res: Response) => {
    try {
      const { rows } = await pool.query<{
        total_amount: string | null;
        total_donations: string;
        donors: string;
      }>(`
        SELECT
          COALESCE(SUM(amount), 0)::numeric(12,2) AS total_amount,
          COUNT(*)::int                        AS total_donations,
          COUNT(DISTINCT donor_email)::int     AS donors
        FROM public.donations
      `);

      const r = rows[0];
      return res.json({
        success: true,
        totalAmount: Number(r.total_amount ?? 0),
        totalDonations: Number(r.total_donations),
        totalDonors: Number(r.donors),
      });
    } catch (err: any) {
      console.error("Stats error:", err?.message || err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to load stats" });
    }
  });

  /**
   * GET /api/monthly-donations
   * Time series for charts: sum(amount) per month.
   */
  app.get("/api/monthly-donations", async (_req: Request, res: Response) => {
    try {
      const { rows } = await pool.query<{ month: string; total: string }>(`
        SELECT
          to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
          COALESCE(SUM(amount), 0)::numeric(12,2)            AS total
        FROM public.donations
        GROUP BY 1
        ORDER BY 1
      `);

      return res.json({
        success: true,
        series: rows.map(r => ({ month: r.month, total: Number(r.total) })),
      });
    } catch (err: any) {
      console.error("Monthly series error:", err?.message || err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to load monthly data" });
    }
  });
}
