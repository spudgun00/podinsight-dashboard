import type { TopicData } from "./types"

export const topicVelocityData: TopicData[] = [
  { week: "W1", "AI Agents": 30, "Capital Efficiency": 45, DePIN: 15, "B2B SaaS": 25 },
  { week: "W2", "AI Agents": 35, "Capital Efficiency": 44, DePIN: 18, "B2B SaaS": 28 },
  { week: "W3", "AI Agents": 40, "Capital Efficiency": 43, DePIN: 16, "B2B SaaS": 31 },
  { week: "W4", "AI Agents": 45, "Capital Efficiency": 42, DePIN: 22, "B2B SaaS": 34 },
  { week: "W5", "AI Agents": 50, "Capital Efficiency": 41, DePIN: 20, "B2B SaaS": 37 },
  { week: "W6", "AI Agents": 55, "Capital Efficiency": 40, DePIN: 28, "B2B SaaS": 40 },
  { week: "W7", "AI Agents": 60, "Capital Efficiency": 39, DePIN: 25, "B2B SaaS": 43 },
  { week: "W8", "AI Agents": 65, "Capital Efficiency": 38, DePIN: 35, "B2B SaaS": 46 },
  { week: "W9", "AI Agents": 70, "Capital Efficiency": 37, DePIN: 30, "B2B SaaS": 49 },
  { week: "W10", "AI Agents": 75, "Capital Efficiency": 36, DePIN: 40, "B2B SaaS": 52 },
  { week: "W11", "AI Agents": 80, "Capital Efficiency": 35, DePIN: 38, "B2B SaaS": 54 },
  { week: "W12", "AI Agents": 85, "Capital Efficiency": 35, DePIN: 40, "B2B SaaS": 55 },
]

// Previous quarter data (slightly lower values to show growth)
export const previousQuarterData: TopicData[] = [
  { week: "W1", "AI Agents": 20, "Capital Efficiency": 50, DePIN: 12, "B2B SaaS": 22 },
  { week: "W2", "AI Agents": 22, "Capital Efficiency": 49, DePIN: 14, "B2B SaaS": 24 },
  { week: "W3", "AI Agents": 25, "Capital Efficiency": 48, DePIN: 13, "B2B SaaS": 26 },
  { week: "W4", "AI Agents": 28, "Capital Efficiency": 47, DePIN: 16, "B2B SaaS": 28 },
  { week: "W5", "AI Agents": 30, "Capital Efficiency": 46, DePIN: 15, "B2B SaaS": 30 },
  { week: "W6", "AI Agents": 32, "Capital Efficiency": 45, DePIN: 18, "B2B SaaS": 32 },
  { week: "W7", "AI Agents": 35, "Capital Efficiency": 44, DePIN: 17, "B2B SaaS": 34 },
  { week: "W8", "AI Agents": 38, "Capital Efficiency": 43, DePIN: 20, "B2B SaaS": 36 },
  { week: "W9", "AI Agents": 40, "Capital Efficiency": 42, DePIN: 19, "B2B SaaS": 38 },
  { week: "W10", "AI Agents": 42, "Capital Efficiency": 41, DePIN: 22, "B2B SaaS": 40 },
  { week: "W11", "AI Agents": 45, "Capital Efficiency": 40, DePIN: 21, "B2B SaaS": 42 },
  { week: "W12", "AI Agents": 48, "Capital Efficiency": 39, DePIN: 24, "B2B SaaS": 44 },
]

export const topicColors: { [key: string]: string } = {
  "AI Agents": "#7C3AED", // Deeper Purple - premium accent
  "Capital Efficiency": "#3B82F6", // Blue
  DePIN: "#10B981", // Emerald
  "B2B SaaS": "#F59E0B", // Coral
}
