import { SentimentData } from '@/lib/api';

// Generate 12 weeks of sentiment data for demo mode
export function generateMockSentimentData(weeks: number = 12): SentimentData[] {
  const topics = ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"];
  const data: SentimentData[] = [];
  
  // Create a more realistic sentiment pattern for each topic
  const sentimentPatterns = {
    "AI Agents": { base: 0.7, trend: 0.02, volatility: 0.1 }, // Very positive, trending up
    "Capital Efficiency": { base: -0.3, trend: 0.01, volatility: 0.15 }, // Slightly negative, improving
    "DePIN": { base: 0.4, trend: 0.03, volatility: 0.2 }, // Positive, volatile
    "B2B SaaS": { base: 0.2, trend: -0.01, volatility: 0.1 }, // Slightly positive, declining
    "Crypto/Web3": { base: -0.1, trend: 0.02, volatility: 0.3 }, // Neutral, high volatility
  };
  
  // Generate data for each week and topic
  for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
    const weekNum = weeks - weekIndex; // Reverse order so W1 is most recent
    const weekLabel = `W${weekNum}`;
    
    topics.forEach(topic => {
      const pattern = sentimentPatterns[topic as keyof typeof sentimentPatterns];
      
      // Calculate sentiment with trend and random volatility
      const trendComponent = pattern.trend * weekIndex;
      const randomComponent = (Math.random() - 0.5) * pattern.volatility;
      const sentiment = Math.max(-1, Math.min(1, 
        pattern.base + trendComponent + randomComponent
      ));
      
      // Episode count varies by topic popularity
      const baseEpisodeCount = topic === "AI Agents" ? 25 : 
                             topic === "B2B SaaS" ? 20 : 
                             topic === "Capital Efficiency" ? 15 : 
                             topic === "DePIN" ? 18 : 12;
      
      const episodeCount = Math.max(1, 
        baseEpisodeCount + Math.floor((Math.random() - 0.5) * 8)
      );
      
      data.push({
        topic,
        week: weekLabel,
        sentiment,
        episodeCount
      });
    });
  }
  
  return data;
}

// Pre-generated data for consistent demo experience
export const mockSentimentData = generateMockSentimentData(12);