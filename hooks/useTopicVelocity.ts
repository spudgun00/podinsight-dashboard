import { useQuery } from '@tanstack/react-query';
import { useDataMode } from '@/contexts/DataModeContext';
import { fetchTopicVelocity } from '@/lib/api';
import { TopicVelocityData } from '@/types/analytics';

export function useTopicVelocity(weeks: number = 12, topics?: string[]) {
  const { isLiveData } = useDataMode();
  
  return useQuery<TopicVelocityData>({
    queryKey: ['topic-velocity', weeks, topics, isLiveData],
    queryFn: async () => {
      if (!isLiveData) {
        const { mockTopicVelocityData } = await import('@/mocks/topic-velocity-data');
        return mockTopicVelocityData;
      }
      return fetchTopicVelocity(weeks, topics);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: isLiveData ? 5 * 60 * 1000 : false, // Only refetch for live data
  });
}