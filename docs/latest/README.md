# PodInsightHQ Documentation

## Overview
This directory contains the single source of truth documentation for the PodInsightHQ dashboard as of Sprint 3 completion. These documents provide comprehensive information about all features, APIs, functionality, and technical architecture.

## 🚨 CRITICAL SECURITY ALERT
**The application has critical security vulnerabilities that must be addressed before Sprint 4. See [Security Recommendations](./SECURITY_RECOMMENDATIONS.md) for immediate action items.**

## Documentation Structure

### Core Documentation

#### 1. [Feature Mapping](./FEATURE_MAPPING.md)
Complete inventory of all dashboard features including:
- Component locations
- Feature descriptions
- API endpoints used
- Technology stack overview

#### 2. [API Endpoints Reference](./API_ENDPOINTS.md)
Detailed API documentation including:
- All internal Next.js API routes
- External API endpoints
- Request/response formats
- Authentication and rate limiting
- Error handling patterns

#### 3. [Functionality Guide](./FUNCTIONALITY_GUIDE.md)
In-depth explanation of how each feature works:
- User interaction flows
- Data processing logic
- Technical implementation details
- Performance optimizations
- Accessibility features

#### 4. [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
System design and architecture documentation:
- Overall system architecture
- Technology stack details
- Component architecture
- Performance strategies
- Security implementation
- Deployment architecture

### Frontend & Deployment Documentation

#### 5. [Frontend Architecture](./FRONTEND_ARCHITECTURE.md)
Complete frontend structure analysis:
- All pages and routes mapping
- Component hierarchy diagram
- API call patterns by component
- Authentication status (⚠️ None implemented)
- Bundle and performance analysis

#### 6. [User Journeys](./USER_JOURNEYS.md)
Detailed user flow documentation with diagrams:
- Search journey with Mermaid flowcharts
- Topic velocity dashboard interactions
- Audio playback flow
- Sentiment analysis interactions
- Error states and edge cases

#### 7. [API Integration Guide](./API_INTEGRATION_GUIDE.md)
Comprehensive API usage patterns:
- Data fetching strategies
- Code examples for each pattern
- Error handling approaches
- Caching implementations
- TypeScript interfaces

#### 8. [Deployment Configuration](./DEPLOYMENT_CONFIGURATION.md)
Production deployment details:
- Vercel configuration
- Environment variables
- Build and deployment process
- Feature flags status
- Scaling considerations

#### 9. [Security Recommendations](./SECURITY_RECOMMENDATIONS.md) 🚨
**MUST READ** - Critical security issues and fixes:
- Exposed backend access vulnerability
- Missing authentication system
- Implementation priorities
- Quick wins for immediate protection

## Quick Reference

### Current Features (Sprint 1-3)
1. **Topic Velocity Tracker** ✅
   - Real-time trend visualization
   - 5 tracked topics
   - Export functionality

2. **AI-Powered Search** ✅
   - Natural language queries
   - Audio clip playback
   - Source citations

3. **Sentiment Heatmap** ✅
   - Weekly sentiment analysis
   - Interactive visualization
   - Time range filtering

4. **Dashboard Metrics** ✅
   - Real-time statistics
   - Animated displays
   - Status indicators

### Upcoming Features (Sprint 4+)
Based on the business overview, the following features are planned:
- Smart Alerts system
- Weekly digest generation
- Slack integration
- Meeting prep briefs
- Team collaboration
- Notion/Airtable integration

## Key Statistics
- **Episodes Analyzed**: 1,171
- **Podcasts Tracked**: 29
- **Update Frequency**: 5 minutes
- **Search Response Time**: <100ms (edge runtime)
- **Audio Clip Length**: 30 seconds

## API Base URLs
- **Frontend**: `http://localhost:3000` (development)
- **External API**: `https://podinsight-api.vercel.app`

## Environment Setup
```bash
# Required environment variables
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app

# Development
npm install
npm run dev

# Production build
npm run build
npm start
```

## Architecture Highlights
- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **Charts**: Recharts with custom tooltips
- **Animation**: Framer Motion
- **Search**: Edge runtime with AI synthesis
- **Caching**: 5-minute API cache, client-side LRU

## Sprint 4 Considerations
When implementing new features in Sprint 4, consider:
1. Maintaining consistent UI/UX patterns
2. Leveraging existing API infrastructure
3. Implementing proper caching strategies
4. Ensuring mobile responsiveness
5. Adding comprehensive error handling
6. Following established TypeScript patterns

## Contact
For questions about this documentation or the PodInsightHQ dashboard, please refer to the development team.

---
*Last Updated: January 2025 (End of Sprint 3)*