"use client"

import { motion } from "framer-motion"
import { TrendingUp, BarChart2, Zap, CheckCircle, Download, ImageIcon, FileText, Link } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { TopicVelocityChartFullV0 } from "@/components/dashboard/topic-velocity-chart-full-v0"
import { SentimentHeatmap } from "@/components/dashboard/sentiment-heatmap"
import { useEffect, useState, useRef } from "react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Generate mock sentiment data function with deterministic values
const generateMockSentimentData = () => {
  const topics = ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"]
  const weeks = Array.from({length: 12}, (_, i) => `W${i + 1}`)
  
  // Use deterministic patterns based on week index
  const sentimentPatterns: Record<string, (weekIndex: number) => number> = {
    "AI Agents": (i) => 0.3 + (Math.sin(i * 0.5) * 0.2) + 0.2, // Generally positive with wave
    "Capital Efficiency": (i) => Math.cos(i * 0.3) * 0.3, // Oscillating around 0
    "DePIN": (i) => -0.2 + (i / 12) * 0.6, // Trending up from negative
    "B2B SaaS": (i) => 0.35 + Math.sin(i * 0.7) * 0.15, // Stable positive
    "Crypto/Web3": (i) => Math.sin(i * 0.8) * 0.7 // High volatility
  }
  
  return topics.flatMap(topic => 
    weeks.map((week, i) => ({
      topic,
      week,
      sentiment: Number(sentimentPatterns[topic](i).toFixed(2)),
      episodeCount: 10 + (i % 5) * 2 // Deterministic episode count
    }))
  )
}

export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState(0)
  const [selectedTimeRange, setSelectedTimeRange] = useState<"1M" | "3M" | "6M">("3M")
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const exportDropdownRef = useRef<HTMLDivElement>(null)
  const [notablePerformer, setNotablePerformer] = useState<{
    topic: string
    change: string
    arrow: string
    positive: boolean
    data: any[]
    color: string
  } | null>(null)
  const [sentimentData, setSentimentData] = useState<ReturnType<typeof generateMockSentimentData>>([])
  
  // Generate data only on client side to avoid hydration mismatch
  useEffect(() => {
    setSentimentData(generateMockSentimentData())
  }, [])

  // Handle export actions
  const handleExport = (type: "png" | "csv" | "link") => {
    setShowExportDropdown(false)
    switch (type) {
      case "png":
        // Simulate PNG export
        console.log("Exporting as PNG...")
        break
      case "csv":
        // Simulate CSV export
        console.log("Exporting as CSV...")
        break
      case "link":
        // Simulate copy link
        navigator.clipboard.writeText(window.location.href)
        console.log("Chart link copied to clipboard")
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

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen w-full">
      <DashboardHeader />
      <main className="px-4 md:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Controls positioned above metric cards */}
          <div className="flex justify-end items-center gap-2 mb-4">
            {/* Time Range Selector */}
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
                <div className="absolute top-full right-0 mt-2 w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-purple-500/20 ring-1 ring-white/5 z-50">
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

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <MetricCard 
              title="Trending Now" 
              value={notablePerformer?.topic || "Loading..."} 
              icon={<TrendingUp size={24} />} 
              sparklineData={notablePerformer?.data}
              sparklineColor={notablePerformer?.color}
            />
            <MetricCard title="Episodes Analyzed" value={1171} icon={<BarChart2 size={24} />} animation="count-up" />
            <MetricCard title="Insights Generated" value="Real-time" icon={<Zap size={24} />} animation="pulse" />
            <MetricCard title="Data Freshness" value="Live" icon={<CheckCircle size={24} />} animation="pulse" />
          </motion.div>
          <TopicVelocityChartFullV0 
            selectedTimeRange={selectedTimeRange} 
            onNotablePerformerChange={setNotablePerformer}
          />

          {/* Sentiment Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <SentimentHeatmap 
              data={sentimentData}
              onCellClick={(topic, week) => {
                console.log(`Clicked: ${topic} in ${week}`)
                // Future: Show episode details
              }}
            />
          </motion.div>

          <footer className="mt-8 text-center text-sm text-white/50">
            <p>Last updated: {lastUpdated} seconds ago. Tracking 5 topics across 29 podcasts.</p>
          </footer>
        </div>
      </main>
    </div>
  )
}