import { TopicVelocityData } from '@/types/analytics';
import { DEFAULT_TOPICS } from '@/lib/utils';

/**
 * Generate mock topic velocity data for demo mode
 */
export function mockTopicVelocityData(weeks: number = 12, topics?: string[]): TopicVelocityData {
  const topicsToUse = topics || DEFAULT_TOPICS;
  const data: { [topic: string]: any[] } = {};
  
  // Get current date and work backwards
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentWeek = getWeekNumber(currentDate);
  
  // Generate data for each topic
  topicsToUse.forEach(topic => {
    data[topic] = [];
    
    // Generate data for requested number of weeks
    for (let i = weeks - 1; i >= 0; i--) {
      const weekDate = new Date(currentDate);
      weekDate.setDate(weekDate.getDate() - (i * 7));
      
      const year = weekDate.getFullYear();
      const weekNum = getWeekNumber(weekDate);
      const weekString = `${year}-W${String(weekNum).padStart(2, '0')}`;
      
      // Generate mentions with realistic growth patterns
      // Use (weeks - i - 1) to ensure the latest week has the highest values
      const weekProgress = weeks - i - 1;
      let baseMentions = 0;
      
      switch (topic) {
        case 'AI Agents':
          // AI Agents showing strong exponential growth
          baseMentions = 30 + Math.pow(weekProgress, 1.5) * 3 + Math.floor(Math.random() * 10);
          break;
        case 'Capital Efficiency':
          // Capital Efficiency declining slightly but still healthy
          baseMentions = 50 - weekProgress * 0.8 + Math.floor(Math.random() * 5);
          break;
        case 'DePIN':
          // DePIN showing volatility with upward trend
          baseMentions = 15 + Math.sin(weekProgress / 2) * 10 + weekProgress * 2.5 + Math.floor(Math.random() * 8);
          break;
        case 'B2B SaaS':
          // B2B SaaS steady linear growth
          baseMentions = 25 + weekProgress * 3 + Math.floor(Math.random() * 6);
          break;
        case 'Crypto/Web3':
          // Crypto/Web3 showing recovery with cyclical pattern
          baseMentions = 20 + Math.sin(weekProgress / 3) * 10 + weekProgress * 2 + Math.floor(Math.random() * 10);
          break;
        default:
          baseMentions = 20 + weekProgress * 2 + Math.floor(Math.random() * 20);
      }
      
      data[topic].push({
        week: weekString,
        mentions: Math.max(0, Math.floor(baseMentions)),
        date: weekDate.toISOString().split('T')[0]
      });
    }
  });
  
  return {
    data,
    metadata: {
      total_episodes: 1171,
      date_range: `Last ${weeks} weeks`,
      data_completeness: "100%"
    }
  };
}

/**
 * Generate mock topic signals data for demo mode
 */
export function mockTopicSignalsData(signalType?: string, limit: number = 10) {
  const signals = [
    "AI Agents seeing explosive 183% growth week-over-week, highest velocity in dataset",
    "DePIN mentions up 67% as infrastructure plays gain traction",
    "Capital Efficiency discussions declining as growth returns to focus",
    "B2B SaaS showing steady 25% weekly growth, consistent momentum",
    "Crypto/Web3 sentiment turning positive after 3-week decline",
    "AI infrastructure investments dominating LP discussions",
    "Developer tools category emerging with 142% growth spike",
    "Climate tech seeing renewed interest with 89% mention increase",
    "Remote work tools discussion declining 34% quarter-over-quarter",
    "Fintech consolidation theme emerging across multiple podcasts"
  ];
  
  return {
    signal_messages: signals.slice(0, limit),
    last_updated: new Date().toISOString(),
    metadata: {
      total_signals: signals.length,
      signal_types: ["growth", "decline", "emerging", "sentiment"]
    }
  };
}

/**
 * Generate mock sentiment data for demo mode
 */
export function mockSentimentData(weeks: number = 12, topics: string[]) {
  const data: any[] = [];
  const currentDate = new Date();
  
  for (let w = weeks - 1; w >= 0; w--) {
    const weekDate = new Date(currentDate);
    weekDate.setDate(weekDate.getDate() - (w * 7));
    const weekString = formatWeekString(weekDate);
    
    topics.forEach(topic => {
      // Generate sentiment between -1 and 1
      let sentiment = 0;
      
      // Add some patterns to sentiment
      switch (topic) {
        case 'AI Agents':
          // Generally positive and increasing
          sentiment = 0.3 + (weeks - w) * 0.02 + (Math.random() - 0.5) * 0.3;
          break;
        case 'Capital Efficiency':
          // Declining sentiment
          sentiment = 0.2 - (weeks - w) * 0.01 + (Math.random() - 0.5) * 0.2;
          break;
        case 'DePIN':
          // Volatile sentiment
          sentiment = Math.sin(w / 2) * 0.5 + (Math.random() - 0.5) * 0.3;
          break;
        case 'B2B SaaS':
          // Stable positive
          sentiment = 0.4 + (Math.random() - 0.5) * 0.2;
          break;
        case 'Crypto/Web3':
          // Recovering from negative
          sentiment = -0.3 + (weeks - w) * 0.04 + (Math.random() - 0.5) * 0.4;
          break;
        default:
          sentiment = (Math.random() - 0.5) * 0.8;
      }
      
      // Clamp sentiment between -1 and 1
      sentiment = Math.max(-1, Math.min(1, sentiment));
      
      data.push({
        topic,
        week: weekString,
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

// Helper functions
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function formatWeekString(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}