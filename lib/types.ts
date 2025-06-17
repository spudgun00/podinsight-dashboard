import type React from "react"
export interface TopicData {
  week: string
  "AI Agents": number
  "Capital Efficiency": number
  DePIN: number
  "B2B SaaS": number
}

export interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  animation?: "count-up" | "pulse" | "none"
  unit?: string
}
