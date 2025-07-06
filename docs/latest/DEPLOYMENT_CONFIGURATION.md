# Deployment Configuration

## Current Deployment Setup

### Platform: Vercel
The application appears to be deployed on Vercel based on:
- API URL pointing to `podinsight-api.vercel.app`
- Next.js optimization features
- Serverless function patterns

### Build Configuration

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

#### package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Environment Variables

#### Required Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app

# Backend Authentication (SECURITY ISSUE - Should not be exposed)
BACKEND_API_TOKEN=<secret-token>
```

#### Environment Setup
- **Development**: `.env.local`
- **Production**: Set in Vercel dashboard
- **Preview**: Inherits from production

### Vercel Configuration (Inferred)

Since no `vercel.json` exists, default configuration applies:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### API Route Configuration

#### Search Route Timeout
```typescript
// app/api/search/route.ts
export const runtime = 'nodejs'
export const maxDuration = 45 // 45 seconds for cold starts
```

#### Default Route Settings
- Runtime: Node.js
- Memory: 1024 MB (default)
- Timeout: 10 seconds (default, except search)

### Build Output

#### Static Assets
- CSS files with content hashing
- JavaScript bundles with code splitting
- Image optimization via Next.js

#### Dynamic Routes
- `/api/*` - Serverless functions
- `/` - Static generation with client-side hydration
- `/test-command-bar` - Static page

### Deployment Process

#### Automatic Deployments
1. Push to GitHub main branch
2. Vercel webhook triggered
3. Build process starts
4. Preview URL generated
5. Production deployment on success

#### Manual Deployments
```bash
# Using Vercel CLI
vercel --prod

# Using npm scripts
npm run build && vercel deploy --prod
```

### Performance Optimizations

#### Current Optimizations
- Automatic static optimization
- Image optimization
- Font optimization
- JavaScript minification

#### Missing Optimizations
- ❌ No ISR (Incremental Static Regeneration)
- ❌ No Edge runtime for main routes
- ❌ No middleware for auth/redirects
- ❌ No custom headers/redirects

### Monitoring & Analytics

#### Current State
- No analytics configured
- No error tracking
- No performance monitoring
- Basic Vercel analytics (if enabled)

#### Recommended Setup
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  
  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  },
  
  // Add redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true
      }
    ]
  }
}
```

### Feature Flags

#### Currently Enabled
- ✅ Topic Velocity Chart
- ✅ AI-Powered Search
- ✅ Sentiment Heatmap
- ✅ Audio Playback
- ✅ Export Functionality

#### Currently Disabled
- ❌ Authentication
- ❌ User Accounts
- ❌ Smart Alerts
- ❌ Weekly Digests
- ❌ Team Features

### Deployment Checklist

#### Pre-deployment
- [ ] Run `npm run build` locally
- [ ] Check for TypeScript errors
- [ ] Verify environment variables
- [ ] Test critical user flows
- [ ] Check bundle size

#### Post-deployment
- [ ] Verify production URL
- [ ] Test search functionality
- [ ] Check audio playback
- [ ] Monitor error logs
- [ ] Verify API endpoints

### Rollback Strategy

#### Vercel Instant Rollback
1. Go to Vercel dashboard
2. Select deployment history
3. Click "Promote to Production" on previous deployment

#### Git-based Rollback
```bash
git revert HEAD
git push origin main
```

### Security Recommendations

#### Immediate Actions Required
1. **Remove BACKEND_API_TOKEN from client code**
2. **Implement authentication before API calls**
3. **Add rate limiting to API routes**
4. **Enable CORS protection**
5. **Add CSP headers**

#### Recommended Security Config
```javascript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )
  
  return response
}

export const config = {
  matcher: '/:path*',
}
```

### Cost Optimization

#### Current Usage (Estimated)
- Serverless Function Execution: ~100K requests/month
- Bandwidth: ~50GB/month
- Build Minutes: ~1000 minutes/month

#### Optimization Strategies
1. Implement proper caching headers
2. Use ISR for dashboard data
3. Move to Edge runtime where possible
4. Optimize image sizes
5. Enable Vercel Analytics for insights

### Scaling Considerations

#### Current Limitations
- No database connection pooling
- No queue system for long tasks
- No websocket support
- Single region deployment

#### Future Scaling Plan
1. Add Redis for session management
2. Implement job queue for audio processing
3. Add CDN for static assets
4. Enable multi-region deployment
5. Add database read replicas

### Disaster Recovery

#### Backup Strategy
- Code: GitHub repository
- Data: External API handles data
- Configuration: Document all env vars

#### Recovery Time Objectives
- RTO: < 5 minutes (Vercel rollback)
- RPO: 0 (no data stored locally)

### Deployment Environments

#### Development
```bash
npm run dev
# http://localhost:3000
```

#### Staging (Preview)
- Auto-deployed on PR creation
- URL: `https://<branch>-podinsight-dashboard.vercel.app`

#### Production
- URL: `https://podinsight-dashboard.vercel.app`
- Auto-deployed on main branch merge