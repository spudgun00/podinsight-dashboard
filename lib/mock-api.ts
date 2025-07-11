import { APIDashboardResponse } from '@/types/intelligence';

// Mock API data for testing the search command bar
export const dummySearchData: Record<string, any> = {
  "AI agents": {
    "answer": {
      "text": "AI agents are a major topic, with many experts believing they represent the next step in user-computer interaction. Discussions often focus on their potential for autonomy and the economic shifts they could trigger.",
      "citations": [
        { 
          "index": 1, 
          "episode_id": "ep175-allin", 
          "episode_title": "E175: State of the Union, AI agents, commercial real estate doom loop, Israel/Gaza & more", 
          "podcast_name": "All-In Podcast", 
          "timestamp": "21:30", 
          "start_seconds": 1290, 
          "chunk_index": 31 
        },
        { 
          "index": 2, 
          "episode_id": "openai-p2-acq", 
          "episode_title": "OpenAI (Part 2)", 
          "podcast_name": "Acquired", 
          "timestamp": "01:15:45", 
          "start_seconds": 4545, 
          "chunk_index": 112 
        },
        { 
          "index": 3, 
          "episode_id": "ep168-allin", 
          "episode_title": "E168: State of AI, market update, Google antitrust, Meta's next moves & more", 
          "podcast_name": "All-In Podcast", 
          "timestamp": "45:12", 
          "start_seconds": 2712, 
          "chunk_index": 78 
        },
        { 
          "index": 4, 
          "episode_id": "lf-sama-400", 
          "episode_title": "#400 - Sam Altman: OpenAI, GPT-5, Sora, and the Future of AGI", 
          "podcast_name": "Lex Fridman Podcast", 
          "timestamp": "55:20", 
          "start_seconds": 3320, 
          "chunk_index": 95 
        }
      ]
    },
    "results": [],
    "processing_time_ms": 1845
  },
  "venture capital valuations": {
    "answer": {
      "text": "VC valuations have seen a significant correction from the 2021 peaks, with a renewed focus on profitability and sustainable growth. Founders are now facing more disciplined investors and flatter funding rounds.",
      "citations": [
        { 
          "index": 1, 
          "episode_id": "ep159-allin", 
          "episode_title": "E159: The state of venture, with guest Mike Maples, Jr. of Floodgate", 
          "podcast_name": "All-In Podcast", 
          "timestamp": "33:05", 
          "start_seconds": 1985, 
          "chunk_index": 55 
        },
        { 
          "index": 2, 
          "episode_id": "20vc-bs-721", 
          "episode_title": "20VC: Bill Simmons on The Ringer's Sale to Spotify", 
          "podcast_name": "20VC", 
          "timestamp": "18:50", 
          "start_seconds": 1130, 
          "chunk_index": 21 
        },
        { 
          "index": 3, 
          "episode_id": "nvidia-p2-acq", 
          "episode_title": "The NVIDIA Trilogy (Part II)", 
          "podcast_name": "Acquired", 
          "timestamp": "01:42:10", 
          "start_seconds": 6130, 
          "chunk_index": 140 
        }
      ]
    },
    "results": [],
    "processing_time_ms": 2133
  },
  "startup funding": {
    "answer": {
      "text": "The current startup funding environment is challenging, with investors prioritizing capital efficiency. However, sectors like AI and climate tech continue to attract significant capital despite the broader market slowdown.",
      "citations": [
        { 
          "index": 1, 
          "episode_id": "ep172-allin", 
          "episode_title": "E172: Chamath & Bill Gurley on the state of venture, AI, bubbles, more", 
          "podcast_name": "All-In Podcast", 
          "timestamp": "58:15", 
          "start_seconds": 3495, 
          "chunk_index": 92 
        },
        { 
          "index": 2, 
          "episode_id": "twis-e1890", 
          "episode_title": "E1890: Varda's in-space manufacturing, funding update with Jason Calacanis", 
          "podcast_name": "This Week in Startups", 
          "timestamp": "08:22", 
          "start_seconds": 502, 
          "chunk_index": 15 
        },
        { 
          "index": 3, 
          "episode_id": "ep175-allin", 
          "episode_title": "E175: State of the Union, AI agents, commercial real estate doom loop, Israel/Gaza & more", 
          "podcast_name": "All-In Podcast", 
          "timestamp": "05:40", 
          "start_seconds": 340, 
          "chunk_index": 9 
        }
      ]
    },
    "results": [],
    "processing_time_ms": 2410
  },
  // Additional edge cases
  "DePIN infrastructure": {
    "answer": {
      "text": "Decentralized Physical Infrastructure Networks (DePIN) are gaining traction as blockchain meets real-world infrastructure. Projects like Helium and Render Network demonstrate how crypto incentives can bootstrap physical networks.",
      "citations": [
        { 
          "index": 1, 
          "episode_id": "bankless-depin-232", 
          "episode_title": "The DePIN Revolution: Crypto Meets Infrastructure", 
          "podcast_name": "Bankless", 
          "timestamp": "42:15", 
          "start_seconds": 2535, 
          "chunk_index": 67 
        },
        { 
          "index": 2, 
          "episode_id": "ep183-allin", 
          "episode_title": "E183: Markets update, Helium's rise, regulatory landscape & more", 
          "podcast_name": "All-In Podcast", 
          "timestamp": "14:20", 
          "start_seconds": 860, 
          "chunk_index": 22 
        }
      ]
    },
    "results": [],
    "processing_time_ms": 1567
  }
}

