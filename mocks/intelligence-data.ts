import { APIDashboardResponse } from '@/types/intelligence';

export const mockDashboardData: APIDashboardResponse = {
  episodes: [
    {
      episode_id: "mock-001",
      title: "The Future of AI Agents with Sam Altman",
      podcast_name: "All-In Podcast",
      published_at: new Date().toISOString(),
      duration_seconds: 5400,
      relevance_score: 0.95,
      signals: [
        {
          type: "investable",
          content: "OpenAI discussing potential $150B valuation round with major VCs including Thrive Capital",
          confidence: 0.9,
          timestamp: 1200000
        },
        {
          type: "competitive",
          content: "Anthropic raised $2B from Google, intensifying AI race",
          confidence: 0.85,
          timestamp: 2400000
        }
      ],
      summary: "Deep dive into AI agent architectures and the competitive landscape",
      key_insights: [
        "AI agents will transform enterprise workflows by 2025",
        "Infrastructure layer seeing massive investment",
        "Application layer still nascent"
      ],
      audio_url: null
    },
    {
      episode_id: "mock-002", 
      title: "Deconstructing the Perfect Pitch Deck",
      podcast_name: "20VC",
      published_at: new Date(Date.now() - 86400000).toISOString(),
      duration_seconds: 3600,
      relevance_score: 0.82,
      signals: [
        {
          type: "portfolio",
          content: "Portfolio company Vercel mentioned as example of great developer tools pitch",
          confidence: 0.9,
          timestamp: 900000
        },
        {
          type: "sound_bite",
          content: "The best founders sell the problem, not the solution - they make you feel the pain",
          confidence: 0.88,
          timestamp: 1800000
        }
      ],
      summary: "Harry Stebbings breaks down what makes a compelling pitch deck",
      key_insights: [
        "Problem slides matter more than solution slides",
        "Traction speaks louder than projections",
        "Team slide should highlight unique insights"
      ],
      audio_url: null
    },
    {
      episode_id: "mock-003",
      title: "DePIN: The Next Crypto Supercycle",
      podcast_name: "Bankless",
      published_at: new Date(Date.now() - 172800000).toISOString(),
      duration_seconds: 4800,
      relevance_score: 0.78,
      signals: [
        {
          type: "investable",
          content: "Helium hitting $1B market cap signals DePIN sector heating up",
          confidence: 0.75,
          timestamp: 600000
        },
        {
          type: "sound_bite",
          content: "DePIN will be bigger than DeFi - it bridges physical and digital worlds",
          confidence: 0.8,
          timestamp: 3000000
        }
      ],
      summary: "Exploring decentralized physical infrastructure networks",
      key_insights: [
        "IoT meets crypto in surprising ways",
        "Token incentives solving chicken-egg problems",
        "Regulatory clarity improving in key markets"
      ],
      audio_url: null
    },
    {
      episode_id: "mock-004",
      title: "Inside Stripe's Engineering Culture",
      podcast_name: "The a16z Podcast",
      published_at: new Date(Date.now() - 259200000).toISOString(),
      duration_seconds: 4200,
      relevance_score: 0.71,
      signals: [
        {
          type: "competitive",
          content: "Stripe processing $1T annually, considering IPO in 2025",
          confidence: 0.7,
          timestamp: 1500000
        },
        {
          type: "portfolio",
          content: "Discussion of how portfolio companies can leverage Stripe's new AI tools",
          confidence: 0.72,
          timestamp: 2800000
        }
      ],
      summary: "Deep dive into how Stripe maintains velocity at scale",
      key_insights: [
        "Writing culture creates institutional memory",
        "API-first thinking drives product decisions",
        "Developer experience as competitive moat"
      ],
      audio_url: null
    }
  ],
  total_episodes: 4,
  generated_at: new Date().toISOString()
};

export const mockEpisodeBrief = (episodeId: string) => {
  const episode = mockDashboardData.episodes.find(e => e.episode_id === episodeId);
  if (!episode) {
    throw new Error('Episode not found');
  }
  return episode;
};