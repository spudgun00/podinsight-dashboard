# Audio API Backend Issues Report

**Date:** December 30, 2024  
**Priority:** HIGH  
**Affected Endpoints:** `/api/v1/audio_clips/{episode_id}` and `/api/search`

## Executive Summary

The backend API has two critical issues preventing the command bar from functioning properly:

1. **Search Synthesis Timeouts**: OpenAI synthesis fails with Vercel 30-second timeout
2. **Audio Clip Generation Failures**: Audio endpoint returns 404/500 errors for all requests

## Issue 1: Search Synthesis Timeouts

### Symptoms
- Query: "AI agents" works but some queries timeout
- Error: `Vercel Runtime Timeout Error: Task timed out after 30 seconds`
- Log shows: `Retrying request to /chat/completions in 0.936637 seconds`

### Root Cause
From the logs:
```
INFO:api.synthesis:Calling OpenAI gpt-4o-mini for synthesis
INFO:openai._base_client:Retrying request to /chat/completions in 0.936637 seconds
Vercel Runtime Timeout Error: Task timed out after 30 seconds
```

The OpenAI client is retrying failed requests, pushing the total time over Vercel's 30-second limit.

### Recommended Fix
See `/docs/sprint3/API_TIMEOUT_INVESTIGATION.md` for detailed solutions:
1. Disable OpenAI retries: `maxRetries: 0`
2. Set timeout to 20 seconds: `timeout: 20000`
3. Limit chunk context to reduce prompt size

## Issue 2: Audio Clip Generation Failures

### Symptoms
All audio clip requests return 500 errors:
- `/api/v1/audio_clips/673b06c4-cf90-11ef-b9e1-0b761165641d?start_time_ms=556789` → 500
- `/api/v1/audio_clips/9497d063-69c2-4701-9951-931c1599b170?start_time_ms=3114541` → 500

### Likely Causes
1. **Lambda Function Not Deployed**: The audio generation Lambda may not be deployed
2. **Episode IDs Don't Exist**: The episode IDs from search results may not exist in S3
3. **S3 Permissions**: Lambda may lack permissions to read source audio or write clips
4. **FFmpeg Layer Missing**: Lambda may be missing the FFmpeg layer for audio processing

### Debugging Steps

1. **Check Lambda Deployment**:
   ```bash
   aws lambda get-function --function-name audio-clip-generator
   ```

2. **Verify Episode Exists**:
   ```bash
   aws s3 ls s3://pod-insights-raw/podcasts/*/episodes/673b06c4-cf90-11ef-b9e1-0b761165641d.mp3
   ```

3. **Check Lambda Logs**:
   ```bash
   aws logs tail /aws/lambda/audio-clip-generator --follow
   ```

4. **Test Lambda Directly**:
   ```json
   {
     "episode_id": "673b06c4-cf90-11ef-b9e1-0b761165641d",
     "start_time_ms": 556789,
     "duration_ms": 30000
   }
   ```

### Expected Audio API Behavior

According to the documentation:
- First play: 2-3 second generation time
- Cached clips: 200ms response
- Returns pre-signed S3 URL valid for 24 hours

### Frontend Workarounds

The frontend has implemented several mitigations:
1. **10-second timeout** on audio proxy to prevent hanging
2. **Enhanced error logging** to capture backend error messages
3. **Visual error indicators** when audio fails to load
4. **Graceful degradation** with error messages

## Testing the Fix

After fixing the backend:

1. **Test Audio Generation**:
   ```bash
   curl 'https://podinsight-api.vercel.app/api/v1/audio_clips/test-episode?start_time_ms=0'
   ```

2. **Expected Success Response**:
   ```json
   {
     "clip_url": "https://pod-insights-clips.s3.amazonaws.com/...",
     "cache_hit": false,
     "generation_time_ms": 2340
   }
   ```

3. **Verify S3 Clip Creation**:
   ```bash
   aws s3 ls s3://pod-insights-clips/audio_clips/
   ```

## Impact on Sprint 3

Without these fixes:
- ❌ No audio playback functionality
- ⚠️ Some searches timeout (degraded to showing raw results)
- ✅ Search works for most queries
- ✅ Frontend handles errors gracefully

## Recommended Actions

1. **Immediate (Today)**:
   - Fix OpenAI timeout issue (see API_TIMEOUT_INVESTIGATION.md)
   - Verify Lambda deployment and permissions

2. **Short-term (This Week)**:
   - Add health check endpoint for audio service
   - Implement proper error messages from Lambda
   - Add CloudWatch alarms for Lambda errors

3. **Long-term**:
   - Consider pre-generating popular clips
   - Implement CDN for audio delivery
   - Add audio service monitoring dashboard

## Contact

Frontend implementation ready and waiting for backend fixes. The frontend gracefully handles errors but needs working endpoints for full functionality.