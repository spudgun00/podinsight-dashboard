"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, Lightbulb, PlayCircle, Hash, X, Sparkles, ExternalLink, Clock } from "lucide-react"

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
  }[]
  generatedAt: string
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

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Determine if we should show results
  const shouldShowResults = query.length >= 4 && (isFocused || isLoading || results.length > 0 || aiAnswer)

  useEffect(() => {
    setIsMac(typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0)
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
  const performSearch = useCallback((searchQuery: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length >= 4) {
      setIsLoading(true)

      searchTimeoutRef.current = setTimeout(() => {
        setIsLoading(false)
        setResults(mockResults)
        setAiAnswer({
          ...mockAIAnswer,
          question: searchQuery,
        })
      }, 1200)
    } else {
      setIsLoading(false)
      setResults([])
      setAiAnswer(null)
    }
  }, [])

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
  }, [])

  const scrollToCommandBar = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      setTimeout(() => {
        inputRef.current?.focus()
      }, 500)
    }
  }, [])

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
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

  // Mock data
  const mockResults: SearchResult[] = [
    {
      id: "1",
      title: "AI Agents mentioned 847 times this quarter",
      type: "insight",
      description: "183% increase from last quarter across 23 podcasts",
    },
    {
      id: "2",
      title: "The Tim Ferriss Show - Episode #692",
      type: "episode",
      description: "Discussion on AI agents in venture capital",
      podcast: "The Tim Ferriss Show",
    },
    {
      id: "3",
      title: "DePIN Infrastructure Trends",
      type: "topic",
      description: "Recovering sentiment, +67% mentions in last 4 weeks",
    },
  ]

  const mockAIAnswer: AIAnswer = {
    id: "ai-1",
    question: query,
    answer:
      "Based on analysis of 1,171 podcast episodes, AI Agents have emerged as the dominant trend in Q4 2024, with mentions increasing 183% quarter-over-quarter. The surge correlates strongly with major product launches from OpenAI and Anthropic, particularly around autonomous agent capabilities. VCs are showing unprecedented interest, with 67% of investment-focused podcasts discussing AI agent startups in the past month. Key themes include enterprise automation, customer service applications, and multi-agent systems for complex workflows.",
    confidence: 94,
    sources: [
      {
        id: "s1",
        title: "The Future of AI Agents in Enterprise",
        podcast: "a16z Podcast",
        episode: "Episode #847",
        timestamp: "12:34",
        relevance: 98,
      },
      {
        id: "s2",
        title: "Investing in the Agent Economy",
        podcast: "The Tim Ferriss Show",
        episode: "Episode #692",
        timestamp: "45:12",
        relevance: 95,
      },
      {
        id: "s3",
        title: "Multi-Agent Systems: The Next Frontier",
        podcast: "Lex Fridman Podcast",
        episode: "Episode #412",
        timestamp: "1:23:45",
        relevance: 92,
      },
    ],
    generatedAt: new Date().toISOString(),
  }

  const CommandBarContent = ({ isModal = false }: { isModal?: boolean }) => (
    <div className="relative" ref={containerRef}>
      {/* Search Input */}
      <div
        className={`relative bg-gray-900 transition-all duration-300 ${
          shouldShowResults && !isModal ? "rounded-t-xl" : "rounded-xl"
        } ${
          isFocused ? "border-gradient-enhanced shadow-focus-glow" : "border-gradient-subtle"
        } ${isModal ? "shadow-2xl" : ""}`}
        style={{
          height: "56px",
          background:
            "linear-gradient(135deg, rgb(17, 24, 39), rgb(17, 24, 39)) padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2)) border-box",
          border: "1px solid transparent",
          boxShadow: isFocused
            ? "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(139, 92, 246, 0.1), 0 4px 12px rgba(139, 92, 246, 0.15)"
            : "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0 mr-3">
              {isLoading ? (
                <Loader2 size={20} className="text-purple-400 animate-spin" />
              ) : (
                <Search
                  size={20}
                  className={`transition-colors duration-200 ${isFocused ? "text-gray-300" : "text-gray-400"}`}
                />
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about podcast trends, topics, or insights... (min 4 chars)"
              className="flex-1 bg-transparent text-base text-gray-100 placeholder-gray-400 border-none outline-none"
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <div className="flex-shrink-0">
            <kbd className="bg-gray-800/80 px-2.5 py-1 rounded-md text-sm font-medium text-gray-400 border border-gray-700/50">
              {isMac ? "⌘K" : "Ctrl+K"}
            </kbd>
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
              maxHeight: isModal ? 500 : 400,
            }}
            exit={{ opacity: 0, y: -10, maxHeight: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              maxHeight: { duration: 0.5, ease: "easeInOut" },
            }}
            className={`${
              isModal ? "relative" : "absolute top-full left-0 right-0"
            } bg-gray-900 border border-white/10 ${
              isModal ? "rounded-b-xl border-t-0" : "rounded-b-xl"
            } shadow-2xl z-50 overflow-hidden`}
            style={{
              background:
                "linear-gradient(135deg, rgb(17, 24, 39), rgb(17, 24, 39)) padding-box, linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1)) border-box",
              border: "1px solid transparent",
              borderTop: isModal ? "1px solid rgba(255,255,255,0.05)" : "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className={`${isModal ? "max-h-[500px]" : "max-h-[400px]"} overflow-y-auto`}>
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
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 group"
                            onClick={() => {
                              onSearch?.(query)
                              if (isModal) hideModal()
                            }}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <PlayCircle size={14} className="text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
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

                  {/* Traditional Results */}
                  {results.length > 0 && (
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
                              if (isModal) hideModal()
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
      <div className={`my-6 ${className}`}>
        <CommandBarContent />
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
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-3xl max-h-[calc(100vh-160px)]"
            >
              <div className="relative">
                <CommandBarContent isModal />

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
