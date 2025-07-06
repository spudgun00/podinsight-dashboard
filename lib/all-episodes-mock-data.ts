import type { Episode } from './mock-episode-data'

// Extended Episode interface for the AllEpisodesView
export interface ExtendedEpisode extends Episode {
  publishedDate: Date
  isSearchResult?: boolean
}

// Extended episodes for the full list view
// This includes more episodes beyond the top 8 shown in the main dashboard
export const allEpisodesData: ExtendedEpisode[] = [
  // First include all episodes from the main mock data
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
    publishedDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
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
    publishedDate: new Date(Date.now() - 5 * 60 * 60 * 1000)
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
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    publishedDate: new Date(Date.now() - 8 * 60 * 60 * 1000)
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
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    publishedDate: new Date(Date.now() - 12 * 60 * 60 * 1000)
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
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    publishedDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  // Additional episodes for the all episodes view
  {
    id: '9',
    title: 'The Breakdown: Crypto Winter or AI Spring?',
    abbreviation: 'BD',
    signal: 'market_intel',
    score: 65,
    timeAgo: '3d ago',
    duration: '38m',
    intel: [
      'Crypto VCs pivoting to AI infrastructure plays',
      'DeFi protocols seeing 80% decline in TVL',
      'Web3 talent migrating to AI startups'
    ],
    podcast: 'The Breakdown',
    publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    publishedDate: new Date(Date.now() - 72 * 60 * 60 * 1000)
  },
  {
    id: '10',
    title: 'Lenny Rachitsky: PLG is Dead, Long Live SLG',
    abbreviation: 'LP',
    signal: 'high_value',
    score: 79,
    timeAgo: '3d ago',
    duration: '1h 12m',
    intel: [
      'Enterprise sales cycles back to 18 months average',
      'PLG companies adding sales teams at Series A',
      'Retention metrics more important than growth'
    ],
    podcast: 'Lenny\'s Pod',
    publishedAt: new Date(Date.now() - 74 * 60 * 60 * 1000),
    publishedDate: new Date(Date.now() - 74 * 60 * 60 * 1000)
  },
  {
    id: '11',
    title: 'My First Million: Bootstrapping to $100M ARR',
    abbreviation: 'MFM',
    signal: 'market_intel',
    score: 58,
    timeAgo: '4d ago',
    duration: '55m',
    intel: [
      'New wave of profitable bootstrapped companies',
      'PE firms acquiring at 3-5x revenue multiples',
      'Founders choosing profitability over growth'
    ],
    podcast: 'My First Million',
    publishedAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
    publishedDate: new Date(Date.now() - 96 * 60 * 60 * 1000)
  },
  {
    id: '12',
    title: 'All-In: Fed Pivot & Startup Valuations',
    abbreviation: 'AIL',
    signal: 'high_value',
    score: 84,
    timeAgo: '5d ago',
    duration: '1h 45m',
    intel: [
      'Interest rate cuts could trigger valuation recovery',
      'Late-stage companies extending runways to 2026',
      'Series A valuations down 40% from peak'
    ],
    podcast: 'All-In',
    publishedAt: new Date(Date.now() - 120 * 60 * 60 * 1000),
    publishedDate: new Date(Date.now() - 120 * 60 * 60 * 1000)
  },
  {
    id: '13',
    title: '20VC: Founders Fund\'s Contrarian Thesis',
    abbreviation: '20VC',
    signal: 'market_intel',
    score: 71,
    timeAgo: '6d ago',
    duration: '58m',
    intel: [
      'Founders Fund avoiding AI hype, focusing on hard tech',
      'Space tech seeing unexpected investor interest',
      'Defense tech valuations up 200% YoY'
    ],
    podcast: '20VC',
    publishedAt: new Date(Date.now() - 144 * 60 * 60 * 1000),
    publishedDate: new Date(Date.now() - 144 * 60 * 60 * 1000)
  },
  {
    id: '14',
    title: 'Acquired: The Rise and Fall of WeWork',
    abbreviation: 'ACQ',
    signal: 'market_intel',
    score: 62,
    timeAgo: '7d ago',
    duration: '2h 30m',
    intel: [
      'Commercial real estate crisis creating opportunities',
      'New co-working models emerging post-WeWork',
      'SoftBank\'s vision fund strategy lessons'
    ],
    podcast: 'Acquired',
    publishedAt: new Date(Date.now() - 168 * 60 * 60 * 1000),
    publishedDate: new Date(Date.now() - 168 * 60 * 60 * 1000)
  },
  {
    id: '15',
    title: 'European VC: GDPR\'s Impact on AI Startups',
    abbreviation: 'EVC',
    signal: 'market_intel',
    score: 55,
    timeAgo: '8d ago',
    duration: '42m',
    intel: [
      'EU AI Act creating compliance moats',
      'US companies struggling with EU expansion',
      'Privacy-first AI startups gaining traction'
    ],
    podcast: 'European VC',
    publishedAt: new Date(Date.now() - 192 * 60 * 60 * 1000),
    publishedDate: new Date(Date.now() - 192 * 60 * 60 * 1000)
  }
].map(ep => ({
  ...ep,
  isSearchResult: false // Add this property for search highlighting
}))