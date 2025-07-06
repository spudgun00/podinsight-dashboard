import { DEFAULT_TOPICS } from "./utils"

interface Signal {
  id: string
  type: 'correlation' | 'velocity' | 'sentiment' | 'competitive'
  title: string
  metric: string
  trend: string
  context?: string
  priority: number
}

interface TopicData {
  [key: string]: number
}

interface WeekData extends TopicData {
  week: string
  fullWeek: string
}

// Find strong correlations between topics
function findTopicCorrelations(data: WeekData[]): Signal[] {
  const signals: Signal[] = []
  const correlations: { [key: string]: number } = {}
  
  // Calculate co-occurrences
  for (let i = 0; i < DEFAULT_TOPICS.length; i++) {
    for (let j = i + 1; j < DEFAULT_TOPICS.length; j++) {
      const topic1 = DEFAULT_TOPICS[i]
      const topic2 = DEFAULT_TOPICS[j]
      let coOccurrences = 0
      let recentGrowth = 0
      
      data.forEach((week, index) => {
        if (week[topic1] > 0 && week[topic2] > 0) {
          coOccurrences++
          
          // Check recent growth (last 2 weeks)
          if (index >= data.length - 2 && index > 0) {
            const prevWeek = data[index - 1]
            const growth1 = ((week[topic1] - prevWeek[topic1]) / prevWeek[topic1]) * 100
            const growth2 = ((week[topic2] - prevWeek[topic2]) / prevWeek[topic2]) * 100
            recentGrowth = Math.max(recentGrowth, (growth1 + growth2) / 2)
          }
        }
      })
      
      // Only include strong correlations
      if (coOccurrences >= 8 && recentGrowth > 50) {
        signals.push({
          id: `corr-${topic1}-${topic2}`,
          type: 'correlation',
          title: `${topic1} + ${topic2}`,
          metric: `${coOccurrences} co-occurrences`,
          trend: `↗ ${Math.round(recentGrowth)}% this week`,
          priority: coOccurrences * recentGrowth
        })
      }
    }
  }
  
  return signals
}

// Detect velocity breakouts
function detectVelocityBreakouts(data: WeekData[]): Signal[] {
  const signals: Signal[] = []
  
  if (data.length < 4) return signals
  
  DEFAULT_TOPICS.forEach(topic => {
    // Calculate average velocity over past weeks
    const recentWeeks = data.slice(-4)
    const olderWeeks = data.slice(-8, -4)
    
    const recentAvg = recentWeeks.reduce((sum, week) => sum + (week[topic] || 0), 0) / recentWeeks.length
    const olderAvg = olderWeeks.reduce((sum, week) => sum + (week[topic] || 0), 0) / olderWeeks.length
    
    if (olderAvg > 0) {
      const velocityMultiplier = recentAvg / olderAvg
      
      if (velocityMultiplier >= 3) {
        const latestWeek = data[data.length - 1]
        const prevWeek = data[data.length - 2]
        const weekGrowth = prevWeek[topic] > 0 
          ? ((latestWeek[topic] - prevWeek[topic]) / prevWeek[topic]) * 100
          : 0
          
        signals.push({
          id: `velocity-${topic}`,
          type: 'velocity',
          title: `${topic} velocity spike`,
          metric: `${velocityMultiplier.toFixed(1)}x normal activity`,
          trend: weekGrowth > 0 ? `↗ ${Math.round(weekGrowth)}% this week` : 'Emerging pattern',
          context: velocityMultiplier > 5 ? 'Potential breakout event' : 'Growing momentum',
          priority: velocityMultiplier * 100
        })
      }
    }
  })
  
  return signals
}

// Detect sentiment shifts (simplified for now)
function detectSentimentShifts(data: WeekData[]): Signal[] {
  const signals: Signal[] = []
  
  // This would normally analyze actual sentiment data
  // For now, we'll look for topics with consistent growth
  DEFAULT_TOPICS.forEach(topic => {
    if (data.length < 3) return
    
    let consecutiveGrowth = 0
    for (let i = data.length - 1; i > data.length - 4 && i > 0; i--) {
      if (data[i][topic] > data[i - 1][topic]) {
        consecutiveGrowth++
      }
    }
    
    if (consecutiveGrowth >= 3) {
      const totalGrowth = ((data[data.length - 1][topic] - data[data.length - 4][topic]) / data[data.length - 4][topic]) * 100
      
      signals.push({
        id: `sentiment-${topic}`,
        type: 'sentiment',
        title: `${topic} momentum building`,
        metric: '3-week positive trend',
        trend: `↗ ${Math.round(totalGrowth)}% total`,
        context: 'Sustained interest growth',
        priority: totalGrowth
      })
    }
  })
  
  return signals
}

export function generateValueSignals(data: WeekData[]): Signal[] {
  if (!data || data.length === 0) return []
  
  const allSignals: Signal[] = [
    ...findTopicCorrelations(data),
    ...detectVelocityBreakouts(data),
    ...detectSentimentShifts(data)
  ]
  
  // Sort by priority and return top signals
  return allSignals
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 10) // Keep top 10 signals
}