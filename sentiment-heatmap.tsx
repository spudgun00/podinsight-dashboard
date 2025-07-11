"use client"

import React from "react"
import { useState, useMemo } from "react"

interface SentimentData {
  topic: string
  week: string
  sentiment: number // -1 to 1
  episodeCount?: number
}

interface SentimentHeatmapProps {
  data?: SentimentData[]
  isLoading?: boolean
  onCellClick?: (topic: string, week: string) => void
}

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "All"

// Fixed HSL-based color interpolation
const getSentimentColor = (sentiment: number): string => {
  // Clamp sentiment between -1 and 1
  const clampedSentiment = Math.max(-1, Math.min(1, sentiment))

  if (clampedSentiment < 0) {
    // Interpolate from red (0°) to yellow (60°)
    const hue = (clampedSentiment + 1) * 60 // 0 to 60
    return `hsl(${hue}, 70%, 50%)`
  } else {
    // Interpolate from yellow (60°) to green (120°)
    const hue = 60 + clampedSentiment * 60 // 60 to 120
    return `hsl(${hue}, 70%, 50%)`
  }
}

// Get appropriate text color for contrast
const getTextColor = (sentiment: number): string => {
  // Use dark text on yellow/light colors, white on dark colors
  if (sentiment > -0.3 && sentiment < 0.3) {
    return "#000000" // Dark text on yellow
  }
  return "#FFFFFF" // White text on red/green
}

// Generate realistic mock sentiment data with patterns
const generateMockSentimentData = (weeks: number): SentimentData[] => {
  const topics = ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"]
  const weekLabels = Array.from({ length: weeks }, (_, i) => `W${i + 1}`)

  return topics.flatMap((topic) =>
    weekLabels.map((week, weekIndex) => {
      let baseSentiment = 0
      const progress = weekIndex / (weeks - 1) // 0 to 1

      // Define realistic patterns for each topic
      switch (topic) {
        case "AI Agents":
          // Generally positive, trending up
          baseSentiment = 0.2 + progress * 0.5 + Math.sin(weekIndex * 0.3) * 0.1
          break
        case "Capital Efficiency":
          // Mixed, slightly declining
          baseSentiment = 0.3 - progress * 0.4 + Math.sin(weekIndex * 0.5) * 0.2
          break
        case "DePIN":
          // Recovering from negative
          baseSentiment = -0.4 + progress * 0.7 + Math.cos(weekIndex * 0.4) * 0.1
          break
        case "B2B SaaS":
          // Stable positive with slight cyclical pattern
          baseSentiment = 0.3 + Math.sin(weekIndex * 0.6) * 0.2
          break
        case "Crypto/Web3":
          // Volatile with overall slight upward trend
          baseSentiment = -0.1 + progress * 0.3 + Math.sin(weekIndex * 0.8) * 0.4
          break
      }

      // Add some noise but keep it realistic
      const noise = (Math.random() - 0.5) * 0.2
      const sentiment = Math.max(-1, Math.min(1, baseSentiment + noise))

      return {
        topic,
        week,
        sentiment,
        episodeCount: Math.floor(Math.random() * 15) + 5,
      }
    }),
  )
}

// Get trend direction
const getTrendDirection = (current: number, previous: number): string => {
  const diff = current - previous
  if (Math.abs(diff) < 0.05) return "→"
  return diff > 0 ? "↑" : "↓"
}

