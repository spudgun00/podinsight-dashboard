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
): Promise<SignalsResponse> {
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