# PodInsightHQ Documentation

## Project Overview
PodInsightHQ is a podcast intelligence platform that helps VCs and founders discover insights from 1,171 episodes across 29 top podcasts.

## Documentation Structure

### 📁 Sprint 3 - Command Bar & Search
**Current Sprint** - Implementing conversational search interface

- [Sprint 3 Index](./sprint3/INDEX.md) - Complete Sprint 3 documentation
- [Current Status](./sprint3/SPRINT3_TESTING_HANDOVER_V2.md) - Latest testing progress (50% complete)
- [Implementation Guide](./sprint3/sprint3-command-bar-playbookv2.md) - Technical playbook

### 📁 Architecture Documentation
- [Database Architecture](../DATABASE_ARCHITECTURE.md) - MongoDB schema and indexes
- [Sentiment Analysis](../SENTIMENT_ANALYSIS_DOCUMENTATION.md) - Sentiment heatmap implementation

### 📁 Sprint History
- [Sprint 1 Phase 3 Log](../SPRINT1_PHASE3_LOG.md) - Enhanced visualizations
- [Sprint Log](../SPRINT_LOG.md) - Overall sprint history

## Quick Links

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test:unit

# Run specific test file
npm run test:unit -- search-command-bar.test.tsx
```

### Key Components
- **Command Bar**: `/components/dashboard/search-command-bar.tsx`
- **Dashboard**: `/app/page.tsx`
- **API Integration**: `/lib/api.ts`

### Test Resources
- **Test Page**: http://localhost:3001/test-command-bar
- **Mock API**: `/lib/mock-api.ts`
- **Test Suite**: `/components/dashboard/__tests__/`

## Current Sprint Status (June 29, 2025)

### Sprint 3 Phase 2 - Testing
- ✅ Component implementation complete
- 🚧 Testing: 8/16 tests passing (50%)
- 🔧 Blocker: Keyboard focus tests (ref issues in jsdom)
- 📅 Next: Debug refs, complete API tests, Cypress E2E

## Repository Structure
```
podinsight-dashboard/
├── app/                    # Next.js app directory
├── components/             # React components
│   └── dashboard/         # Dashboard components
├── docs/                  # Documentation
│   └── sprint3/          # Sprint 3 docs
├── lib/                   # Utilities and API
├── public/               # Static assets
└── tests/               # Test files
```

## Contact & Support
- Repository: https://github.com/spudgun00/podinsight-dashboard
- Issues: Use GitHub issues for bug reports