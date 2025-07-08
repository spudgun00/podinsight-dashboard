# API Integration Requirements for Sprint 4

## Overview
This document outlines the complete API requirements needed for the Dashboard repository to integrate with real API endpoints, replacing the current mock data implementation for the Episode Intelligence components.

## Current State
- **Dashboard Component**: `/components/dashboard/actionable-intelligence-cards.tsx`
- **Status**: Using mock data with 4 intelligence card types
- **Sprint 4 Goal**: Connect to real API endpoints with live data

## Required API Endpoints

### 1. Market Signals Endpoint
**Endpoint**: `GET /api/intelligence/market-signals`

**Purpose**: Returns trending topics/themes across podcasts

**Request Parameters**:
- `limit` (optional): Number of items to return (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `since` (optional): Filter items since date (ISO 8601)

**Response Structure**:
```json
{
  "data": {
    "items": [
      {
        "id": "ms-1",
        "title": "AI Infrastructure Shift",
        "description": "VCs pivoting from infra to application layer investments",
        "urgency": "critical" | "high" | "normal",
        "metadata": {
          "source": "20VC, All-In Pod",
          "change": "+47%"
        }
      }
    ],
    "totalCount": 23,
    "lastUpdated": "2025-01-08T10:00:00Z",
    "metadata": {
      "cacheKey": "market-signals-v1",
      "ttl": 300
    }
  }
}
```

### 2. Deal Intelligence Endpoint
**Endpoint**: `GET /api/intelligence/deals`

**Purpose**: Returns investment opportunities mentioned in podcasts

**Request Parameters**:
- `limit` (optional): Number of items to return
- `offset` (optional): Pagination offset
- `urgency` (optional): Filter by urgency level

**Response Structure**:
```json
{
  "data": {
    "items": [
      {
        "id": "di-1",
        "title": "Acme.ai - Series A",
        "description": "AI-powered analytics, $15M @ $60M pre",
        "urgency": "critical",
        "metadata": {
          "source": "Closing tomorrow",
          "value": "$15M",
          "deadline": "2025-01-09T17:00:00Z"
        }
      }
    ],
    "totalCount": 8,
    "lastUpdated": "2025-01-08T10:00:00Z"
  }
}
```

### 3. Portfolio Pulse Endpoint
**Endpoint**: `GET /api/intelligence/portfolio`

**Purpose**: Returns mentions of portfolio companies

**Request Parameters**:
- `limit` (optional): Number of items to return
- `offset` (optional): Pagination offset
- `portfolio_ids` (optional): Comma-separated list of portfolio company IDs

**Response Structure**:
```json
{
  "data": {
    "items": [
      {
        "id": "pp-1",
        "title": "CloudBase mentioned on All-In",
        "description": "Jason discussed burn rate concerns in enterprise SaaS",
        "urgency": "high",
        "metadata": {
          "source": "All-In Pod E152",
          "value": "Negative sentiment",
          "episode_url": "https://..."
        }
      }
    ],
    "totalCount": 14,
    "lastUpdated": "2025-01-08T10:00:00Z"
  }
}
```

### 4. Executive Brief Endpoint
**Endpoint**: `GET /api/intelligence/executive-brief`

**Purpose**: Returns summarized key insights

**Request Parameters**:
- `limit` (optional): Number of items to return
- `type` (optional): Filter by insight type

**Response Structure**:
```json
{
  "data": {
    "items": [
      {
        "id": "eb-1",
        "title": "Key Trend: AI Consolidation",
        "description": "Major players acquiring AI startups at record pace",
        "urgency": "normal",
        "metadata": {
          "source": "Cross-podcast analysis",
          "related_episodes": ["ep-123", "ep-456"]
        }
      }
    ],
    "totalCount": 5,
    "lastUpdated": "2025-01-08T10:00:00Z"
  }
}
```

## Common Response Elements

### Success Response
All successful responses follow this pattern:
```json
{
  "data": {
    "items": [...],
    "totalCount": number,
    "lastUpdated": "ISO 8601 timestamp",
    "metadata": {
      "cacheKey": "string",
      "ttl": number (seconds)
    }
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "retryAfter": 60 (seconds, for rate limits)
  }
}
```

### Error Codes
- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Valid auth but insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `VALIDATION_ERROR` - Invalid request parameters

## Technical Requirements

### 1. Authentication & Security
- **Method**: Bearer token authentication
- **Header**: `Authorization: Bearer <token>`
- **Token Storage**: Secure client-side storage (httpOnly cookies preferred)
- **Token Refresh**: Automatic refresh when 401 received

### 2. API Configuration
- **Base URL**: Environment variable `NEXT_PUBLIC_API_URL`
- **Development**: `http://localhost:3001` (or your API port)
- **Production**: TBD (Vercel deployment URL)

### 3. Performance Requirements
- **Response Time**: < 500ms for cached data
- **Polling Interval**: 60 seconds for real-time updates
- **Cache TTL**: 5 minutes (300 seconds)
- **Concurrent Requests**: Support 4 simultaneous endpoint calls

### 4. CORS Configuration
Required headers:
```
Access-Control-Allow-Origin: [dashboard URL]
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## Dashboard Integration Tasks

### 1. Component Refactoring
The current `actionable-intelligence-cards.tsx` needs refactoring:

**Current Structure** (monolithic):
```typescript
const cards = [/* all data in one array */];
const ActionableIntelligenceCards = () => {
  return cards.map(card => <IntelligenceCard {...card} />);
};
```

**Required Structure** (modular):
```typescript
// New grid container
export const ActionableIntelligenceGrid = () => {
  return (
    <Grid>
      <MarketSignalsCard />
      <DealIntelligenceCard />
      <PortfolioPulseCard />
      <ExecutiveBriefCard />
    </Grid>
  );
};

// Individual card component example
export const MarketSignalsCard = () => {
  const { data, isLoading, isError } = useQuery(
    'marketSignals',
    fetchMarketSignals,
    { refetchInterval: 60000 }
  );

  return <IntelligenceCard {...cardProps} />;
};
```

### 2. Data Fetching Implementation
- Use React Query or SWR for caching
- Implement 60-second polling
- Add loading skeletons
- Handle error states gracefully

### 3. State Management
- Loading states per card
- Error handling per card
- Background refetch indicators
- "New data available" notifications

## Questions & Information Needed ✅ ANSWERED

### 1. Authentication Strategy
**Question**: Where do bearer tokens come from?

**ANSWER**: Currently NO authentication is implemented. All API endpoints are public as confirmed in master-api-reference.md. Authentication is planned for Sprint 4 (future work).

**Current Status**:
- ✅ All endpoints are PUBLIC (no auth required)
- ✅ No bearer tokens needed currently
- ⚠️ Security issue noted: API endpoints expose backend without auth

**Sprint 4 Implementation Plan**:
- Will use Supabase Authentication (Option A)
- JWT tokens from Supabase auth
- Automatic refresh handling via Supabase client

### 2. Database Configuration
**Question**: MongoDB vs Supabase?

**ANSWER**: The API uses BOTH databases for different purposes:

**MongoDB Atlas** (Primary for Intelligence Data):
- Stores transcript chunks with embeddings (823,763 documents)
- Vector search capabilities for semantic queries
- Collections: `transcript_chunks_768d`, `episode_transcripts`, `episode_metadata`
- Connection: Uses connection pooling, already configured in API

**Supabase PostgreSQL** (Metadata & Relations):
- Stores episode metadata (1,171 episodes)
- Entity extraction results
- Topic mentions and KPIs
- Tables: `episodes`, `extracted_entities`, `topic_mentions`

**Configuration** (Already in API):
```env
MONGODB_URI=[configured in Vercel]
SUPABASE_URL=[configured in Vercel]
SUPABASE_KEY=[configured in Vercel]
```

### 3. Existing API Code
**ANSWER**: Based on master-api-reference.md:

**API Base URL**: `https://podinsight-api.vercel.app`

**Current Endpoints**:
- `GET /` - Health check
- `POST /api/search` - Main search endpoint (uses MongoDB vector search)
- `GET /api/topic-velocity` - Topic trends over time
- `GET /api/entities` - Entity mentions
- `GET /api/v1/audio_clips/{episode_id}` - Audio clip generation

**No Intelligence Endpoints Yet**: The required endpoints for Episode Intelligence cards don't exist:
- ❌ `/api/intelligence/market-signals`
- ❌ `/api/intelligence/deals`
- ❌ `/api/intelligence/portfolio`
- ❌ `/api/intelligence/executive-brief`

**These need to be created in the API first!**

### 4. Development Setup
**ANSWER**: For local development:

**Dashboard Configuration**:
```env
# Dashboard .env.local
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app
# No API key needed - endpoints are public
```

**For Testing with Real API**:
- Use the deployed Vercel API: `https://podinsight-api.vercel.app`
- All endpoints are currently public
- No authentication tokens required

**UPDATE**: The Episode Intelligence endpoints already exist! They were created in Story 5B.

## ✅ RESOLVED: API Endpoints Already Exist

### Story 5B Created These Endpoints
The Episode Intelligence endpoints exist in `api/intelligence.py`:

1. **GET /api/intelligence/dashboard** ✅
   - Returns top episodes with signals for dashboard cards
   - Includes relevance scoring based on user preferences
   
2. **GET /api/intelligence/brief/{episode_id}** ✅
   - Returns full episode details for modal view
   - Includes all signals and insights
   
3. **POST /api/intelligence/share** ✅
   - Handles sharing via email/Slack
   - Returns success confirmation
   
4. **PUT /api/intelligence/preferences** ✅
   - Updates user preferences
   - Affects relevance scoring

### Story 4 Clarification
Story 4 is a **Dashboard repository story** for frontend integration only:
- Connect to existing Story 5B endpoints
- Replace mock data with real API calls
- Implement React Query hooks
- Add polling and error handling

## Implementation Plan (Dashboard Only)

### Phase 1: API Client Setup (2 hours)
1. Configure axios with base URL
2. Add auth interceptors (when auth is ready)
3. Create TypeScript interfaces

### Phase 2: React Query Integration (3 hours)
1. Create useIntelligenceDashboard hook
2. Create useEpisodeBrief hook
3. Create share mutation
4. Add QueryClient provider

### Phase 3: Component Updates (2 hours)
1. Replace mock data in dashboard component
2. Add loading and error states
3. Connect modal to brief endpoint
4. Implement share functionality

### Phase 4: Testing (1 hour)
1. Test with real API data
2. Verify 60-second polling
3. Test error scenarios

## Next Steps

1. **Start Dashboard Integration**: Work in dashboard repository

2. **Environment Setup**
   ```env
   # Dashboard .env.local
   NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app
   ```

3. **No Authentication Required** (Currently)
   - All endpoints are public
   - No tokens needed
   - Focus on functionality first

4. **Implementation Order**
   - Either create API endpoints first (Option 1)
   - Or start with existing endpoint adaptation (Option 2)

## Testing Requirements

### API Testing
- Unit tests for each endpoint
- Integration tests with database
- Load testing for concurrent requests
- Error scenario testing

### Dashboard Testing
- Component tests with MSW (Mock Service Worker)
- Integration tests for data flow
- Error state testing
- Performance testing with real data

## Timeline Estimate

Based on the subtasks in Asana:
1. API endpoint implementation: 2-3 days
2. Dashboard refactoring: 1-2 days
3. Integration and testing: 1-2 days
4. Performance optimization: 1 day

Total: 5-8 days for complete integration

---

## Executive Summary

### Key Findings:
1. **No Authentication**: All API endpoints are currently PUBLIC - no auth tokens needed
2. **Missing Endpoints**: The 4 Episode Intelligence endpoints don't exist in the API yet
3. **Database**: API uses MongoDB for search/vectors and Supabase for metadata
4. **API URL**: `https://podinsight-api.vercel.app` (deployed and working)

### Critical Decision Required:
**Option 1** (Recommended): Create the 4 new API endpoints first, then integrate
**Option 2**: Adapt existing endpoints (`/api/search`, `/api/entities`) for immediate progress

### Quick Start:
```env
# Add to Dashboard .env.local
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app
```
No authentication tokens needed - all endpoints are public!

---

**Document Version**: 2.0
**Last Updated**: January 8, 2025
**Author**: Sprint 4 Development Team
**Status**: ✅ All questions answered, ready for implementation decision
