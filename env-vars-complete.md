# PodInsightHQ Environment Variables Reference

**Last Updated:** June 2025  
**Critical:** Use separate keys for STAGING vs PROD to prevent quota exhaustion

## 📊 Genesis Sprint Status Summary

### ✅ FILLED (Currently Active)
- **Supabase**: URL and keys configured for ETL and API
- **AWS S3**: Credentials and bucket names set
- **Application**: Core config including API URL, Python version
- **ETL**: Batch size and topics to track
- **Vercel**: Region, memory, and timeout settings

### ❌ TODO (Future Sprints)
- **OpenAI**: API keys and model configuration (Sprint 2)
- **SendGrid**: Email service for auth (Sprint 2)
- **Search**: Embeddings and similarity config (Sprint 2)
- **Rate Limiting**: API protection (Sprint 2)
- **Monitoring**: Sentry, analytics (Sprint 3)
- **Payments**: Stripe integration (Sprint 4)

### ❌ NOT USED (Architecture Decisions)
- **Frontend Supabase**: Using API proxy instead of direct connection
- **pgBouncer**: Not needed at current scale
- **S3 Manifests**: No manifest bucket in current workflow

## 🔑 Environment Variables by Service

| Variable Name | Scope | Example Value | Notes / Rotation Policy |
|--------------|-------|---------------|-------------------------|
| **Supabase** |
| `SUPABASE_URL_STAGING` | `API`, `ETL` | `https://ydbtuijwsvwwcxkgogtb.supabase.co` | ✅ FILLED - Non-secret, project-specific URL |
| `SUPABASE_URL_PROD` | `API`, `ETL` | `https://ydbtuijwsvwwcxkgogtb.supabase.co` | ✅ FILLED - Same as staging for MVP |
| `SUPABASE_KEY_STAGING` | `API`, `ETL` | `[REDACTED - check .env in podinsight-etl]` | ✅ FILLED - Service role key, rotate quarterly |
| `SUPABASE_KEY_PROD` | `API`, `ETL` | `[REDACTED - check .env in podinsight-etl]` | ✅ FILLED - Same as staging for MVP |
| `NEXT_PUBLIC_SUPABASE_URL` | `FE` | `https://ydbtuijwsvwwcxkgogtb.supabase.co` | ❌ NOT USED - Using API instead |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `FE` | `[Not needed for current architecture]` | ❌ NOT USED - Using API instead |
| `SUPABASE_JWT_SECRET` | `API` | `[Not yet configured]` | ❌ TODO - For future auth |
| **OpenAI** |
| `OPENAI_API_KEY_STAGING` | `API` | `[Not yet configured]` | ❌ TODO Sprint 2 - Separate quota, rotate monthly |
| `OPENAI_API_KEY_PROD` | `API` | `[Not yet configured]` | ❌ TODO Sprint 2 - Production quota, rotate monthly |
| `OPENAI_MODEL_EMBEDDINGS` | `API` | `text-embedding-3-small` | ❌ TODO Sprint 2 - Model for embeddings generation |
| `OPENAI_MODEL_CHAT` | `API` | `gpt-4-turbo-preview` | ❌ TODO Sprint 2 - Model for chat/summaries |
| **AWS S3** |
| `AWS_ACCESS_KEY_ID` | `ETL` | `[REDACTED - using ~/.aws/credentials]` | ✅ FILLED - IAM user, rotate every 90 days |
| `AWS_SECRET_ACCESS_KEY` | `ETL` | `[REDACTED - using ~/.aws/credentials]` | ✅ FILLED - IAM secret, rotate every 90 days |
| `AWS_REGION` | `ETL` | `us-east-1` | ✅ FILLED - Non-secret, S3 bucket region |
| `S3_BUCKET_STAGE` | `ETL` | `pod-insights-stage` | ✅ FILLED - Non-secret, processed data bucket |
| `S3_BUCKET_RAW` | `ETL` | `pod-insights-raw` | ✅ FILLED - Non-secret, audio files bucket |
| `S3_BUCKET_MANIFESTS` | `ETL` | `[Not used in current ETL]` | ❌ NOT USED - May be for future features |
| **SendGrid** |
| `SENDGRID_API_KEY` | `API` | `[Not yet configured]` | ❌ TODO Sprint 2 - Email service, rotate quarterly |
| `SENDGRID_FROM_EMAIL` | `API` | `noreply@podinsighthq.com` | ❌ TODO Sprint 2 - Non-secret, verified sender |
| `SENDGRID_SMTP_HOST` | `API` | `smtp.sendgrid.net` | ❌ TODO Sprint 2 - SMTP host for Supabase Auth |
| `SENDGRID_SMTP_PORT` | `API` | `587` | ❌ TODO Sprint 2 - SMTP port |
| `SENDGRID_SMTP_USER` | `API` | `apikey` | ❌ TODO Sprint 2 - SMTP username (always 'apikey') |
| `SENDGRID_SMTP_PASS` | `API` | `[Same as SENDGRID_API_KEY]` | ❌ TODO Sprint 2 - Same as SENDGRID_API_KEY |
| **Application Config** |
| `NODE_ENV` | `FE`, `API` | `production` | ✅ FILLED - Runtime environment |
| `ENV` | `API`, `ETL` | `STAGING` | ✅ FILLED - Current deployment stage (MVP uses staging) |
| `NEXT_PUBLIC_API_URL` | `FE` | `https://podinsight-api.vercel.app` | ✅ FILLED - Non-secret, API endpoint |
| `BASIC_AUTH_PASSWORD` | `FE` | `[Set in .env.local]` | ✅ FILLED - Staging protection, rotate weekly |
| `PYTHON_VERSION` | `API` | `3.12` | ✅ FILLED - Python runtime version |
| **Feature Flags** |
| `SEARCH_ENABLED` | `API` | `false` | ❌ TODO Sprint 2 - Toggle semantic search feature |
| `RATE_LIMIT_ENABLED` | `API` | `false` | ❌ TODO Sprint 2 - Toggle rate limiting |
| **Search Configuration** |
| `EMBEDDING_DIMENSION` | `API` | `1536` | ❌ TODO Sprint 2 - OpenAI embedding vector size |
| `SEARCH_SIMILARITY_THRESHOLD` | `API` | `0.7` | ❌ TODO Sprint 2 - Minimum similarity score |
| `QUERY_CACHE_TTL` | `API` | `3600` | ❌ TODO Sprint 2 - Query cache TTL in seconds |
| `QUERY_CACHE_MAX_SIZE` | `API` | `1000` | ❌ TODO Sprint 2 - Max cached queries |
| **Rate Limiting** |
| `RATE_LIMIT_DEFAULT` | `API` | `200 per hour` | ❌ TODO Sprint 2 - Default rate limit |
| `RATE_LIMIT_SEARCH` | `API` | `20 per minute` | ❌ TODO Sprint 2 - Search endpoint limit |
| `RATE_LIMIT_AUTH` | `API` | `5 per minute` | ❌ TODO Sprint 2 - Auth endpoints limit |
| `RATE_LIMIT_STORAGE` | `API` | `memory` | ❌ TODO Sprint 2 - Storage backend (memory/redis) |
| **Database Connection** |
| `DATABASE_POOL_MIN` | `API` | `2` | ⚠️ DEFAULT - Min pool connections |
| `DATABASE_POOL_MAX` | `API` | `10` | ⚠️ DEFAULT - Max pool connections |
| `DATABASE_POOL_TIMEOUT` | `API` | `60` | ⚠️ DEFAULT - Connection timeout (seconds) |
| `PGBOUNCER_ENABLED` | `API` | `false` | ❌ NOT USED - Not needed at current scale |
| `PGBOUNCER_MAX_CLIENT_CONN` | `API` | `100` | ❌ NOT USED - Max client connections |
| `PGBOUNCER_DEFAULT_POOL_SIZE` | `API` | `25` | ❌ NOT USED - Default pool size |
| **ETL Specific** |
| `ETL_BATCH_SIZE` | `ETL` | `50` | ✅ FILLED - Episodes per batch |
| `TOPICS_TO_TRACK` | `ETL` | `AI Agents,Capital Efficiency,DePIN,B2B SaaS,Crypto/Web3` | ✅ FILLED - Comma-separated topics |
| **Vercel Deployment** |
| `VERCEL_REGION` | `API`, `FE` | `lhr1` | ✅ FILLED - London region |
| `VERCEL_FUNCTION_MEMORY` | `API` | `512` | ✅ FILLED - Function memory in MB |
| `VERCEL_FUNCTION_TIMEOUT` | `API` | `10` | ✅ FILLED - Function timeout in seconds |
| **Monitoring** |
| `SENTRY_DSN` | `FE`, `API` | `[Not yet configured]` | ❌ TODO Sprint 3 - Error tracking, non-secret |
| `VERCEL_ANALYTICS_ID` | `FE` | `[Auto-generated by Vercel]` | ⚠️ DEFAULT - Performance tracking, non-secret |
| `UPTIME_ROBOT_API_KEY` | `Dev-Only` | `[Not yet configured]` | ❌ TODO Sprint 3 - Uptime monitoring |
| **Future Services (Sprint 2-3)** |
| `SLACK_BOT_TOKEN` | `API` | `[Not yet configured]` | ❌ TODO Sprint 3 - Slack integration |
| `SLACK_SIGNING_SECRET` | `API` | `[Not yet configured]` | ❌ TODO Sprint 3 - Slack webhook verification |
| `STRIPE_SECRET_KEY` | `API` | `[Not yet configured]` | ❌ TODO Sprint 4 - Payment processing |
| `STRIPE_WEBHOOK_SECRET` | `API` | `[Not yet configured]` | ❌ TODO Sprint 4 - Stripe webhook verification |
| `WEBHOOK_ALERT_URL` | `API` | `[Not yet configured]` | ❌ TODO Sprint 3 - External alert webhooks |

