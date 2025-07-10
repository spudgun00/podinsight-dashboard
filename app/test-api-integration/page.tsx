"use client";

import { useTemporaryDashboardIntelligence as useIntelligenceDashboard } from "@/hooks/useTemporaryDashboardIntelligence";

export default function TestAPIIntegration() {
  const { data, isLoading, isError, error } = useIntelligenceDashboard();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Episode Intelligence API Test</h1>
      
      {isLoading && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300">Loading data from API...</p>
        </div>
      )}
      
      {isError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300">Error: {error?.message}</p>
        </div>
      )}
      
      {data && (
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 font-semibold">✅ API Connection Successful!</p>
            <p className="text-green-200 text-sm mt-2">
              Loaded {data.episodes.length} episodes from API
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">API Response Summary</h2>
            <pre className="text-xs overflow-auto bg-black/30 p-4 rounded">
              {JSON.stringify({
                total_episodes: data.total_episodes,
                episodes_count: data.episodes.length,
                generated_at: data.generated_at,
                first_episode: data.episodes[0] ? {
                  title: data.episodes[0].title,
                  podcast: data.episodes[0].podcast_name,
                  score: data.episodes[0].relevance_score,
                  signals_count: data.episodes[0].signals.length
                } : null
              }, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Episodes Loaded</h2>
            <div className="space-y-2">
              {data.episodes.map((episode, idx) => (
                <div key={episode.episode_id} className="bg-gray-700/50 p-3 rounded">
                  <p className="font-medium">{idx + 1}. {episode.title}</p>
                  <p className="text-sm text-gray-400">
                    {episode.podcast_name} • Score: {episode.relevance_score} • 
                    {episode.signals.length} signals
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}