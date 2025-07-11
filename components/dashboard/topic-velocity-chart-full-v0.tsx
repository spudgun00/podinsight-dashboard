"use client"

import { useState, useEffect, useRef, useMemo } from "react"
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
import { fetchTopicVelocity, fetchTopicSignals } from "@/lib/api"
import { useDataMode } from "@/contexts/DataModeContext"
import { DEFAULT_TOPICS, TOPIC_COLORS } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Download, ImageIcon, FileText, Link, TrendingUp } from "lucide-react"
import { FloatingInsightCard } from "./floating-insight-card"
import { generateValueSignals } from "@/lib/generate-value-signals"
import { SectionHeader } from "@/components/dashboard/section-header"
import { Spinner } from "@/components/ui/spinner"

interface TopicVelocityChartProps {
  onNotablePerformerChange?: (performer: { topic: string; change: string; arrow: string; positive: boolean; data: any[]; color: string; yDomain?: [number, number] }) => void
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

export function TopicVelocityChartFullV0({ onNotablePerformerChange }: TopicVelocityChartProps) {
  const { isLiveData } = useDataMode();
  const [viewMode, setViewMode] = useState<"timeRange" | "quarters">("timeRange")
  const [selectedTimeRange, setSelectedTimeRange] = useState<"1M" | "3M" | "6M">("3M")
  const [selectedQuarter, setSelectedQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q2")
  const [isLoading, setIsLoading] = useState(true)
  const [allData, setAllData] = useState<{ [key: string]: any[] }>({})
  const [data, setData] = useState<any[]>([])
  const [displayData, setDisplayData] = useState<any[]>([])
  const [previousData, setPreviousData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hoveredLine, setHoveredLine] = useState<string | null>(null)
  const [hiddenTopics, setHiddenTopics] = useState<string[]>([])
  const [isChartHovered, setIsChartHovered] = useState(false)
  const [mouseCoords, setMouseCoords] = useState<{ x: string | null; y: number | null }>({ x: null, y: null })
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0)
  const [animationsComplete, setAnimationsComplete] = useState(false)
  const [insights, setInsights] = useState<string[]>([])
  const [valueSignals, setValueSignals] = useState<any[]>([])
  const [showInsightCard, setShowInsightCard] = useState(true)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const exportDropdownRef = useRef<HTMLDivElement>(null)
  const [statistics, setStatistics] = useState({
    totalMentions: 0,
    avgWeeklyGrowth: 0,
    mostActiveWeek: "",
    trendingTopic: "",
  })

  // Set initial quarter to Q2 (as requested)
  useEffect(() => {
    setSelectedQuarter("Q2")
  }, [])

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

  // Handle export actions
  const handleExport = (type: "png" | "csv" | "link") => {
    setShowExportDropdown(false)
    switch (type) {
      case "png":
        // TODO: Implement PNG export
        break
      case "csv":
        // TODO: Implement CSV export
        break
      case "link":
        navigator.clipboard.writeText(window.location.href)
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Helper function to get week of year
  const getWeekOfYear = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  // Helper function to get current quarter
  const getCurrentQuarter = (): "Q1" | "Q2" | "Q3" | "Q4" => {
    const month = new Date().getMonth()
    if (month < 3) return "Q1"
    if (month < 6) return "Q2"
    if (month < 9) return "Q3"
    return "Q4"
  }

  // Helper function to parse ISO week string to Date
  const parseISOWeekToDate = (weekString: string): Date | null => {
    const [yearStr, weekStr] = weekString.split('-W')
    if (!yearStr || !weekStr) {
      return null
    }
    
    const year = parseInt(yearStr, 10)
    const week = parseInt(weekStr, 10)
    
    // ISO 8601 weeks start on Monday. Week 1 is the week containing January 4th.
    
    // 1. Start with Jan 4th of the given year in UTC to avoid timezone issues
    const jan4 = new Date(Date.UTC(year, 0, 4))
    
    // 2. Find the Monday of the week containing Jan 4th
    // getUTCDay() is 0=Sun, 1=Mon...6=Sat
    // The expression (jan4.getUTCDay() + 6) % 7 calculates days to subtract
    const mondayOfWeek1 = new Date(jan4.getTime())
    mondayOfWeek1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7))
    
    // 3. Add the required number of weeks (minus 1) to get to the target week's Monday
    const targetDate = new Date(mondayOfWeek1.getTime())
    targetDate.setUTCDate(mondayOfWeek1.getUTCDate() + (week - 1) * 7)
    
    return targetDate
  }

  // Helper function to get quarter from date
  const getQuarterFromDate = (date: Date): { quarter: number; year: number } => {
    const month = date.getMonth()
    const quarter = Math.floor(month / 3) + 1
    return { quarter, year: date.getFullYear() }
  }

  // Helper function to find the latest year with data
  const findLatestYearWithData = (allWeekData: any[]): number => {
    
    const yearsWithData = new Set<number>()
    
    allWeekData.forEach(week => {
      // First check if we have a direct year field
      if (week.year) {
        yearsWithData.add(week.year)
        return
      }
      
      // Check for ISO week format in various fields
      const weekString = week.fullWeek || week.week || week.date || ''
      
      // Extract year from ISO week format (YYYY-Www)
      if (weekString && typeof weekString === 'string' && weekString.includes('-W')) {
        const yearMatch = weekString.match(/^(\d{4})-W\d{2}$/)
        if (yearMatch) {
          const year = parseInt(yearMatch[1], 10)
          yearsWithData.add(year)
        }
      } else if (weekString) {
        // Try to parse as regular date
        const date = new Date(weekString)
        if (!isNaN(date.getTime())) {
          yearsWithData.add(date.getFullYear())
        }
      }
    })
    
    // Return the most recent year with data
    const years = Array.from(yearsWithData).sort((a, b) => b - a)
    const latestYear = years[0] || new Date().getFullYear()
    return latestYear
  }

  // Helper function to filter data by quarter
  const filterDataByQuarter = (allWeekData: any[], quarter: "Q1" | "Q2" | "Q3" | "Q4", year?: number) => {
    const quarterNum = parseInt(quarter.substring(1))
    const targetYear = year || findLatestYearWithData(allWeekData)
    
    const filtered = allWeekData.filter((week, index) => {
      
      // Extract week string from various possible fields
      const weekString = week.fullWeek || week.week || week.date || ''
      
      // For ISO week format, extract year and week directly
      if (weekString && weekString.includes('-W')) {
        const match = weekString.match(/^(\d{4})-W(\d{2})$/)
        if (match) {
          // Convert ISO week to actual date to determine quarter
          const weekDate = parseISOWeekToDate(weekString)
          if (!weekDate) {
            return false
          }
          
          // Use Thursday of the week to determine quarter (ISO week pivot day)
          // This ensures weeks that span quarters are assigned correctly
          const thursday = new Date(weekDate)
          thursday.setDate(weekDate.getDate() + 3) // Monday + 3 = Thursday
          
          // Get the quarter based on Thursday's month
          const month = thursday.getMonth() // 0-11
          const weekQuarter = Math.floor(month / 3) + 1 // 1-4
          const weekYear = thursday.getFullYear()
          
          const matches = weekQuarter === quarterNum && weekYear === targetYear
          
          return matches
        }
      }
      
      // Fallback: try to parse as date
      const weekDate = new Date(weekString)
      if (!isNaN(weekDate.getTime())) {
        const { quarter: weekQuarter, year: weekYear } = getQuarterFromDate(weekDate)
        return weekQuarter === quarterNum && weekYear === targetYear
      }
      
      return false
    })
    
    // Sort the filtered data by week to ensure correct chronological order
    filtered.sort((a, b) => {
      const weekA = a.fullWeek || a.week || a.date || ''
      const weekB = b.fullWeek || b.week || b.date || ''
      return weekA.localeCompare(weekB, undefined, { numeric: true })
    })
    
    return filtered
  }

  // Helper function to get previous quarter
  const getPreviousQuarter = (quarter: "Q1" | "Q2" | "Q3" | "Q4", year: number): { quarter: "Q1" | "Q2" | "Q3" | "Q4"; year: number } => {
    const quarterNum = parseInt(quarter.substring(1))
    if (quarterNum === 1) {
      return { quarter: "Q4", year: year - 1 }
    }
    return { quarter: `Q${quarterNum - 1}` as "Q1" | "Q2" | "Q3" | "Q4", year }
  }

  // Helper function to merge current and previous quarter data into single dataset
  const mergeQuarterData = (currentData: any[], previousData: any[]): any[] => {
    // Sort data to ensure correct ordering
    const sortedCurrent = [...currentData].sort((a, b) => 
      (a.week || a.fullWeek).localeCompare(b.week || b.fullWeek)
    )
    const sortedPrevious = [...previousData].sort((a, b) => 
      (a.week || a.fullWeek).localeCompare(b.week || b.fullWeek)
    )
    
    // Determine the full week range for the current quarter
    const currentYear = findLatestYearWithData(allData.year || [])
    const quarterNum = parseInt(selectedQuarter.substring(1))
    
    // Find all weeks that belong to this quarter
    const expectedWeeks: string[] = []
    for (let week = 1; week <= 53; week++) {
      const weekString = `${currentYear}-W${week.toString().padStart(2, '0')}`
      
      // Check if this week belongs to the current quarter
      const weekDate = parseISOWeekToDate(weekString)
      if (!weekDate) continue
      
      // Use Thursday to determine quarter
      const thursday = new Date(weekDate)
      thursday.setDate(weekDate.getDate() + 3)
      
      const month = thursday.getMonth()
      const weekQuarter = Math.floor(month / 3) + 1
      
      if (weekQuarter === quarterNum) {
        expectedWeeks.push(weekString)
      }
    }
    
    // Determine how many weeks to show comparison data
    let lastDataWeekIndex = -1
    
    // Count how many weeks in the previous quarter had actual data
    let previousQuarterValidWeeks = 0
    for (let i = 0; i < sortedPrevious.length; i++) {
      if (sortedPrevious[i]) {
        const hasData = DEFAULT_TOPICS.some(topic => 
          sortedPrevious[i][topic] !== null && 
          sortedPrevious[i][topic] !== undefined && 
          sortedPrevious[i][topic] !== 0
        )
        if (hasData) previousQuarterValidWeeks++
      }
    }
    
    // The comparison should only extend as far as the previous quarter had data
    if (previousQuarterValidWeeks > 0) {
      // Map the previous quarter's data length to current quarter's weeks
      lastDataWeekIndex = Math.min(previousQuarterValidWeeks - 1, expectedWeeks.length - 1)
    } else {
      // If no valid data in previous quarter, use all weeks
      lastDataWeekIndex = expectedWeeks.length - 1
    }
    
    // Create merged data for all expected weeks
    return expectedWeeks.map((weekString, index) => {
      // Find actual data for this week
      const currentWeek = sortedCurrent.find(d => (d.week || d.fullWeek) === weekString)
      
      const mergedWeek: any = {
        week: weekString,
        fullWeek: weekString
      }
      
      // Add current quarter data if it exists
      if (currentWeek) {
        DEFAULT_TOPICS.forEach(topic => {
          mergedWeek[topic] = currentWeek[topic]
        })
      } else {
        // No data yet - set to null
        DEFAULT_TOPICS.forEach(topic => {
          mergedWeek[topic] = null
        })
      }
      
      // Add previous quarter data with _prev suffix only up to the last data week
      if (index <= lastDataWeekIndex) {
        // Calculate relative position for previous quarter mapping
        const relativePosition = lastDataWeekIndex > 0 
          ? index / lastDataWeekIndex 
          : 0
        
        // Find corresponding week in previous quarter based on relative position
        const prevIndex = sortedPrevious.length > 1
          ? Math.round(relativePosition * (sortedPrevious.length - 1))
          : 0
        
        const prevWeek = sortedPrevious[prevIndex]
        
        if (prevWeek) {
          DEFAULT_TOPICS.forEach(topic => {
            if (prevWeek[topic] !== undefined) {
              mergedWeek[`${topic}_prev`] = prevWeek[topic]
            }
          })
        }
      }
      
      return mergedWeek
    })
  }


  // Helper function to calculate statistics
  const calculateStats = (chartData: any[]) => {
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
      
    // Only show trending topic if there's actual data
    const trendingTopic = totalMentions > 0 
      ? Object.entries(topicTotals)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || ""
      : ""
      
    return {
      totalMentions,
      avgWeeklyGrowth,
      mostActiveWeek: maxWeek.week,
      trendingTopic,
    }
  }
  
  // Helper function to calculate trends
  const calculateTrends = (chartData: any[]) => {
    return DEFAULT_TOPICS.map(topic => {
      if (chartData.length < 2) return { topic, change: 0, arrow: "→", positive: false }
      
      const latest = chartData[chartData.length - 1][topic] || 0
      const previous = chartData[chartData.length - 2][topic] || 0
      const change = previous === 0 ? 0 : ((latest - previous) / previous * 100)
      const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→"
      
      return { topic, change: Math.abs(change).toFixed(0), arrow, positive: change > 0 }
    })
  }

  // Function to process API response
  const processApiResponse = (response: any) => {
    // Transform API response to chart format
    const chartData: any[] = []
    
    // Get all unique weeks from the data
    const weekSet = new Set<string>()
    Object.values(response.data).forEach((topicData: any) => {
      topicData.forEach((item: any) => weekSet.add(item.week))
    })
    
    // Sort weeks
    const sortedWeeks = Array.from(weekSet).sort()
    
    // Build chart data with all topics for each week
    sortedWeeks.forEach(week => {
      const weekData: any = { 
        week: week, // Keep full week string for now
        fullWeek: week
      }
      
      DEFAULT_TOPICS.forEach(topic => {
        const topicWeekData = response.data[topic]?.find((item: any) => item.week === week)
        weekData[topic] = topicWeekData?.mentions || 0
        // Store the date if available
        if (topicWeekData?.date && !weekData.date) {
          weekData.date = topicWeekData.date
        }
      })
      
      chartData.push(weekData)
    })
    
    // Find the last week with actual data (non-zero mentions for any topic)
    let lastDataIndex = -1
    for (let i = chartData.length - 1; i >= 0; i--) {
      const hasNonZeroData = DEFAULT_TOPICS.some(topic => chartData[i][topic] > 0)
      if (hasNonZeroData) {
        lastDataIndex = i
        break
      }
    }
    
    // Return data up to and including the last week with actual data
    // This removes trailing weeks that are all zeros (future weeks)
    return lastDataIndex >= 0 ? chartData.slice(0, lastDataIndex + 1) : []
  }

  // Preload all data on mount
  useEffect(() => {
    async function preloadAllData() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check if we're in demo mode
        if (!isLiveData) {
          // Use mock data for demo mode
          const { mockTopicVelocityData, mockPreviousQuarterData } = await import('@/mocks/topic-velocity-data');
          
          // Process mock data for different time ranges
          const processedData: { [key: string]: any[] } = {
            "1M": processApiResponse(mockTopicVelocityData).slice(-4), // Last 4 weeks
            "3M": processApiResponse(mockTopicVelocityData), // All 12 weeks
            "6M": processApiResponse(mockTopicVelocityData), // Same data for demo
            "year": processApiResponse(mockTopicVelocityData) // Same data for demo
          }
          
          setAllData(processedData)
          
          // Set initial data based on view mode
          if (viewMode === "quarters") {
            const currentYear = new Date().getFullYear()
            const currentQuarterData = filterDataByQuarter(processedData.year, selectedQuarter, currentYear)
            setData(currentQuarterData)
            setDisplayData(currentQuarterData)
          } else {
            setData(processedData[selectedTimeRange])
            setDisplayData(processedData[selectedTimeRange])
          }
          
          // Calculate initial statistics
          const stats = calculateStats(processedData[selectedTimeRange])
          setStatistics(stats)
          
          // Use mock previous quarter data
          setPreviousData(mockPreviousQuarterData)
          
          // Generate value signals
          const signals = generateValueSignals(processedData["3M"])
          setValueSignals(signals)
          
          // Generate demo insights
          const trends = calculateTrends(processedData["6M"])
          const stats6M = calculateStats(processedData["6M"])
          setInsights(generateInsights(processedData["6M"], trends, stats6M))
          
          setIsLoading(false)
          return; // Exit early for demo mode
        }
        
        // Fetch data for all time ranges and quarterly data in parallel (LIVE MODE)
        const [data1M, data3M, data6M, dataYear] = await Promise.all([
          fetchTopicVelocity(4, DEFAULT_TOPICS),
          fetchTopicVelocity(12, DEFAULT_TOPICS),
          fetchTopicVelocity(24, DEFAULT_TOPICS),
          fetchTopicVelocity(52, DEFAULT_TOPICS) // Full year for quarterly comparisons
        ])
        
        // Process and store all data
        const processedData: { [key: string]: any[] } = {
          "1M": processApiResponse(data1M),
          "3M": processApiResponse(data3M),
          "6M": processApiResponse(data6M),
          "year": processApiResponse(dataYear)
        }
        
        
        setAllData(processedData)
        
        // Set initial data based on view mode
        if (viewMode === "quarters") {
          const currentYear = new Date().getFullYear()
          const currentQuarterData = filterDataByQuarter(processedData.year, selectedQuarter, currentYear)
          setData(currentQuarterData)
          setDisplayData(currentQuarterData)
        } else {
          setData(processedData[selectedTimeRange])
          setDisplayData(processedData[selectedTimeRange])
        }
        
        // Calculate initial statistics
        const stats = calculateStats(processedData[selectedTimeRange])
        setStatistics(stats)
        
        // Generate initial previous quarter data
        const prevQuarterData = processedData[selectedTimeRange].map((week: any) => {
          const prevData: any = { week: week.week, fullWeek: week.fullWeek }
          DEFAULT_TOPICS.forEach(topic => {
            const currentValue = week[topic] || 0
            const variance = 0.7 + Math.random() * 0.6
            prevData[topic] = Math.round(currentValue * variance)
          })
          return prevData
        })
        setPreviousData(prevQuarterData)
        
        // Generate value signals
        const signals = generateValueSignals(processedData["3M"])
        setValueSignals(signals)
        
        // Fetch insights (keeping for backward compatibility)
        try {
          const signalsResponse = await fetchTopicSignals()
          if (signalsResponse.signal_messages && signalsResponse.signal_messages.length > 0) {
            setInsights(signalsResponse.signal_messages)
          } else {
            const trends = calculateTrends(processedData["6M"])
            const stats6M = calculateStats(processedData["6M"])
            setInsights(generateInsights(processedData["6M"], trends, stats6M))
          }
        } catch (err) {
          const trends = calculateTrends(processedData["6M"])
          const stats6M = calculateStats(processedData["6M"])
          setInsights(generateInsights(processedData["6M"], trends, stats6M))
        }
        
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
        setIsLoading(false)
      }
    }
    
    preloadAllData()
  }, [isLiveData]) // Re-run when demo mode changes

  
  // Calculate statistics based on displayed data
  useEffect(() => {
    const stats = calculateStats(displayData)
    setStatistics(stats)
  }, [displayData])

  // Update data when view mode, time range, or quarter changes
  useEffect(() => {
    if (!allData.year) {
      return // Wait for data to load
    }
    
    if (viewMode === "quarters") {
      // Handle quarterly view
      const latestYearWithData = findLatestYearWithData(allData.year)
      
      const currentQuarterData = filterDataByQuarter(allData.year, selectedQuarter, latestYearWithData)
      
      
      // Get previous quarter data for comparison (except Q1)
      if (selectedQuarter !== "Q1") {
        const { quarter: prevQuarter, year: prevYear } = getPreviousQuarter(selectedQuarter, latestYearWithData)
        const previousQuarterData = filterDataByQuarter(allData.year, prevQuarter, prevYear)
        
        // Merge current and previous quarter data into single dataset
        const mergedData = mergeQuarterData(currentQuarterData, previousQuarterData)
        setData(mergedData)
        setDisplayData(mergedData)
        setPreviousData([]) // No separate previous data needed
      } else {
        setData(currentQuarterData)
        setDisplayData(currentQuarterData)
        setPreviousData([])
      }
    } else {
      // Handle time range view
      if (allData[selectedTimeRange]) {
        setData(allData[selectedTimeRange])
        setDisplayData(allData[selectedTimeRange])
        setPreviousData([]) // No comparison in time range mode
        
        // Regenerate value signals when data changes
        const signals = generateValueSignals(allData[selectedTimeRange])
        setValueSignals(signals)
      }
    }
  }, [viewMode, selectedTimeRange, selectedQuarter, allData])

  const handleLegendClick = (data: any) => {
    const topicName = data.value
    setHiddenTopics((prev) =>
      prev.includes(topicName) ? prev.filter((topic) => topic !== topicName) : [...prev, topicName],
    )
  }

  // Calculate period-based trends (not just last week)
  const calculatePeriodTrends = () => {
    // Always return valid structure even with no data
    const defaultTrend = { 
      topic: DEFAULT_TOPICS[0], 
      change: "0", 
      arrow: "→", 
      positive: false, 
      absoluteChange: 0, 
      percentChange: 0 
    }
    
    if (!displayData || displayData.length < 2) {
      return DEFAULT_TOPICS.map(topic => ({ 
        ...defaultTrend, 
        topic 
      }))
    }
    
    // For quarterly view, only consider weeks with actual data (not null)
    let firstWeekIndex = 0
    let lastWeekIndex = displayData.length - 1
    
    if (viewMode === "quarters") {
      // Find first week with data
      for (let i = 0; i < displayData.length; i++) {
        const hasData = DEFAULT_TOPICS.some(topic => {
          const value = displayData[i][topic]
          return value !== null && value !== undefined && value !== 0
        })
        if (hasData) {
          firstWeekIndex = i
          break
        }
      }
      
      // Find last week with data
      for (let i = displayData.length - 1; i >= 0; i--) {
        const hasData = DEFAULT_TOPICS.some(topic => {
          const value = displayData[i][topic]
          return value !== null && value !== undefined && value !== 0
        })
        if (hasData) {
          lastWeekIndex = i
          break
        }
      }
    }
    
    const firstWeek = displayData[firstWeekIndex]
    const lastWeek = displayData[lastWeekIndex]
    
    // Ensure we have valid week data
    if (!firstWeek || !lastWeek || firstWeekIndex === lastWeekIndex) {
      return DEFAULT_TOPICS.map(topic => ({ 
        ...defaultTrend, 
        topic 
      }))
    }
    
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

  const periodTrends = useMemo(() => calculatePeriodTrends(), [displayData])
  
  // Find notable performer (biggest absolute change)
  const notablePerformer = useMemo(() => {
    if (!periodTrends || periodTrends.length === 0) {
      return {
        topic: DEFAULT_TOPICS[0],
        change: "0",
        arrow: "→",
        positive: false,
        absoluteChange: 0,
        percentChange: 0
      }
    }
    
    return periodTrends.reduce((notable, curr) => {
      const notableAbsolute = Math.abs(notable.percentChange || 0)
      const currAbsolute = Math.abs(curr.percentChange || 0)
      return currAbsolute > notableAbsolute ? curr : notable
    }, periodTrends[0])
  }, [periodTrends])

  // Extract sparkline data for notable performer
  useEffect(() => {
    // Add guards to prevent invalid updates
    if (
      onNotablePerformerChange && 
      notablePerformer && 
      notablePerformer.topic && 
      displayData.length > 2 && // Need at least 3 data points
      !isLoading && // Don't update during loading
      viewMode === "timeRange" // Only update in time range mode to prevent infinite loops
    ) {
      const sparklineData = displayData.map(week => ({
        value: week[notablePerformer.topic] || 0
      }))
      
      // Calculate global Y-axis domain from all topics in displayData
      let minValue = Infinity
      let maxValue = -Infinity
      
      displayData.forEach(week => {
        DEFAULT_TOPICS.forEach(topic => {
          const value = week[topic] || 0
          if (value < minValue) minValue = value
          if (value > maxValue) maxValue = value
        })
      })
      
      // Add some padding to the domain
      const padding = (maxValue - minValue) * 0.1
      const yDomain: [number, number] = [
        Math.max(0, minValue - padding), // Don't go below 0
        maxValue + padding
      ]
      
      // Only update if we have valid data
      if (sparklineData.some(d => d.value > 0)) {
        onNotablePerformerChange({
          topic: notablePerformer.topic,
          change: String(notablePerformer.change || 0),
          arrow: notablePerformer.arrow || "→",
          positive: notablePerformer.positive || false
        })
      }
    }
  }, [notablePerformer, displayData, onNotablePerformerChange, isLoading, viewMode])

  // Calculate week-over-week trends for legend
  const weeklyTrends = useMemo(() => {
    return DEFAULT_TOPICS.map(topic => {
      if (displayData.length < 2) return { topic, change: 0, arrow: "→", positive: false }
      
      const latest = displayData[displayData.length - 1][topic] || 0
      const previous = displayData[displayData.length - 2][topic] || 0
      const change = previous === 0 ? 0 : ((latest - previous) / previous * 100)
      const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→"
      
      return { topic, change: Math.abs(change).toFixed(0), arrow, positive: change > 0 }
    })
  }, [displayData])

  // Add velocity badge for notable performer
  const velocityBadge = useMemo(() => 
    getVelocityBadge(notablePerformer.topic, displayData), 
    [notablePerformer.topic, displayData]
  )

  const customLegendFormatter = (value: string) => {
    const isHidden = hiddenTopics.includes(value)
    const isHovered = hoveredLine === value
    
    // Use period trends for quarterly view, weekly trends otherwise
    const trendsToUse = viewMode === "quarters" ? periodTrends : weeklyTrends
    const trend = trendsToUse.find(t => t.topic === value)
    const trendLabel = viewMode === "quarters" ? `(${selectedQuarter})` : "w/w"

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
            {trend.arrow}{trend.change}% {trendLabel}
          </span>
        )}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-black/30 backdrop-blur-2xl border rounded-xl shadow-2xl shadow-purple-500/20 ring-1 ring-white/10 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center h-[450px]">
          <Spinner size="lg" label="Loading velocity data..." />
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
      
      <SectionHeader
        icon={<TrendingUp size={24} className="text-white" />}
        title="Topic Velocity Tracker"
        subtitle="Mentions per week across tracked podcasts"
        action={
          <div className="flex items-center gap-4">
            {/* Top Performer Badge */}
            <div className="text-right">
              <p className="text-xs text-gray-400">Notable Performer</p>
              <div className="flex items-baseline gap-1">
                <div className="flex items-baseline gap-1">
                  <p className="text-sm font-semibold" style={{ color: TOPIC_COLORS[notablePerformer.topic as keyof typeof TOPIC_COLORS] }}>
                    {notablePerformer.topic}
                  </p>
                  <p className={cn(
                    "text-sm font-bold",
                    notablePerformer.positive ? "text-green-400" : "text-red-400"
                  )}>
                    {notablePerformer.arrow}{notablePerformer.change}%
                  </p>
                  <p className="text-xs font-medium text-white/60">
                    ({viewMode === "quarters" ? selectedQuarter : selectedTimeRange})
                  </p>
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
        }
      />


      <div
        className="intel-card intel-card-clickable relative overflow-hidden"
        onMouseEnter={() => setIsChartHovered(true)}
        onMouseLeave={() => setIsChartHovered(false)}
      >
        {/* Control buttons - positioned in top-right corner */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          {/* Mode Toggle */}
          <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("timeRange")}
              className={`text-xs px-3 py-1 transition-all duration-200 active:scale-95 ${
                viewMode === "timeRange"
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-300"
              }`}
            >
              Time Range
            </button>
            <button
              onClick={() => setViewMode("quarters")}
              className={`text-xs px-3 py-1 transition-all duration-200 active:scale-95 ${
                viewMode === "quarters"
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-300"
              }`}
            >
              Quarters
            </button>
          </div>

          {/* Time Range Selector - Show when in time range mode */}
          {viewMode === "timeRange" && (
            <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
              {(["1M", "3M", "6M"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`text-xs px-2 py-1 transition-all duration-200 active:scale-95 ${
                    selectedTimeRange === range
                      ? "bg-gray-700 text-white"
                      : "bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}

          {/* Quarter Selector - Show when in quarters mode */}
          {viewMode === "quarters" && (
            <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
              {(["Q1", "Q2", "Q3", "Q4"] as const).map((quarter) => (
                <button
                  key={quarter}
                  onClick={() => setSelectedQuarter(quarter)}
                  className={`text-xs px-2 py-1 transition-all duration-200 active:scale-95 ${
                    selectedQuarter === quarter
                      ? "bg-gray-700 text-white"
                      : "bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  {quarter}
                </button>
              ))}
            </div>
          )}

          {/* Export Button */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="text-xs px-2 py-1 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg border border-gray-600 transition-all duration-200 backdrop-blur-sm flex items-center justify-center active:scale-95"
              title="Export chart"
            >
              <Download size={14} />
            </button>

            {/* Export Dropdown */}
            {showExportDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 intel-bg-card backdrop-blur-xl border intel-border-subtle rounded-lg shadow-2xl shadow-purple-500/20 ring-1 ring-white/5 z-50">
                <div className="p-2">
                  <button
                    onClick={() => handleExport("png")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-all duration-200"
                  >
                    <ImageIcon size={16} />
                    Export as PNG
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-all duration-200"
                  >
                    <FileText size={16} />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport("link")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-all duration-200"
                  >
                    <Link size={16} />
                    Copy Chart Link
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

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
            data={displayData}
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
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              angle={0}
              textAnchor={'middle'}
              interval={'preserveStartEnd'}
              height={30}
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


            {/* Previous quarter lines (when in quarter mode and not Q1) */}
            {viewMode === "quarters" && selectedQuarter !== "Q1" && DEFAULT_TOPICS.map((topic) => (
              <Line
                key={`${topic}-prev`}
                type="monotone"
                dataKey={`${topic}_prev`}
                stroke={TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS]}
                strokeWidth={1.5}
                strokeOpacity={0.35}
                dot={false}
                hide={hiddenTopics.includes(topic)}
                isAnimationActive={false}
                connectNulls={true}
                legendType="none"
              />
            ))}

            {/* Current period lines */}
            {DEFAULT_TOPICS.map((topic) => (
              <Line
                key={topic}
                type="monotone"
                dataKey={topic}
                stroke={TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS]}
                strokeWidth={hoveredLine === topic ? 4 : viewMode === "quarters" ? 3 : 2}
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
      
      {/* Floating Insight Card */}
      {showInsightCard && valueSignals.length > 0 && (
        <FloatingInsightCard
          signals={valueSignals}
          onViewAnalysis={(signal) => {
            // Handle view analysis action
            console.log("View analysis for:", signal)
            // You can add navigation or modal logic here
          }}
          onClose={() => setShowInsightCard(false)}
        />
      )}
    </div>
  )
}