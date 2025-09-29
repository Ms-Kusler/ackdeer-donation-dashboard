import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDonationSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Donation endpoints
  app.post("/api/donations", async (req, res) => {
    try {
      const validatedData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(validatedData);
      
      // TODO: Send thank you email
      await sendThankYouEmail(donation.donorEmail, donation.donorName, donation.amount);
      await storage.updateDonationEmailStatus(donation.id, true);
      
      res.json({ success: true, donation: donation });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid donation data", details: error.errors });
      } else {
        console.error("Error creating donation:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Public statistics endpoint (for live dashboard display)
  app.get("/api/public-stats", async (req, res) => {
    try {
      const stats = await storage.getPublicStats();
      res.json(stats || {
        totalDonations: "0",
        donorCount: "0", 
        mealsProvided: "0",
        deerProcessed: "0",
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error("Error getting public stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Monthly donations for chart data
  app.get("/api/monthly-donations", async (req, res) => {
    try {
      const monthlyData = await storage.getMonthlyDonations();
      res.json(monthlyData);
    } catch (error) {
      console.error("Error getting monthly donations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin endpoint to get all donations (private data)
  app.get("/api/admin/donations", async (req, res) => {
    try {
      // TODO: Implement proper authentication/authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== 'Bearer admin-key-placeholder') {
        return res.status(401).json({ error: "Unauthorized access" });
      }
      
      const donations = await storage.getDonations();
      // Return only necessary fields for admin view, mask sensitive data
      const maskedDonations = donations.map(donation => ({
        id: donation.id,
        amount: donation.amount,
        donationType: donation.donationType,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail.replace(/(.{2}).*@/, '$1***@'), // Mask email
        isAnonymous: donation.isAnonymous,
        createdAt: donation.createdAt,
        emailSent: donation.emailSent
      }));
      res.json(maskedDonations);
    } catch (error) {
      console.error("Error getting donations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Email service function (placeholder for now)
async function sendThankYouEmail(email: string, name: string, amount: string): Promise<void> {
  // TODO: Implement with Resend API
  console.log(`Sending thank you email for donation of $${amount}`);
  // Note: Removed PII from logs for security
  
  try {
    // TODO: Replace with actual email service implementation
    // await resend.emails.send({
    //   from: 'donations@ackdeerproject.org',
    //   to: email,
    //   subject: 'Thank you for your donation!',
    //   html: generateThankYouEmailTemplate(name, amount)
    // });
  } catch (error) {
    console.error('Failed to send thank you email:', error.message);
    throw error; // Re-throw to handle in donation endpoint
  }
}
