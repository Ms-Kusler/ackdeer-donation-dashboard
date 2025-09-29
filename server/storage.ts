import { type User, type InsertUser, type Donation, type InsertDonation, type PublicStats, type InsertPublicStats } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Donation methods
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonations(): Promise<Donation[]>;
  updateDonationEmailStatus(id: string, emailSent: boolean): Promise<void>;
  
  // Public stats methods
  getPublicStats(): Promise<PublicStats | undefined>;
  updatePublicStats(stats: InsertPublicStats): Promise<PublicStats>;
  
  // Analytics for dashboard
  getMonthlyDonations(): Promise<Array<{ month: string; amount: number }>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private donations: Map<string, Donation>;
  private publicStats: PublicStats | undefined;

  constructor() {
    this.users = new Map();
    this.donations = new Map();
    this.publicStats = undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = randomUUID();
    const donation: Donation = {
      ...insertDonation,
      id,
      createdAt: new Date(),
      emailSent: false,
      isAnonymous: insertDonation.isAnonymous ?? false,
      publicMessage: insertDonation.publicMessage ?? null,
      donorPhone: insertDonation.donorPhone ?? null,
      donorAddress: insertDonation.donorAddress ?? null,
      privateNotes: null,
    };
    this.donations.set(id, donation);
    
    // Update public stats
    await this.updateStatsAfterDonation(donation);
    
    return donation;
  }

  async getDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values());
  }

  async updateDonationEmailStatus(id: string, emailSent: boolean): Promise<void> {
    const donation = this.donations.get(id);
    if (donation) {
      donation.emailSent = emailSent;
      this.donations.set(id, donation);
    }
  }

  async getPublicStats(): Promise<PublicStats | undefined> {
    return this.publicStats;
  }

  async updatePublicStats(stats: InsertPublicStats): Promise<PublicStats> {
    const id = randomUUID();
    this.publicStats = {
      ...stats,
      id,
      lastUpdated: new Date(),
    };
    return this.publicStats;
  }

  async getMonthlyDonations(): Promise<Array<{ month: string; amount: number }>> {
    const donations = Array.from(this.donations.values());
    const monthlyData = new Map<string, number>();
    
    donations.forEach(donation => {
      const month = donation.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      const currentAmount = monthlyData.get(month) || 0;
      monthlyData.set(month, currentAmount + parseFloat(donation.amount));
    });

    // Sort monthly data by month ascending to ensure correct chart ordering
    return Array.from(monthlyData.entries())
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, amount]) => ({
        month,
        amount
      }));
  }

  private async updateStatsAfterDonation(donation: Donation): Promise<void> {
    const currentStats = this.publicStats;
    const allDonations = Array.from(this.donations.values());
    
    const totalDonations = allDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const donorCount = new Set(allDonations.map(d => d.donorEmail)).size;
    
    // Calculate meals and deer based on donation amount
    // Assuming: $1 = 3 meals, and 1 deer = 37.5 meals (75,000 meals / 2,000 deer)
    const mealsProvided = Math.floor(totalDonations * 3);
    const deerProcessed = Math.floor(mealsProvided / 37.5);
    
    await this.updatePublicStats({
      totalDonations: totalDonations.toString(),
      donorCount: donorCount.toString(),
      mealsProvided: mealsProvided.toString(),
      deerProcessed: deerProcessed.toString(),
    });
  }
}

export const storage = new MemStorage();
