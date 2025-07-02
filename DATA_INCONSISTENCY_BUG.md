# Data Inconsistency Bug Report

## Issue Summary
The Topic Velocity API returns different mention counts for the same week depending on the number of weeks requested, causing UI inconsistencies between time range and quarterly views.

## Reproduction Steps
1. Navigate to the dashboard
2. Select "3M" time range view
3. Note the mention count for DePIN in W15 (shows 0 mentions)
4. Switch to "Quarters" view and select Q2
5. Note the mention count for DePIN in W15 (shows 1 mention)
6. The same week displays different values in different views

## Technical Analysis

### Root Cause
The dashboard makes parallel API calls with different time windows:
```javascript
fetchTopicVelocity(4, DEFAULT_TOPICS),   // 1M view - 4 weeks
fetchTopicVelocity(12, DEFAULT_TOPICS),  // 3M view - 12 weeks  
fetchTopicVelocity(24, DEFAULT_TOPICS),  // 6M view - 24 weeks
fetchTopicVelocity(52, DEFAULT_TOPICS)   // Year data - 52 weeks (used for quarters)
```

The quarterly view filters data from the 52-week dataset, while time range views use their specific datasets. The backend API returns different values for the same week in different datasets.

### Debug Logging Added
Debug logging has been added to `components/dashboard/topic-velocity-chart-full-v0.tsx` (lines 621-634) to capture raw API responses. To collect evidence:

1. Open browser developer console
2. Navigate to the dashboard
3. Look for logs starting with "🔍 DEBUG"
4. Compare the W15 data between 3M and Year datasets

## Impact
- **User Trust**: Inconsistent data erodes confidence in the platform
- **Analysis Accuracy**: Users may make incorrect decisions based on conflicting data
- **UI Confusion**: The same time period shows different values in different views

## Recommended Solution
This must be fixed in the backend API to ensure consistent data regardless of the requested time window. The API should return the same mention count for a specific week regardless of whether it's part of a 12-week or 52-week query.

## Temporary Workaround (NOT RECOMMENDED)
While waiting for a backend fix, we could:
1. Always fetch the full 52-week dataset and filter client-side
2. This would ensure consistency but has significant downsides:
   - Performance impact (downloading unnecessary data)
   - Increased bandwidth usage
   - Masks the underlying data integrity issue

## Next Steps
1. Collect raw API response logs using the debug code
2. File bug report with backend team including:
   - This documentation
   - Raw API response evidence
   - Clear reproduction steps
3. Do NOT implement frontend workarounds - fix at the source