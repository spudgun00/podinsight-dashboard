export type SignalType = 'red_hot' | 'high_value' | 'market_intel' | 'portfolio_mention'

export interface Episode {
  id: string
  title: string
  abbreviation: string
  signal: SignalType
  score: number
  timeAgo: string
  duration: string
  intel: string[]
  podcast: string
  publishedAt: Date
  audioUrl?: string
  description?: string
}

// Mock episodes based on Sprint 4 requirements - 5 core podcasts
export const mockEpisodes: Episode[] = [
  {
    id: '1',
    title: 'OpenAI\'s New $150B Valuation & AI Agent Revolution',
    abbreviation: 'AIL',
    signal: 'red_hot',
    score: 95,
    timeAgo: '2h ago',
    duration: '1h 23m',
    intel: [
      'OpenAI raising at $150B valuation, 2x from 6 months ago',
      'Sequoia leading $500M round in competing AI agent startup',
      'Bessemer seeing 10x increase in AI agent deal flow'
    ],
    podcast: 'All-In',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: 'Breaking discussion on OpenAI\'s massive new round and the explosion in AI agent investments'
  },
  {
    id: '2',
    title: 'Harry Stebbings: Why 90% of Seed Funds Will Die',
    abbreviation: '20VC',
    signal: 'high_value',
    score: 88,
    timeAgo: '5h ago',
    duration: '45m',
    intel: [
      'Seed fund economics broken below $50M AUM',
      'Top 10 seed funds capturing 80% of returns',
      'New fund formation down 60% YoY'
    ],
    podcast: '20VC',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    description: 'Harry\'s contrarian take on the seed funding landscape consolidation'
  },
  {
    id: '3',
    title: 'Acquired: The Untold Story of Stripe\'s Early Days',
    abbreviation: 'ACQ',
    signal: 'market_intel',
    score: 75,
    timeAgo: '8h ago',
    duration: '2h 15m',
    intel: [
      'Stripe\'s revenue now exceeds $14B annually',
      'Collison brothers turned down $5B acquisition in 2016',
      'Payment infrastructure TAM expanding to $10T by 2030'
    ],
    podcast: 'Acquired',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: 'Europe\'s Hidden Unicorns: 5 Companies to Watch',
    abbreviation: 'EVC',
    signal: 'high_value',
    score: 82,
    timeAgo: '12h ago',
    duration: '52m',
    intel: [
      'Berlin fintech Raisin raising €400M at €5B valuation',
      'Index Ventures doubling down on European B2B SaaS',
      'EU regulatory changes creating new opportunities'
    ],
    podcast: 'European VC',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Patrick O\'Shaughnessy: The Future of Capital Allocation',
    abbreviation: 'ILB',
    signal: 'portfolio_mention',
    score: 91,
    timeAgo: '1d ago',
    duration: '1h 18m',
    intel: [
      'Portfolio company Figma mentioned as category leader',
      'Discussion of our Series B in Vercel',
      'Positive outlook on dev tools investments'
    ],
    podcast: 'Invest Like the Best',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: '6',
    title: 'Emergency Pod: SVB Fallout & Banking Crisis 2.0',
    abbreviation: 'AIL',
    signal: 'red_hot',
    score: 98,
    timeAgo: '1d ago',
    duration: '58m',
    intel: [
      'Major VC funds pulling $2B+ from regional banks',
      'Flight to quality benefiting JP Morgan, BofA',
      'Startup runway concerns driving down valuations'
    ],
    podcast: 'All-In',
    publishedAt: new Date(Date.now() - 26 * 60 * 60 * 1000)
  },
  {
    id: '7',
    title: 'Benchmark\'s Sarah Tavel on Marketplace Dynamics',
    abbreviation: '20VC',
    signal: 'market_intel',
    score: 68,
    timeAgo: '2d ago',
    duration: '1h 5m',
    intel: [
      'Marketplaces need 10x better experience to win',
      'Supply acquisition costs killing most startups',
      'Winner-take-all dynamics accelerating'
    ],
    podcast: '20VC',
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
  },
  {
    id: '8',
    title: 'The $100B Enterprise AI Opportunity',
    abbreviation: 'ILB',
    signal: 'high_value',
    score: 85,
    timeAgo: '2d ago',
    duration: '1h 32m',
    intel: [
      'Enterprise AI spend to reach $100B by 2025',
      'Accel leading $200M round in AI procurement platform',
      'CIOs budgeting 25% of IT spend for AI initiatives'
    ],
    podcast: 'Invest Like the Best',
    publishedAt: new Date(Date.now() - 50 * 60 * 60 * 1000)
  }
]

// Helper functions for filtering and sorting
export const getEpisodesBySignal = (signal: SignalType): Episode[] => {
  return mockEpisodes.filter(ep => ep.signal === signal)
}

export const getTopEpisodes = (limit: number = 6): Episode[] => {
  return [...mockEpisodes]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export const getRecentEpisodes = (hoursAgo: number = 24): Episode[] => {
  const cutoffTime = Date.now() - (hoursAgo * 60 * 60 * 1000)
  return mockEpisodes.filter(ep => ep.publishedAt.getTime() > cutoffTime)
}