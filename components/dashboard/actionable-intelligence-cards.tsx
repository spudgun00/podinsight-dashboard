"use client";

import React from "react";

interface IntelligenceCard {
  icon: string;
  title: string;
  subtitle: string;
  action: string;
  onClick: () => void;
  iconStyles: {
    background: string;
    border: string;
    hoverBackground: string;
    glow: string;
  };
}

const cards: IntelligenceCard[] = [
  {
    icon: "🔥",
    title: "What's Hot",
    subtitle: "12 new signals today",
    action: "View Latest →",
    onClick: () => console.log("Viewing hot signals"),
    iconStyles: {
      background: "rgba(239, 68, 68, 0.15)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      hoverBackground: "rgba(239, 68, 68, 0.25)",
      glow: "0 0 20px rgba(239, 68, 68, 0.2)"
    }
  },
  {
    icon: "💰",
    title: "Deal Flow",
    subtitle: "Track investment signals",
    action: "Track Deals →",
    onClick: () => console.log("Tracking deals"),
    iconStyles: {
      background: "rgba(34, 197, 94, 0.15)",
      border: "1px solid rgba(34, 197, 94, 0.3)",
      hoverBackground: "rgba(34, 197, 94, 0.25)",
      glow: "0 0 20px rgba(34, 197, 94, 0.2)"
    }
  },
  {
    icon: "📊",
    title: "Your Portfolio",
    subtitle: "3 mentions this week",
    action: "View Mentions →",
    onClick: () => console.log("Viewing portfolio mentions"),
    iconStyles: {
      background: "rgba(139, 92, 246, 0.15)",
      border: "1px solid rgba(139, 92, 246, 0.3)",
      hoverBackground: "rgba(139, 92, 246, 0.25)",
      glow: "0 0 20px rgba(139, 92, 246, 0.2)"
    }
  },
  {
    icon: "⚡",
    title: "Quick Brief",
    subtitle: "5 min intelligence digest",
    action: "Generate →",
    onClick: () => console.log("Generating quick brief"),
    iconStyles: {
      background: "rgba(251, 191, 36, 0.15)",
      border: "1px solid rgba(251, 191, 36, 0.3)",
      hoverBackground: "rgba(251, 191, 36, 0.25)",
      glow: "0 0 20px rgba(251, 191, 36, 0.2)"
    }
  }
];

export const ActionableIntelligenceCards = () => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <section className="mt-12 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            style={{
              backgroundColor: "#1A1A1C",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "12px",
              padding: "20px",
              height: "100px"
            }}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start gap-3">
                {/* Premium Icon Container */}
                <div
                  className="icon-container transition-all duration-300 group-hover:scale-110"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    background: hoveredIndex === index ? card.iconStyles.hoverBackground : card.iconStyles.background,
                    border: card.iconStyles.border,
                    boxShadow: card.iconStyles.glow,
                    flexShrink: 0
                  }}
                >
                  <span>{card.icon}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-white text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#9CA3AF] mt-1">
                    {card.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="mt-auto pt-3">
                <span className="text-sm text-[#A78BFA] hover:underline">
                  {card.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Divider line */}
      <div 
        className="mt-12"
        style={{
          height: "1px",
          background: "rgba(255, 255, 255, 0.06)"
        }}
      />
    </section>
  );
};