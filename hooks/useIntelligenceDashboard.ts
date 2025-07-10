import { useQuery } from '@tanstack/react-query';
import { APIDashboardResponse } from '@/types/intelligence';
import { mockDashboardData } from '@/mocks/intelligence-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * Fetch dashboard intelligence data from API
 */
async function fetchDashboardData(): Promise<APIDashboardResponse> {
  // Use mock data if flag is set
  if (USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardData;
  }

  const response = await fetch(`${API_BASE_URL}/api/intelligence/dashboard?limit=8`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Auth header will be added when authentication is implemented
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Custom hook for fetching and managing intelligence dashboard data
 */
export function useIntelligenceDashboard() {
  return useQuery({
    queryKey: ['intelligence-dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchInterval: 60 * 1000, // Auto-refetch every minute
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Fetch detailed intelligence brief for a specific episode
 */
export async function fetchEpisodeBrief(episodeId: string) {
  // Use mock data if flag is set
  if (USE_MOCK_DATA) {
    const { mockEpisodeBrief } = await import('@/mocks/intelligence-data');
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEpisodeBrief(episodeId);
  }

  const response = await fetch(`${API_BASE_URL}/api/intelligence/brief/${episodeId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch episode brief: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Share episode intelligence via email or Slack
 */
export async function shareEpisodeIntelligence(data: {
  episode_id: string;
  method: 'email' | 'slack';
  recipient: string;
  include_summary: boolean;
  personal_note?: string;
}) {
  // Mock implementation if flag is set
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: `Episode intelligence shared via ${data.method} to ${data.recipient}`,
      shared_at: new Date().toISOString()
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/intelligence/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to share intelligence: ${response.statusText}`);
  }

  return response.json();
}