# Timestamp NaN:NaN Fix

## Issue
The View Intel Brief modal was showing "NaN:NaN" for all timestamps because the API was not providing timestamp values (they were null or undefined).

## Solution
Updated the API converter to:

1. **Handle missing timestamps gracefully**
   - If timestamp is null/undefined, generate timestamps automatically
   - Distribute signals evenly throughout the episode duration
   - Log warnings when timestamps are missing

2. **Improved timestamp parsing**
   - Handle string timestamps by converting to numbers
   - Check for NaN values and provide defaults
   - Add debug logging to track timestamp issues

## Code Changes

### `/lib/api-to-detailed-episode-converter.ts`
```typescript
// Generate timestamps when missing
if (timestamp === undefined || timestamp === null || isNaN(Number(timestamp))) {
  // Distribute signals evenly throughout the episode
  const spacing = episodeDurationSeconds / (apiEpisode.signals.length + 1);
  timestamp = spacing * (index + 1);
}
```

## Expected Behavior
- If API provides timestamps: Use them and convert from seconds to MM:SS format
- If API doesn't provide timestamps: Generate evenly spaced timestamps based on episode duration
- Console will log warnings when timestamps are missing (check browser console)

## Testing
1. Open the View Intel Brief modal
2. Timestamps should now show as proper MM:SS format (e.g., "12:34")
3. Check browser console for any timestamp-related warnings
4. If episode duration is 60 minutes and there are 6 signals, they'll be spaced at ~10-minute intervals

## Note
This is a temporary fix. The backend API should ideally provide actual timestamps for each signal based on when they occur in the episode.