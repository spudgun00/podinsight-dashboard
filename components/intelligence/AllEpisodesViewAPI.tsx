"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAllEpisodesAPI } from "@/hooks/useAllEpisodesAPI"
import type { Episode } from "@/lib/mock-episode-data"
import type { ExtendedEpisode } from "@/lib/all-episodes-mock-data"
import { Search, X, ChevronDown, ArrowRight, FileSearch, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useDebounce } from "@/hooks/useDebounce"

type SortKey = keyof ExtendedEpisode | ""
type SortDirection = "asc" | "desc"

const signalStyles: Record<ExtendedEpisode["signal"], { text: string; badge: string; border: string }> = {
  red_hot: { text: "text-signal-red", badge: "bg-signal-red/20 border-signal-red/30", border: "border-l-signal-red" },
  high_value: { text: "text-signal-orange", badge: "bg-signal-orange/20 border-signal-orange/30", border: "border-l-signal-orange" },
  market_intel: { text: "text-signal-green", badge: "bg-signal-green/20 border-signal-green/30", border: "border-l-signal-green" },
  portfolio_mention: { text: "text-signal-blue", badge: "bg-signal-blue/20 border-signal-blue/30", border: "border-l-signal-blue" },
}

const podcastBadges: Record<string, string> = {
  "All-In": "bg-red-500",
  "All-In Pod": "bg-red-500",
  "20VC": "bg-blue-500",
  "Lenny's Pod": "bg-green-500",
  Acquired: "bg-yellow-500",
  "Invest Like the Best": "bg-purple-500",
  "My First Million": "bg-pink-500",
}

