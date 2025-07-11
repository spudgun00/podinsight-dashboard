# Modal.com Prewarming - Testing Guide

## Quick Test Steps

### 1. Open Browser DevTools
- Press F12 or right-click → Inspect
- Open both **Network** and **Console** tabs

### 2. Trigger the Search Modal
- Click the floating brain button (🧠) in the bottom-right corner
- This opens the AI search modal

### 3. Check for Prewarming
In the **Network** tab, you should see:
- A POST request to `https://podinsight-api.vercel.app/api/prewarm`
- Status: 200 OK

In the **Console** tab, you should see:
```
Search modal opened. Pre-warming backend...
Search prewarm successful
```

### 4. Test the Cooldown
- Close the modal (ESC or click outside)
- Immediately reopen it
- In Console, you should see: `Prewarm cooldown active. Next in 175s` (or similar)
- This prevents excessive prewarming requests

### 5. Test Search Performance
- Type a query like "AI valuations"
- Submit with Enter
- The search should be fast (no 18-second delay!)

## What's Happening Behind the Scenes

1. **When you open the search modal**, it immediately calls the backend to "wake up" Modal.com
2. **While you type your query** (3-5 seconds), Modal.com is warming up in the background
3. **When you submit**, Modal is already warm and responds quickly
4. **Cost savings**: ~$80-90/month vs keeping Modal warm 24/7

## Success Indicators

✅ Network shows POST to `/api/prewarm` when modal opens  
✅ Console shows "Pre-warming backend..." message  
✅ Search results appear quickly (2-3 seconds, not 18+)  
✅ Cooldown prevents repeated prewarm requests  

## Troubleshooting

If prewarming isn't working:
- Check if the API URL is correct in Network tab
- Look for any red errors in Console
- Ensure you're on the production site, not localhost
- Try clearing sessionStorage and refreshing

## Technical Details

- **Component**: `ai-search-modal-enhanced.tsx`
- **Cooldown**: 3 minutes (stored in sessionStorage)
- **API Endpoint**: `POST /api/prewarm`
- **Cost**: ~$5-10/month (vs $50-100/month for always-on)