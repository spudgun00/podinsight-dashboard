# PodInsightHQ Functionality Guide

## Overview
This guide provides detailed explanations of how each feature in the PodInsightHQ dashboard works, including user interactions, data flow, and technical implementation details.

## Core Features

### 1. Topic Velocity Tracker

#### What It Does
The Topic Velocity Tracker visualizes the frequency of topic mentions across all analyzed podcasts over time, helping users identify emerging trends and declining interests in the startup ecosystem.

#### How It Works
1. **Data Collection**: The backend analyzes transcripts from 1,171 episodes across 29 podcasts
2. **Topic Detection**: Natural language processing identifies mentions of tracked topics:
   - AI Agents
   - Capital Efficiency
   - DePIN (Decentralized Physical Infrastructure)
   - B2B SaaS
   - Crypto/Web3
3. **Trend Calculation**: Weekly aggregation of mention counts with velocity calculations
4. **Visualization**: Interactive line chart with:
   - Multiple time range views (1 week to all-time)
   - Toggle individual topics on/off
   - Hover tooltips showing exact counts and trends
   - Velocity badges (Accelerating/Steady/Slowing)

#### User Interactions
- **Time Range Selection**: Click buttons to change view period
- **Topic Toggle**: Click topic buttons to show/hide lines
- **Hover Details**: Mouse over chart for detailed metrics
- **Export Data**: Download chart as PNG, CSV, or PDF

#### Technical Details
- Updates every 5 minutes via API polling
- Uses Recharts for visualization
- Implements responsive design for mobile
- Calculates week-over-week percentage changes
- Detects "notable performers" (>50% growth)

### 2. AI-Powered Search

#### What It Does
Enables natural language queries across all podcast transcripts, providing AI-synthesized answers with source citations and audio playback.

#### How It Works
1. **Query Processing**:
   - Minimum 4 characters required
   - Debounced input (300ms delay)
   - Query sanitization and validation
2. **Search Execution**:
   - Semantic search across transcript embeddings
   - Relevance scoring using vector similarity
   - Context extraction around matches
3. **AI Synthesis**:
   - GPT-4 analyzes relevant excerpts
   - Generates comprehensive answer
   - Calculates confidence score
   - Identifies key themes
4. **Audio Integration**:
   - Generates 30-second clips at match timestamps
   - Pre-fetches next clips for smooth playback
   - Supports multiple audio formats

#### User Interactions
- **Keyboard Shortcuts**: 
  - ⌘K (Mac) or Ctrl+K (Windows) to open
  - / for quick search
  - Escape to close
- **Search Input**: Type natural language questions
- **Results Navigation**: 
  - Click to expand sources
  - Play audio clips inline
  - Copy text excerpts
- **Cold Start Handling**: Shows friendly message during API warm-up

#### Technical Details
- Edge runtime for <100ms response times
- Client-side result caching (LRU)
- Request cancellation for abandoned searches
- Progressive enhancement for slow connections
- Accessibility-first design with ARIA labels

### 3. Sentiment Heatmap

#### What It Does
Visualizes the emotional tone of discussions around each topic over time, helping identify market sentiment shifts.

#### How It Works
1. **Sentiment Analysis**:
   - NLP processing of transcript segments
   - Scoring from -1 (very negative) to +1 (very positive)
   - Contextual understanding of startup/VC language
2. **Data Aggregation**:
   - Weekly sentiment averages by topic
   - Episode count weighting
   - Outlier detection and smoothing
3. **Color Mapping**:
   - Red: Negative sentiment (<-0.3)
   - Yellow: Neutral (-0.3 to 0.3)
   - Green: Positive (>0.3)
   - Gradient interpolation for nuance

#### User Interactions
- **Time Range Filter**: Select analysis period
- **Cell Hover**: View exact scores and episode counts
- **Cell Click**: (Future) Drill down to specific episodes
- **Legend Reference**: Understand color scale

#### Technical Details
- Custom color interpolation algorithm
- Responsive grid layout
- Optimized rendering for large datasets
- Tooltip positioning with viewport detection

### 4. Metric Cards

#### What It Does
Provides at-a-glance dashboard statistics with real-time status indicators.

#### Card Types and Functionality

##### Trending Now
- **Data Source**: Topic with highest velocity
- **Visual**: Animated sparkline chart
- **Update**: Real-time from Topic Velocity API
- **Color**: Dynamic based on performance

##### Episodes Analyzed
- **Display**: Count-up animation to 1,171
- **Purpose**: Shows data coverage
- **Animation**: Triggers on viewport entry

##### Insights Generated
- **Status**: Real-time processing indicator
- **Visual**: Pulse animation
- **Purpose**: Shows system activity

##### Data Freshness
- **Status**: Live data recency indicator
- **Visual**: Green pulse for fresh data
- **Update**: Every 5 minutes

### 5. Audio Clip Service

#### What It Does
Generates and serves 30-second audio clips from podcast episodes at specific timestamps.

#### How It Works
1. **Clip Request**:
   - Episode ID and timestamp received
   - ID format detection and normalization
   - Validation of timestamp bounds
2. **Audio Processing**:
   - Fetch source audio from storage
   - Extract 30-second segment
   - Apply fade in/out for smooth playback
   - Compress for optimal streaming
3. **Delivery**:
   - Stream audio with proper headers
   - Support range requests for seeking
   - Cache headers for browser storage

#### Technical Details
- Supports multiple ID formats for compatibility
- 10-second timeout protection
- Error handling for missing episodes
- Bandwidth-optimized streaming

## Data Flow

### 1. Initial Dashboard Load
1. Header component renders with animation
2. Metric cards fetch current statistics
3. Topic Velocity chart loads historical data
4. Sentiment heatmap populates in background
5. Search command bar initializes shortcuts

### 2. Search Flow
1. User opens search with keyboard shortcut
2. Types query (minimum 4 characters)
3. Debounced request sent to search API
4. Results stream back with:
   - AI analysis first
   - Source citations next
   - Episode list last
5. Audio clips pre-fetch for top results
6. Results cached for instant re-access

### 3. Data Refresh Cycle
- Every 5 minutes:
  - Topic velocity data updates
  - Sentiment analysis refreshes
  - Metric cards update counts
  - Cache invalidation occurs
- Real-time:
  - Search results (no caching)
  - Audio clip generation

## Performance Optimizations

### 1. Caching Strategy
- **API Responses**: 5-minute server cache
- **Search Results**: Client-side LRU cache
- **Audio Clips**: 1-hour browser cache
- **Static Assets**: Immutable cache with hashing

### 2. Loading Optimizations
- **Progressive Enhancement**: Core features work without JS
- **Lazy Loading**: Heavy components load on demand
- **Code Splitting**: Route-based chunking
- **Image Optimization**: Next.js automatic optimization

### 3. Runtime Performance
- **Virtual Scrolling**: For large result sets
- **Debouncing**: Search input and resize handlers
- **Request Cancellation**: Abort stale requests
- **Web Workers**: (Future) Heavy computations

## Error Handling

### 1. API Failures
- Graceful degradation with cached data
- User-friendly error messages
- Automatic retry with exponential backoff
- Fallback UI components

### 2. Search Errors
- Cold start detection and messaging
- Timeout handling with retry option
- Empty state for no results
- Error boundary for component crashes

### 3. Audio Playback
- Format compatibility detection
- Network error recovery
- Fallback to transcript only
- User notification of issues

## Accessibility Features
- Full keyboard navigation
- Screen reader announcements
- High contrast mode support
- Focus management in modals
- Semantic HTML structure
- ARIA labels and descriptions
- Skip navigation links