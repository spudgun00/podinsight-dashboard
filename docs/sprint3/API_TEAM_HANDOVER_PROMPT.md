# API Team Handover - Sprint 3 Phase 2 Issues

## Context for Claude/API Team

I need help fixing two critical backend issues that are blocking the PodInsight command bar feature. The frontend is complete and working, but the backend has timeout and audio generation failures.

### Project Context Files to Read:
```
@sprint3_command_bar_playbook.md - Complete sprint guide with architecture
@API_DOCUMENTATION_PHASE2.md - Your API documentation
@API_TIMEOUT_INVESTIGATION.md - Detailed timeout analysis and solutions
@AUDIO_API_BACKEND_ISSUES.md - Audio Lambda debugging guide
```

### Current Issues:

#### 1. OpenAI Synthesis Timeout (CRITICAL)
**Symptom**: Some queries timeout after 30 seconds during AI synthesis
**Example**: Query "startup funding" consistently times out

**Error Log**:
```
INFO:api.synthesis:Calling OpenAI gpt-4o-mini for synthesis
INFO:openai._base_client:Retrying request to /chat/completions in 0.936637 seconds
Vercel Runtime Timeout Error: Task timed out after 30 seconds
```

**Root Cause**: OpenAI client has default 2 retries, combined with slow responses exceeds Vercel's 30s limit

**Required Fix**:
```python
# In your OpenAI client initialization
openai = OpenAI(
    api_key=process.env.OPENAI_API_KEY,
    timeout=20 * 1000,  # 20 seconds
    maxRetries=0,       # Disable retries
)
```

#### 2. Audio Clip Generation Failures
**Symptom**: All audio clip requests return 500 errors
**Example URLs**:
- `/api/v1/audio_clips/673b06c4-cf90-11ef-b9e1-0b761165641d?start_time_ms=556789`
- `/api/v1/audio_clips/9497d063-69c2-4701-9951-931c1599b170?start_time_ms=3114541`

**Likely Issues**:
1. Lambda function not deployed
2. Missing FFmpeg layer
3. S3 permissions missing
4. Episode IDs don't exist in S3

### What's Working:
- Vector search completes in 19.8ms ✅
- Search returns correct results ✅
- Frontend handles all errors gracefully ✅
- Proxy routes prevent CORS issues ✅

### Testing After Fix:

1. **Test Synthesis Fix**:
```bash
curl -X POST 'https://podinsight-api.vercel.app/api/search' \
-H 'Content-Type: application/json' \
-d '{"query": "startup funding", "limit": 10}'
```
Should complete in <10 seconds without timeout

2. **Test Audio Fix**:
```bash
curl 'https://podinsight-api.vercel.app/api/v1/audio_clips/test-episode?start_time_ms=0'
```
Should return:
```json
{
  "clip_url": "https://pod-insights-clips.s3.amazonaws.com/...",
  "cache_hit": false,
  "generation_time_ms": 2340
}
```

### Debugging Steps:

1. **For OpenAI Timeout**:
   - Check OpenAI dashboard for rate limits
   - Add logging for prompt size and token count
   - Consider using gpt-3.5-turbo for faster responses

2. **For Audio Lambda**:
   - Check CloudWatch logs for exact error
   - Verify Lambda deployment: `aws lambda get-function --function-name audio-clip-generator`
   - Test Lambda directly with test event
   - Check S3 bucket permissions

### Frontend Status:
- All frontend code complete and tested
- Graceful error handling implemented
- 10-second timeout on audio requests
- 5-minute cache for search results
- Fallback UI when synthesis fails

### Success Criteria:
1. Search queries complete in <10 seconds
2. Audio clips generate in 2-3 seconds (first play)
3. No more timeout errors in logs
4. Audio URLs are valid and playable

Please fix these issues so we can complete Sprint 3. The frontend is waiting for working endpoints.