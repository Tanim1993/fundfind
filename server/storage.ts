import { 
  type User, 
  type InsertUser,
  type FundingOpportunity,
  type InsertFundingOpportunity,
  type Subscription,
  type InsertSubscription,
  type ScrapingSource,
  type InsertScrapingSource,
  type ScrapingActivity,
  type InsertScrapingActivity
} from "@shared/schema";
import type { ScholarshipJourney, InsertScholarshipJourney, JourneyProgressUpdate } from "../shared/journey-schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Funding opportunity methods
  getFundingOpportunities(filters?: {
    subject?: string;
    degreeLevel?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<FundingOpportunity[]>;
  getFundingOpportunityById(id: string): Promise<FundingOpportunity | undefined>;
  createFundingOpportunity(opportunity: InsertFundingOpportunity): Promise<FundingOpportunity>;
  updateFundingOpportunity(id: string, opportunity: Partial<FundingOpportunity>): Promise<FundingOpportunity | undefined>;
  deleteFundingOpportunity(id: string): Promise<boolean>;

  // Subscription methods
  getSubscriptions(): Promise<Subscription[]>;
  getSubscriptionByEmail(email: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<Subscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: string): Promise<boolean>;

  // Scraping source methods
  getScrapingSources(): Promise<ScrapingSource[]>;
  getScrapingSourceById(id: string): Promise<ScrapingSource | undefined>;
  createScrapingSource(source: InsertScrapingSource): Promise<ScrapingSource>;
  updateScrapingSource(id: string, source: Partial<ScrapingSource>): Promise<ScrapingSource | undefined>;
  deleteScrapingSource(id: string): Promise<boolean>;

  // Scraping activity methods
  getScrapingActivity(limit?: number): Promise<ScrapingActivity[]>;
  createScrapingActivity(activity: InsertScrapingActivity): Promise<ScrapingActivity>;
  logScrapingActivity(activity: {
    sourceId: string;
    status: 'success' | 'error';
    opportunitiesFound: number;
    duplicatesFiltered: number;
    errorMessage?: string | null;
    timestamp: Date;
  }): Promise<void>;
  addFundingOpportunity(opportunity: any): Promise<void>;

  // Statistics
  getStatistics(): Promise<{
    totalOpportunities: number;
    newToday: number;
    activeSources: number;
    totalSubscribers: number;
  }>;

  // Subject counts
  getSubjectCounts(): Promise<Array<{ subject: string; count: number }>>;

  // Journey methods
  getScholarshipJourneys(userId?: string): Promise<ScholarshipJourney[]>;
  getScholarshipJourneyById(id: string): Promise<ScholarshipJourney | undefined>;
  createScholarshipJourney(journey: InsertScholarshipJourney): Promise<ScholarshipJourney>;
  updateJourneyProgress(update: JourneyProgressUpdate): Promise<ScholarshipJourney | undefined>;
  deleteScholarshipJourney(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private fundingOpportunities: Map<string, FundingOpportunity>;
  private subscriptions: Map<string, Subscription>;
  private scrapingSources: Map<string, ScrapingSource>;
  private scrapingActivities: Map<string, ScrapingActivity>;
  private scholarshipJourneys: Map<string, ScholarshipJourney>;

  constructor() {
    this.users = new Map();
    this.fundingOpportunities = new Map();
    this.subscriptions = new Map();
    this.scrapingSources = new Map();
    this.scrapingActivities = new Map();
    this.scholarshipJourneys = new Map();
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create mock funding opportunities with current deadlines
    const mockOpportunities = [
      {
        title: "NSF Graduate Research Fellowship Program (GRFP) 2026",
        description: "The NSF GRFP provides $37,000 annual stipend plus $16,000 cost of education allowance for three years of financial support for outstanding graduate students pursuing research-based master's and doctoral degrees in STEM fields.",
        institution: "National Science Foundation",
        deadline: "October 21, 2025",
        amount: "$37,000/year + $16,000 allowance",
        degreeLevel: "PhD",
        subject: "Computer Science",
        fundingType: "Fully Funded",
        sourceUrl: "https://www.nsfgrfp.org",
        sourceName: "NSF.gov",
        isActive: true,
      },
      {
        title: "Fulbright U.S. Student Program 2026-2027",
        description: "Full funding for U.S. citizens to study or conduct research abroad. Covers tuition, living stipend, travel, and health insurance for Master's or doctoral degrees at international universities.",
        institution: "U.S. Department of State",
        deadline: "October 7, 2025",
        amount: "Full funding: tuition + living stipend + travel",
        degreeLevel: "Both",
        subject: "Humanities",
        fundingType: "Fully Funded",
        sourceUrl: "https://us.fulbrightonline.org",
        sourceName: "fulbrightonline.org",
        isActive: true,
      },
      {
        title: "Knight-Hennessy Scholars at Stanford 2026",
        description: "Prestigious fully-funded graduate scholarship program at Stanford University for students pursuing any graduate degree across all seven schools. Covers tuition, living expenses, travel, and academic costs.",
        institution: "Stanford University",
        deadline: "October 9, 2025",
        amount: "Full funding: tuition + stipend + travel + academic costs",
        degreeLevel: "Both",
        subject: "Engineering",
        fundingType: "Fully Funded",
        sourceUrl: "https://knight-hennessy.stanford.edu",
        sourceName: "stanford.edu",
        isActive: true,
      },
      {
        title: "Google Anita Borg Memorial Scholarship 2025",
        description: "Financial support for women in computer science and engineering programs. Open to current undergraduate and graduate students who are studying computer science, computer engineering, or closely related technical field.",
        institution: "Google Inc.",
        deadline: "November 27, 2025",
        amount: "$10,000 (US/Canada) or €7,000 (Europe)",
        degreeLevel: "Both",
        subject: "Computer Science",
        fundingType: "Partial",
        sourceUrl: "https://buildyourfuture.withgoogle.com/scholarships",
        sourceName: "google.com",
        isActive: true,
      },
      {
        title: "AAUW International Fellowship 2026",
        description: "International fellowships for women who are not U.S. citizens or permanent residents to pursue graduate or postgraduate studies in the United States. Fellowship covers living expenses and educational fees.",
        institution: "American Association of University Women",
        deadline: "November 15, 2025",
        amount: "$20,000 - $30,000",
        degreeLevel: "Both",
        subject: "Social Sciences",
        fundingType: "Partial",
        sourceUrl: "https://www.aauw.org/resources/programs/fellowships-grants/current-opportunities",
        sourceName: "aauw.org",
        isActive: true,
      },
      {
        title: "Ford Foundation Fellowship Program 2026",
        description: "Three-year fellowship for individuals from backgrounds underrepresented in the academy to engage in research-based doctoral or postdoctoral study in research-based programs at U.S. institutions.",
        institution: "Ford Foundation",
        deadline: "December 10, 2025",
        amount: "$27,000 annual stipend + tuition support",
        degreeLevel: "PhD",
        subject: "Health & Medicine",
        fundingType: "Fully Funded",
        sourceUrl: "https://sites.nationalacademies.org/pga/fordfellowships",
        sourceName: "nationalacademies.org",
        isActive: true,
      },
      {
        title: "IBM PhD Fellowship Program 2026",
        description: "Highly competitive program that honors exceptional PhD students in research areas of interest to IBM. Recipients receive financial support, access to IBM's research community, and potential internship opportunities.",
        institution: "IBM Research",
        deadline: "October 31, 2025",
        amount: "$35,000 + tuition + $12,000 travel allowance",
        degreeLevel: "PhD",
        subject: "Computer Science",
        fundingType: "Fully Funded",
        sourceUrl: "https://research.ibm.com/university/awards/fellowships.html",
        sourceName: "research.ibm.com",
        isActive: true,
      },
      {
        title: "Microsoft Research PhD Fellowship 2026",
        description: "Two-year fellowship program for outstanding PhD students in their third or fourth year of doctoral studies in computer science, electrical engineering, mathematics, or related technical disciplines.",
        institution: "Microsoft Research",
        deadline: "September 30, 2025",
        amount: "Full tuition + $42,000 annual stipend",
        degreeLevel: "PhD",
        subject: "Computer Science",
        fundingType: "Fully Funded",
        sourceUrl: "https://www.microsoft.com/en-us/research/academic-program/phd-fellowship",
        sourceName: "microsoft.com",
        isActive: true,
      },
      {
        title: "CMU Robotics Institute PhD Opportunities 2026",
        description: "Exciting news! Our Robotics Institute is offering fully-funded PhD positions starting Fall 2026. Research areas include AI, computer vision, machine learning, and autonomous systems. Apply by December 1st for priority consideration.",
        institution: "Carnegie Mellon University",
        deadline: "December 1, 2025",
        amount: "Full tuition + $35,000 stipend + benefits",
        degreeLevel: "PhD",
        subject: "Engineering",
        fundingType: "Fully Funded",
        sourceUrl: "https://www.ri.cmu.edu/education/academic-programs/",
        sourceName: "LinkedIn",
        originalPost: "🤖 Exciting news from CMU Robotics! We're accepting PhD applications for Fall 2026. Fully funded positions available in AI, computer vision, ML & autonomous systems. Join our world-class research team! Apply by Dec 1st. #PhDOpportunity #Robotics #CMU",
        professorName: "Dr. Sarah Martinez",
        professorProfile: "",
        postDate: new Date("2025-08-15"),
        socialPlatform: "linkedin",
        isActive: true,
      },
      {
        title: "Stanford NLP Lab Research Assistantship",
        description: "Our Natural Language Processing lab has openings for talented PhD students interested in large language models, conversational AI, and multilingual NLP. Competitive funding package includes full tuition coverage.",
        institution: "Stanford University",
        deadline: "November 30, 2025",
        amount: "Full tuition + $38,000 stipend",
        degreeLevel: "PhD",
        subject: "Computer Science",
        fundingType: "Fully Funded",
        sourceUrl: "https://nlp.stanford.edu/",
        sourceName: "Twitter/X",
        originalPost: "🚀 Stanford NLP Lab is hiring! PhD positions open for Fall 2026 in LLMs, conversational AI & multilingual NLP. Full funding available! DM for details or apply through our website. #NLP #Stanford #PhDPositions #MachineLearning",
        professorName: "Prof. David Chen",
        professorProfile: "",
        postDate: new Date("2025-08-12"),
        socialPlatform: "twitter",
        isActive: true,
      },
      {
        title: "MIT CSAIL AI Safety Fellowship",
        description: "Looking for passionate researchers to join our AI Safety initiative! We're offering 3 fully-funded PhD positions focused on AI alignment, robustness, and ethical AI. Interdisciplinary collaboration encouraged.",
        institution: "MIT CSAIL",
        deadline: "October 15, 2025",
        amount: "$36,000 stipend + full tuition + health insurance",
        degreeLevel: "PhD",
        subject: "Computer Science",
        fundingType: "Fully Funded",
        sourceUrl: "https://www.csail.mit.edu/research/artificial-intelligence",
        sourceName: "Facebook",
        originalPost: "🧠 MIT CSAIL AI Safety Lab is expanding! Seeking 3 exceptional PhD students for Fall 2026. Research focus: AI alignment, robustness & ethics. Full funding + mentorship from world-class faculty. Apply by Oct 15! #AISafety #MIT #PhD",
        professorName: "Dr. Lisa Wang",
        professorProfile: "",
        postDate: new Date("2025-08-10"),
        socialPlatform: "facebook",
        isActive: true,
      }
    ];

    mockOpportunities.forEach(opp => {
      const id = randomUUID();
      this.fundingOpportunities.set(id, {
        ...opp,
        id,
        scrapedAt: new Date(),
      });
    });

    // Create mock scraping sources - representing various data collection points including free APIs
    const mockSources = [
      { name: "Grants.gov API", url: "https://api.grants.gov/v1/api/search2", sourceType: "api", platform: "government_api", status: "active", isActive: true, apiCredentials: null },
      { name: "NIH RePORTER API", url: "https://api.reporter.nih.gov/v2/projects/search", sourceType: "api", platform: "government_api", status: "active", isActive: true, apiCredentials: null },
      { name: "SAM.gov API", url: "https://api.sam.gov/prod/opportunities/v2/search", sourceType: "api", platform: "government_api", status: "active", isActive: true, apiCredentials: null },
      { name: "NSF.gov", url: "https://nsf.gov/funding", sourceType: "website", platform: "academic_site", status: "active", isActive: true, apiCredentials: null },
      { name: "Fulbright Portal", url: "https://us.fulbrightonline.org", sourceType: "website", platform: "academic_site", status: "active", isActive: true, apiCredentials: null },
      { name: "LinkedIn - Professor Posts", url: "https://linkedin.com/feed/hashtag/phdscholarships", sourceType: "linkedin", platform: "social_media", status: "active", isActive: true, apiCredentials: "encrypted_linkedin_api_key" },
      { name: "Facebook - University Groups", url: "https://facebook.com/groups/gradscholarships", sourceType: "facebook", platform: "social_media", status: "active", isActive: true, apiCredentials: "encrypted_facebook_api_key" },
      { name: "Twitter/X Academic Posts", url: "https://twitter.com/search?q=%23PhDFunding", sourceType: "twitter", platform: "social_media", status: "active", isActive: true, apiCredentials: "encrypted_twitter_api_key" },
      { name: "Saheed Kolawole - Funding Expert", url: "https://www.linkedin.com/in/saheedkolawole/", sourceType: "linkedin", platform: "social_media", status: "active", isActive: true, apiCredentials: "encrypted_linkedin_api_key" },
    ];

    mockSources.forEach(source => {
      const id = randomUUID();
      this.scrapingSources.set(id, {
        ...source,
        id,
        lastScraped: new Date(),
        createdAt: new Date(),
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Funding opportunity methods
  async getFundingOpportunities(filters?: {
    subject?: string;
    degreeLevel?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<FundingOpportunity[]> {
    let opportunities = Array.from(this.fundingOpportunities.values())
      .filter(opp => opp.isActive);

    if (filters?.subject && filters.subject !== '' && filters.subject !== 'All Subjects') {
      opportunities = opportunities.filter(opp => opp.subject === filters.subject);
    }

    if (filters?.degreeLevel && filters.degreeLevel !== '' && filters.degreeLevel !== 'All Degrees') {
      opportunities = opportunities.filter(opp => 
        opp.degreeLevel === filters.degreeLevel || opp.degreeLevel === 'Both'
      );
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      opportunities = opportunities.filter(opp => 
        opp.title.toLowerCase().includes(searchTerm) ||
        opp.description.toLowerCase().includes(searchTerm) ||
        opp.institution.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by scraped date (newest first)
    opportunities.sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime());

    const offset = filters?.offset || 0;
    const limit = filters?.limit || opportunities.length;
    
    return opportunities.slice(offset, offset + limit);
  }

  async getFundingOpportunityById(id: string): Promise<FundingOpportunity | undefined> {
    return this.fundingOpportunities.get(id);
  }

  async createFundingOpportunity(opportunity: InsertFundingOpportunity): Promise<FundingOpportunity> {
    const id = randomUUID();
    const newOpportunity: FundingOpportunity = {
      ...opportunity,
      id,
      scrapedAt: new Date(),
      isActive: opportunity.isActive ?? true,
    };
    this.fundingOpportunities.set(id, newOpportunity);
    return newOpportunity;
  }

  async updateFundingOpportunity(id: string, opportunity: Partial<FundingOpportunity>): Promise<FundingOpportunity | undefined> {
    const existing = this.fundingOpportunities.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...opportunity };
    this.fundingOpportunities.set(id, updated);
    return updated;
  }

  async deleteFundingOpportunity(id: string): Promise<boolean> {
    return this.fundingOpportunities.delete(id);
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getSubscriptionByEmail(email: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(sub => sub.email === email);
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const newSubscription: Subscription = {
      ...subscription,
      id,
      createdAt: new Date(),
      isActive: subscription.isActive ?? true,
      keywords: subscription.keywords ?? null,
    };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: string, subscription: Partial<Subscription>): Promise<Subscription | undefined> {
    const existing = this.subscriptions.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...subscription };
    this.subscriptions.set(id, updated);
    return updated;
  }

  async deleteSubscription(id: string): Promise<boolean> {
    return this.subscriptions.delete(id);
  }

  // Scraping source methods
  async getScrapingSources(): Promise<ScrapingSource[]> {
    return Array.from(this.scrapingSources.values());
  }

  async getScrapingSourceById(id: string): Promise<ScrapingSource | undefined> {
    return this.scrapingSources.get(id);
  }

  async createScrapingSource(source: InsertScrapingSource): Promise<ScrapingSource> {
    const id = randomUUID();
    const newSource: ScrapingSource = {
      ...source,
      id,
      createdAt: new Date(),
      isActive: source.isActive ?? true,
      lastScraped: null,
      sourceType: (source as any).sourceType || "website",
      platform: (source as any).platform || "academic_site",
      apiCredentials: (source as any).apiCredentials || null,
    };
    this.scrapingSources.set(id, newSource);
    return newSource;
  }

  async updateScrapingSource(id: string, source: Partial<ScrapingSource>): Promise<ScrapingSource | undefined> {
    const existing = this.scrapingSources.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...source };
    this.scrapingSources.set(id, updated);
    return updated;
  }

  async deleteScrapingSource(id: string): Promise<boolean> {
    return this.scrapingSources.delete(id);
  }

  // Scraping activity methods
  async getScrapingActivity(limit = 10): Promise<ScrapingActivity[]> {
    return Array.from(this.scrapingActivities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createScrapingActivity(activity: InsertScrapingActivity): Promise<ScrapingActivity> {
    const id = randomUUID();
    const newActivity: ScrapingActivity = {
      ...activity,
      id,
      timestamp: new Date(),
      opportunitiesFound: activity.opportunitiesFound ?? null,
      duplicatesFiltered: activity.duplicatesFiltered ?? null,
      errorMessage: activity.errorMessage ?? null,
    };
    this.scrapingActivities.set(id, newActivity);
    return newActivity;
  }

  async logScrapingActivity(activity: {
    sourceId: string;
    status: 'success' | 'error';
    opportunitiesFound: number;
    duplicatesFiltered: number;
    errorMessage?: string | null;
    timestamp: Date;
  }): Promise<void> {
    const id = randomUUID();
    const newActivity: ScrapingActivity = {
      id,
      sourceId: activity.sourceId,
      status: activity.status,
      opportunitiesFound: activity.opportunitiesFound,
      duplicatesFiltered: activity.duplicatesFiltered,
      errorMessage: activity.errorMessage || null,
      timestamp: activity.timestamp,
    };
    this.scrapingActivities.set(id, newActivity);
  }

  async addFundingOpportunity(opportunity: any): Promise<void> {
    const id = randomUUID();
    const newOpportunity: FundingOpportunity = {
      ...opportunity,
      id,
      scrapedAt: new Date(),
    };
    this.fundingOpportunities.set(id, newOpportunity);
  }

  // Statistics
  async getStatistics(): Promise<{
    totalOpportunities: number;
    newToday: number;
    activeSources: number;
    totalSubscribers: number;
  }> {
    const totalOpportunities = Array.from(this.fundingOpportunities.values())
      .filter(opp => opp.isActive).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newToday = Array.from(this.fundingOpportunities.values())
      .filter(opp => opp.isActive && new Date(opp.scrapedAt) >= today).length;

    const activeSources = Array.from(this.scrapingSources.values())
      .filter(source => source.isActive && source.status === 'active').length;

    const totalSubscribers = Array.from(this.subscriptions.values())
      .filter(sub => sub.isActive).length;

    return {
      totalOpportunities,
      newToday,
      activeSources,
      totalSubscribers,
    };
  }

  // Subject counts
  async getSubjectCounts(): Promise<Array<{ subject: string; count: number }>> {
    const subjects = Array.from(this.fundingOpportunities.values())
      .filter(opp => opp.isActive)
      .reduce((acc, opp) => {
        acc[opp.subject] = (acc[opp.subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(subjects).map(([subject, count]) => ({ subject, count }));
  }

  // Journey methods
  async getScholarshipJourneys(userId?: string): Promise<ScholarshipJourney[]> {
    let journeys = Array.from(this.scholarshipJourneys.values())
      .filter(journey => journey.isActive);
    
    if (userId) {
      journeys = journeys.filter(journey => journey.userId === userId);
    }
    
    return journeys.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getScholarshipJourneyById(id: string): Promise<ScholarshipJourney | undefined> {
    return this.scholarshipJourneys.get(id);
  }

  async createScholarshipJourney(journey: InsertScholarshipJourney): Promise<ScholarshipJourney> {
    const id = randomUUID();
    const now = new Date();
    const newJourney: ScholarshipJourney = {
      ...journey,
      id,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };
    this.scholarshipJourneys.set(id, newJourney);
    return newJourney;
  }

  async updateJourneyProgress(update: JourneyProgressUpdate): Promise<ScholarshipJourney | undefined> {
    const journey = this.scholarshipJourneys.get(update.journeyId);
    if (!journey) return undefined;

    const stepIndex = journey.steps.findIndex(step => step.id === update.stepId);
    if (stepIndex === -1) return undefined;

    journey.steps[stepIndex].status = update.status;
    if (update.completedAt) {
      journey.steps[stepIndex].completedAt = update.completedAt;
    }

    // Update completed steps count
    journey.completedSteps = journey.steps.filter(step => step.status === 'completed').length;
    journey.updatedAt = new Date();

    this.scholarshipJourneys.set(update.journeyId, journey);
    return journey;
  }

  async deleteScholarshipJourney(id: string): Promise<boolean> {
    const journey = this.scholarshipJourneys.get(id);
    if (!journey) return false;

    journey.isActive = false;
    journey.updatedAt = new Date();
    this.scholarshipJourneys.set(id, journey);
    return true;
  }
}

export const storage = new MemStorage();
