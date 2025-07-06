import type { Episode } from './mock-episode-data'

export interface Signal {
  timestamp: string
  text: string
}

export interface PortfolioMention {
  timestamp: string
  company: string
  context: string
  sentiment: string
  actionRequired?: boolean
}

export interface Soundbite {
  quote: string
  useFor: string
}

export interface DetailedEpisode extends Episode {
  investableSignals: Signal[]
  competitiveIntel: Signal[]
  portfolioMentions: PortfolioMention[]
  soundbites: Soundbite[]
}

// Convert basic Episode to DetailedEpisode with additional intel
export const getDetailedEpisode = (episode: Episode): DetailedEpisode => {
  // Generate detailed intel based on the episode signal type
  const detailedData: Partial<DetailedEpisode> = {
    ...episode,
    investableSignals: [],
    competitiveIntel: [],
    portfolioMentions: [],
    soundbites: []
  }

  // Generate content based on signal type
  switch (episode.signal) {
    case 'red_hot':
      detailedData.investableSignals = [
        { timestamp: '12:34', text: 'Founder explicitly mentioned raising $150M Series C at $1.5B valuation, targeting close by Q1 2025' },
        { timestamp: '18:22', text: 'New AI infrastructure play emerging - 3 stealth startups building specialized AI chips, all raising seed rounds' },
        { timestamp: '25:15', text: 'Sequoia partner confirmed they\'re "aggressively investing" in vertical AI applications, check sizes up to $50M' }
      ]
      detailedData.competitiveIntel = [
        { timestamp: '08:45', text: 'Benchmark passed on the deal due to valuation concerns - they think market is overheated' },
        { timestamp: '31:20', text: 'Index Ventures building dedicated AI team in NYC, hiring 5 partners from Google' }
      ]
      break

    case 'high_value':
      detailedData.investableSignals = [
        { timestamp: '15:30', text: 'B2B SaaS company doing $10M ARR, growing 300% YoY, raising Series A' },
        { timestamp: '22:10', text: 'Interesting play in developer tools - GitHub for AI models, pre-seed stage' }
      ]
      detailedData.competitiveIntel = [
        { timestamp: '05:15', text: 'Lightspeed\'s new $500M early-stage fund focusing exclusively on AI infrastructure' },
        { timestamp: '28:45', text: 'YC acceptance rate dropped to 1.5% this batch, AI companies are 60% of cohort' }
      ]
      break

    case 'portfolio_mention':
      detailedData.portfolioMentions = [
        { 
          timestamp: '12:45',
          company: 'Figma', 
          context: 'Discussion about product-led growth strategies',
          sentiment: 'Positive - praised as gold standard in design tools', 
          actionRequired: false 
        },
        { 
          timestamp: '28:30',
          company: 'Vercel', 
          context: 'Analysis of edge computing market dynamics',
          sentiment: 'Concerning - competitive pressure from Cloudflare', 
          actionRequired: true 
        },
        { 
          timestamp: '45:15',
          company: 'Linear', 
          context: 'M&A landscape in project management space',
          sentiment: 'Neutral - potential acquisition target', 
          actionRequired: true 
        }
      ]
      break

    case 'market_intel':
      detailedData.competitiveIntel = [
        { timestamp: '10:20', text: 'PE firms entering seed stage - Apollo launching $200M seed fund' },
        { timestamp: '19:35', text: 'EU regulatory changes making it easier for US VCs to invest in European startups' }
      ]
      break
  }

  // Add portfolio mentions for episodes that don't have them yet
  if (detailedData.portfolioMentions?.length === 0) {
    detailedData.portfolioMentions = [
      { 
        timestamp: '41:23',
        company: 'Acme.ai', 
        context: 'Discussion about vertical AI winners',
        sentiment: 'Positive - potential acquisition target', 
        actionRequired: true 
      }
    ]
  }

  // Add soundbites for all episodes
  detailedData.soundbites = [
    { quote: 'The best founders are building in markets that don\'t exist yet', useFor: 'LP updates, thought leadership content' },
    { quote: 'We\'re seeing a fundamental shift from SaaS to Service-as-Software', useFor: 'Investment thesis presentations' }
  ]

  return detailedData as DetailedEpisode
}