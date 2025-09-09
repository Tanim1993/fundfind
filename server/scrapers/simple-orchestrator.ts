import { IStorage } from '../storage';
import { HttpScraper } from './http-scraper';
import { FreeApiScraper } from './free-api-scraper';
import type { ScrapingSource } from '@shared/schema';

export interface ScrapingReport {
  sourceId: string;
  sourceName: string;
  status: 'success' | 'error';
  opportunitiesFound: number;
  duplicatesFiltered: number;
  errorMessage?: string;
  timestamp: Date;
}

export class SimpleScrapingOrchestrator {
  constructor(private storage: IStorage) {}

  async runAllScrapers(): Promise<{
    totalSources: number;
    successfulSources: number;
    totalOpportunities: number;
    totalDuplicates: number;
    errors: Array<{ source: string; error: string }>;
  }> {
    const sources = await this.storage.getScrapingSources();
    const activeSources = sources.filter(source => source.isActive);
    
    const reports: ScrapingReport[] = [];
    
    // Process sources sequentially to avoid overwhelming the system
    for (const source of activeSources) {
      const report = await this.runSingleScraper(source);
      reports.push(report);
      
      // Small delay between sources
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const successfulSources = reports.filter(r => r.status === 'success').length;
    const totalOpportunities = reports.reduce((sum, r) => sum + r.opportunitiesFound, 0);
    const totalDuplicates = reports.reduce((sum, r) => sum + r.duplicatesFiltered, 0);
    const errors = reports
      .filter(r => r.status === 'error')
      .map(r => ({ source: r.sourceName, error: r.errorMessage || 'Unknown error' }));

    return {
      totalSources: activeSources.length,
      successfulSources,
      totalOpportunities,
      totalDuplicates,
      errors
    };
  }

  private async runSingleScraper(source: ScrapingSource): Promise<ScrapingReport> {
    console.log(`Starting scraper for: ${source.name}`);
    
    try {
      let result;
      
      // Use free APIs for government sources
      if (source.url.includes('grants.gov') || source.name.toLowerCase().includes('grants.gov')) {
        const apiScraper = new FreeApiScraper(source.url, source.name, source.apiCredentials);
        result = await apiScraper.scrapeGrantsGovApi();
      } else if (source.url.includes('nih.gov') || source.name.toLowerCase().includes('nih')) {
        const apiScraper = new FreeApiScraper(source.url, source.name, source.apiCredentials);
        result = await apiScraper.scrapeNihReporterApi();
      } else if (source.url.includes('sam.gov') || source.name.toLowerCase().includes('sam.gov')) {
        const apiScraper = new FreeApiScraper(source.url, source.name, source.apiCredentials);
        result = await apiScraper.scrapeSamGovApi();
      } else {
        // Use HTTP scraper for other sources
        const scraper = new HttpScraper(source.url, source.name, source.apiCredentials || undefined);
        
        if (source.url.includes('linkedin.com') || source.name.toLowerCase().includes('linkedin')) {
          result = await scraper.scrapeLinkedInProfile();
        } else {
          result = await scraper.scrapeGenericAcademicSite();
        }
      }
      
      // Filter duplicates against existing opportunities
      const existingOpportunities = await this.storage.getFundingOpportunities();
      const duplicates = this.findDuplicates(result.opportunities, existingOpportunities);
      const newOpportunities = result.opportunities.filter((_, index) => !duplicates.includes(index));
      
      // Save new opportunities to storage
      for (const opportunity of newOpportunities) {
        await this.storage.addFundingOpportunity({
          title: opportunity.title,
          description: opportunity.description,
          institution: opportunity.institution,
          deadline: opportunity.deadline || 'Not specified',
          amount: opportunity.amount || 'Amount varies',
          degreeLevel: opportunity.degreeLevel,
          subject: opportunity.subject,
          fundingType: opportunity.fundingType,
          sourceUrl: opportunity.sourceUrl,
          sourceName: opportunity.sourceName,
          isActive: true,
        });
      }

      // Log the activity
      await this.storage.logScrapingActivity({
        sourceId: source.id,
        status: 'success',
        opportunitiesFound: newOpportunities.length,
        duplicatesFiltered: duplicates.length,
        timestamp: new Date()
      });

      console.log(`Completed scraping ${source.name}: ${newOpportunities.length} opportunities found, ${duplicates.length} duplicates filtered`);

      return {
        sourceId: source.id,
        sourceName: source.name,
        status: 'success',
        opportunitiesFound: newOpportunities.length,
        duplicatesFiltered: duplicates.length,
        timestamp: new Date()
      };

    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      
      // Log the error
      await this.storage.logScrapingActivity({
        sourceId: source.id,
        status: 'error',
        opportunitiesFound: 0,
        duplicatesFiltered: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });

      return {
        sourceId: source.id,
        sourceName: source.name,
        status: 'error',
        opportunitiesFound: 0,
        duplicatesFiltered: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  private findDuplicates(newOpportunities: any[], existingOpportunities: any[]): number[] {
    const duplicateIndices: number[] = [];
    
    newOpportunities.forEach((newOpp, index) => {
      const isDuplicate = existingOpportunities.some(existing => {
        const titleMatch = this.similarity(newOpp.title.toLowerCase(), existing.title.toLowerCase()) > 0.8;
        const institutionMatch = newOpp.institution.toLowerCase() === existing.institution.toLowerCase();
        return titleMatch && institutionMatch;
      });
      
      if (isDuplicate) {
        duplicateIndices.push(index);
      }
    });
    
    return duplicateIndices;
  }

  private similarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}