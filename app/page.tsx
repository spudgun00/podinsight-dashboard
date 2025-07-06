"use client"

import { motion } from "framer-motion"
import { TrendingUp, BarChart2, Zap, CheckCircle } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { TopicVelocityChartFullV0 } from "@/components/dashboard/topic-velocity-chart-full-v0"
import { SentimentHeatmap } from "@/components/dashboard/sentiment-heatmap"
import { SearchCommandBar } from "@/components/dashboard/search-command-bar-fixed"
import { EpisodeIntelligenceCards } from "@/components/intelligence/episode-intelligence-cards"
import { IntelligenceBriefModal } from "@/components/intelligence/IntelligenceBriefModal"
import { AllEpisodesView } from "@/components/intelligence/AllEpisodesView"
import { useEffect, useState } from "react"
import { fetchSentimentAnalysis, type SentimentData } from "@/lib/api"
import type { Episode } from "@/lib/mock-episode-data"
import type { NewEpisode } from "@/lib/new-mock-episode-data"
import { getDetailedEpisode } from "@/lib/mock-brief-data"

// Helper function to convert NewEpisode to Episode format
const convertNewEpisodeToEpisode = (newEpisode: NewEpisode): Episode => {
  return {
    id: newEpisode.id,
    title: newEpisode.episodeTitle,
    abbreviation: newEpisode.abbreviation || 'AI',
    signal: newEpisode.signal || (
      newEpisode.signalType === 'INVESTABLE_SIGNAL' ? 'red_hot' :
      newEpisode.signalType === 'COMPETITIVE_INTEL' ? 'high_value' :
      'portfolio_mention'
    ),
    score: newEpisode.score,
    timeAgo: newEpisode.timeAgo || newEpisode.durationAgo,
    duration: newEpisode.duration || '45m',
    intel: newEpisode.intel,
    podcast: newEpisode.podcast || newEpisode.podcastName,
    publishedAt: newEpisode.publishedAt || new Date()
  }
}

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
  
  // Episode Intelligence state
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | NewEpisode | null>(null)
  const [showAllEpisodes, setShowAllEpisodes] = useState(false)
  const [showBriefModal, setShowBriefModal] = useState(false)
  
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

  // Episode Intelligence handlers
  const handleViewBriefClick = (episode: Episode | NewEpisode) => {
    setSelectedEpisode(episode)
    setShowBriefModal(true)
  }

  const handleViewAllEpisodesClick = () => {
    setShowAllEpisodes(true)
  }

  return (
    <div className="min-h-screen w-full intel-bg-primary">
      <DashboardHeader />
      <main className="px-4 md:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Episode Intelligence Section - NOW FIRST */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="mt-6"
          >
            <EpisodeIntelligenceCards
              onViewAllEpisodesClick={handleViewAllEpisodesClick}
              onViewBriefClick={handleViewBriefClick}
            />
          </motion.div>

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
              change={notablePerformer?.change}
              changeType={notablePerformer?.positive ? "positive" : "negative"}
            />
            <MetricCard 
              title="Episodes Analyzed" 
              value={1171} 
              icon={<BarChart2 size={24} />} 
              animation="count-up" 
              change="+127 this week"
              changeType="positive"
            />
            <MetricCard 
              title="Insights Generated" 
              value="Real-time" 
              icon={<Zap size={24} />} 
              animation="pulse" 
              change="99.8% uptime"
              changeType="positive"
            />
            <MetricCard 
              title="Data Freshness" 
              value="Live" 
              icon={<CheckCircle size={24} />} 
              animation="pulse" 
              change="< 5 min delay"
              changeType="positive"
            />
          </motion.div>
          <TopicVelocityChartFullV0 
            onNotablePerformerChange={setNotablePerformer}
          />

          {/* Sentiment Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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

          <footer className="mt-8 text-center text-sm intel-text-secondary">
            <p>Last updated: {lastUpdated} seconds ago. Tracking 5 topics across 29 podcasts.</p>
          </footer>
        </div>
      </main>

      {/* Episode Intelligence Modals */}
      {selectedEpisode && (
        <IntelligenceBriefModal
          isOpen={showBriefModal}
          onClose={() => {
            setShowBriefModal(false)
            setSelectedEpisode(null)
          }}
          episode={getDetailedEpisode(
            'intel' in selectedEpisode 
              ? convertNewEpisodeToEpisode(selectedEpisode as NewEpisode)
              : selectedEpisode as Episode
          )}
        />
      )}

      <AllEpisodesView
        open={showAllEpisodes}
        onOpenChange={setShowAllEpisodes}
        onViewBriefClick={(episode) => {
          setSelectedEpisode(episode)
          setShowBriefModal(true)
          setShowAllEpisodes(false)
        }}
      />
    </div>
  )
}