import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertJobSchema, insertApplicationSchema, insertProfileSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    const location = req.query.location as string;
    const jobs = await storage.getJobs(location);
    res.json(jobs);
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.user || req.user.role !== "company") {
      return res.status(403).send("Only companies can post jobs");
    }

    const parsed = insertJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const job = await storage.createJob({
      ...parsed.data,
      companyId: req.user.id,
    });
    res.status(201).json(job);
  });

  // Applications
  app.post("/api/applications", async (req, res) => {
    if (!req.user || req.user.role !== "sales") {
      return res.status(403).send("Only sales professionals can apply to jobs");
    }

    const parsed = insertApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const application = await storage.createApplication({
      ...parsed.data,
      salesId: req.user.id,
    });
    res.status(201).json(application);
  });

  app.patch("/api/applications/:id", async (req, res) => {
    const { status } = req.body;
    const id = parseInt(req.params.id);

    if (!req.user || req.user.role !== "company") {
      return res.status(403).send("Only companies can update application status");
    }

    const application = await storage.updateApplicationStatus(id, status);
    if (!application) {
      return res.status(404).send("Application not found");
    }

    res.json(application);
  });

  app.get("/api/applications", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const applications = await storage.getApplications(req.user.id, req.user.role);
    res.json(applications);
  });

  // Profiles
  app.get("/api/profiles/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const profile = await storage.getProfile(userId);
    if (!profile) {
      return res.status(404).send("Profile not found");
    }
    res.json(profile);
  });

  app.post("/api/profiles", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    if (req.user.role !== "sales") {
      return res.status(403).send("Only sales professionals can create profiles");
    }

    const parsed = insertProfileSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const profile = await storage.createProfile(req.user.id, parsed.data);
    res.status(201).json(profile);
  });

  app.patch("/api/profiles", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    if (req.user.role !== "sales") {
      return res.status(403).send("Only sales professionals can update profiles");
    }

    const parsed = insertProfileSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const profile = await storage.updateProfile(req.user.id, parsed.data);
    if (!profile) {
      return res.status(404).send("Profile not found");
    }

    res.json(profile);
  });

  const httpServer = createServer(app);
  return httpServer;
}