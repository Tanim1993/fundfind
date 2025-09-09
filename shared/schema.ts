import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const fundingOpportunities = pgTable("funding_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  institution: text("institution").notNull(),
  deadline: text("deadline").notNull(),
  amount: text("amount").notNull(),
  degreeLevel: text("degree_level").notNull(), // 'PhD', 'Master's', 'Both'
  subject: text("subject").notNull(),
  fundingType: text("funding_type").notNull(), // 'Fully Funded', 'Partial', 'Tuition Only'
  sourceUrl: text("source_url").notNull(),
  sourceName: text("source_name").notNull(),
  originalPost: text("original_post"), // Original social media post content
  professorName: text("professor_name"), // Name of professor who posted
  professorProfile: text("professor_profile"), // Link to professor's profile
  postDate: timestamp("post_date"), // When the post was made
  socialPlatform: text("social_platform"), // 'linkedin', 'facebook', 'twitter', 'blog'
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  subjects: text("subjects").array().notNull(), // Array of subject preferences
  degreeLevel: text("degree_level").notNull(), // 'PhD', 'Master's', 'Both'
  keywords: text("keywords"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scrapingSources = pgTable("scraping_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  sourceType: text("source_type").notNull(), // 'linkedin', 'facebook', 'twitter', 'website', 'rss'
  platform: text("platform").notNull(), // 'social_media', 'academic_site', 'professor_blog'
  status: text("status").notNull(), // 'active', 'inactive', 'error'
  lastScraped: timestamp("last_scraped"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  apiCredentials: text("api_credentials"), // Encrypted API keys/tokens
});

export const scrapingActivity = pgTable("scraping_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").notNull().references(() => scrapingSources.id),
  status: text("status").notNull(), // 'success', 'error'
  opportunitiesFound: integer("opportunities_found").default(0),
  duplicatesFiltered: integer("duplicates_filtered").default(0),
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFundingOpportunitySchema = createInsertSchema(fundingOpportunities).omit({
  id: true,
  scrapedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertScrapingSourceSchema = createInsertSchema(scrapingSources).omit({
  id: true,
  createdAt: true,
  lastScraped: true,
});

export const insertScrapingActivitySchema = createInsertSchema(scrapingActivity).omit({
  id: true,
  timestamp: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFundingOpportunity = z.infer<typeof insertFundingOpportunitySchema>;
export type FundingOpportunity = typeof fundingOpportunities.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertScrapingSource = z.infer<typeof insertScrapingSourceSchema>;
export type ScrapingSource = typeof scrapingSources.$inferSelect;

export type InsertScrapingActivity = z.infer<typeof insertScrapingActivitySchema>;
export type ScrapingActivity = typeof scrapingActivity.$inferSelect;
