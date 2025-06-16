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