"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { allEpisodesData, type ExtendedEpisode } from "@/lib/all-episodes-mock-data"
import type { Episode } from "@/lib/mock-episode-data"
import { Search, X, ChevronDown, ArrowRight, FileSearch } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type SortKey = keyof ExtendedEpisode | ""
type SortDirection = "asc" | "desc"

const signalStyles: Record<ExtendedEpisode["signal"], { text: string; badge: string; border: string }> = {
  red_hot: { text: "text-signal-red", badge: "bg-signal-red/20 border-signal-red/30", border: "border-l-signal-red" },
  high_value: { text: "text-signal-orange", badge: "bg-signal-orange/20 border-signal-orange/30", border: "border-l-signal-orange" },
  market_intel: { text: "text-signal-green", badge: "bg-signal-green/20 border-signal-green/30", border: "border-l-signal-green" },
  portfolio_mention: { text: "text-signal-blue", badge: "bg-signal-blue/20 border-signal-blue/30", border: "border-l-signal-blue" },
}

const podcastBadges: Record<string, string> = {
  "All-In Pod": "bg-red-500",
  "20VC": "bg-blue-500",
  "Lenny's Pod": "bg-green-500",
  Acquired: "bg-yellow-500",
  "Invest Like the Best": "bg-purple-500",
  "My First Million": "bg-pink-500",
}

// Removed signalDotColors as bullet points were removed

const ITEMS_PER_PAGE = 15

