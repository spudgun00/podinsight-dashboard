"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { 
  X, Play, Mail, MessageSquare, FileText, Clock, Mic, Sparkles, 
  Quote, BarChart3, Pause, SkipForward, Volume2, Loader2 
} from "lucide-react"
import type { DetailedEpisode } from "@/lib/mock-brief-data"

interface IntelligenceBriefModalProps {
  isOpen: boolean
  onClose: () => void
  episode: DetailedEpisode
}

interface AudioState {
  sectionId: string
  currentTimestamp: string | null
  isPlaying: boolean
  isLoading: boolean
  progress: number
  duration: number
  autoAdvance: boolean
  audioUrl: string | null
}

interface TimestampButtonProps {
  timestamp: string
  isActive: boolean
  isLoading: boolean
  onClick: () => void
  children: React.ReactNode
}

const podcastBadges: Record<string, string> = {
  AI: "bg-red-500",
  "20": "bg-blue-500",
  LP: "bg-green-500",
  AC: "bg-yellow-500",
  IB: "bg-purple-500",
  MFM: "bg-pink-500",
}

const TimestampButton = ({ timestamp, isActive, isLoading, onClick }: TimestampButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        font-mono transition-all duration-200 relative group
        ${isActive ? 'text-white bg-white/10' : 'text-green-400/80 hover:text-green-400'}
        ${isMobile ? 'text-base px-3 py-2' : 'text-sm px-2 py-0.5'}
        rounded inline-flex items-center gap-1
      `}
    >
      <span className={isActive ? 'animate-pulse' : ''}>[{timestamp}]</span>
      {isLoading && <Loader2 size={isMobile ? 14 : 12} className="animate-spin" />}
      {!isLoading && (isHovered || isActive || isMobile) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          {isActive ? <Volume2 size={isMobile ? 14 : 12} /> : <Play size={isMobile ? 14 : 12} />}
        </motion.div>
      )}
    </button>
  )
}

interface MiniAudioPlayerProps {
  audioState: AudioState
  onPlayPause: () => void
  onProgressChange: (progress: number) => void
  onAutoAdvanceToggle: () => void
  onSkipNext: () => void
  onClose: () => void
}

const MiniAudioPlayer = ({ 
  audioState, 
  onPlayPause, 
  onProgressChange, 
  onAutoAdvanceToggle,
  onSkipNext,
  onClose 
}: MiniAudioPlayerProps) => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    onProgressChange(Math.max(0, Math.min(100, percentage)))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = (audioState.progress / 100) * audioState.duration
  const remainingTime = audioState.duration - currentTime

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 p-3"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onPlayPause}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {audioState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span className="text-green-400">[{audioState.currentTimestamp}]</span>
            <span>-{formatTime(remainingTime)}</span>
          </div>
          <div 
            ref={progressBarRef}
            className="relative h-1 bg-white/20 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
          >
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
              style={{ width: `${audioState.progress}%` }}
              layoutId={`progress-${audioState.sectionId}`}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${audioState.progress}%`, marginLeft: '-6px' }}
            />
          </div>
        </div>

        <button
          onClick={onAutoAdvanceToggle}
          className={`p-2 rounded-full transition-colors ${
            audioState.autoAdvance 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-white/10 text-gray-400 hover:text-white'
          }`}
          title="Auto-advance"
        >
          <SkipForward size={16} />
        </button>

        <button
          onClick={onSkipNext}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="Next clip"
        >
          <SkipForward size={16} />
        </button>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  )
}

