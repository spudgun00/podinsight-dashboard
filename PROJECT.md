# PodInsightHQ Dashboard

## Purpose
Display Topic Velocity chart with real podcast intelligence data.

## Key Decisions
- Framework: Next.js 14 + TypeScript + Tailwind
- Chart library: Recharts
- Auth: Basic auth via Vercel (no user accounts)
- Topics: AI Agents, Capital Efficiency, DePIN, B2B SaaS (hardcoded)
- Dark mode only, desktop only

## Success Criteria
- Chart loads in <2 seconds
- Displays 4 topic trend lines
- Interactive tooltips on hover
