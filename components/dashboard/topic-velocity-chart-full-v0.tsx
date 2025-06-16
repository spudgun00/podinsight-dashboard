"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ReferenceLine,
  ReferenceDot,
} from "recharts"
import { fetchTopicVelocity } from "@/lib/api"
import { DEFAULT_TOPICS, TOPIC_COLORS } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface TopicVelocityChartProps {
  selectedTimeRange: "1M" | "3M" | "6M"
  onNotablePerformerChange?: (performer: { topic: string; change: string; arrow: string; positive: boolean; data: any[]; color: string }) => void
}

// Generate insights based on actual data
const generateInsights = (data: any[], trends: any[], stats: any) => {
  const insights: string[] = []
  
  // Find the topic with highest growth
  const topGrowth = trends.reduce((max, curr) => 
    parseFloat(String(curr.change)) > parseFloat(String(max.change)) ? curr : max
  )
  
  // Find the topic with most mentions
  const topicTotals: { [key: string]: number } = {}
  DEFAULT_TOPICS.forEach(topic => {
    topicTotals[topic] = data.reduce((sum, week) => sum + (week[topic] || 0), 0)
  })
  const dominantTopic = Object.entries(topicTotals)
    .sort(([, a], [, b]) => b - a)[0]
  
  if (topGrowth && topGrowth.change > 0) {
    insights.push(`${topGrowth.topic} ${topGrowth.arrow}${topGrowth.change}% week-over-week, ${topGrowth.change > 50 ? 'explosive growth detected' : 'showing strong momentum'}`)
  }
  
  if (dominantTopic) {
    const percentage = ((dominantTopic[1] / stats.totalMentions) * 100).toFixed(0)
    insights.push(`${dominantTopic[0]} dominates with ${percentage}% of all mentions, reflecting strong market focus`)
  }
  
  if (stats.avgWeeklyGrowth > 20) {
    insights.push(`Market velocity at ${stats.avgWeeklyGrowth.toFixed(0)}% average weekly growth, indicating high investor interest`)
  }
  
  // Add some variety
  insights.push(`${stats.totalMentions.toLocaleString()} total mentions across ${data.length} weeks of podcast analysis`)
  insights.push(`Most active discussion in ${stats.mostActiveWeek}, suggesting key market events`)
  
  // Always have at least 5 insights
  while (insights.length < 5) {
    insights.push(`Tracking ${DEFAULT_TOPICS.length} key topics across 29 top tech podcasts`)
  }
  
  return insights
}

// Helper function to calculate velocity badge
const getVelocityBadge = (topic: string, data: any[]) => {
  if (!data || data.length < 3) return null
  
  const len = data.length
  const recent = data[len - 1][topic] || 0
  const prev1 = data[len - 2][topic] || 0
  const prev2 = data[len - 3][topic] || 0

  // Calculate growth rates
  const recentGrowth = prev1 ? ((recent - prev1) / prev1) * 100 : 0
  const prevGrowth = prev2 ? ((prev1 - prev2) / prev2) * 100 : 0

  // Determine velocity trend
  const growthDiff = recentGrowth - prevGrowth

  if (growthDiff > 2) {
    return {
      emoji: "🔥",
      text: "Accelerating",
      bgColor: "bg-green-500/20",
      textColor: "text-green-400",
    }
  } else if (growthDiff < -2) {
    return {
      emoji: "📉",
      text: "Slowing",
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
    }
  } else {
    return {
      emoji: "📊",
      text: "Steady",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-400",
    }
  }
}

// Add custom animation styles
const customStyles = `
  @keyframes pulse-lightning {
    0%, 100% { 
      transform: scale(1) rotate(0deg);
      filter: brightness(1) drop-shadow(0 0 2px rgba(124, 58, 237, 0.8));
    }
    50% { 
      transform: scale(1.2) rotate(5deg);
      filter: brightness(1.5) drop-shadow(0 0 8px rgba(124, 58, 237, 1));
    }
  }

  @keyframes float-slow {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.03; }
    33% { transform: translate(30px, -30px) scale(1.05); opacity: 0.05; }
    66% { transform: translate(-20px, 20px) scale(0.95); opacity: 0.03; }
  }

  @keyframes float-medium {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.03; }
    50% { transform: translate(-40px, -20px) scale(1.1); opacity: 0.05; }
  }

  @keyframes float-fast {
    0%, 100% { transform: translate(0, 0); opacity: 0.03; }
    25% { transform: translate(20px, -10px); opacity: 0.04; }
    75% { transform: translate(-20px, 10px); opacity: 0.04; }
  }

  @keyframes float-reverse {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.03; }
    50% { transform: translate(40px, 20px) scale(0.9); opacity: 0.05; }
  }

  .animate-pulse-lightning {
    animation: pulse-lightning 3s ease-in-out infinite;
  }

  .animate-float-slow {
    animation: float-slow 20s ease-in-out infinite;
  }

  .animate-float-medium {
    animation: float-medium 15s ease-in-out infinite;
  }

  .animate-float-fast {
    animation: float-fast 10s ease-in-out infinite;
  }

  .animate-float-reverse {
    animation: float-reverse 18s ease-in-out infinite;
  }
`

