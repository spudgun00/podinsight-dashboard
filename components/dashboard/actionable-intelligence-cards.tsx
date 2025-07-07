"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface MetricCard {
  value: string;
  trend?: "up" | "down";
  label: string;
  context: string;
  href: string;
}

const cards: MetricCard[] = [
  {
    value: "23",
    trend: "up",
    label: "Market Signals",
    context: "2 urgent today",
    href: "/market"
  },
  {
    value: "8",
    label: "Deal Intelligence",
    context: "3 closing soon",
    href: "/deals"
  },
  {
    value: "14",
    trend: "down",
    label: "Portfolio Pulse",
    context: "3 need attention",
    href: "/portfolio"
  },
  {
    value: "Ready",
    label: "Executive Brief",
    context: "5 min read",
    href: "/brief"
  }
];

export const ActionableIntelligenceCards = () => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          onClick={() => router.push(card.href)}
          className="h-[100px] bg-black border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-gray-700 transition-colors"
        >
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[2.5rem] font-bold text-white leading-none">
              {card.value}
            </span>
            {card.trend && (
              <span className={card.trend === "up" ? "text-green-500" : "text-red-500"}>
                {card.trend === "up" ? "↑" : "↓"}
              </span>
            )}
          </div>
          <div className="text-gray-400 text-base mb-1">
            {card.label}
          </div>
          <div className="text-gray-600 text-sm">
            {card.context}
          </div>
        </div>
      ))}
    </div>
  );
};