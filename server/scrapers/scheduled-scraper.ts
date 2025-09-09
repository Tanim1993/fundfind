import * as cron from 'node-cron';
import { SimpleScrapingOrchestrator } from './simple-orchestrator';
import { IStorage } from '../storage';

export class ScheduledScraper {
  private orchestrator: SimpleScrapingOrchestrator;
  private isRunning = false;

  constructor(storage: IStorage) {
    this.orchestrator = new SimpleScrapingOrchestrator(storage);
  }

  startScheduledScraping() {
    // Run scraping every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      if (this.isRunning) {
        console.log('Scraping already in progress, skipping scheduled run');
        return;
      }

      console.log('Starting scheduled scraping run');
      await this.runScraping();
    });

    // Run scraping daily at 6 AM
    cron.schedule('0 6 * * *', async () => {
      if (this.isRunning) {
        console.log('Scraping already in progress, skipping daily run');
        return;
      }

      console.log('Starting daily scraping run');
      await this.runScraping();
    });

    console.log('Scheduled scraping initialized');
  }

  async runManualScraping(): Promise<{
    totalSources: number;
    totalOpportunities: number;
    totalDuplicates: number;
    successfulSources: number;
    errors: Array<{ source: string; error: string }>;
  }> {
    if (this.isRunning) {
      throw new Error('Scraping is already in progress');
    }

    return await this.runScraping();
  }

  private async runScraping(): Promise<{
    totalSources: number;
    totalOpportunities: number;
    totalDuplicates: number;
    successfulSources: number;
    errors: Array<{ source: string; error: string }>;
  }> {
    this.isRunning = true;
    
    try {
      console.log('Starting scraping orchestrator...');
      const result = await this.orchestrator.runAllScrapers();
      
      console.log('Scraping completed:', result);
      return result;
      
    } catch (error) {
      console.error('Scraping orchestrator failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  isScrapingInProgress(): boolean {
    return this.isRunning;
  }
}