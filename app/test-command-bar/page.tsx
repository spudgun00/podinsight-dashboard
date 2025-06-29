"use client"

import { SearchCommandBar } from "@/components/dashboard/search-command-bar"
import { useState } from "react"

export default function TestCommandBarPage() {
  const [lastSearch, setLastSearch] = useState<string>("")
  const [useMockData, setUseMockData] = useState(true)

  // Override fetch to use mock data when enabled
  if (typeof window !== 'undefined' && useMockData) {
    const originalFetch = window.fetch
    // @ts-ignore
    window.fetch = async (url: string, options?: any) => {
      if (url === '/api/search' && options?.method === 'POST') {
        const { mockPerformSearch } = await import('@/lib/mock-api')
        const body = JSON.parse(options.body)
        const mockData = await mockPerformSearch(body.query)
        
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => mockData
        } as Response
      }
      return originalFetch(url, options)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">PodInsightHQ</h1>
              <p className="text-sm text-gray-400">Command Bar Test Page</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={useMockData}
                  onChange={(e) => setUseMockData(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-purple-500"
                />
                Use Mock Data
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 rounded-lg bg-gray-900/50 border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Test Instructions</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">⌘K</kbd> or <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">/</kbd> to open the command bar</p>
            <p>• Type at least 4 characters to trigger search</p>
            <p>• Try these test queries with mock data:</p>
            <ul className="ml-6 space-y-1">
              <li>- "AI agents" (trending topic with 4 citations)</li>
              <li>- "venture capital valuations" (market insights)</li>
              <li>- "startup funding" (funding environment)</li>
              <li>- "DePIN infrastructure" (emerging tech)</li>
            </ul>
            <p>• Toggle "Use Mock Data" to test with real API</p>
          </div>
        </div>

        {/* Command Bar */}
        <SearchCommandBar 
          onSearch={(query) => setLastSearch(query)}
          className="max-w-3xl mx-auto"
        />

        {/* Last Search Display */}
        {lastSearch && (
          <div className="mt-8 rounded-lg bg-gray-900/50 border border-gray-800 p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Last Search Query</h3>
            <p className="text-white">{lastSearch}</p>
          </div>
        )}

        {/* Sample Dashboard Content (to test scroll behavior) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg bg-gray-900/50 border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Topic Velocity</h3>
            <div className="h-64 flex items-center justify-center text-gray-600">
              <p>Chart Placeholder</p>
            </div>
          </div>
          <div className="rounded-lg bg-gray-900/50 border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h3>
            <div className="h-64 flex items-center justify-center text-gray-600">
              <p>Chart Placeholder</p>
            </div>
          </div>
        </div>

        {/* Extra content for scroll testing */}
        <div className="mt-12 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg bg-gray-900/50 border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Section {i}</h3>
              <p className="text-gray-400">
                Scroll down to test the command bar's sticky behavior and keyboard shortcuts when scrolled past.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}