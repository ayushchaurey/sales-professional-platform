import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["company", "sales"] }).notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  headline: text("headline"),
  summary: text("summary"),
  experience: text("experience").array(),
  education: text("education").array(),
  skills: text("skills").array(),
  achievements: text("achievements").array(),
  website: text("website"),
  industry: text("industry"),
  companySize: text("company_size"),
  foundedYear: text("founded_year"),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  companyId: integer("company_id").notNull(),
  status: text("status", { enum: ["open", "closed"] }).default("open"),
  customQuestions: text("custom_questions").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  salesId: integer("sales_id").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  answers: text("answers").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  location: true,
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  headline: true,
  summary: true,
  experience: true,
  education: true,
  skills: true,
  achievements: true,
  resumeUrl: true,
  website: true,
  industry: true,
  companySize: true,
  foundedYear: true,
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  description: true,
  location: true,
  customQuestions: true,
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  jobId: true,
  answers: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;