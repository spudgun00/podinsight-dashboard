"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, Lightbulb, PlayCircle, Hash, X, Sparkles, ExternalLink, Clock, Pause, AlertCircle } from "lucide-react"
import { searchCache } from "@/lib/search-cache"

interface SearchCommandBarProps {
  onSearch?: (query: string) => void
  className?: string
  mode?: "inline" | "modal"
}

interface SearchResult {
  id: string
  title: string
  type: "episode" | "topic" | "insight"
  description: string
  podcast?: string
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
    // Added for audio playback
    episode_id: string
    start_seconds: number
  }[]
  generatedAt: string
}

// API Response Types
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

// Helper function to calculate confidence score
function calculateConfidence(answer: ApiAnswer): number {
  const numCitations = answer.citations.length
  const uniqueEpisodes = new Set(answer.citations.map(c => c.episode_id)).size

  if (numCitations === 0) {
    return 30 // Low confidence if no sources are cited
  }

  // Start with a base confidence of 50%
  let score = 50

  // Add points for each citation, maxing out around 5-6 citations
  score += Math.min(25, numCitations * 5)

  // Add a bonus for diversity of sources
  score += Math.min(24, (uniqueEpisodes - 1) * 12)

  // Ensure the score is capped at 99 to avoid implying 100% certainty
  return Math.min(99, score)
}

// Transform API response to AIAnswer format
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
    relevance: 95, // Default high relevance since these are synthesized results
    // Add the new fields
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

