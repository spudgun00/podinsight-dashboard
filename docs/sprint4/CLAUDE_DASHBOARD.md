# CLAUDE.md for PodInsight Dashboard Repository

Copy this file to `/Users/jamesgill/PodInsights/podinsight-dashboard/CLAUDE.md`

## Project Context

This is the Next.js 14 dashboard for PodInsightHQ, displaying episode intelligence to VCs.

## Asana Integration
- **Workspace GID**: `1210591545825845` (podinsighthq.com)
- **Project GID**: `1210696245097468` (PodInsightHQ Development)
- **Current Sprint**: Sprint 4 - Episode Intelligence

## Key Technical Standards

### Frontend Stack
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS + shadcn/ui
- React Query for data fetching
- Zustand for state management

### Episode Intelligence Components

#### 1. Intelligence Dashboard Card
Location: `components/intelligence/IntelligenceDashboardCard.tsx`

**API Integration:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['intelligence-summary'],
  queryFn: () => fetchIntelligenceSummary(),
  refetchInterval: 5 * 60 * 1000 // 5 minutes
});
```

**Display Requirements:**
- Show top 5 episodes by relevance score
- Signal type badges (investable, competitive, portfolio, soundbites)
- Preview bullets (2 per episode)
- Loading skeleton while fetching

#### 2. Intelligence Brief Modal
Location: `components/intelligence/IntelligenceBriefModal.tsx`

**API Integration:**
```typescript
const { data } = useQuery({
  queryKey: ['intelligence-brief', episodeGuid],
  queryFn: () => fetchEpisodeBrief(episodeGuid),
  enabled: isOpen
});
```

**Features:**
- Tabbed interface for signal types
- Entity highlighting
- Audio timestamp links
- Related episodes section

#### 3. Episode Card Enhancement
Location: `components/episodes/EpisodeCard.tsx`

**Changes:**
```typescript
// Add to existing EpisodeCard
{episode.relevance_score > 70 && (
  <Badge variant="secondary">
    {episode.relevance_score}% Relevant
  </Badge>
)}

{episode.signal_counts && (
  <div className="flex gap-2">
    <SignalIndicator 
      type="investable" 
      count={episode.signal_counts.investable} 
    />
    {/* ... other signals */}
  </div>
)}
```

### API Service Layer

Create `services/intelligence.ts`:
```typescript
export const intelligenceService = {
  async getSummary() {
    const res = await fetch('/api/dashboard/intelligence/summary');
    return res.json();
  },
  
  async getEpisodeBrief(episodeGuid: string) {
    const res = await fetch(`/api/episodes/${episodeGuid}/brief`);
    return res.json();
  },
  
  async getUserPreferences() {
    const res = await fetch('/api/user/intelligence/preferences');
    return res.json();
  }
};
```

### Component Structure
```
components/
├── intelligence/
│   ├── IntelligenceDashboardCard.tsx
│   ├── IntelligenceBriefModal.tsx
│   ├── SignalList.tsx
│   ├── EntityCloud.tsx
│   └── RelevanceScoreBadge.tsx
├── episodes/
│   └── EpisodeCard.tsx (enhanced)
└── ui/
    └── ... (shadcn components)
```

### State Management

Create `stores/intelligenceStore.ts`:
```typescript
interface IntelligenceStore {
  selectedEpisode: string | null;
  modalOpen: boolean;
  filters: {
    signalType: string | null;
    minScore: number;
  };
  setSelectedEpisode: (guid: string | null) => void;
  setModalOpen: (open: boolean) => void;
  updateFilters: (filters: Partial<Filters>) => void;
}
```

### Performance Guidelines

1. **Data Fetching:**
   - Use React Query for caching
   - Implement infinite scroll for lists
   - Prefetch episode briefs on hover

2. **Rendering:**
   - Virtualize long signal lists
   - Lazy load modal content
   - Use skeleton loaders

3. **Bundle Size:**
   - Dynamic imports for modals
   - Tree shake unused components
   - Optimize images with next/image

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key

### Styling Guidelines

Use Tailwind classes with these conventions:
- Card containers: `rounded-lg border bg-card p-6`
- Badges: Use shadcn Badge component
- Loading states: `animate-pulse` or skeleton
- Hover effects: `hover:bg-accent transition-colors`

### Mobile Responsiveness

All intelligence components must work on mobile:
- Stack cards vertically on small screens
- Modal takes full screen on mobile
- Touch-friendly tap targets (min 44px)
- Swipe gestures for signal type tabs

### Deployment
- Hosted on Vercel
- Auto-deploy from main branch
- Preview deployments for PRs
- Environment variables in Vercel dashboard