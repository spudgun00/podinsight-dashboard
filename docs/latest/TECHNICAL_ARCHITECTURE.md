# Technical Architecture

## Overview
PodInsightHQ is built as a modern web application using Next.js 14 with a microservices backend architecture. This document outlines the technical stack, architecture decisions, and implementation details.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Next.js   │  │    React     │  │   Tailwind CSS        │ │
│  │  App Router │  │  Components  │  │   Framer Motion       │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes (Proxy)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Search    │  │ Audio Clips  │  │   Cache Layer         │ │
│  │   Route     │  │    Route     │  │   (5 min TTL)         │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              External API (podinsight-api.vercel.app)            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Search    │  │Topic Velocity│  │  Sentiment Analysis   │ │
│  │   Engine    │  │   Analytics  │  │     Processing        │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Podcast    │  │  Transcript  │  │   Vector Database     │ │
│  │  Metadata   │  │   Storage    │  │   (Embeddings)        │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.16 (App Router)
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 3.4.1
- **Animation**: Framer Motion 11.3.30
- **Charts**: Recharts 2.13.3
- **Icons**: Lucide React 0.344.0
- **Language**: TypeScript 5.7.3

### Backend (API Routes)
- **Runtime**: Next.js Edge Runtime (for search)
- **Runtime**: Node.js (for other routes)
- **Validation**: Built-in Next.js validation
- **Error Handling**: Custom error boundaries

### External Services
- **Main API**: podinsight-api.vercel.app
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Analytics**: (To be implemented)

## Key Components

### 1. Search Infrastructure
```typescript
// Edge Runtime Configuration
export const runtime = 'edge'
export const maxDuration = 30

// Search API Implementation
- Natural language processing
- Vector similarity search
- AI synthesis with GPT-4
- Result ranking and relevance scoring
```

### 2. Data Visualization
```typescript
// Topic Velocity Chart
- Recharts for rendering
- Custom tooltip components
- Responsive design patterns
- Export functionality

// Sentiment Heatmap
- Custom grid rendering
- Color interpolation algorithm
- Interactive cell system
```

### 3. Audio Services
```typescript
// Audio Clip Generation
- Dynamic clip extraction
- Multiple format support
- Streaming optimization
- Pre-fetch mechanism
```

## Performance Architecture

### 1. Caching Strategy
```typescript
// API Response Caching
export const revalidate = 300 // 5 minutes

// Client-side Caching
class SearchCache {
  private cache: Map<string, CachedResult>
  private maxSize: number = 50
  // LRU implementation
}
```

### 2. Code Splitting
```javascript
// Route-based splitting
app/
  ├── page.tsx (main bundle)
  ├── test-command-bar/page.tsx (separate bundle)
  └── api/ (server-only code)
```

### 3. Asset Optimization
- Next.js Image optimization
- Font subsetting and preloading
- CSS purging in production
- JavaScript minification

## State Management

### 1. Component State
- React hooks for local state
- useReducer for complex state logic
- Context API for theme/preferences

### 2. Data Fetching
```typescript
// Server Components
async function TopicVelocityChart() {
  const data = await fetchTopicVelocity()
  return <Chart data={data} />
}

// Client Components with SWR pattern
function SearchResults() {
  const { data, error } = useSearch(query)
  // ...
}
```

### 3. Search State
- URL-based state for shareable searches
- Session storage for search history
- Memory cache for active session

## Security Architecture

### 1. Input Validation
```typescript
// Search query validation
if (query.length < 4) {
  return NextResponse.json({ 
    error: 'Query too short' 
  }, { status: 400 })
}
```

### 2. API Security
- CORS configuration for known origins
- Rate limiting (planned)
- Input sanitization
- SQL injection prevention

### 3. Content Security
- XSS protection via React
- CSP headers (to be implemented)
- Secure cookie handling (future auth)

## Deployment Architecture

### 1. Build Process
```bash
# Production build
next build
- Static optimization
- API route compilation
- Asset hashing

# Environment variables
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app
```

### 2. Deployment Pipeline
- Git push triggers Vercel deployment
- Automatic preview deployments for PRs
- Production deployment on main branch
- Rollback capability

### 3. Monitoring (Planned)
- Error tracking with Sentry
- Performance monitoring
- Uptime monitoring
- User analytics

## Data Flow Patterns

### 1. Initial Load
1. Server renders initial HTML
2. React hydrates on client
3. Data fetching begins
4. Progressive enhancement applied

### 2. Search Flow
1. User input triggers debounced search
2. Edge function processes request
3. External API called with timeout
4. Results streamed to client
5. Audio pre-fetch initiated

### 3. Real-time Updates
- Polling for data freshness (5 min)
- WebSocket consideration for future
- Optimistic UI updates
- Background refresh

## Scalability Considerations

### 1. Frontend Scalability
- CDN distribution via Vercel
- Edge rendering capabilities
- Static generation where possible
- Client-side caching

### 2. API Scalability
- Edge runtime for search
- Horizontal scaling on Vercel
- Database connection pooling
- Query result caching

### 3. Data Scalability
- Incremental static regeneration
- Pagination for large datasets
- Virtual scrolling for lists
- Progressive data loading

## Development Workflow

### 1. Local Development
```bash
npm run dev
# Runs on http://localhost:3000
# Hot module replacement enabled
# TypeScript checking in IDE
```

### 2. Testing Strategy
- Unit tests for utilities (planned)
- Integration tests for API routes
- E2E tests for critical paths
- Visual regression testing

### 3. Code Quality
- TypeScript for type safety
- ESLint for code standards
- Prettier for formatting
- Pre-commit hooks (planned)

## Future Architecture Plans

### 1. Authentication System
- NextAuth.js integration
- JWT-based sessions
- Role-based access control
- Team workspaces

### 2. Real-time Features
- WebSocket for live updates
- Collaborative features
- Push notifications
- Live transcription

### 3. Advanced Analytics
- Custom analytics dashboard
- User behavior tracking
- Performance metrics
- A/B testing framework

### 4. Mobile Applications
- React Native apps
- Shared component library
- Offline capabilities
- Push notifications