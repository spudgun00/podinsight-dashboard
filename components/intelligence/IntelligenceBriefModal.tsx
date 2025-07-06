"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Mail, MessageSquare, FileText, Clock, Mic, Sparkles, Quote, BarChart3 } from "lucide-react"
import type { DetailedEpisode } from "@/lib/mock-brief-data"

interface IntelligenceBriefModalProps {
  isOpen: boolean
  onClose: () => void
  episode: DetailedEpisode
}

const podcastBadges: Record<string, string> = {
  AI: "bg-red-500",
  "20": "bg-blue-500",
  LP: "bg-green-500",
  AC: "bg-yellow-500",
  IB: "bg-purple-500",
  MFM: "bg-pink-500",
}

const IntelligenceSection = ({
  title,
  icon,
  actionBadge,
  children,
}: {
  title: React.ReactNode
  icon: React.ReactNode
  actionBadge?: React.ReactNode
  children: React.ReactNode
}) => (
  <div
    className="rounded-2xl flex flex-col overflow-hidden h-full"
    style={{ 
      backgroundColor: "#1A1A1C",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)"
    }}
  >
    <div 
      className="p-4 flex items-center" 
      style={{ 
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        backgroundColor: "rgba(255, 255, 255, 0.02)" 
      }}
    >
      <div className="flex items-center gap-3 flex-1">
        {icon}
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      {actionBadge}
    </div>
    <div className="p-4 flex flex-col flex-grow">{children}</div>
  </div>
)

export function IntelligenceBriefModal({ isOpen, onClose, episode }: IntelligenceBriefModalProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      setIsMounted(false)
      window.removeEventListener("keydown", handleEsc)
    }
  }, [onClose])

  if (!isMounted || !isOpen) {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative text-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
            style={{ 
              backgroundColor: "#0A0A0B",
              border: "1px solid rgba(255, 255, 255, 0.06)"
            }}
          >
            {/* Header */}
            <header 
              className="p-5 flex items-center justify-between flex-shrink-0"
              style={{ 
                backgroundColor: "#1A1A1C",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                    podcastBadges[episode.abbreviation] || "bg-gray-500"
                  }`}
                >
                  {episode.abbreviation}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.01em", lineHeight: 1.3 }}>{episode.title}</h2>
                  <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
                    {episode.podcast} • {episode.timeAgo} • {episode.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-brand-red font-bold">
                  <span className="text-2xl">🔥</span>
                  <span className="text-2xl">{episode.score}</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/5 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} className="opacity-60 hover:opacity-100" />
                </button>
              </div>
            </header>

            {/* Main Content Grid */}
            <main className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <IntelligenceSection
                title={`Investable Signals (${episode.investableSignals.length})`}
                icon={<Sparkles size={20} className="text-gray-400" />}
              >
                <div className="flex-grow">
                  <ul className="space-y-1">
                    {episode.investableSignals.map((signal, i) => (
                      <li key={i} className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                        <button className="font-mono text-gray-500 mt-0.5 hover:text-white transition-colors flex items-center gap-1">
                          [{signal.timestamp}]
                          <Play size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <p style={{ color: "#FFFFFF", fontSize: "15px" }}>{signal.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </IntelligenceSection>

              <IntelligenceSection
                title={`Competitive Intel (${episode.competitiveIntel.length})`}
                icon={<Mic size={20} className="text-gray-400" />}
              >
                <div className="flex-grow">
                  <ul className="space-y-1">
                    {episode.competitiveIntel.map((signal, i) => (
                      <li key={i} className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                        <button className="font-mono text-gray-500 mt-0.5 hover:text-white transition-colors flex items-center gap-1">
                          [{signal.timestamp}]
                          <Play size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <p style={{ color: "#FFFFFF", fontSize: "15px" }}>{signal.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </IntelligenceSection>

              <IntelligenceSection
                title={`Your Portfolio Mentions (${episode.portfolioMentions.length})`}
                icon={<BarChart3 size={20} className="text-gray-400" />}
                actionBadge={
                  episode.portfolioMentions.some(m => m.actionRequired) && (
                    <span className="px-2 py-0.5 text-xs font-bold text-white bg-purple-500 rounded-full">
                      ACTION REQUIRED
                    </span>
                  )
                }
              >
                <ul className="space-y-1">
                  {episode.portfolioMentions.map((mention, i) => (
                    <li key={i} className="group p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <button className="font-mono text-gray-500 mt-0.5 hover:text-white transition-colors flex items-center gap-1">
                          [{mention.timestamp}]
                          <Play size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <div className="flex-1">
                          <p style={{ color: "#FFFFFF", fontSize: "15px" }}>{mention.company} mentioned as &ldquo;category leader&rdquo;</p>
                          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>Context: {mention.context}</p>
                          <p className="text-sm" style={{ color: "#6B7280" }}>Sentiment: {mention.sentiment}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </IntelligenceSection>

              <IntelligenceSection
                title={`LP-Ready Soundbites (${episode.soundbites.length})`}
                icon={<Quote size={20} className="text-gray-400" />}
              >
                <ul className="space-y-3">
                  {episode.soundbites.map((bite, i) => (
                    <li key={i} className="group">
                      <blockquote className="text-sm italic border-l-2 border-gray-600 pl-3" style={{ color: "#FFFFFF", fontSize: "15px" }}>
                        &ldquo;{bite.quote}&rdquo;
                      </blockquote>
                      <p className="text-xs text-gray-500 mt-2">
                        <span className="font-semibold">Use for:</span> {bite.useFor}
                      </p>
                    </li>
                  ))}
                </ul>
              </IntelligenceSection>
            </main>

            {/* Action Bar */}
            <footer 
              className="p-4 flex items-center justify-between flex-shrink-0"
              style={{ 
                backgroundColor: "#1A1A1C",
                borderTop: "1px solid rgba(255, 255, 255, 0.06)"
              }}
            >
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                  <Mail size={16} /> Email Brief
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <MessageSquare size={16} /> Share to Slack
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Play size={16} /> Play Episode
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <FileText size={16} /> Full Transcript
                </button>
              </div>
              <div className="flex items-center gap-2 text-green-400 font-semibold">
                <Clock size={16} />
                <span>Save {episode.duration}</span>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
