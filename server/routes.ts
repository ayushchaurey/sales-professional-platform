import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertJobSchema, insertApplicationSchema, insertProfileSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import express from "express";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname);
    if (allowedTypes.includes(ext.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    try {
      const location = req.query.location as string;
      const jobs = await storage.getJobs(location);

      // If user is a sales professional, filter out jobs they've already been approved for
      if (req.user.role === "sales") {
        const userApplications = await storage.getApplications(req.user.id, "sales");
        const approvedJobIds = userApplications
          .filter(app => app.status === "approved")
          .map(app => app.jobId);

        const filteredJobs = jobs.filter(job => !approvedJobIds.includes(job.id));
        return res.json(filteredJobs);
      }

      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).send("Failed to fetch jobs");
    }
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.user || req.user.role !== "company") {
      return res.status(403).send("Only companies can post jobs");
    }

    try {
      const parsed = insertJobSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json(parsed.error);
      }

      const job = await storage.createJob({
        ...parsed.data,
        companyId: req.user.id,
        customQuestions: parsed.data.customQuestions || [],
      });
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).send("Failed to create job");
    }
  });

  // Applications
  app.post("/api/applications", upload.single('resume'), async (req, res) => {
    if (!req.user || req.user.role !== "sales") {
      return res.status(403).send("Only sales professionals can apply to jobs");
    }

    try {
      const answers = JSON.parse(req.body.answers || '[]');
      const jobId = parseInt(req.body.jobId);

      const application = await storage.createApplication({
        jobId,
        salesId: req.user.id,
        answers,
      });

      if (req.file) {
        await storage.updateProfile(req.user.id, {
          resumeUrl: `/uploads/${req.file.filename}`,
        });
      }

      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).send("Failed to create application");
    }
  });

  app.patch("/api/applications/:id", async (req, res) => {
    if (!req.user || req.user.role !== "company") {
      return res.status(403).send("Only companies can update application status");
    }

    try {
      const { status } = req.body;
      const id = parseInt(req.params.id);

      const application = await storage.updateApplicationStatus(id, status);
      if (!application) {
        return res.status(404).send("Application not found");
      }

      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).send("Failed to update application");
    }
  });

  app.get("/api/applications", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    try {
      const applications = await storage.getApplications(req.user.id, req.user.role);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).send("Failed to fetch applications");
    }
  });

  // Profiles
  app.get("/api/profiles/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).send("Invalid user ID");
      }

      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(404).send("Profile not found");
      }

      // Get the user's location as well
      const user = await storage.getUser(userId);
      res.json({ ...profile, userLocation: user?.location });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).send("Failed to fetch profile");
    }
  });

  app.post("/api/profiles", upload.single('profilePicture'), async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    try {
      const profileData = req.body;
      if (req.file) {
        profileData.profilePicture = `/uploads/${req.file.filename}`;
      }

      // Parse array fields from JSON strings
      ['experience', 'education', 'skills', 'achievements'].forEach(field => {
        if (profileData[field]) {
          try {
            profileData[field] = JSON.parse(profileData[field]);
          } catch (e) {
            console.error(`Error parsing ${field}:`, e);
          }
        }
      });

      const parsed = insertProfileSchema.partial().safeParse(profileData);
      if (!parsed.success) {
        return res.status(400).json(parsed.error);
      }

      const profile = await storage.createProfile(req.user.id, parsed.data);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).send("Failed to create profile");
    }
  });

  app.patch("/api/profiles", upload.single('profilePicture'), async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    try {
      const profileData = req.body;
      if (req.file) {
        profileData.profilePicture = `/uploads/${req.file.filename}`;
      }

      // Parse array fields from JSON strings
      ['experience', 'education', 'skills', 'achievements'].forEach(field => {
        if (profileData[field]) {
          try {
            profileData[field] = JSON.parse(profileData[field]);
          } catch (e) {
            console.error(`Error parsing ${field}:`, e);
          }
        }
      });

      const parsed = insertProfileSchema.partial().safeParse(profileData);
      if (!parsed.success) {
        return res.status(400).json(parsed.error);
      }

      const profile = await storage.updateProfile(req.user.id, parsed.data);
      if (!profile) {
        return res.status(404).send("Profile not found");
      }

      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).send("Failed to update profile");
    }
  });

  // Get sales profiles for companies
  app.get("/api/profiles/sales", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    if (req.user.role !== "company") {
      return res.status(403).send("Only companies can view sales profiles");
    }

    try {
      const salesProfiles = await storage.getSalesProfiles();
      res.json(salesProfiles);
    } catch (error) {
      console.error("Error fetching sales profiles:", error);
      res.status(500).send("Failed to fetch sales profiles");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}