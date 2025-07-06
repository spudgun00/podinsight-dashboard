"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { EpisodeCard } from "./EpisodeCard"
import type { Episode } from "@/lib/mock-episode-data"

interface ExpandableEpisodeGridProps {
  episodes: Episode[]
  onViewBriefClick: (episode: Episode) => void
}

export function ExpandableEpisodeGrid({ episodes, onViewBriefClick }: ExpandableEpisodeGridProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const initialCount = 3
  const expandedCount = 6
  const episodesToShow = isExpanded ? episodes.slice(0, expandedCount) : episodes.slice(0, initialCount)
  const hiddenCount = isExpanded 
    ? Math.max(0, episodes.length - expandedCount)
    : Math.max(0, Math.min(expandedCount - initialCount, episodes.length - initialCount))

  return (
    <motion.div layout>
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
        <AnimatePresence>
          {episodesToShow.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} onViewBriefClick={onViewBriefClick} />
          ))}
        </AnimatePresence>
      </motion.div>

      {hiddenCount > 0 && (
        <motion.div layout className="mt-6 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full bg-transparent border-0 text-gray-300 text-sm font-semibold px-6 py-2 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} /> Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                {hiddenCount} more episodes below threshold • <span className="text-orange-500">Show All</span>
              </>
            )}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
