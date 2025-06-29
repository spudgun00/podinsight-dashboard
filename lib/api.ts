import { TopicVelocityData } from "@/types/analytics";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://podinsight-api.vercel.app";

export async function fetchTopicVelocity(
  weeks: number = 12,
  topics?: string[]
): Promise<TopicVelocityData> {
  const params = new URLSearchParams();
  params.append("weeks", weeks.toString());
  
  if (topics && topics.length > 0) {
    params.append("topics", topics.join(","));
  }

  const response = await fetch(`${API_URL}/api/topic-velocity?${params}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch topic data: ${response.statusText}`);
  }

  return response.json();
}

export interface SignalsResponse {
  signals: {
    [key: string]: any[];
  };
}

export interface SentimentData {
  topic: string;
  week: string;
  sentiment: number;
  episodeCount: number;
}

export interface SentimentAnalysisResponse {
  success: boolean;
  data: SentimentData[];
  metadata: {
    weeks: number;
    topics: string[];
    generated_at: string;
  };
}

export async function fetchSentimentAnalysis(
  weeks: number = 12,
  topics?: string[]
): Promise<SentimentAnalysisResponse> {
  const params = new URLSearchParams();
  params.append("weeks", weeks.toString());
  
  // Add topics as array parameters
  const topicsToUse = topics || ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"];
  topicsToUse.forEach(topic => {
    params.append("topics[]", topic);
  });

  try {
    const response = await fetch(`${API_URL}/api/sentiment_analysis_v2?${params}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sentiment data: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching sentiment data:", error);
    // Return empty data on error
    return {
      success: false,
      data: [],
      metadata: {
        weeks,
        topics: topicsToUse,
        generated_at: new Date().toISOString()
      }
    };
  }
}

export interface SignalsData {
  signal_messages: string[];
  last_updated: string | null;
  metadata: {
    total_signals: number;
    signal_types: string[];
  };
}

export async function fetchTopicSignals(
  signalType?: string,
  limit: number = 10
): Promise<SignalsData> {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  
  if (signalType) {
    params.append("signal_type", signalType);
  }

  const response = await fetch(`${API_URL}/api/signals?${params}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch signals: ${response.statusText}`);
  }

  return response.json();
}