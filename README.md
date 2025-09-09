# FundingFundAI

## Overview

FundingFundAI is a comprehensive data scraping platform designed to help students discover current PhD and Master's funding opportunities in the USA. The application automatically scrapes funding information from government APIs, professor websites, and various academic sources, curates the data, and provides users with an intuitive interface to browse opportunities.

## Key Features

### 🔍 Real-Time Data Collection
- **Government API Integration**: NIH RePORTER, SAM.gov, Grants.gov, NSF.gov, Fulbright Portal
- **Academic Source Scraping**: Professor social media posts, university websites
- **Automated Scheduling**: Runs every 6 hours and daily at 6 AM
- **Duplicate Detection**: Advanced algorithms prevent data duplication

### 📊 Interactive Scholarship Journey Visualization
- **Step-by-Step Progress Tracking**: Visual timeline for application processes
- **Pre-built Templates**: NSF GRFP, Fulbright, and more scholarship journeys
- **Smart Reminders**: Track deadlines and important milestones
- **Progress Analytics**: Visual progress bars and completion statistics
- **Interactive Tips**: Contextual guidance for each application step

### 💰 Current Funding Opportunities
- **83+ Active Opportunities**: Real federal funding data with current deadlines
- **Advanced Filtering**: By subject, degree level, funding type, and search terms
- **Live Updates**: Opportunities refreshed automatically from authentic sources
- **Direct Application Links**: All "Apply Now" buttons link to real institutional URLs

### 📧 Smart Notifications
- **Email Subscriptions**: Personalized alerts based on academic interests
- **Custom Filters**: Subject areas, degree levels, and keyword matching
- **Welcome Emails**: Automated onboarding for new subscribers

### 🎛️ Admin Dashboard
- **Data Source Management**: Configure and monitor scraping sources
- **Real-time Analytics**: Track opportunities, subscribers, and system performance
- **Manual Scraping Controls**: Run scraping operations on-demand

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** + **shadcn/ui** for modern, responsive design
- **TanStack Query** for server state management and caching
- **Wouter** for lightweight client-side routing
- **React Hook Form** + **Zod** for type-safe form handling

### Backend
- **Express.js** RESTful API with TypeScript
- **In-Memory Storage** for fast prototyping and development
- **Nodemailer** for automated email notifications
- **Node-cron** for scheduled data collection
- **Axios + Cheerio** for lightweight web scraping

### Data Sources (No API Keys Required)
- **NIH RePORTER API** - National Institutes of Health research opportunities
- **SAM.gov API** - Federal funding and grants database
- **Grants.gov API** - Government grant opportunities
- **NSF.gov** - National Science Foundation programs
- **Fulbright Portal** - International exchange programs

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Git for version control

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/fundingfundai.git
cd fundingfundai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5000`

## API Endpoints

### Funding Opportunities
- `GET /api/funding-opportunities` - List all opportunities with filtering
- `GET /api/funding-opportunities/:id` - Get specific opportunity
- `POST /api/funding-opportunities` - Create new opportunity (admin)

### Scholarship Journeys
- `GET /api/scholarship-journeys` - Get all journey templates
- `GET /api/scholarship-journeys/:id` - Get specific journey
- `POST /api/scholarship-journeys` - Create new journey
- `PATCH /api/scholarship-journeys/progress` - Update step progress
- `DELETE /api/scholarship-journeys/:id` - Delete journey

### Subscriptions
- `GET /api/subscriptions` - List all subscriptions (admin)
- `POST /api/subscriptions` - Create new subscription
- `DELETE /api/subscriptions/:id` - Unsubscribe

### Data Sources & Analytics
- `GET /api/scraping-sources` - List all data sources
- `GET /api/scraping-activity` - View scraping history
- `GET /api/statistics` - Platform analytics
- `POST /api/run-scraper` - Manual scraping trigger (admin)

## Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions and configurations
│   └── index.html
├── server/                # Express.js backend
│   ├── scrapers/          # Data collection modules
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   └── storage.ts        # Data storage interface
├── shared/               # Shared TypeScript schemas
└── README.md
```

## Recent Updates (August 18, 2025)

### Interactive Scholarship Journey Visualization
- Added comprehensive journey tracking system
- Built NSF GRFP and Fulbright journey templates with real deadlines
- Implemented progress tracking with visual feedback
- Added step-by-step guidance with tips and requirements
- Created backend API for journey management

### Data Integration Success
- Successfully integrated 5 government APIs providing 83+ opportunities
- All data sources are free and require no authentication
- Implemented advanced duplicate detection algorithms
- Fixed all Apply Now buttons to link to authentic application URLs

### Performance Improvements
- Replaced Puppeteer with lightweight HTTP scraping for Replit compatibility
- Eliminated frontend environment variable crashes
- Optimized data loading and caching strategies

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for students seeking funding opportunities worldwide.

**FundingFundAI** - AI-powered scholarship discovery and journey tracking platform.