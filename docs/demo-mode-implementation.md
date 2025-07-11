# Demo Mode Implementation

## Summary
Implemented a complete demo mode toggle that allows instant switching between live API data and mock data for customer demonstrations. This prevents CORS errors, 500 errors, and broken functionality when APIs are incomplete or unavailable.

## Initial Problem
The user needed a way to quickly switch to mock data for customer demos without spending time fixing broken APIs. Requirements:
- Toggle switch in the dashboard header
- No page refresh required
- Persistent preference across sessions
- Complete prevention of API calls in demo mode
- Realistic mock data that demonstrates product capabilities

## Implementation Details

### 1. Updated Core API Functions (`/lib/api.ts`)
- Added `isDemoModeFromStorage()` helper function to check localStorage for demo mode state
- Updated `fetchTopicVelocity()` to accept optional `forceDemoMode` parameter
- Updated `fetchTopicSignals()` to accept optional `forceDemoMode` parameter  
- Updated `fetchSentimentAnalysis()` to accept optional `forceDemoMode` parameter
- Each function now checks demo mode and returns mock data instead of making API calls

### 2. Created Mock Data Generator (`/mocks/topic-velocity-data.ts`)
- Created `mockTopicVelocityData()` function that generates realistic topic velocity data
- Created `mockTopicSignalsData()` function that generates topic signal messages
- Created `mockSentimentData()` function that generates sentiment analysis data
- All mock data follows the same format as real API responses

### 3. Updated Components to Use Demo Mode

#### useTemporaryDashboardIntelligence Hook
- Added import for `useDemoMode` context
- Added import for `mockDashboardData`
- Updated to check `isDemoMode` before making API calls
- Returns mock data when in demo mode

#### TopicVelocityChartFullV0 Component
- Added import for `useDemoMode` context
- Pass `isDemoMode` to all `fetchTopicVelocity()` and `fetchTopicSignals()` calls
- Added `isDemoMode` as dependency to useEffect to re-fetch when mode changes

#### Dashboard Page (`app/page.tsx`)
- Updated sentiment analysis fetch to pass `isDemoMode` parameter
- Added `isDemoMode` as dependency to sentiment useEffect

## How It Works

1. **Toggle Switch**: The DataModeToggle component in the header allows users to switch between "Live Data" and "Demo Mode"
2. **State Management**: The DataModeContext provides global state management using React Context
3. **Persistence**: Demo mode preference is saved to localStorage and persists across sessions
4. **Cache Invalidation**: When toggling modes, React Query caches are invalidated to ensure fresh data
5. **Mock Data**: When in demo mode, all API functions return realistic mock data instead of making network requests

## Components Already Using Correct Hooks
- `EpisodeIntelligenceCardsAPI` - Uses useTemporaryDashboardIntelligence
- `ActionableIntelligenceCardsAPI` - Uses useTemporaryDashboardIntelligence
- `AllEpisodesViewAPI` - Uses useAllEpisodesAPI (already updated)

## Testing
To test demo mode:
1. Click the toggle switch in the top right corner of the dashboard
2. When "DEMO" badge appears, all data should be coming from mock sources
3. Check browser network tab - no API calls should be made to external endpoints
4. Toggle back to "Live Data" to resume API calls

## Recent Fixes

### Issue 1: Demo Mode Not Working
**Problem**: When toggling demo mode, API calls were still being made resulting in CORS errors and 500 errors.
**Root Cause**: Components were checking environment variables instead of the context state.
**Fix**: Updated all components to use the `useDemoMode` context:
- Updated `useTemporaryDashboardIntelligence` hook to check `isDemoMode` from context
- Updated `TopicVelocityChartFullV0` to pass `isDemoMode` to all API calls
- Updated sentiment analysis fetch in dashboard page to include `isDemoMode` parameter

### Issue 2: Module Not Found Error
**Problem**: "Module not found: Can't resolve '@/mocks/sentiment-data'"
**Fix**: Corrected import paths to use the consolidated mock data file `@/mocks/topic-velocity-data`

### Issue 3: Sentiment Heatmap No Data
**Problem**: Sentiment heatmap was empty in demo mode due to incompatible data format.
**Fix**: Created separate `mockSentimentData` function in `sentiment-mock-data.ts` that returns data in W1, W2 format expected by the heatmap component.

### Issue 4: All Episodes Modal CORS Errors
**Problem**: Modal was fetching data even when closed, causing unnecessary API calls.
**Fix**: Added `enabled` parameter to `useAllEpisodesAPI` hook to only fetch when modal is open.

### Issue 5: Topic Velocity Chart Broken on 1 Month View
**Problem**: Chart was still making API calls in demo mode for certain time ranges.
**Fix**: Added `enabled: isInitialized && !isDemoMode` check to prevent API calls when in demo mode.

### Issue 6: Race Condition on Hard Refresh
**Problem**: When hard refreshing the page, live data would briefly show before switching to demo mode.
**Root Cause**: Components were fetching data before the context had initialized from localStorage.
**Fix**: 
- Added `isInitialized` flag to `DataModeContext`
- All data-fetching hooks now check `enabled: isInitialized` before making requests
- Components wait for context initialization before rendering data

### Issue 7: Hydration Error
**Problem**: "Hydration failed because the initial UI does not match what was rendered on the server"
**Root Cause**: Accessing localStorage during SSR caused mismatch between server and client.
**Fix**: Moved localStorage read to `useEffect` in `DataModeContext` to ensure it only runs on the client.

### Issue 8: Topic Velocity Chart Data Quality
**Problem**: Mock data didn't show realistic growth patterns for demos.
**Fix**: Updated `mockTopicVelocityData` generator to create realistic growth patterns:
- AI Agents: Exponential growth pattern
- OpenAI: Strong linear growth
- Product Hunt: Seasonal patterns with bursts
- Each topic has unique realistic behavior

## Implementation Details (Complete)

### 1. Context Provider with Hydration Safety (`/contexts/DataModeContext.tsx`)
```typescript
export const DataModeProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Initialize from localStorage after mount to avoid hydration issues
  useEffect(() => {
    const savedMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(savedMode);
    setIsInitialized(true);
  }, []);
```

### 2. Updated API Functions (`/lib/api.ts`)
- Added `isDemoModeFromStorage()` helper for checking localStorage
- All API functions accept optional `forceDemoMode` parameter
- Functions check demo mode and return mock data instead of making network requests

### 3. Mock Data Generators
- `/mocks/topic-velocity-data.ts`: Generates realistic topic velocity data with growth patterns
- `/mocks/sentiment-mock-data.ts`: Generates sentiment data in W1, W2 format
- `/mocks/intelligence-data.ts`: Provides episode intelligence mock data

### 4. Component Updates
- **useTemporaryDashboardIntelligence**: Checks `isDemoMode` and returns mock data
- **useIntelligenceDashboard**: Includes `isDemoMode` in query key and checks context
- **TopicVelocityChartFullV0**: Passes `isDemoMode` to all API calls
- **Dashboard Page**: Waits for `isInitialized` before fetching sentiment data
- **useAllEpisodesAPI**: Accepts `enabled` parameter to prevent unnecessary fetches

## Benefits
- Instant switching between demo and live data without page refresh
- No API calls in demo mode - prevents CORS errors and 500 errors
- Realistic mock data that demonstrates all product features
- Persisted preference across sessions
- Visual indicator when in demo mode
- Lazy loading - components only fetch data when needed
- No race conditions - proper initialization sequence
- SSR-safe - no hydration errors