const IntelligenceSection = ({
  title,
  icon,
  borderColor,
  headerBgColor,
  actionBadge,
  sectionId,
  children,
  onTimestampClick,
  audioState,
  onAudioControl,
}: {
  title: React.ReactNode
  icon: React.ReactNode
  borderColor: string
  headerBgColor: string
  actionBadge?: React.ReactNode
  sectionId: string
  children: React.ReactNode
  onTimestampClick: (sectionId: string, timestamp: string) => void
  audioState?: AudioState
  onAudioControl: {
    onPlayPause: () => void
    onProgressChange: (progress: number) => void
    onAutoAdvanceToggle: () => void
    onSkipNext: () => void
    onClose: () => void
  }
}) => {
  const isAudioActive = audioState?.sectionId === sectionId && audioState.currentTimestamp

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden h-full relative"
      style={{ 
        backgroundColor: "#1A1A1C",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
        paddingBottom: isAudioActive ? '60px' : '0'
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
      <div className="p-4 flex flex-col flex-grow">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.props.onTimestampClick) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onTimestampClick: (timestamp: string) => onTimestampClick(sectionId, timestamp),
              activeTimestamp: audioState?.sectionId === sectionId ? audioState.currentTimestamp : null,
              isLoading: audioState?.sectionId === sectionId && audioState?.isLoading,
            })
          }
          return child
        })}
      </div>
      
      <AnimatePresence>
        {isAudioActive && audioState && (
          <MiniAudioPlayer
            audioState={audioState}
            {...onAudioControl}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface SignalListProps {
  signals: Array<{ timestamp: string; text: string }>
  signalColor: string
  onTimestampClick?: (timestamp: string) => void
  activeTimestamp?: string | null
  isLoading?: boolean
}

const SignalList = ({ signals, signalColor, onTimestampClick, activeTimestamp, isLoading }: SignalListProps) => (
  <div className="flex-grow">
    <ul className="space-y-3">
      {signals.map((signal, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          {onTimestampClick ? (
            <TimestampButton
              timestamp={signal.timestamp}
              isActive={activeTimestamp === signal.timestamp}
              isLoading={!!isLoading && activeTimestamp === signal.timestamp}
              onClick={() => onTimestampClick(signal.timestamp)}
            >
              {signal.timestamp}
            </TimestampButton>
          ) : (
            <span className={`font-mono ${signalColor}/80 mt-0.5`}>[{signal.timestamp}]</span>
          )}
          <div className="flex-1">
            <p style={{ color: "#94A3B8" }}>{signal.text}</p>
            {activeTimestamp === signal.timestamp && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="h-0.5 bg-gradient-to-r from-green-400 to-green-500 mt-2 origin-left"
                style={{ width: '100%' }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
)

export function IntelligenceBriefModal({ isOpen, onClose, episode }: IntelligenceBriefModalProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [audioStates, setAudioStates] = useState<Record<string, AudioState>>({})
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const [isSaved, setIsSaved] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  
  // Pull-to-close gesture
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 300], [1, 0])

  useEffect(() => {
    setIsMounted(true)
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      setIsMounted(false)
      window.removeEventListener("keydown", handleEsc)
      window.removeEventListener('resize', checkMobile)
      // Cleanup audio elements
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause()
        audio.src = ''
      })
    }
  }, [onClose])

  const handleTimestampClick = useCallback(async (sectionId: string, timestamp: string) => {
    // If clicking the same timestamp, toggle play/pause
    const currentState = audioStates[sectionId]
    if (currentState?.currentTimestamp === timestamp && currentState.audioUrl) {
      const audio = audioRefs.current[sectionId]
      if (audio) {
        if (currentState.isPlaying) {
          audio.pause()
        } else {
          audio.play()
        }
      }
      return
    }

    // Stop other sections' audio
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (id !== sectionId) {
        audio.pause()
      }
    })

    // Set loading state
    setAudioStates(prev => ({
      ...prev,
      [sectionId]: {
        sectionId,
        currentTimestamp: timestamp,
        isPlaying: false,
        isLoading: true,
        progress: 0,
        duration: 30,
        autoAdvance: prev[sectionId]?.autoAdvance || false,
        audioUrl: null
      }
    }))

    // Simulate audio URL fetch (replace with actual API call)
    setTimeout(() => {
      const mockAudioUrl = `/api/audio/clip/${timestamp}`
      
      // Create or update audio element
      if (!audioRefs.current[sectionId]) {
        audioRefs.current[sectionId] = new Audio()
      }
      
      const audio = audioRefs.current[sectionId]
      audio.src = mockAudioUrl
      
      // Set up event listeners
      audio.onloadedmetadata = () => {
        setAudioStates(prev => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            isLoading: false,
            duration: audio.duration
          }
        }))
      }
      
      audio.onplay = () => {
        setAudioStates(prev => ({
          ...prev,
          [sectionId]: { ...prev[sectionId], isPlaying: true }
        }))
      }
      
      audio.onpause = () => {
        setAudioStates(prev => ({
          ...prev,
          [sectionId]: { ...prev[sectionId], isPlaying: false }
        }))
      }
      
      audio.ontimeupdate = () => {
        const progress = (audio.currentTime / audio.duration) * 100
        setAudioStates(prev => ({
          ...prev,
          [sectionId]: { ...prev[sectionId], progress }
        }))
      }
      
      audio.onended = () => {
        const state = audioStates[sectionId]
        if (state?.autoAdvance) {
          handleSkipNext(sectionId)
        }
      }
      
      // Start playing
      audio.play().catch(console.error)
      
      setAudioStates(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          isLoading: false,
          audioUrl: mockAudioUrl
        }
      }))
    }, 1000)
  }, [audioStates])

  const handlePlayPause = useCallback((sectionId: string) => {
    const audio = audioRefs.current[sectionId]
    if (audio) {
      if (audio.paused) {
        audio.play()
      } else {
        audio.pause()
      }
    }
  }, [])

  const handleProgressChange = useCallback((sectionId: string, progress: number) => {
    const audio = audioRefs.current[sectionId]
    if (audio) {
      audio.currentTime = (progress / 100) * audio.duration
    }
  }, [])

  const handleAutoAdvanceToggle = useCallback((sectionId: string) => {
    setAudioStates(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        autoAdvance: !prev[sectionId]?.autoAdvance
      }
    }))
  }, [])

  const handleSkipNext = useCallback((sectionId: string) => {
    // Find next timestamp in the same section
    let signals: Array<{ timestamp: string }> = []
    if (sectionId === 'investable') signals = episode.investableSignals
    else if (sectionId === 'competitive') signals = episode.competitiveIntel
    else if (sectionId === 'portfolio') signals = episode.portfolioMentions
    
    const currentIndex = signals.findIndex(s => s.timestamp === audioStates[sectionId]?.currentTimestamp)
    if (currentIndex < signals.length - 1) {
      handleTimestampClick(sectionId, signals[currentIndex + 1].timestamp)
    }
  }, [audioStates, episode, handleTimestampClick])

  const handleCloseAudio = useCallback((sectionId: string) => {
    const audio = audioRefs.current[sectionId]
    if (audio) {
      audio.pause()
    }
    setAudioStates(prev => {
      const newState = { ...prev }
      delete newState[sectionId]
      return newState
    })
  }, [])

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100 && info.velocity.y > 0) {
      onClose()
    }
  }

  const sections = [
    { id: 'investable', title: 'Investable Signals', count: episode.investableSignals.length },
    { id: 'competitive', title: 'Competitive Intel', count: episode.competitiveIntel.length },
    { id: 'portfolio', title: 'Portfolio Mentions', count: episode.portfolioMentions.length },
    { id: 'soundbites', title: 'LP-Ready Soundbites', count: episode.soundbites.length }
  ]

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
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? "100%" : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? "100%" : -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ 
              backgroundColor: "#0A0A0B",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              y,
              opacity: isMobile ? opacity : 1
            }}
            className={`relative text-white flex flex-col overflow-hidden ${
              isMobile 
                ? 'fixed inset-x-0 bottom-0 rounded-t-2xl max-h-[95vh]' 
                : 'rounded-xl w-full max-w-6xl max-h-[90vh]'
            }`}
          >
            {/* Pull to close indicator - Mobile only */}
            {isMobile && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-400 rounded-full" />
            )}
            
            {/* Header */}
            <header 
              className={`flex items-center justify-between flex-shrink-0 ${
                isMobile ? 'p-4 pt-6' : 'p-5'
              }`}
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

            {/* Mobile Section Tabs */}
            {isMobile && (
              <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5">
                <div className="flex gap-1">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSection(index)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        currentSection === index
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {section.title.split(' ')[0]} ({section.count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <main className={`flex-grow overflow-y-auto ${
              isMobile ? 'p-4 pb-24' : 'p-6 grid grid-cols-1 md:grid-cols-2 gap-6'
            }`}>
              {isMobile ? (
                <motion.div
                  className="flex gap-4"
                  animate={{ x: `-${currentSection * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  drag="x"
                  dragConstraints={{ left: -(sections.length - 1) * window.innerWidth, right: 0 }}
                  onDragEnd={(_, info) => {
                    const threshold = 50
                    if (info.offset.x > threshold && currentSection > 0) {
                      setCurrentSection(currentSection - 1)
                    } else if (info.offset.x < -threshold && currentSection < sections.length - 1) {
                      setCurrentSection(currentSection + 1)
                    }
                  }}
                >
                  {/* All sections for swipe navigation */}
                  <div className="w-full flex-shrink-0">
                    <IntelligenceSection
                      title={`Investable Signals (${episode.investableSignals.length})`}
                      icon={<Sparkles size={20} className="text-green-400" />}
                      borderColor="#34D399"
                      headerBgColor="rgba(52, 211, 153, 0.1)"
                      sectionId="investable"
                      onTimestampClick={handleTimestampClick}
                      audioState={audioStates.investable}
                      onAudioControl={{
                        onPlayPause: () => handlePlayPause('investable'),
                        onProgressChange: (progress) => handleProgressChange('investable', progress),
                        onAutoAdvanceToggle: () => handleAutoAdvanceToggle('investable'),
                        onSkipNext: () => handleSkipNext('investable'),
                        onClose: () => handleCloseAudio('investable')
                      }}
                    >
                      <SignalList
                        signals={episode.investableSignals}
                        signalColor="text-green-400"
                        onTimestampClick={(timestamp) => handleTimestampClick('investable', timestamp)}
                      />
                    </IntelligenceSection>
                  </div>

                  <div className="w-full flex-shrink-0">
                    <IntelligenceSection
                      title={`Competitive Intel (${episode.competitiveIntel.length})`}
                      icon={<Mic size={20} className="text-red-400" />}
                      borderColor="#F87171"
                      headerBgColor="rgba(248, 113, 113, 0.1)"
                      sectionId="competitive"
                      onTimestampClick={handleTimestampClick}
                      audioState={audioStates.competitive}
                      onAudioControl={{
                        onPlayPause: () => handlePlayPause('competitive'),
                        onProgressChange: (progress) => handleProgressChange('competitive', progress),
                        onAutoAdvanceToggle: () => handleAutoAdvanceToggle('competitive'),
                        onSkipNext: () => handleSkipNext('competitive'),
                        onClose: () => handleCloseAudio('competitive')
                      }}
                    >
                      <SignalList
                        signals={episode.competitiveIntel}
                        signalColor="text-red-400"
                        onTimestampClick={(timestamp) => handleTimestampClick('competitive', timestamp)}
                      />
                    </IntelligenceSection>
                  </div>

                  <div className="w-full flex-shrink-0">
                    <IntelligenceSection
                      title={`Your Portfolio Mentions (${episode.portfolioMentions.length})`}
                      icon={<BarChart3 size={20} className="text-purple-400" />}
                      borderColor="#A78BFA"
                      headerBgColor="rgba(167, 139, 250, 0.1)"
                      sectionId="portfolio"
                      actionBadge={
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                          <span className="text-sm">📊</span>
                          <span className="text-xs font-medium">Your Portfolio</span>
                        </div>
                      }
                      onTimestampClick={handleTimestampClick}
                      audioState={audioStates.portfolio}
                      onAudioControl={{
                        onPlayPause: () => handlePlayPause('portfolio'),
                        onProgressChange: (progress) => handleProgressChange('portfolio', progress),
                        onAutoAdvanceToggle: () => handleAutoAdvanceToggle('portfolio'),
                        onSkipNext: () => handleSkipNext('portfolio'),
                        onClose: () => handleCloseAudio('portfolio')
                      }}
                    >
                      <div className="flex-grow">
                        <ul className="space-y-3">
                          {episode.portfolioMentions.map((mention, i) => (
                            <li key={i} className="relative">
                              <div 
                                className="flex items-start gap-3 text-sm p-3 -m-3 rounded-lg transition-colors"
                                style={{ backgroundColor: "rgba(167, 139, 250, 0.05)" }}
                              >
                                <TimestampButton
                                  timestamp={mention.timestamp}
                                  isActive={audioStates.portfolio?.currentTimestamp === mention.timestamp}
                                  isLoading={audioStates.portfolio?.isLoading && audioStates.portfolio?.currentTimestamp === mention.timestamp}
                                  onClick={() => handleTimestampClick('portfolio', mention.timestamp)}
                                >
                                  {mention.timestamp}
                                </TimestampButton>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p style={{ color: "#E9D5FF" }} className="font-medium">
                                      {mention.company} mentioned as "category leader"
                                    </p>
                                    <span 
                                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                                        mention.sentiment === 'positive' 
                                          ? 'bg-green-500/20 text-green-400' 
                                          : mention.sentiment === 'neutral'
                                          ? 'bg-gray-500/20 text-gray-400'
                                          : 'bg-yellow-500/20 text-yellow-400'
                                      }`}
                                    >
                                      {mention.sentiment === 'positive' && <span>✨</span>}
                                      {mention.sentiment === 'neutral' && <span>💬</span>}
                                      {mention.sentiment === 'negative' && <span>⚡</span>}
                                      <span>
                                        {mention.sentiment === 'positive' ? 'Positive mention' : 
                                         mention.sentiment === 'neutral' ? 'Neutral context' : 
                                         'Competitor'}
                                      </span>
                                    </span>
                                  </div>
                                  <p className="mt-1" style={{ color: "#9CA3AF" }}>
                                    Context: {mention.context}
                                  </p>
                                  {audioStates.portfolio?.currentTimestamp === mention.timestamp && (
                                    <motion.div
                                      initial={{ scaleX: 0 }}
                                      animate={{ scaleX: 1 }}
                                      className="h-0.5 bg-gradient-to-r from-purple-400 to-purple-500 mt-2 origin-left"
                                      style={{ width: '100%' }}
                                    />
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </IntelligenceSection>
                  </div>

                  <div className="w-full flex-shrink-0">
                    <IntelligenceSection
                      title={`LP-Ready Soundbites (${episode.soundbites.length})`}
                      icon={<Quote size={20} className="text-purple-500" />}
                      borderColor="#9966ff"
                      headerBgColor="rgba(153, 102, 255, 0.15)"
                      sectionId="soundbites"
                      onTimestampClick={handleTimestampClick}
                      audioState={audioStates.soundbites}
                      onAudioControl={{
                        onPlayPause: () => handlePlayPause('soundbites'),
                        onProgressChange: (progress) => handleProgressChange('soundbites', progress),
                        onAutoAdvanceToggle: () => handleAutoAdvanceToggle('soundbites'),
                        onSkipNext: () => handleSkipNext('soundbites'),
                        onClose: () => handleCloseAudio('soundbites')
                      }}
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
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Desktop Grid Layout */}
                  <IntelligenceSection
                    title={`Investable Signals (${episode.investableSignals.length})`}
                    icon={<Sparkles size={20} className="text-green-400" />}
                    borderColor="#34D399"
                    headerBgColor="rgba(52, 211, 153, 0.1)"
                    sectionId="investable"
                    onTimestampClick={handleTimestampClick}
                    audioState={audioStates.investable}
                    onAudioControl={{
                      onPlayPause: () => handlePlayPause('investable'),
                      onProgressChange: (progress) => handleProgressChange('investable', progress),
                      onAutoAdvanceToggle: () => handleAutoAdvanceToggle('investable'),
                      onSkipNext: () => handleSkipNext('investable'),
                      onClose: () => handleCloseAudio('investable')
                    }}
                  >
                    <SignalList
                      signals={episode.investableSignals}
                      signalColor="text-green-400"
                      onTimestampClick={(timestamp) => handleTimestampClick('investable', timestamp)}
                    />
                  </IntelligenceSection>

                  <IntelligenceSection
                    title={`Competitive Intel (${episode.competitiveIntel.length})`}
                    icon={<Mic size={20} className="text-red-400" />}
                    borderColor="#F87171"
                    headerBgColor="rgba(248, 113, 113, 0.1)"
                    sectionId="competitive"
                    onTimestampClick={handleTimestampClick}
                    audioState={audioStates.competitive}
                    onAudioControl={{
                      onPlayPause: () => handlePlayPause('competitive'),
                      onProgressChange: (progress) => handleProgressChange('competitive', progress),
                      onAutoAdvanceToggle: () => handleAutoAdvanceToggle('competitive'),
                      onSkipNext: () => handleSkipNext('competitive'),
                      onClose: () => handleCloseAudio('competitive')
                    }}
                  >
                    <SignalList
                      signals={episode.competitiveIntel}
                      signalColor="text-red-400"
                      onTimestampClick={(timestamp) => handleTimestampClick('competitive', timestamp)}
                    />
                  </IntelligenceSection>

                  <IntelligenceSection
                    title={`Your Portfolio Mentions (${episode.portfolioMentions.length})`}
                    icon={<BarChart3 size={20} className="text-purple-400" />}
                    borderColor="#A78BFA"
                    headerBgColor="rgba(167, 139, 250, 0.1)"
                    sectionId="portfolio"
                    actionBadge={
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                        <span className="text-sm">📊</span>
                        <span className="text-xs font-medium">Your Portfolio</span>
                      </div>
                    }
                    onTimestampClick={handleTimestampClick}
                    audioState={audioStates.portfolio}
                    onAudioControl={{
                      onPlayPause: () => handlePlayPause('portfolio'),
                      onProgressChange: (progress) => handleProgressChange('portfolio', progress),
                      onAutoAdvanceToggle: () => handleAutoAdvanceToggle('portfolio'),
                      onSkipNext: () => handleSkipNext('portfolio'),
                      onClose: () => handleCloseAudio('portfolio')
                    }}
                  >
                    <div className="flex-grow">
                      <ul className="space-y-3">
                        {episode.portfolioMentions.map((mention, i) => (
                          <li key={i} className="relative">
                            <div 
                              className="flex items-start gap-3 text-sm p-3 -m-3 rounded-lg transition-colors"
                              style={{ backgroundColor: "rgba(167, 139, 250, 0.05)" }}
                            >
                              <TimestampButton
                                timestamp={mention.timestamp}
                                isActive={audioStates.portfolio?.currentTimestamp === mention.timestamp}
                                isLoading={audioStates.portfolio?.isLoading && audioStates.portfolio?.currentTimestamp === mention.timestamp}
                                onClick={() => handleTimestampClick('portfolio', mention.timestamp)}
                              >
                                {mention.timestamp}
                              </TimestampButton>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p style={{ color: "#E9D5FF" }} className="font-medium">
                                    {mention.company} mentioned as "category leader"
                                  </p>
                                  <span 
                                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                                      mention.sentiment === 'positive' 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : mention.sentiment === 'neutral'
                                        ? 'bg-gray-500/20 text-gray-400'
                                        : 'bg-yellow-500/20 text-yellow-400'
                                    }`}
                                  >
                                    {mention.sentiment === 'positive' && <span>✨</span>}
                                    {mention.sentiment === 'neutral' && <span>💬</span>}
                                    {mention.sentiment === 'negative' && <span>⚡</span>}
                                    <span>
                                      {mention.sentiment === 'positive' ? 'Positive mention' : 
                                       mention.sentiment === 'neutral' ? 'Neutral context' : 
                                       'Competitor'}
                                    </span>
                                  </span>
                                </div>
                                <p className="mt-1" style={{ color: "#9CA3AF" }}>
                                  Context: {mention.context}
                                </p>
                                {audioStates.portfolio?.currentTimestamp === mention.timestamp && (
                                  <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    className="h-0.5 bg-gradient-to-r from-purple-400 to-purple-500 mt-2 origin-left"
                                    style={{ width: '100%' }}
                                  />
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </IntelligenceSection>

                  <IntelligenceSection
                    title={`LP-Ready Soundbites (${episode.soundbites.length})`}
                    icon={<Quote size={20} className="text-purple-500" />}
                    borderColor="#9966ff"
                    headerBgColor="rgba(153, 102, 255, 0.15)"
                    sectionId="soundbites"
                    onTimestampClick={handleTimestampClick}
                    audioState={audioStates.soundbites}
                    onAudioControl={{
                      onPlayPause: () => handlePlayPause('soundbites'),
                      onProgressChange: (progress) => handleProgressChange('soundbites', progress),
                      onAutoAdvanceToggle: () => handleAutoAdvanceToggle('soundbites'),
                      onSkipNext: () => handleSkipNext('soundbites'),
                      onClose: () => handleCloseAudio('soundbites')
                    }}
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
                </>
              )}
            </main>

            {/* Action Bar */}
            <footer 
              className={`flex flex-wrap items-center justify-between gap-4 flex-shrink-0 ${
                isMobile ? 'p-3 fixed bottom-0 left-0 right-0 z-10' : 'p-4'
              }`}
              style={{ 
                backgroundColor: "#1A1A1C",
                borderTop: "1px solid rgba(255, 255, 255, 0.06)"
              }}
            >
              {/* Primary Actions */}
              <div className={`flex items-center gap-3 ${isMobile ? 'flex-1' : ''}`}>
                <button 
                  onClick={() => {
                    // Email functionality here
                    setIsSaved(true)
                    setTimeout(() => setIsSaved(false), 3000)
                  }}
                  className={`flex items-center gap-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-brand-purple to-brand-pink hover:brightness-110 transition-all duration-300 ${
                    isMobile ? 'px-3 py-2 flex-1' : 'px-4 py-2.5'
                  }`}
                  style={{ boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)" }}
                >
                  <Mail size={isMobile ? 14 : 16} /> 
                  {isMobile ? 'Email' : 'Email Brief'}
                </button>
                <button 
                  className={`flex items-center gap-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-brand-purple to-brand-pink hover:brightness-110 transition-all duration-300 ${
                    isMobile ? 'px-3 py-2 flex-1' : 'px-4 py-2.5'
                  }`}
                  style={{ boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)" }}
                >
                  <MessageSquare size={isMobile ? 14 : 16} /> 
                  {isMobile ? 'Slack' : 'Share to Slack'}
                </button>
              </div>

              {/* Secondary Actions and Save Indicator */}
              <div className={`flex items-center gap-4 ${isMobile ? 'hidden' : ''}`}>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200">
                  <Play size={16} className="opacity-60" /> 
                  Play Episode
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200">
                  <FileText size={16} className="opacity-60" /> 
                  Full Transcript
                </button>
                <motion.div 
                  className="flex items-center gap-2 font-medium text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isSaved ? (
                    <>
                      <span className="text-green-400">💾</span>
                      <span className="text-green-400">Saved</span>
                    </>
                  ) : (
                    <>
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-400">Save {episode.duration}</span>
                    </>
                  )}
                </motion.div>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}