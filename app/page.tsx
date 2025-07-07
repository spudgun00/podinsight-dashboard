"use client"

import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/header"
import { TopicVelocityChartFullV0 } from "@/components/dashboard/topic-velocity-chart-full-v0"
import { SentimentHeatmap } from "@/components/dashboard/sentiment-heatmap"
import { FloatingAIButton } from "@/components/dashboard/floating-ai-button"
import { EpisodeIntelligenceCards } from "@/components/intelligence/episode-intelligence-cards"
import { ActionableIntelligenceCards } from "@/components/dashboard/actionable-intelligence-cards"
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



export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState(0)
  const [notablePerformer, setNotablePerformer] = useState<{
    topic: string
    change: string
    arrow: string
    positive: boolean
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
            className="mt-3"
          >
            <EpisodeIntelligenceCards
              onViewAllEpisodesClick={handleViewAllEpisodesClick}
              onViewBriefClick={handleViewBriefClick}
            />
          </motion.div>

          {/* Actionable Intelligence Cards Section */}
          <section className="mt-12 mb-12">
            <ActionableIntelligenceCards />
          </section>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] my-12" />

          <TopicVelocityChartFullV0 
            onNotablePerformerChange={setNotablePerformer}
          />

          {/* Sentiment Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <SentimentHeatmap 
              data={sentimentData}
              isLoading={isLoadingSentiment}
              onCellClick={(topic, week) => {
                // Future: Show episode details
              }}
            />
          </motion.div>

        </div>
      </main>
      
      {/* Footer Bar */}
      <footer 
        className="relative w-full mt-12"
        style={{
          background: "rgba(0, 0, 0, 0.3)",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div className="py-3 text-center">
          <p style={{ fontSize: "12px", color: "#6B7280" }}>
            Analyzing 1,171 episodes • Updated every 30 mins • 99.8% uptime
          </p>
        </div>
      </footer>

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

      {/* Floating AI Assistant Button */}
      <FloatingAIButton />
    </div>
  )
}