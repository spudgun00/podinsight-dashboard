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
import { topicVelocityData, previousQuarterData, topicColors } from "@/lib/mock-data"
import type { TopicData } from "@/lib/types"

const topics = Object.keys(topicColors) as Array<keyof TopicData & keyof typeof topicColors>

interface TopicVelocityChartProps {
  isLoading?: boolean
  selectedTimeRange?: "1M" | "3M" | "6M"
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1C] border border-[rgba(139,92,246,0.5)] rounded-lg p-3 shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const isComparison = entry.dataKey.includes("(Last Quarter)")
          return (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-[#9CA3AF]">{entry.name}:</span>
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.value} mentions
              </span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

// AI-generated insights that cycle through
const aiInsights = [
  "AI Agents mentions up 183% this quarter, correlating with GPT-4 launch surge",
  "DePIN shows strongest acceleration, suggesting infrastructure narratives gaining VC attention",
  "Capital Efficiency peaked during SVB crisis, now stabilizing as markets normalize",
  "B2B SaaS maintains steady 15% weekly growth, indicating sustained investor confidence",
  "AI Agents and DePIN topics discussed together in 67% of episodes analyzed",
  "89% positive mentions for AI Agents vs 45% for Capital Efficiency this quarter",
  "Weekly volatility decreased 23%, suggesting more mature discourse around emerging tech",
  "78% of AI Agent discussions originate from SF-based podcasts vs 34% for other topics",
]

// Helper function to get glow filter based on topic color
const getGlowFilter = (topic: string) => {
  const color = topicColors[topic as keyof typeof topicColors]
  if (color === "#7C3AED") return "url(#glow-purple)"
  if (color === "#3B82F6") return "url(#glow-blue)"
  if (color === "#10B981") return "url(#glow-green)"
  if (color === "#F59E0B") return "url(#glow-orange)"
  return ""
}

// Helper function to calculate velocity badge
const getVelocityBadge = (topicName: string) => {
  const data = topicVelocityData
  const len = data.length

  // Get last 3 weeks of data for trend analysis
  const recent = Number(data[len - 1][topicName as keyof TopicData])
  const prev1 = Number(data[len - 2][topicName as keyof TopicData])
  const prev2 = Number(data[len - 3][topicName as keyof TopicData])

  // Calculate growth rates
  const recentGrowth = ((recent - prev1) / prev1) * 100
  const prevGrowth = ((prev1 - prev2) / prev2) * 100

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

export function TopicVelocityChart({ isLoading = false, selectedTimeRange = "3M" }: TopicVelocityChartProps) {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null)
  const [hiddenTopics, setHiddenTopics] = useState<string[]>([])
  const [isChartHovered, setIsChartHovered] = useState(false)
  const [mouseCoords, setMouseCoords] = useState<{ x: string | null; y: number | null }>({ x: null, y: null })
  const [showComparison, setShowComparison] = useState(false)
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0)
  const [animationsComplete, setAnimationsComplete] = useState(false)
  const [activeTimeRange, setActiveTimeRange] = useState("3M")
  
  // Calculate the trending topic (highest growth)
  const trendingTopic = topics.reduce((maxTopic, topic) => {
    const lastWeek = Number(topicVelocityData[topicVelocityData.length - 1][topic])
    const prevWeek = Number(topicVelocityData[topicVelocityData.length - 2][topic])
    const growth = ((lastWeek - prevWeek) / prevWeek) * 100
    
    const maxLastWeek = Number(topicVelocityData[topicVelocityData.length - 1][maxTopic])
    const maxPrevWeek = Number(topicVelocityData[topicVelocityData.length - 2][maxTopic])
    const maxGrowth = ((maxLastWeek - maxPrevWeek) / maxPrevWeek) * 100
    
    return growth > maxGrowth ? topic : maxTopic
  }, topics[0])

  // Cycle through insights every 10 seconds
  useEffect(() => {
    const insightTimer = setInterval(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % aiInsights.length)
    }, 10000)
    return () => clearInterval(insightTimer)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationsComplete(true)
    }, 2000) // Wait for animations to complete
    return () => clearTimeout(timer)
  }, [])

  const handleLegendClick = (data: any) => {
    const topicName = data.value
    setHiddenTopics((prev) =>
      prev.includes(topicName) ? prev.filter((topic) => topic !== topicName) : [...prev, topicName],
    )
  }

  const customLegendFormatter = (value: string) => {
    const isHidden = hiddenTopics.includes(value)
    const isHovered = hoveredLine === value
    const isTrending = value === trendingTopic

    // Calculate trend percentage
    const lastWeek = Number(topicVelocityData[11][value as keyof TopicData])
    const prevWeek = Number(topicVelocityData[10][value as keyof TopicData])
    const change = (((lastWeek - prevWeek) / prevWeek) * 100).toFixed(0)
    const arrow = Number(change) > 0 ? "↑" : "↓"
    const colorClass = Number(change) > 0 ? "text-green-400" : "text-red-400"

    return (
      <span
        style={{
          color: isHidden ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)",
          textDecoration: isHidden ? "line-through" : "none",
          fontWeight: isHovered || isTrending ? "bold" : "normal",
          cursor: "pointer",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: topicColors[value as keyof typeof topicColors],
            boxShadow: isTrending ? `0 0 8px ${topicColors[value as keyof typeof topicColors]}` : "none",
            transition: "box-shadow 0.3s ease",
          }}
        />
        {value}{" "}
        <span className={colorClass}>
          {arrow}
          {Math.abs(Number(change))}% w/w
        </span>
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl text-white font-semibold">Topic Velocity Tracker</h2>
          <p className="text-sm text-[#9CA3AF]">Mentions per week across tracked podcasts</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Range Buttons */}
          {["7D", "1M", "3M", "1Y"].map((range) => (
            <button
              key={range}
              onClick={() => setActiveTimeRange(range)}
              className={`
                px-3 py-1.5 text-[13px] font-medium rounded-md
                transition-all duration-200
                ${
                  activeTimeRange === range
                    ? "bg-[rgba(139,92,246,0.2)] border border-[#8B5CF6] text-white"
                    : "bg-transparent border border-[rgba(255,255,255,0.06)] text-[#9CA3AF] hover:text-white hover:border-[rgba(255,255,255,0.1)]"
                }
              `}
            >
              {range}
            </button>
          ))}
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
          <span className="text-gray-200">{aiInsights[currentInsightIndex]}</span>
        </p>
        <div className="flex gap-1 ml-4 flex-shrink-0">
          {aiInsights.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentInsightIndex ? "bg-[#7C3AED]" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      <div
        className={`
          bg-[#0A0A0B]/80 backdrop-blur-xl
          border border-white/[0.06]
          rounded-xl
          p-6
          shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_0_0_1px_rgba(255,255,255,0.02)]
          relative overflow-hidden
          transition-all duration-300
          ${isChartHovered ? "border-white/[0.08]" : ""}
        `}
        onMouseEnter={() => setIsChartHovered(true)}
        onMouseLeave={() => setIsChartHovered(false)}
        style={{
          height: "400px"
        }}
      >
        {/* Compare periods button - positioned in top-right corner */}
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`absolute top-4 right-4 text-3xl transition-all duration-200 hover:text-gray-200 active:scale-95 z-20 ${
            showComparison ? "text-[#3B82F6]" : "text-gray-400"
          }`}
          title="Compare to previous period"
        >
          ⟳
        </button>

        <div className="relative z-10 h-full">
          <div className="h-full w-full">
            {isLoading ? (
              <div className="h-full animate-pulse">
                <div className="h-full bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Analyzing podcast intelligence...</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={topicVelocityData}
                  margin={{
                    top: 20,
                    right: 40,
                    left: 20,
                    bottom: 60,
                  }}
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
                    <linearGradient id="aiAgentsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="capitalEfficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="depinGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="b2bSaasGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.05} />
                    </linearGradient>
                    {/* Glow filters for lines */}
                    <filter id="glow-purple">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="glow-blue">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="glow-green">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="glow-orange">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.03)"
                    opacity={1}
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    stroke="rgba(255, 255, 255, 0.06)"
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    tickLine={{ stroke: "rgba(255, 255, 255, 0.06)" }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.06)" }}
                    label={{
                      value: "Week of 2025",
                      position: "insideBottom",
                      offset: -5,
                      style: { textAnchor: "middle", fontSize: "12px", fill: "#6B7280" },
                    }}
                  />
                  <YAxis
                    stroke="rgba(255, 255, 255, 0.06)"
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    tickLine={{ stroke: "rgba(255, 255, 255, 0.06)" }}
                    axisLine={{ stroke: "rgba(255, 255, 255, 0.06)" }}
                    label={{
                      value: "Weekly Mentions",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fontSize: "12px", fill: "#6B7280" },
                    }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "rgba(255, 255, 255, 0.1)", strokeWidth: 1 }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    formatter={customLegendFormatter}
                    onClick={handleLegendClick}
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
                      style={{
                        transition: "opacity 200ms ease-in-out",
                        opacity: mouseCoords.x ? 1 : 0,
                      }}
                    />
                  )}
                  {mouseCoords.y && (
                    <ReferenceLine
                      y={mouseCoords.y}
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      style={{
                        transition: "opacity 200ms ease-in-out",
                        opacity: mouseCoords.y ? 1 : 0,
                      }}
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
                      style={{
                        transition: "opacity 200ms ease-in-out",
                        opacity: mouseCoords.x && mouseCoords.y ? 1 : 0,
                      }}
                    />
                  )}

                  {/* Gradient fills for all topics */}
                  <Area
                    type="monotone"
                    dataKey="AI Agents"
                    stroke="none"
                    fill="url(#aiAgentsGradient)"
                    fillOpacity={1}
                  />
                  <Area
                    type="monotone"
                    dataKey="Capital Efficiency"
                    stroke="none"
                    fill="url(#capitalEfficiencyGradient)"
                    fillOpacity={1}
                  />
                  <Area type="monotone" dataKey="DePIN" stroke="none" fill="url(#depinGradient)" fillOpacity={1} />
                  <Area type="monotone" dataKey="B2B SaaS" stroke="none" fill="url(#b2bSaasGradient)" fillOpacity={1} />

                  {/* Previous quarter comparison lines (faded) */}
                  {showComparison &&
                    topics.map((topic) => (
                      <Line
                        key={`${topic}-prev`}
                        type="monotone"
                        dataKey={topic}
                        data={previousQuarterData}
                        stroke={topicColors[topic]}
                        strokeWidth={3}
                        strokeOpacity={hoveredLine && hoveredLine !== topic ? 0.1 : 0.3}
                        strokeDasharray="5 5"
                        dot={false}
                        animateNewValues={false}
                        hide={hiddenTopics.includes(topic)}
                        name={`${topic} (Last Quarter)`}
                        style={{
                          transition: "stroke-opacity 200ms ease",
                        }}
                      />
                    ))}

                  {/* Current quarter lines */}
                  {topics.map((topic, index) => (
                    <Line
                      key={topic}
                      type="monotone"
                      dataKey={topic}
                      stroke={topicColors[topic]}
                      strokeWidth={hoveredLine === topic ? 4 : 3}
                      strokeOpacity={hoveredLine && hoveredLine !== topic ? 0.3 : 1}
                      dot={false}
                      activeDot={
                        hoveredLine === topic
                          ? { r: 6, fill: "#FFFFFF", stroke: topicColors[topic], strokeWidth: 2 }
                          : { r: 6, fill: topicColors[topic], stroke: "#FFFFFF", strokeWidth: 2 }
                      }
                      isAnimationActive={!animationsComplete}
                      animationDuration={1000}
                      animationBegin={index * 200}
                      animationEasing="ease-in-out"
                      animateNewValues={false}
                      onMouseEnter={() => setHoveredLine(topic)}
                      onMouseLeave={() => setHoveredLine(null)}
                      hide={hiddenTopics.includes(topic)}
                      style={{
                        transition: "stroke-width 200ms ease, stroke-opacity 200ms ease",
                        cursor: "pointer",
                        filter: topic === trendingTopic ? getGlowFilter(topic) : undefined,
                      }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Total Mentions</p>
            <p className="text-lg font-semibold">4,589</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Avg. Weekly Growth</p>
            <p className="text-lg font-semibold">+12.5%</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Most Active Week</p>
            <p className="text-lg font-semibold">Week 42</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Trending Topic</p>
            <p className="text-lg font-semibold">DePIN</p>
          </div>
        </div>
      </div>
    </div>
  )
}
