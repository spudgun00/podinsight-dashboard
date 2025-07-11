import { useQuery } from '@tanstack/react-query';
import { useDataMode } from '@/contexts/DataModeContext';
import { fetchSentimentAnalysis, SentimentAnalysisResponse } from '@/lib/api';

export function useSentimentAnalysis(weeks: number = 12, topics?: string[]) {
  const { isLiveData } = useDataMode();
  
  return useQuery<SentimentAnalysisResponse>({
    queryKey: ['sentiment-analysis', weeks, topics, isLiveData],
    queryFn: async () => {
      if (!isLiveData) {
        const { mockSentimentData } = await import('@/mocks/sentiment-mock-data');
        const topicsToUse = topics || ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"];
        
        // Filter data based on requested weeks and topics
        const filteredData = mockSentimentData.filter(item => {
          const weekNum = parseInt(item.week.substring(1));
          return weekNum <= weeks && topicsToUse.includes(item.topic);
        });
        
        return {
          success: true,
          data: filteredData,
          metadata: {
            weeks,
            topics: topicsToUse,
            generated_at: new Date().toISOString()
          }
        };
      }
      return fetchSentimentAnalysis(weeks, topics);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: isLiveData ? 5 * 60 * 1000 : false, // Only refetch for live data
  });
}