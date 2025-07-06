# Sprint 4 - Episode Intelligence: Next Steps

## Current State
✅ **Story 3 (Dashboard Component Implementation) - COMPLETE**
- All UI components integrated and functional with mock data
- TypeScript errors resolved
- Ready for backend integration

## Immediate Next Steps (Priority Order)

### 1. Backend Stories (Parallel Development)
These can be worked on simultaneously by the backend team:

#### Story 1: Signal Extraction Engine
**Repository**: podinsight-etl
**Tasks**:
- Implement GPT-4o mini integration for signal extraction
- Create signal categorization logic (investable, competitive, portfolio, soundbites)
- Process existing MongoDB transcript chunks
- Output format matching the Episode interface

#### Story 2: Relevance Scoring System  
**Repository**: podinsight-etl
**Tasks**:
- Implement scoring algorithm (0-100 scale)
- Weight factors: keyword intensity, recency, authority, personalization
- Set display thresholds (90+ red_hot, 70-89 high_value, etc.)

#### Story 5: MongoDB Schema & API
**Repository**: podinsight-api
**Tasks**:
- Create `episode_intelligence` collection schema
- Create `user_intelligence_prefs` collection
- Build API endpoints:
  - GET /api/v1/intelligence/episodes (paginated)
  - GET /api/v1/intelligence/episodes/:id
  - POST /api/v1/intelligence/preferences
  - GET /api/v1/intelligence/brief/:episodeId

### 2. Frontend-Backend Integration (After Backend Ready)
**Repository**: podinsight-dashboard
**Tasks**:
- Replace mock data imports with API calls
- Implement data fetching hooks
- Add loading states
- Add error handling
- Connect search/filter functionality

### 3. Feature Enhancements

#### Search & Filter Implementation
```typescript
// In episode-intelligence-cards.tsx
const handleSearch = (query: string) => {
  // Filter episodes based on title, podcast, intel points
}

const handleFilterChange = (filterType: string, value: string) => {
  // Apply filters to episode list
}
```

#### Audio Clip Integration
- Use existing Lambda function from Sprint 3
- Add audio player component to intelligence brief
- Generate 30-second clips for each signal

#### Sharing Features
- Email brief endpoint (POST /api/v1/intelligence/share/email)
- Slack webhook integration
- Copy to clipboard functionality

### 4. Performance Optimization

#### Caching Strategy
- Implement React Query or SWR for data fetching
- Cache episode data for 5 minutes
- Pre-fetch next page of episodes
- Optimize re-renders with React.memo

#### Code Splitting
```typescript
// Lazy load heavy components
const IntelligenceBriefModal = lazy(() => import('./IntelligenceBriefModal'))
const AllEpisodesView = lazy(() => import('./AllEpisodesView'))
```

### 5. Testing & Quality Assurance

#### Unit Tests
- Test signal scoring algorithm
- Test filtering logic
- Test sorting functionality

#### Integration Tests
- Test API endpoints
- Test data flow from MongoDB to UI
- Test audio clip generation

#### E2E Tests
- User journey: View episodes → Click card → View brief → Share
- Test responsive design on different devices
- Performance testing with 100+ episodes

## Sprint 4 Timeline Estimate

### Week 1 (Backend Development)
- Day 1-2: MongoDB Schema (Story 5A)
- Day 2-4: Signal Extraction (Story 1)
- Day 3-5: Scoring Engine (Story 2)

### Week 2 (Integration)
- Day 6-7: API Endpoints (Story 5B)
- Day 8-10: Processing Pipeline (Story 6)

### Week 3 (Frontend Integration)
- Day 11-12: Connect frontend to APIs
- Day 13: Search/filter implementation
- Day 14-15: Audio integration & sharing

### Week 4 (Testing & Launch)
- Day 16-18: Testing & bug fixes
- Day 19-20: Beta user onboarding (Story 7)

## Technical Debt to Address

1. **ESLint Warnings**: Fix unescaped entities in other components
2. **Type Safety**: Add stricter types for API responses
3. **Accessibility**: Add ARIA labels to interactive elements
4. **Documentation**: Add JSDoc comments to components

## Success Criteria

### Technical
- [ ] All API endpoints return data in < 200ms
- [ ] Episode processing completes in < 5 minutes
- [ ] Dashboard loads in < 500ms
- [ ] Zero TypeScript errors
- [ ] 80%+ test coverage

### Business
- [ ] 10 beta users onboarded
- [ ] 85% daily active usage
- [ ] Users save 14+ hours/week
- [ ] NPS score 50+

## Resources Needed

### Backend
- OpenAI API key for GPT-4o mini
- MongoDB connection string
- AWS Lambda permissions

### Frontend
- API endpoint documentation
- Design assets for sharing features
- Beta user list

## Questions for Product Team

1. Should we prioritize search/filter or audio clips first?
2. What's the preferred email service for brief sharing?
3. Do we need admin controls for signal threshold adjustment?
4. Should we track which briefs are viewed/shared?

---

**Next Session Focus**: Backend API integration once Stories 1, 2, and 5 are complete.

*Document created: 2025-07-05*
*Sprint 4, Story 3: Frontend COMPLETE ✅*