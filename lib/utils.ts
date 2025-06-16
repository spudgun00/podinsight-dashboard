import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TOPIC_COLORS = {
  "AI Agents": "#10B981",
  "Capital Efficiency": "#6B46C1",
  "DePIN": "#3B82F6",
  "B2B SaaS": "#EF4444",
  "Crypto/Web3": "#F59E0B",
} as const;

export const DEFAULT_TOPICS = [
  "AI Agents",
  "Capital Efficiency",
  "DePIN",
  "B2B SaaS",
];