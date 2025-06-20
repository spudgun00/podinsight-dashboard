# Claude Code Session: Integrate Sentiment Heatmap

## 🎯 Quick Context (30 seconds)

You're working on **PodInsightHQ** - an AI-powered podcast intelligence platform. We just completed Phase 3.2 (Signal Correlations) and now need to integrate a sentiment heatmap component.

**Current Status:**
- ✅ Topic Velocity Dashboard working
- ✅ SIGNAL bar showing real correlations ("AI Agents + Crypto/Web3 in 55% of episodes")
- ✅ All v0 components integrated
- 🔄 Need to add Sentiment Heatmap (Phase 3.3)

## 📍 Your Starting Point

**Repository**: `/Users/jamesgill/PodInsights/podinsight-dashboard`

**Key Files**:
- `app/page.tsx` - Main dashboard page
- `components/dashboard/topic-velocity-chart-full-v0.tsx` - Main chart component
- `NEW FILE FROM V0` - Sentiment heatmap component you'll integrate

**Current Layout** (top to bottom):
1. Header
2. Time range selector + Export button
3. 4 Metric cards (Trending Now, Episodes, etc.)
4. Topic Velocity Chart
5. **[INSERT HEATMAP HERE]** ← Your task
6. Footer

## 🎨 What You're Building

Integrate a sentiment heatmap that shows:
- 5 topics (Y-axis): AI Agents, Capital Efficiency, DePIN, B2B SaaS, Crypto/Web3
- 12 weeks (X-axis): Color-coded sentiment scores
- Red (-1) → Yellow (0) → Green (+1)
- Full width, ~300px height

## ✅ Implementation Checklist

### 1. Add the v0 Component
```bash
# Copy the sentiment heatmap component from v0
# Place it in: components/dashboard/sentiment-heatmap.tsx
```

### 2. Update page.tsx
```tsx
// Import the new component
import { SentimentHeatmap } from "@/components/dashboard/sentiment-heatmap"

// Add state for heatmap data
const [sentimentData, setSentimentData] = useState(generateMockSentimentData())

// Add the component after TopicVelocityChartFullV0
<TopicVelocityChartFullV0 ... />

{/* New Sentiment Heatmap */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
  className="mt-6"
>
  <SentimentHeatmap 
    data={sentimentData}
    onCellClick={(topic, week) => {
      console.log(`Clicked: ${topic} in ${week}`)
      // Future: Show episode details
    }}
  />
</motion.div>

<footer ... />
```

### 3. Create Mock Data Function
```typescript
// In lib/utils.ts or directly in page.tsx
export const generateMockSentimentData = () => {
  const topics = ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"]
  const weeks = Array.from({length: 12}, (_, i) => {
    const weekNum = i + 14 // Starting from week 14 to match current data
    return `2025-W${weekNum.toString().padStart(2, '0')}`
  })
  
  return topics.flatMap(topic => 
    weeks.map(week => ({
      topic,
      week,
      sentiment: Math.random() * 2 - 1, // -1 to 1
      episodeCount: Math.floor(Math.random() * 20) + 1
    }))
  )
}
```

### 4. Ensure Consistent Styling
- Matches glass morphism theme
- Uses same spacing as other components
- Responsive on mobile

## 🚨 Important Notes

1. **Mock Data for Now**: Use the mock data generator. Real sentiment analysis comes in Sprint 2.

2. **Week Format**: Use ISO week format (2025-W14) to match existing data structures.

3. **Animation**: Add framer-motion wrapper for smooth entry animation.

4. **Error Handling**: Component should handle empty data gracefully.

5. **Performance**: 60 cells (5×12) should render smoothly.

## 🎯 Definition of Done

- [ ] Heatmap displays below chart
- [ ] Shows 5 topics × 12 weeks
- [ ] Colors range from red to green
- [ ] Hover shows tooltip with sentiment value
- [ ] Click logs to console (for now)
- [ ] Smooth animations on load
- [ ] Responsive design maintained
- [ ] No TypeScript errors
- [ ] Build completes successfully

## 💡 Quick Tips

- The v0 component might need minor adjustments for TypeScript
- Use existing patterns from TopicVelocityChartFullV0 for consistency
- Keep the mock data realistic (-0.8 to +0.8 range, not always extremes)
- Test with different screen sizes

## 📝 Commit Message

```
feat: Add sentiment heatmap visualization

- Integrate v0-designed sentiment heatmap component
- Display 5 topics × 12 weeks sentiment grid  
- Add mock data generator for Sprint 1
- Position below velocity chart with animations
- Red-yellow-green color scale for sentiment

Part of Phase 3.3: Enhanced Visualizations
```

---

Ready to integrate! The v0 component should slot in nicely below the existing chart.