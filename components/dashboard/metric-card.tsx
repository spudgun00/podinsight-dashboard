"use client"

import type React from "react"

import { motion, animate } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import type { MetricCardProps } from "@/lib/types"

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

const TrendingSparkline = ({ data, color, yDomain }: { data?: any[], color?: string, yDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'] }) => {
  if (!data || data.length === 0) {
    return null
  }

  return (
    <div className="w-16 h-[50px] ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={yDomain || ['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color || "#7C3AED"}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MetricCard({ title, value, icon, animation = "none", unit, sparklineData, sparklineColor, sparklineYDomain }: MetricCardProps & { sparklineData?: any[], sparklineColor?: string, sparklineYDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'] }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const showSparkline = title === "Trending Now" && sparklineData

  // Determine icon styles based on title
  const getIconStyles = () => {
    if (title === "Trending Now") {
      return {
        iconStyle: { color: sparklineColor || "#7C3AED" },
        bgStyle: { backgroundColor: sparklineColor ? `${sparklineColor}1A` : "#7C3AED1A" }, // 10% opacity
      }
    }
    return {
      iconStyle: { color: "#3B82F6" },
      bgStyle: { backgroundColor: "#3B82F61A" }, // 10% opacity
    }
  }

  const { iconStyle, bgStyle } = getIconStyles()

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 flex items-center space-x-4 transition-all duration-300 hover:bg-white/10 hover:scale-105 shadow-xl shadow-purple-500/5"
    >
      <div className="p-2 rounded-md" style={{ ...iconStyle, ...bgStyle }}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-white/70">{title}</p>
        <div className="text-xl font-bold font-mono flex items-center">
          {animation === "count-up" && typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          {animation === "pulse" && (
            <span
              className="ml-2 w-3 h-3 rounded-full bg-brand-emerald animate-pulse-glow"
              style={{
                boxShadow: "0 0 8px rgba(16, 185, 129, 0.6), 0 0 16px rgba(16, 185, 129, 0.4)",
              }}
            />
          )}
          {unit && <span className="text-sm font-sans ml-1 text-white/70">{unit}</span>}
        </div>
      </div>
      {showSparkline && <TrendingSparkline data={sparklineData} color={sparklineColor} yDomain={sparklineYDomain} />}
    </motion.div>
  )
}
