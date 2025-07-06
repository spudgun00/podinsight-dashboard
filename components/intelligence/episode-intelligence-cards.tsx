"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Headphones, MoreHorizontal, Mail, Link, Clock, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { newMockEpisodes, type NewEpisode } from "@/lib/new-mock-episode-data"

const signalMeta = {
  INVESTABLE_SIGNAL: {
    borderColor: "border-brand-green",
    accentColor: "#34D399",
    backgroundColor: "rgba(52, 211, 153, 0.1)",
    icon: "💰",
    label: "INVESTABLE SIGNAL",
    textColor: "text-brand-green",
  },
  COMPETITIVE_INTEL: {
    borderColor: "border-brand-red",
    accentColor: "#F87171",
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    icon: "⚔️",
    label: "COMPETITIVE INTEL",
    textColor: "text-brand-red",
  },
  PORTFOLIO_MENTION: {
    borderColor: "border-brand-purple",
    accentColor: "#A78BFA",
    backgroundColor: "rgba(167, 139, 250, 0.1)",
    icon: "📊",
    label: "PORTFOLIO MENTION",
    textColor: "text-brand-purple",
  },
}

const NewEpisodeCard = ({
  episode,
  onViewBriefClick,
}: {
  episode: NewEpisode
  onViewBriefClick: (episode: NewEpisode) => void
}) => {
  const meta = signalMeta[episode.signalType]
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <motion.div
      whileHover={{ 
        y: -5, 
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.6)" 
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="rounded-2xl p-4 md:p-6 flex flex-col gap-4 relative overflow-hidden"
      style={{ 
        backgroundColor: "#1A1A1C",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)"
      }}
    >
      {/* Left accent border */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: meta.accentColor }}
      />
      <div className="flex justify-between items-start">
        <p className="text-xs font-medium" style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: 500 }}>
          {episode.podcastName.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ')}
        </p>
        <div className="flex items-center gap-3">
          {/* Score badge */}
          <div className="group">
            <div className="flex items-center gap-1 text-brand-red font-bold text-sm group-hover:animate-pulse-subtle">
              <span>🔥</span>
              <span>{episode.score}</span>
            </div>
          </div>
          {/* Audio button - mobile only in header */}
          <motion.button
            onClick={() => {
              setIsPlayingAudio(!isPlayingAudio)
              if (!isPlayingAudio) {
                setTimeout(() => setIsPlayingAudio(false), 2000)
              }
            }}
            whileTap={{ scale: 0.95 }}
            animate={isPlayingAudio ? { scale: [1, 1.1, 1] } : {}}
            transition={isPlayingAudio ? { repeat: Infinity, duration: 1 } : {}}
            className="flex md:hidden w-8 h-8 rounded-full items-center justify-center bg-white/5"
          >
            <Headphones size={18} className="opacity-60" />
          </motion.button>
          {/* Three-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center transition-opacity duration-200"
            >
              <MoreHorizontal size={20} className="opacity-60 md:opacity-40 hover:opacity-80 transition-opacity" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-9 bg-[#1A1A1C] border border-white/10 rounded-lg shadow-xl z-50 min-w-[180px]">
                <button className="w-full px-4 py-2.5 text-sm text-left text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3">
                  <Mail size={16} />
                  Share via Email
                </button>
                <button className="w-full px-4 py-2.5 text-sm text-left text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3">
                  <Link size={16} />
                  Copy Link
                </button>
                <button className="w-full px-4 py-2.5 text-sm text-left text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3">
                  <Clock size={16} />
                  Save for Later
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 
        className="text-xl font-semibold text-white"
        style={{ letterSpacing: "-0.01em", lineHeight: 1.3 }}
      >
        {episode.episodeTitle}
      </h3>

      <div className="flex items-center gap-2">
        <span className="text-lg">{meta.icon}</span>
        <span 
          className={`text-sm font-bold ${meta.textColor}`}
          style={{
            backgroundColor: meta.backgroundColor,
            padding: "4px 12px",
            borderRadius: "6px"
          }}
        >
          {meta.label}
        </span>
      </div>

      <ul className="space-y-3">
        {episode.intel.map((point, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span className="mt-1" style={{ color: "#94A3B8" }}>•</span>
            <span style={{ color: "#94A3B8" }}>{point}</span>
          </li>
        ))}
      </ul>

      <div className="text-xs text-intel-gray/80 flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
        <span>📍 {episode.timestamp}</span>
        <span>⏱️ {episode.durationAgo}</span>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-4">
        <button
          onClick={() => onViewBriefClick(episode)}
          className="w-full md:flex-1 text-center text-white font-semibold py-3 rounded-lg bg-gradient-to-r from-brand-purple to-brand-pink hover:brightness-110 transition-all duration-300"
          style={{
            fontSize: "15px",
            fontWeight: 600,
            paddingTop: "12px",
            paddingBottom: "12px",
            boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)"
          }}
        >
          View Intel Brief →
        </button>
        <motion.button
          onClick={() => {
            setIsPlayingAudio(!isPlayingAudio)
            if (!isPlayingAudio) {
              setTimeout(() => setIsPlayingAudio(false), 2000)
            }
          }}
          whileTap={{ scale: 0.95 }}
          animate={isPlayingAudio ? { scale: [1, 1.1, 1] } : {}}
          transition={isPlayingAudio ? { repeat: Infinity, duration: 1 } : {}}
          className="hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-200 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          style={{ backgroundColor: "#1A1A1C" }}
        >
          <Headphones 
            size={20} 
            className="opacity-60 hover:opacity-100 transition-all duration-200"
          />
        </motion.button>
      </div>
    </motion.div>
  )
}

export function EpisodeIntelligenceCards({
  onViewAllEpisodesClick,
  onViewBriefClick,
}: {
  onViewAllEpisodesClick: () => void
  onViewBriefClick: (episode: NewEpisode) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const visibleEpisodes = isExpanded ? newMockEpisodes : newMockEpisodes.slice(0, 3)
  const hiddenEpisodesCount = newMockEpisodes.length - 3

  return (
    <section className="py-8 md:py-12">
      {/* Curved gradient line */}
      <div className="w-full mb-8">
        <svg 
          width="100%" 
          height="4" 
          viewBox="0 0 1200 4" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <path 
            d="M 0 2 Q 300 0 600 2 T 1200 2" 
            stroke="url(#waveGradient)" 
            strokeWidth="3" 
            fill="none"
          />
        </svg>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center">
            {/* Abstract shape or icon */}
            <div className="w-6 h-6 bg-white/20 rounded-md transform rotate-45" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Episode Intelligence</h2>
            <p className="text-intel-gray">Personalized signals from today's top episodes</p>
          </div>
        </div>
        <button
          onClick={onViewAllEpisodesClick}
          className="px-4 py-2 text-sm font-semibold text-white bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          View All Episodes
        </button>
      </div>

      <div className="space-y-4">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          layout
        >
          <AnimatePresence mode="popLayout">
            {visibleEpisodes.map((episode, index) => (
              <motion.div
                key={episode.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index >= 3 ? (index - 3) * 0.1 : 0 
                }}
              >
                <NewEpisodeCard episode={episode} onViewBriefClick={onViewBriefClick} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {hiddenEpisodesCount > 0 && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-4 px-6 text-[#8B5CF6] bg-transparent border border-[#8B5CF6] rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
            style={{
              backgroundColor: isExpanded ? "transparent" : "transparent"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.05)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span>
              {isExpanded 
                ? "Show less" 
                : `${hiddenEpisodesCount} episodes scored 70-85`}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </motion.button>
        )}
      </div>
    </section>
  )
}
