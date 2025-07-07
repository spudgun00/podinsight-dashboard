"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles } from "lucide-react"
import { SearchCommandBar } from "./search-command-bar-fixed"

interface AISearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const examplePrompts = [
  "What are VCs saying about AI valuations?",
  "Recent M&A activity in fintech",
  "Portfolio company mentions this week"
]

export function AISearchModal({ isOpen, onClose }: AISearchModalProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string>("")
  const searchBarRef = useRef<HTMLInputElement>(null)

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        // Find and focus the search input within SearchCommandBar
        const input = document.querySelector('input[placeholder*="Ask anything"]') as HTMLInputElement
        if (input) {
          input.focus()
        }
      }, 300)
    }
  }, [isOpen])

  const handlePromptClick = (prompt: string) => {
    // Find the search input and set its value
    const input = document.querySelector('input[placeholder*="Ask anything"]') as HTMLInputElement
    if (input) {
      input.value = prompt
      input.focus()
      // Trigger input event to activate search
      const event = new Event('input', { bubbles: true })
      input.dispatchEvent(event)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[10000]"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)"
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-[10001]"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "700px",
            }}
          >
            <div
              className="relative"
              style={{
                background: "#0A0A0B",
                border: "2px solid rgba(139, 92, 246, 0.3)",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)"
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)"
                    }}
                  >
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">
                    AI Intelligence Search
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-2xl leading-none transition-opacity"
                  style={{
                    color: "#FFFFFF",
                    opacity: 0.6
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
                >
                  ×
                </button>
              </div>

              {/* Search Section */}
              <div style={{ marginTop: "24px" }}>
                <SearchCommandBar 
                  mode="modal"
                  onSearch={(query) => {
                    // Close modal when search is submitted
                    console.log("Search submitted:", query)
                    onClose()
                  }}
                />
              </div>

              {/* Example Prompts */}
              <div style={{ marginTop: "16px" }}>
                <p style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "12px" }}>
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handlePromptClick(prompt)}
                      className="px-3 py-2 text-sm rounded-lg transition-all"
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        color: "#A78BFA",
                        fontSize: "12px"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)"
                        e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent"
                        e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)"
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}