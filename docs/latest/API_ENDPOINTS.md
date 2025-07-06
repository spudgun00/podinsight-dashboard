# API Endpoints Reference

## Overview
This document provides a complete reference for all API endpoints used by the PodInsightHQ dashboard.

## Internal API Routes (Next.js)

### 1. Search API
**Endpoint**: `POST /api/search`
**Location**: `/app/api/search/route.ts`
**Purpose**: AI-powered natural language search across podcast transcripts
**Request**:
```json
{
  "query": "string (minimum 4 characters required)"
}
```
**Response**:
```json
{
  "analysis": {
    "answer": "AI-generated synthesis of findings",
    "confidence": 85,
    "key_themes": ["theme1", "theme2"],
    "sources_count": 5
  },
  "sources": [
    {
      "id": "episode_guid",
      "title": "Episode Title",
      "show": "Podcast Name",
      "date": "2024-01-15",
      "text": "Relevant transcript excerpt...",
      "relevance": 0.95,
      "timestamp": 1234
    }
  ],
  "episodes": [
    {
      "id": "episode_guid",
      "title": "Episode Title",
      "show": "Podcast Name",
      "date": "2024-01-15",
      "relevance": 0.85
    }
  ]
}
```
**Features**:
- Uses Next.js Edge Runtime for performance
- Implements request cancellation
- Handles cold starts gracefully
- Includes search result caching

### 2. Audio Clips API
**Endpoint**: `GET /api/v1/audio_clips/{episode_id}`
**Location**: `/app/api/v1/audio_clips/[episode_id]/route.ts`
**Purpose**: Generate 30-second audio clips from episodes
**Query Parameters**:
- `timestamp` (optional): Start time in seconds, defaults to 0
**Response**: Audio stream (audio/mpeg)
**Supported Episode ID Formats**:
- GUID: `{8-4-4-4-12}` hex pattern
- MongoDB ObjectId: 24 character hex string
- Substack: `{guid}.substack.com`
- Flightcast: `{id}.flightcast.fm`

## External API Endpoints (podinsight-api.vercel.app)

### 1. Topic Velocity
**Endpoint**: `GET /topic-velocity`
**Purpose**: Retrieve topic mention trends over time
**Query Parameters**:
- `range` (optional): Time range filter (1W, 1M, 3M, 6M, 1Y, All)
**Response**:
```json
{
  "data": [
    {
      "week": "2024-01-15",
      "ai_agents": 125,
      "capital_efficiency": 89,
      "depin": 45,
      "b2b_saas": 203,
      "crypto_web3": 67
    }
  ],
  "signals": [
    {
      "topic": "ai_agents",
      "signal": "300% increase in mentions",
      "confidence": "high",
      "date": "2024-01-15"
    }
  ]
}
```

### 2. Sentiment Analysis
**Endpoint**: `GET /sentiment_analysis_v2`
**Purpose**: Retrieve sentiment scores by topic and time
**Query Parameters**:
- `range` (optional): Time range filter (1M, 3M, 6M, 1Y, All)
**Response**:
```json
{
  "data": [
    {
      "week": "2024-01-15",
      "topic": "AI Agents",
      "sentiment": 0.75,
      "count": 42
    }
  ]
}
```

### 3. Topic Signals
**Endpoint**: `GET /topic_signals`
**Purpose**: Retrieve market signals and insights for topics
**Response**:
```json
{
  "signals": [
    {
      "topic": "ai_agents",
      "signal": "Accelerating adoption in enterprise",
      "confidence": "high",
      "date": "2024-01-15"
    }
  ]
}
```

### 4. Natural Language Search
**Endpoint**: `POST /search`
**Purpose**: External search API for natural language queries
**Request**:
```json
{
  "query": "What are VCs saying about B2B SaaS valuations?"
}
```
**Response**: Similar to internal search API format

### 5. Audio Clips
**Endpoint**: `GET /audio_clips/{episode_guid}.mp3`
**Purpose**: Retrieve audio clips from external storage
**Query Parameters**:
- `start_time`: Start timestamp in seconds
- `duration`: Clip duration (default: 30 seconds)

## API Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app
```

### API Client Configuration
**Location**: `/lib/api.ts`
**Features**:
- Centralized error handling
- 5-minute cache revalidation
- TypeScript type safety
- Automatic retries on failure

### Request Headers
All external API requests include:
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Error Responses
Standard error format:
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

## Rate Limiting
- Search API: 100 requests per minute per IP
- Audio Clips: 500 requests per hour per IP
- Other endpoints: 1000 requests per hour per IP

## Caching Strategy
- Topic Velocity: 5 minutes
- Sentiment Analysis: 5 minutes
- Search Results: Client-side LRU cache
- Audio Clips: Browser cache (1 hour)

## Security
- All API routes are public (no authentication required currently)
- CORS enabled for dashboard origin
- Input validation on all endpoints
- SQL injection protection through parameterized queries
- XSS protection through proper encoding