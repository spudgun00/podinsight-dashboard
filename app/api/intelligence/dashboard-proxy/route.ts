import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://podinsight-api.vercel.app';

interface DebugEpisode {
  episode_id_in_intelligence: string;
  title: string;
  has_signals: boolean;
}

export async function GET() {
  try {
    // Step 1: Get list of episodes with intelligence from debug endpoint
    console.log('Fetching episode list from debug endpoint...');
    const debugResponse = await fetch(
      `${API_BASE_URL}/api/intelligence/find-episodes-with-intelligence`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      }
    );
    
    if (!debugResponse.ok) {
      console.error('Debug endpoint failed:', debugResponse.status, debugResponse.statusText);
      throw new Error(`Failed to fetch episode list: ${debugResponse.statusText}`);
    }
    
    const debugData = await debugResponse.json();
    const episodes = debugData.matches as DebugEpisode[];
    
    console.log(`Found ${episodes?.length || 0} episodes with intelligence`);
    
    if (!episodes || episodes.length === 0) {
      return NextResponse.json({
        episodes: [],
        total_episodes: 0,
        generated_at: new Date().toISOString()
      });
    }
    
    // Step 2: Take first 8 episodes for dashboard
    const dashboardEpisodes = episodes.slice(0, 8);
    
    // Step 3: Fetch individual briefs using Promise.allSettled for resilience
    console.log('Fetching individual episode briefs...');
    const briefPromises = dashboardEpisodes.map(episode =>
      fetch(`${API_BASE_URL}/api/intelligence/brief/${episode.episode_id_in_intelligence}`, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      })
        .then(res => res.ok ? res.json() : Promise.reject(new Error(`Failed to fetch brief for ${episode.episode_id_in_intelligence}`)))
        .catch(error => {
          console.error(`Error fetching brief for ${episode.episode_id_in_intelligence}:`, error);
          return null; // Return null for failed requests
        })
    );
    
    const briefResults = await Promise.allSettled(briefPromises);
    
    // Step 4: Process successful results
    const successfulBriefs: any[] = [];
    
    briefResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const brief = result.value;
        successfulBriefs.push({
          episode_id: brief.episode_id || dashboardEpisodes[index].episode_id_in_intelligence,
          title: brief.title || dashboardEpisodes[index].title,
          podcast_name: brief.podcast_name || 'Unknown Podcast',
          published_at: brief.published_at || new Date().toISOString(),
          duration_seconds: brief.duration_seconds || 0,
          relevance_score: brief.relevance_score || 0.5,
          signals: brief.signals || [],
          summary: brief.summary || '',
          key_insights: brief.key_insights || [],
          audio_url: brief.audio_url || ''
        });
      }
    });
    
    console.log(`Successfully loaded ${successfulBriefs.length}/${dashboardEpisodes.length} episodes`);
    
    return NextResponse.json({
      episodes: successfulBriefs,
      total_episodes: successfulBriefs.length,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Dashboard proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}