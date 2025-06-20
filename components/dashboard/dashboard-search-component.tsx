// Add this to your podinsight-dashboard repository
// components/search/SearchInterface.tsx

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchResult {
  episode_id: string;
  podcast_name: string;
  episode_title: string;
  published_at: string;
  similarity_score: number;
  excerpt: string;
  topics: string[];
}

interface SearchResponse {
  results: SearchResult[];
  total_results: number;
  cache_hit: boolean;
  search_id: string;
}

export function SearchInterface() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://podinsight-api.vercel.app/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: 10
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Search Podcast Insights</h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for AI agents, venture capital trends..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Found {results.length} results
          </h3>
          
          {results.map((result) => (
            <div
              key={result.episode_id}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {result.podcast_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(result.published_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {(result.similarity_score * 100).toFixed(1)}% match
                </div>
              </div>
              
              <p className="text-gray-700 mb-2">{result.excerpt}</p>
              
              {result.topics.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {result.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Usage in your dashboard:
// 1. Copy this file to your dashboard repository
// 2. Import and use in a page or component:
//    import { SearchInterface } from '@/components/search/SearchInterface';
//    
//    export default function SearchPage() {
//      return <SearchInterface />;
//    }