'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { APIEpisode } from '@/types/intelligence';
import type { ExtendedEpisode } from '@/lib/all-episodes-mock-data';
import { convertApiEpisodeToDetailedEpisode } from '@/lib/api-to-detailed-episode-converter';
import { useDemoMode } from '@/contexts/DataModeContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Request interface for API parameters
export interface AllEpisodesRequest {
  page?: number;
  pageSize?: number;
  podcast?: string;
  signalType?: string;
  startDate?: string;
  endDate?: string;
  minScore?: number;
  query?: string;
  sortBy?: 'date' | 'score';
  sortOrder?: 'asc' | 'desc';
}

// Response interface from API
export interface AllEpisodesResponse {
  episodes: APIEpisode[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Convert APIEpisode to ExtendedEpisode format expected by AllEpisodesView
 */
function mapAPIEpisodeToExtendedEpisode(apiEpisode: APIEpisode): ExtendedEpisode {
  const detailedEpisode = convertApiEpisodeToDetailedEpisode(apiEpisode);
  
  return {
    id: detailedEpisode.id,
    title: detailedEpisode.title,
    abbreviation: detailedEpisode.abbreviation,
    signal: detailedEpisode.signal,
    score: detailedEpisode.score,
    timeAgo: detailedEpisode.timeAgo,
    duration: detailedEpisode.duration,
    intel: detailedEpisode.intel,
    podcast: detailedEpisode.podcast,
    publishedAt: detailedEpisode.publishedAt,
    publishedDate: detailedEpisode.publishedAt, // ExtendedEpisode uses publishedDate
    isSearchResult: false
  };
}

/**
 * Hook to fetch all episodes with infinite scrolling support
 */
export function useAllEpisodesAPI(filters: Omit<AllEpisodesRequest, 'page' | 'pageSize'> & { enabled?: boolean }) {
  const { isDemoMode } = useDemoMode();
  const pageSize = 15; // Fixed page size as per requirements
  const { enabled = true, ...filterParams } = filters;
  
  /**
   * Fetch episodes from API
   */
  async function fetchEpisodes(params: AllEpisodesRequest): Promise<AllEpisodesResponse> {
    // Use mock data if in demo mode
    if (isDemoMode) {
      const { allEpisodesData } = await import('@/lib/all-episodes-mock-data');
      
      // Simulate API response with pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 15;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      // Apply filters to mock data
      let filteredData = [...allEpisodesData];
      
      // Filter by search query
      if (params.query) {
        const query = params.query.toLowerCase();
        filteredData = filteredData.filter(ep => 
          ep.title.toLowerCase().includes(query) ||
          ep.podcast.toLowerCase().includes(query) ||
          ep.intel.some(i => i.toLowerCase().includes(query))
        );
      }
      
      // Filter by podcast
      if (params.podcast && params.podcast !== 'all') {
        filteredData = filteredData.filter(ep => ep.podcast === params.podcast);
      }
      
      // Filter by signal type
      if (params.signalType && params.signalType !== 'all') {
        filteredData = filteredData.filter(ep => ep.signal === params.signalType);
      }
      
      // Filter by minimum score
      if (params.minScore) {
        filteredData = filteredData.filter(ep => ep.score >= params.minScore);
      }
      
      // Sort data
      if (params.sortBy === 'score') {
        filteredData.sort((a, b) => params.sortOrder === 'asc' ? a.score - b.score : b.score - a.score);
      } else {
        // Default sort by date
        filteredData.sort((a, b) => {
          const dateA = a.publishedDate.getTime();
          const dateB = b.publishedDate.getTime();
          return params.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
      }
      
      const paginatedData = filteredData.slice(startIndex, endIndex);
      const totalCount = filteredData.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Convert to API format
      const apiEpisodes: APIEpisode[] = paginatedData.map(ep => ({
        episode_id: ep.id,
        title: ep.title,
        podcast_name: ep.podcast,
        published_at: ep.publishedAt.toISOString(),
        duration_seconds: parseInt(ep.duration) * 60, // Assume duration is in minutes
        relevance_score: ep.score / 100,
        signals: ep.intel.map((content, idx) => ({
          type: ep.signal === 'red_hot' ? 'investable' : 
                ep.signal === 'high_value' ? 'competitive' : 
                ep.signal === 'portfolio_mention' ? 'portfolio' : 'sound_bite',
          content,
          confidence: 0.8,
          timestamp: idx * 600 // Generate timestamps every 10 minutes
        })),
        summary: `Episode from ${ep.podcast}`,
        key_insights: ep.intel
      }));
      
      return {
        episodes: apiEpisodes,
        totalCount,
        currentPage: page,
        pageSize,
        totalPages,
        hasMore: page < totalPages
      };
    }
    
    // Build query string
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('limit', params.pageSize.toString());
    if (params.podcast && params.podcast !== 'all') queryParams.append('podcast', params.podcast);
    if (params.signalType && params.signalType !== 'all') queryParams.append('signal_type', params.signalType);
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);
    if (params.minScore) queryParams.append('min_score', params.minScore.toString());
    if (params.query) queryParams.append('q', params.query);
    if (params.sortBy) queryParams.append('sort_by', params.sortBy);
    if (params.sortOrder) queryParams.append('sort_order', params.sortOrder);
    
    // TEMPORARY: Use dashboard endpoint until episodes endpoint is implemented
    // TODO: Change to /api/intelligence/episodes when backend implements it
    const url = `${API_BASE_URL}/api/intelligence/dashboard?limit=50`;
    console.log('Fetching episodes from:', url);
    console.log('Note: Using dashboard endpoint temporarily. Filters are not applied server-side yet.');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch episodes: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // TEMPORARY: Transform dashboard response to expected format
      // The dashboard endpoint returns { episodes: APIEpisode[], total_episodes: number }
      // We need to transform it to match AllEpisodesResponse
      if (data.episodes && Array.isArray(data.episodes)) {
        const page = params.page || 1;
        const pageSize = params.pageSize || 15;
        
        // Apply client-side filtering until backend supports it
        let filteredEpisodes = data.episodes;
        
        // Filter by search query
        if (params.query) {
          const query = params.query.toLowerCase();
          filteredEpisodes = filteredEpisodes.filter((ep: APIEpisode) => 
            ep.title.toLowerCase().includes(query) ||
            ep.podcast_name.toLowerCase().includes(query) ||
            ep.signals.some(s => s.content.toLowerCase().includes(query))
          );
        }
        
        // Filter by minimum score
        if (params.minScore) {
          const minScore = params.minScore / 100; // Convert to 0-1 range
          filteredEpisodes = filteredEpisodes.filter((ep: APIEpisode) => 
            ep.relevance_score >= minScore
          );
        }
        
        // Sort by score descending (default is by date)
        filteredEpisodes.sort((a: APIEpisode, b: APIEpisode) => 
          b.relevance_score - a.relevance_score
        );
        
        // Paginate
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedEpisodes = filteredEpisodes.slice(startIndex, endIndex);
        
        const totalCount = filteredEpisodes.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        
        return {
          episodes: paginatedEpisodes,
          totalCount,
          currentPage: page,
          pageSize,
          totalPages,
          hasMore: page < totalPages
        };
      }
      
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  return useInfiniteQuery({
    queryKey: ['allEpisodes', filterParams, isDemoMode],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await fetchEpisodes({
          ...filterParams,
          page: pageParam as number,
          pageSize,
          sortBy: 'date',
          sortOrder: 'desc',
        });
        
        // Convert API episodes to ExtendedEpisode format
        const convertedEpisodes = response.episodes.map(mapAPIEpisodeToExtendedEpisode);
        
        return {
          ...response,
          episodes: convertedEpisodes
        };
      } catch (error) {
        console.error('Error in useAllEpisodesAPI:', error);
        // Return empty response on error to prevent infinite loading
        return {
          episodes: [],
          totalCount: 0,
          currentPage: pageParam as number,
          pageSize,
          totalPages: 0,
          hasMore: false
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once on failure
    enabled: enabled, // Only fetch when enabled
  });
}