export function SentimentHeatmap({ data, isLoading = false, onCellClick }: SentimentHeatmapProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("3M")
  const [hoveredCell, setHoveredCell] = useState<{ topic: string; week: string } | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ topic: string; week: string } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Calculate weeks based on time range
  const getWeeksForRange = (range: TimeRange): number => {
    switch (range) {
      case "1M":
        return 4
      case "3M":
        return 12
      case "6M":
        return 24
      case "1Y":
        return 52
      case "All":
        return 52
      default:
        return 12
    }
  }

  const weeks = getWeeksForRange(selectedTimeRange)

  // Generate or use provided data
  const heatmapData = useMemo(() => {
    return data && data.length > 0 ? data : generateMockSentimentData(weeks)
  }, [data, weeks])

  const topics = ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"]
  const weekLabels = Array.from({ length: weeks }, (_, i) => `W${i + 1}`)

  const getDataPoint = (topic: string, week: string) => {
    return heatmapData.find((d) => d.topic === topic && d.week === week)
  }

  const getPreviousDataPoint = (topic: string, weekIndex: number) => {
    if (weekIndex === 0) return null
    const prevWeek = `W${weekIndex}`
    return heatmapData.find((d) => d.topic === topic && d.week === prevWeek)
  }

  const handleCellHover = (topic: string, week: string, event: React.MouseEvent) => {
    setHoveredCell({ topic, week })
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const handleCellLeave = () => {
    setHoveredCell(null)
  }

  const handleCellClick = (topic: string, week: string) => {
    setSelectedCell({ topic, week })
    onCellClick?.(topic, week)
  }

  if (isLoading) {
    return (
      <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-purple-500/20 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="grid gap-1" style={{ gridTemplateColumns: `200px repeat(${weeks}, 1fr)` }}>
            {Array.from({ length: (topics.length + 1) * (weeks + 1) }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-purple-500/20 ring-1 ring-white/10 p-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-brand-purple/[0.02] rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-brand-blue/[0.02] rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header with Time Range Filter */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Sentiment Analysis Heatmap</h3>
            <p className="text-sm text-gray-400">AI-powered sentiment tracking across topics and time</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
            {(["1M", "3M", "6M", "1Y", "All"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`text-xs px-3 py-1.5 transition-all duration-200 ${
                  selectedTimeRange === range
                    ? "bg-gray-700 text-white"
                    : "bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Container */}
        <div className="relative">
          {/* Grid */}
          <div className="grid gap-1 mb-6" style={{ gridTemplateColumns: `200px repeat(${weeks}, minmax(40px, 1fr))` }}>
            {/* Header row */}
            <div></div> {/* Empty corner */}
            {weekLabels.map((week) => (
              <div key={week} className="text-xs text-gray-400 text-center py-1 font-mono">
                {week}
              </div>
            ))}
            {/* Data rows */}
            {topics.map((topic, topicIndex) => (
              <React.Fragment key={topic}>
                {/* Topic label */}
                <div className="text-sm text-gray-300 py-2 pr-3 text-right flex items-center justify-end">
                  <span className="whitespace-nowrap font-medium">{topic}</span>
                </div>

                {/* Sentiment cells */}
                {weekLabels.map((week, weekIndex) => {
                  const dataPoint = getDataPoint(topic, week)
                  const sentiment = dataPoint?.sentiment ?? 0
                  const prevDataPoint = getPreviousDataPoint(topic, weekIndex)
                  const trend = prevDataPoint ? getTrendDirection(sentiment, prevDataPoint.sentiment) : "→"

                  const isHovered = hoveredCell?.topic === topic && hoveredCell?.week === week
                  const isSelected = selectedCell?.topic === topic && selectedCell?.week === week

                  const backgroundColor = getSentimentColor(sentiment)
                  const textColor = getTextColor(sentiment)

                  return (
                    <div
                      key={`${topic}-${week}`}
                      className={`relative h-8 rounded cursor-pointer border transition-all duration-200 ${
                        isSelected
                          ? "border-white/50 ring-2 ring-white/30"
                          : isHovered
                            ? "border-white/30"
                            : "border-white/20"
                      }`}
                      style={{
                        backgroundColor,
                      }}
                      onMouseEnter={(e) => handleCellHover(topic, week, e)}
                      onMouseLeave={handleCellLeave}
                      onClick={() => handleCellClick(topic, week)}
                    >
                      {/* Cell content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-mono font-semibold" style={{ color: textColor }}>
                          {sentiment >= 0 ? "+" : ""}
                          {sentiment.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="text-xs text-gray-400 font-medium">Negative</span>
            <div className="relative">
              <div className="flex h-4 w-64 rounded-full overflow-hidden border border-white/10">
                {Array.from({ length: 100 }).map((_, i) => {
                  const sentiment = (i / 99) * 2 - 1 // -1 to 1
                  return (
                    <div
                      key={i}
                      className="flex-1 h-full"
                      style={{ backgroundColor: getSentimentColor(sentiment) }}
                    ></div>
                  )
                })}
              </div>
              {/* Tick marks */}
              <div className="absolute -bottom-4 left-0 text-xs text-gray-500 font-mono">-1.0</div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-mono">
                0.0
              </div>
              <div className="absolute -bottom-4 right-0 text-xs text-gray-500 font-mono">+1.0</div>
            </div>
            <span className="text-xs text-gray-400 font-medium">Positive</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-2 shadow-2xl mb-2">
            {(() => {
              const dataPoint = getDataPoint(hoveredCell.topic, hoveredCell.week)
              const sentiment = dataPoint?.sentiment ?? 0
              const weekNumber = Number.parseInt(hoveredCell.week.slice(1))
              const prevDataPoint = getPreviousDataPoint(hoveredCell.topic, weekNumber - 1)
              const trend = prevDataPoint ? getTrendDirection(sentiment, prevDataPoint.sentiment) : "→"

              return (
                <div className="text-sm">
                  <div className="font-semibold text-white">{hoveredCell.topic}</div>
                  <div className="text-gray-300">Week {weekNumber} of 2025</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: getSentimentColor(sentiment) }}
                    ></span>
                    <span className="text-white font-mono">
                      {sentiment >= 0 ? "+" : ""}
                      {sentiment.toFixed(3)}
                    </span>
                    <span className="text-gray-400">{trend}</span>
                  </div>
                  {dataPoint?.episodeCount && (
                    <div className="text-xs text-gray-400 mt-1">{dataPoint.episodeCount} episodes analyzed</div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