// Mock API function that simulates the real API behavior
export async function mockPerformSearch(query: string): Promise<any> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
  
  // Find the closest matching query
  const normalizedQuery = query.toLowerCase()
  const matchedKey = Object.keys(dummySearchData).find(key => 
    normalizedQuery.includes(key.toLowerCase()) || 
    key.toLowerCase().includes(normalizedQuery)
  )
  
  if (matchedKey) {
    return dummySearchData[matchedKey]
  }
  
  // Return empty result for unmatched queries
  return {
    answer: null,
    results: [],
    processing_time_ms: 1234
  }
}

// Mock function to simulate cold start delays
export async function mockPerformSearchWithColdStart(query: string): Promise<any> {
  // Simulate cold start (15-20 seconds)
  const isColdStart = Math.random() < 0.2 // 20% chance of cold start
  const delay = isColdStart ? 15000 + Math.random() * 5000 : 1500 + Math.random() * 1000
  
  await new Promise(resolve => setTimeout(resolve, delay))
  
  return mockPerformSearch(query)
}

// Generate mock dashboard response for demo mode
export function generateMockDashboardResponse(): APIDashboardResponse {
  const now = new Date();
  const episodes = [
    {
      episode_id: "ep175-allin",
      title: "E175: State of the Union, AI agents, commercial real estate doom loop, Israel/Gaza & more",
      podcast_name: "All-In Podcast",
      published_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      duration_seconds: 5400,
      relevance_score: 0.95,
      signals: [
        {
          type: "investable" as const,
          content: "AI agents represent a $100B+ market opportunity with major players racing to build autonomous systems",
          confidence: 0.92,
          timestamp: 1290
        },
        {
          type: "competitive" as const,
          content: "Microsoft and Google are in an arms race for AI agent dominance, with both investing billions",
          confidence: 0.88,
          timestamp: 1890
        }
      ],
      summary: "Deep dive into AI agents as the next computing paradigm, with insights on market sizing and competitive dynamics",
      key_insights: [
        "AI agents will fundamentally change how we interact with computers",
        "The market opportunity could exceed $100B by 2030",
        "Microsoft has a lead but Google is catching up fast"
      ],
      audio_url: null
    },
    {
      episode_id: "20vc-funding-2024",
      title: "The State of Venture Funding in 2024",
      podcast_name: "20VC",
      published_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      duration_seconds: 3600,
      relevance_score: 0.89,
      signals: [
        {
          type: "portfolio" as const,
          content: "Stripe mentioned as category leader in payments infrastructure, valued at $50B+",
          confidence: 0.95,
          timestamp: 890
        },
        {
          type: "sound_bite" as const,
          content: "Valuations have normalized - we're back to 2019 levels which is healthy for the ecosystem",
          confidence: 0.85,
          timestamp: 1456
        }
      ],
      summary: "Analysis of current venture funding environment with focus on valuation corrections and emerging opportunities",
      key_insights: [
        "Valuations have corrected 40-60% from 2021 peaks",
        "Quality companies are still getting funded at reasonable valuations",
        "AI and climate tech are the only sectors seeing valuation inflation"
      ],
      audio_url: null
    },
    {
      episode_id: "acquired-nvidia-p3",
      title: "The NVIDIA Trilogy (Part III): The Future of Computing",
      podcast_name: "Acquired",
      published_at: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
      duration_seconds: 7200,
      relevance_score: 0.91,
      signals: [
        {
          type: "investable" as const,
          content: "The next $1T opportunity is in AI infrastructure - picks and shovels for the AI gold rush",
          confidence: 0.90,
          timestamp: 3400
        }
      ],
      summary: "Comprehensive analysis of NVIDIA's dominance and the future of AI computing infrastructure",
      key_insights: [
        "NVIDIA has a 5-year lead in AI hardware that's nearly impossible to catch",
        "The real opportunity is in the application layer built on top of AI infrastructure",
        "We're still in the first inning of the AI revolution"
      ],
      audio_url: null
    },
    {
      episode_id: "lex-sama-401",
      title: "#401 - Demis Hassabis: DeepMind, AlphaFold, and the Future of AI",
      podcast_name: "Lex Fridman Podcast",
      published_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      duration_seconds: 9000,
      relevance_score: 0.88,
      signals: [
        {
          type: "sound_bite" as const,
          content: "AGI is closer than most people think - we could see it within the next decade",
          confidence: 0.82,
          timestamp: 4500
        },
        {
          type: "competitive" as const,
          content: "DeepMind's approach to AGI is fundamentally different from OpenAI's - more focused on reasoning",
          confidence: 0.87,
          timestamp: 5200
        }
      ],
      summary: "Deep technical discussion on AI progress, AGI timelines, and DeepMind's research philosophy",
      key_insights: [
        "AlphaFold has revolutionized biology - similar breakthroughs coming in other sciences",
        "The path to AGI requires solving reasoning, not just scaling language models",
        "AI safety becomes critical as we approach human-level intelligence"
      ],
      audio_url: null
    },
    {
      episode_id: "mfm-side-hustles",
      title: "5 Side Hustles That Could Make You $10k/Month",
      podcast_name: "My First Million",
      published_at: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
      duration_seconds: 4200,
      relevance_score: 0.75,
      signals: [
        {
          type: "portfolio" as const,
          content: "Discussion of ConvertKit's growth to $40M ARR as example of bootstrap success",
          confidence: 0.85,
          timestamp: 2100
        }
      ],
      summary: "Exploration of emerging business opportunities in the creator economy and AI tools space",
      key_insights: [
        "AI automation agencies are the new hot opportunity",
        "Newsletter businesses are still undervalued despite recent acquisitions",
        "B2B SaaS for creators is a massive untapped market"
      ],
      audio_url: null
    }
  ];

  return {
    episodes,
    total_episodes: episodes.length,
    generated_at: now.toISOString()
  };
}