export function AllEpisodesViewAPI({
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
    dateRange: "all",
    minScore: "50",
  })
  const [isMobile, setIsMobile] = useState(false)
  
  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate date range
  const getDateRange = () => {
    const now = new Date()
    const startDate = new Date()
    
    switch (filters.dateRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24)
        break
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "3m":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "all":
        // Return empty object for "all time" - no date filtering
        return {}
      default:
        return {}
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    }
  }

  const dateRange = getDateRange()
  
  // Use the API hook with filters
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useAllEpisodesAPI({
    podcast: filters.podcast,
    signalType: filters.signal,
    minScore: filters.minScore === "all" ? undefined : parseInt(filters.minScore),
    query: debouncedSearchQuery,
    ...dateRange,
    enabled: open // Only fetch when modal is open
  })

  // Flatten pages into a single array of episodes
  const allEpisodes = useMemo(() => {
    return data?.pages.flatMap(page => page.episodes) || []
  }, [data])

  // Get unique podcasts for filter dropdown
  const uniquePodcasts = useMemo(() => {
    const podcasts = new Set(allEpisodes.map(ep => ep.podcast))
    return Array.from(podcasts).sort()
  }, [allEpisodes])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getSignalLabel = (signal: ExtendedEpisode["signal"]) => {
    const labels = {
      red_hot: "🔥 Investable Signal",
      high_value: "⚡ Competitive Intel",
      market_intel: "📊 Market Intel",
      portfolio_mention: "💼 Portfolio Mention",
    }
    return labels[signal]
  }

  const renderMobileView = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
        </div>
      ) : allEpisodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FileSearch className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-gray-400 text-center">No episodes found matching your criteria</p>
        </div>
      ) : (
        allEpisodes.map((episode) => {
          const style = signalStyles[episode.signal]
          const badge = podcastBadges[episode.podcast] || "bg-gray-500"
          
          return (
            <div
              key={episode.id}
              className={`p-4 rounded-lg border ${style.border} border-l-4 bg-gray-900/50 cursor-pointer hover:bg-gray-900/70 transition-colors`}
              onClick={() => onViewBriefClick(episode)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`${badge} text-white text-xs font-bold px-2 py-1 rounded`}>
                  {episode.abbreviation}
                </div>
                <span className="text-xs text-gray-400">{episode.timeAgo}</span>
              </div>
              
              <h3 className="font-semibold text-white mb-2 line-clamp-2">{episode.title}</h3>
              
              <div className="space-y-2 mb-3">
                {episode.intel.slice(0, 2).map((item, i) => (
                  <p key={i} className="text-sm text-gray-400 line-clamp-1">
                    • {item}
                  </p>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${style.text}`}>
                  {getSignalLabel(episode.signal)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{episode.duration}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          )
        })
      )}
      
      {hasNextPage && !isLoading && (
        <Button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full"
          variant="outline"
        >
          {isFetchingNextPage ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading more...
            </>
          ) : (
            <>
              Load More Episodes
              <ChevronDown className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </div>
  )

  const renderDesktopView = () => (
    <div className="space-y-2">
      {/* Desktop Header */}
      <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">
        <div className="col-span-5">Episode</div>
        <div className="col-span-2">Podcast</div>
        <div className="col-span-2">Signal Type</div>
        <div className="col-span-1">Score</div>
        <div className="col-span-1">Duration</div>
        <div className="col-span-1"></div>
      </div>

      {/* Episodes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
        </div>
      ) : allEpisodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FileSearch className="w-20 h-20 text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg">No episodes found matching your criteria</p>
        </div>
      ) : (
        <>
          {allEpisodes.map((episode) => {
            const style = signalStyles[episode.signal]
            const badge = podcastBadges[episode.podcast] || "bg-gray-500"
            
            return (
              <div
                key={episode.id}
                className={`grid grid-cols-12 gap-4 p-4 rounded-lg border ${style.border} border-l-4 bg-gray-900/30 hover:bg-gray-900/50 cursor-pointer transition-all items-center group`}
                onClick={() => onViewBriefClick(episode)}
              >
                <div className="col-span-5">
                  <h3 className="font-semibold text-white group-hover:text-brand-purple transition-colors line-clamp-1">
                    {episode.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                    {episode.intel[0]}
                  </p>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className={`${badge} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                      {episode.abbreviation}
                    </div>
                    <span className="text-sm text-gray-300">{episode.podcast}</span>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <span className={`text-sm font-medium ${style.text}`}>
                    {getSignalLabel(episode.signal)}
                  </span>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl">🔥</span>
                    <span className="text-sm font-bold text-white">{episode.score}</span>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <span className="text-sm text-gray-400">{episode.duration}</span>
                </div>
                
                <div className="col-span-1 text-right">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-purple transition-colors" />
                </div>
              </div>
            )
          })}
          
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                size="lg"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    Load More Episodes
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] p-0 overflow-hidden bg-[#0A0A0B] border-gray-800">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-white">All Episodes</DialogTitle>
              <DialogDescription className="text-gray-400 mt-1">
                {allEpisodes.length} episodes with intelligence signals
              </DialogDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full hover:bg-gray-900 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Filters */}
          <div className="mt-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search episodes, podcasts, or intelligence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
            
            {/* Filter Row */}
            <div className={`${isMobile ? 'space-y-3' : 'flex gap-3'}`}>
              <Select value={filters.podcast} onValueChange={(value) => handleFilterChange("podcast", value)}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="All Podcasts" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Podcasts</SelectItem>
                  {uniquePodcasts.map(podcast => (
                    <SelectItem key={podcast} value={podcast}>{podcast}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.signal} onValueChange={(value) => handleFilterChange("signal", value)}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="All Signals" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Signals</SelectItem>
                  <SelectItem value="red_hot">🔥 Investable Signal</SelectItem>
                  <SelectItem value="high_value">⚡ Competitive Intel</SelectItem>
                  <SelectItem value="market_intel">📊 Market Intel</SelectItem>
                  <SelectItem value="portfolio_mention">💼 Portfolio Mention</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.minScore} onValueChange={(value) => handleFilterChange("minScore", value)}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Min Score" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">Any Score</SelectItem>
                  <SelectItem value="50">50+</SelectItem>
                  <SelectItem value="70">70+</SelectItem>
                  <SelectItem value="85">85+</SelectItem>
                  <SelectItem value="90">90+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>
        
        {/* Episodes List */}
        <div className="px-6 pb-6 mt-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {isError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-red-400 text-center">
                Failed to load episodes: {error?.message || 'Unknown error'}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : isMobile ? renderMobileView() : renderDesktopView()}
        </div>
      </DialogContent>
    </Dialog>
  )
}