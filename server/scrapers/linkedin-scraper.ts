import { BaseScraper, ScrapedOpportunity, ScrapingResult } from './base-scraper';

export class LinkedInScraper extends BaseScraper {
  constructor(sourceUrl: string, sourceName: string, apiCredentials?: string) {
    super(sourceUrl, sourceName, apiCredentials);
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
      await this.initBrowser();
      
      if (!this.page) {
        throw new Error('Browser page not initialized');
      }

      // Navigate to LinkedIn profile or search
      await this.page.goto(this.sourceUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for content to load
      await this.page.waitForTimeout(3000);

      // Check if we need to handle LinkedIn login/access
      const isLoginRequired = await this.page.$('.authwall');
      if (isLoginRequired) {
        result.errors.push('LinkedIn requires authentication - add valid API credentials');
        return result;
      }

      // Extract posts from LinkedIn feed or profile
      const posts = await this.page.evaluate(() => {
        const postElements = document.querySelectorAll('[data-id*="urn:li:activity"], .feed-shared-update-v2, .artdeco-card');
        const extractedPosts = [];

        for (const post of postElements) {
          const textContent = post.textContent || '';
          
          // Look for funding/scholarship keywords
          const fundingKeywords = /scholarship|funding|phd|fellowship|grant|position|opportunity|apply|deadline/gi;
          if (!fundingKeywords.test(textContent)) continue;

          // Extract post data
          const authorElement = post.querySelector('.feed-shared-actor__name, .update-components-actor__name');
          const contentElement = post.querySelector('.feed-shared-text, .feed-shared-update-v2__commentary');
          const timeElement = post.querySelector('time, .feed-shared-actor__sub-description');
          const linkElement = post.querySelector('a[href*="/posts/"], a[href*="/feed/update/"]');

          extractedPosts.push({
            content: contentElement?.textContent?.trim() || textContent.slice(0, 500),
            author: authorElement?.textContent?.trim() || 'Unknown',
            timestamp: timeElement?.getAttribute('datetime') || timeElement?.textContent || '',
            postUrl: linkElement?.getAttribute('href') || '',
            rawText: textContent
          });
        }

        return extractedPosts.slice(0, 10); // Limit to 10 most recent posts
      });

      // Process each post to extract funding opportunities
      for (const post of posts) {
        try {
          const opportunity = this.parseLinkedInPost(post);
          if (opportunity) {
            result.opportunities.push(opportunity);
          }
        } catch (error) {
          result.errors.push(`Error parsing post: ${error}`);
        }
      }

    } catch (error) {
      result.errors.push(`LinkedIn scraping failed: ${error}`);
    } finally {
      await this.closeBrowser();
    }

    return result;
  }

  private parseLinkedInPost(post: any): ScrapedOpportunity | null {
    const content = post.content || '';
    const rawText = post.rawText || '';

    // Check if this is a funding/scholarship post
    const fundingKeywords = /scholarship|funding|phd|fellowship|grant|position|opportunity|deadline|apply/gi;
    if (!fundingKeywords.test(content)) {
      return null;
    }

    // Extract basic information
    const fundingInfo = this.extractFundingInfo(rawText);
    
    // Extract title from content
    let title = '';
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      title = lines[0].slice(0, 100).trim();
    }

    // Extract institution
    let institution = '';
    const institutionMatch = rawText.match(/(?:at|from|by)\s+([A-Z][a-zA-Z\s&]+(?:University|Institute|College|Lab|Foundation))/gi);
    if (institutionMatch) {
      institution = institutionMatch[0].replace(/^(?:at|from|by)\s+/gi, '').trim();
    }

    return {
      title: title || 'LinkedIn Funding Opportunity',
      description: content.slice(0, 300) + (content.length > 300 ? '...' : ''),
      institution: institution || 'Institution Not Specified',
      deadline: fundingInfo.deadline || 'See original post',
      amount: fundingInfo.amount || 'Amount not specified',
      degreeLevel: fundingInfo.degreeLevel || 'PhD',
      subject: fundingInfo.subject || 'Computer Science',
      fundingType: fundingInfo.fundingType || 'Funding Available',
      sourceUrl: post.postUrl || this.sourceUrl,
      sourceName: 'LinkedIn',
      originalPost: content,
      professorName: post.author,
      professorProfile: this.sourceUrl,
      postDate: new Date(post.timestamp || Date.now()),
      socialPlatform: 'linkedin'
    };
  }
}