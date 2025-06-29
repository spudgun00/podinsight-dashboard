# Sprint 3 Architecture Updates

## Purpose
Document all architectural changes and design decisions made during Sprint 3.

> **⚠️ UPDATE**: This document now includes Phase 1B (Answer Synthesis) implementation details and critical performance fixes applied during Sprint 3.

---

## Phase 1A: Audio Clip Generation Architecture

### New Components

#### 1. Audio Clip Lambda Function
**Purpose**: Generate 30-second audio clips on demand
**Technology**: Python + FFmpeg Lambda Layer
**Triggers**: API Gateway HTTP request
**Configuration**:
- Memory: 512MB
- Timeout: 300 seconds (5 minutes)
- Environment Variables:
  - `S3_SOURCE_BUCKET`: pod-insights-raw
  - `S3_CLIPS_BUCKET`: pod-insights-clips
  - `MONGODB_URI`: Connection string

#### 2. S3 Bucket Structure
**New Bucket**: `pod-insights-clips`
```
pod-insights-clips/
└── audio_clips/
    └── {episode_id}/
        └── {chunk_index}.mp3
```

**Bucket Policies**:
- Public read access for generated clips
- CloudFront distribution for CDN
- Lifecycle policy: Archive after 90 days

#### 3. API Endpoint
**Path**: `/api/generate-audio-clip`
**Method**: POST
**Request Body**:
```json
{
  "episode_id": "guid-string",
  "chunk_index": 123
}
```
**Response**:
```json
{
  "audio_url": "https://clips.podinsighthq.com/audio_clips/{episode_id}/{chunk_index}.mp3",
  "duration": 30,
  "cached": false
}
```

### Database Schema Updates

#### MongoDB - New Collection: `audio_clips`
```javascript
{
  _id: ObjectId(),
  episode_id: "guid-string",
  chunk_index: 123,
  s3_url: "s3://pod-insights-clips/audio_clips/{episode_id}/{chunk_index}.mp3",
  public_url: "https://clips.podinsighthq.com/...",
  duration_seconds: 30,
  start_time: 145.5,
  end_time: 175.5,
  generated_at: ISODate(),
  file_size_bytes: 480000,
  processing_time_ms: 2340
}
```

### Integration Points

#### 1. Search API Enhancement
Update search results to include audio clip availability:
```javascript
{
  // Existing fields...
  "audio_clip": {
    "available": true,
    "url": "https://clips.podinsighthq.com/...",
    "duration": 30
  }
}
```

#### 2. Caching Strategy
- Check MongoDB `audio_clips` collection first
- If exists and S3 file valid, return cached URL
- If not, generate new clip and store reference

### Security Considerations

1. **API Rate Limiting**:
   - 10 requests per minute per IP
   - 100 requests per hour per user

2. **Authentication**:
   - API key required for clip generation
   - Public read access for generated clips

3. **Input Validation**:
   - Validate episode_id exists in database
   - Validate chunk_index is within episode bounds

### Performance Optimizations

1. **Lambda Layers**:
   - FFmpeg binary as Lambda layer
   - Boto3 and PyMongo pre-installed

2. **S3 Transfer Acceleration**:
   - Enable for faster uploads from Lambda

3. **CloudFront CDN**:
   - Cache clips at edge locations
   - 24-hour TTL for generated clips

### Monitoring & Logging

1. **CloudWatch Metrics**:
   - Lambda invocation count
   - Error rate
   - Average processing time
   - S3 storage usage

2. **Application Logs**:
   - Clip generation requests
   - Cache hit/miss ratio
   - Error details

### Cost Estimates

**Monthly Costs (estimated)**:
- Lambda executions: $5-10
- S3 storage (1TB): $23
- CloudFront CDN: $10-20
- Data transfer: $5-10
- **Total**: ~$43-73/month

### Future Considerations

1. **Batch Pre-generation**:
   - Consider pre-generating popular clips
   - ML model to predict high-demand clips

2. **Alternative Formats**:
   - Support for different durations (15s, 60s)
   - Video clip generation for YouTube podcasts

3. **Advanced Features**:
   - Waveform visualization
   - Transcript overlay on audio player

---

## Phase 1B: AI Answer Synthesis Architecture

### New Components

#### 1. OpenAI Integration Module
**Purpose**: Generate 2-sentence summaries from search results
**Technology**: OpenAI API with GPT-4o-mini model
**Location**: `/api/synthesis.py`
**Configuration**:
- Model: `gpt-4o-mini` (only model available with current API key)
- Temperature: 0 (deterministic output)
- Max tokens: 80
- Input context: ~1000 tokens (10 chunks)
- Retry attempts: 0 (disabled to prevent timeout multiplication)

