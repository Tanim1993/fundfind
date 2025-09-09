import { BaseScraper, ScrapedOpportunity, ScrapingResult } from './base-scraper';

export class FacebookScraper extends BaseScraper {
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
      // Facebook requires Graph API for proper access
      if (this.apiCredentials && this.apiCredentials !== 'encrypted_facebook_api_key') {
        return await this.scrapeWithGraphAPI(result);
      } else {
        return await this.scrapePublicFacebook(result);
      }
    } catch (error) {
      result.errors.push(`Facebook scraping failed: ${error}`);
      return result;
    }
  }

  private async scrapeWithGraphAPI(result: ScrapingResult): Promise<ScrapingResult> {
    try {
      // Extract page/group ID from URL
      const pageId = this.extractPageId(this.sourceUrl);
      if (!pageId) {
        result.errors.push('Unable to extract Facebook page/group ID from URL');
        return result;
      }

      // Use Graph API to fetch posts
      const apiUrl = `https://graph.facebook.com/v18.0/${pageId}/posts?access_token=${this.apiCredentials}&fields=message,created_time,permalink_url,from&limit=20`;
      
      const response = await this.makeHttpRequest(apiUrl);
      const data = JSON.parse(response);

      if (data.error) {
        result.errors.push(`Facebook API error: ${data.error.message}`);
        return result;
      }

      // Process posts
      for (const post of data.data || []) {
        if (post.message) {
          const opportunity = this.parseFacebookPost(post);
          if (opportunity) {
            result.opportunities.push(opportunity);
          }
        }
      }

    } catch (error) {
      result.errors.push(`Facebook Graph API error: ${error}`);
    }

    return result;
  }

  private async scrapePublicFacebook(result: ScrapingResult): Promise<ScrapingResult> {
    try {
      await this.initBrowser();
      
      if (!this.page) {
        throw new Error('Browser page not initialized');
      }

      await this.page.goto(this.sourceUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.page.waitForTimeout(5000);

      // Check for login requirement
      const loginRequired = await this.page.$('[data-testid="royal_login_form"]');
      if (loginRequired) {
        result.errors.push('Facebook requires authentication - add valid API credentials');
        return result;
      }

      // Extract posts from Facebook page
      const posts = await this.page.evaluate(() => {
        const postElements = document.querySelectorAll('[data-pagelet*="FeedUnit"], [role="article"]');
        const extractedPosts = [];

        for (const post of postElements) {
          const textContent = post.textContent || '';
          
          // Look for funding/scholarship keywords
          const fundingKeywords = /scholarship|funding|phd|fellowship|grant|position|opportunity|apply|deadline/gi;
          if (!fundingKeywords.test(textContent)) continue;

          const contentElement = post.querySelector('[data-ad-preview="message"]') || 
                                 post.querySelector('div[data-ad-comet-preview="message"]') ||
                                 post.querySelector('div[dir="auto"]');
          
          const authorElement = post.querySelector('strong a, h3 a');
          const timeElement = post.querySelector('[data-testid="story-subtitle"] a');

          extractedPosts.push({
            content: contentElement?.textContent?.trim() || '',
            author: authorElement?.textContent?.trim() || 'Unknown',
            timestamp: timeElement?.getAttribute('aria-label') || '',
            postUrl: timeElement?.getAttribute('href') || '',
            rawText: textContent
          });
        }

        return extractedPosts.slice(0, 10);
      });

      // Process posts
      for (const post of posts) {
        try {
          const opportunity = this.parseFacebookPost(post);
          if (opportunity) {
            result.opportunities.push(opportunity);
          }
        } catch (error) {
          result.errors.push(`Error parsing Facebook post: ${error}`);
        }
      }

    } catch (error) {
      result.errors.push(`Facebook scraping error: ${error}`);
    } finally {
      await this.closeBrowser();
    }

    return result;
  }

  private extractPageId(url: string): string | null {
    const patterns = [
      /facebook\.com\/(?:pages\/)?([^\/\?]+)/,
      /facebook\.com\/groups\/([^\/\?]+)/,
      /facebook\.com\/([0-9]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  private parseFacebookPost(post: any): ScrapedOpportunity | null {
    const content = post.message || post.content || '';
    
    // Check if this is a funding/scholarship post
    const fundingKeywords = /scholarship|funding|phd|fellowship|grant|position|opportunity|deadline|apply/gi;
    if (!fundingKeywords.test(content)) {
      return null;
    }

    const fundingInfo = this.extractFundingInfo(content);
    
    // Extract title
    const lines = content.split('\n').filter(line => line.trim());
    const title = lines[0]?.slice(0, 100).trim() || 'Facebook Funding Opportunity';

    // Extract institution
    let institution = '';
    const institutionMatch = content.match(/(?:at|from|by)\s+([A-Z][a-zA-Z\s&]+(?:University|Institute|College|Lab|Foundation))/gi);
    if (institutionMatch) {
      institution = institutionMatch[0].replace(/^(?:at|from|by)\s+/gi, '').trim();
    }

    return {
      title,
      description: content.slice(0, 300) + (content.length > 300 ? '...' : ''),
      institution: institution || 'Institution Not Specified',
      deadline: fundingInfo.deadline || 'See original post',
      amount: fundingInfo.amount || 'Amount not specified',
      degreeLevel: fundingInfo.degreeLevel || 'PhD',
      subject: fundingInfo.subject || 'Computer Science',
      fundingType: fundingInfo.fundingType || 'Funding Available',
      sourceUrl: post.permalink_url || post.postUrl || this.sourceUrl,
      sourceName: 'Facebook',
      originalPost: content,
      professorName: post.from?.name || post.author || 'Unknown',
      professorProfile: this.sourceUrl,
      postDate: new Date(post.created_time || post.timestamp || Date.now()),
      socialPlatform: 'facebook'
    };
  }
}