import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriptionSchema, insertFundingOpportunitySchema, insertScrapingSourceSchema } from "@shared/schema";
import { journeyProgressUpdateSchema, journeyReminderSchema } from "../shared/journey-schema";
import nodemailer from "nodemailer";
import { ScheduledScraper } from "./scrapers/scheduled-scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize scheduled scraper
  const scheduledScraper = new ScheduledScraper(storage);
  scheduledScraper.startScheduledScraping();

  // Email transporter setup
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || "default@example.com",
      pass: process.env.EMAIL_PASS || "defaultpass",
    },
  });

  // Get all funding opportunities with filters
  app.get("/api/funding-opportunities", async (req, res) => {
    try {
      const { subject, degreeLevel, search, limit, offset } = req.query;
      const opportunities = await storage.getFundingOpportunities({
        subject: subject as string,
        degreeLevel: degreeLevel as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch funding opportunities" });
    }
  });

  // Get single funding opportunity
  app.get("/api/funding-opportunities/:id", async (req, res) => {
    try {
      const opportunity = await storage.getFundingOpportunityById(req.params.id);
      if (!opportunity) {
        return res.status(404).json({ message: "Funding opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch funding opportunity" });
    }
  });

  // Create new funding opportunity (admin)
  app.post("/api/funding-opportunities", async (req, res) => {
    try {
      const validatedData = insertFundingOpportunitySchema.parse(req.body);
      const opportunity = await storage.createFundingOpportunity(validatedData);
      
      // Send notifications to matching subscribers
      await sendNotificationsForOpportunity(opportunity);
      
      res.status(201).json(opportunity);
    } catch (error) {
      res.status(400).json({ message: "Invalid funding opportunity data" });
    }
  });

  // Get statistics
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get subject counts
  app.get("/api/subject-counts", async (req, res) => {
    try {
      const counts = await storage.getSubjectCounts();
      res.json(counts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject counts" });
    }
  });

  // Create subscription
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getSubscriptionByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ message: "Email already subscribed" });
      }

      const subscription = await storage.createSubscription(validatedData);
      
      // Send welcome email
      await sendWelcomeEmail(subscription);
      
      res.status(201).json(subscription);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription data" });
    }
  });

  // Get all subscriptions (admin)
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // Delete subscription
  app.delete("/api/subscriptions/:id", async (req, res) => {
    try {
      const success = await storage.deleteSubscription(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json({ message: "Subscription deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // Get scraping sources
  app.get("/api/scraping-sources", async (req, res) => {
    try {
      const sources = await storage.getScrapingSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scraping sources" });
    }
  });

  // Create scraping source
  app.post("/api/scraping-sources", async (req, res) => {
    try {
      const validatedData = insertScrapingSourceSchema.parse(req.body);
      const source = await storage.createScrapingSource(validatedData);
      res.status(201).json(source);
    } catch (error) {
      res.status(400).json({ message: "Invalid scraping source data" });
    }
  });

  // Update scraping source
  app.patch("/api/scraping-sources/:id", async (req, res) => {
    try {
      const source = await storage.updateScrapingSource(req.params.id, req.body);
      if (!source) {
        return res.status(404).json({ message: "Scraping source not found" });
      }
      res.json(source);
    } catch (error) {
      res.status(500).json({ message: "Failed to update scraping source" });
    }
  });

  // Delete scraping source
  app.delete("/api/scraping-sources/:id", async (req, res) => {
    try {
      const success = await storage.deleteScrapingSource(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Scraping source not found" });
      }
      res.json({ message: "Scraping source deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete scraping source" });
    }
  });

  // Get scraping activity
  app.get("/api/scraping-activity", async (req, res) => {
    try {
      const { limit } = req.query;
      const activity = await storage.getScrapingActivity(limit ? parseInt(limit as string) : undefined);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scraping activity" });
    }
  });

  // Run scraper (admin action)
  app.post("/api/run-scraper", async (req, res) => {
    try {
      // Check if scraping is already in progress
      if (scheduledScraper.isScrapingInProgress()) {
        return res.status(429).json({ message: "Scraping is already in progress" });
      }

      // Run the real scraping process
      const result = await scheduledScraper.runManualScraping();
      
      res.json({ 
        message: "Scraper executed successfully", 
        sourceCount: result.totalSources,
        opportunitiesFound: result.totalOpportunities,
        duplicatesFiltered: result.totalDuplicates,
        successfulSources: result.successfulSources,
        errors: result.errors
      });
    } catch (error) {
      console.error('Manual scraping failed:', error);
      res.status(500).json({ message: "Failed to run scraper", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Helper function to send notifications for new opportunities
  async function sendNotificationsForOpportunity(opportunity: any) {
    try {
      const subscriptions = await storage.getSubscriptions();
      const matchingSubscriptions = subscriptions.filter(sub => {
        if (!sub.isActive) return false;
        
        // Check subject match
        if (!sub.subjects.includes(opportunity.subject)) return false;
        
        // Check degree level match
        if (sub.degreeLevel !== 'Both' && 
            sub.degreeLevel !== opportunity.degreeLevel && 
            opportunity.degreeLevel !== 'Both') return false;
        
        // Check keywords match
        if (sub.keywords) {
          const keywords = sub.keywords.toLowerCase().split(',').map(k => k.trim());
          const opportunityText = `${opportunity.title} ${opportunity.description}`.toLowerCase();
          if (!keywords.some(keyword => opportunityText.includes(keyword))) return false;
        }
        
        return true;
      });

      // Send emails to matching subscribers
      for (const subscription of matchingSubscriptions) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || "noreply@fundingfundai.com",
          to: subscription.email,
          subject: `New Funding Opportunity: ${opportunity.title}`,
          html: `
            <h2>New Funding Opportunity Alert</h2>
            <p>Dear ${subscription.firstName},</p>
            <p>A new funding opportunity has been posted that matches your interests:</p>
            
            <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3>${opportunity.title}</h3>
              <p><strong>Institution:</strong> ${opportunity.institution}</p>
              <p><strong>Deadline:</strong> ${opportunity.deadline}</p>
              <p><strong>Amount:</strong> ${opportunity.amount}</p>
              <p><strong>Degree Level:</strong> ${opportunity.degreeLevel}</p>
              <p><strong>Subject:</strong> ${opportunity.subject}</p>
              <p><strong>Description:</strong> ${opportunity.description}</p>
              <p><a href="${opportunity.sourceUrl}" style="color: #2563EB;">View Details</a></p>
            </div>
            
            <p>Best regards,<br>The FundingFundAI Team</p>
            <p><small>To unsubscribe, please contact us at support@fundingfundai.com</small></p>
          `,
        };

        await transporter.sendMail(mailOptions);
      }
    } catch (error) {
      console.error("Failed to send notifications:", error);
    }
  }

  // Helper function to send welcome email
  async function sendWelcomeEmail(subscription: any) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || "noreply@fundingfundai.com",
        to: subscription.email,
        subject: "Welcome to FundingFundAI - Your Subscription is Active",
        html: `
          <h2>Welcome to FundingFundAI!</h2>
          <p>Dear ${subscription.firstName},</p>
          <p>Thank you for subscribing to FundingFundAI. You will now receive email notifications for new funding opportunities that match your preferences:</p>
          
          <ul>
            <li><strong>Subjects:</strong> ${subscription.subjects.join(', ')}</li>
            <li><strong>Degree Level:</strong> ${subscription.degreeLevel}</li>
            ${subscription.keywords ? `<li><strong>Keywords:</strong> ${subscription.keywords}</li>` : ''}
          </ul>
          
          <p>We'll notify you as soon as new opportunities are discovered that match your criteria.</p>
          
          <p>Best regards,<br>The FundingFundAI Team</p>
          <p><small>To manage your subscription, please contact us at support@fundingfundai.com</small></p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  }

  // ====== SCHOLARSHIP JOURNEY API ROUTES ======

  // Get all scholarship journeys
  app.get("/api/scholarship-journeys", async (req, res) => {
    try {
      const { userId } = req.query;
      const journeys = await storage.getScholarshipJourneys(userId as string);
      res.json(journeys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scholarship journeys" });
    }
  });

  // Get specific scholarship journey
  app.get("/api/scholarship-journeys/:id", async (req, res) => {
    try {
      const journey = await storage.getScholarshipJourneyById(req.params.id);
      if (!journey) {
        return res.status(404).json({ message: "Scholarship journey not found" });
      }
      res.json(journey);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scholarship journey" });
    }
  });

  // Create new scholarship journey
  app.post("/api/scholarship-journeys", async (req, res) => {
    try {
      const journey = await storage.createScholarshipJourney(req.body);
      res.status(201).json(journey);
    } catch (error) {
      res.status(500).json({ message: "Failed to create scholarship journey" });
    }
  });

  // Update journey step progress
  app.patch("/api/scholarship-journeys/progress", async (req, res) => {
    try {
      const updateData = journeyProgressUpdateSchema.parse(req.body);
      const journey = await storage.updateJourneyProgress(updateData);
      if (!journey) {
        return res.status(404).json({ message: "Journey or step not found" });
      }
      res.json(journey);
    } catch (error) {
      res.status(500).json({ message: "Failed to update journey progress" });
    }
  });

  // Delete scholarship journey
  app.delete("/api/scholarship-journeys/:id", async (req, res) => {
    try {
      const success = await storage.deleteScholarshipJourney(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Scholarship journey not found" });
      }
      res.json({ message: "Scholarship journey deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete scholarship journey" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
