import { SentimentAnalysisResponse } from '@/lib/api';

/**
 * Generate mock sentiment data for demo mode with proper W1, W2 format
 */
export function mockSentimentDataForHeatmap(weeks: number = 12, topics: string[]): SentimentAnalysisResponse {
  const data: any[] = [];
  
  // Generate data for each week with W1, W2, W3 format
  for (let weekNum = 1; weekNum <= weeks; weekNum++) {
    topics.forEach(topic => {
      // Generate sentiment between -1 and 1
      let sentiment = 0;
      
      // Add some patterns to sentiment
      switch (topic) {
        case 'AI Agents':
          // Generally positive and increasing
          sentiment = 0.3 + (weekNum / weeks) * 0.3 + (Math.random() - 0.5) * 0.2;
          break;
        case 'Capital Efficiency':
          // Declining sentiment
          sentiment = 0.4 - (weekNum / weeks) * 0.3 + (Math.random() - 0.5) * 0.2;
          break;
        case 'DePIN':
          // Volatile sentiment
          sentiment = Math.sin(weekNum / 2) * 0.5 + (Math.random() - 0.5) * 0.3;
          break;
        case 'B2B SaaS':
          // Stable positive
          sentiment = 0.4 + (Math.random() - 0.5) * 0.2;
          break;
        case 'Crypto/Web3':
          // Recovering from negative
          sentiment = -0.3 + (weekNum / weeks) * 0.6 + (Math.random() - 0.5) * 0.3;
          break;
        default:
          sentiment = (Math.random() - 0.5) * 0.8;
      }
      
      // Clamp sentiment between -1 and 1
      sentiment = Math.max(-1, Math.min(1, sentiment));
      
      data.push({
        topic,
        week: `W${weekNum}`,  // Use W1, W2, W3 format for heatmap
        sentiment,
        episodeCount: Math.floor(Math.random() * 20) + 5
      });
    });
  }
  
  return {
    success: true,
    data,
    metadata: {
      weeks,
      topics,
      generated_at: new Date().toISOString()
    }
  };
}