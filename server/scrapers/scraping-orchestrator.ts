import { LinkedInScraper } from './linkedin-scraper';
import { FacebookScraper } from './facebook-scraper';
import { AcademicWebsiteScraper } from './academic-scraper';
import { BaseScraper, ScrapingResult } from './base-scraper';
import { IStorage } from '../storage';
import type { ScrapingSource, FundingOpportunity } from '@shared/schema';

export interface ScrapingReport {
  sourceId: string;
  sourceName: string;
  status: 'success' | 'error';
  opportunitiesFound: number;
  duplicatesFiltered: number;
  errorMessage?: string;
  timestamp: Date;
}

export class ScrapingOrchestrator {
  constructor(private storage: IStorage) {}

  async runAllScrapers(): Promise<ScrapingReport[]> {
    const sources = await this.storage.getScrapingSources();
    const activeSources = sources.filter(source => source.isActive);
    
    const reports: ScrapingReport[] = [];
    
    // Run scrapers in parallel with controlled concurrency
    const batchSize = 3; // Process 3 sources at a time to avoid overwhelming
    for (let i = 0; i < activeSources.length; i += batchSize) {
      const batch = activeSources.slice(i, i + batchSize);
      const batchPromises = batch.map(source => this.runSingleScraper(source));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          reports.push(result.value);
        } else {
          reports.push({
            sourceId: batch[index].id,
            sourceName: batch[index].name,
            status: 'error',
            opportunitiesFound: 0,
            duplicatesFiltered: 0,
            errorMessage: result.reason?.message || 'Unknown error',
            timestamp: new Date()
          });
        }
      });
      
      // Add delay between batches to be respectful to websites
      if (i + batchSize < activeSources.length) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    return reports;
  }

  async runSingleScraper(source: ScrapingSource): Promise<ScrapingReport> {
    const report: ScrapingReport = {
      sourceId: source.id,
      sourceName: source.name,
      status: 'error',
      opportunitiesFound: 0,
      duplicatesFiltered: 0,
      timestamp: new Date()
    };

    try {
      const scraper = this.createScraper(source);
      if (!scraper) {
        report.errorMessage = 'Unsupported source type';
        return report;
      }

      console.log(`Starting scraper for: ${source.name}`);
      const result = await scraper.scrape();
      
      if (result.errors.length > 0) {
        report.errorMessage = result.errors.join('; ');
      }

      // Process and store opportunities
      const { stored, duplicates } = await this.processOpportunities(result, source);
      
      report.status = result.opportunities.length > 0 || result.errors.length === 0 ? 'success' : 'error';
      report.opportunitiesFound = stored;
      report.duplicatesFiltered = duplicates;
      
      // Log the activity
      await this.storage.logScrapingActivity({
        sourceId: source.id,
        status: report.status,
        opportunitiesFound: report.opportunitiesFound,
        duplicatesFiltered: report.duplicatesFiltered,
        errorMessage: report.errorMessage || null,
        timestamp: report.timestamp
      });

      console.log(`Completed scraping ${source.name}: ${stored} opportunities found, ${duplicates} duplicates filtered`);

    } catch (error) {
      report.errorMessage = error instanceof Error ? error.message : 'Unknown scraping error';
      console.error(`Scraping failed for ${source.name}:`, error);
      
      await this.storage.logScrapingActivity({
        sourceId: source.id,
        status: 'error',
        opportunitiesFound: 0,
        duplicatesFiltered: 0,
        errorMessage: report.errorMessage,
        timestamp: report.timestamp
      });
    }

    return report;
  }

  private createScraper(source: ScrapingSource): BaseScraper | null {
    const apiCredentials = this.getApiCredentials(source.sourceType);
    
    switch (source.sourceType) {
      case 'linkedin':
        return new LinkedInScraper(source.url, source.name, apiCredentials);
      case 'facebook':
        return new FacebookScraper(source.url, source.name, apiCredentials);
      case 'website':
      case 'rss':
      default:
        return new AcademicWebsiteScraper(source.url, source.name);
    }
  }

  private getApiCredentials(sourceType: string): string | undefined {
    switch (sourceType) {
      case 'linkedin':
        return process.env.LINKEDIN_API_KEY;
      case 'facebook':
        return process.env.FACEBOOK_API_KEY;
      case 'twitter':
        return process.env.TWITTER_API_KEY;
      default:
        return undefined;
    }
  }

  private async processOpportunities(result: ScrapingResult, source: ScrapingSource): Promise<{ stored: number, duplicates: number }> {
    let stored = 0;
    let duplicates = 0;

    for (const opportunity of result.opportunities) {
      try {
        // Check for duplicates based on title and institution
        const existingOpportunities = await this.storage.getFundingOpportunities();
        const isDuplicate = existingOpportunities.some(existing => 
          this.isSimilarOpportunity(existing, opportunity)
        );

        if (isDuplicate) {
          duplicates++;
          continue;
        }

        // Store the opportunity
        await this.storage.addFundingOpportunity({
          title: opportunity.title,
          description: opportunity.description,
          institution: opportunity.institution,
          deadline: opportunity.deadline,
          amount: opportunity.amount,
          degreeLevel: opportunity.degreeLevel,
          subject: opportunity.subject,
          fundingType: opportunity.fundingType,
          sourceUrl: opportunity.sourceUrl,
          sourceName: opportunity.sourceName,
          originalPost: opportunity.originalPost || null,
          professorName: opportunity.professorName || null,
          professorProfile: opportunity.professorProfile || null,
          postDate: opportunity.postDate || null,
          socialPlatform: opportunity.socialPlatform || null,
          isActive: true
        });

        stored++;
      } catch (error) {
        console.error('Error storing opportunity:', error);
      }
    }

    return { stored, duplicates };
  }

  private isSimilarOpportunity(existing: FundingOpportunity, incoming: any): boolean {
    // Check for similar titles (accounting for minor variations)
    const titleSimilarity = this.calculateSimilarity(existing.title, incoming.title);
    const institutionMatch = existing.institution.toLowerCase() === incoming.institution.toLowerCase();
    
    // Consider it a duplicate if title is very similar and institution matches
    return titleSimilarity > 0.8 && institutionMatch;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = new Set([...words1, ...words2]);
    
    return intersection.length / union.size;
  }
}