// API call function - moved outside component
async function performSearchApi(searchQuery: string, signal: AbortSignal) {
  // Use local proxy to avoid CORS issues
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      query: searchQuery, 
      limit: 10 // Request 10 chunks for synthesis
    }),
    signal, // Pass the signal to fetch
  })

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export function SearchCommandBar({ onSearch, className = "", mode = "inline" }: SearchCommandBarProps) {
  const [isMac, setIsMac] = useState(true)
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [aiAnswer, setAiAnswer] = useState<AIAnswer | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isScrolledPast, setIsScrolledPast] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playingSourceId, setPlayingSourceId] = useState<string | null>(null)
  const [audioStates, setAudioStates] = useState<
    Record<string, { isLoading: boolean; url: string | null; error: string | null }>
  >({})
  const audioRef = useRef<HTMLAudioElement>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const coldStartTimeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController | null>(null)

  // Determine if we should show results
  const shouldShowResults = query.length >= 4 && (isFocused || isLoading || results.length > 0 || aiAnswer || error)

  useEffect(() => {
    setIsMac(typeof navigator !== "undefined" && navigator.userAgent.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setIsScrolledPast(rect.bottom < 0)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Cancel any pending request
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
          return
        }
      }

      setIsLoading(true)
      setError(null)
      setAiAnswer(null)
      setResults([])

      // Show cold start message after 5 seconds
      coldStartTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setError("Still searching... The AI is waking up, this might take a moment on the first search.")
        }
      }, 5000)

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await performSearchApi(searchQuery, controller.signal)
          
          // Clear cold start message
          if (coldStartTimeoutRef.current) {
            clearTimeout(coldStartTimeoutRef.current)
            setError(null)
          }

          // Cache successful responses
          if (response && response.search_method !== "none_all_failed") {
            searchCache.set(searchQuery, 10, 0, response)
          }

          // Transform the response
          const transformedAnswer = transformApiResponse(response, searchQuery)
          
          // Check for API-specific failure
          if (response.search_method === "none_all_failed") {
            setError("Search is temporarily unavailable. Please try again later.")
            return // Exit early
          }
          
          if (transformedAnswer) {
            setAiAnswer(transformedAnswer)
          } else if (response.results && response.results.length > 0) {
            // Fallback to raw results if no synthesis available
            setError("AI synthesis timed out. Showing search results without summary.")
            // Transform raw results to display
            const fallbackResults = response.results.slice(0, 5).map((result: any) => ({
              id: result.episode_id,
              title: result.episode_title,
              type: "episode" as const,
              description: result.excerpt,
              podcast: result.podcast_name
            }))
            setResults(fallbackResults)
          } else {
            setError("No results found. Try a different query.")
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            // This is an expected error when a request is cancelled. Do nothing.
            return
          }
          if (coldStartTimeoutRef.current) {
            clearTimeout(coldStartTimeoutRef.current)
          }
          
          // More user-friendly error messages
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
      }, 500) // Debounce delay
    } else {
      setIsLoading(false)
      setResults([])
      setAiAnswer(null)
      setError(null)
    }
  }, [isLoading])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    performSearch(value)
  }

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true)
  }

  // Handle input blur - simplified logic
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if focus is moving to results panel
    const relatedTarget = e.relatedTarget as HTMLElement
    if (relatedTarget && resultsRef.current?.contains(relatedTarget)) {
      return // Don't blur if clicking in results
    }

    // Delay blur to allow for clicks
    setTimeout(() => {
      setIsFocused(false)
    }, 200)
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.length >= 4) {
      e.preventDefault()
      onSearch?.(query)
    }
  }

  // Modal functions
  const showModalSearch = useCallback(() => {
    setShowModal(true)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [])

  const hideModal = useCallback(() => {
    setShowModal(false)
    setQuery("")
    setResults([])
    setAiAnswer(null)
    setIsFocused(false)
    setIsLoading(false)
    setError(null)
  }, [])

  const scrollToCommandBar = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      setTimeout(() => {
        inputRef.current?.focus()
      }, 500)
    }
  }, [])

  // Audio handling functions
  const handlePlayAudio = async (source: AIAnswer['sources'][0]) => {
    // Validate source data
    if (!source.episode_id || typeof source.start_seconds !== 'number' || isNaN(source.start_seconds)) {
      setAudioStates(prev => ({ 
        ...prev, 
        [source.id]: { isLoading: false, url: null, error: 'Invalid audio data' } 
      }))
      return
    }

    // If another clip is playing, stop it
    if (playingSourceId && playingSourceId !== source.id) {
      audioRef.current?.pause()
    }

    // If the clicked clip is already playing, pause it
    if (playingSourceId === source.id) {
      audioRef.current?.pause()
      setPlayingSourceId(null)
      return
    }

    setPlayingSourceId(source.id)

    // Check if we already have the URL (e.g., from prefetching)
    if (audioStates[source.id]?.url) {
      audioRef.current!.src = audioStates[source.id]!.url!
      try {
        await audioRef.current?.play()
      } catch (playError) {
        setPlayingSourceId(null)
      }
      return
    }

    // Fetch the audio URL
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

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Skip if user is already typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()

        if (isScrolledPast && mode === "modal") {
          showModalSearch()
        } else if (isScrolledPast) {
          scrollToCommandBar()
        } else {
          inputRef.current?.focus()
        }
      }

      if (e.key === "Escape" && showModal) {
        hideModal()
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleGlobalKeyDown)
      return () => document.removeEventListener("keydown", handleGlobalKeyDown)
    }
  }, [isScrolledPast, mode, showModal, showModalSearch, hideModal, scrollToCommandBar])

  // Cleanup timeouts on unmount
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

  // Audio element event handler
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setPlayingSourceId(null)
    const handlePause = () => {
      // Only nullify if it was paused by user, not by changing source
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

  // Helper functions
  const getResultIcon = (type: string) => {
    switch (type) {
      case "insight":
        return <Lightbulb size={16} className="text-purple-400" />
      case "episode":
        return <PlayCircle size={16} className="text-blue-400" />
      case "topic":
        return <Hash size={16} className="text-green-400" />
      default:
        return <Search size={16} className="text-gray-400" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "insight":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "episode":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "topic":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const CommandBarContent = (
    <div className="relative" ref={containerRef}>
      {/* Search Input Container */}
      <div className="relative w-full">
        <div
          className="relative transition-all duration-300"
          style={{
            height: "48px",
            background: "#1A1A1C",
            border: isFocused ? "1px solid var(--accent-purple)" : "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: shouldShowResults && mode === "inline" ? "12px 12px 0 0" : "12px",
            boxShadow: isFocused ? "0 0 0 3px var(--accent-purple-glow)" : "none",
          }}
        >
          <div className="relative h-full">
            {/* Search Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" style={{ color: "#6B7280" }} data-testid="loading-spinner" />
              ) : (
                <Search
                  size={20}
                  style={{ color: "#6B7280" }}
                />
              )}
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about podcast trends, topics, or insights..."
              className="w-full h-full bg-transparent text-[15px] text-white border-none outline-none"
              style={{
                paddingLeft: "48px",
                paddingRight: "80px",
                color: "#FFFFFF",
              }}
              autoComplete="off"
              spellCheck="false"
            />

            {/* Command Key Hint */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <kbd 
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  color: "#6B7280",
                }}>
                {isMac ? "⌘K" : "Ctrl+K"}
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <AnimatePresence>
        {shouldShowResults && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10, maxHeight: 0 }}
            animate={{
              opacity: 1,
              y: 0,
              maxHeight: mode === "modal" ? 500 : 400,
            }}
            exit={{ opacity: 0, y: -10, maxHeight: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              maxHeight: { duration: 0.5, ease: "easeInOut" },
            }}
            className={`${
              mode === "modal" ? "relative" : "absolute top-full left-0 right-0"
            } z-50 overflow-hidden`}
            style={{
              background: "#1A1A1C",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: mode === "modal" ? "0 0 12px 12px" : "0 0 12px 12px",
              borderTop: "none",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.6)",
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className={`${mode === "modal" ? "max-h-[500px]" : "max-h-[400px]"} overflow-y-auto`}>
              {isLoading ? (
                <div className="px-6 py-8 text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles size={20} className="text-purple-400 animate-pulse" />
                      <Loader2 size={16} className="text-purple-400 animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-medium">
                        Analyzing 1,171 episodes across 29 podcasts...
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Synthesizing insights with AI</p>
                    </div>
                  </motion.div>
                </div>
              ) : error && !aiAnswer ? (
                <div className="px-6 py-8 text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <p className="text-sm text-gray-400">{error}</p>
                    {error.includes("waking up") && (
                      <p className="text-xs text-gray-500">First searches can take 15-20 seconds</p>
                    )}
                  </motion.div>
                </div>
              ) : (
                <>
                  {/* AI Answer Section */}
                  {aiAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="px-6 py-6 border-b border-gray-800/30"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Sparkles size={16} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-semibold text-sm">AI Analysis</h3>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-400 font-medium">
                                {aiAnswer.confidence}% confidence
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{aiAnswer.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Sources Section */}
                  {aiAnswer?.sources && aiAnswer.sources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="px-6 py-4"
                    >
                      <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3 flex items-center gap-2">
                        <ExternalLink size={12} />
                        Sources ({aiAnswer.sources.length})
                      </h4>
                      <div className="space-y-3">
                        {aiAnswer.sources.map((source, index) => (
                          <motion.div
                            key={source.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200 group"
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
                                  <Loader2 size={14} className="text-gray-400 animate-spin" />
                                ) : audioStates[source.id]?.error ? (
                                  <AlertCircle size={14} className="text-red-400" />
                                ) : playingSourceId === source.id ? (
                                  <Pause size={14} className="text-purple-400" />
                                ) : (
                                  <PlayCircle size={14} className="text-blue-400 group-hover:text-blue-300" />
                                )}
                              </button>
                              {audioStates[source.id]?.error && (
                                <span className="text-xs text-red-400">
                                  {audioStates[source.id].error}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0" onClick={() => {
                              onSearch?.(query)
                              if (mode === "modal") hideModal()
                            }}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white text-sm font-medium group-hover:text-blue-200 transition-colors truncate">
                                  {source.title}
                                </span>
                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex-shrink-0">
                                  {source.relevance}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="truncate">{source.podcast}</span>
                                <span>•</span>
                                <span>{source.episode}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Clock size={10} />
                                  <span>{source.timestamp}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Traditional Results - Only shown if no AI answer and we have results */}
                  {!aiAnswer && results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="px-6 py-4 border-t border-gray-800/30"
                    >
                      <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">
                        Related Results
                      </h4>
                      <div className="space-y-2">
                        {results.slice(0, 3).map((result, index) => (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-800/30 cursor-pointer transition-all duration-200 group"
                            onClick={() => {
                              onSearch?.(query)
                              if (mode === "modal") hideModal()
                            }}
                          >
                            <div className="flex-shrink-0 mt-0.5">{getResultIcon(result.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white text-sm font-medium group-hover:text-purple-200 transition-colors truncate">
                                  {result.title}
                                </span>
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded-full border ${getTypeBadgeColor(result.type)}`}
                                >
                                  {result.type}
                                </span>
                              </div>
                              <p className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors">
                                {result.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <>
      <audio ref={audioRef} />
      <div className={className}>
        {CommandBarContent}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={hideModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -20 }}
              transition={{
                duration: 0.25,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-5xl max-h-[calc(100vh-160px)]"
            >
              <div className="relative">
                {CommandBarContent}

                <button
                  onClick={hideModal}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}