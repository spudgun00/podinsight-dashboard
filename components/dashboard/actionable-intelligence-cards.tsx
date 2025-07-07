"use client"

import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { TrendingUp, CircleDollarSign, Briefcase, Zap } from "lucide-react"
import { ReactNode, useState, useEffect, useRef, useCallback } from "react"

// Types for rich preview items
type UrgencyLevel = 'critical' | 'high' | 'normal'

interface PreviewItem {
  id: string
  title: string
  description: string
  source?: string // e.g., "All-In Pod", "20VC"
  timestamp?: Date
  tags?: string[]
}

interface TimeSensitiveData {
  deadline?: Date
  daysRemaining?: number
  isExpiring?: boolean
}

interface CardData {
  icon: ReactNode
  title: string
  subtitle: string
  actionText: string
  topItems: PreviewItem[]
  urgency: UrgencyLevel
  timeSensitive?: TimeSensitiveData
  lastUpdated: Date
  totalCount?: number
  onClick: () => void
}

interface ActionableCardProps extends CardData {}

// Card container styling
const cardStyles = {
  container: "bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all duration-300",
  iconWrapper: "w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4",
  icon: "w-6 h-6 text-purple-400",
  title: "text-white font-semibold text-lg mb-1",
  subtitle: "text-gray-400 text-sm mb-4",
  action: "text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors flex items-center gap-1",
  section: "pb-4 mb-4 border-b border-purple-500/10",
  metric: "text-white text-3xl font-bold",
  metricLabel: "text-gray-400 text-sm font-normal ml-2",
  topItemsHeader: "text-gray-500 text-xs uppercase tracking-wider mb-3 font-medium",
  topItem: "text-sm mb-3 last:mb-0",
  topItemTitle: "text-gray-300 leading-tight text-sm",
  topItemMeta: "text-gray-500 text-xs ml-3 mt-0.5",
  timeAlert: "mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2",
  timeAlertText: "text-red-400 text-xs font-medium",
  moreItems: "text-purple-400 text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
  newBadge: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 ml-2",
  criticalPulse: "absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse",
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
  subtitle, 
  actionText, 
  onClick,
  topItems,
  urgency,
  timeSensitive,
  lastUpdated,
  totalCount
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
  const itemsToShow = isMobile ? 2 : 3;
  const remainingCount = totalCount && totalCount > itemsToShow ? totalCount - itemsToShow : 0;
  const animatedCount = useCountUp(totalCount || topItems.length, 1200);
  
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
  
  const handleSwipeEnd = useCallback((event: any, info: any) => {
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
        className={`group relative cursor-pointer h-full ${cardStyles.container} ${isExpanded && isMobile ? 'z-40' : ''}`}
        style={{ 
          opacity: opacity,
          x
        }}
        onClick={handleClick}
        whileHover={!isMobile ? { 
          y: -4,
          transition: { duration: 0.2 }
        } : {}}
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleSwipeEnd}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.4 }}
      >
        {/* Critical pulse indicator */}
        {urgency === 'critical' && !isEmpty && contentLoaded && (
          <div className={cardStyles.criticalPulse} />
        )}
      
      <div className="h-full flex flex-col justify-between">
        {/* Header Section with Icon */}
        <div>
          <div className={cardStyles.iconWrapper}>
            <div className={cardStyles.icon}>{icon}</div>
          </div>
          <h3 className={cardStyles.title}>{title}</h3>
          <p className={cardStyles.subtitle}>{subtitle}</p>
          
          {!isEmpty && (
            <>
              {/* Metric Section */}
              <div className={cardStyles.section}>
                <p className={cardStyles.metric}>
                  {animatedCount}
                  <span className={cardStyles.metricLabel}>
                    {title === 'Market Signals' && 'new signals'}
                    {title === 'Deal Intelligence' && 'opportunities'}
                    {title === 'Portfolio Pulse' && 'mentions'}
                    {title === 'Executive Brief' && 'key insights'}
                  </span>
                </p>
                <p className="text-gray-500 text-xs mt-1">{getTimePeriod(lastUpdated)}</p>
              </div>
            
              {/* Time Sensitive Alert with countdown */}
              {timeSensitive && timeSensitive.isExpiring && (
                <motion.div 
                  className={cardStyles.timeAlert}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className={cardStyles.timeAlertText}>
                    ⚡ {timeSensitive.daysRemaining} {timeSensitive.daysRemaining === 1 ? 'day' : 'days'} until deadline
                  </p>
                </motion.div>
              )}
              
              {/* Preview List Section */}
              <div className="flex-1">
                <p className={cardStyles.topItemsHeader}>Top Items</p>
                {contentLoaded ? (
                  <AnimatePresence mode="wait">
                    <div>
                      {topItems.slice(0, itemsToShow).map((item, index) => (
                        <motion.div 
                          key={item.id} 
                          className={cardStyles.topItem}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <p className={cardStyles.topItemTitle}>
                            • {item.title}
                            {isNew(item.timestamp) && (
                              <span className={cardStyles.newBadge}>NEW</span>
                            )}
                          </p>
                          {item.source && !isMobile && (
                            <p className={cardStyles.topItemMeta}>
                              {item.source} · {item.timestamp ? formatTimeAgo(item.timestamp) : 'recent'}
                            </p>
                          )}
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
              {topItems.map((item) => (
                <div key={item.id} className="bg-purple-500/5 rounded-lg p-4">
                  <p className="text-white mb-1">{item.title}</p>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                  {item.source && (
                    <p className="text-gray-500 text-xs mt-2">
                      {item.source} · {item.timestamp ? formatTimeAgo(item.timestamp) : 'recent'}
                    </p>
                  )}
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
  const cards: CardData[] = [
    {
      icon: <TrendingUp />,
      title: "Market Signals",
      subtitle: "Track emerging trends across VC podcasts",
      actionText: "View All Signals →",
      topItems: [
        {
          id: "sig-1",
          title: "AI Agents gaining momentum",
          description: "300% increase in mentions across VC podcasts this month",
          source: "All-In Pod",
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago - NEW!
          tags: ["AI", "Emerging Tech"]
        },
        {
          id: "sig-2",
          title: "B2B SaaS valuations dropping",
          description: "Multiple VCs discussing 40% valuation corrections",
          source: "20VC",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          tags: ["SaaS", "Valuations"]
        },
        {
          id: "sig-3",
          title: "Defense tech investment surge",
          description: "Anduril's success sparking new defense startup interest",
          source: "Invest Like the Best",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          tags: ["Defense", "DeepTech"]
        }
      ],
      urgency: 'high' as UrgencyLevel,
      lastUpdated: new Date(),
      totalCount: 12,
      onClick: () => {
        console.log("Opening Market Signals view...");
        // In production: router.push('/signals?filter=trending')
      }
    },
    {
      icon: <CircleDollarSign />,
      title: "Deal Intelligence",
      subtitle: "Investment opportunities requiring action",
      actionText: "Explore Deals →",
      topItems: [
        {
          id: "deal-1",
          title: "Stealth AI startup raising $50M Series B",
          description: "Ex-OpenAI team, Sequoia leading, closing in 2 weeks",
          source: "All-In Pod",
          timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000), // 30 minutes ago - NEW!
          tags: ["AI", "Series B", "Sequoia"]
        },
        {
          id: "deal-2",
          title: "Fintech roll-up strategy emerging",
          description: "Multiple PE firms targeting distressed fintech assets",
          source: "20VC",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          tags: ["Fintech", "M&A"]
        },
        {
          id: "deal-3",
          title: "Climate tech Fund III announced",
          description: "Lowercarbon raising $800M for hardware-focused fund",
          source: "European VC",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          tags: ["Climate", "Fund"]
        }
      ],
      urgency: 'critical' as UrgencyLevel,
      timeSensitive: {
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        daysRemaining: 14,
        isExpiring: true
      },
      lastUpdated: new Date(),
      onClick: () => {
        console.log("Opening Deal Pipeline...");
        // In production: router.push('/deals?urgency=critical')
      }
    },
    {
      icon: <Briefcase />,
      title: "Portfolio Pulse",
      subtitle: "Monitor your investments & competitors",
      actionText: "View All Mentions →",
      topItems: [
        {
          id: "port-1",
          title: "Stripe discussed on Acquired",
          description: "Deep dive on payment infrastructure moat and expansion strategy",
          source: "Acquired",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          tags: ["Portfolio", "Payments"]
        },
        {
          id: "port-2",
          title: "Competitor launched similar feature",
          description: "Plaid announces direct bank payments, competing with your portfolio co",
          source: "All-In Pod",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          tags: ["Competition", "Alert"]
        },
        {
          id: "port-3",
          title: "Industry expert validates thesis",
          description: "Former Uber exec discussing marketplace dynamics that support your investment",
          source: "20VC",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          tags: ["Validation", "Marketplace"]
        }
      ],
      urgency: 'high' as UrgencyLevel,
      lastUpdated: new Date(),
      totalCount: 3,
      onClick: () => {
        console.log("Opening Portfolio Mentions...");
        // In production: router.push('/portfolio/mentions')
      }
    },
    {
      icon: <Zap />,
      title: "Executive Brief",
      subtitle: "AI-powered intelligence synthesis",
      actionText: "Generate Brief →",
      topItems: [
        {
          id: "brief-1",
          title: "Weekly VC sentiment: Cautiously optimistic",
          description: "Deployment picking up in AI, defense, and climate sectors",
          timestamp: new Date(),
          tags: ["Summary", "Sentiment"]
        },
        {
          id: "brief-2",
          title: "Key theme: AI infrastructure plays",
          description: "Multiple discussions on picks-and-shovels opportunities",
          timestamp: new Date(),
          tags: ["AI", "Infrastructure"]
        },
        {
          id: "brief-3",
          title: "Action required: 2 time-sensitive opportunities",
          description: "Series B closing soon, strategic partnership deadline Friday",
          timestamp: new Date(),
          tags: ["Action", "Urgent"]
        }
      ],
      urgency: 'normal' as UrgencyLevel,
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
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