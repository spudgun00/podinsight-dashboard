import { APIEpisode, APISignal, TopItem, UrgencyLevel } from '@/types/intelligence';

/**
 * Map confidence scores to urgency levels
 */
function getUrgencyLevel(confidence: number): UrgencyLevel {
  if (confidence > 0.8) return 'critical';
  if (confidence > 0.6) return 'high';
  return 'normal';
}

/**
 * Extract value and change metrics from signal content
 */
function extractMetadata(content: string): { value?: string; change?: string } {
  const metadata: { value?: string; change?: string } = {};
  
  // Extract dollar amounts
  const dollarMatch = content.match(/\$[\d.]+[MBK]?/);
  if (dollarMatch) {
    metadata.value = dollarMatch[0];
  }
  
  // Extract percentage changes
  const percentMatch = content.match(/[+-]?\d+%/);
  if (percentMatch) {
    metadata.change = percentMatch[0];
  }
  
  return metadata;
}

/**
 * Parse signal content to extract title and description
 */
function parseSignalContent(signal: APISignal): { title: string; description: string } {
  const content = signal.content;
  
  // Try to split by common patterns
  const patterns = [
    /^([^.!]+)[.!]\s*(.+)$/, // Split by first sentence
    /^(.+?):\s*(.+)$/, // Split by colon
    /^(.+?)\s*-\s*(.+)$/, // Split by dash
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return {
        title: match[1].trim(),
        description: match[2].trim()
      };
    }
  }
  
  // Fallback: use first 50 chars as title
  const title = content.substring(0, 50);
  const description = content.length > 50 ? content.substring(50) : content;
  
  return { title, description };
}

/**
 * Transform episodes to Market Signals items
 */
export function extractMarketSignals(episodes: APIEpisode[]): TopItem[] {
  const items: TopItem[] = [];
  
  episodes.forEach(episode => {
    episode.signals.forEach(signal => {
      if (signal.type === 'investable' || signal.type === 'sound_bite') {
        const { title, description } = parseSignalContent(signal);
        const metadata = extractMetadata(signal.content);
        
        items.push({
          id: `ms-${episode.episode_id}-${items.length}`,
          title,
          description,
          urgency: getUrgencyLevel(signal.confidence),
          metadata: {
            source: episode.podcast_name,
            ...metadata
          },
          episodeId: episode.episode_id,
          signalType: signal.type
        });
      }
    });
  });
  
  // Sort by urgency and confidence
  return items.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, normal: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  }).slice(0, 3); // Top 3 items
}

/**
 * Transform episodes to Deal Intelligence items
 */
export function extractDealIntelligence(episodes: APIEpisode[]): TopItem[] {
  const items: TopItem[] = [];
  
  episodes.forEach(episode => {
    episode.signals.forEach(signal => {
      if (signal.type === 'investable') {
        const content = signal.content.toLowerCase();
        // Focus on funding-related signals
        if (content.includes('rais') || content.includes('fund') || 
            content.includes('series') || content.includes('valuation')) {
          const { title, description } = parseSignalContent(signal);
          const metadata = extractMetadata(signal.content);
          
          items.push({
            id: `di-${episode.episode_id}-${items.length}`,
            title,
            description,
            urgency: getUrgencyLevel(signal.confidence),
            metadata: {
              source: episode.podcast_name,
              ...metadata
            },
            episodeId: episode.episode_id,
            signalType: signal.type
          });
        }
      }
    });
  });
  
  return items.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, normal: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  }).slice(0, 3);
}

/**
 * Transform episodes to Portfolio Pulse items
 */
export function extractPortfolioPulse(episodes: APIEpisode[]): TopItem[] {
  const items: TopItem[] = [];
  
  episodes.forEach(episode => {
    episode.signals.forEach(signal => {
      if (signal.type === 'portfolio' || signal.type === 'competitive') {
        const { title, description } = parseSignalContent(signal);
        const metadata = extractMetadata(signal.content);
        
        items.push({
          id: `pp-${episode.episode_id}-${items.length}`,
          title,
          description,
          urgency: getUrgencyLevel(signal.confidence),
          metadata: {
            source: episode.podcast_name,
            ...metadata
          },
          episodeId: episode.episode_id,
          signalType: signal.type
        });
      }
    });
  });
  
  return items.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, normal: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  }).slice(0, 3);
}

/**
 * Generate Executive Brief items from all signals
 */
export function generateExecutiveBrief(episodes: APIEpisode[]): TopItem[] {
  const items: TopItem[] = [];
  
  // Get highest confidence signals across all types
  const allSignals: { signal: APISignal; episode: APIEpisode }[] = [];
  
  episodes.forEach(episode => {
    episode.signals.forEach(signal => {
      allSignals.push({ signal, episode });
    });
  });
  
  // Sort by confidence and take top items
  allSignals
    .sort((a, b) => b.signal.confidence - a.signal.confidence)
    .slice(0, 3)
    .forEach((item, index) => {
      const { title, description } = parseSignalContent(item.signal);
      
      items.push({
        id: `eb-${item.episode.episode_id}-${index}`,
        title,
        description,
        urgency: getUrgencyLevel(item.signal.confidence),
        metadata: {
          source: `${item.episode.podcast_name} - ${item.signal.type}`
        },
        episodeId: item.episode.episode_id,
        signalType: item.signal.type
      });
    });
  
  return items;
}

/**
 * Count total signals by type
 */
export function countSignalsByType(episodes: APIEpisode[]): {
  marketSignals: number;
  dealIntelligence: number;
  portfolioPulse: number;
  executiveBrief: number;
} {
  let marketSignals = 0;
  let dealIntelligence = 0;
  let portfolioPulse = 0;
  
  episodes.forEach(episode => {
    episode.signals.forEach(signal => {
      if (signal.type === 'investable') {
        marketSignals++;
        const content = signal.content.toLowerCase();
        if (content.includes('rais') || content.includes('fund') || 
            content.includes('series') || content.includes('valuation')) {
          dealIntelligence++;
        }
      } else if (signal.type === 'sound_bite') {
        marketSignals++;
      } else if (signal.type === 'portfolio' || signal.type === 'competitive') {
        portfolioPulse++;
      }
    });
  });
  
  // Executive brief shows total unique insights
  const executiveBrief = Math.min(episodes.length, 5);
  
  return { marketSignals, dealIntelligence, portfolioPulse, executiveBrief };
}