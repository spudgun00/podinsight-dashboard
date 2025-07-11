import { APIEpisode, APISignal } from '@/types/intelligence'
import { DetailedEpisode, Signal, PortfolioMention, Soundbite } from '@/lib/mock-brief-data'
import type { Episode, SignalType } from '@/lib/mock-episode-data'

/**
 * Helper function to convert seconds into "MM:SS" format.
 * Handles undefined or negative timestamps gracefully.
 */
function formatSecondsToMMSS(seconds: number | undefined | null | string): string {
  // Handle various input types
  if (seconds === undefined || seconds === null) {
    console.warn('Timestamp is undefined or null, using default');
    return "00:00";
  }
  
  // Convert string to number if needed
  const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  
  // Check if conversion resulted in NaN or negative number
  if (isNaN(numSeconds) || numSeconds < 0) {
    console.warn(`Invalid timestamp value: ${seconds}, using default`);
    return "00:00";
  }
  
  const minutes = Math.floor(numSeconds / 60);
  const remainingSeconds = Math.floor(numSeconds % 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Helper function to parse the content of a portfolio mention signal.
 * Attempts to extract company name and context from the content.
 */
function parsePortfolioMentionContent(content: string): { company: string; context: string; sentiment: string } {
  // Try to extract company name from quotes or first part of sentence
  const quotedMatch = content.match(/"([^"]+)"/);
  const company = quotedMatch ? quotedMatch[1] : 'Portfolio Company';
  
  // The rest is context
  const context = content;
  
  // Detect sentiment based on keywords
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  const positiveKeywords = ['growth', 'success', 'leading', 'strong', 'excellent', 'impressive'];
  const negativeKeywords = ['concern', 'challenge', 'pressure', 'competition', 'struggle'];
  
  const lowerContent = content.toLowerCase();
  if (positiveKeywords.some(keyword => lowerContent.includes(keyword))) {
    sentiment = 'positive';
  } else if (negativeKeywords.some(keyword => lowerContent.includes(keyword))) {
    sentiment = 'negative';
  }
  
  return { company, context, sentiment };
}

/**
 * Extract use case from soundbite content
 */
function extractSoundbiteUseCase(content: string): string {
  // Try to determine use case based on content patterns
  if (content.toLowerCase().includes('invest') || content.toLowerCase().includes('fund')) {
    return 'Investment thesis presentations';
  } else if (content.toLowerCase().includes('market') || content.toLowerCase().includes('trend')) {
    return 'Market insights and trend analysis';
  } else if (content.toLowerCase().includes('founder') || content.toLowerCase().includes('build')) {
    return 'LP updates, thought leadership content';
  }
  return 'Strategic insights and decision-making';
}

/**
 * Get podcast abbreviation based on podcast name
 */
function getPodcastAbbreviation(podcastName: string): string {
  const abbreviations: Record<string, string> = {
    'All-In with Chamath, Jason, Sacks & Friedberg': 'AI',
    'All-In': 'AI',
    '20VC': '20',
    'Acquired': 'AC',
    'The European VC': 'EV',
    'European VC': 'EV',
    'Invest Like the Best': 'IB',
    'My First Million': 'MFM',
    'The Tim Ferriss Show': 'TF',
    'Masters of Scale': 'MS',
  };
  
  return abbreviations[podcastName] || podcastName.slice(0, 2).toUpperCase();
}

/**
 * Get signal type for Episode format
 */
function getSignalType(signals: APISignal[]): SignalType {
  // Priority order for determining main signal type
  if (signals.some(s => s.type === 'investable')) return 'red_hot';
  if (signals.some(s => s.type === 'competitive')) return 'high_value';
  if (signals.some(s => s.type === 'portfolio')) return 'portfolio_mention';
  return 'market_intel';
}

/**
 * Format duration from seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Calculate relative time from published date
 */
function getTimeAgo(publishedAt: string): string {
  const date = new Date(publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

/**
 * Converts an APIEpisode object into a DetailedEpisode object,
 * transforming and grouping signals as required by the IntelligenceBriefModal component.
 */
export function convertApiEpisodeToDetailedEpisode(apiEpisode: APIEpisode): DetailedEpisode {
  // First create the base Episode format
  const baseEpisode: Episode = {
    id: apiEpisode.episode_id,
    title: apiEpisode.title,
    abbreviation: getPodcastAbbreviation(apiEpisode.podcast_name),
    signal: getSignalType(apiEpisode.signals),
    score: Math.round(apiEpisode.relevance_score * 100),
    timeAgo: getTimeAgo(apiEpisode.published_at),
    duration: formatDuration(apiEpisode.duration_seconds),
    intel: apiEpisode.signals.slice(0, 3).map(s => s.content),
    podcast: apiEpisode.podcast_name,
    publishedAt: new Date(apiEpisode.published_at)
  };
  
  // Create the detailed episode with grouped signals
  const detailedEpisode: DetailedEpisode = {
    ...baseEpisode,
    investableSignals: [],
    competitiveIntel: [],
    portfolioMentions: [],
    soundbites: []
  };

  // Process and group signals by type
  const episodeDurationSeconds = apiEpisode.duration_seconds || 3600; // Default to 1 hour if not provided
  
  apiEpisode.signals.forEach((apiSignal, index) => {
    // Debug logging to see what we're getting from API
    if (apiSignal.timestamp === undefined || apiSignal.timestamp === null) {
      console.log(`Signal without timestamp: ${apiSignal.type} - ${apiSignal.content.substring(0, 50)}...`);
    }
    
    // If timestamp is missing, generate one based on signal position
    let timestamp = apiSignal.timestamp;
    if (timestamp === undefined || timestamp === null || isNaN(Number(timestamp))) {
      // Distribute signals evenly throughout the episode
      const spacing = episodeDurationSeconds / (apiEpisode.signals.length + 1);
      timestamp = spacing * (index + 1);
      console.log(`Generated timestamp ${timestamp} for signal ${index + 1}`);
    }
    
    const formattedTimestamp = formatSecondsToMMSS(timestamp);

    switch (apiSignal.type) {
      case 'investable':
        detailedEpisode.investableSignals.push({
          timestamp: formattedTimestamp,
          text: apiSignal.content,
        });
        break;
        
      case 'competitive':
        detailedEpisode.competitiveIntel.push({
          timestamp: formattedTimestamp,
          text: apiSignal.content,
        });
        break;
        
      case 'portfolio':
        const { company, context, sentiment } = parsePortfolioMentionContent(apiSignal.content);
        detailedEpisode.portfolioMentions.push({
          timestamp: formattedTimestamp,
          company,
          context,
          sentiment,
          actionRequired: sentiment === 'negative' // Flag negative mentions for action
        });
        break;
        
      case 'sound_bite':
        detailedEpisode.soundbites.push({
          quote: apiSignal.content,
          useFor: extractSoundbiteUseCase(apiSignal.content)
        });
        break;
        
      default:
        console.warn(`Unknown signal type encountered: ${(apiSignal as any).type} for episode ${apiEpisode.episode_id}`);
    }
  });

  // Ensure we have at least some content in each section for better UX
  if (detailedEpisode.investableSignals.length === 0) {
    detailedEpisode.investableSignals.push({
      timestamp: "00:00",
      text: "No investable signals detected in this episode"
    });
  }
  
  if (detailedEpisode.competitiveIntel.length === 0) {
    detailedEpisode.competitiveIntel.push({
      timestamp: "00:00",
      text: "No competitive intelligence found in this episode"
    });
  }
  
  if (detailedEpisode.soundbites.length === 0 && apiEpisode.key_insights.length > 0) {
    // Convert key insights to soundbites if no sound_bite signals exist
    detailedEpisode.soundbites = apiEpisode.key_insights.slice(0, 2).map(insight => ({
      quote: insight,
      useFor: "Strategic insights and key takeaways"
    }));
  }

  return detailedEpisode;
}

/**
 * Fetch detailed episode data from API and convert to DetailedEpisode format
 */
export async function fetchAndConvertEpisodeBrief(episodeId: string, isDemoMode: boolean): Promise<DetailedEpisode> {
  const { fetchEpisodeBrief } = await import('@/hooks/useIntelligenceDashboard');
  
  try {
    const apiEpisode = await fetchEpisodeBrief(episodeId, isDemoMode);
    return convertApiEpisodeToDetailedEpisode(apiEpisode);
  } catch (error) {
    console.error('Failed to fetch episode brief:', error);
    throw error;
  }
}