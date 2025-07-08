# Episode Intelligence API Integration Guide

## Overview
This document describes the integration of the Episode Intelligence dashboard component with the backend API endpoints for Story 4.

## What's Been Implemented

### 1. New Components Created
- **`actionable-intelligence-cards-api.tsx`** - API-connected version of dashboard cards
- **`intelligence-brief-modal.tsx`** - Modal for displaying detailed episode intelligence
- **`intelligence-skeleton.tsx`** - Loading skeleton component

### 2. Supporting Infrastructure
- **`types/intelligence.ts`** - TypeScript types for API responses and UI components
- **`utils/intelligence-transformer.ts`** - Transforms API episode data to card-based UI format
- **`hooks/useIntelligenceDashboard.ts`** - React Query hook for data fetching
- **`providers/query-provider.tsx`** - React Query provider setup

### 3. Key Features Implemented
✅ Real-time data fetching from `/api/intelligence/dashboard`
✅ 60-second auto-refresh interval
✅ Loading states with skeleton UI
✅ Error handling with retry mechanism
✅ Data transformation (episode-based → card-based)
✅ Click-through to detailed episode briefs
✅ Email/Slack sharing functionality
✅ Responsive design maintained

## API Endpoints Used

1. **GET `/api/intelligence/dashboard?limit=8`**
   - Fetches top 6-8 episodes by relevance score
   - No authentication (temporarily disabled for Story 4)

2. **GET `/api/intelligence/brief/{episode_id}`**
   - Fetches detailed intelligence for specific episode
   - Triggered when user clicks on a signal item

3. **POST `/api/intelligence/share`**
   - Shares episode intelligence via email or Slack
   - Currently simulated (not sending actual emails)

## Data Transformation Logic

The API returns episode-centric data, but the UI displays card-centric categories:

```typescript
// Signal Type Mapping
investable → Market Signals + Deal Intelligence
competitive → Portfolio Pulse
portfolio → Portfolio Pulse
sound_bite → Executive Brief + Market Signals

// Urgency Mapping
confidence > 0.8 → critical (red, pulsing)
confidence 0.6-0.8 → high (yellow)
confidence < 0.6 → normal (green)
```

## Usage

### To use the API-connected version:
```tsx
import { ActionableIntelligenceCardsAPI } from "@/components/dashboard/actionable-intelligence-cards-api";

// In your page component
<ActionableIntelligenceCardsAPI />
```

### Example implementation available at:
`/app/dashboard-api-example/page.tsx`

## Testing the Integration

1. Navigate to: http://localhost:3000/dashboard-api-example
2. Verify data loads from API (check Network tab)
3. Test auto-refresh (wait 60 seconds)
4. Click on signal items to open modal
5. Test email/Slack sharing buttons

## Configuration

Environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app
```

## Next Steps

1. **Authentication**: When auth system is implemented, update hooks to include auth headers
2. **Performance**: Monitor response times, add caching if needed
3. **Error Recovery**: Implement offline support
4. **Analytics**: Track user interactions with intelligence cards

## Known Limitations

1. Authentication temporarily disabled (per Story 5b requirements)
2. Share functionality simulated (not sending actual emails)
3. Audio clips not yet integrated (future story)
4. Preferences endpoint not connected to UI yet

## Troubleshooting

### "Failed to load intelligence data"
- Check API is running: https://podinsight-api.vercel.app/api/health
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check browser console for CORS errors

### Empty cards showing
- API might be returning empty signals array
- Check data transformation logic in `intelligence-transformer.ts`

### Modal not opening
- Ensure episodeId is present in TopItem data
- Check console for errors in fetchEpisodeBrief