import { useQuery } from '@tanstack/react-query';
import { APIDashboardResponse } from '@/types/intelligence';
import { useDataMode } from '@/contexts/DataModeContext';

// TODO: Remove this entire file once the backend dashboard endpoint is fixed
// This is a temporary workaround for the empty dashboard issue

/**
 * Temporary workaround to fetch dashboard data using our proxy API route
 * This avoids CORS issues by routing through our Next.js server
 */
async function fetchDashboardDataWorkaround(isLiveData: boolean): Promise<APIDashboardResponse> {
  try {
    // Use demo data if demo mode is selected
    if (!isLiveData) {
      const { generateMockDashboardResponse } = await import('@/lib/mock-api');
      return generateMockDashboardResponse();
    }
    
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
  const { isLiveData } = useDataMode();
  
  return useQuery({
    queryKey: ['intelligence-dashboard-temp', isLiveData],
    queryFn: () => fetchDashboardDataWorkaround(isLiveData),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: isLiveData ? 2 * 60 * 1000 : false, // Only refetch for live data
    refetchIntervalInBackground: false, // Don't refetch in background to reduce load
    retry: 2, // Fewer retries due to multiple requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}