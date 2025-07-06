"use client"

import { useEffect, useState } from "react"
import { TopicVelocityChart } from "./topic-velocity-chart"
import { fetchTopicVelocity } from "@/lib/api"
import { DEFAULT_TOPICS } from "@/lib/utils"
import type { TopicData } from "@/lib/types"

interface TopicVelocityChartWrapperProps {
  selectedTimeRange: "1M" | "3M" | "6M"
}

export function TopicVelocityChartWrapper({ selectedTimeRange }: TopicVelocityChartWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<TopicData[]>([])
  const [error, setError] = useState<string | null>(null)

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
        const chartData: TopicData[] = []
        
        // Get all unique weeks from the data
        const weekSet = new Set<string>()
        Object.values(response.data).forEach(topicData => {
          topicData.forEach(item => weekSet.add(item.week))
        })
        
        // Sort weeks
        const sortedWeeks = Array.from(weekSet).sort()
        
        // Build chart data with all topics for each week
        sortedWeeks.forEach(week => {
          const weekData: any = { week: week.replace("2025-", "") } // Simplify week display
          
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-red-500">
        <p>Error loading data: {error}</p>
      </div>
    )
  }

  // Pass the data to the v0 chart component
  return <TopicVelocityChart isLoading={isLoading} selectedTimeRange={selectedTimeRange} />
}