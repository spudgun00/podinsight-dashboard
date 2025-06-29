# Sprint 1 Phase 3: Enhanced Visualizations Guide

## 📍 Current Sprint Status

### ✅ Completed Phases
- **Phase 0**: Technical debt cleared, TypeScript errors fixed
- **Phase 1**: MongoDB integration (60x search improvement!)
- **Phase 2**: Search infrastructure deployed and working

### 🔄 Current Phase: Enhanced Visualizations
**Goal**: Transform the dashboard from functional to premium by integrating ALL v0 components and adding sentiment visualization.

## 🎯 Phase 3 Objectives

### 1. Find and Integrate Missing v0 Components
**Problem**: Many v0 components were created but never integrated into the dashboard.

**Components to Find**:
- **SIGNAL Bar**: Purple gradient component showing topic correlations
- **Statistics Row**: 4 metric cards (Total Mentions, Weekly Growth, etc.)
- **Enhanced Legend**: Shows growth percentages and trend arrows

**Why This Matters**: You paid for these components - let's use them!

### 2. Connect Real Data to Visual Components
**Current State**: Some components show mock data or hardcoded values.

**Fix**:
- SIGNAL bar → Connect to `/api/signals` endpoint
- Statistics → Calculate from actual topic data
- Legend → Add real growth percentages

### 3. Sentiment Heatmap (New Component)
**Purpose**: Show market sentiment trends in a visual grid format.

**Design**:
- Grid: Topics (rows) × Weeks (columns)
- Colors: Red (negative) → Yellow (neutral) → Green (positive)
- Interaction: Hover for details

## 🔍 Component Discovery Strategy

```bash
# Find all v0 components that might not be integrated
find ./components -name "*.tsx" -o -name "*.jsx" | grep -E "(signal|stat|metric|legend|indicator|badge|alert)"

# Check which components are imported but not used
grep -r "from.*components" --include="*.tsx" --include="*.jsx" | grep -v "node_modules"
```

## 📊 Data Integration Points

### For SIGNAL Bar
```typescript
// Connect to real correlations API
const { data: signals } = useQuery({
  queryKey: ['signals'],
  queryFn: () => fetch('/api/signals').then(res => res.json())
});

// Show only impressive correlations (>25%)
const impressiveSignals = signals.filter(s => s.correlation > 0.25 || s.volume > 100);
```

### For Statistics Row
```typescript
// Calculate from real data
const stats = {
  totalMentions: topics.reduce((sum, t) => sum + t.mentions, 0),
  weeklyGrowth: calculateGrowthRate(currentWeek, previousWeek),
  mostActiveWeek: findPeakWeek(weeklyData),
  trendingTopic: findHighestGrowthTopic(topics)
};
```

## 🚨 Critical Success Factors

### User Experience Goals
1. **Immediate Value**: Dashboard shows 2-3 actionable insights without clicking
2. **Premium Feel**: Smooth animations, no janky transitions
3. **Data Trust**: All numbers are real and accurate

### Technical Goals
1. **No New Components**: Use existing v0 components
2. **Real Data Only**: No mock data in production
3. **Performance**: Maintain <2s page load

## 🎨 Sentiment Heatmap Requirements

### Visual Design
- Glass morphism container (matching dashboard theme)
- Smooth color gradients based on sentiment score
- Cell hover shows tooltip with details
- NO color animations or flashing

### Data Structure
```javascript
const sentimentData = {
  "AI Agents": {
    "W1": 0.72,  // Positive sentiment
    "W2": 0.45,  // Slightly positive
    "W3": -0.23  // Slightly negative
  },
  // ... other topics
};
```

### Interaction Design
- Each cell manages its own hover state
- Tooltip shows: Topic, Week, Sentiment score, Episode count
- Week-specific episode counts (not total 1,171)

## 📋 Phase 3 Checklist

### Component Integration
- [ ] Find all unused v0 components
- [ ] Integrate SIGNAL bar with real correlations
- [ ] Update statistics to use actual calculations
- [ ] Add growth indicators to legend

### Sentiment Heatmap
- [ ] Create heatmap component with static colors
- [ ] Fix hover to show week-specific data
- [ ] Remove any color animations
- [ ] Center layout properly

### Quality Checks
- [ ] All data is real (no mock values)
- [ ] Page loads in <2 seconds
- [ ] No TypeScript errors
- [ ] Mobile responsive (stretch goal)

## 🔧 Common Issues to Avoid

1. **Don't create new components** if v0 versions exist
2. **Don't show boring data** - filter for impressive insights only
3. **Don't use animations** that distract from data
4. **Don't hardcode values** - calculate from real data

## 🎯 Definition of Done

Phase 3 is complete when:
1. ALL v0 components are found and integrated
2. SIGNAL bar shows real, impressive correlations
3. Statistics show actual calculated values
4. Sentiment heatmap displays without flashing/animations
5. Dashboard feels premium and production-ready

## 💡 Next Steps After Phase 3

- **Phase 4**: Audio integration (play clips from dashboard)
- **Phase 5**: Authentication (user accounts, saved searches)
- **Future**: Search-to-visualization pipeline concept