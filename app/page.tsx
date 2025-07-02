"use client"

import { motion } from "framer-motion"
import { TrendingUp, BarChart2, Zap, CheckCircle } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { TopicVelocityChartFullV0 } from "@/components/dashboard/topic-velocity-chart-full-v0"
import { SentimentHeatmap } from "@/components/dashboard/sentiment-heatmap"
import { SearchCommandBar } from "@/components/dashboard/search-command-bar-fixed"
import { useEffect, useState } from "react"
import { fetchSentimentAnalysis, type SentimentData } from "@/lib/api"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}


export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState(0)
  const [notablePerformer, setNotablePerformer] = useState<{
    topic: string
    change: string
    arrow: string
    positive: boolean
    data: any[]
    color: string
    yDomain?: [number, number]
  } | null>(null)
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([])
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(true)
  
  // Fetch sentiment data from API with default 3M range
  useEffect(() => {
    const fetchSentiment = async () => {
      setIsLoadingSentiment(true)
      try {
        const weeks = 12 // Default to 3M
        
        const response = await fetchSentimentAnalysis(weeks)
        if (response.success && response.data) {
          setSentimentData(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch sentiment data:", error)
      } finally {
        setIsLoadingSentiment(false)
      }
    }
    
    fetchSentiment()
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
          {/* Search Command Bar */}
          <SearchCommandBar 
            onSearch={(query) => {}}
            mode="inline"
          />

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6"
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
              sparklineYDomain={notablePerformer?.yDomain}
            />
            <MetricCard title="Episodes Analyzed" value={1171} icon={<BarChart2 size={24} />} animation="count-up" />
            <MetricCard title="Insights Generated" value="Real-time" icon={<Zap size={24} />} animation="pulse" />
            <MetricCard title="Data Freshness" value="Live" icon={<CheckCircle size={24} />} animation="pulse" />
          </motion.div>
          <TopicVelocityChartFullV0 
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
              isLoading={isLoadingSentiment}
              onCellClick={(topic, week) => {
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