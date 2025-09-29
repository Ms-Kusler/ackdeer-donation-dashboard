import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Donations table - contains both public and private data
export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Public data (can be shown in public dashboards)
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  donationType: text("donation_type").notNull(), // 'monetary', 'in-kind', 'equipment'
  isAnonymous: boolean("is_anonymous").default(false),
  publicMessage: text("public_message"), // Optional public thank you message
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Private data (donor information - never shown publicly)
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email").notNull(),
  donorPhone: text("donor_phone"),
  donorAddress: text("donor_address"),
  privateNotes: text("private_notes"), // Internal notes
  emailSent: boolean("email_sent").default(false), // Track if thank you email was sent
});

// Public statistics table - for dashboard KPIs (read-only for public)
export const publicStats = pgTable("public_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalDonations: decimal("total_donations", { precision: 12, scale: 2 }).notNull(),
  donorCount: decimal("donor_count", { precision: 8, scale: 0 }).notNull(),
  mealsProvided: decimal("meals_provided", { precision: 10, scale: 0 }).notNull(),
  deerProcessed: decimal("deer_processed", { precision: 8, scale: 0 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDonationSchema = createInsertSchema(donations).pick({
  amount: true,
  donationType: true,
  isAnonymous: true,
  publicMessage: true,
  donorName: true,
  donorEmail: true,
  donorPhone: true,
  donorAddress: true,
});

export const insertPublicStatsSchema = createInsertSchema(publicStats).pick({
  totalDonations: true,
  donorCount: true,
  mealsProvided: true,
  deerProcessed: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertPublicStats = z.infer<typeof insertPublicStatsSchema>;
export type PublicStats = typeof publicStats.$inferSelect;