#### 2. Enhanced Search Endpoint
**Path**: `/api/search`
**Method**: POST
**Enhancements**:
- Synthesis integration with graceful degradation
- Answer object added to response
- Processing time tracking
- Debug mode for troubleshooting

**Response Structure**:
```json
{
  "answer": {
    "text": "AI valuations are increasingly influenced by rapid advancements in technology and competitive landscape¹². VCs emphasize the need for robust business models to justify high valuations⁴.",
    "citations": [
      {
        "index": 1,
        "episode_id": "abc123",
        "episode_title": "AI Bubble Discussion",
        "podcast_name": "All-In",
        "timestamp": "27:04",
        "start_seconds": 1624,
        "chunk_index": 45
      }
    ]
  },
  "results": [...existing search results...],
  "total_results": 10,
  "processing_time_ms": 2366
}
```

### Critical Performance Optimizations

#### 1. OpenAI Client Initialization
**Problem**: Module-level client initialization caused Vercel cold start timeouts
**Solution**: Lazy initialization pattern
```python
_openai_client = None

def get_openai_client():
    global _openai_client
    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _openai_client
```

#### 2. MongoDB Vector Search Optimization
**Change**: Increased `numCandidates` from 20 to 100
**Impact**: Better recall with minimal latency increase (+10ms)
**Location**: `api/mongodb_vector_search.py`

#### 3. Modal Timeout Adjustment
**Change**: Increased timeout from 20s to 25s
**Reason**: Accommodate cold starts without cascading timeouts
**Impact**: More reliable embedding generation

### Known Issues and Temporary Fixes

#### 1. N+1 Query Problem in expand_chunk_context
**Issue**: Each chunk expansion created a new MongoDB connection and query
**Impact**: 10 chunks × 2s = 20s additional latency
**Temporary Fix**: Disabled expand_chunk_context function
**Permanent Solution Required**: Batch query implementation
```python
# TODO: Replace with batch query
# for result in paginated_results:
#     expanded_text = await expand_chunk_context(result, context_seconds=20.0)
```

#### 2. ObjectId Serialization
**Issue**: MongoDB ObjectId objects couldn't be JSON serialized
**Fix**: Convert to strings before response
```python
if "_id" in clean_chunk:
    clean_chunk["_id"] = str(clean_chunk["_id"])
```

### Performance Metrics

#### Synthesis Performance
- OpenAI API call: 1.6-2.1 seconds
- Total synthesis overhead: ~2 seconds
- Citation parsing: <50ms

#### End-to-End Response Times
- Cold start: 15-20 seconds (Modal embedding generation)
- Warm requests: 2.2-2.8 seconds average
- P95 latency: 3.7 seconds

### Operational Principles & Known Constraints

#### Key Configuration Parameters
| Parameter | Value | Reason |
|-----------|-------|---------|
| Modal Timeout | 25s | Prevents cold start timeouts |
| OpenAI Model | gpt-4o-mini | Only available model |
| OpenAI Max Retries | 0 | Prevents timeout multiplication |
| MongoDB numCandidates | 100 | Better recall vs latency trade-off |
| Synthesis Chunks | 10 | ~1000 token context window |
| Response Timeout | 30s | Vercel function limit |

#### Critical Workarounds
1. **Lazy Initialization**: All external clients must use lazy initialization
2. **No Retries**: Retry logic disabled to fit within 30s Vercel timeout
3. **Context Expansion Disabled**: Temporary measure until batch query implemented
4. **Citation Diversity**: Not enforced (reverted for stability)

### Security Considerations

1. **API Key Management**:
   - OpenAI API key stored in environment variables
   - No key rotation implemented yet

2. **Input Validation**:
   - User queries sanitized before OpenAI prompt
   - Chunk deduplication prevents prompt stuffing

3. **Cost Controls**:
   - Max 80 tokens per synthesis
   - Temperature 0 for predictable costs
   - No streaming (simpler cost calculation)

### Monitoring & Logging

1. **Performance Tracking**:
   - Synthesis time logged separately
   - Total processing time included in response
   - Cold start detection via timing

2. **Error Tracking**:
   - OpenAI failures logged with full context
   - Graceful degradation to search-only mode
   - User-friendly error messages

### Cost Analysis

**Monthly Costs (estimated for 1000 queries/day)**:
- OpenAI GPT-4o-mini: ~$18/month
- Additional Modal compute: Minimal (reuses existing endpoint)
- Total Phase 1B cost: ~$18-20/month

### Future Improvements Required

1. **Fix N+1 Query Pattern** (HIGH PRIORITY):
   ```python
   # Proposed batch implementation
   all_time_windows = [(chunk["episode_id"], chunk["start_time"]-20, chunk["end_time"]+20) 
                       for chunk in chunks]
   expanded_contexts = await batch_fetch_contexts(all_time_windows)
   ```

