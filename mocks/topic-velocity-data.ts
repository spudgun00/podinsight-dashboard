import { TopicVelocityData } from '@/types/analytics';

// Generate realistic topic velocity data for demo mode
export function generateMockTopicVelocityData(weeks: number = 12): TopicVelocityData {
  const topics = ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"];
  
  // Base values and growth rates for each topic
  const topicProfiles = {
    "AI Agents": { base: 30, growth: 0.15, volatility: 5 }, // High growth
    "Capital Efficiency": { base: 45, growth: -0.02, volatility: 3 }, // Declining
    "DePIN": { base: 15, growth: 0.25, volatility: 8 }, // Explosive growth
    "B2B SaaS": { base: 35, growth: 0.08, volatility: 4 }, // Steady growth
    "Crypto/Web3": { base: 25, growth: 0.05, volatility: 10 }, // Volatile
  };
  
  const dataPoints = [];
  
  for (let i = 0; i < weeks; i++) {
    const weekNum = weeks - i;
    const weekData: any = { week: `W${weekNum}` };
    
    topics.forEach(topic => {
      const profile = topicProfiles[topic as keyof typeof topicProfiles];
      
      // Calculate value with growth and volatility
      const growthFactor = Math.pow(1 + profile.growth, i);
      const randomFactor = 1 + (Math.random() - 0.5) * profile.volatility / 100;
      const value = Math.round(profile.base * growthFactor * randomFactor);
      
      weekData[topic] = Math.max(5, Math.min(100, value)); // Keep between 5-100
    });
    
    dataPoints.unshift(weekData); // Add to beginning so W1 is first
  }
  
  return {
    success: true,
    data: dataPoints,
    metadata: {
      weeks,
      topics,
      generated_at: new Date().toISOString(),
      data_source: "podcast_transcripts"
    }
  };
}

// Pre-generated data for consistent demo
export const mockTopicVelocityData = generateMockTopicVelocityData(12);

// Previous quarter comparison data
export const mockPreviousQuarterData = generateMockTopicVelocityData(12).data.map(week => {
  const prevWeek = { ...week };
  // Reduce all values by 20-40% for previous quarter
  Object.keys(prevWeek).forEach(key => {
    if (key !== 'week' && typeof prevWeek[key] === 'number') {
      prevWeek[key] = Math.round(prevWeek[key] * (0.6 + Math.random() * 0.2));
    }
  });
  return prevWeek;
});