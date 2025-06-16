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
} from "recharts"
import { fetchTopicVelocity } from "@/lib/api"
import { DEFAULT_TOPICS, TOPIC_COLORS } from "@/lib/utils"

interface TopicVelocityChartProps {
  selectedTimeRange: "1M" | "3M" | "6M"
}

export function TopicVelocityChartWithAPI({ selectedTimeRange }: TopicVelocityChartProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hoveredLine, setHoveredLine] = useState<string | null>(null)
  const [hiddenTopics, setHiddenTopics] = useState<string[]>([])

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

  // Calculate latest trends
  const latestTrends = DEFAULT_TOPICS.map(topic => {
    if (data.length < 2) return { topic, change: 0, arrow: "→" }
    
    const latest = data[data.length - 1][topic] || 0
    const previous = data[data.length - 2][topic] || 0
    const change = previous === 0 ? 0 : ((latest - previous) / previous * 100)
    const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→"
    
    return { topic, change: Math.abs(change).toFixed(0), arrow, positive: change > 0 }
  })

  // Find top performer
  const topPerformer = latestTrends.reduce((max, curr) => 
    parseFloat(String(curr.change)) > parseFloat(String(max.change)) ? curr : max
  , latestTrends[0])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Topic Velocity Tracker</h2>
          <p className="text-gray-400">Mentions per week across tracked podcasts</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Top Performer Badge */}
          <div className="text-right">
            <p className="text-xs text-gray-400">Top Performer</p>
            <div className="flex items-baseline gap-1">
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-semibold" style={{ color: TOPIC_COLORS[topPerformer.topic as keyof typeof TOPIC_COLORS] }}>
                  {topPerformer.topic}
                </p>
                <p className="text-2xl font-bold" style={{ color: TOPIC_COLORS[topPerformer.topic as keyof typeof TOPIC_COLORS] }}>
                  {topPerformer.arrow}{topPerformer.change}%
                </p>
                <p className="text-sm font-medium text-white/60">({selectedTimeRange})</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/30 backdrop-blur-2xl border rounded-xl shadow-2xl shadow-purple-500/20 ring-1 ring-white/10 p-4 md:p-6 relative overflow-hidden group transition-all duration-300 border-white/10">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="week" 
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
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
              formatter={(value: string) => {
                const isHidden = hiddenTopics.includes(value)
                const trend = latestTrends.find(t => t.topic === value)
                
                return (
                  <span
                    style={{
                      color: isHidden ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)",
                      textDecoration: isHidden ? "line-through" : "none",
                      cursor: "pointer",
                    }}
                  >
                    {value} {trend && (
                      <span className={trend.positive ? "text-green-400" : "text-red-400"}>
                        {trend.arrow}{trend.change}%
                      </span>
                    )}
                  </span>
                )
              }}
            />
            {DEFAULT_TOPICS.map((topic) => (
              <Line
                key={topic}
                type="monotone"
                dataKey={topic}
                stroke={TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS]}
                strokeWidth={2}
                dot={false}
                hide={hiddenTopics.includes(topic)}
                onMouseEnter={() => setHoveredLine(topic)}
                onMouseLeave={() => setHoveredLine(null)}
                opacity={hoveredLine && hoveredLine !== topic ? 0.3 : 1}
                style={{ transition: "opacity 0.3s ease" }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}