2. **Re-enable Citation Diversity**:
   - Implement stable multi-episode requirement
   - Test thoroughly before production

3. **Implement Response Caching**:
   - Cache synthesis results by query hash
   - 1-hour TTL for cost savings

---

## Architecture Diagrams

### Complete Sprint 3 Architecture Flow
```
User Query (Command Bar)
    ↓
API Gateway (/api/search)
    ↓
Query Embedding (Modal.com - 25s timeout)
    ↓
MongoDB Vector Search (numCandidates: 100)
    ↓
Top 10 Chunks Selection
    ↓
[Context Expansion DISABLED - N+1 issue]
    ↓
OpenAI Synthesis (gpt-4o-mini)
    ↓
Answer with Citations
    ↓
Response to User

Parallel Flow for Audio:
User Clicks Play → /api/v1/audio_clips → Lambda → S3/FFmpeg → Audio URL
```

### Audio Clip Generation Flow (Phase 1A)
```
User Request
    ↓
API Gateway → Lambda Function
    ↓           ↓
MongoDB     S3 Source
(Check)     (Download)
    ↓           ↓
[Exists?]   FFmpeg
    ↓           ↓
Return URL  S3 Upload
    ←           ↓
            MongoDB
            (Store)
                ↓
            Return URL
```

---

## Sprint 3 Summary

### Completed Features
1. ✅ **Phase 1A**: On-demand audio clip generation via AWS Lambda
2. ✅ **Phase 1B**: AI-powered answer synthesis with OpenAI
3. ✅ **Performance Optimizations**: Achieved 2.2-2.8s response times
4. ✅ **Critical Bug Fixes**: Resolved timeout and serialization issues

### Outstanding Technical Debt
1. 🔴 **N+1 Query Pattern**: expand_chunk_context disabled temporarily
2. 🟡 **Citation Diversity**: Feature reverted for stability
3. 🟡 **Response Caching**: Not implemented yet

### Key Learnings
1. Serverless environments require careful initialization patterns
2. External service timeouts must account for cold starts
3. Database query patterns significantly impact performance
4. Production stability sometimes requires feature trade-offs

---

## Phase 2: Frontend Component Architecture

### New Components

#### 1. SearchCommandBar Component
**Purpose**: Main command bar interface for podcast search
**Location**: `/components/dashboard/search-command-bar.tsx`
**Technology**: React with TypeScript, Framer Motion animations
**Key Features**:
- Keyboard shortcut activation (/, ⌘K)
- Glassmorphism design with backdrop blur
- Auto-hide on scroll behavior
- Modal and inline display modes
- Integrated answer display

**Component Props**:
```typescript
interface SearchCommandBarProps {
  onSearch?: (query: string) => void
  className?: string
  mode?: "inline" | "modal"
}
```

#### 2. Answer Display Integration
**Purpose**: Display AI-synthesized answers with citations
**Architecture**: Integrated within SearchCommandBar (not separate component)
**Key Features**:
- Confidence score visualization (30-99%)
- Citation chips with podcast metadata
- Collapsible source list (2 shown by default)
- Loading and error states

### API Integration Architecture

#### Request Flow
```
User Input → Debounce (500ms) → API Call → Transform Response → Update UI
                                    ↓
                            Cold Start Handler
                                    ↓
                            "AI waking up" message (5s)
```

#### Response Transformation
**Backend Response**:
```json
{
  "answer": {
    "text": "2-sentence answer",
    "citations": [{
      "index": 1,
      "episode_id": "id",
      "episode_title": "title",
      "podcast_name": "name",
      "timestamp": "MM:SS",
      "start_seconds": 1234,
      "chunk_index": 45
    }]
  },
  "results": [...],
  "processing_time_ms": 2366
}
```

**Frontend AIAnswer Interface**:
```typescript
interface AIAnswer {
  id: string
  question: string
  answer: string
  confidence: number
  sources: Source[]
  generatedAt: string
}
```

### State Management
- Local component state (no Redux/Context needed)
- States: query, loading, error, results, aiAnswer
- Keyboard shortcut state management
- Scroll position tracking

### Performance Optimizations

1. **Debounced Search**:
   - 500ms delay to prevent excessive API calls
   - Minimum 4 characters required

2. **Animation Performance**:
   - Transform and opacity only (GPU accelerated)
   - `will-change` CSS property for smooth animations
   - Reduced motion support

3. **Mock Data System**:
   - Development mode with instant responses
   - Production-like data structure
   - Toggle between mock and real API

### Testing Infrastructure

#### Test Page
**Location**: `/app/test-command-bar/page.tsx`
**Features**:
- Mock data toggle
- Test instructions
- Visual feedback
- Scroll content for behavior testing

