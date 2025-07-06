export type SignalType = 'INVESTABLE_SIGNAL' | 'COMPETITIVE_INTEL' | 'PORTFOLIO_MENTION'

export type TagType = 'portfolio_match' | 'trending_topic' | 'multiple_mentions' | 'new_signal'

export interface NewEpisode {
  id: string
  podcastName: string
  episodeTitle: string
  score: number
  signalType: SignalType
  intel: string[]
  timestamp: string
  durationAgo: string
  tags?: TagType[]
  // Additional fields for brief modal
  abbreviation?: string
  signal?: string
  timeAgo?: string
  duration?: string
  podcast?: string
  publishedAt?: Date
}

export const newMockEpisodes: NewEpisode[] = [
  {
    id: '1',
    podcastName: 'ALL-IN PODCAST',
    episodeTitle: 'Emergency Pod - Market Shifts & AI Valuation Bubble',
    score: 98,
    signalType: 'INVESTABLE_SIGNAL',
    intel: [
      'Sequoia closing $8B fund - "largest ever"',
      'Defense tech seeing 10x valuations YoY',
      'AI infrastructure "massively overbuilt"'
    ],
    timestamp: '03:45',
    durationAgo: '2h ago',
    tags: ['new_signal', 'trending_topic'],
    abbreviation: 'AI',
    signal: 'red_hot',
    timeAgo: '2h ago',
    duration: '47m',
    podcast: 'All-In',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    podcastName: '20VC',
    episodeTitle: 'Harry Stebbings: Why 90% of Seed Funds Will Die',
    score: 92,
    signalType: 'COMPETITIVE_INTEL',
    intel: [
      'a16z "quietly winding down crypto fund"',
      'Benchmark "aggressively" in AI agents',
      'Tiger Global "back with vengeance"'
    ],
    timestamp: '08:12',
    durationAgo: '5h ago',
    tags: ['multiple_mentions'],
    abbreviation: '20',
    signal: 'high_value',
    timeAgo: '5h ago',
    duration: '45m',
    podcast: '20VC',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    id: '3',
    podcastName: 'THE INFORMATION',
    episodeTitle: 'Inside the Collapse of Tiger Global\'s Growth Fund',
    score: 89,
    signalType: 'PORTFOLIO_MENTION',
    intel: [
      'Acme.ai mentioned as "category leader"',
      'Vercel facing "intense competition"',
      'Linear possible "acquisition target"'
    ],
    timestamp: '41:23',
    durationAgo: '8h ago',
    tags: ['portfolio_match', 'multiple_mentions'],
    abbreviation: 'TI',
    signal: 'portfolio_mention',
    timeAgo: '8h ago',
    duration: '52m',
    podcast: 'The Information',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    id: '4',
    podcastName: 'ACQUIRED',
    episodeTitle: 'The Untold Story of Stripe\'s Early Days',
    score: 88,
    signalType: 'INVESTABLE_SIGNAL',
    intel: [
      'Stripe exploring secondary at $70B',
      'Fintech infrastructure "next gold rush"',
      'Payment rails disruption imminent'
    ],
    timestamp: '15:30',
    durationAgo: '12h ago',
    abbreviation: 'ACQ',
    signal: 'high_value',
    timeAgo: '12h ago',
    duration: '2h 15m',
    podcast: 'Acquired',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: '5',
    podcastName: 'INVEST LIKE THE BEST',
    episodeTitle: 'Patrick O\'Shaughnessy: The Future of Asset Management',
    score: 85,
    signalType: 'COMPETITIVE_INTEL',
    intel: [
      'BlackRock launching $2B venture arm',
      'Traditional PE "flooding seed stage"',
      'LP appetite "dramatically shifting"'
    ],
    timestamp: '22:45',
    durationAgo: '1d ago',
    abbreviation: 'IB',
    signal: 'market_intel',
    timeAgo: '1d ago',
    duration: '1h 30m',
    podcast: 'Invest Like the Best',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: '6',
    podcastName: 'MY FIRST MILLION',
    episodeTitle: 'Sam Parr: How to Build a $100M Media Empire',
    score: 82,
    signalType: 'PORTFOLIO_MENTION',
    intel: [
      'Figma praised for "perfect PLG"',
      'Notion "category-defining product"',
      'Beehiiv growth "absolutely insane"'
    ],
    timestamp: '37:21',
    durationAgo: '1d ago',
    abbreviation: 'MFM',
    signal: 'portfolio_mention',
    timeAgo: '1d ago',
    duration: '58m',
    podcast: 'My First Million',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
]