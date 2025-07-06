"use client"

import type React from "react"

import { motion, animate } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
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

export function MetricCard({ 
  title, 
  value, 
  icon, 
  animation = "none", 
  unit, 
  sparklineData, 
  sparklineColor, 
  sparklineYDomain,
  change,
  changeType = "positive"
}: MetricCardProps & { 
  sparklineData?: any[], 
  sparklineColor?: string, 
  sparklineYDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'],
  change?: string,
  changeType?: "positive" | "negative"
}) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const showSparkline = title === "Trending Now" && sparklineData
  const isTrendingNow = title === "Trending Now"

  return (
    <motion.div
      variants={cardVariants}
      className={`relative overflow-hidden ${isTrendingNow ? 'ring-2 ring-[#8B5CF6]' : ''}`}
      style={{
        backgroundColor: "#1A1A1C",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
        borderRadius: "16px",
        padding: "20px",
        minHeight: "120px",
        background: isTrendingNow 
          ? "linear-gradient(135deg, #1A1A1C 0%, rgba(139, 92, 246, 0.05) 100%)" 
          : "#1A1A1C"
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col flex-1">
          {/* Icon Container */}
          <div 
            className={`flex items-center justify-center mb-3 ${isTrendingNow ? 'animate-pulse' : ''}`}
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              borderRadius: "12px"
            }}
          >
            <div style={{ color: "var(--accent-purple, #8B5CF6)", fontSize: "24px" }}>
              {icon}
            </div>
          </div>
          
          {/* Text Content */}
          <div>
            <p 
              style={{
                fontSize: "13px",
                color: "#9CA3AF",
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "8px"
              }}
            >
              {title}
            </p>
            <div 
              style={{
                fontSize: "28px",
                color: "white",
                fontWeight: 700,
                lineHeight: 1
              }}
            >
              {animation === "count-up" && typeof value === "number" ? (
                <AnimatedNumber value={value} />
              ) : (
                value
              )}
              {unit && (
                <span 
                  style={{
                    fontSize: "16px",
                    fontWeight: 400,
                    marginLeft: "4px",
                    color: "#9CA3AF"
                  }}
                >
                  {unit}
                </span>
              )}
            </div>
            
            {/* Change Indicator */}
            {change && (
              <div 
                className="flex items-center gap-1"
                style={{
                  fontSize: "14px",
                  marginTop: "8px",
                  color: changeType === "positive" ? "#10B981" : "#EF4444"
                }}
              >
                {changeType === "positive" ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span>{change}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Sparkline for trending */}
        {showSparkline && (
          <TrendingSparkline 
            data={sparklineData} 
            color={sparklineColor} 
            yDomain={sparklineYDomain} 
          />
        )}
      </div>
    </motion.div>
  )
}
