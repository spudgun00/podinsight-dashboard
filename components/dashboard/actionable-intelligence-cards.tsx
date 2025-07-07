"use client"

import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { TrendingUp, CircleDollarSign, Briefcase, FileText } from "lucide-react"
import { ReactNode, useState, useEffect, useRef, useCallback } from "react"

// Types for rich preview items
type UrgencyLevel = 'critical' | 'high' | 'normal'
type VisualPriority = 1 | 2 | 3

// New rich preview item structure
interface RichPreviewItem {
  label: string
  value: string
  urgency: UrgencyLevel
  metadata?: {
    source?: string
    timestamp?: Date
    trend?: string
  }
}

interface TimeSensitiveData {
  deadline: string
  consequence: string
}

// Transform each card into a mini-dashboard
interface IntelligenceCard {
  // Core Info
  title: string
  primaryMetric: string
  primaryMetricContext: string
  
  // Rich Preview
  topItems: RichPreviewItem[]
  
  // Actionable Context
  timeSensitive?: TimeSensitiveData
  
  // Visual Hierarchy
  visualPriority: VisualPriority
  
  // Additional data for rendering
  icon: ReactNode
  actionText: string
  urgency: UrgencyLevel
  lastUpdated: Date
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
  }
  onClick: () => void
}

interface ActionableCardProps extends IntelligenceCard {}

// Get container class based on visual priority
const getContainerClass = (priority: VisualPriority) => {
  const base = "bg-black/40 backdrop-blur-xl border rounded-xl transition-all duration-300"
  // Using consistent padding for all cards to maintain uniform height
  return `${base} border-purple-500/30 p-6 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]`
}

// Card container styling with enhanced visual effects
const cardStyles = {
  iconWrapper: "w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300",
  iconGlow: "absolute inset-0 bg-purple-500/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
  icon: "w-6 h-6 text-purple-400 relative z-10 group-hover:text-purple-300 transition-colors duration-300",
  title: "text-white font-semibold text-lg mb-1",
  subtitle: "text-gray-400 text-sm mb-4",
  action: "text-purple-400 text-sm font-medium hover:text-purple-300 transition-all duration-300 flex items-center gap-1 hover:underline decoration-purple-400/50 underline-offset-2",
  section: "pb-4 mb-4 border-b border-purple-500/10",
  metric: "text-white text-4xl font-bold tracking-tight",
  metricLabel: "text-gray-400 text-sm font-normal ml-2",
  trendIndicator: "inline-flex items-center text-sm font-medium ml-2",
  trendUp: "text-emerald-400",
  trendDown: "text-red-400",
  topItemsHeader: "text-gray-400 text-xs uppercase tracking-wider mb-3 font-semibold border-b border-purple-500/10 pb-2",
  topItem: "text-sm mb-3 last:mb-0",
  topItemTitle: "text-gray-300 leading-tight text-sm",
  topItemMeta: "text-gray-500 text-xs ml-3 mt-0.5",
  // Rich preview item styles
  richItem: "flex justify-between items-start mb-3 last:mb-0",
  richItemLabel: "text-gray-400 text-sm",
  richItemValue: "text-white text-sm font-medium ml-2 text-right flex-1",
  richItemUrgencyDot: "inline-block w-2 h-2 rounded-full ml-2",
  timeAlert: "mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2",
  timeAlertText: "text-red-400 text-xs font-medium",
  moreItems: "text-purple-400 text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
  newBadge: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 ml-2",
  criticalPulse: "absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]",
  highIndicator: "absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(251,146,60,0.4)]",
  emptyState: "text-gray-500 text-sm text-center py-8",
  mobileExpanded: "fixed inset-x-4 bottom-4 z-50 max-h-[80vh] overflow-y-auto"
};

// Helper function to get urgency dot color
const getUrgencyDot = (urgency: UrgencyLevel) => {
  switch (urgency) {
    case 'critical': return '🔴'
    case 'high': return '🟡'
    case 'normal': return '🟢'
  }
}

// Helper function to get urgency color class
const getUrgencyColorClass = (urgency: UrgencyLevel) => {
  switch (urgency) {
    case 'critical': return 'bg-red-500'
    case 'high': return 'bg-orange-500'
    case 'normal': return 'bg-green-500'
  }
}

// Helper function to format time ago
const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Helper function to format time period
const getTimePeriod = (lastUpdated: Date) => {
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60))
  if (diffHours < 24) return 'Last 24h'
  if (diffHours < 48) return 'Last 48h'
  if (diffHours < 168) return 'This week'
  return 'This month'
}

