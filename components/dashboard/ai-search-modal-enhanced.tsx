"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Search, 
  Loader2, 
  PlayCircle, 
  Pause, 
  AlertCircle, 
  Clock,
  ExternalLink 
} from "lucide-react"
import { searchCache } from "@/lib/search-cache"

interface AISearchModalEnhancedProps {
  isOpen: boolean
  onClose: () => void
}

interface AIAnswer {
  id: string
  question: string
  answer: string
  confidence: number
  sources: {
    id: string
    title: string
    podcast: string
    episode: string
    timestamp: string
    relevance: number
    episode_id: string
    start_seconds: number
  }[]
  generatedAt: string
}

interface ApiCitation {
  index: number
  episode_id: string
  episode_title: string
  podcast_name: string
  timestamp: string
  start_seconds: number
  chunk_index: number
}

interface ApiAnswer {
  text: string
  citations: ApiCitation[]
}

interface ApiResponse {
  answer?: ApiAnswer
  results?: any[]
  processing_time_ms?: number
  total_results?: number
}

const examplePrompts = [
  "What are VCs saying about AI valuations?",
  "Recent M&A activity in fintech",
  "Portfolio company mentions this week"
]

// Helper functions from search-command-bar-fixed.tsx
function calculateConfidence(answer: ApiAnswer): number {
  const numCitations = answer.citations.length
  const uniqueEpisodes = new Set(answer.citations.map(c => c.episode_id)).size

  if (numCitations === 0) {
    return 30
  }

  let score = 50
  score += Math.min(25, numCitations * 5)
  score += Math.min(24, (uniqueEpisodes - 1) * 12)

  return Math.min(99, score)
}

function transformApiResponse(response: ApiResponse, query: string): AIAnswer | null {
  if (!response.answer) {
    return null
  }

  const { text, citations } = response.answer

  const sources = citations.map((citation: ApiCitation) => ({
    id: `${citation.episode_id}-${citation.chunk_index}`,
    title: citation.episode_title,
    podcast: citation.podcast_name,
    episode: citation.episode_title,
    timestamp: citation.timestamp,
    relevance: 95,
    episode_id: citation.episode_id,
    start_seconds: citation.start_seconds,
  }))

  return {
    id: crypto.randomUUID(),
    question: query,
    answer: text,
    sources,
    confidence: calculateConfidence(response.answer),
    generatedAt: new Date().toISOString(),
  }
}

