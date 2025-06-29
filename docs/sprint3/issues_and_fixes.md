# Sprint 3 - Issues and Fixes Log

## Purpose
Track problems encountered during Sprint 3 implementation and their solutions.

## Phase 1 Issues (Backend - RESOLVED)

### 1. N+1 Query Pattern in expand_chunk_context
**Issue:** Each chunk expansion created a new MongoDB connection and query  
**Impact:** 10 chunks × 2s = 20s additional latency  
**Temporary Fix:** Disabled expand_chunk_context function  
**Status:** ⚠️ WORKAROUND - Needs permanent fix  
**TODO:** Implement batch query for context expansion

### 2. OpenAI Client Cold Start Timeouts
**Issue:** Module-level client initialization caused Vercel timeouts  
**Impact:** Function timeouts on cold starts  
**Fix:** Implemented lazy initialization pattern  
**Status:** ✅ RESOLVED

### 3. MongoDB ObjectId Serialization
**Issue:** ObjectId objects couldn't be JSON serialized  
**Impact:** API response errors  
**Fix:** Convert ObjectIds to strings before response  
**Status:** ✅ RESOLVED

### 4. Citation Diversity Feature Instability
**Issue:** Multi-episode requirement caused unpredictable results  
**Impact:** Inconsistent answer quality  
**Fix:** Feature temporarily disabled  
**Status:** ⚠️ REVERTED - Needs redesign

## Phase 2 Issues (Frontend - RESOLVED)

### UI/UX Issues

#### 1. Background Blur Performance
**Issue:** Background blur effect could cause lag on older devices  
**Impact:** Potential performance degradation  
**Fix:** Used CSS `will-change` and GPU acceleration  
**Status:** ✅ RESOLVED - Smooth performance achieved

#### 2. Modal Escape Key Conflict
**Issue:** ESC key could conflict with other modal components  
**Impact:** Unexpected closing behavior  
**Fix:** Proper event propagation handling  
**Status:** ✅ RESOLVED

#### 3. Scroll Hide/Show Jitter
**Issue:** Rapid scrolling could cause command bar to flicker  
**Impact:** Poor visual experience  
**Fix:** Debounced scroll detection with proper thresholds  
**Status:** ✅ RESOLVED

### Component Integration Issues

#### 1. Mock Data Override
**Issue:** Need to switch between mock and real API during development  
**Impact:** Testing difficulty  
**Fix:** Created toggle system with fetch override  
**Status:** ✅ RESOLVED

#### 2. Confidence Score Missing
**Issue:** Backend doesn't provide confidence scores  
**Impact:** UI expects confidence percentage  
**Fix:** Created heuristic calculation based on citations  
**Status:** ✅ RESOLVED

#### 3. Response Format Mismatch
**Issue:** Backend format differs from component interfaces  
**Impact:** Data binding errors  
**Fix:** Created transformApiResponse function  
**Status:** ✅ RESOLVED

### Performance Considerations

#### 1. Cold Start UX
**Issue:** 15-20s cold starts create poor user experience  
**Impact:** Users might think app is broken  
**Fix:** Added "AI waking up" message after 5s  
**Status:** ✅ MITIGATED

#### 2. Search Debouncing
**Issue:** Every keystroke could trigger API call  
**Impact:** Excessive API usage  
**Fix:** 500ms debounce on search input  
**Status:** ✅ RESOLVED

#### 3. Animation Performance
**Issue:** Complex animations could lag on mobile  
**Impact:** Janky user experience  
**Fix:** Simplified animations, used transform/opacity only  
**Status:** ✅ RESOLVED

## Common Solutions Reference

### Vercel Timeout Management
- Keep all operations under 30s total
- Disable retry logic to prevent timeout multiplication
- Use lazy initialization for external clients

### MongoDB Performance
- Increase numCandidates for better recall (20 → 100)
- Batch queries when possible
- Use connection pooling

### OpenAI Integration
- Use gpt-4o-mini (only available model)
- Set temperature to 0 for consistency
- Max tokens: 80 for 2-sentence limit

Last Updated: June 28, 2025