## 🔧 Usage Pattern

```python
# Dynamic environment lookup based on deployment stage
import os

# Get current environment
ENV = os.getenv('ENV', 'STAGING')  # Default to STAGING for safety

# Dynamic key selection
def get_env_key(service: str, key_type: str) -> str:
    """Get environment-specific key"""
    env_var = f"{service}_{key_type}_{ENV}"
    value = os.getenv(env_var)
    
    if not value:
        raise ValueError(f"Missing required env var: {env_var}")
    
    return value

# Usage examples
openai_key = get_env_key('OPENAI_API_KEY', ENV)
supabase_url = get_env_key('SUPABASE_URL', ENV)
supabase_key = get_env_key('SUPABASE_KEY', ENV)

# Feature flag check
if os.getenv('SEARCH_ENABLED', 'true').lower() == 'true':
    # Enable search functionality
    pass

# Rate limit configuration
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[os.getenv('RATE_LIMIT_DEFAULT', '200 per hour')]
)
```

## 🌐 S3 CORS Configuration

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:3000",
        "https://staging.podinsighthq.com",
        "https://podinsighthq.com",
        "https://*.vercel.app"
      ],
      "ExposeHeaders": [
        "Accept-Ranges",
        "Content-Range",
        "Content-Length",
        "Content-Type",
        "ETag"
      ],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