#### Mock Data
**Location**: `/lib/mock-api.ts`
**Scenarios**:
- "AI agents" - 4 citations
- "venture capital valuations" - 3 citations
- "startup funding" - 3 citations
- "DePIN infrastructure" - 2 citations

### Component Dependencies
- Framer Motion: Animations
- Lucide React: Icons
- Native fetch API: HTTP requests
- Crypto.randomUUID: ID generation

### Accessibility Features
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatible
- Reduced motion support

### Mobile Responsiveness
- Command bar: 90vw on mobile
- Touch-friendly targets (min 44px)
- Simplified animations on mobile
- Modal display for small screens

### Error Handling Strategy
1. **Network Errors**: User-friendly messages
2. **Cold Starts**: Progressive feedback after 5s
3. **No Results**: Helpful suggestions
4. **API Failures**: Graceful degradation

### Future Architecture Considerations
1. **Caching Layer**: Could add SWR or React Query
2. **WebSocket Support**: For real-time updates
3. **Offline Support**: Service worker integration
4. **Analytics Integration**: Event tracking hooks

---

## Phase 2: Frontend Component Architecture

### New Components

#### 1. SearchCommandBar Component
**Purpose**: Main command bar interface for podcast search
**Location**: `/components/dashboard/search-command-bar.tsx`
**Technology**: React with TypeScript, Framer Motion animations
**Key Features**:
- Keyboard shortcut activation (/, ⌘K)
- Glassmorphism design with backdrop blur
- Auto-hide on scroll behavior
- Modal and inline display modes
- Integrated answer display

**Component Props**:
```typescript
interface SearchCommandBarProps {
  onSearch?: (query: string) => void
  className?: string
  mode?: "inline" | "modal"
}
```

#### 2. Answer Display Integration
**Purpose**: Display AI-synthesized answers with citations
**Architecture**: Integrated within SearchCommandBar (not separate component)
**Key Features**:
- Confidence score visualization (30-99%)
- Citation chips with podcast metadata
- Collapsible source list (2 shown by default)
- Loading and error states

### API Integration Architecture

#### Request Flow
```
User Input → Debounce (500ms) → API Call → Transform Response → Update UI
                                    ↓
                            Cold Start Handler
                                    ↓
                            "AI waking up" message (5s)
```

#### Response Transformation
**Backend Response**:
```json
{
  "answer": {
    "text": "2-sentence answer",
    "citations": [{
      "index": 1,
      "episode_id": "id",
      "episode_title": "title",
      "podcast_name": "name",
      "timestamp": "MM:SS",
      "start_seconds": 1234,
      "chunk_index": 45
    }]
  },
  "results": [...],
  "total_results": 10,
  "processing_time_ms": 2366
}
```

**Frontend AIAnswer Interface**:
```typescript
interface AIAnswer {
  id: string
  question: string
  answer: string
  confidence: number
  sources: Source[]
  generatedAt: string
}
```

### State Management
- Local component state (no Redux/Context needed)
- States: query, loading, error, results, aiAnswer
- Keyboard shortcut state management
- Scroll position tracking

### Performance Optimizations

1. **Debounced Search**:
   - 500ms delay to prevent excessive API calls
   - Minimum 4 characters required

2. **Animation Performance**:
   - Transform and opacity only (GPU accelerated)
   - `will-change` CSS property for smooth animations
   - Reduced motion support

3. **Mock Data System**:
   - Development mode with instant responses
   - Production-like data structure
   - Toggle between mock and real API

### Testing Infrastructure

#### Test Page
**Location**: `/app/test-command-bar/page.tsx`
**Features**:
- Mock data toggle
- Test instructions
- Visual feedback
- Scroll content for behavior testing

#### Mock Data
**Location**: `/lib/mock-api.ts`
**Scenarios**:
- "AI agents" - 4 citations
- "venture capital valuations" - 3 citations
- "startup funding" - 3 citations
- "DePIN infrastructure" - 2 citations

### Component Dependencies
- Framer Motion: Animations
- Lucide React: Icons
- Native fetch API: HTTP requests
- Crypto.randomUUID: ID generation

### Accessibility Features
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatible
- Reduced motion support

### Mobile Responsiveness
- Command bar: 90vw on mobile
- Touch-friendly targets (min 44px)
- Simplified animations on mobile
- Modal display for small screens

### Error Handling Strategy
1. **Network Errors**: User-friendly messages
2. **Cold Starts**: Progressive feedback after 5s
3. **No Results**: Helpful suggestions
4. **API Failures**: Graceful degradation

### Future Architecture Considerations
1. **Caching Layer**: Could add SWR or React Query
2. **WebSocket Support**: For real-time updates
3. **Offline Support**: Service worker integration
4. **Analytics Integration**: Event tracking hooks

---

Last Updated: June 29, 2025
