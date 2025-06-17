# PodInsightHQ Dashboard - Deployment Guide

**Last Updated:** June 17, 2025  
**Repository:** https://github.com/[your-username]/podinsight-dashboard  
**Target Platform:** Vercel  
**Framework:** Next.js 14 (App Router)  
**Estimated Time:** 20-30 minutes  

## Prerequisites

Before starting deployment:
- [ ] Vercel account created (https://vercel.com/signup)
- [ ] GitHub repository synced with latest changes
- [ ] API already deployed and URL noted (https://podinsight-api.vercel.app)
- [ ] Local dashboard tested and working
- [ ] v0 components integrated and functioning

## Quick Reference: Key URLs
- **Live API:** `https://podinsight-api.vercel.app/api/topic-velocity`
- **Target Dashboard URL:** `https://podinsight-dashboard.vercel.app`
- **GitHub Repo:** `podinsight-dashboard`

## Step 1: Pre-Deployment Checklist

### Code Verification
- [ ] All v0 components integrated:
  - [ ] Topic Velocity Chart with SIGNAL indicators
  - [ ] Compare Topics overlay
  - [ ] Time period selector (4w, 8w, 13w)
  - [ ] Topic legend with color codes
  - [ ] Metric cards with sparklines
  - [ ] Notable Performer section with dynamic updates
- [ ] Authentication middleware configured
- [ ] API integration tested locally
- [ ] No TypeScript errors (`npm run build` succeeds)

### Environment File Ready
Create `.env.local` with these exact values:
```bash
# API Connection
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app

# Basic Auth Protection (for staging)
BASIC_AUTH_PASSWORD=[your-secure-password]
```

## Step 2: Connect GitHub Repository to Vercel

1. **Log in to Vercel Dashboard**
   - Navigate to https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Click "Import Git Repository"
   - Search for `podinsight-dashboard`
   - Click "Import" next to the repository

## Step 3: Configure Project Settings

### Framework Settings
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `.` (leave as default)
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (leave as default)
- **Install Command:** `npm install`

### Node.js Version
- **Node.js Version:** 20.x (for Next.js 14 compatibility)

## Step 4: Environment Variables

**CRITICAL:** Add these environment variables in Vercel dashboard:

### Required Variables

| Variable Name | Description | Value |
|---------------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | Production API endpoint | `https://podinsight-api.vercel.app` |
| `BASIC_AUTH_PASSWORD` | Dashboard password | `[your-secure-password]` |

### Verifying Environment Variables
- All `NEXT_PUBLIC_` variables are exposed to the browser
- Non-prefixed variables are server-side only
- Double-check the API URL has no trailing slash

## Step 5: Advanced Configuration

### Build & Development Settings

1. **Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "devCommand": "npm run dev"
   }
   ```

2. **Region Configuration**
   - Region: `lhr1` (London) - same as API for low latency
   - Edge Network: Enabled (default)

3. **Performance Settings**
   - ISR (Incremental Static Regeneration): Disabled (real-time data)
   - Image Optimization: Enabled
   - Bundle Analysis: Enabled (for monitoring)

### Chart Component Configuration
Ensure these settings in your `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // API Proxy for avoiding CORS
  // No rewrites needed - API calls are made directly from client
  // CORS is handled by the API server
  // Optimize for production
  swcMinify: true,
  reactStrictMode: true,
}
```

## Step 6: Deploy

1. **Review Configuration**
   - All environment variables set
   - Framework preset shows Next.js logo
   - Build command is `npm run build`

2. **Click "Deploy"**
   - Vercel clones repository
   - Installs dependencies (including v0 components)
   - Builds Next.js application
   - Optimizes and deploys
   - Process takes 3-5 minutes

3. **Monitor Build Logs**
   Watch for:
   - ✅ Dependencies installed
   - ✅ Next.js build successful
   - ✅ Generating static pages
   - ✅ Collecting page data
   - ⚠️ Any warnings about large bundles

## Step 7: Verify Deployment

### Initial Access Test
1. **Navigate to deployment URL**
   ```
   https://podinsight-dashboard.vercel.app
   ```

2. **Basic Auth Challenge**
   - Username: `admin` (hardcoded)
   - Password: [your configured password]

3. **Dashboard Loading**
   - Chart should load within 2 seconds
   - All 5 topics visible with correct colors
   - Time selector functional
   - Metric cards populate with real data

### Feature Verification Checklist

#### Chart Features
- [ ] Topic lines render with correct colors:
  - AI Agents: `#10B981` (green)
  - Capital Efficiency: `#8B5CF6` (purple)
  - DePIN: `#3B82F6` (blue)
  - B2B SaaS: `#EF4444` (red)
  - Crypto/Web3: `#F59E0B` (amber)
- [ ] SIGNAL strength bars display with clickable dots
- [ ] Statistics row shows totals, weekly change, and trends
- [ ] Hover tooltips show exact values
- [ ] Chart axes have proper labels (Week, Mentions)

#### Interactive Elements
- [ ] Time period selector works (1M, 3M, 6M, All Time)
- [ ] Compare button (⟳) toggles previous period comparison
- [ ] Previous period data shows as dotted lines when compare is active
- [ ] Legend items are clickable to toggle topics

#### Data Integration
- [ ] Live data loads from API
- [ ] No CORS errors in console
- [ ] Chart updates when changing time periods
- [ ] Error states handled gracefully

### Performance Verification
1. **Open Chrome DevTools → Lighthouse**
2. **Run performance audit**
3. **Target scores:**
   - Performance: > 85
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 85

## Step 8: Custom Domain Setup (Optional)

1. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Add domain: `dashboard.podinsight.com`

