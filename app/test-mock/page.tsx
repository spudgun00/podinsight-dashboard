"use client";

import { useIntelligenceDashboard } from "@/hooks/useIntelligenceDashboard";

export default function TestMockPage() {
  const { data, isLoading, isError, error } = useIntelligenceDashboard();
  
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  
  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Episode Intelligence Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <p>Mock Data Mode: <span className={useMockData ? "text-green-400" : "text-red-400"}>{useMockData ? 'ON' : 'OFF'}</span></p>
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
      </div>
      
      {isLoading && (
        <div className="p-4 bg-blue-900 rounded">
          Loading...
        </div>
      )}
      
      {isError && (
        <div className="p-4 bg-red-900 rounded">
          <p>Error: {error?.message}</p>
        </div>
      )}
      
      {data && (
        <div className="p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-bold mb-2">Data Loaded Successfully!</h2>
          <p>Total Episodes: {data.total_episodes}</p>
          <p>Generated At: {new Date(data.generated_at).toLocaleString()}</p>
          
          <h3 className="text-lg font-bold mt-4 mb-2">Episodes:</h3>
          <ul className="space-y-2">
            {data.episodes.map((episode) => (
              <li key={episode.episode_id} className="p-2 bg-gray-700 rounded">
                <p className="font-bold">{episode.title}</p>
                <p className="text-sm text-gray-400">{episode.podcast_name}</p>
                <p className="text-sm">Signals: {episode.signals.length}</p>
                <p className="text-sm">Score: {(episode.relevance_score * 100).toFixed(0)}%</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}