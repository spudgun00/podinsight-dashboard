# PodInsightHQ Dashboard Feature Mapping

## Overview
This document provides a comprehensive mapping of all features in the PodInsightHQ dashboard, including their endpoints, functionality, and technical implementation details.

## Dashboard Features

### 1. Dashboard Header
**Component**: `/components/dashboard/header.tsx`
**Functionality**: 
- Displays the main PodInsightHQ branding
- Shows tagline: "1,000 hours of podcast intelligence, visualized"
- Provides animated entry experience
**API Endpoints**: None (static component)

### 2. Metric Cards
**Component**: `/components/dashboard/metric-card.tsx`
**Functionality**:
- **Trending Now Card**: 
  - Shows currently trending topic with real-time sparkline
  - Dynamically colored based on performance
- **Episodes Analyzed Card**: 
  - Displays count of analyzed episodes (1,171)
  - Animated count-up effect on load
- **Insights Generated Card**: 
  - Real-time status indicator with pulse animation
  - Shows system is actively generating insights
- **Data Freshness Card**: 
  - Live status indicator showing data recency
  - Pulse animation for real-time feel
**API Endpoints**: Uses data from Topic Velocity API

### 3. AI-Powered Search
**Component**: `/components/dashboard/search-command-bar-fixed.tsx`
**API Endpoint**: `POST /api/search`
**Functionality**:
- Natural language query processing
- AI-synthesized answers with confidence scores
- Source citations with audio clip playback
- Keyboard shortcuts (⌘K, Ctrl+K, /)
- Search result caching for performance
- Cold start handling with user feedback
**Request Format**:
```json
{
  "query": "string (minimum 4 characters)"
}
```
**Response Format**:
```json
{
  "analysis": {
    "answer": "string",
    "confidence": "number (0-100)",
    "key_themes": ["string"],
    "sources_count": "number"
  },
  "sources": [{
    "id": "string",
    "title": "string",
    "show": "string",
    "date": "string",
    "text": "string",
    "relevance": "number",
    "timestamp": "number"
  }],
  "episodes": [{
    "id": "string",
    "title": "string",
    "show": "string",
    "date": "string",
    "relevance": "number"
  }]
}
```

### 4. Topic Velocity Tracker
**Component**: `/components/dashboard/topic-velocity-chart-full-v0.tsx`
**API Endpoint**: `GET /api/topic-velocity`
**Functionality**:
- Interactive line chart showing topic mention trends
- Time range filters: 1W, 1M, 3M, 6M, 1Y, All
- Tracked topics:
  - AI Agents
  - Capital Efficiency
  - DePIN
  - B2B SaaS
  - Crypto/Web3
- Interactive tooltips with metrics
- Trend indicators and velocity badges
- Export functionality (PNG, CSV, PDF)
- Notable performer detection
**Response Format**:
```json
{
  "data": [{
    "week": "string (ISO date)",
    "ai_agents": "number",
    "capital_efficiency": "number",
    "depin": "number",
    "b2b_saas": "number",
    "crypto_web3": "number"
  }],
  "signals": [{
    "topic": "string",
    "signal": "string",
    "confidence": "high|medium|low",
    "date": "string"
  }]
}
```

### 5. Sentiment Heatmap
**Component**: `/components/dashboard/sentiment-heatmap.tsx`
**API Endpoint**: `GET /api/sentiment_analysis_v2`
**Functionality**:
- Visual heatmap showing sentiment by topic and week
- Color scale from -1 (negative) to 1 (positive)
- Time range filters: 1M, 3M, 6M, 1Y, All
- Interactive tooltips with:
  - Sentiment score
  - Episode count
  - Trend direction
**Response Format**:
```json
{
  "data": [{
    "week": "string (ISO date)",
    "topic": "string",
    "sentiment": "number (-1 to 1)",
    "count": "number"
  }]
}
```

### 6. Audio Clip Service
**API Endpoint**: `GET /api/v1/audio_clips/{episode_id}`
**Query Parameters**: 
- `timestamp`: Start time in seconds
**Functionality**:
- Generates 30-second audio clips from episodes
- Supports multiple episode ID formats:
  - GUID format
  - MongoDB ObjectId
  - Substack format
  - Flightcast format
- Used by search results for audio playback
**Response**: Audio file stream (audio/mpeg)

## API Integration Details

### Base Configuration
- **External API Base URL**: `https://podinsight-api.vercel.app`
- **Environment Variable**: `NEXT_PUBLIC_API_URL`
- **Cache Revalidation**: 5 minutes
- **Error Handling**: Graceful fallbacks with user feedback

### API Client (`/lib/api.ts`)
**Key Functions**:
- `fetchTopicVelocity(timeRange?: string)`: Fetches topic trend data
- `fetchSentimentAnalysis(range?: string)`: Fetches sentiment heatmap data
- `fetchTopicSignals()`: Fetches market signals and insights

### Performance Features
- **Search Caching**: LRU cache implementation (`/lib/search-cache.ts`)
- **Audio Pre-fetching**: Preloads next audio clips in search results
- **Request Debouncing**: Prevents excessive API calls during typing
- **Edge Runtime**: Search API uses Next.js edge runtime for faster response

## Data Sources
- **Episodes Analyzed**: 1,171 episodes
- **Podcasts Tracked**: 29 major startup/VC podcasts
- **Update Frequency**: Real-time processing with 5-minute cache

## Technology Stack
- **Frontend Framework**: Next.js 14 with App Router
- **UI Components**: Custom React components with Tailwind CSS
- **Charting**: Recharts for data visualization
- **Animations**: Framer Motion
- **State Management**: React hooks and local state
- **API Routes**: Next.js API routes as proxy layer
- **TypeScript**: Full type safety across the application

## User Experience Features
- **Keyboard Navigation**: Full keyboard support for search
- **Loading States**: Skeleton loaders and progress indicators
- **Error Boundaries**: Graceful error handling with user feedback
- **Mobile Responsive**: Adaptive layouts for all screen sizes
- **Accessibility**: ARIA labels and semantic HTML

## Future Considerations for Sprint 4
Based on the Business Overview, upcoming features may include:
- Smart Alerts system for monitoring mentions
- Weekly digest generation
- Slack integration for alerts
- Meeting prep briefs
- Integration with Notion/Airtable
- Expanded topic tracking
- Team collaboration features