"use client"

import type React from "react"

import { motion, animate } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
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


export function MetricCard({ 
  title, 
  value, 
  icon, 
  animation = "none", 
  unit, 
  change,
  changeType = "positive"
}: MetricCardProps & { 
  change?: string,
  changeType?: "positive" | "negative"
}) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const isTrendingNow = title === "Trending Now"

  return (
    <motion.div
      variants={cardVariants}
      className={`relative overflow-hidden w-full ${isTrendingNow ? 'ring-2 ring-[#8B5CF6]' : ''}`}
      style={{
        maxWidth: "280px",
        backgroundColor: "#1A1A1C",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
        borderRadius: "16px",
        padding: "20px",
        background: isTrendingNow 
          ? "linear-gradient(135deg, #1A1A1C 0%, rgba(139, 92, 246, 0.05) 100%)" 
          : "#1A1A1C"
      }}
    >
      <div className="flex items-center gap-3">
        {/* Icon Container */}
        <div 
          className={`flex items-center justify-center flex-shrink-0 ${isTrendingNow ? 'animate-pulse' : ''}`}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            borderRadius: "12px"
          }}
        >
          <div style={{ color: "var(--accent-purple, #8B5CF6)", fontSize: "20px" }}>
            {icon}
          </div>
        </div>
        
        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <div 
              style={{
                fontSize: "24px",
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
                    fontSize: "14px",
                    fontWeight: 400,
                    marginLeft: "2px",
                    color: "#9CA3AF"
                  }}
                >
                  {unit}
                </span>
              )}
            </div>
            
            {/* Change Indicator inline with value */}
            {change && (
              <div 
                className="flex items-center gap-1"
                style={{
                  fontSize: "12px",
                  color: changeType === "positive" ? "#10B981" : "#EF4444"
                }}
              >
                {changeType === "positive" ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                <span className="whitespace-nowrap">{change}</span>
              </div>
            )}
          </div>
          
          <p 
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginTop: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {title}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
