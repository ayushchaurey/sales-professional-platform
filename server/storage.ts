import { IStorage } from "./storage";
import createMemoryStore from "memorystore";
import session from "express-session";
import { User, Job, Application } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  
  getJobs(location?: string): Promise<Job[]>;
  createJob(job: Omit<Job, "id" | "createdAt" | "status">): Promise<Job>;
  
  createApplication(app: Omit<Application, "id" | "createdAt" | "status">): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  getApplications(userId: number, role: string): Promise<Application[]>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private currentIds: { users: number; jobs: number; applications: number };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.currentIds = { users: 1, jobs: 1, applications: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number) {
    return this.users.get(id);
  }

  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: Omit<User, "id">) {
    const id = this.currentIds.users++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getJobs(location?: string) {
    const jobs = Array.from(this.jobs.values());
    if (location) {
      return jobs.filter(job => job.location === location);
    }
    return jobs;
  }

  async createJob(job: Omit<Job, "id" | "createdAt" | "status">) {
    const id = this.currentIds.jobs++;
    const newJob = {
      ...job,
      id,
      status: "open",
      createdAt: new Date(),
    };
    this.jobs.set(id, newJob);
    return newJob;
  }

  async createApplication(app: Omit<Application, "id" | "createdAt" | "status">) {
    const id = this.currentIds.applications++;
    const newApp = {
      ...app,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.applications.set(id, newApp);
    return newApp;
  }

  async updateApplicationStatus(id: number, status: string) {
    const app = this.applications.get(id);
    if (!app) return undefined;
    
    const updated = { ...app, status };
    this.applications.set(id, updated);
    return updated;
  }

  async getApplications(userId: number, role: string) {
    return Array.from(this.applications.values()).filter(app => {
      if (role === "sales") return app.salesId === userId;
      const job = this.jobs.get(app.jobId);
      return job?.companyId === userId;
    });
  }
}

export const storage = new MemStorage();
