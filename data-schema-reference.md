# PodInsightHQ Data Schema Reference

## Overview

This document serves as the authoritative reference for all data structures, schemas, and naming conventions used in PodInsightHQ. It covers database tables, S3 file structures, API response formats, and data processing pipelines.

## Database Schema (Supabase)

### Core Tables

#### 1. `episodes` Table
Primary table storing podcast episode metadata and processed data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique episode identifier |
| `podcast_id` | uuid | NOT NULL, FOREIGN KEY | References podcasts.id |
| `episode_number` | integer | | Episode number within the podcast |
| `title` | text | NOT NULL | Episode title |
| `description` | text | | Episode description |
| `published_date` | timestamptz | NOT NULL | Publication timestamp |
| `duration_seconds` | integer | | Episode duration in seconds |
| `audio_url` | text | | Original audio file URL |
| `transcript_s3_key` | text | | S3 key for transcript file |
| `kpis_s3_key` | text | | S3 key for extracted KPIs |
| `entities_s3_key` | text | | S3 key for extracted entities |
| `processing_status` | text | CHECK (status IN ('pending', 'processing', 'completed', 'failed')) | Current processing state |
| `processing_completed_at` | timestamptz | | Timestamp of completion |
| `error_message` | text | | Error details if processing failed |
| `created_at` | timestamptz | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | timestamptz | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_episodes_podcast_id` on (podcast_id)
- `idx_episodes_published_date` on (published_date)
- `idx_episodes_processing_status` on (processing_status)

#### 2. `podcasts` Table
Master list of podcasts being tracked.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique podcast identifier |
| `name` | text | NOT NULL, UNIQUE | Podcast name |
| `rss_feed_url` | text | UNIQUE | RSS feed URL |
| `description` | text | | Podcast description |
| `category` | text | | Primary category |
| `is_active` | boolean | DEFAULT true | Whether actively tracking |
| `last_fetched_at` | timestamptz | | Last RSS fetch timestamp |
| `created_at` | timestamptz | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | timestamptz | DEFAULT NOW() | Last update timestamp |

#### 3. `topic_metrics` Table
Aggregated topic velocity data for dashboard visualization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique metric identifier |
| `topic` | text | NOT NULL | Topic name (see Topic Enum below) |
| `date` | date | NOT NULL | Date for this metric |
| `mention_count` | integer | DEFAULT 0 | Number of mentions on this date |
| `episode_count` | integer | DEFAULT 0 | Number of episodes mentioning topic |
| `signal_strength` | decimal(3,2) | CHECK (signal_strength BETWEEN 0 AND 1) | Calculated signal strength (0-1) |
| `created_at` | timestamptz | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | timestamptz | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_topic_metrics_topic_date` UNIQUE on (topic, date)
- `idx_topic_metrics_date` on (date)

#### 4. `kpi_extractions` Table
Structured storage for extracted KPIs from episodes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique extraction identifier |
| `episode_id` | uuid | NOT NULL, FOREIGN KEY | References episodes.id |
| `kpi_type` | text | NOT NULL | Type of KPI (revenue, growth_rate, etc.) |
| `value` | jsonb | NOT NULL | KPI value and metadata |
| `confidence` | decimal(3,2) | CHECK (confidence BETWEEN 0 AND 1) | Extraction confidence score |
| `context` | text | | Surrounding context from transcript |
| `timestamp_seconds` | integer | | Position in episode |
| `created_at` | timestamptz | DEFAULT NOW() | Record creation timestamp |

