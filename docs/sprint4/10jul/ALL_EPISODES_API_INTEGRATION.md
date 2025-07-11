# All Episodes Modal - API Integration

## TEMPORARY SOLUTION
**Note**: Currently using `/api/intelligence/dashboard` endpoint with client-side filtering until the backend implements the dedicated `/api/intelligence/episodes` endpoint. This is a temporary workaround that:
- Fetches up to 50 episodes from the dashboard endpoint
- Applies filtering and pagination client-side
- Will be replaced once the proper endpoint is available

## Summary of Changes

### 1. Created API Hook
- **File**: `/hooks/useAllEpisodesAPI.ts`
- Uses React Query's `useInfiniteQuery` for pagination
- Handles API requests with all filter parameters
- Converts APIEpisode to ExtendedEpisode format
- Supports both real API and mock data (via env flag)
- Implements debouncing for search queries

### 2. Created API-Connected Component
- **File**: `/components/intelligence/AllEpisodesViewAPI.tsx`
- Replaces the mock data version
- Maintains all existing UI and functionality
- Adds loading states and error handling
- Implements infinite scrolling with "Load More" button
- Responsive design for mobile and desktop

### 3. Created Debounce Hook
- **File**: `/hooks/useDebounce.ts`
- Prevents excessive API calls during search typing
- 300ms delay for search queries

## API Endpoint Design

The integration expects an endpoint at `/api/intelligence/episodes` with these parameters:

```typescript
GET /api/intelligence/episodes
Query Parameters:
- page: number (default: 1)
- limit: number (default: 15, maps to pageSize)
- podcast: string (podcast name filter)
- signal_type: string ('investable' | 'competitive' | 'portfolio' | 'sound_bite')
- start_date: string (ISO date)
- end_date: string (ISO date)
- min_score: number (0-100)
- q: string (search query)
- sort_by: 'date' | 'score' (default: 'date')
- sort_order: 'asc' | 'desc' (default: 'desc')

Response:
{
  episodes: APIEpisode[],
  totalCount: number,
  currentPage: number,
  pageSize: number,
  totalPages: number,
  hasMore: boolean
}
```

## Features

### Filtering
- **Podcast**: Filter by specific podcast or show all
- **Signal Type**: Filter by investable, competitive, portfolio, or market intel
- **Date Range**: Last 24h, 7d, 30d, 3m, or all time
- **Minimum Score**: 50+, 70+, 85+, 90+, or any

### Search
- Full-text search across episode titles, podcast names, and intelligence content
- Debounced to prevent excessive API calls
- Server-side search for performance

### Pagination
- Infinite scrolling with "Load More" button
- 15 episodes per page
- Maintains scroll position when loading more

### Performance
- Server-side filtering for efficiency
- React Query caching (5 min stale time, 10 min cache)
- Debounced search input
- Loading states for better UX

## Testing with Mock Data

To test with mock data instead of real API:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true npm run dev
```

The mock data implementation:
- Simulates API response format
- Applies all filters client-side
- Adds 300ms network delay
- Paginates mock episodes

## Backend Requirements

The backend needs to implement the `/api/intelligence/episodes` endpoint with:

1. **Database Query**
   - Filter episodes by all provided parameters
   - Sort by date or score
   - Implement offset-based pagination
   - Return only episodes with intelligence data

2. **Optimization**
   - Add indexes on filterable fields (podcast_name, published_at, relevance_score)
   - Consider caching for frequently accessed data
   - Implement query result limits

3. **Response Format**
   - Must match the AllEpisodesResponse interface
   - Include pagination metadata
   - Return episodes in APIEpisode format

## Migration Notes

- The new component is a drop-in replacement for the mock version
- No changes needed to parent components
- All existing functionality is preserved
- Added loading and error states for better UX