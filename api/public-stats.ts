import { NextApiRequest, NextApiResponse } from "next";
import { storage } from "../server/storage";
import { donations } from "../shared/schema";

const dbSql = neon(process.env.DATABASE_URL!);
const db = drizzle(dbSql, { schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const stats = await db.select({
        totalDonations: sum(schema.donations.amount),
        donorCount: count(schema.donations.id),
        mealCount: sql<number>`COALESCE(SUM(CAST(${schema.donations.amount} AS DECIMAL) * 4), 0)`
      }).from(schema.donations);

      const result = stats[0];
      
      res.json({
        totalDonations: result.totalDonations || "0",
        donorCount: result.donorCount.toString(),
        mealCount: Math.floor(Number(result.mealCount)).toString()
      });
    } catch (error) {
      console.error("Error fetching public stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
