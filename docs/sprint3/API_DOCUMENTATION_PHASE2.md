# PodInsight API Documentation for Command Bar Integration

**Version**: 1.0  
**Last Updated**: June 28, 2025  
**Base URL**: `https://podinsight-api.vercel.app`

## Overview

This document provides comprehensive API documentation for the PodInsight dashboard team implementing the command bar feature (Sprint 3, Phase 2). The API provides semantic search with AI-powered answer synthesis and on-demand audio clip generation.

---

## 1. Search & Synthesis API

The core endpoint for the command bar feature. Performs vector-based semantic search across podcast transcripts and generates 2-sentence AI summaries with citations.

### Endpoint

```
POST /api/search
```

### Authentication

**Not required** - This endpoint is currently public.

### Request

#### Headers
```
Content-Type: application/json
```

#### Body Parameters

| Field    | Type      | Required | Default | Constraints              | Description |
|----------|-----------|----------|---------|--------------------------|-------------|
| `query`  | `string`  | **Yes**  | -       | Min: 1, Max: 500 chars   | The user's search query |
| `limit`  | `integer` | No       | `10`    | Min: 1, Max: 50          | Number of results per page |
| `offset` | `integer` | No       | `0`     | Min: 0                   | Pagination offset |

#### Example Request

```bash
curl -X POST 'https://podinsight-api.vercel.app/api/search' \
-H 'Content-Type: application/json' \
-d '{
  "query": "AI valuations",
  "limit": 10,
  "offset": 0
}'
```

### Response

#### Success Response (200 OK)

```json
{
  "answer": {
    "text": "AI valuations are increasingly influenced by rapid advancements in technology and competitive landscape¹². VCs emphasize the need for robust business models to justify high valuations⁴.",
    "citations": [
      {
        "index": 1,
        "episode_id": "abc123",
        "episode_title": "AI Bubble Discussion",
        "podcast_name": "All-In",
        "timestamp": "27:04",
        "start_seconds": 1624,
        "chunk_index": 45,
        "chunk_text": "The rapid advancement in AI technology..."
      },
      {
        "index": 2,
        "episode_id": "def456",
        "episode_title": "Market Analysis Q2",
        "podcast_name": "This Week in Startups",
        "timestamp": "15:23",
        "start_seconds": 923,
        "chunk_index": 28,
        "chunk_text": "When we look at the competitive landscape..."
      }
    ]
  },
  "results": [
    {
      "episode_id": "abc123",
      "podcast_name": "All-In",
      "episode_title": "AI Bubble Discussion",
      "published_at": "2025-06-15T10:00:00Z",
      "published_date": "June 15, 2025",
      "similarity_score": 0.981,
      "excerpt": "The rapid advancement in AI technology has led to unprecedented valuations...",
      "word_count": 45,
      "duration_seconds": 3600,
      "topics": ["AI", "valuations", "venture capital"],
      "s3_audio_path": "podcasts/all-in/episodes/abc123.mp3",
      "timestamp": {
        "start_time": 1624.0,
        "end_time": 1654.0
      }
    }
  ],
  "total_results": 10,
  "cache_hit": false,
  "search_id": "search_abc123_1719619200",
  "query": "AI valuations",
  "limit": 10,
  "offset": 0,
  "search_method": "vector_768d",
  "processing_time_ms": 2366
}
```

#### Response Fields

**Top Level:**
| Field | Type | Description |
|-------|------|-------------|
| `answer` | `object` \| `null` | AI-synthesized answer with citations. Null if synthesis fails |
| `results` | `array` | Array of search results |
| `total_results` | `integer` | Total count for pagination |
| `cache_hit` | `boolean` | Whether embedding was cached |
| `search_id` | `string` | Unique search identifier |
| `query` | `string` | Echo of the search query |
| `limit` | `integer` | Results per page |
| `offset` | `integer` | Pagination offset |
| `search_method` | `string` | Method used: `vector_768d`, `text`, or `none_all_failed` |
| `processing_time_ms` | `integer` | Server processing time |

**Answer Object:**
| Field | Type | Description |
|-------|------|-------------|
| `text` | `string` | 2-sentence summary (max 60 words) with superscript citations |
| `citations` | `array` | Metadata for each cited source |

**Citation Object:**
| Field | Type | Description |
|-------|------|-------------|
| `index` | `integer` | Citation number (1, 2, 3...) |
| `episode_id` | `string` | Unique episode identifier |
| `episode_title` | `string` | Episode title |
| `podcast_name` | `string` | Podcast name |
| `timestamp` | `string` | Time in MM:SS format |
| `start_seconds` | `float` | Start time in seconds |
| `chunk_index` | `integer` | Internal chunk index |
| `chunk_text` | `string` | Source text excerpt |

### Error Responses

