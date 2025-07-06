"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { allEpisodesData, type ExtendedEpisode } from "@/lib/all-episodes-mock-data"
import type { Episode } from "@/lib/mock-episode-data"
import { Search, X, ArrowUpDown, ChevronDown } from "lucide-react"
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

const signalDotColors: Record<ExtendedEpisode["signal"], string> = {
  red_hot: "bg-signal-red",
  high_value: "bg-signal-orange",
  market_intel: "bg-signal-green",
  portfolio_mention: "bg-signal-blue",
}

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

  const handleSort = (key: SortKey) => {
    if (!key) return
    let direction: SortDirection = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

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

  const SortableHeader = ({ label, sortKey, className = "" }: { label: string; sortKey: SortKey; className?: string }) => (
    <div
      className={`text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white flex items-center gap-1 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      {label}
      {sortConfig.key === sortKey ? (
        sortConfig.direction === "asc" ? (
          <ArrowUpDown size={12} className="transform rotate-180" />
        ) : (
          <ArrowUpDown size={12} />
        )
      ) : (
        <ArrowUpDown size={12} className="opacity-30" />
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0A0B] border-gray-800 text-white max-w-[1400px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-gray-800">
          <DialogTitle className="text-2xl">Episode Intelligence</DialogTitle>
          <DialogDescription>Browse and filter 1,171 analyzed episodes</DialogDescription>
        </DialogHeader>

        <div className="p-6 flex-shrink-0">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search episodes, topics, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1A1A1C] border border-white/[0.06] pl-10 h-11 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
              />
            </div>
            <Select value={filters.podcast} onValueChange={(v) => handleFilterChange("podcast", v)}>
              <SelectTrigger className="w-[180px] bg-[#1A1A1C] border border-white/[0.06] h-11 hover:border-purple-500/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200">
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
              <SelectTrigger className="w-[180px] bg-[#1A1A1C] border border-white/[0.06] h-11 hover:border-purple-500/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200">
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
              <SelectTrigger className="w-[180px] bg-[#1A1A1C] border border-white/[0.06] h-11 hover:border-purple-500/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200">
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
              <SelectTrigger className="w-[180px] bg-[#1A1A1C] border border-white/[0.06] h-11 hover:border-purple-500/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all duration-200">
                <SelectValue placeholder="Min Score" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1C] border-white/[0.06] text-white">
                <SelectItem value="50">50+</SelectItem>
                <SelectItem value="70">70+</SelectItem>
                <SelectItem value="80">80+</SelectItem>
                <SelectItem value="90">90+</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                onClick={resetFilters} 
                className="h-11 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all duration-200"
              >
                <X size={16} className="mr-2" /> Reset Filters
              </Button>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto px-6">
          {/* Sticky header */}
          <div className="bg-[#0A0A0B] sticky top-0 z-10 pb-3">
            <div className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-4 px-5 py-3 text-left">
              <SortableHeader label="Podcast" sortKey="podcast" className="w-32" />
              <SortableHeader label="Episode" sortKey="title" />
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Key Signals</div>
              <SortableHeader label="Score" sortKey="score" className="text-center" />
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Action</div>
            </div>
          </div>
          
          {/* Cards container */}
          <div className="space-y-2">
            {filteredAndSortedEpisodes.slice(0, visibleCount).map((ep) => (
              <div
                key={ep.id}
                className={`
                  bg-[#1A1A1C] rounded-xl p-5
                  border border-white/[0.06] border-l-4 ${signalStyles[ep.signal].border}
                  transition-all duration-200 
                  hover:shadow-lg hover:shadow-white/5 hover:ring-1 hover:ring-white/10
                  ${ep.isSearchResult ? "ring-1 ring-signal-orange/50" : ""}
                  grid grid-cols-[auto,1fr,1fr,auto,auto] gap-4 items-center
                `}
              >
                {/* Podcast */}
                <div className="flex items-center gap-3 w-32">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                      podcastBadges[ep.podcast] || "bg-gray-500"
                    }`}
                  >
                    {ep.abbreviation}
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
                      <div className={`w-2 h-2 rounded-full ${signalDotColors[ep.signal]}`} />
                      <span className="text-xs text-gray-300 line-clamp-1">
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
                  <span
                    className={`px-2 py-1 text-sm font-bold rounded ${signalStyles[ep.signal].badge} ${
                      signalStyles[ep.signal].text
                    }`}
                  >
                    {ep.score}
                  </span>
                </div>
                
                {/* Action */}
                <div className="text-right">
                  <Button
                    variant="ghost"
                    className="h-8 px-3 text-white hover:bg-white/5"
                    onClick={() => onViewBriefClick(ep)}
                  >
                    View Brief
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-400 mr-4">
              Showing {Math.min(visibleCount, filteredAndSortedEpisodes.length)} of {filteredAndSortedEpisodes.length}{" "}
              episodes
            </p>
            {visibleCount < filteredAndSortedEpisodes.length && (
              <Button variant="secondary" onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}>
                Load More <ChevronDown size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