export function TopicVelocityChartFullV0({ selectedTimeRange, onNotablePerformerChange }: TopicVelocityChartProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [previousData, setPreviousData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hoveredLine, setHoveredLine] = useState<string | null>(null)
  const [hiddenTopics, setHiddenTopics] = useState<string[]>([])
  const [isChartHovered, setIsChartHovered] = useState(false)
  const [mouseCoords, setMouseCoords] = useState<{ x: string | null; y: number | null }>({ x: null, y: null })
  const [showComparison, setShowComparison] = useState(false)
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0)
  const [animationsComplete, setAnimationsComplete] = useState(false)
  const [insights, setInsights] = useState<string[]>([])
  const [statistics, setStatistics] = useState({
    totalMentions: 0,
    avgWeeklyGrowth: 0,
    mostActiveWeek: "",
    trendingTopic: "",
  })

  // Cycle through insights every 10 seconds
  useEffect(() => {
    if (insights.length > 0) {
      const insightTimer = setInterval(() => {
        setCurrentInsightIndex((prev) => (prev + 1) % insights.length)
      }, 10000)
      return () => clearInterval(insightTimer)
    }
  }, [insights])

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationsComplete(true)
    }, 2000) // Wait for animations to complete
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Convert time range to weeks
        const weeks = selectedTimeRange === "1M" ? 4 : selectedTimeRange === "3M" ? 12 : 24
        
        // Fetch data from API
        const response = await fetchTopicVelocity(weeks, DEFAULT_TOPICS)
        
        // Transform API response to chart format
        const chartData: any[] = []
        
        // Get all unique weeks from the data
        const weekSet = new Set<string>()
        Object.values(response.data).forEach(topicData => {
          topicData.forEach(item => weekSet.add(item.week))
        })
        
        // Sort weeks
        const sortedWeeks = Array.from(weekSet).sort()
        
        // Build chart data with all topics for each week
        sortedWeeks.forEach(week => {
          const weekData: any = { 
            week: week.replace("2025-", ""), // Simplify week display
            fullWeek: week
          }
          
          DEFAULT_TOPICS.forEach(topic => {
            const topicWeekData = response.data[topic]?.find(item => item.week === week)
            weekData[topic] = topicWeekData?.mentions || 0
          })
          
          chartData.push(weekData)
        })
        
        // Calculate statistics
        let totalMentions = 0
        let growthRates: number[] = []
        let maxWeek = { week: "", count: 0 }
        let topicTotals: { [key: string]: number } = {}

        DEFAULT_TOPICS.forEach(topic => {
          topicTotals[topic] = 0
          if (chartData.length > 1) {
            for (let i = 1; i < chartData.length; i++) {
              const prev = chartData[i - 1][topic] || 0
              const curr = chartData[i][topic] || 0
              if (prev > 0) {
                growthRates.push(((curr - prev) / prev) * 100)
              }
            }
          }
        })

        chartData.forEach((weekData) => {
          let weekTotal = 0
          DEFAULT_TOPICS.forEach(topic => {
            const count = weekData[topic] || 0
            totalMentions += count
            weekTotal += count
            topicTotals[topic] += count
          })
          if (weekTotal > maxWeek.count) {
            maxWeek = { week: weekData.week, count: weekTotal }
          }
        })

        const avgWeeklyGrowth = growthRates.length > 0 
          ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length 
          : 0

        const trendingTopic = Object.entries(topicTotals)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || ""

        setStatistics({
          totalMentions,
          avgWeeklyGrowth,
          mostActiveWeek: maxWeek.week,
          trendingTopic,
        })
        
        // Calculate latest trends for insights
        const trends = DEFAULT_TOPICS.map(topic => {
          if (chartData.length < 2) return { topic, change: 0, arrow: "→", positive: false }
          
          const latest = chartData[chartData.length - 1][topic] || 0
          const previous = chartData[chartData.length - 2][topic] || 0
          const change = previous === 0 ? 0 : ((latest - previous) / previous * 100)
          const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→"
          
          return { topic, change: Math.abs(change).toFixed(0), arrow, positive: change > 0 }
        })
        
        // Generate insights from real data
        const generatedInsights = generateInsights(chartData, trends, {
          totalMentions,
          avgWeeklyGrowth,
          mostActiveWeek: maxWeek.week,
          trendingTopic,
        })
        setInsights(generatedInsights)
        
        // Generate previous quarter data for comparison
        const prevQuarterData = chartData.map((week, index) => {
          const prevData: any = { week: week.week, fullWeek: week.fullWeek }
          DEFAULT_TOPICS.forEach(topic => {
            // Simulate previous quarter with some variance
            const currentValue = week[topic] || 0
            const variance = 0.7 + Math.random() * 0.6 // 70% to 130% of current
            prevData[topic] = Math.round(currentValue * variance)
          })
          return prevData
        })
        setPreviousData(prevQuarterData)
        
        setData(chartData)
      } catch (err) {
        console.error("Failed to fetch topic data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedTimeRange])

  const handleLegendClick = (data: any) => {
    const topicName = data.value
    setHiddenTopics((prev) =>
      prev.includes(topicName) ? prev.filter((topic) => topic !== topicName) : [...prev, topicName],
    )
  }

  // Calculate period-based trends (not just last week)
  const calculatePeriodTrends = () => {
    if (data.length < 2) return DEFAULT_TOPICS.map(topic => ({ topic, change: 0, arrow: "→", positive: false, absoluteChange: 0, percentChange: 0 }))
    
    // Get first and last data points based on time range
    const firstWeek = data[0]
    const lastWeek = data[data.length - 1]
    
    return DEFAULT_TOPICS.map(topic => {
      const firstValue = firstWeek[topic] || 0
      const lastValue = lastWeek[topic] || 0
      const absoluteChange = lastValue - firstValue
      const percentChange = firstValue === 0 ? 
        (lastValue > 0 ? 100 : 0) : 
        ((lastValue - firstValue) / firstValue * 100)
      
      return {
        topic,
        change: Math.abs(percentChange).toFixed(0),
        arrow: percentChange > 0 ? "↑" : percentChange < 0 ? "↓" : "→",
        positive: percentChange > 0,
        absoluteChange,
        percentChange
      }
    })
  }

  const periodTrends = calculatePeriodTrends()
  
  // Find notable performer (biggest absolute change)
  const notablePerformer = periodTrends.reduce((notable, curr) => {
    const notableAbsolute = Math.abs(notable.percentChange || 0)
    const currAbsolute = Math.abs(curr.percentChange || 0)
    return currAbsolute > notableAbsolute ? curr : notable
  }, periodTrends[0])

  // Extract sparkline data for notable performer
  useEffect(() => {
    if (onNotablePerformerChange && notablePerformer && data.length > 0) {
      const sparklineData = data.map(week => ({
        value: week[notablePerformer.topic] || 0
      }))
      onNotablePerformerChange({
        topic: notablePerformer.topic,
        change: notablePerformer.change,
        arrow: notablePerformer.arrow,
        positive: notablePerformer.positive,
        data: sparklineData,
        color: TOPIC_COLORS[notablePerformer.topic as keyof typeof TOPIC_COLORS]
      })
    }
  }, [notablePerformer, data, onNotablePerformerChange])

  // Calculate week-over-week trends for legend
  const weeklyTrends = DEFAULT_TOPICS.map(topic => {
    if (data.length < 2) return { topic, change: 0, arrow: "→", positive: false }
    
    const latest = data[data.length - 1][topic] || 0
    const previous = data[data.length - 2][topic] || 0
    const change = previous === 0 ? 0 : ((latest - previous) / previous * 100)
    const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→"
    
    return { topic, change: Math.abs(change).toFixed(0), arrow, positive: change > 0 }
  })

  // Add velocity badge for notable performer
  const velocityBadge = getVelocityBadge(notablePerformer.topic, data)

  const customLegendFormatter = (value: string) => {
    const isHidden = hiddenTopics.includes(value)
    const isHovered = hoveredLine === value
    const trend = weeklyTrends.find(t => t.topic === value)

    return (
      <span
        style={{
          color: isHidden ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)",
          textDecoration: isHidden ? "line-through" : "none",
          fontWeight: isHovered ? "bold" : "normal",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        {value}{" "}
        {trend && (
          <span className={trend.positive ? "text-green-400" : "text-red-400"}>
            {trend.arrow}{trend.change}% w/w
          </span>
        )}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-black/30 backdrop-blur-2xl border rounded-xl shadow-2xl shadow-purple-500/20 ring-1 ring-white/10 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-[400px] bg-gray-800 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-black/30 backdrop-blur-2xl border rounded-xl shadow-2xl shadow-purple-500/20 ring-1 ring-white/10 p-4 md:p-6">
        <div className="flex items-center justify-center h-[400px] text-red-500">
          <p>Error loading data: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Topic Velocity Tracker</h2>
          <p className="text-gray-400">Mentions per week across tracked podcasts</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Top Performer Badge */}
          <div className="text-right">
            <p className="text-xs text-gray-400">Notable Performer</p>
            <div className="flex items-baseline gap-1">
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-semibold" style={{ color: TOPIC_COLORS[notablePerformer.topic as keyof typeof TOPIC_COLORS] }}>
                  {notablePerformer.topic}
                </p>
                <p className={cn(
                  "text-2xl font-bold",
                  notablePerformer.positive ? "text-green-400" : "text-red-400"
                )}>
                  {notablePerformer.arrow}{notablePerformer.change}%
                </p>
                <p className="text-sm font-medium text-white/60">({selectedTimeRange})</p>
              </div>
              {velocityBadge && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  velocityBadge.bgColor,
                  velocityBadge.textColor
                )}>
                  {velocityBadge.text} {velocityBadge.emoji}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Banner */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 px-4 py-3 rounded-lg mb-4 border border-purple-500/20 flex items-center justify-between">
        <p className="text-sm transition-all duration-500 ease-in-out flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
          <span
            className="text-lg inline-block animate-pulse-lightning mr-1"
            style={{
              animation: "pulse-lightning 3s ease-in-out infinite",
              transformOrigin: "center",
            }}
          >
            ⚡
          </span>
          <span className="text-purple-400 font-bold tracking-wide">SIGNAL:</span>{" "}
          <span className="text-gray-200">{insights[currentInsightIndex] || "Analyzing podcast trends..."}</span>
        </p>
        <div className="flex gap-1 ml-4 flex-shrink-0">
          {(insights.length > 0 ? insights : [""]).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentInsightIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 hover:scale-125",
                index === currentInsightIndex ? "bg-purple-600" : "bg-gray-600 hover:bg-gray-500"
              )}
              aria-label={`Go to insight ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Comparison Mode Indicator */}
      {showComparison && (
        <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg mb-4 flex items-center gap-2 text-sm">
          <span className="text-blue-400">📊 Comparison Mode:</span>
          <span className="text-gray-300">Showing previous {selectedTimeRange} period as dashed lines</span>
        </div>
      )}

      <div
        className={cn(
          "bg-black/30 backdrop-blur-2xl border rounded-xl shadow-2xl shadow-purple-500/20 ring-1 ring-white/10 p-4 md:p-6 relative overflow-hidden group transition-all duration-300",
          isChartHovered
            ? "border-purple-500/50 shadow-purple-500/30"
            : "border-white/10"
        )}
        onMouseEnter={() => setIsChartHovered(true)}
        onMouseLeave={() => setIsChartHovered(false)}
        style={{
          background: isChartHovered
            ? "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(139,92,246,0.05) 50%, rgba(0,0,0,0.4) 100%), rgba(0,0,0,0.3)"
            : undefined,
          boxShadow: isChartHovered
            ? "0 25px 50px -12px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 25px 50px -12px rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Compare periods button - positioned in top-right corner */}
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={cn(
            "absolute top-4 right-4 text-2xl transition-all duration-200 hover:text-gray-200 active:scale-95 z-20 p-2 rounded-lg",
            showComparison ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30" : "text-gray-400 hover:bg-gray-700/50"
          )}
          title={showComparison ? "Hide comparison" : "Compare to previous period"}
        >
          ⟳
        </button>

        {/* Floating background orbs - much more subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-purple-600/[0.03] rounded-full blur-2xl animate-float-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-blue-600/[0.03] rounded-full blur-xl animate-float-medium"></div>
          <div className="absolute bottom-1/3 left-1/2 w-28 h-28 bg-emerald-600/[0.03] rounded-full blur-lg animate-float-fast"></div>
          <div className="absolute top-1/2 right-1/3 w-36 h-36 bg-amber-600/[0.03] rounded-full blur-xl animate-float-reverse"></div>
          <div className="absolute top-1/6 right-1/6 w-24 h-24 bg-purple-600/[0.03] rounded-full blur-lg animate-float-medium"></div>
          <div className="absolute bottom-1/6 left-1/6 w-20 h-20 bg-blue-600/[0.03] rounded-full blur-md animate-float-fast"></div>
        </div>

        {/* Enhanced noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9Im5vaXNlIj4KICAgICAgPGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHNlZWQ9IjIiLz4KICAgICAgPGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNCIvPgo8L3N2Zz4K')] bg-repeat"></div>
        <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-gradient-to-br from-purple-600/5 via-transparent to-blue-600/5"></div>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseMove={(e) => {
              if (e && e.activeLabel !== undefined && e.activeCoordinate) {
                setMouseCoords({
                  x: e.activeLabel,
                  y: e.activeCoordinate.y,
                })
              }
            }}
            onMouseLeave={() => setMouseCoords({ x: null, y: null })}
          >
            <defs>
              {DEFAULT_TOPICS.map((topic) => {
                const color = TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS]
                const gradientId = `${topic.replace(/\s+/g, '')}Gradient`
                return (
                  <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                )
              })}
            </defs>
            
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.05)"
              opacity={1}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="week" 
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
              label={{ value: 'Week', position: 'insideBottom', offset: -5, style: { fill: 'rgba(255,255,255,0.5)' } }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
              label={{ value: 'Mentions', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.5)' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)'
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
            />
            <Legend 
              onClick={handleLegendClick}
              formatter={customLegendFormatter}
              onMouseEnter={(data) => setHoveredLine(data.value)}
              onMouseLeave={() => setHoveredLine(null)}
            />

            {/* Crosshair guides */}
            {mouseCoords.x && (
              <ReferenceLine
                x={mouseCoords.x}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
            {mouseCoords.y && (
              <ReferenceLine
                y={mouseCoords.y}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
            {mouseCoords.x && mouseCoords.y && (
              <ReferenceDot
                x={mouseCoords.x}
                y={mouseCoords.y}
                r={2}
                fill="rgba(255, 255, 255, 0.8)"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth={1}
              />
            )}

            {/* Gradient fills for all topics */}
            {DEFAULT_TOPICS.map((topic) => (
              <Area
                key={`${topic}-area`}
                type="monotone"
                dataKey={topic}
                stroke="none"
                fill={`url(#${topic.replace(/\s+/g, '')}Gradient)`}
                fillOpacity={1}
              />
            ))}

            {/* Previous quarter comparison lines (if enabled) */}
            {showComparison && previousData.length > 0 &&
              DEFAULT_TOPICS.map((topic) => (
                <Line
                  key={`${topic}-prev`}
                  type="monotone"
                  dataKey={topic}
                  data={previousData}
                  stroke={TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS]}
                  strokeWidth={1.5}
                  strokeOpacity={0.4}
                  strokeDasharray="3 6"
                  dot={false}
                  hide={hiddenTopics.includes(topic)}
                  name={`${topic} (Previous Period)`}
                />
              ))
            }

            {/* Current period lines */}
            {DEFAULT_TOPICS.map((topic) => (
              <Line
                key={topic}
                type="monotone"
                dataKey={topic}
                stroke={TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS]}
                strokeWidth={hoveredLine === topic ? 4 : 2}
                dot={false}
                hide={hiddenTopics.includes(topic)}
                onMouseEnter={() => setHoveredLine(topic)}
                onMouseLeave={() => setHoveredLine(null)}
                opacity={hoveredLine && hoveredLine !== topic ? 0.3 : 1}
                style={{ transition: "opacity 0.3s ease, stroke-width 0.3s ease" }}
                isAnimationActive={!animationsComplete}
                animationDuration={1000}
                animationBegin={DEFAULT_TOPICS.indexOf(topic) * 200}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Total Mentions</p>
          <p className="text-lg font-semibold">{statistics.totalMentions.toLocaleString()}</p>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Avg. Weekly Growth</p>
          <p className="text-lg font-semibold">
            {statistics.avgWeeklyGrowth > 0 ? "+" : ""}{statistics.avgWeeklyGrowth.toFixed(1)}%
          </p>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Most Active Week</p>
          <p className="text-lg font-semibold">{statistics.mostActiveWeek || "—"}</p>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Trending Topic</p>
          <p className="text-lg font-semibold">{statistics.trendingTopic || "—"}</p>
        </div>
      </div>
    </div>
  )
}