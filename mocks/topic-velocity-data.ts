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
  
  // Create data in the format expected by processApiResponse
  // Each topic should have an array of {week, mentions, date} objects
  const data: any = {};
  
  topics.forEach(topic => {
    data[topic] = [];
    const profile = topicProfiles[topic as keyof typeof topicProfiles];
    
    for (let i = 0; i < weeks; i++) {
      const weekNum = weeks - i;
      const weekLabel = `2024-W${weekNum.toString().padStart(2, '0')}`;
      
      // Calculate value with growth and volatility
      const growthFactor = Math.pow(1 + profile.growth, i);
      const randomFactor = 1 + (Math.random() - 0.5) * profile.volatility / 100;
      const value = Math.round(profile.base * growthFactor * randomFactor);
      
      data[topic].unshift({
        week: weekLabel,
        mentions: Math.max(5, Math.min(100, value)),
        date: new Date(2024, 0, 1 + (weekNum - 1) * 7).toISOString()
      });
    }
  });
  
  return {
    success: true,
    data,
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

// Generate previous quarter data in the simple array format expected by the component
export function generateMockPreviousQuarterData(weeks: number = 12) {
  const topics = ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"];
  const data = [];
  
  for (let i = 0; i < weeks; i++) {
    const weekNum = weeks - i;
    const weekData: any = { 
      week: `W${weekNum}`,
      fullWeek: `2024-W${weekNum.toString().padStart(2, '0')}`
    };
    
    // Use lower base values for previous quarter
    const baseValues = {
      "AI Agents": 20,
      "Capital Efficiency": 48,
      "DePIN": 10,
      "B2B SaaS": 30,
      "Crypto/Web3": 20
    };
    
    topics.forEach(topic => {
      const base = baseValues[topic as keyof typeof baseValues];
      const variance = 0.8 + Math.random() * 0.4; // 80-120% variance
      weekData[topic] = Math.round(base * variance);
    });
    
    data.unshift(weekData);
  }
  
  return data;
}

export const mockPreviousQuarterData = generateMockPreviousQuarterData(12);