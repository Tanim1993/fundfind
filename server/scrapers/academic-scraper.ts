import { BaseScraper, ScrapedOpportunity, ScrapingResult } from './base-scraper';

export class AcademicWebsiteScraper extends BaseScraper {
  constructor(sourceUrl: string, sourceName: string) {
    super(sourceUrl, sourceName);
  }

  async scrape(): Promise<ScrapingResult> {
    const result: ScrapingResult = {
      opportunities: [],
      errors: [],
      sourceInfo: {
        name: this.sourceName,
        url: this.sourceUrl,
        scrapedAt: new Date()
      }
    };

    try {
      // Determine scraping strategy based on website
      if (this.sourceUrl.includes('nsf.gov')) {
        return await this.scrapeNSF(result);
      } else if (this.sourceUrl.includes('fulbright')) {
        return await this.scrapeFulbright(result);
      } else if (this.sourceUrl.includes('nih.gov')) {
        return await this.scrapeNIH(result);
      } else {
        return await this.scrapeGenericAcademicSite(result);
      }
    } catch (error) {
      result.errors.push(`Academic website scraping failed: ${error}`);
      return result;
    }
  }

  private async scrapeNSF(result: ScrapingResult): Promise<ScrapingResult> {
    try {
      const html = await this.makeHttpRequest('https://www.nsf.gov/funding/');
      const $ = this.parseWithCheerio(html);

      // Find funding opportunity elements
      $('.funding-opp, .content-item, .search-result').each((i, element) => {
        const $elem = $(element);
        const title = $elem.find('h3, h4, .title, a').first().text().trim();
        const description = $elem.find('p, .description, .summary').first().text().trim();
        const deadlineText = $elem.text();

        if (title && this.isFundingRelated(title + ' ' + description)) {
          const fundingInfo = this.extractFundingInfo(deadlineText);
          
          result.opportunities.push({
            title: title.slice(0, 150),
            description: description.slice(0, 400) || 'See NSF website for full details',
            institution: 'National Science Foundation',
            deadline: fundingInfo.deadline || 'Check NSF website',
            amount: fundingInfo.amount || 'Varies',
            degreeLevel: fundingInfo.degreeLevel || 'Graduate',
            subject: fundingInfo.subject || 'Science & Engineering',
            fundingType: 'Grant',
            sourceUrl: this.sourceUrl,
            sourceName: 'NSF.gov'
          });
        }
      });

    } catch (error) {
      result.errors.push(`NSF scraping error: ${error}`);
    }

    return result;
  }

  private async scrapeFulbright(result: ScrapingResult): Promise<ScrapingResult> {
    try {
      const html = await this.makeHttpRequest('https://us.fulbrightonline.org/');
      const $ = this.parseWithCheerio(html);

      $('.program-item, .opportunity, .award-item').each((i, element) => {
        const $elem = $(element);
        const title = $elem.find('h3, h4, .title').text().trim();
        const description = $elem.find('p, .description').text().trim();
        
        if (title && this.isFundingRelated(title + ' ' + description)) {
          result.opportunities.push({
            title: title.slice(0, 150),
            description: description.slice(0, 400) || 'Fulbright program for international education',
            institution: 'Fulbright Commission',
            deadline: 'Check Fulbright website',
            amount: 'Full funding available',
            degreeLevel: 'Graduate',
            subject: 'Various Fields',
            fundingType: 'Fully Funded',
            sourceUrl: this.sourceUrl,
            sourceName: 'Fulbright'
          });
        }
      });

    } catch (error) {
      result.errors.push(`Fulbright scraping error: ${error}`);
    }

    return result;
  }

  private async scrapeNIH(result: ScrapingResult): Promise<ScrapingResult> {
    try {
      const html = await this.makeHttpRequest('https://www.nih.gov/grants-funding');
      const $ = this.parseWithCheerio(html);

      $('.funding-opportunity, .grant-listing, .content-item').each((i, element) => {
        const $elem = $(element);
        const title = $elem.find('h3, h4, a').first().text().trim();
        const description = $elem.find('p').first().text().trim();

        if (title && this.isFundingRelated(title + ' ' + description)) {
          const fundingInfo = this.extractFundingInfo($elem.text());
          
          result.opportunities.push({
            title: title.slice(0, 150),
            description: description.slice(0, 400) || 'NIH research funding opportunity',
            institution: 'National Institutes of Health',
            deadline: fundingInfo.deadline || 'See NIH grants calendar',
            amount: fundingInfo.amount || 'Varies by program',
            degreeLevel: 'Graduate',
            subject: 'Life Sciences',
            fundingType: 'Research Grant',
            sourceUrl: this.sourceUrl,
            sourceName: 'NIH.gov'
          });
        }
      });

    } catch (error) {
      result.errors.push(`NIH scraping error: ${error}`);
    }

    return result;
  }

  private async scrapeGenericAcademicSite(result: ScrapingResult): Promise<ScrapingResult> {
    try {
      const html = await this.makeHttpRequest(this.sourceUrl);
      const $ = this.parseWithCheerio(html);

      // Look for common funding/scholarship keywords in headings and content
      $('h1, h2, h3, h4, .title, .heading').each((i, element) => {
        const $elem = $(element);
        const title = $elem.text().trim();
        
        if (this.isFundingRelated(title)) {
          const $parent = $elem.closest('div, section, article').length ? 
                         $elem.closest('div, section, article') : $elem.parent();
          const description = $parent.find('p').first().text().trim();
          const fullText = $parent.text();
          
          const fundingInfo = this.extractFundingInfo(fullText);
          
          result.opportunities.push({
            title: title.slice(0, 150),
            description: description.slice(0, 400) || 'Academic funding opportunity',
            institution: this.extractInstitutionFromUrl(this.sourceUrl),
            deadline: fundingInfo.deadline || 'Check website',
            amount: fundingInfo.amount || 'Amount varies',
            degreeLevel: fundingInfo.degreeLevel || 'Graduate',
            subject: fundingInfo.subject || 'Various',
            fundingType: fundingInfo.fundingType || 'Academic Funding',
            sourceUrl: this.sourceUrl,
            sourceName: this.sourceName
          });
        }
      });

    } catch (error) {
      result.errors.push(`Generic academic site scraping error: ${error}`);
    }

    return result;
  }

  private isFundingRelated(text: string): boolean {
    const keywords = [
      'scholarship', 'fellowship', 'grant', 'funding', 'award',
      'studentship', 'bursary', 'assistantship', 'stipend',
      'phd', 'doctoral', 'graduate', 'research position',
      'opportunity', 'application', 'deadline', 'competition'
    ];
    
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  }

  private extractInstitutionFromUrl(url: string): string {
    const domain = new URL(url).hostname.replace('www.', '');
    
    // Common academic institution patterns
    if (domain.includes('edu')) {
      const parts = domain.split('.');
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  }
}