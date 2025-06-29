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