| Status | Description | Response Body |
|--------|-------------|---------------|
| `422` | Invalid request parameters | `{"detail": [{"loc": ["body", "query"], "msg": "field required"}]}` |
| `200` | Search failed (check `search_method`) | `{"search_method": "none_all_failed", "results": [], ...}` |

### Integration Notes

1. **Loading States**: Average response time is 2.2-2.8s. Show loading indicator.
2. **Error Handling**: Check if `search_method === "none_all_failed"` for search failures.
3. **Citations**: Superscript numbers (¹²³) map to the citations array by index.
4. **Pagination**: Calculate offset as `(page - 1) * limit`.
5. **No Results**: Empty `results` array with valid `search_method` means no matches found.

---

## 2. Audio Clip Generation API

Generates on-demand 30-second audio clips for search results.

### Endpoint

```
GET /api/v1/audio_clips/{episode_id}
```

### Authentication

**Not required** - Consider adding rate limiting in production.

### Request

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `episode_id` | `string` | **Yes** | Episode ID from search results |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_time_ms` | `integer` | **Yes** | Start time in milliseconds |
| `duration_ms` | `integer` | No | Clip duration (default: 30000) |

#### Example Request

```bash
curl 'https://podinsight-api.vercel.app/api/v1/audio_clips/abc123?start_time_ms=1624000&duration_ms=30000'
```

### Response

#### Success Response (200 OK)

```json
{
  "clip_url": "https://pod-insights-clips.s3.amazonaws.com/audio_clips/abc123/1624000-1654000.mp3?X-Amz-Algorithm=...",
  "cache_hit": false,
  "generation_time_ms": 2340
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `clip_url` | `string` | Pre-signed S3 URL (24-hour expiry) |
| `cache_hit` | `boolean` | Whether clip was already generated |
| `generation_time_ms` | `integer` | Time to generate/retrieve clip |

### Error Responses

| Status | Description | Response Body |
|--------|-------------|---------------|
| `400` | Invalid parameters | `{"error": "Invalid duration"}` |
| `404` | Episode not found | `{"error": "Episode not found"}` |
| `500` | Generation failed | `{"error": "Internal server error"}` |

### Integration Notes

1. **On-Demand**: Only call when user clicks play button
2. **First Play**: Expect 2-3s delay for generation (show loading state)
3. **Caching**: Popular clips are cached (200ms response)
4. **URL Expiry**: URLs expire after 24 hours - don't cache long-term
5. **Audio Element**: Use returned URL directly in `<audio src="">`

### Audio Playback Implementation Guide

#### Converting Search Results to Audio Clips

When you receive search results, each result contains timestamp information needed for audio playback:

```javascript
// From search result
const result = {
  episode_id: "abc123",
  timestamp: {
    start_time: 1624.0,  // in seconds
    end_time: 1654.0     // in seconds
  }
};

// Convert to milliseconds for audio API
const startTimeMs = Math.floor(result.timestamp.start_time * 1000);
const durationMs = Math.floor((result.timestamp.end_time - result.timestamp.start_time) * 1000);
```

#### Complete Audio Player Implementation

```javascript
// AudioPlayer.jsx
import { useState, useRef, useEffect } from 'react';

function AudioPlayer({ episodeId, startTime, endTime, episodeTitle }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  
  const handlePlay = async () => {
    if (!audioRef.current.src) {
      // First time playing - fetch the clip URL
      setLoading(true);
      setError(null);
      
      try {
        const startTimeMs = Math.floor(startTime * 1000);
        const response = await fetch(
          `https://podinsight-api.vercel.app/api/v1/audio_clips/${episodeId}?start_time_ms=${startTimeMs}&duration_ms=30000`
        );
        
        if (!response.ok) {
          throw new Error('Failed to load audio');
        }
        
        const data = await response.json();
        audioRef.current.src = data.clip_url;
        
        // Wait for audio to load before playing
        await audioRef.current.play();
        setPlaying(true);
      } catch (err) {
        setError('Could not load audio clip');
        console.error('Audio load error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Audio already loaded - just play/pause
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        await audioRef.current.play();
        setPlaying(true);
      }
    }
  };
  
  // Update progress bar
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateProgress = () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      setProgress(progress);
    };
    
    const handleEnded = () => {
      setPlaying(false);
      setProgress(0);
    };
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  return (
    <div className="audio-player">
      <button 
        onClick={handlePlay} 
        disabled={loading}
        className="play-button"
      >
        {loading ? (
          <LoadingSpinner />
        ) : playing ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </button>
      
      {/* Progress bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
```

#### Integration with Citation Components

```javascript
// CitationCard.jsx
function CitationCard({ citation, index }) {
  return (
    <div className="citation-card">
      <span className="citation-number">{index}</span>
      <div className="citation-content">
        <h4>{citation.podcast_name}</h4>
        <p>{citation.episode_title}</p>
        <span className="timestamp">{citation.timestamp}</span>
      </div>
      <AudioPlayer
        episodeId={citation.episode_id}
        startTime={citation.start_seconds}
        endTime={citation.start_seconds + 30} // 30-second clips
        episodeTitle={citation.episode_title}
      />
    </div>
  );
}
```

#### Managing Multiple Audio Players

To ensure only one audio plays at a time:

```javascript
// AudioContext.jsx
const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  
  const playAudio = (playerId) => {
    setCurrentlyPlaying(playerId);
  };
  
  const stopAllAudio = () => {
    setCurrentlyPlaying(null);
  };
  
  return (
    <AudioContext.Provider value={{ currentlyPlaying, playAudio, stopAllAudio }}>
      {children}
    </AudioContext.Provider>
  );
}

// In AudioPlayer component
const { currentlyPlaying, playAudio } = useContext(AudioContext);

useEffect(() => {
  if (currentlyPlaying !== episodeId && playing) {
    // Another audio started playing
    audioRef.current.pause();
    setPlaying(false);
  }
}, [currentlyPlaying]);
```

#### Handling Edge Cases

1. **Network Failures**: Implement retry logic
```javascript
const fetchWithRetry = async (url, retries = 1) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed');
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
};
```

2. **Preloading**: Optionally preload top results
```javascript
const preloadAudio = async (episodeId, startTimeMs) => {
  const response = await fetch(
    `https://podinsight-api.vercel.app/api/v1/audio_clips/${episodeId}?start_time_ms=${startTimeMs}`
  );
  const data = await response.json();
  // Create audio element but don't play
  const audio = new Audio(data.clip_url);
  audio.preload = 'auto';
};
```

3. **Mobile Considerations**:
- Some mobile browsers require user interaction to play audio
- Show clear play button UI
- Handle autoplay policies gracefully

---

## Performance Guidelines

### Expected Response Times

| Operation | Cold Start | Warm | Cached |
|-----------|------------|------|---------|
| Search API | 15-20s | 2.2-2.8s | N/A |
| Audio Clip (first play) | N/A | 2-3s | 200ms |

### Optimization Tips

1. **Debounce Search**: Wait 300ms after user stops typing
2. **Loading States**: Show skeleton/spinner immediately
3. **Prefetch Audio**: Consider prefetching top 2 results on hover
4. **Cache Search Results**: Cache in sessionStorage (5 min TTL)
5. **Pagination**: Load more results incrementally

---

## Error Handling Best Practices

### User-Friendly Messages

| Scenario | User Message | Technical Action |
|----------|--------------|------------------|
| Search timeout | "Taking longer than usual..." | Retry once after 5s |
| No results | "No matches found. Try different keywords?" | Check `results.length === 0` |
| Search failed | "Search temporarily unavailable" | Check `search_method === "none_all_failed"` |
| Audio failed | "Could not load audio" | Retry once, then show text |
| Network error | "Check your connection" | Standard fetch error handling |

---

## CORS Configuration

The API supports CORS for all origins:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Rate Limiting

Currently **not implemented** but planned:
- Search API: 20 requests/minute per IP
- Audio API: 50 requests/minute per IP

---

## WebSocket Support

**Not available** - The API is REST-only. All operations are request/response.

---

## Testing & Development

### Local Development

For local testing without the full backend:

```javascript
// Mock search response
const mockSearch = {
  answer: {
    text: "Test answer with citations¹².",
    citations: [
      {
        index: 1,
        episode_id: "test123",
        episode_title: "Test Episode",
        podcast_name: "Test Podcast",
        timestamp: "15:30",
        start_seconds: 930
      }
    ]
  },
  results: [...],
  search_method: "vector_768d"
};
```

### Health Check

```
GET https://podinsight-api.vercel.app/api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-06-28T21:41:14.281838",
  "version": "1.0.0"
}
```

---

## Support & Questions

For API issues or questions:
- Check error responses for debugging info
- Monitor `processing_time_ms` for performance issues
- Use `search_id` when reporting issues

---

## Appendix: Example Integration

```javascript
// Simple command bar integration
async function handleSearch(query) {
  setLoading(true);
  
  try {
    const response = await fetch('https://podinsight-api.vercel.app/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 10 })
    });
    
    const data = await response.json();
    
    // Check for search failure
    if (data.search_method === 'none_all_failed') {
      throw new Error('Search unavailable');
    }
    
    // Display results
    setAnswer(data.answer);
    setResults(data.results);
    
  } catch (error) {
    setError('Search failed. Please try again.');
  } finally {
    setLoading(false);
  }
}

// Audio playback
async function playClip(episodeId, startTimeMs) {
  setAudioLoading(true);
  
  try {
    const response = await fetch(
      `https://podinsight-api.vercel.app/api/v1/audio_clips/${episodeId}?start_time_ms=${startTimeMs}`
    );
    
    const data = await response.json();
    audioElement.src = data.clip_url;
    audioElement.play();
    
  } catch (error) {
    setAudioError('Could not load audio');
  } finally {
    setAudioLoading(false);
  }
}
```