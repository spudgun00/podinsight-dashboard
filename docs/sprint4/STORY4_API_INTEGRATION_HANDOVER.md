# Story 4: Episode Intelligence API Integration - Complete Handover Document

## 🎯 Overview
This document provides complete instructions for testing the Episode Intelligence API integration completed on 2025-07-08. Story 4 successfully connected the frontend dashboard cards (Story 3) with the backend API endpoints (Story 5b).

## 📋 What Was Built

### Core Components Created
1. **API-Connected Dashboard** - Live data version of Episode Intelligence cards
2. **Data Transformation Layer** - Converts episode data to card format
3. **React Query Integration** - 60-second auto-refresh with caching
4. **Intelligence Brief Modal** - Detailed episode view with sharing
5. **Comprehensive Documentation** - Testing guide and technical docs

### Key Files to Review
- **Testing Guide**: `/docs/episode-intelligence-testing-guide.md` - START HERE!
- **Technical Docs**: `/docs/episode-intelligence-integration.md`
- **API Reference**: `/docs/master-api-reference.md`
- **Sprint Log**: `/docs/sprint4/SPRINT4_LOG.md` (see Session 10)

## 🚀 Quick Start Testing

### Prerequisites
1. Node.js 18+ installed
2. npm or yarn package manager
3. Git installed
4. Modern web browser

### Setup Steps
```bash
# 1. Clone repository (if not already done)
git clone https://github.com/spudgun00/podinsight-dashboard.git
cd podinsight-dashboard

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env.local

# 4. Start development server
npm run dev
```

### Testing Scenarios

#### 1. Test with Mock Data (No API Required)
```bash
# Edit .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app

# Restart server and visit
http://localhost:3000/dashboard-api-example
```

**What to Verify:**
- 4 intelligence cards display immediately
- Static data (never changes)
- Click any signal to open detail modal
- No network requests in DevTools

#### 2. Test with Live API
```bash
# Edit .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app

# Restart server and visit
http://localhost:3000/dashboard-api-example
```

**What to Verify:**
- Loading skeleton appears briefly
- 4 cards populate with real data
- Network tab shows API call to `/api/intelligence/dashboard`
- Data refreshes every 60 seconds
- Click signals to see episode details

## 🔍 What to Test

### Feature Checklist
- [ ] **Dashboard Cards**
  - [ ] Market Signals (red) - shows investable opportunities
  - [ ] Deal Intelligence (green) - shows specific deals
  - [ ] Portfolio Pulse (purple) - competitive/portfolio mentions
  - [ ] Executive Brief (yellow) - key soundbites

- [ ] **Data Loading**
  - [ ] Skeleton loader appears on first load
  - [ ] Smooth transition to loaded state
  - [ ] No flickering during refresh

- [ ] **Interactions**
  - [ ] Click any signal item → modal opens
  - [ ] Modal shows full episode details
  - [ ] Close modal (X button or outside click)
  - [ ] "Email Brief" button in modal
  - [ ] "Share to Slack" button in modal

- [ ] **Auto-Refresh**
  - [ ] Check Network tab after 60 seconds
  - [ ] New request to `/api/intelligence/dashboard`
  - [ ] Cards update if new data available

- [ ] **Error Handling**
  - [ ] Stop API/disconnect internet
  - [ ] Error message displays gracefully
  - [ ] "Retry" button appears

## 📊 Understanding the Data Flow

### API → UI Transformation
The API returns episodes with signals, but UI needs cards by category:

```
API Response:                    UI Cards:
Episode 1:                       Market Signals:
  - investable signal     →        - Signal from Episode 1
  - competitive signal             - Signal from Episode 3
  
Episode 2:                       Deal Intelligence:
  - portfolio signal       →        - Signal from Episode 1
                                   - Signal from Episode 2
Episode 3:
  - sound_bite signal      →     Portfolio Pulse:
  - investable signal              - Signal from Episode 2
                                   
                                 Executive Brief:
                                   - Signal from Episode 3
```

### Urgency Levels
- **Critical** (red, pulsing) - confidence > 0.8
- **High** (yellow) - confidence 0.6-0.8  
- **Normal** (green) - confidence < 0.6

## 🛠️ Troubleshooting

### Common Issues

1. **"Failed to load intelligence data"**
   - Check API health: https://podinsight-api.vercel.app/api/health
   - Verify `.env.local` has correct API URL
   - Check browser console for errors

2. **Empty Cards**
   - API might return no signals
   - Check Network response in DevTools
   - Try mock data to isolate issue

3. **Modal Not Opening**
   - Check console for JavaScript errors
   - Ensure episodeId exists in data
   - Hard refresh browser (Ctrl+Shift+R)

4. **No Auto-Refresh**
   - Browser tab must be active
   - Check for JavaScript errors
   - Verify React Query is working

## 📁 Project Structure

```
podinsight-dashboard/
├── app/
│   ├── dashboard-api-example/    # Test page for API integration
│   └── layout.tsx               # Added QueryProvider wrapper
├── components/dashboard/
│   ├── actionable-intelligence-cards-api.tsx  # API version
│   ├── actionable-intelligence-cards.tsx      # Original mock version
│   ├── intelligence-brief-modal.tsx           # Detail modal
│   └── intelligence-skeleton.tsx              # Loading state
├── hooks/
│   └── useIntelligenceDashboard.ts   # React Query hook
├── types/
│   └── intelligence.ts               # TypeScript interfaces
├── utils/
│   └── intelligence-transformer.ts   # Data transformation
└── providers/
    └── query-provider.tsx           # React Query setup
```

## 🔗 Related Documentation

1. **Comprehensive Testing Guide**: `/docs/episode-intelligence-testing-guide.md`
   - Detailed step-by-step instructions
   - Visual success indicators
   - Complete troubleshooting

2. **Technical Integration Docs**: `/docs/episode-intelligence-integration.md`
   - API endpoint details
   - Data transformation logic
   - Configuration options

3. **API Reference**: `/docs/master-api-reference.md`
   - All Episode Intelligence endpoints
   - Request/response formats
   - Authentication details

4. **Sprint 4 Log**: `/docs/sprint4/SPRINT4_LOG.md`
   - Session 10 contains implementation details
   - Technical decisions documented

## ✅ Definition of Done

Story 4 is complete when:
- [ ] Dashboard loads with live API data
- [ ] 60-second refresh working
- [ ] Click-through to episode details works
- [ ] Sharing buttons show success message
- [ ] Mock data flag switches between modes
- [ ] No console errors
- [ ] Documentation reviewed

## 🚨 Important Notes

1. **Mock Data Flag**: The `NEXT_PUBLIC_USE_MOCK_DATA` environment variable controls whether to use mock data (true) or live API (false)

2. **API Authentication**: Currently disabled per Story 5b requirements. Will need updating when auth is implemented.

3. **Sharing Features**: Email/Slack sharing is simulated - shows success but doesn't actually send.

4. **Test Both Modes**: Always test with both mock data and live API to ensure both paths work.

## 📞 Support

If you encounter issues:
1. First check `/docs/episode-intelligence-testing-guide.md`
2. Review console errors and network tab
3. Try mock data mode to isolate API issues
4. Check the Sprint 4 log for implementation details

---

**Last Updated**: 2025-07-08
**Story Status**: ✅ COMPLETED
**Next Steps**: Test thoroughly, then proceed with Stories 6-7 (Pipeline Integration & Beta Testing)