// Helper function to check if item is new
const isNew = (timestamp?: Date) => {
  if (!timestamp) return false
  const hoursDiff = (new Date().getTime() - timestamp.getTime()) / (1000 * 60 * 60)
  return hoursDiff < 2
}

// Custom hook for count-up animation
const useCountUp = (end: number, duration: number = 1000) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration])
  
  return count
}

// Haptic feedback helper
const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

// Custom hook for responsive behavior
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])
  
  return { isMobile, isTablet }
}

// Custom hook for intersection observer
const useIntersectionObserver = (ref: React.RefObject<HTMLElement>, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, {
      threshold: 0.1,
      ...options
    })
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref, options])
  
  return isIntersecting
}

const ActionableCard = ({ 
  icon, 
  title, 
  primaryMetric,
  primaryMetricContext, 
  actionText, 
  onClick,
  topItems,
  urgency,
  timeSensitive,
  lastUpdated,
  visualPriority,
  trend
}: ActionableCardProps) => {
  const { isMobile, isTablet } = useResponsive();
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  
  // Swipe handling
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  
  // Adjust items shown based on device
  const getItemsToShow = () => {
    if (isMobile) return 2;
    return 3; // Show 3 items for all cards on desktop
  };
  const itemsToShow = getItemsToShow();
  const remainingCount = topItems.length > itemsToShow ? topItems.length - itemsToShow : 0;
  const animatedMetric = useCountUp(parseInt(primaryMetric) || 0, 1200);
  
  // Lazy load content when visible
  useEffect(() => {
    if (isVisible && !contentLoaded) {
      setContentLoaded(true);
    }
  }, [isVisible, contentLoaded]);
  
  const handleClick = useCallback(() => {
    triggerHaptic();
    if (isMobile) {
      setIsExpanded(!isExpanded);
    } else {
      if (title === 'Executive Brief') {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2000);
      }
      onClick();
    }
  }, [isMobile, isExpanded, title, onClick]);
  
  const handleSwipeEnd = useCallback((_event: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      setIsExpanded(!isExpanded);
    }
  }, [isExpanded]);
  
  // Empty state check
  const isEmpty = !topItems || topItems.length === 0;
  
  return (
    <>
      <motion.div
        ref={cardRef}
        className={`group relative cursor-pointer h-full ${getContainerClass(visualPriority)} ${isExpanded && isMobile ? 'z-40' : ''}`}
        style={{ 
          opacity: opacity,
          x
        }}
        onClick={handleClick}
        whileHover={!isMobile ? { 
          scale: 1.02,
          y: -2,
          transition: { duration: 0.2, ease: "easeOut" }
        } : {}}
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleSwipeEnd}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.4 }}
      >
        {/* Urgency indicators */}
        {urgency === 'critical' && !isEmpty && contentLoaded && (
          <div className={cardStyles.criticalPulse} />
        )}
        {urgency === 'high' && !isEmpty && contentLoaded && (
          <div className={cardStyles.highIndicator} />
        )}
      
      <div className="h-full flex flex-col justify-between">
        {/* Header Section with Icon */}
        <div>
          <div className={cardStyles.iconWrapper}>
            <div className={cardStyles.iconGlow} />
            <div className={cardStyles.icon}>{icon}</div>
          </div>
          <h3 className={cardStyles.title}>
            {title === 'Market Signals' && '🚨 '}
            {title === 'Deal Intelligence' && '💎 '}
            {title === 'Portfolio Pulse' && '📊 '}
            {title === 'Executive Brief' && '📋 '}
            {title}
          </h3>
          <p className={cardStyles.subtitle}>{primaryMetricContext}</p>
          
          {!isEmpty && (
            <>
              {/* Metric Section */}
              <div className={cardStyles.section}>
                <p className={cardStyles.metric}>
                  {isNaN(parseInt(primaryMetric)) ? primaryMetric : animatedMetric}
                  <span className={cardStyles.metricLabel}>
                    {primaryMetricContext}
                  </span>
                  {trend && (
                    <span className={`${cardStyles.trendIndicator} ${
                      trend.direction === 'up' ? cardStyles.trendUp : 
                      trend.direction === 'down' ? cardStyles.trendDown : 
                      'text-gray-400'
                    }`}>
                      {trend.direction === 'up' && '↑'}
                      {trend.direction === 'down' && '↓'}
                      {trend.direction !== 'neutral' && ` ${trend.percentage}%`}
                    </span>
                  )}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {visualPriority === 1 ? 'Last 24h' : getTimePeriod(lastUpdated)}
                </p>
              </div>
            
              {/* Time Sensitive Alert */}
              {timeSensitive && (
                <motion.div 
                  className={cardStyles.timeAlert}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className={cardStyles.timeAlertText}>
                    {title === 'Market Signals' && '⚡ '}
                    {title === 'Deal Intelligence' && '📅 '}
                    {title === 'Portfolio Pulse' && '🔔 '}
                    {title === 'Executive Brief' && '✨ '}
                    {timeSensitive.deadline}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeSensitive.consequence}
                  </p>
                </motion.div>
              )}
              
              {/* Preview List Section */}
              <div className="flex-1">
                <p className={cardStyles.topItemsHeader}>
                  {title === 'Market Signals' && 'TOP SIGNALS'}
                  {title === 'Deal Intelligence' && 'IMMEDIATE ATTENTION'}
                  {title === 'Portfolio Pulse' && 'CRITICAL UPDATES'}
                  {title === 'Executive Brief' && "TODAY'S ESSENTIALS"}
                </p>
                {contentLoaded ? (
                  <AnimatePresence mode="wait">
                    <div>
                      {topItems.slice(0, itemsToShow).map((item, index) => (
                        <motion.div 
                          key={`item-${index}`} 
                          className={cardStyles.richItem}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className={cardStyles.richItemLabel}>
                            {item.label}
                          </span>
                          <span className={cardStyles.richItemValue}>
                            {item.value}
                            <span 
                              className={`${cardStyles.richItemUrgencyDot} ${getUrgencyColorClass(item.urgency)}`}
                            />
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                ) : (
                  <div className="space-y-2">
                    {[...Array(itemsToShow)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                )}
                {remainingCount > 0 && (
                  <p className={cardStyles.moreItems}>
                    +{remainingCount} more {remainingCount === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
            </>
          )}
          
          {isEmpty && (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className={cardStyles.emptyState}>
                <p className="mb-2">No new {title.toLowerCase()} yet</p>
                <p className="text-xs">
                  {title === 'Market Signals' && 'Check back soon for trending topics'}
                  {title === 'Deal Intelligence' && 'New opportunities appear daily'}
                  {title === 'Portfolio Pulse' && 'Your portfolio companies are quiet today'}
                  {title === 'Executive Brief' && 'Generate your first brief to get started'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Footer */}
        <div className="mt-auto">
          <p className={cardStyles.action}>
            {isGenerating ? 'Generating...' : 
             isMobile && !isExpanded ? 'Tap to expand' : actionText}
          </p>
        </div>
      </div>
    </motion.div>
    
    {/* Mobile Bottom Sheet */}
    <AnimatePresence>
      {isExpanded && isMobile && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-black/90 backdrop-blur-xl border-t border-purple-500/20 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                setIsExpanded(false);
              }
            }}
          >
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-4">{title}</h3>
            <div className="space-y-3">
              {topItems.map((item, index) => (
                <div key={`mobile-item-${index}`} className="bg-purple-500/5 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm mb-1">{item.label}</p>
                      <p className="text-white font-medium">{item.value}</p>
                      {item.metadata && (
                        <div className="mt-2 text-xs text-gray-500">
                          {item.metadata.source && <span>{item.metadata.source}</span>}
                          {item.metadata.source && item.metadata.timestamp && <span> · </span>}
                          {item.metadata.timestamp && <span>{formatTimeAgo(item.metadata.timestamp)}</span>}
                          {item.metadata.trend && <span className="block mt-1">{item.metadata.trend}</span>}
                        </div>
                      )}
                    </div>
                    <span 
                      className={`${cardStyles.richItemUrgencyDot} ${getUrgencyColorClass(item.urgency)} ml-3`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-6 bg-purple-500 text-white rounded-lg py-3 font-medium"
              onClick={() => {
                setIsExpanded(false);
                onClick();
              }}
            >
              {actionText}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  )
}

export const ActionableIntelligenceCards = () => {
  // Mock data - in production this would come from your API
  const cards: IntelligenceCard[] = [
    {
      icon: <TrendingUp />,
      title: "Market Signals",
      primaryMetric: "23",
      primaryMetricContext: "new opportunities",
      actionText: "Explore All Signals →",
      topItems: [
        {
          label: "AI Agents startup raising $50M",
          value: "3 podcasts",
          urgency: 'critical',
          metadata: {
            source: "Multiple Sources",
            timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
            trend: "High VC interest"
          }
        },
        {
          label: "Sequoia pulling back from crypto",
          value: "All-In",
          urgency: 'high',
          metadata: {
            source: "All-In Pod",
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            trend: "Major strategy shift"
          }
        },
        {
          label: "New B2B SaaS roll-up fund forming",
          value: "Confirmed",
          urgency: 'normal',
          metadata: {
            source: "20VC",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            trend: "Market consolidation"
          }
        }
      ],
      urgency: 'high' as UrgencyLevel,
      timeSensitive: {
        deadline: "Action required: 2 expire today",
        consequence: "Miss critical investment opportunities"
      },
      visualPriority: 2,
      lastUpdated: new Date(),
      trend: {
        direction: 'up',
        percentage: 18
      },
      onClick: () => {
        console.log("Opening Market Signals view...");
        // In production: router.push('/signals?filter=trending')
      }
    },
    {
      icon: <CircleDollarSign />,
      title: "Deal Intelligence",
      primaryMetric: "8",
      primaryMetricContext: "fundable companies",
      actionText: "View Deal Pipeline →",
      topItems: [
        {
          label: "Acme.ai - $5M seed",
          value: "closing next week",
          urgency: 'critical',
          metadata: {
            source: "All-In Pod",
            timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
            trend: "Strong founder, AI infrastructure"
          }
        },
        {
          label: "TechCo mentioned by 3 top VCs",
          value: "today",
          urgency: 'high',
          metadata: {
            source: "Multiple Sources",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            trend: "Building momentum"
          }
        },
        {
          label: "DataStartup - Your thesis match",
          value: "94%",
          urgency: 'high',
          metadata: {
            source: "This Week in Startups",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            trend: "Perfect fit for portfolio"
          }
        }
      ],
      urgency: 'critical' as UrgencyLevel,
      timeSensitive: {
        deadline: "Next 48h: 3 deals closing",
        consequence: "Limited allocation remaining"
      },
      visualPriority: 2,
      lastUpdated: new Date(),
      trend: {
        direction: 'up',
        percentage: 32
      },
      onClick: () => {
        console.log("Opening Deal Pipeline...");
        // In production: router.push('/deals?urgency=critical')
      }
    },
    {
      icon: <Briefcase />,
      title: "Portfolio Pulse",
      primaryMetric: "14",
      primaryMetricContext: "mentions",
      actionText: "Review Portfolio →",
      topItems: [
        {
          label: "PortCo A mentioned on All-In",
          value: "negative ⚠️",
          urgency: 'critical',
          metadata: {
            source: "All-In Pod",
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            trend: "Concerns about burn rate"
          }
        },
        {
          label: "PortCo B's competitor raised",
          value: "$100M",
          urgency: 'high',
          metadata: {
            source: "20VC",
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            trend: "Market heating up"
          }
        },
        {
          label: "PortCo C featured in 20VC",
          value: "positive ✓",
          urgency: 'normal',
          metadata: {
            source: "20VC",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            trend: "Strong execution praised"
          }
        }
      ],
      urgency: 'high' as UrgencyLevel,
      timeSensitive: {
        deadline: "Alert: Sentiment shift detected",
        consequence: "3 need immediate attention"
      },
      visualPriority: 2,
      lastUpdated: new Date(),
      onClick: () => {
        console.log("Opening Portfolio Mentions...");
        // In production: router.push('/portfolio/mentions')
      }
    },
    {
      icon: <FileText />,
      title: "Executive Brief",
      primaryMetric: "Ready",
      primaryMetricContext: "5 min read",
      actionText: "Read Full Brief →",
      topItems: [
        {
          label: "Market shift: AI infrastructure",
          value: "→ Apps",
          urgency: 'high',
          metadata: {
            trend: "Major pivot in VC focus"
          }
        },
        {
          label: "3 new unicorns in your sectors",
          value: "today",
          urgency: 'high',
          metadata: {
            trend: "Fintech, AI, Climate"
          }
        },
        {
          label: "Must-know for partner meeting",
          value: "2pm",
          urgency: 'critical',
          metadata: {
            trend: "Competitive landscape update"
          }
        }
      ],
      urgency: 'normal' as UrgencyLevel,
      timeSensitive: {
        deadline: "Updated 2h ago",
        consequence: "Personalized for your interests"
      },
      visualPriority: 2,
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
      onClick: () => {
        console.log("Generating Executive Brief...");
        // In production: This would trigger AI synthesis
        // setGeneratingBrief(true) -> API call -> Show modal
      }
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ActionableCard {...card} />
        </motion.div>
      ))}
    </div>
  )
}