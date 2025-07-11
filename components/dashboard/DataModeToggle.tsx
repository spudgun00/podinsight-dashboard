"use client"

import { useDataMode } from '@/contexts/DataModeContext'
import { motion } from 'framer-motion'

export function DataModeToggle() {
  const { isLiveData, setIsLiveData } = useDataMode()

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs ${!isLiveData ? 'text-purple-400' : 'text-gray-500'}`}>
        Demo
      </span>
      <button
        onClick={() => setIsLiveData(!isLiveData)}
        className="relative w-12 h-6 rounded-full bg-gray-800 border border-gray-700 transition-colors duration-200"
        aria-label="Toggle between demo and live data"
      >
        <motion.div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full ${
            isLiveData ? 'bg-green-500' : 'bg-purple-500'
          }`}
          animate={{ x: isLiveData ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      <span className={`text-xs ${isLiveData ? 'text-green-400' : 'text-gray-500'}`}>
        Live
      </span>
    </div>
  )
}