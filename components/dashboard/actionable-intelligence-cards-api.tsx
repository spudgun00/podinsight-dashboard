"use client";

import React from "react";
import { TrendingUp, CircleDollarSign, Briefcase, Zap } from "lucide-react";
import { useTemporaryDashboardIntelligence as useIntelligenceDashboard } from "@/hooks/useTemporaryDashboardIntelligence";
import { IntelligenceSkeleton } from "./intelligence-skeleton";
import { IntelligenceBriefModal } from "./intelligence-brief-modal";
import { IntelligenceCard, TopItem } from "@/types/intelligence";
import {
  extractMarketSignals,
  extractDealIntelligence,
  extractPortfolioPulse,
  generateExecutiveBrief,
  countSignalsByType
} from "@/utils/intelligence-transformer";

export const ActionableIntelligenceCardsAPI = () => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<TopItem | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const { data, isLoading, isError, error } = useIntelligenceDashboard();

  // Show skeleton while loading
  if (isLoading) {
    return <IntelligenceSkeleton />;
  }

  // Show error state
  if (isError) {
    return (
      <section className="mt-16 mb-16">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">
            Failed to load intelligence data: {error?.message || 'Unknown error'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Transform API data to UI format
  const episodes = data?.episodes || [];
  const counts = countSignalsByType(episodes);
  const lastUpdated = new Date(data?.generated_at || new Date());

  const cards: IntelligenceCard[] = [
    {
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      title: "Market Signals",
      subtitle: `${counts.marketSignals} new signals today`,
      action: "View All Signals →",
      onClick: () => console.log("Viewing market signals"),
      topItems: extractMarketSignals(episodes),
      urgency: counts.marketSignals > 20 ? "high" : "normal",
      lastUpdated,
      totalCount: counts.marketSignals,
      iconStyles: {
        background: "rgba(239, 68, 68, 0.15)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        hoverBackground: "rgba(239, 68, 68, 0.25)",
        glow: "0 0 20px rgba(239, 68, 68, 0.2)"
      }
    },
    {
      icon: <CircleDollarSign className="w-5 h-5 text-white" />,
      title: "Deal Intelligence",
      subtitle: `${counts.dealIntelligence} match your thesis`,
      action: "Review Deals →",
      onClick: () => console.log("Reviewing deals"),
      topItems: extractDealIntelligence(episodes),
      urgency: extractDealIntelligence(episodes).some(item => item.urgency === "critical") ? "critical" : "high",
      timeSensitive: extractDealIntelligence(episodes).some(item => item.urgency === "critical") ? {
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        daysRemaining: 1,
        isExpiring: true
      } : undefined,
      lastUpdated,
      totalCount: counts.dealIntelligence,
      iconStyles: {
        background: "rgba(34, 197, 94, 0.15)",
        border: "1px solid rgba(34, 197, 94, 0.3)",
        hoverBackground: "rgba(34, 197, 94, 0.25)",
        glow: "0 0 20px rgba(34, 197, 94, 0.2)"
      }
    },
    {
      icon: <Briefcase className="w-5 h-5 text-white" />,
      title: "Portfolio Pulse",
      subtitle: `${counts.portfolioPulse} mentions this week`,
      action: "View All Mentions →",
      onClick: () => console.log("Viewing portfolio mentions"),
      topItems: extractPortfolioPulse(episodes),
      urgency: extractPortfolioPulse(episodes).some(item => item.urgency === "critical") ? "high" : "normal",
      lastUpdated,
      totalCount: counts.portfolioPulse,
      iconStyles: {
        background: "rgba(139, 92, 246, 0.15)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        hoverBackground: "rgba(139, 92, 246, 0.25)",
        glow: "0 0 20px rgba(139, 92, 246, 0.2)"
      }
    },
    {
      icon: <Zap className="w-5 h-5 text-white" />,
      title: "Executive Brief",
      subtitle: `${counts.executiveBrief} min intelligence digest`,
      action: "Read Brief →",
      onClick: () => console.log("Reading executive brief"),
      topItems: generateExecutiveBrief(episodes),
      urgency: "normal",
      lastUpdated,
      totalCount: counts.executiveBrief,
      iconStyles: {
        background: "rgba(251, 191, 36, 0.15)",
        border: "1px solid rgba(251, 191, 36, 0.3)",
        hoverBackground: "rgba(251, 191, 36, 0.25)",
        glow: "0 0 20px rgba(251, 191, 36, 0.2)"
      }
    }
  ];

  const getUrgencyDot = (urgency: "critical" | "high" | "normal") => {
    switch (urgency) {
      case "critical": 
        return (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        );
      case "high": 
        return <span className="inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>;
      case "normal": 
        return <span className="inline-flex rounded-full h-2 w-2 bg-green-500"></span>;
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getExpiringCount = (items: typeof cards[0]['topItems']) => {
    return items.filter(item => item.urgency === "critical").length;
  };

  return (
    <section className="mt-16 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
        {cards.map((card, index) => {
          const expiringCount = getExpiringCount(card.topItems);
          const remainingItems = card.totalCount - card.topItems.length;
          
          return (
            <div
              key={index}
              onClick={card.onClick}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(139,92,246,0.12)] hover:border-purple-500/40"
              style={{
                backgroundColor: "rgba(26, 26, 28, 0.98)",
                backgroundImage: hoveredIndex === index 
                  ? `linear-gradient(135deg, ${card.iconStyles.background}, rgba(139, 92, 246, 0.02))` 
                  : "linear-gradient(135deg, rgba(139, 92, 246, 0.02), rgba(139, 92, 246, 0.01))",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                padding: "28px",
                height: "auto",
                minHeight: "420px",
                display: "flex",
                flexDirection: "column",
                boxShadow: hoveredIndex === index ? card.iconStyles.glow : "none"
              }}
            >
              {/* Card glow effect on hover */}
              {hoveredIndex === index && (
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-purple-600/20 rounded-[20px] blur-md -z-10" />
              )}
              <div className="flex flex-col h-full">
                {/* Header Section */}
                <div className="pb-4 border-b border-gray-800/50">
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
                      {card.icon}
                    </div>
                    
                    {/* Title */}
                    <div className="flex-1">
                      <h3 className="text-white text-xl font-semibold tracking-tight">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Metric Section - Enhanced prominence */}
                <div className="py-4 px-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {card.totalCount}
                    </span>
                    <span className="text-sm text-gray-400">{card.subtitle.split(' ').slice(1).join(' ')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-green-500"></span>
                    Updated {getRelativeTime(card.lastUpdated)}
                  </p>
                </div>

                {/* Time Sensitive Alert - Enhanced visibility */}
                {card.timeSensitive && card.timeSensitive.isExpiring && (
                  <div className="relative mb-4 mx-1">
                    <div className="absolute inset-0 bg-red-500/20 blur-xl"></div>
                    <div className="relative bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/40 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-red-300 font-medium flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                        </span>
                        {expiringCount} urgent {expiringCount === 1 ? 'item expires' : 'items expire'} today
                      </p>
                    </div>
                  </div>
                )}

                {/* Top Items Section - Enhanced with better visual separation */}
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-1">Top Intelligence</p>
                  <div className="space-y-2.5">
                    {card.topItems.length > 0 ? card.topItems.map((item, idx) => (
                      <div key={item.id} className="group/item relative">
                        <div 
                          className="flex items-start gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-white/[0.02] cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.episodeId) {
                              setSelectedItem(item);
                              setModalOpen(true);
                            }
                          }}
                        >
                          <span className="mt-0.5 flex-shrink-0">{getUrgencyDot(item.urgency)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium leading-tight truncate group-hover/item:text-purple-300 transition-colors">
                              {item.title}
                            </p>
                            <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
                              {item.description}
                            </p>
                            {item.metadata && (
                              <div className="flex items-center gap-2 mt-1 text-[10px]">
                                {item.metadata.source && (
                                  <span className="text-gray-500">{item.metadata.source}</span>
                                )}
                                {item.metadata.value && (
                                  <span className="text-emerald-400 font-medium">{item.metadata.value}</span>
                                )}
                                {item.metadata.change && (
                                  <span className={`font-medium ${item.metadata.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {item.metadata.change}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {idx < card.topItems.length - 1 && (
                          <div className="absolute bottom-0 left-11 right-2 h-px bg-gray-800/30" />
                        )}
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No {card.title.toLowerCase()} available yet
                      </div>
                    )}
                  </div>
                  
                  {/* More items indicator */}
                  {remainingItems > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800/30">
                      <p className="text-[11px] text-gray-500 text-center group-hover:text-gray-400 transition-colors">
                        +{remainingItems} more {remainingItems === 1 ? 'item' : 'items'} available
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Action Footer - Enhanced CTA */}
                <div className="mt-auto pt-4 border-t border-gray-800/50">
                  <button className="w-full group/cta flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-purple-500/10 hover:border-purple-500/30 border border-transparent">
                    <span className="text-sm font-medium text-purple-400 group-hover/cta:text-purple-300">
                      {card.action.replace(' →', '')}
                    </span>
                    <span className="text-purple-400 group-hover/cta:translate-x-1 transition-transform duration-200">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Divider line with gradient */}
      <div 
        className="mt-16"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2) 20%, rgba(139, 92, 246, 0.2) 80%, transparent)"
        }}
      />
      
      {/* Intelligence Brief Modal */}
      <IntelligenceBriefModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedItem(null);
        }}
        episodeId={selectedItem?.episodeId}
        initialData={selectedItem || undefined}
      />
    </section>
  );
};