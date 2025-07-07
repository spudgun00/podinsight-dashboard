"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AISearchModalEnhanced } from "./ai-search-modal-enhanced"

export function FloatingAIButton() {
  const [showModal, setShowModal] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    setShowModal(true)
  }

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowModal(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip */}
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 whitespace-nowrap"
          >
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
              Ask anything about podcasts
              <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
            </div>
          </motion.div>
        )}

        {/* Button */}
        <motion.button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.3
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center overflow-hidden group"
          style={{
            boxShadow: "0 4px 16px rgba(139, 92, 246, 0.4)",
          }}
        >
          {/* Pulse animation background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-75 animate-pulse" />
          
          {/* Icon */}
          <span className="relative z-10 text-2xl">🧠</span>
          
          {/* Hover effect */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        </motion.button>
      </div>

      <AISearchModalEnhanced 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Add CSS for pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.75;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 0.75;
          }
        }
      `}</style>
    </>
  )
}