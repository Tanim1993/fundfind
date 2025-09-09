# Overview

FundingFundAI is a comprehensive data scraping platform designed to help students discover current PhD and Master's funding opportunities in the USA. The application automatically scrapes funding information from government APIs, professor websites, and various academic sources, curates the data, and provides users with an intuitive interface to browse opportunities. Users can subscribe to email notifications based on their academic interests and degree preferences to stay updated on new funding opportunities.

## Interactive Scholarship Journey Visualization Feature
The platform now includes a comprehensive journey tracking system that guides students through the entire scholarship application process with step-by-step visualization, progress tracking, and interactive tips for successful applications.

## Recent Changes (August 19, 2025)
- **✅ COMPLETED: Interactive Scholarship Journey Visualization Feature**
  - Added comprehensive step-by-step journey tracking system for scholarship applications
  - Built NSF Graduate Research Fellowship and Fulbright U.S. Student Program journey templates
  - Implemented visual progress bars showing completion percentage and days until deadline
  - Created expandable step cards with detailed tips, requirements, and timeline information
  - Added backend API endpoints for journey management and progress tracking (GET, POST, PATCH, DELETE)
  - Integrated "Mark as Complete" functionality with real-time progress updates and toast notifications
  - Added journey selection interface with urgency badges for approaching deadlines

### Previous Updates (August 18, 2025)
- **Integrated Free Government APIs**: Added Grants.gov, NIH RePORTER, SAM.gov, NSF.gov, and Fulbright Portal APIs
- **83+ Real Opportunities**: All data now comes from authentic federal sources with no API keys required
- **Fixed All Apply Now Buttons**: Every opportunity links to real institutional URLs for actual applications
- **Advanced Duplicate Detection**: Implemented comprehensive algorithms to prevent data duplication
- **Lightweight Scraping**: Replaced Puppeteer with Axios/Cheerio for Replit compatibility
- **Fixed Frontend Crashes**: Eliminated process.env access issues in browser environment

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React-based SPA**: Built with React 18 using TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **UI Components**: Radix UI primitives wrapped with custom styled components

## Backend Architecture
- **Express.js Server**: RESTful API with TypeScript for consistent typing
- **Database Integration**: Drizzle ORM with PostgreSQL (specifically Neon Database) for type-safe database operations
- **Email Service**: Nodemailer for automated email notifications to subscribers
- **Development Setup**: Vite for fast development builds and hot module replacement

## Database Design
The system uses PostgreSQL with the following core entities:
- **Users**: Basic user authentication and management
- **Funding Opportunities**: Core funding data with fields for title, description, institution, deadlines, amounts, degree levels, and subjects
- **Subscriptions**: User preferences for email notifications with subject and degree level filters
- **Scraping Sources**: Configuration for automated data collection from external sources
- **Scraping Activity**: Logging and monitoring of automated scraping operations

## API Structure
RESTful endpoints organized by resource:
- `/api/funding-opportunities` - CRUD operations for funding data with filtering capabilities
- `/api/subscriptions` - User subscription management
- `/api/scraping-sources` - Management of data sources for automated collection
- `/api/statistics` - Dashboard metrics and analytics
- `/api/subject-counts` - Subject-based opportunity aggregation

## Key Features
- **Automated Data Collection**: Web scraping system that regularly collects funding opportunities from academic sources
- **Advanced Filtering**: Users can filter opportunities by subject, degree level, funding type, and search terms
- **Email Notifications**: Automated email system that notifies subscribers of new opportunities matching their preferences
- **Admin Dashboard**: Administrative interface for managing scraping sources and monitoring system activity
- **Responsive Design**: Mobile-first design ensuring accessibility across all devices

# External Dependencies

## Core Technologies
- **Neon Database**: PostgreSQL-compatible serverless database for data persistence
- **Nodemailer**: Email service integration for automated notifications to subscribers
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect support

## Frontend Libraries
- **shadcn/ui**: Component library built on Radix UI primitives
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for UI elements

## Development Tools
- **Vite**: Build tool and development server with React plugin
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment with runtime error handling

## Email Configuration
The system requires SMTP configuration for email notifications:
- Configurable SMTP host, port, and authentication
- Default Gmail SMTP settings with environment variable overrides
- Secure email delivery for subscription notifications