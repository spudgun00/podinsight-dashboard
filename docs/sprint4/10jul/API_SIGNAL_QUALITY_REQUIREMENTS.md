# API Signal Quality Requirements

**Date:** July 10, 2025  
**Issue:** Signal content lacks context and usefulness for VC users  
**Priority:** HIGH - Blocking user experience

## Current Problems

### 1. Missing Entity Context
**Current:** "I give them their first 25K check or 125K check"  
**Problem:** WHO is giving the check? To WHOM? Which company?  
**Expected:** "Jason Calacanis: 'I give founders their first 25K check through Launch Accelerator'"

### 2. Incomplete Information
**Current:** "the Series A, $100 million round"  
**Problem:** WHICH company raised Series A? Who led it?  
**Expected:** "OpenAI raises $100M Series A led by Andreessen Horowitz"

### 3. Miscategorized Signals
**Current:** "We passed on Uber's seed round" → Marked as 'investable'  
**Problem:** This is competitive intelligence, not an investment opportunity  
**Expected:** Should be categorized as 'competitive' signal type

### 4. Zero Duration Issue
**Current:** All episodes show `duration_seconds: 0`  
**Problem:** Cannot display episode length to users  
**Expected:** Actual duration in seconds (e.g., 5400 for 90-minute episode)

## Requirements for Signal Extraction

### 1. Context Window
- Extract 1-2 complete sentences around the signal
- Include the speaker's name when available
- Include the company/entity being discussed

### 2. Signal Quality Criteria
Each signal MUST include:
- **WHO**: The person or company taking action
- **WHAT**: The specific action or event
- **VALUE**: Dollar amounts, percentages, or metrics when mentioned
- **WHEN**: Timeframe if mentioned (Series A, seed round, etc.)

### 3. Proper Categorization

#### Investable Signals
- New funding rounds announced
- Funds being raised by VCs
- Market opportunities identified
- Investment thesis statements

#### Competitive Intelligence
- Deals passed on or lost
- Competitor moves and strategies
- Market share changes
- M&A activity

#### Portfolio Mentions
- Updates on portfolio companies
- Performance metrics
- Exit discussions
- Follow-on investment decisions

#### Sound Bites (Key Insights)
- Market predictions
- Industry trends
- Strategic advice
- Thought leadership quotes

### 4. Example Transformations

| Current (Bad) | Required (Good) |
|---------------|-----------------|
| "I give them their first 25K check" | "Jason Calacanis offers first $25K checks to Launch Accelerator startups" |
| "the Series A, $100 million round" | "Anthropic closes $100M Series A led by Google Ventures" |
| "We passed on Uber's seed round" | "Bessemer admits passing on Uber's seed round - worst miss in firm history" |
| "AI infrastructure massively overbuilt" | "Chamath predicts AI infrastructure is 'massively overbuilt', correction coming" |

### 5. Technical Requirements

1. **Minimum Context**: 50-100 characters of surrounding context
2. **Entity Resolution**: Link to known companies/people in database
3. **Confidence Threshold**: Only extract signals with >0.7 confidence
4. **Deduplication**: Remove near-duplicate signals from same episode

### 6. API Response Format

```json
{
  "signals": [
    {
      "type": "investable",
      "content": "Sequoia Capital announces new $8B fund, their largest ever, targeting AI and crypto startups",
      "entities": {
        "companies": ["Sequoia Capital"],
        "people": [],
        "amounts": ["$8B"]
      },
      "confidence": 0.9,
      "timestamp": "15:23",
      "context": "Discussion about mega-funds and dry powder in the market"
    }
  ]
}
```

## Success Metrics

1. **Entity Coverage**: 95% of signals include company/person names
2. **Context Completeness**: 90% of signals are self-explanatory
3. **Categorization Accuracy**: 95% correct signal type assignment
4. **User Satisfaction**: VCs can understand signal without listening to episode

## Implementation Priority

1. **P0**: Fix entity extraction to include WHO/WHAT
2. **P0**: Fix signal categorization accuracy
3. **P1**: Add duration_seconds to episode metadata
4. **P1**: Improve context window for extraction
5. **P2**: Add entity linking to known companies

---

**Next Steps**: Backend team to update GPT prompts and extraction logic to meet these requirements before next sprint review.