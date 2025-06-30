# How to Run Dashboard and Search Bar

## Quick Start

### 1. Start the Development Server
```bash
cd /Users/jamesgill/PodInsights/podinsight-dashboard
npm run dev
```

The server will start on port 3000:
- Local: http://localhost:3000
- Network: http://0.0.0.0:3000

**Note:** If port 3000 is in use, the server will automatically use port 3001 instead:
- Local: http://localhost:3001
- Network: http://0.0.0.0:3001

### 2. Access the Dashboard

#### Main Dashboard (with integrated Search Command Bar)
- URL: **http://localhost:3000** (or http://localhost:3001 if port 3000 is in use)
- The search bar is now integrated at the top of the dashboard
- Use keyboard shortcuts:
  - Press `/` to focus the search
  - Press `⌘K` (Mac) or `Ctrl+K` (Windows) to focus the search

#### Test Page (with mock data toggle)
- URL: **http://localhost:3000/test-command-bar** (or http://localhost:3001/test-command-bar)
- Has a toggle to switch between real API and mock data
- Useful for testing without API delays

## How to Use the Search Command Bar

1. **Activate Search**:
   - Click on the search bar, OR
   - Press `/` anywhere on the page, OR
   - Press `⌘K` (Mac) / `Ctrl+K` (Windows)

2. **Search Requirements**:
   - Type at least 4 characters to trigger a search
   - Search has a 500ms debounce (waits for you to stop typing)
   - First search may take 15-20 seconds (cold start)

3. **Search Results**:
   - Shows AI-synthesized answer (2 sentences)
   - Displays confidence score (30-99%)
   - Lists source citations with timestamps
   - Click on sources to explore further

## Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill any existing process on port 3000
kill -9 <PID>
```

### Can't Connect to localhost:3000
1. **Try alternative URLs**:
   - http://127.0.0.1:3000
   - http://0.0.0.0:3000

2. **Check firewall/security software**:
   - May be blocking localhost connections
   - Add exception for Node.js

3. **Clear browser cache**:
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### Server Running but Page Not Loading
```bash
# Check server logs
tail -f /tmp/nextjs.log  # If running in background

# Restart the server
npm run dev
```

### Search Not Working
1. **Check API endpoint**:
   - Endpoint: POST `/api/search`
   - Requires: `{ query: string, limit: 10 }`

2. **Use mock data** (on test page):
   - Toggle "Use Mock Data" switch
   - Avoids API cold start delays

3. **Check browser console** for errors:
   - Open DevTools: `F12` or right-click → Inspect
   - Look for red error messages

### Known Issues

1. **Search Timeouts**:
   - **Problem**: Some queries (e.g., "startup funding") timeout after 30 seconds
   - **Cause**: Backend OpenAI synthesis takes too long with retries
   - **Solution**: The frontend now caches results (5-min TTL) and shows fallback UI with raw results
   - **Status**: Awaiting backend fix (see `/docs/sprint3/API_TIMEOUT_INVESTIGATION.md`)

2. **Audio Playback Issues**:
   - **Problem**: Play buttons may not work or timeout
   - **Cause**: Backend audio clip generation can be slow
   - **Solution**: Audio proxy now has 10-second timeout
   - **Debug**: Check console for `[Audio Debug]` and `[Audio Error]` messages
   - **Test with**: Search for "AI agents" (known to work)

3. **Cold Start Delays**:
   - **Problem**: First search can take 15-20 seconds
   - **Cause**: Backend services need to warm up
   - **Solution**: UI shows appropriate loading messages after 5 seconds

## Running in Background

If you need the server to run in background:
```bash
# Start in background
npm run dev > /tmp/nextjs.log 2>&1 &

# Check logs
tail -f /tmp/nextjs.log

# Find the process
ps aux | grep "next dev"

# Stop the server
kill <PID>
```

## Environment Requirements

- Node.js 18+
- npm or yarn
- Chrome browser (MVP is Chrome-only)
- `.env.local` file with API keys (if using real API)

## File Locations

- **Main Dashboard**: `/app/page.tsx`
- **Search Component**: `/components/dashboard/search-command-bar.tsx`
- **Test Page**: `/app/test-command-bar/page.tsx`
- **Mock API**: `/lib/mock-api.ts`
- **Real API**: `/lib/api.ts`

## Next Steps

1. Test the search functionality
2. Run component tests: `npm run test:unit`
3. Check test results in `/sprint3/test_results_chrome.md`
4. Review Sprint 3 documentation in `/sprint3/` folder