"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AISearchModal } from "./ai-search-modal"

export function FloatingAIButton() {
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    console.log("Open AI Intelligence")
    setShowModal(true)
  }

  return (
    <>
      <motion.button
        onClick={handleClick}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        whileHover={{ scale: 1.05 }}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1000,
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
          boxShadow: "0 4px 16px rgba(139, 92, 246, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer",
          transition: "all 0.3s ease",
          animation: "pulse 3s ease-in-out infinite",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.6)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(139, 92, 246, 0.4)"
        }}
      >
        <span style={{ fontSize: "28px" }}>🧠</span>
      </motion.button>

      <AISearchModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}