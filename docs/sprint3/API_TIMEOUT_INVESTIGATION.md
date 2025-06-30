# API Synthesis Timeout Investigation & Resolution Plan

**Date:** December 30, 2024  
**Priority:** HIGH  
**Affected Service:** `podinsight-api`  
**Endpoint:** `/api/search`

## 1. Executive Summary

The `/api/search` endpoint is experiencing consistent 30-second Vercel function timeouts for specific queries. The root cause is in the OpenAI synthesis step, where the combination of large prompts and automatic retries exceeds the function's execution limit.

**Key Finding:** The OpenAI Node.js client defaults to **2 retries** with exponential backoff, which can easily push a slow request beyond the 30-second Vercel limit.

## 2. Problem Details

### Symptoms
- **Failing Query:** "startup funding" (consistent timeout)
- **Working Queries:** "AI agents", "venture capital valuations"
- **Error:** `Vercel Runtime Timeout Error: Task timed out after 30 seconds`

### Timeline
1. Vector search completes quickly (~1.6s)
2. OpenAI synthesis begins
3. Log shows: `Retrying request to /chat/completions in 0.838363 seconds`
4. Function times out at 30 seconds

### Root Cause Hypothesis
The query "startup funding" likely returns more/longer chunks from vector search, creating a larger prompt that takes longer for GPT-4o-mini to process. Combined with the default 2 retries, this exceeds the 30-second limit.

## 3. Investigation Steps

### Step 1: Analyze Prompt Size Differences

Add logging before the OpenAI call to capture:

```javascript
// In your synthesis function
console.log('[SYNTHESIS DEBUG] Query:', query);
console.log('[SYNTHESIS DEBUG] Number of chunks:', chunks.length);
console.log('[SYNTHESIS DEBUG] Total chunk text length:', chunks.reduce((sum, chunk) => sum + chunk.text.length, 0));
console.log('[SYNTHESIS DEBUG] Estimated tokens:', Math.ceil(totalChars / 4)); // Rough estimate

// Log the actual prompt being sent
const prompt = constructPrompt(chunks, query); // Your prompt construction
console.log('[SYNTHESIS DEBUG] Prompt length:', prompt.length);
```

### Step 2: Review OpenAI Client Configuration

Check your current OpenAI client initialization:

```javascript
// Look for something like:
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Are timeout and maxRetries configured?
});
```

### Step 3: Monitor API Response Times

Add timing logs:

```javascript
const startTime = Date.now();
try {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [...],
    // other params
  });
  console.log('[SYNTHESIS DEBUG] OpenAI response time:', Date.now() - startTime, 'ms');
} catch (error) {
  console.log('[SYNTHESIS DEBUG] OpenAI error after:', Date.now() - startTime, 'ms');
  throw error;
}
```

## 4. Recommended Solutions

### Tier 1: Immediate Fixes (Deploy Today)

#### 1.1 Configure OpenAI Client Timeouts

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 20 * 1000,  // 20 seconds (leaves buffer for Vercel)
  maxRetries: 0,       // Disable retries to prevent timeout
});
```

#### 1.2 Limit Context Size

```javascript
function prepareChunksForSynthesis(chunks, maxChunks = 6, maxTotalLength = 3000) {
  // Take top N chunks
  let selectedChunks = chunks.slice(0, maxChunks);
  
  // Ensure total length doesn't exceed limit
  let totalLength = 0;
  selectedChunks = selectedChunks.filter(chunk => {
    totalLength += chunk.text.length;
    return totalLength <= maxTotalLength;
  });
  
  return selectedChunks;
}
```

#### 1.3 Add Explicit Error Handling

```javascript
try {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: 'You are a podcast intelligence assistant. Given search results, provide a 2-sentence synthesis (max 60 words) that directly answers the question. Cite sources with superscript numbers ¹²³.'
    }, {
      role: 'user',
      content: prompt
    }],
    max_tokens: 80,  // Enforce output limit
    temperature: 0,  // Deterministic output
  });
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    console.error('[SYNTHESIS ERROR]', error.status, error.message);
    
    // Return search results without synthesis
    return {
      answer: null,
      results: searchResults,
      synthesis_error: true,
      error_message: 'Synthesis temporarily unavailable'
    };
  }
  throw error;
}
```

### Tier 2: Performance Optimization (Deploy This Week)

#### 2.1 Implement Streaming Responses

```javascript
// Enable streaming for faster perceived performance
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  stream: true,
});

// Process stream and send chunks to frontend
for await (const chunk of stream) {
  // Send chunk to frontend via SSE or similar
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

#### 2.2 Optimize Prompt Template

```javascript
// More concise prompt = faster processing
const SYNTHESIS_PROMPT = `
Synthesize these podcast excerpts into exactly 2 sentences (max 60 words total).
Focus on answering: "${query}"
Use ¹²³ to cite sources.

Excerpts:
${chunks.map((c, i) => `[${i+1}] ${c.text.slice(0, 150)}...`).join('\n')}
`;
```

### Tier 3: Long-term Solutions

#### 3.1 Background Processing with Queue

For complex queries, consider:
1. Return immediate response with search results
2. Queue synthesis job
3. Notify frontend when synthesis completes

#### 3.2 Caching Layer

Cache successful syntheses at the API level:

```javascript
const cacheKey = createHash('md5')
  .update(query + chunks.map(c => c.id).join(','))
  .digest('hex');

const cached = await redis.get(`synthesis:${cacheKey}`);
if (cached) return JSON.parse(cached);
```

## 5. Testing the Fix

### Test Queries (in order of complexity)
1. "AI agents" - Should work (baseline)
2. "startup funding" - Currently failing
3. "venture capital market analysis 2024" - Likely complex
4. "what are VCs saying about B2B SaaS valuations in the current market" - Very complex

### Success Metrics
- No timeouts for any query
- Synthesis completes in <10 seconds (warm)
- Graceful fallback when synthesis fails

## 6. Monitoring & Alerts

Add these metrics:
- `synthesis.duration` - Time to complete synthesis
- `synthesis.timeout` - Count of timeouts
- `synthesis.retry` - Count of retries
- `synthesis.prompt_size` - Size of prompts

## 7. Quick Implementation Checklist

- [ ] Configure OpenAI client with 20s timeout and 0 retries
- [ ] Limit context to 6 chunks or 3000 characters
- [ ] Add comprehensive error logging
- [ ] Test with "startup funding" query
- [ ] Deploy and monitor for 24 hours
- [ ] Consider streaming implementation if issues persist

## 8. Contact & Support

If you need clarification or encounter issues:
- Frontend implementation reference: `/components/dashboard/search-command-bar-fixed.tsx`
- Test page: `/app/test-command-bar`
- Key symptom: Works for some queries, times out for others

---

**Note:** The immediate priority is deploying Tier 1 fixes to stabilize the system. Tier 2 optimizations will significantly improve user experience and should be implemented within the week.