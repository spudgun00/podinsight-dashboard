import { useQuery } from '@tanstack/react-query';
import { APIDashboardResponse } from '@/types/intelligence';

// TODO: Remove this entire file once the backend dashboard endpoint is fixed
// This is a temporary workaround for the empty dashboard issue

/**
 * Temporary workaround to fetch dashboard data using our proxy API route
 * This avoids CORS issues by routing through our Next.js server
 */
async function fetchDashboardDataWorkaround(): Promise<APIDashboardResponse> {
  try {
    // Use our local API proxy to avoid CORS issues
    const response = await fetch('/api/intelligence/dashboard-proxy');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // The proxy returns data in the correct format already
    return data;
    
  } catch (error) {
    console.error('Failed to fetch dashboard data with workaround:', error);
    throw error;
  }
}

/**
 * Temporary hook for fetching dashboard data using the workaround
 * This should be replaced with useIntelligenceDashboard once the backend is fixed
 */
export function useTemporaryDashboardIntelligence() {
  return useQuery({
    queryKey: ['intelligence-dashboard-temp'],
    queryFn: fetchDashboardDataWorkaround,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes (less frequent due to N+1 pattern)
    refetchIntervalInBackground: false, // Don't refetch in background to reduce load
    retry: 2, // Fewer retries due to multiple requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}