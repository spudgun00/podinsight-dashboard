# View Intel Brief Modal - API Integration

## Summary of Changes

### 1. Created API Data Converter
- **File**: `/lib/api-to-detailed-episode-converter.ts`
- Converts `APIEpisode` format from the API to `DetailedEpisode` format expected by the modal
- Groups signals by type (investable, competitive, portfolio, sound_bite)
- Converts timestamps from seconds to "MM:SS" format
- Parses portfolio mentions to extract company names and context
- Adds sentiment detection for portfolio mentions
- Generates use cases for soundbites

### 2. Updated Dashboard Page
- **File**: `/app/page.tsx`
- Added async handling for the View Intel Brief button click
- Fetches detailed episode data from API when modal is opened
- Shows loading spinner while fetching data
- Falls back to direct conversion if API fetch fails
- Handles both API episodes and mock episodes seamlessly

### 3. Modal Integration
- **File**: `/components/intelligence/IntelligenceBriefModal.tsx`
- Updated audio URL generation to use episode ID
- Fixed TypeScript types and lint errors
- Modal now works with real API data

## API Data Flow

```
1. User clicks "View Intel Brief" on episode card
2. handleViewBriefClick() is called with APIEpisode data
3. fetchAndConvertEpisodeBrief() fetches full episode details from API
4. API data is converted to DetailedEpisode format
5. Modal opens with properly formatted data
6. Audio clips use episode ID for playback
```

## Key Features Working

✅ Dashboard cards show real API data
✅ View Intel Brief button opens modal with API data
✅ Signals are properly grouped by type
✅ Timestamps are formatted correctly
✅ Portfolio mentions show company names
✅ Loading state while fetching data
✅ Fallback to direct conversion if API fails

## Audio Integration

The modal generates audio URLs in the format:
```
/api/v1/audio_clips/{episode_id}?timestamp={timestamp}
```

This matches the Sprint 3 audio infrastructure pattern.

## Testing

To test the integration:
1. Ensure API is returning episodes with intelligence data
2. Click "View Intel Brief" on any episode card
3. Modal should show loading spinner briefly
4. Modal should display with properly grouped signals
5. Audio playback buttons should be functional

## Notes

- The converter handles missing data gracefully
- Sentiment detection is keyword-based for portfolio mentions
- Soundbite use cases are determined by content analysis
- All TypeScript types are properly aligned