## 📧 SendGrid SMTP Configuration (Supabase Auth)

```yaml
# In Supabase Dashboard > Auth > SMTP Settings
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Your SendGrid API Key]
From Email: noreply@podinsighthq.com
```

## 🔒 Security Checklist

- [ ] Separate STAGING/PROD keys for all services
- [ ] No production keys in development environment
- [ ] All frontend vars prefixed with `NEXT_PUBLIC_`
- [ ] Quarterly rotation schedule documented
- [ ] No secrets committed to git (use .gitignore)
- [ ] Environment-specific .env files never shared

## 🚨 Why This Matters

• **Onboarding Speed**: New devs productive in <30min with clear env setup  
• **Blast Radius Control**: Staging accidents can't exhaust production OpenAI quota  
• **Audit Readiness**: All keys documented with rotation schedules for SOC2  
• **Cost Protection**: Separate quotas prevent $1000+ surprise bills  
• **GDPR Compliance**: No secrets in frontend bundle (NEXT_PUBLIC_ vars are public)  
• **Debugging Efficiency**: Clear scope tags show which service uses each variable  
• **Security Posture**: Regular rotation schedule reduces breach impact window

---

## 🚀 Currently Active Environment Variables (Genesis Sprint)

### ETL (.env in podinsight-etl)
```bash
# Supabase
SUPABASE_URL=https://ydbtuijwsvwwcxkgogtb.supabase.co
SUPABASE_KEY=[Service role key - see .env file]

# AWS S3 (using ~/.aws/credentials)
AWS_REGION=us-east-1
S3_BUCKET_STAGE=pod-insights-stage
S3_BUCKET_RAW=pod-insights-raw

# ETL Config
ETL_BATCH_SIZE=50
TOPICS_TO_TRACK=AI Agents,Capital Efficiency,DePIN,B2B SaaS,Crypto/Web3
```