#### 5. `entity_mentions` Table
Extracted entities (companies, people, technologies) from episodes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique mention identifier |
| `episode_id` | uuid | NOT NULL, FOREIGN KEY | References episodes.id |
| `entity_type` | text | NOT NULL | Type: company, person, technology, product |
| `entity_name` | text | NOT NULL | Normalized entity name |
| `raw_mention` | text | | Original text as mentioned |
| `topic_association` | text | | Associated topic (if applicable) |
| `sentiment` | decimal(3,2) | CHECK (sentiment BETWEEN -1 AND 1) | Sentiment score (-1 to 1) |
| `timestamp_seconds` | integer | | Position in episode |
| `created_at` | timestamptz | DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- `idx_entity_mentions_episode_id` on (episode_id)
- `idx_entity_mentions_entity_name` on (entity_name)
- `idx_entity_mentions_entity_type` on (entity_type)

### Enums and Constants

#### Topic Enum
The system tracks exactly 4 topics (case-sensitive):
```sql
CREATE TYPE topic_enum AS ENUM (
  'AI Applications',
  'Business Strategy', 
  'Data Analytics',
  'Developer Experience'
);
```

#### Entity Types
```sql
CREATE TYPE entity_type_enum AS ENUM (
  'company',
  'person',
  'technology',
  'product',
  'concept'
);
```

#### Processing Status
```sql
CREATE TYPE processing_status_enum AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);
```

## S3 File Structure

### Naming Convention
All S3 files follow a strict hierarchical naming pattern:

```
{environment}/{data_type}/{podcast_name}/{year}/{month}/{episode_id}_{file_type}.{extension}
```

### Examples
```
# Transcript file
production/transcripts/the-ai-podcast/2025/01/550e8400-e29b-41d4-a716-446655440000_transcript.json

# KPIs file  
production/kpis/masters-of-scale/2025/01/550e8400-e29b-41d4-a716-446655440000_kpis.json

# Entities file
production/entities/tech-talk-today/2025/01/550e8400-e29b-41d4-a716-446655440000_entities.json
```

### File Type Specifications

#### 1. Transcript Files (`*_transcript.json`)
```json
{
  "episode_id": "550e8400-e29b-41d4-a716-446655440000",
  "podcast_name": "The AI Podcast",
  "episode_number": 142,
  "segments": [
    {
      "speaker": "Host",
      "text": "Welcome to today's episode...",
      "start_time": 0.0,
      "end_time": 5.2
    }
  ],
  "metadata": {
    "transcription_model": "whisper-large-v3",
    "processed_at": "2025-01-15T10:30:00Z",
    "duration_seconds": 2400,
    "word_count": 8500
  }
}
```

#### 2. KPIs Files (`*_kpis.json`)
```json
{
  "episode_id": "550e8400-e29b-41d4-a716-446655440000",
  "extracted_kpis": [
    {
      "type": "revenue",
      "value": 50000000,
      "unit": "USD",
      "period": "annual",
      "company": "TechCorp",
      "confidence": 0.92,
      "context": "...our annual revenue reached 50 million dollars...",
      "timestamp": 145.3
    },
    {
      "type": "growth_rate",
      "value": 150,
      "unit": "percent",
      "period": "YoY",
      "metric": "user_base",
      "confidence": 0.88,
      "context": "...we grew 150% year over year...",
      "timestamp": 523.7
    }
  ],
  "metadata": {
    "extraction_model": "gpt-4",
    "processed_at": "2025-01-15T10:45:00Z",
    "total_kpis_found": 12
  }
}
```

#### 3. Entities Files (`*_entities.json`)
```json
{
  "episode_id": "550e8400-e29b-41d4-a716-446655440000",
  "entities": [
    {
      "type": "company",
      "name": "OpenAI",
      "mentions": [
        {
          "text": "OpenAI's latest model",
          "timestamp": 120.5,
          "sentiment": 0.8,
          "topic_association": "AI Applications"
        }
      ],
      "total_mentions": 5
    },
    {
      "type": "person",
      "name": "Sam Altman",
      "mentions": [
        {
          "text": "Sam Altman announced",
          "timestamp": 245.2,
          "sentiment": 0.6,
          "topic_association": "Business Strategy"
        }
      ],
      "total_mentions": 3
    }
  ],
  "metadata": {
    "extraction_model": "gpt-4",
    "processed_at": "2025-01-15T10:50:00Z",
    "unique_entities": 28,
    "total_mentions": 156
  }
}
```

