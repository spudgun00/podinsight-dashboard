# PodInsightHQ Dashboard

## Purpose
Display Topic Velocity chart with real podcast intelligence data.

## Key Decisions
- Framework: Next.js 14 + TypeScript + Tailwind
- Chart library: Recharts
- Auth: Basic auth via Vercel (no user accounts)
- Topics: AI Agents, Capital Efficiency, DePIN, B2B SaaS (hardcoded)
- Dark mode only, desktop only

## API Integration
- Production API: https://podinsight-api.vercel.app
- Main endpoint: /api/topic-velocity
- Response format: Recharts-compatible JSON
- Average response time: 50ms

## Critical Notes
- Topic names must match EXACTLY (case-sensitive):
  - "AI Agents"
  - "Capital Efficiency"
  - "DePIN"
  - "B2B SaaS"
  - "Crypto/Web3" (NO spaces around /)
- Default shows 4 topics, 13 weeks of data
- Data range: 2025-01-01 to 2025-06-15

## Success Criteria
- Chart loads in <2 seconds
- Displays 4 topic trend lines
- Interactive tooltips on hover
- Basic auth protection on staging