### API (Environment variables in Vercel)
```bash
# Supabase
SUPABASE_URL=https://ydbtuijwsvwwcxkgogtb.supabase.co
SUPABASE_KEY=[Service role key - set in Vercel dashboard]

# Python Runtime
PYTHON_VERSION=3.12
```

### Frontend (.env.local in podinsight-dashboard)
```bash
# API Connection
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app

# Basic Auth (for staging protection)
BASIC_AUTH_PASSWORD=[Your staging password]
```

## 📄 Complete .env.example

```bash
# Supabase
SUPABASE_URL_STAGING=https://ydbtuijwsvwwcxkgogtb.supabase.co
SUPABASE_URL_PROD=https://ydbtuijwsvwwcxkgogtb.supabase.co
SUPABASE_KEY_STAGING=
SUPABASE_KEY_PROD=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=

# OpenAI
OPENAI_API_KEY_STAGING=
OPENAI_API_KEY_PROD=
OPENAI_MODEL_EMBEDDINGS=
OPENAI_MODEL_CHAT=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_STAGE=
S3_BUCKET_RAW=
S3_BUCKET_MANIFESTS=

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_SMTP_HOST=
SENDGRID_SMTP_PORT=
SENDGRID_SMTP_USER=
SENDGRID_SMTP_PASS=

# Application Config
NODE_ENV=
ENV=
NEXT_PUBLIC_API_URL=
BASIC_AUTH_PASSWORD=
PYTHON_VERSION=

# Feature Flags
SEARCH_ENABLED=
RATE_LIMIT_ENABLED=

# Search Configuration
EMBEDDING_DIMENSION=
SEARCH_SIMILARITY_THRESHOLD=
QUERY_CACHE_TTL=
QUERY_CACHE_MAX_SIZE=

# Rate Limiting
RATE_LIMIT_DEFAULT=
RATE_LIMIT_SEARCH=
RATE_LIMIT_AUTH=
RATE_LIMIT_STORAGE=

# Database Connection
DATABASE_POOL_MIN=
DATABASE_POOL_MAX=
DATABASE_POOL_TIMEOUT=
PGBOUNCER_ENABLED=
PGBOUNCER_MAX_CLIENT_CONN=
PGBOUNCER_DEFAULT_POOL_SIZE=

# ETL Specific
ETL_BATCH_SIZE=
TOPICS_TO_TRACK=

# Vercel Deployment
VERCEL_REGION=
VERCEL_FUNCTION_MEMORY=
VERCEL_FUNCTION_TIMEOUT=

# Monitoring
SENTRY_DSN=
VERCEL_ANALYTICS_ID=
UPTIME_ROBOT_API_KEY=

# Future Services (Sprint 2-3)
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
WEBHOOK_ALERT_URL=
```