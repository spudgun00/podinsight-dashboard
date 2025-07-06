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
  borderColor,
  headerBgColor,
  actionBadge,
  children,
}: {
  title: React.ReactNode
  icon: React.ReactNode
  borderColor: string
  headerBgColor: string
  actionBadge?: React.ReactNode
  children: React.ReactNode
}) => (
  <div
    className="rounded-2xl flex flex-col overflow-hidden h-full relative"
    style={{ 
      backgroundColor: "#1A1A1C",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)"
    }}
  >
    <div 
      className="absolute left-0 top-0 bottom-0 w-1"
      style={{ backgroundColor: borderColor }}
    />
    <div 
      className="p-4 flex items-center relative" 
      style={{ 
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        backgroundColor: headerBgColor 
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
                icon={<Sparkles size={20} className="text-green-400" />}
                borderColor="#34D399"
                headerBgColor="rgba(52, 211, 153, 0.1)"
              >
                <div className="flex-grow">
                  <ul className="space-y-3">
                    {episode.investableSignals.map((signal, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="font-mono text-green-400/80 mt-0.5">[{signal.timestamp}]</span>
                        <p style={{ color: "#94A3B8" }}>{signal.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="mt-4 w-full text-sm font-semibold py-2 px-4 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2">
                  <Play size={16} /> Play Clips
                </button>
              </IntelligenceSection>

              <IntelligenceSection
                title={`Competitive Intel (${episode.competitiveIntel.length})`}
                icon={<Mic size={20} className="text-red-400" />}
                borderColor="#F87171"
                headerBgColor="rgba(248, 113, 113, 0.1)"
              >
                <div className="flex-grow">
                  <ul className="space-y-3">
                    {episode.competitiveIntel.map((signal, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="font-mono text-red-400/80 mt-0.5">[{signal.timestamp}]</span>
                        <p style={{ color: "#94A3B8" }}>{signal.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="mt-4 w-full text-sm font-semibold py-2 px-4 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                  <Play size={16} /> Play Clips
                </button>
              </IntelligenceSection>

              <IntelligenceSection
                title={`Your Portfolio Mentions (${episode.portfolioMentions.length})`}
                icon={<BarChart3 size={20} className="text-purple-400" />}
                borderColor="#A78BFA"
                headerBgColor="rgba(167, 139, 250, 0.1)"
                actionBadge={
                  episode.portfolioMentions.some(m => m.actionRequired) && (
                    <span className="px-2 py-0.5 text-xs font-bold text-black bg-blue-400 rounded-full">
                      ACTION REQUIRED
                    </span>
                  )
                }
              >
                <ul className="space-y-3">
                  {episode.portfolioMentions.map((mention, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="font-mono text-purple-400/80 mt-0.5">[{mention.timestamp}]</span>
                      <div className="flex-1">
                        <p style={{ color: "#94A3B8" }}>{mention.company} mentioned as "category leader"</p>
                        <p className="mt-1" style={{ color: "#6B7280" }}>Context: {mention.context}</p>
                        <p style={{ color: "#6B7280" }}>Sentiment: {mention.sentiment}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </IntelligenceSection>

              <IntelligenceSection
                title={`LP-Ready Soundbites (${episode.soundbites.length})`}
                icon={<Quote size={20} className="text-purple-500" />}
                borderColor="#9966ff"
                headerBgColor="rgba(153, 102, 255, 0.15)"
              >
                <ul className="space-y-4">
                  {episode.soundbites.map((bite, i) => (
                    <li key={i}>
                      <blockquote className="text-sm italic border-l-2 border-purple-500 pl-3" style={{ color: "#94A3B8" }}>
                        &ldquo;{bite.quote}&rdquo;
                      </blockquote>
                      <p className="text-xs text-purple-400/80 mt-2">
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
