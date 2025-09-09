import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';

export interface ScrapedOpportunity {
  title: string;
  description: string;
  institution: string;
  deadline: string;
  amount: string;
  degreeLevel: string;
  subject: string;
  fundingType: string;
  sourceUrl: string;
  sourceName: string;
  originalPost?: string;
  professorName?: string;
  professorProfile?: string;
  postDate?: Date;
  socialPlatform?: string;
}

export interface ScrapingResult {
  opportunities: ScrapedOpportunity[];
  errors: string[];
  sourceInfo: {
    name: string;
    url: string;
    scrapedAt: Date;
  };
}

export abstract class BaseScraper {
  protected browser?: Browser;
  protected page?: Page;

  constructor(
    protected sourceUrl: string,
    protected sourceName: string,
    protected apiCredentials?: string
  ) {}

  async initBrowser(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  protected async makeHttpRequest(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      throw new Error(`HTTP request failed: ${error}`);
    }
  }

  protected parseWithCheerio(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  protected extractFundingInfo(text: string): {
    amount?: string;
    deadline?: string;
    degreeLevel?: string;
    subject?: string;
    fundingType?: string;
  } {
    const info: any = {};

    // Extract funding amount
    const amountRegex = /\$[\d,]+(?:,\d{3})*(?:\.\d{2})?|\d+[kK]|\$\d+|\d+\s*thousand|\d+\s*million|full\s*tuition|tuition\s*waiver/gi;
    const amountMatch = text.match(amountRegex);
    if (amountMatch) {
      info.amount = amountMatch[0];
    }

    // Extract deadline
    const deadlineRegex = /(?:deadline|due|apply\s*by|closes?)\s*:?\s*([a-zA-Z]+\s+\d{1,2},?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/gi;
    const deadlineMatch = text.match(deadlineRegex);
    if (deadlineMatch) {
      info.deadline = deadlineMatch[0].replace(/deadline|due|apply\s*by|closes?\s*:?\s*/gi, '').trim();
    }

    // Extract degree level
    if (/phd|doctoral|doctorate/gi.test(text)) {
      info.degreeLevel = 'PhD';
    } else if (/master|ms|ma|msc/gi.test(text)) {
      info.degreeLevel = 'Masters';
    } else if (/undergraduate|bachelor|bs|ba/gi.test(text)) {
      info.degreeLevel = 'Undergraduate';
    }

    // Extract subject
    const subjects = ['Computer Science', 'Engineering', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Economics', 'Psychology'];
    for (const subject of subjects) {
      if (new RegExp(subject, 'gi').test(text)) {
        info.subject = subject;
        break;
      }
    }

    // Extract funding type
    if (/full\s*fund|fully\s*fund|full\s*scholarship/gi.test(text)) {
      info.fundingType = 'Fully Funded';
    } else if (/partial|stipend/gi.test(text)) {
      info.fundingType = 'Partial Funding';
    }

    return info;
  }

  abstract scrape(): Promise<ScrapingResult>;
}