2. **DNS Configuration**
   Choose one:
   - **CNAME Record:** `cname.vercel-dns.com`
   - **A Record:** `76.76.21.21`

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Wait 10-30 minutes for propagation

## Troubleshooting Common Issues

### Issue: Authentication Not Working
**Symptoms:** No login prompt or login credentials rejected
**Solution:**
1. Verify middleware.ts exists in root
2. Check BASIC_AUTH_PASSWORD in Vercel env vars (username is hardcoded as 'admin')
3. Redeploy after fixing

### Issue: Chart Not Loading
**Symptoms:** Empty chart area or loading spinner stuck
**Solution:**
1. Check browser console for errors
2. Verify NEXT_PUBLIC_API_URL is correct
3. Test API directly: `curl https://podinsight-api.vercel.app/api/topic-velocity`
4. Check for CORS errors

### Issue: Topics Not Displaying Correctly
**Symptoms:** Missing topics or wrong colors
**Solution:**
1. Verify exact topic names (case-sensitive):
   - "AI Agents" (not "AI Agent")
   - "Capital Efficiency" (not "Capital-Efficiency")
   - "DePIN" (not "Depin" or "depin")
   - "B2B SaaS" (not "B2B SAAS")
   - "Crypto/Web3" (not "Crypto / Web3")
2. Check v0 component integration
3. Clear browser cache

### Issue: Build Failures
**Common errors and fixes:**
```
Error: Module not found
→ Run npm install locally and commit package-lock.json

Error: Type error
→ Run npm run build locally to catch TypeScript errors

Error: Large bundle size
→ Check for unnecessary imports, lazy load components
```

### Issue: Slow Performance
**Symptoms:** Chart takes > 3 seconds to load
**Solution:**
1. Check bundle size in Vercel dashboard
2. Implement code splitting for v0 components
3. Verify API response time < 500ms
4. Enable Vercel Analytics to identify bottlenecks

## Post-Deployment Configuration

### Monitoring Setup

1. **Enable Vercel Analytics**
   - Project Settings → Analytics → Enable
   - Free tier includes:
     - Real User Metrics (Web Vitals)
     - Audience Analytics
     - Performance Insights

2. **Speed Insights**
   - Project Settings → Speed Insights → Enable
   - Monitor Core Web Vitals
   - Set up alerts for performance degradation

3. **Error Tracking (Optional)**
   - Integrate Sentry for error monitoring
   - Add to next.config.js:
   ```javascript
   const { withSentryConfig } = require('@sentry/nextjs')
   module.exports = withSentryConfig(nextConfig)
   ```

### Security Hardening

1. **Content Security Policy**
   Add to `next.config.js`:
   ```javascript
   async headers() {
     return [
       {
         source: '/:path*',
         headers: [
           {
             key: 'X-Frame-Options',
             value: 'DENY',
           },
           {
             key: 'X-Content-Type-Options',
             value: 'nosniff',
           },
         ],
       },
     ]
   }
   ```

2. **Rate Limiting**
   - Consider Vercel Edge Middleware for rate limiting
   - Protect against API abuse

## Deployment Success Indicators

### Immediate Checks (0-5 minutes)
- ✅ Deployment URL accessible
- ✅ Basic auth working
- ✅ Chart renders with data
- ✅ No console errors

### Short-term Checks (5-30 minutes)
- ✅ All interactive features working
- ✅ Performance scores acceptable
- ✅ Analytics data flowing
- ✅ No error spikes in logs

### Long-term Monitoring (Daily)
- ✅ Uptime > 99.9%
- ✅ Average load time < 2 seconds
- ✅ No memory leaks
- ✅ Error rate < 0.1%

## Rollback Procedure

### Instant Rollback via Vercel
1. Go to Deployments tab
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Previous version restored in < 30 seconds

### Manual Rollback via Git
```bash
# Find the last working commit
git log --oneline

# Revert to that commit
git revert HEAD
git push origin main

# Vercel auto-deploys the revert
```

## Maintenance Procedures

### Updating Dependencies
1. Test updates locally first:
   ```bash
   npm update
   npm run build
   npm run dev
   ```
2. Commit package-lock.json
3. Push to trigger deployment

### Updating v0 Components
1. Copy new component code from v0
2. Test integration locally
3. Verify chart functionality preserved
4. Deploy via git push

### Performance Optimization
Regular tasks:
- Review bundle size monthly
- Update to latest Next.js version
- Optimize images and assets
- Review and remove unused dependencies

## Support Resources

- **Vercel Status:** https://vercel.com/status
- **Next.js Deployment Docs:** https://nextjs.org/docs/deployment
- **v0 Documentation:** https://v0.dev/docs
- **Project Repository:** https://github.com/[your-username]/podinsight-dashboard

## Appendix: Environment Variable Reference

### Development (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app

# Auth (development)
BASIC_AUTH_PASSWORD=dev-password
```

### Production (Vercel Dashboard)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app

# Auth (production - use strong password)
BASIC_AUTH_PASSWORD=[generate-secure-password]

# Optional - for custom domains
# NEXT_PUBLIC_APP_URL=https://dashboard.podinsighthq.com
```

---

**Deployment Checklist Summary:**
- [ ] Code ready with v0 components
- [ ] Environment variables configured
- [ ] Deployment successful
- [ ] All features verified
- [ ] Monitoring enabled
- [ ] Documentation updated

**Last Updated:** Genesis Sprint Complete (June 17, 2025)
**Next Review:** Sprint 1 Planning

## Quick Deploy Command Reference

```bash
# Local testing before deploy
npm run build
npm run start

# Deploy via Vercel CLI
vercel --prod

# Or push to GitHub (auto-deploys)
git push origin main
```