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
      const monthlyData = await db.execute(sql`
        SELECT 
          TO_CHAR(created_at, 'Mon') as month,
          SUM(CAST(amount AS DECIMAL)) as total
        FROM donations 
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Mon')
        ORDER BY DATE_TRUNC('month', created_at)
      `);

      res.json(monthlyData.rows.map(row => ({
        month: row.month,
        total: Number(row.total)
      })));
    } catch (error) {
      console.error("Error fetching monthly donations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
