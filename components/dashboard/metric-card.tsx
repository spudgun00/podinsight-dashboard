"use client"

import type React from "react"

import { motion, animate } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import type { MetricCardProps } from "@/lib/v0-types"
import { topicVelocityData } from "@/lib/mock-data"

const AnimatedNumber = ({ value }: { value: number }) => {
  const [currentValue, setCurrentValue] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true })

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => {
          setCurrentValue(Math.round(latest))
        },
      })
      return () => controls.stop()
    }
  }, [inView, value])

  return <span ref={ref}>{currentValue.toLocaleString()}</span>
}

const TrendingSparkline = () => {
  // Get last 7 data points for AI Agents
  const sparklineData = topicVelocityData.slice(-7).map((item) => ({
    value: item["AI Agents"],
  }))

  return (
    <div className="w-16 h-[50px] ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sparklineData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#7C3AED"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MetricCard({ title, value, icon, animation = "none", unit }: MetricCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const showSparkline = title === "Trending Now"

  // Determine icon color and background based on title
  const getIconStyles = () => {
    if (title === "Trending Now") {
      return {
        iconColor: "text-[#7C3AED]",
        bgColor: "bg-[#7C3AED]/10",
      }
    }
    return {
      iconColor: "text-[#3B82F6]",
      bgColor: "bg-[#3B82F6]/10",
    }
  }

  const { iconColor, bgColor } = getIconStyles()

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 flex items-center space-x-4 transition-all duration-300 hover:bg-white/10 hover:scale-105 shadow-xl shadow-purple-500/5"
    >
      <div className={`${iconColor} p-2 ${bgColor} rounded-md`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-white/70">{title}</p>
        <div className="text-xl font-bold font-mono flex items-center">
          {animation === "count-up" && typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          {animation === "pulse" && (
            <span
              className="ml-2 w-3 h-3 rounded-full bg-brand-emerald animate-pulse-glow"
              style={
                {
                  "--glow-color": "rgba(16, 185, 129, 0.8)",
                  boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
                  animation: "pulse-live-dot 2s ease-in-out infinite",
                } as React.CSSProperties
              }
            />
          )}
          {unit && <span className="text-sm font-sans ml-1 text-white/70">{unit}</span>}
        </div>
      </div>
      {showSparkline && <TrendingSparkline />}
    </motion.div>
  )
}
