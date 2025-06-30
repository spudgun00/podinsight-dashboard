# Running the Dashboard in a Separate Terminal

## Why Use a Separate Terminal?
- Easier to see server logs and browser console separately
- Can restart the server without losing console output
- Better for debugging when you need to see both outputs

## Step 1: Start the Server

Open a new terminal window and run:

```bash
cd /Users/jamesgill/PodInsights/podinsight-dashboard
npm run dev
```

The server will start on:
- http://localhost:3000 (or http://localhost:3001 if 3000 is busy)

Keep this terminal open to see server logs.

## Step 2: Open Browser and Test

1. Open Chrome browser
2. Navigate to: http://localhost:3001/test-command-bar
3. Open Developer Tools:
   - Press F12 or right-click → Inspect
   - Go to Console tab

## Step 3: Test Audio Playback

1. Search for "AI agents"
2. Hover over the results (this triggers prefetch)
3. Click play button
4. Watch both terminals:
   - **Browser Console**: Shows `[Audio Debug]` and `[Audio Error]` messages
   - **Server Terminal**: Shows API requests and any server errors

## Known Issue: Mock Fetch Intercepting Audio Calls

The test page has a `mockFetch` that's intercepting audio API calls. This needs to be fixed to allow real audio requests through.

## Running Server in Background (Optional)

If you prefer to run the server in background:

```bash
# Start in background, save logs to file
npm run dev > server.log 2>&1 &

# Watch the logs in real-time
tail -f server.log

# Find the process ID
ps aux | grep "next dev"

# Stop the server
kill <PID>
```

## Quick Commands Reference

```bash
# Terminal 1 - Server
cd /Users/jamesgill/PodInsights/podinsight-dashboard
npm run dev

# Terminal 2 - Monitor logs (if running in background)
tail -f server.log

# Terminal 3 - Quick tests
curl http://localhost:3001/api/v1/audio_clips/test?start_time_ms=0
```