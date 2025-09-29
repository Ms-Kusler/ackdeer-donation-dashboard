import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { insertDonationSchema } from '../shared/schema';
import { ZodError } from 'zod';

interface VercelRequest {
  method: string;
  body: any;
}

interface VercelResponse {
  setHeader: (key: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  end: () => void;
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Mock email function
async function sendThankYouEmail(email: string, name: string, amount: string) {
  console.log(`Thank you email would be sent to ${email} for ${name} - Amount: $${amount}`);
  return true;
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const validatedData = insertDonationSchema.parse(req.body);
      
      const [donation] = await db.insert(schema.donations).values({
        ...validatedData,
        amount: validatedData.amount.toString(),
        createdAt: new Date(),
        emailSent: false
      }).returning();

      // Send thank you email
      await sendThankYouEmail(donation.donorEmail, donation.donorName, donation.amount);
      
      // Update email status
      await db.update(schema.donations)
        .set({ emailSent: true })
        .where(eq(schema.donations.id, donation.id));

      res.json({ success: true, donation });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid donation data", details: error.errors });
      } else {
        console.error("Error creating donation:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}