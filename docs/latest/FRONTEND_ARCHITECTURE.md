# Frontend Architecture

## Overview
PodInsightHQ uses Next.js 14 with App Router, implementing a client-side heavy architecture with API proxy routes. The application is built with TypeScript and styled with Tailwind CSS.

## 🚨 CRITICAL SECURITY ISSUE
**The API routes are currently public and use a server-side token to access the backend. This exposes the backend to unauthorized access. Authentication must be implemented immediately.**

## Pages & Routes

### Application Routes
```
/                     → Main dashboard page (app/page.tsx)
/test-command-bar     → Test page for search component (app/test-command-bar/page.tsx)
```

### API Routes
```
POST /api/search                        → Search proxy endpoint
GET  /api/v1/audio_clips/[episode_id]   → Audio clip generation endpoint
```

## Component Hierarchy

```
RootLayout (app/layout.tsx)
└── DashboardPage (app/page.tsx) ["use client"]
    ├── DashboardHeader
    ├── SearchCommandBar
    ├── MetricCard (x4)
    │   ├── Trending Now
    │   ├── Episodes Analyzed
    │   ├── Insights Generated
    │   └── Data Freshness
    ├── TopicVelocityChartFullV0
    └── SentimentHeatmap
```

### Key Components

#### 1. **SearchCommandBar** (`/components/dashboard/search-command-bar-fixed.tsx`)
- **Type**: Client Component
- **API Calls**: `POST /api/search`
- **Features**:
  - Debounced search (300ms)
  - Client-side caching (LRU)
  - Request cancellation
  - Audio clip pre-fetching
  - Keyboard shortcuts (⌘K, /)

#### 2. **TopicVelocityChartFullV0** (`/components/dashboard/topic-velocity-chart-full-v0.tsx`)
- **Type**: Client Component
- **API Calls**: `fetchTopicVelocity()` via `/lib/api.ts`
- **Features**:
  - Time range filtering
  - Topic toggling
  - Export functionality
  - Notable performer detection

#### 3. **SentimentHeatmap** (`/components/dashboard/sentiment-heatmap.tsx`)
- **Type**: Client Component
- **API Calls**: `fetchSentimentAnalysis()` via `/lib/api.ts`
- **Features**:
  - Interactive heatmap
  - Time range filtering
  - Tooltip details

#### 4. **MetricCard** (`/components/dashboard/metric-card.tsx`)
- **Type**: Client Component
- **API Calls**: None (receives data via props)
- **Features**:
  - Animated count-up
  - Sparkline charts
  - Real-time indicators

## Authentication Status
- **Current State**: ❌ No authentication implemented
- **API Security**: ⚠️ Public endpoints with server-side token
- **User Sessions**: None
- **Protected Routes**: None

## API Integration Patterns

### 1. Data Fetching Strategy
```typescript
// Current pattern (Client-side)
const response = await fetch(`${API_URL}/api/topic-velocity`, {
  next: { revalidate: 300 }, // 5-minute cache
});
```

### 2. API Client (`/lib/api.ts`)
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://podinsight-api.vercel.app";

export async function fetchTopicVelocity(weeks: number = 12) {
  const response = await fetch(`${API_URL}/api/topic-velocity?weeks=${weeks}`, {
    next: { revalidate: 300 }
  });
  if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
  return response.json();
}
```

### 3. Search Implementation
```typescript
// Search with cancellation
const controller = new AbortController();
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, limit: 10 }),
  signal: controller.signal
});
```

### 4. Error Handling
- Try-catch blocks with fallback data
- User-friendly error messages
- Cold start detection for search
- Graceful degradation

## State Management
- **Pattern**: Local React state with hooks
- **Global State**: None (no Context, Redux, or Zustand)
- **Data Flow**: Props drilling
- **Cache**: Client-side only (search results)

## Performance Optimizations

### 1. Current Optimizations
- Client-side search result caching
- Request debouncing (300ms)
- Audio clip pre-fetching
- Animated component lazy loading

### 2. Missing Optimizations
- ❌ Server Components not utilized
- ❌ No server-side data fetching
- ❌ No streaming SSR
- ❌ Client bundles include all components

## Recommended Architectural Improvements

### Priority 1: Security (Immediate)
```typescript
// Add authentication check to API routes
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... existing logic
}
```

### Priority 2: Server Components (Performance)
```typescript
// Convert main page to Server Component
export default async function DashboardPage() {
  const initialData = await getServerSideData();
  
  return (
    <div>
      <SearchCommandBar /> {/* Client Component */}
      <ServerRenderedDashboard data={initialData} />
    </div>
  );
}
```

### Priority 3: Enhanced Caching
```typescript
// Add server-side caching in API routes
const backendResponse = await fetch(BACKEND_URL, {
  headers: { Authorization: `Bearer ${token}` },
  next: { revalidate: 300 } // Server cache
});
```

## Bundle Analysis
- **Framework**: Next.js 14.2.16
- **UI Library**: React 18.3.1
- **Charts**: Recharts 2.13.3
- **Animation**: Framer Motion 11.3.30
- **Icons**: Lucide React 0.344.0
- **Build Output**: Client-heavy bundles

## Development Tools
- **TypeScript**: 5.7.3
- **Linting**: ESLint (config not examined)
- **Formatting**: Prettier (assumed)
- **Testing**: Jest setup found (search component tests)