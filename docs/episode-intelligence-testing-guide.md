# Episode Intelligence API Testing Guide 🧪

## Complete Testing Guide for Episode Intelligence Feature

Welcome! This guide will walk you through testing the Episode Intelligence feature, whether you're a developer, QA tester, or project stakeholder. No prior knowledge of the codebase is required.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Testing with Mock Data](#testing-with-mock-data)
4. [Testing with Live API](#testing-with-live-api)
5. [Feature Testing Checklist](#feature-testing-checklist)
6. [Visual Success Indicators](#visual-success-indicators)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [API Endpoints Reference](#api-endpoints-reference)

---

## 🔧 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
   - Check: Run `node --version` in terminal
   - Install from: https://nodejs.org/

2. **npm** or **yarn** package manager
   - Check: Run `npm --version` or `yarn --version`
   - npm comes with Node.js

3. **Git** (for cloning the repository)
   - Check: Run `git --version`
   - Install from: https://git-scm.com/

4. **A modern web browser** (Chrome, Firefox, Safari, or Edge)

5. **A text editor** (VS Code recommended) - only if you need to modify configuration

---

## 🚀 Initial Setup

### Step 1: Clone the Repository
```bash
git clone [repository-url]
cd podinsight-dashboard
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Environment Configuration
Create a `.env.local` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` with these settings:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false  # Set to 'true' for mock data, 'false' for live API
```

### Step 4: Start the Development Server
```bash
npm run dev
# or
yarn dev
```

The application will start at: **http://localhost:3000**

---

## 🎭 Testing with Mock Data

Mock data is useful for:
- Initial development testing
- Demos without API dependency
- Testing UI behavior with predictable data

### How to Enable Mock Data

1. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

2. Restart the development server:
   ```bash
   # Stop server (Ctrl+C) then:
   npm run dev
   ```

3. Navigate to: **http://localhost:3000/dashboard-api-example**

### What You Should See with Mock Data

✅ **4 Intelligence Cards displaying:**
- Market Signals (Red card)
- Deal Intelligence (Green card)
- Portfolio Pulse (Purple card)
- Executive Brief (Yellow card)

✅ **Each card shows:**
- Icon and title
- Signal count (e.g., "23 new signals today")
- 3 top intelligence items
- "Updated just now" timestamp
- Action button at bottom

✅ **Static behavior:**
- Data never changes
- No loading states
- No API calls in Network tab

---

## 🌐 Testing with Live API

Live API testing verifies:
- Real-time data fetching
- Data transformation
- Error handling
- Auto-refresh functionality

### How to Enable Live API

1. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

2. Restart the development server:
   ```bash
   # Stop server (Ctrl+C) then:
   npm run dev
   ```

3. Navigate to: **http://localhost:3000/dashboard-api-example**

### What You Should See with Live API

✅ **Initial Load:**
- Brief loading skeleton (gray animated cards)
- Then 4 intelligence cards with real data

✅ **Network Activity (Chrome DevTools → Network Tab):**
- Request to: `https://podinsight-api.vercel.app/api/intelligence/dashboard?limit=8`
- Response status: 200 OK
- Response contains episodes with signals

✅ **Auto-Refresh:**
- New request every 60 seconds
- Cards update if new data available
- Check Network tab to verify

---

## ✅ Feature Testing Checklist

### 1. Dashboard Cards Display
- [ ] All 4 cards visible (Market Signals, Deal Intelligence, Portfolio Pulse, Executive Brief)
- [ ] Each card has appropriate icon and color theme
- [ ] Signal counts display correctly
- [ ] "Updated X ago" timestamp shows
- [ ] Cards responsive on mobile/tablet views

### 2. Data Loading
- [ ] Loading skeleton appears briefly on first load
- [ ] No flickering during auto-refresh
- [ ] Smooth transition from loading to loaded state

### 3. Interactions
- [ ] Clicking signal items opens detail modal
- [ ] Modal shows full episode information
- [ ] Modal can be closed (X button or outside click)
- [ ] Hover effects work on cards and items

### 4. Sharing Features (in Modal)
- [ ] "Email Brief" button visible
- [ ] "Share to Slack" button visible
- [ ] Buttons show loading state when clicked
- [ ] Success message appears after sharing

### 5. Error Handling
- [ ] If API is down, error message displays
- [ ] "Retry" button appears on error
- [ ] Graceful degradation (no crashes)

### 6. Performance
- [ ] Page loads in < 3 seconds
- [ ] Smooth scrolling
- [ ] No memory leaks (check after 10+ minutes)

---

## 👁️ Visual Success Indicators

### Successful API Integration Looks Like:

1. **Dashboard View:**
   ```
   🧠 Episode Intelligence
   
   [Market Signals Card]    [Deal Intelligence Card]
   🔴 15 new signals       🟢 8 match your thesis
   • AI Infrastructure...   • Acme.ai - Series A...
   • Series B Valuations... • DataFlow - Seed...
   • Climate Tech...        • CyberShield - Series B...
   
   [Portfolio Pulse Card]   [Executive Brief Card]
   🟣 14 mentions          🟡 5 min digest
   • CloudBase mentioned... • Key Trend: AI...
   • TechCo competitor...   • Action Required...
   • DataPipe featured...   • Portfolio Alert...
   ```

2. **Network Tab Shows:**
   - GET request to `/api/intelligence/dashboard`
   - 200 OK response
   - JSON response with episodes array
   - Subsequent requests every 60 seconds

3. **Console (F12):**
   - No red errors
   - Possible info logs about React Query cache updates

---

## 🔧 Troubleshooting Guide

### Issue: "Failed to load intelligence data"
**Symptoms:** Error message instead of cards
**Solutions:**
1. Check API health: https://podinsight-api.vercel.app/api/health
2. Verify `.env.local` has correct API URL
3. Check browser console for CORS errors
4. Try with mock data to isolate issue

### Issue: Empty Cards (No signals)
**Symptoms:** Cards display but show "No signals available"
**Solutions:**
1. API might be returning empty data
2. Check Network tab response
3. Verify data transformation logic
4. Contact backend team if API returns empty arrays

### Issue: Modal Not Opening
**Symptoms:** Clicking items doesn't open detail view
**Solutions:**
1. Check browser console for JavaScript errors
2. Ensure episodeId is present in data
3. Try hard refresh (Ctrl+Shift+R)

### Issue: Auto-refresh Not Working
**Symptoms:** No new network requests after 60 seconds
**Solutions:**
1. Check if browser tab is active (inactive tabs pause)
2. Verify React Query DevTools show correct intervals
3. Check for JavaScript errors blocking timers

### Issue: CORS Errors
**Symptoms:** Console shows "blocked by CORS policy"
**Solutions:**
1. Ensure using correct API URL
2. Backend may need CORS configuration update
3. Try using proxy in development

---

## 📡 API Endpoints Reference

### Primary Endpoints Used:

1. **Dashboard Intelligence**
   ```
   GET /api/intelligence/dashboard?limit=8
   ```
   Returns top episodes with signals

2. **Episode Brief** (when clicking items)
   ```
   GET /api/intelligence/brief/{episode_id}
   ```
   Returns detailed episode information

3. **Share Intelligence**
   ```
   POST /api/intelligence/share
   Body: {
     episode_id: string,
     method: 'email' | 'slack',
     recipient: string,
     include_summary: boolean
   }
   ```

### API Health Check:
```
https://podinsight-api.vercel.app/api/health
```

---

## 🎯 Quick Test Scenarios

### Scenario 1: Basic Functionality
1. Load page → See 4 cards
2. Wait 60 seconds → See network refresh
3. Click any signal → Modal opens
4. Close modal → Returns to dashboard

### Scenario 2: Error Recovery
1. Disconnect internet
2. Refresh page → See error state
3. Reconnect internet
4. Click retry → Cards load

### Scenario 3: Performance Test
1. Open Network tab
2. Load page
3. Check: Initial request < 2s
4. Monitor: Memory usage stable
5. Verify: 60s refresh working

---

## 📞 Need Help?

If you encounter issues not covered in this guide:

1. Check browser console for detailed errors
2. Review `/docs/episode-intelligence-integration.md` for technical details
3. Contact the development team with:
   - Screenshot of the issue
   - Browser console errors
   - Network tab screenshot
   - Steps to reproduce

---

## 🎉 Success Criteria

Your testing is complete when:
- ✅ All 4 intelligence cards load with data
- ✅ Auto-refresh works (verify in Network tab)
- ✅ Clicking items opens detail modal
- ✅ Sharing buttons show success message
- ✅ No console errors
- ✅ Performance is smooth

Congratulations! The Episode Intelligence feature is working correctly. 🚀