async function performSearchApi(searchQuery: string, signal: AbortSignal) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      query: searchQuery, 
      limit: 10
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export function AISearchModalEnhanced({ isOpen, onClose }: AISearchModalEnhancedProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiAnswer, setAiAnswer] = useState<AIAnswer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [playingSourceId, setPlayingSourceId] = useState<string | null>(null)
  const [audioStates, setAudioStates] = useState<
    Record<string, { isLoading: boolean; url: string | null; error: string | null }>
  >({})
  const [hasSearched, setHasSearched] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const coldStartTimeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController | null>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      // Reset state when modal closes
      setQuery("")
      setAiAnswer(null)
      setError(null)
      setHasSearched(false)
      setIsLoading(false)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    if (searchQuery.length >= 4) {
      // Check cache first
      const cachedResponse = searchCache.get(searchQuery, 10, 0)
      if (cachedResponse) {
        const transformedAnswer = transformApiResponse(cachedResponse, searchQuery)
        if (transformedAnswer) {
          setAiAnswer(transformedAnswer)
          setError(null)
          setHasSearched(true)
          return
        }
      }

      setIsLoading(true)
      setError(null)
      setAiAnswer(null)
      setHasSearched(true)

      // Show cold start message after 5 seconds
      coldStartTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setError("Still searching... The AI is waking up, this might take a moment on the first search.")
        }
      }, 5000)

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await performSearchApi(searchQuery, controller.signal)
          
          if (coldStartTimeoutRef.current) {
            clearTimeout(coldStartTimeoutRef.current)
            setError(null)
          }

          if (response && response.search_method !== "none_all_failed") {
            searchCache.set(searchQuery, 10, 0, response)
          }

          const transformedAnswer = transformApiResponse(response, searchQuery)
          
          if (response.search_method === "none_all_failed") {
            setError("Search is temporarily unavailable. Please try again later.")
            return
          }
          
          if (transformedAnswer) {
            setAiAnswer(transformedAnswer)
            // Add to search history
            setSearchHistory(prev => {
              const newHistory = [searchQuery, ...prev.filter(q => q !== searchQuery)]
              return newHistory.slice(0, 5) // Keep last 5 searches
            })
          } else {
            setError("No results found. Try a different query.")
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            return
          }
          if (coldStartTimeoutRef.current) {
            clearTimeout(coldStartTimeoutRef.current)
          }
          
          if (err instanceof Error && err.message.includes('504')) {
            setError("The search took too long. Try a simpler query or try again later.")
          } else if (err instanceof Error && err.message.includes('Failed to fetch')) {
            setError("Network error. Please check your connection and try again.")
          } else {
            setError(err instanceof Error ? err.message : 'An error occurred while searching.')
          }
        } finally {
          setIsLoading(false)
        }
      }, 500)
    }
  }, [isLoading])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.length >= 4) {
      performSearch(query)
    }
  }

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.length >= 4) {
      e.preventDefault()
      performSearch(query)
    }
  }

  // Handle prompt click
  const handlePromptClick = (prompt: string) => {
    setQuery(prompt)
    performSearch(prompt)
  }

  // Audio handling
  const handlePlayAudio = async (source: AIAnswer['sources'][0]) => {
    if (!source.episode_id || typeof source.start_seconds !== 'number' || isNaN(source.start_seconds)) {
      setAudioStates(prev => ({ 
        ...prev, 
        [source.id]: { isLoading: false, url: null, error: 'Invalid audio data' } 
      }))
      return
    }

    if (playingSourceId && playingSourceId !== source.id) {
      audioRef.current?.pause()
    }

    if (playingSourceId === source.id) {
      audioRef.current?.pause()
      setPlayingSourceId(null)
      return
    }

    setPlayingSourceId(source.id)

    if (audioStates[source.id]?.url) {
      audioRef.current!.src = audioStates[source.id]!.url!
      try {
        await audioRef.current?.play()
      } catch (playError) {
        setPlayingSourceId(null)
      }
      return
    }

    setAudioStates(prev => ({ ...prev, [source.id]: { isLoading: true, url: null, error: null } }))

    try {
      const startTimeMs = Math.round(source.start_seconds * 1000)
      const url = `/api/v1/audio_clips/${source.episode_id}?start_time_ms=${startTimeMs}`
      const res = await fetch(url)
      if (!res.ok) {
        const errorBody = await res.text()
        throw new Error(`Failed to load audio clip: ${res.status}`)
      }

      const data = await res.json()
      if (!data || !data.clip_url) {
        throw new Error('No audio URL in response')
      }

      setAudioStates(prev => ({ ...prev, [source.id]: { isLoading: false, url: data.clip_url, error: null } }))
      audioRef.current!.src = data.clip_url
      try {
        await audioRef.current?.play()
      } catch (playError) {
        setPlayingSourceId(null)
        throw playError
      }
    } catch (error) {
      setAudioStates(prev => ({ 
        ...prev, 
        [source.id]: { 
          isLoading: false, 
          url: null, 
          error: error instanceof Error ? error.message : 'Audio failed to load.' 
        } 
      }))
      setPlayingSourceId(null)
    }
  }

  // Optional: Audio prefetching for better UX
  const prefetchAudio = async (source: AIAnswer['sources'][0]) => {
    // Don't prefetch if we already have it or are fetching it
    if (audioStates[source.id]) return;

    // Set loading state to prevent multiple prefetches
    setAudioStates(prev => ({ ...prev, [source.id]: { isLoading: true, url: null, error: null } }));
    try {
      const startTimeMs = Math.round(source.start_seconds * 1000);
      const res = await fetch(`/api/v1/audio_clips/${source.episode_id}?start_time_ms=${startTimeMs}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAudioStates(prev => ({ ...prev, [source.id]: { isLoading: false, url: data.clip_url, error: null } }));
    } catch (e) {
      // If prefetch fails, reset the state so a click can retry
      setAudioStates(prev => {
        const newStates = { ...prev };
        delete newStates[source.id];
        return newStates;
      });
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setPlayingSourceId(null)
    const handlePause = () => {
      if (audio.paused) {
        setPlayingSourceId(null)
      }
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      if (coldStartTimeoutRef.current) {
        clearTimeout(coldStartTimeoutRef.current)
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <audio ref={audioRef} />
          
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] mx-auto max-w-2xl z-[10001] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[#0A0A0B] border-2 border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">
                    AI Intelligence Search
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about podcast trends, topics, or insights..."
                    className="w-full h-12 pl-12 pr-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    Press Enter to search
                  </div>
                </div>

                {/* Example Prompts - Only show when no search has been performed */}
                {!hasSearched && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-3">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {examplePrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handlePromptClick(prompt)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>

              {/* Results Section */}
              <AnimatePresence mode="wait">
                {hasSearched && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-800"
                  >
                    <div className="max-h-[400px] overflow-y-auto">
                      {isLoading ? (
                        <div className="p-8 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl animate-pulse">🧠</span>
                              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                            </div>
                            <div>
                              <p className="text-sm bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-medium">
                                Analyzing 1,171 episodes across 29 podcasts...
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Synthesizing insights with AI</p>
                            </div>
                          </div>
                        </div>
                      ) : error && !aiAnswer ? (
                        <div className="p-8 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                            <p className="text-sm text-gray-400">{error}</p>
                            {error.includes("waking up") && (
                              <p className="text-xs text-gray-500">First searches can take 15-20 seconds</p>
                            )}
                          </div>
                        </div>
                      ) : aiAnswer ? (
                        <>
                          {/* AI Answer */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 border-b border-gray-800"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-lg">🧠</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-white font-semibold">AI Analysis</h3>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-xs text-green-400 font-medium">
                                      {aiAnswer.confidence}% confidence
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{aiAnswer.answer}</p>
                              </div>
                            </div>
                          </motion.div>

                          {/* Sources */}
                          {aiAnswer.sources.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              className="p-6"
                            >
                              <h4 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3 flex items-center gap-2">
                                <ExternalLink className="w-3 h-3" />
                                Sources ({aiAnswer.sources.length})
                              </h4>
                              <div className="space-y-2">
                                {aiAnswer.sources.map((source, index) => (
                                  <motion.div
                                    key={source.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all group"
                                    onMouseEnter={() => prefetchAudio(source)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handlePlayAudio(source)}
                                        className="flex-shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
                                        aria-label={`Play clip from ${source.title}`}
                                        disabled={audioStates[source.id]?.error !== null}
                                      >
                                        {audioStates[source.id]?.isLoading ? (
                                          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                        ) : audioStates[source.id]?.error ? (
                                          <AlertCircle className="w-4 h-4 text-red-400" />
                                        ) : playingSourceId === source.id ? (
                                          <Pause className="w-4 h-4 text-purple-400" />
                                        ) : (
                                          <PlayCircle className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                                        )}
                                      </button>
                                      {audioStates[source.id]?.error && (
                                        <span className="text-xs text-red-400">
                                          {audioStates[source.id].error}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white text-sm font-medium truncate">
                                          {source.title}
                                        </span>
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex-shrink-0">
                                          {source.relevance}%
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span className="truncate">{source.podcast}</span>
                                        <span>•</span>
                                        <Clock className="w-3 h-3" />
                                        <span>{source.timestamp}</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}