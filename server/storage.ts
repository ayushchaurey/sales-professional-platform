import { db } from "./db";
import { eq, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { users, jobs, applications, profiles } from "@shared/schema";
import type { User, Job, Application, Profile, InsertProfile } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;

  getJobs(location?: string): Promise<Job[]>;
  createJob(job: Omit<Job, "id" | "createdAt" | "status">): Promise<Job>;

  createApplication(app: Omit<Application, "id" | "createdAt" | "status">): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  getApplications(userId: number, role: string): Promise<Application[]>;

  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(userId: number, profile: Partial<InsertProfile>): Promise<Profile>;
  updateProfile(userId: number, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  getSalesProfiles(): Promise<(Profile & { location: string })[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: Omit<User, "id">) {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getJobs(location?: string) {
    if (location) {
      return db.select().from(jobs).where(eq(jobs.location, location));
    }
    return db.select().from(jobs);
  }

  async createJob(job: Omit<Job, "id" | "createdAt" | "status">) {
    const [newJob] = await db
      .insert(jobs)
      .values({
        ...job,
        status: "open",
      })
      .returning();
    return newJob;
  }

  async createApplication(app: Omit<Application, "id" | "createdAt" | "status">) {
    const [newApp] = await db
      .insert(applications)
      .values({
        ...app,
        status: "pending",
      })
      .returning();
    return newApp;
  }

  async updateApplicationStatus(id: number, status: "pending" | "approved" | "rejected") {
    const [updatedApp] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updatedApp;
  }

  async getApplications(userId: number, role: string) {
    if (role === "sales") {
      return db
        .select()
        .from(applications)
        .where(eq(applications.salesId, userId));
    }

    const companyJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.companyId, userId));

    const jobIds = companyJobs.map(job => job.id);

    if (jobIds.length === 0) return [];

    return db
      .select()
      .from(applications)
      .where(inArray(applications.jobId, jobIds));
  }

  async getProfile(userId: number) {
    if (!userId || isNaN(userId)) return undefined;

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(userId: number, profile: Partial<InsertProfile>) {
    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId,
        ...profile,
      })
      .returning();
    return newProfile;
  }

  async updateProfile(userId: number, profile: Partial<InsertProfile>) {
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async getSalesProfiles() {
    const result = await db
      .select({
        id: profiles.id,
        userId: profiles.userId,
        headline: profiles.headline,
        summary: profiles.summary,
        experience: profiles.experience,
        education: profiles.education,
        skills: profiles.skills,
        achievements: profiles.achievements,
        website: profiles.website,
        industry: profiles.industry,
        companySize: profiles.companySize,
        foundedYear: profiles.foundedYear,
        resumeUrl: profiles.resumeUrl,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
        location: users.location,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(users.role, "sales"));

    return result;
  }
}

export const storage = new DatabaseStorage();