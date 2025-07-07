"use client"

import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/header"
import { TopicVelocityChartFullV0 } from "@/components/dashboard/topic-velocity-chart-full-v0"
import { SentimentHeatmap } from "@/components/dashboard/sentiment-heatmap"
import { FloatingAIButton } from "@/components/dashboard/floating-ai-button"
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
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
            {/* What's Hot Card */}
            <div 
              className="group bg-[#1A1A1C] border border-white/[0.06] rounded-xl p-5 h-[100px] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all duration-200"
              onClick={() => console.log("View What's Hot")}
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(239,68,68,0.2)] group-hover:bg-red-500/25 group-hover:scale-110 transition-all duration-300">
                    🔥
                  </div>
                  <h3 className="text-white text-base font-semibold mt-3">What's Hot</h3>
                  <p className="text-[#9CA3AF] text-sm">12 new signals today</p>
                </div>
                <p className="text-[#A78BFA] text-sm hover:underline">View Latest →</p>
              </div>
            </div>

            {/* Deal Flow Card */}
            <div 
              className="group bg-[#1A1A1C] border border-white/[0.06] rounded-xl p-5 h-[100px] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all duration-200"
              onClick={() => console.log("Track Deal Flow")}
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(34,197,94,0.2)] group-hover:bg-green-500/25 group-hover:scale-110 transition-all duration-300">
                    💰
                  </div>
                  <h3 className="text-white text-base font-semibold mt-3">Deal Flow</h3>
                  <p className="text-[#9CA3AF] text-sm">Track investment signals</p>
                </div>
                <p className="text-[#A78BFA] text-sm hover:underline">Track Deals →</p>
              </div>
            </div>

            {/* Your Portfolio Card */}
            <div 
              className="group bg-[#1A1A1C] border border-white/[0.06] rounded-xl p-5 h-[100px] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all duration-200"
              onClick={() => console.log("View Portfolio Mentions")}
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(139,92,246,0.2)] group-hover:bg-purple-500/25 group-hover:scale-110 transition-all duration-300">
                    📊
                  </div>
                  <h3 className="text-white text-base font-semibold mt-3">Your Portfolio</h3>
                  <p className="text-[#9CA3AF] text-sm">3 mentions this week</p>
                </div>
                <p className="text-[#A78BFA] text-sm hover:underline">View Mentions →</p>
              </div>
            </div>

            {/* Quick Brief Card */}
            <div 
              className="group bg-[#1A1A1C] border border-white/[0.06] rounded-xl p-5 h-[100px] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all duration-200"
              onClick={() => console.log("Generate Quick Brief")}
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(251,191,36,0.2)] group-hover:bg-amber-500/25 group-hover:scale-110 transition-all duration-300">
                    ⚡
                  </div>
                  <h3 className="text-white text-base font-semibold mt-3">Quick Brief</h3>
                  <p className="text-[#9CA3AF] text-sm">5 min intelligence digest</p>
                </div>
                <p className="text-[#A78BFA] text-sm hover:underline">Generate →</p>
              </div>
            </div>
            </motion.div>
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