export function AllEpisodesView({
  open,
  onOpenChange,
  onViewBriefClick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewBriefClick: (episode: Episode) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    podcast: "all",
    signal: "all",
    dateRange: "24h",
    minScore: "50",
  })
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "publishedDate",
    direction: "desc",
  })
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Check if any filters are active
  const hasActiveFilters = 
    searchQuery !== "" ||
    filters.podcast !== "all" ||
    filters.signal !== "all" ||
    filters.dateRange !== "24h" ||
    filters.minScore !== "50"

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setVisibleCount(ITEMS_PER_PAGE)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setFilters({
      podcast: "all",
      signal: "all",
      dateRange: "24h",
      minScore: "50",
    })
    setSortConfig({ key: "publishedDate", direction: "desc" })
    setVisibleCount(ITEMS_PER_PAGE)
  }

  // Removed handleSort as sorting headers were removed

  const filteredAndSortedEpisodes = useMemo(() => {
    let episodes = [...allEpisodesData]

    // Search
    if (searchQuery.length > 2) {
      const lowercasedQuery = searchQuery.toLowerCase()
      episodes = episodes.map((ep) => ({
        ...ep,
        isSearchResult:
          ep.title.toLowerCase().includes(lowercasedQuery) ||
          ep.podcast.toLowerCase().includes(lowercasedQuery) ||
          ep.intel.some((i) => i.toLowerCase().includes(lowercasedQuery)),
      }))
    } else {
      episodes = episodes.map((ep) => ({ ...ep, isSearchResult: false }))
    }

    // Filters
    episodes = episodes.filter((ep) => {
      if (filters.podcast !== "all" && ep.podcast !== filters.podcast) return false
      if (filters.signal !== "all" && ep.signal !== filters.signal) return false
      if (Number.parseInt(ep.score.toString()) < Number.parseInt(filters.minScore)) return false

      const now = new Date()
      const hours = Number.parseInt(filters.dateRange.replace("h", ""))
      if (now.getTime() - ep.publishedDate.getTime() > hours * 60 * 60 * 1000) return false

      return true
    })

    // Sorting
    if (sortConfig.key) {
      episodes.sort((a, b) => {
        const key = sortConfig.key as keyof typeof a
        const aValue = a[key]
        const bValue = b[key]

        if (aValue === undefined || bValue === undefined) return 0
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return episodes
  }, [searchQuery, filters, sortConfig])

  // Removed SortableHeader component as headers are no longer used

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="bg-[#1A1A1C] rounded-xl p-4 md:p-5 border border-white/[0.06] border-l-4 border-l-gray-600 md:grid md:grid-cols-[auto,1fr,1fr,auto,auto] md:gap-4 md:items-center animate-pulse">
      {/* Podcast */}
      <div className="flex items-center gap-3 w-32">
        <div className="w-8 h-8 rounded-full bg-gray-800" />
      </div>
      
      {/* Episode Info */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
      
      {/* Key Signals */}
      <div className="space-y-1">
        <div className="h-6 bg-gray-800 rounded-full w-full" />
        <div className="h-6 bg-gray-800 rounded-full w-4/5" />
      </div>
      
      {/* Score */}
      <div className="flex justify-center">
        <div className="h-8 w-16 bg-gray-800 rounded" />
      </div>
      
      {/* Action */}
      <div className="flex justify-end">
        <div className="w-10 h-10 rounded-lg bg-gray-800" />
      </div>
    </div>
  )

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
        <FileSearch size={40} className="text-purple-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No episodes found</h3>
      <p className="text-gray-400 text-center max-w-md mb-6">
        {hasActiveFilters 
          ? "Try adjusting your filters or search query to find more episodes."
          : "No episodes are available at the moment. Check back later for new intelligence."}
      </p>
      {hasActiveFilters && (
        <Button 
          variant="secondary" 
          onClick={resetFilters}
          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30"
        >
          <X size={16} className="mr-2" /> Clear all filters
        </Button>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0A0B] border-gray-800 text-white max-w-[1400px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 md:p-6 border-b border-gray-800">
          <DialogTitle className="text-xl md:text-2xl">Episode Intelligence</DialogTitle>
          <DialogDescription className="text-sm md:text-base">Browse and filter 1,171 analyzed episodes</DialogDescription>
        </DialogHeader>

        <div className="p-4 md:p-6 flex-shrink-0 sticky top-0 bg-[#0A0A0B] z-20 border-b border-gray-800 md:static md:border-0">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-4">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search episodes, topics, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1A1A1C] border border-white/[0.06] pl-10 h-11 w-full focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
              />
            </div>
            <div className="grid grid-cols-2 md:flex gap-3 md:gap-4 w-full md:w-auto">
              <Select value={filters.podcast} onValueChange={(v) => handleFilterChange("podcast", v)}>
                <SelectTrigger className="w-full md:w-[180px] bg-[#1A1A1C] border border-white/[0.06] h-11 hover:border-purple-500/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200">
                  <SelectValue placeholder="All Podcasts" />
                </SelectTrigger>
              <SelectContent className="bg-[#1A1A1C] border-white/[0.06] text-white">
                <SelectItem value="all">All Podcasts</SelectItem>
                {Array.from(new Set(allEpisodesData.map((ep) => ep.podcast))).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.signal} onValueChange={(v) => handleFilterChange("signal", v)}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#1A1A1C] border border-white/[0.06] h-11 hover:border-purple-500/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200">
                <SelectValue placeholder="All Signal Types" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1C] border-white/[0.06] text-white">
                <SelectItem value="all">All Signal Types</SelectItem>
                <SelectItem value="red_hot">Red Hot</SelectItem>
                <SelectItem value="high_value">High Value</SelectItem>
                <SelectItem value="market_intel">Market Intel</SelectItem>
                <SelectItem value="portfolio_mention">Portfolio Mention</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.dateRange} onValueChange={(v) => handleFilterChange("dateRange", v)}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#1A1A1C] border border-white/[0.06] h-11 hover:border-purple-500/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1C] border-white/[0.06] text-white">
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="168h">Last 7d</SelectItem>
                <SelectItem value="720h">Last 30d</SelectItem>
                <SelectItem value="2160h">Last 90d</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.minScore} onValueChange={(v) => handleFilterChange("minScore", v)}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#1A1A1C] border border-white/[0.06] h-11 hover:border-purple-500/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200">
                <SelectValue placeholder="Min Score" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1C] border-white/[0.06] text-white">
                <SelectItem value="50">50+</SelectItem>
                <SelectItem value="70">70+</SelectItem>
                <SelectItem value="80">80+</SelectItem>
                <SelectItem value="90">90+</SelectItem>
              </SelectContent>
            </Select>
            </div>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                onClick={resetFilters} 
                className="h-11 w-full md:w-auto text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all duration-200"
              >
                <X size={16} className="mr-2" /> Reset Filters
              </Button>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto px-4 md:px-6">
          {/* Remove sticky header entirely - content is self-explanatory */}
          
          {/* Cards container */}
          <div className="space-y-2">
            {isLoading ? (
              // Loading state
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </>
            ) : filteredAndSortedEpisodes.length === 0 ? (
              // Empty state
              <EmptyState />
            ) : (
              // Episodes list
              filteredAndSortedEpisodes.slice(0, visibleCount).map((ep) => (
              <div
                key={ep.id}
                className={`
                  bg-[#1A1A1C] rounded-xl p-4 md:p-5
                  border border-white/[0.06] border-l-4 ${signalStyles[ep.signal].border}
                  transition-all duration-200 
                  hover:shadow-lg hover:shadow-white/5 hover:ring-1 hover:ring-white/10
                  ${ep.isSearchResult ? "ring-1 ring-signal-orange/50" : ""}
                  md:grid md:grid-cols-[auto,1fr,1fr,auto,auto] md:gap-4 md:items-center
                  relative overflow-hidden
                `}
              >
                {/* Mobile Layout */}
                <div className="md:hidden">
                  {/* Mobile Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                          podcastBadges[ep.podcast] || "bg-gray-500"
                        }`}
                      >
                        <span className={`${ep.abbreviation && ep.abbreviation.length > 2 ? "text-xs" : "text-sm"}`}>
                          {ep.abbreviation}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {ep.podcast} • {formatDistanceToNow(ep.publishedDate, { addSuffix: true })}
                      </div>
                    </div>
                    {/* Mobile Score */}
                    {ep.score >= 90 ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-signal-red/20 border border-signal-red/30 rounded-md">
                        <span className="text-sm">🔥</span>
                        <span className="text-sm font-bold text-signal-red">{ep.score}</span>
                      </div>
                    ) : ep.score >= 80 ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-signal-orange/20 border border-signal-orange/30 rounded-md">
                        <span className="text-sm">⚡</span>
                        <span className="text-sm font-bold text-signal-orange">{ep.score}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-md">
                        <span className="text-sm">💫</span>
                        <span className="text-sm font-bold text-purple-400">{ep.score}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile Title */}
                  <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">{ep.title}</h3>
                  
                  {/* Mobile Signals */}
                  <div className="flex flex-col gap-1 mb-3">
                    {ep.intel.slice(0, 2).map((intel, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/[0.06] text-xs">
                        <span className="text-gray-300 line-clamp-1">
                          {intel.includes("economics") || intel.includes("Seed fund") || intel.includes("seed funds") || intel.includes("competitor") || intel.includes("acquired") || intel.includes("lost the deal") || intel.includes("passed on") || intel.includes("market share") || intel.includes("capturing") || intel.includes("Top 10")
                            ? "⚔️ "
                            : intel.includes("raising") || intel.includes("Fund II") || intel.includes("Fund III") || intel.includes("$") || intel.includes("valuation") || intel.includes("revenue")
                            ? "💰 "
                            : ""}
                          {intel}
                        </span>
                      </div>
                    ))}
                    {ep.intel.length > 2 && (
                      <span className="text-xs text-gray-500 ml-3">+{ep.intel.length - 2} more</span>
                    )}
                  </div>
                  
                  {/* Mobile Swipe Action Hint */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-purple-500/20 to-transparent flex items-center justify-center md:hidden"
                    onClick={() => onViewBriefClick(ep)}
                  >
                    <ArrowRight size={20} className="text-purple-400" />
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:contents">
                  {/* Podcast */}
                  <div className="flex items-center gap-3 w-32">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                        podcastBadges[ep.podcast] || "bg-gray-500"
                      }`}
                    >
                      <span className={`${ep.abbreviation && ep.abbreviation.length > 2 ? "text-xs" : "text-sm"}`}>
                        {ep.abbreviation}
                      </span>
                    </div>
                    {ep.isSearchResult && (
                      <span className="text-xs font-bold text-signal-orange bg-signal-orange/20 px-2 py-0.5 rounded">
                        SEARCH
                      </span>
                    )}
                  </div>
                  
                  {/* Episode Info */}
                  <div>
                    <p className="text-base font-semibold text-white line-clamp-1">{ep.title}</p>
                    <p className="text-sm text-gray-400">
                      {ep.podcast} • {formatDistanceToNow(ep.publishedDate, { addSuffix: true })}
                    </p>
                  </div>
                  
                  {/* Key Signals */}
                  <div className="flex flex-col gap-1">
                    {ep.intel.slice(0, 2).map((intel, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/[0.06]">
                        <span className="text-xs text-gray-300 line-clamp-1">
                          {intel.includes("economics") || intel.includes("Seed fund") || intel.includes("seed funds") || intel.includes("competitor") || intel.includes("acquired") || intel.includes("lost the deal") || intel.includes("passed on") || intel.includes("market share") || intel.includes("capturing") || intel.includes("Top 10")
                            ? "⚔️ "
                            : intel.includes("raising") || intel.includes("Fund II") || intel.includes("Fund III") || intel.includes("$") || intel.includes("valuation") || intel.includes("revenue")
                            ? "💰 "
                            : ""}
                          {intel}
                        </span>
                      </div>
                    ))}
                    {ep.intel.length > 2 && (
                      <span className="text-xs text-gray-500 ml-3">+{ep.intel.length - 2} more</span>
                    )}
                  </div>
                  
                  {/* Score */}
                  <div className="text-center">
                    {ep.score >= 90 ? (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-signal-red/20 border border-signal-red/30 rounded-lg relative">
                        <span className="text-lg">🔥</span>
                        <span className="text-lg font-bold text-signal-red">{ep.score}</span>
                        <div className="absolute inset-0 rounded-lg bg-signal-red/20 blur-md -z-10" />
                      </div>
                    ) : ep.score >= 80 ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-signal-orange/20 border border-signal-orange/30 rounded-lg">
                        <span className="text-base">⚡</span>
                        <span className="text-base font-bold text-signal-orange">{ep.score}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                        <span className="text-base">💫</span>
                        <span className="text-base font-bold text-purple-400">{ep.score}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action */}
                  <div className="text-right">
                    <button
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 group relative"
                      onClick={() => onViewBriefClick(ep)}
                      aria-label="View episode brief"
                    >
                      <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                      <div className="absolute inset-0 rounded-lg bg-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-800 flex-shrink-0">
          {!isLoading && filteredAndSortedEpisodes.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              <p className="text-sm text-gray-400 text-center">
                Showing {Math.min(visibleCount, filteredAndSortedEpisodes.length)} of {filteredAndSortedEpisodes.length}{" "}
                episodes
              </p>
              {visibleCount < filteredAndSortedEpisodes.length && (
                <Button 
                  variant="secondary" 
                  onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                  className="w-full md:w-auto"
                >
                  Load More <ChevronDown size={16} className="ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
