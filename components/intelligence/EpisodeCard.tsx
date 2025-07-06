"use client"

import { motion } from "framer-motion"
import type { Episode } from "@/lib/mock-episode-data"

const signalStyles = {
  red_hot: {
    bar: "bg-signal-red",
    badgeBg: "bg-signal-red/20",
    scoreBg: "bg-signal-red/30",
    text: "text-signal-red",
    filter: "bg-signal-red text-white",
  },
  high_value: {
    bar: "bg-signal-orange",
    badgeBg: "bg-signal-orange/20",
    scoreBg: "bg-signal-orange/30",
    text: "text-signal-orange",
    filter: "bg-gray-700 text-gray-300",
  },
  market_intel: {
    bar: "bg-signal-green",
    badgeBg: "bg-signal-green/20",
    scoreBg: "bg-signal-green/30",
    text: "text-signal-green",
    filter: "bg-gray-700 text-gray-300",
  },
  portfolio_mention: {
    bar: "bg-signal-blue",
    badgeBg: "bg-signal-blue/20",
    scoreBg: "bg-signal-blue/30",
    text: "text-signal-blue",
    filter: "bg-gray-700 text-gray-300",
  },
}

const defaultStyles = {
  bar: "bg-gray-500",
  badgeBg: "bg-gray-500/20",
  scoreBg: "bg-gray-500/30",
  text: "text-gray-400",
  filter: "bg-gray-700 text-gray-300",
}

export const EpisodeCard = ({
  episode,
  onViewBriefClick,
}: { episode: Episode; onViewBriefClick: (episode: Episode) => void }) => {
  const styles = signalStyles[episode.signal] || defaultStyles

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full max-w-[400px] h-[180px] bg-card-bg border border-card-border rounded-lg overflow-hidden relative flex flex-col"
    >
      <div className={`w-full h-1 ${styles.bar}`} />
      <div className="px-3 pt-3 pb-3 flex-grow flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${styles.badgeBg}`}
            >
              {episode.abbreviation}
            </div>
            <div>
              <p className="text-white font-semibold text-sm truncate" title={episode.title}>
                {episode.title}
              </p>
              <p className="text-gray-400 text-xs">
                {episode.timeAgo} • {episode.duration}
              </p>
            </div>
          </div>
          <div className={`px-2 py-0.5 rounded-md text-white text-xs font-bold flex-shrink-0 ml-2 ${styles.scoreBg}`}>
            {episode.score}
          </div>
        </div>

        <div className="mt-2 mb-1">
          {episode.signal === "red_hot" && <p className="text-signal-red text-xs font-bold">🚨 BREAKING:</p>}
          {episode.signal === "high_value" && <p className="text-signal-orange text-xs font-bold">💰 HIGH VALUE:</p>}
          {episode.signal === "market_intel" && <p className="text-signal-green text-xs font-bold">📊 MARKET INTEL:</p>}
        </div>

        <ul className="mt-1 space-y-0.5">
          {episode.intel.slice(0, 3).map((point, index) => (
            <li key={index} className={`text-xs truncate text-white ${styles.text}`}>
              <span className={`${styles.text}/50 mr-1.5`}>•</span>
              {point}
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-end">
          <button
            onClick={() => onViewBriefClick(episode)}
            className="text-signal-orange text-xs font-semibold hover:underline pt-1.5"
          >
            View Intel Brief →
          </button>
          <div className="flex items-center gap-2 text-gray-400">
            <button className="hover:text-white transition-colors text-xs">📧</button>
            <button className="hover:text-white transition-colors text-xs">💬</button>
            <button className="hover:text-white transition-colors text-xs">🔖</button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