## API Response Formats

### 1. Topic Velocity Endpoint
`GET /api/topics/velocity`

```json
{
  "data": {
    "AI Applications": [
      {
        "date": "2025-01-01",
        "mentions": 45,
        "signal": 0.82
      },
      {
        "date": "2025-01-02", 
        "mentions": 52,
        "signal": 0.89
      }
    ],
    "Business Strategy": [...],
    "Data Analytics": [...],
    "Developer Experience": [...]
  },
  "metadata": {
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-01-15"
    },
    "total_episodes_analyzed": 1171,
    "last_updated": "2025-01-15T12:00:00Z"
  }
}
```

### 2. Episode Details Endpoint
`GET /api/episodes/{episode_id}`

```json
{
  "episode": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "podcast_name": "The AI Podcast",
    "title": "The Future of AI Applications",
    "published_date": "2025-01-14T08:00:00Z",
    "duration_seconds": 2400,
    "topics_mentioned": ["AI Applications", "Developer Experience"],
    "key_entities": [
      {
        "name": "OpenAI",
        "type": "company",
        "mention_count": 5
      }
    ],
    "top_kpis": [
      {
        "type": "revenue",
        "value": "50M",
        "company": "TechCorp"
      }
    ]
  }
}
```

### 3. Search Endpoint
`GET /api/search?q={query}&type={entity|kpi|topic}`

```json
{
  "results": [
    {
      "type": "entity",
      "name": "OpenAI",
      "recent_mentions": 127,
      "trending": true,
      "associated_topics": ["AI Applications"],
      "recent_episodes": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45
  }
}
```

## Data Quality Rules

### 1. Topic Assignment Rules
- Each episode segment can be associated with 0-N topics
- Topic assignment requires minimum confidence of 0.7
- Multi-topic segments are allowed if confidence > 0.8 for each

### 2. Entity Normalization
- Company names are title-cased and standardized
- Person names follow "FirstName LastName" format
- Technology names preserve original casing
- Duplicates are merged using fuzzy matching (threshold: 0.85)

### 3. KPI Extraction Rules
- Numeric values must have explicit or inferred units
- Time periods must be clearly stated or contextually obvious
- Confidence scores below 0.6 are filtered out
- Currency values are normalized to USD when possible

### 4. Data Retention
- Raw transcripts: 90 days
- Processed KPIs/Entities: Indefinite
- Aggregated metrics: Indefinite
- Failed processing records: 30 days

## Database Migrations

### Version Control
All schema changes are tracked in:
```
supabase/migrations/
├── 20250101000000_initial_schema.sql
├── 20250105000000_add_topic_metrics.sql
├── 20250110000000_add_entity_indexes.sql
└── 20250115000000_add_signal_strength.sql
```

### Migration Checklist
1. Test migration on staging first
2. Backup production database
3. Run migration during low-traffic period
4. Verify data integrity post-migration
5. Update this documentation

## Performance Considerations

### Indexes Strategy
- Date-based queries: Covered by date indexes
- Topic lookups: Composite index on (topic, date)
- Entity searches: Full-text search index on entity_name
- Episode fetching: Covered by podcast_id index

### Query Optimization
- Topic velocity: Pre-aggregated in topic_metrics table
- Entity trending: Materialized view refreshed hourly
- Search: Elasticsearch integration for complex queries

### Data Volume Projections
Based on current growth (1,171 episodes):
- Episodes: ~100/week growth
- Entities: ~150 per episode average
- KPIs: ~10 per episode average
- Storage: ~1GB/month growth

---

**Last Updated**: Sprint 1 - Documentation Phase
**Version**: 1.0.0
**Next Review**: End of Sprint 1