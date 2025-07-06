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

// Fixed color interpolation for dark theme
const getSentimentColor = (sentiment: number): string => {
  // Clamp sentiment between -1 and 1
  const clampedSentiment = Math.max(-1, Math.min(1, sentiment))
  const absSentiment = Math.abs(clampedSentiment)

  if (clampedSentiment === 0) {
    return "rgba(255, 255, 255, 0.05)" // Neutral
  } else if (clampedSentiment > 0) {
    // Positive (green)
    if (absSentiment <= 0.33) return "rgba(34, 197, 94, 0.2)" // Light
    if (absSentiment <= 0.66) return "rgba(34, 197, 94, 0.4)" // Medium
    return "rgba(34, 197, 94, 0.6)" // Strong
  } else {
    // Negative (red)
    if (absSentiment <= 0.33) return "rgba(239, 68, 68, 0.2)" // Light
    if (absSentiment <= 0.66) return "rgba(239, 68, 68, 0.4)" // Medium
    return "rgba(239, 68, 68, 0.6)" // Strong
  }
}

// Get appropriate text color for contrast
const getTextColor = (sentiment: number): string => {
  return "#FFFFFF" // Always white text on dark backgrounds
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

  // Use provided data or empty array
  const heatmapData = useMemo(() => {
    return data || []
  }, [data])

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
      <div className="intel-card">
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
    <div className="relative overflow-hidden" style={{
      backgroundColor: "#1A1A1C",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
      borderRadius: "16px",
      padding: "20px"
    }}>
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-brand-purple/[0.02] rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-brand-blue/[0.02] rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header with Time Range Filter */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Sentiment Analysis Heatmap</h3>
            <p className="text-sm" style={{ color: "#9CA3AF" }}>AI-powered sentiment tracking across topics and time</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1">
            {(["1M", "3M", "6M", "1Y", "All"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className="transition-all duration-200"
                style={{
                  background: selectedTimeRange === range ? "rgba(139, 92, 246, 0.2)" : "transparent",
                  border: selectedTimeRange === range ? "1px solid #8B5CF6" : "1px solid rgba(255, 255, 255, 0.06)",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  color: selectedTimeRange === range ? "#FFFFFF" : "#9CA3AF",
                  fontWeight: selectedTimeRange === range ? 500 : 400
                }}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Container */}
        <div className="relative overflow-x-auto">
          {/* Grid */}
          <div className="grid gap-1 mb-6 mx-auto" style={{ 
            gridTemplateColumns: `150px repeat(${Math.min(weeks, 12)}, minmax(0, 1fr))`,
            maxWidth: weeks <= 12 ? '100%' : '1200px'
          }}>
            {/* Header row */}
            <div></div> {/* Empty corner */}
            {weekLabels.slice(0, Math.min(weeks, 12)).map((week) => (
              <div key={week} className="text-xs text-gray-400 text-center py-1 font-mono">
                {week}
              </div>
            ))}
            {/* Data rows */}
            {topics.map((topic) => (
              <React.Fragment key={topic}>
                {/* Topic label */}
                <div className="text-sm py-2 flex items-center justify-end" style={{
                  background: "transparent",
                  color: "white",
                  fontWeight: 500,
                  paddingRight: "16px"
                }}>
                  <span className="whitespace-nowrap">{topic}</span>
                </div>

                {/* Sentiment cells */}
                {weekLabels.slice(0, Math.min(weeks, 12)).map((week, weekIndex) => {
                  const dataPoint = getDataPoint(topic, week)
                  const sentiment = dataPoint?.sentiment ?? 0
                  const hasData = dataPoint !== undefined

                  const isHovered = hoveredCell?.topic === topic && hoveredCell?.week === week
                  const isSelected = selectedCell?.topic === topic && selectedCell?.week === week

                  const backgroundColor = hasData ? getSentimentColor(sentiment) : '#0F0F11'
                  const textColor = hasData ? getTextColor(sentiment) : '#666666'

                  return (
                    <div
                      key={`${topic}-${week}`}
                      className="relative cursor-pointer transition-all duration-200"
                      style={{
                        background: backgroundColor,
                        border: isHovered ? "1px solid rgba(139, 92, 246, 0.5)" : "1px solid rgba(255, 255, 255, 0.03)",
                        borderRadius: "4px",
                        height: "40px"
                      }}
                      onMouseEnter={(e) => handleCellHover(topic, week, e)}
                      onMouseLeave={handleCellLeave}
                      onClick={() => handleCellClick(topic, week)}
                    >
                      {/* Cell content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {hasData ? (
                          <span style={{ 
                            fontSize: "13px",
                            fontWeight: 600,
                            color: textColor,
                            fontFamily: "monospace"
                          }}>
                            {sentiment >= 0 ? "+" : ""}
                            {sentiment.toFixed(2)}
                          </span>
                        ) : (
                          <span style={{ fontSize: "13px", color: "#666666" }}>--</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#9CA3AF" }}>Negative</span>
              <div className="flex items-center gap-1">
                <div style={{ width: "24px", height: "16px", backgroundColor: "rgba(239, 68, 68, 0.2)", borderRadius: "4px" }}></div>
                <div style={{ width: "24px", height: "16px", backgroundColor: "rgba(239, 68, 68, 0.4)", borderRadius: "4px" }}></div>
                <div style={{ width: "24px", height: "16px", backgroundColor: "rgba(239, 68, 68, 0.6)", borderRadius: "4px" }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: "24px", height: "16px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "4px" }}></div>
              <span className="text-xs" style={{ color: "#9CA3AF" }}>Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div style={{ width: "24px", height: "16px", backgroundColor: "rgba(34, 197, 94, 0.2)", borderRadius: "4px" }}></div>
                <div style={{ width: "24px", height: "16px", backgroundColor: "rgba(34, 197, 94, 0.4)", borderRadius: "4px" }}></div>
                <div style={{ width: "24px", height: "16px", backgroundColor: "rgba(34, 197, 94, 0.6)", borderRadius: "4px" }}></div>
              </div>
              <span className="text-xs" style={{ color: "#9CA3AF" }}>Positive</span>
            </div>
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
          <div className="backdrop-blur-xl rounded-lg px-3 py-2 shadow-2xl mb-2" style={{
            backgroundColor: "#1A1A1C",
            border: "1px solid rgba(139, 92, 246, 0.5)",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.8)"
          }}>
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
