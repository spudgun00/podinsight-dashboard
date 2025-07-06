"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { X, TrendingUp, Zap, ChevronRight } from "lucide-react"

interface Signal {
  id: string
  type: 'correlation' | 'velocity' | 'sentiment' | 'competitive'
  title: string
  metric: string
  trend: string
  context?: string
  priority: number
}

interface FloatingInsightCardProps {
  signals: Signal[]
  onViewAnalysis?: (signal: Signal) => void
  onClose?: () => void
}

export function FloatingInsightCard({ signals, onViewAnalysis, onClose }: FloatingInsightCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Auto-rotate through signals
  useEffect(() => {
    if (!isPaused && signals.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % signals.length)
      }, 8000) // 8 seconds per signal
      
      return () => clearInterval(timer)
    }
  }, [isPaused, signals.length])
  
  if (signals.length === 0) return null
  
  const currentSignal = signals[currentIndex]
  
  const getSignalIcon = (type: Signal['type']) => {
    switch (type) {
      case 'correlation':
        return '🔗'
      case 'velocity':
        return '🚀'
      case 'sentiment':
        return '💭'
      case 'competitive':
        return '⚔️'
      default:
        return '⚡'
    }
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-50 max-w-[400px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="relative overflow-hidden rounded-xl"
          style={{
            backgroundColor: "rgba(26, 26, 28, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Subtle pulse animation */}
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              background: [
                "radial-gradient(circle at 50% 50%, #8B5CF6 0%, transparent 70%)",
                "radial-gradient(circle at 50% 50%, #8B5CF6 20%, transparent 70%)",
                "radial-gradient(circle at 50% 50%, #8B5CF6 0%, transparent 70%)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <div className="relative p-4">
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getSignalIcon(currentSignal.type)}</span>
                <span className="text-xs font-bold text-[#8B5CF6] tracking-wider">
                  SIGNAL
                </span>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-white/5 transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
            
            {/* Signal content */}
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-base">
                {currentSignal.title}
              </h3>
              
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-300">{currentSignal.metric}</span>
                <span className="text-[#10B981] font-medium flex items-center gap-1">
                  <TrendingUp size={14} />
                  {currentSignal.trend}
                </span>
              </div>
              
              {currentSignal.context && (
                <p className="text-xs text-gray-400 mt-1">
                  {currentSignal.context}
                </p>
              )}
              
              {/* Call to action */}
              <button
                onClick={() => onViewAnalysis?.(currentSignal)}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 
                         border border-[#8B5CF6]/30 text-[#8B5CF6] text-sm font-medium
                         transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                View Analysis
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            
            {/* Navigation dots */}
            {signals.length > 1 && (
              <div className="flex gap-1 justify-center mt-3">
                {signals.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-4 bg-[#8B5CF6]"
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}