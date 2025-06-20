# v0 Prompt: Sentiment Heatmap Component

## Component Overview
Create a **Sentiment Heatmap** component that visualizes sentiment trends for podcast topics over time. This will be placed BELOW the existing statistics cards in the PodInsightHQ dashboard.

## Visual Design Requirements

### Layout
- **Width**: FULL WIDTH (same as the chart above it)
- **Height**: ~300px 
- **Position**: Below the 4 statistics cards, above the footer
- **Container**: Glass morphism style matching existing dashboard

### Grid Structure
```
        Week 1   Week 2   Week 3  ...  Week 12
AI Agents    [cell]   [cell]   [cell]      [cell]
Capital Eff. [cell]   [cell]   [cell]      [cell]
DePIN        [cell]   [cell]   [cell]      [cell]
B2B SaaS     [cell]   [cell]   [cell]      [cell]
Crypto/Web3  [cell]   [cell]   [cell]      [cell]
```

### Color Scale
- **Negative (-1.0 to -0.3)**: Deep red → Light red
- **Neutral (-0.3 to 0.3)**: Light red → Yellow → Light green
- **Positive (0.3 to 1.0)**: Light green → Deep green
- **Smooth gradients** between values
- **Missing data**: Dark gray with subtle pattern

### Cell Design
- **Shape**: Rounded rectangles (4px radius)
- **Size**: Responsive, but roughly 60x40px
- **Border**: 1px solid rgba(255,255,255,0.1)
- **Hover effect**: 
  - Scale to 1.05
  - Brighter border
  - Show tooltip with exact value

### Interactions
1. **Hover tooltip** showing:
   - Topic name
   - Week (e.g., "Week of Mar 25")
   - Sentiment score (e.g., "+0.73")
   - Episode count for that cell

2. **Click behavior**:
   - Emit event for parent to handle
   - Visual feedback (pulse effect)

### Typography & Labels
- **Y-axis labels**: Topic names (left aligned)
- **X-axis labels**: Week numbers or dates (rotated 45° if needed)
- **Title**: "Sentiment Analysis Heatmap" with subtitle "AI-powered sentiment tracking across topics"
- **Legend**: Horizontal gradient bar showing -1 to +1 scale

### Animation
- **Entry**: Cells fade in with staggered delay (wave effect)
- **Hover**: Smooth scale and brightness transitions
- **Loading**: Skeleton pulse effect

## Component Props
```typescript
interface SentimentHeatmapProps {
  data: Array<{
    topic: string;
    week: string;
    sentiment: number; // -1 to 1
    episodeCount?: number;
  }>;
  isLoading?: boolean;
  onCellClick?: (topic: string, week: string) => void;
}
```

## Mock Data Generator
Include a function to generate realistic mock data:
```typescript
const generateMockSentimentData = () => {
  const topics = ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"];
  const weeks = Array.from({length: 12}, (_, i) => `W${i + 1}`);
  
  return topics.flatMap(topic => 
    weeks.map(week => ({
      topic,
      week,
      sentiment: Math.random() * 2 - 1, // -1 to 1
      episodeCount: Math.floor(Math.random() * 20) + 1
    }))
  );
};
```

## Styling Guidelines
- **Background**: `bg-black/30 backdrop-blur-2xl`
- **Border**: `border border-white/10`
- **Shadow**: `shadow-2xl shadow-purple-500/20`
- **Padding**: `p-6`
- **Font**: Use existing dashboard fonts
- **Colors**: Match the purple/blue accent colors from dashboard

## Integration Notes
- Use Tailwind CSS classes
- Leverage framer-motion for animations
- Ensure responsive design
- Match existing component patterns in the dashboard

## Example Implementation Structure
```tsx
export function SentimentHeatmap({ data, isLoading, onCellClick }: SentimentHeatmapProps) {
  // Component logic
  return (
    <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-purple-500/20 p-6">
      <h3 className="text-xl font-semibold text-white mb-2">Sentiment Analysis Heatmap</h3>
      <p className="text-sm text-gray-400 mb-6">AI-powered sentiment tracking across topics</p>
      
      {/* Grid container */}
      <div className="relative">
        {/* Heatmap grid */}
        {/* Legend */}
      </div>
    </div>
  );
}
```

## Important Notes
1. This component should be **visually impressive** - it's a key differentiator
2. Ensure smooth performance with 60 data points (5 topics × 12 weeks)
3. Make it feel "alive" with subtle animations
4. The sentiment values are mock data for Sprint 1 (real ML analysis comes later)