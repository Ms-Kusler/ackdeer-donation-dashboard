import { pgTable, serial, text, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

// Database schema for the "donations" table
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorName: text("donor_name").notNull(),
  donorEmail: text("donor_email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  donationType: text("donation_type").notNull(),
  donorPhone: text("donor_phone"),
  donorAddress: text("donor_address"),
  publicMessage: text("public_message"),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schema for validating incoming donation requests
export const insertDonationSchema = z.object({
  donorName: z.string().min(1),
  donorEmail: z.string().email(),
  amount: z.string().or(z.number()), // frontend might send string or number
  donationType: z.string().min(1),
  donorPhone: z.string().optional(),
  donorAddress: z.string().optional(),
  publicMessage: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});
