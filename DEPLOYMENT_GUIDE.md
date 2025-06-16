# PodInsightHQ Dashboard - Deployment Guide

This guide covers running, testing, and deploying the PodInsightHQ dashboard.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Vercel account (for deployment)
- Access to the deployed API at https://podinsight-api.vercel.app

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# If you haven't already installed dependencies
npm install
```

### 2. Set Up Environment Variables

```bash
# Create .env.local if it doesn't exist
cp .env.example .env.local

# The default .env.local should contain:
# NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 🧪 Testing Checkpoints

### 1. Development Server Test

```bash
npm run dev
```

**Expected:**
- Server starts on http://localhost:3000
- No errors in console
- Page loads successfully

**What to check:**
- Dark background (#0A0A0A)
- "PodInsightHQ" header with gradient text
- Loading skeleton appears briefly
- Chart loads with 4 topic lines

### 2. Build Test

```bash
npm run build
```

**Expected:**
- Build completes without TypeScript errors
- Shows successful compilation message
- Creates .next folder with production build

### 3. Production Test (Local)

```bash
npm run build
npm run start
```

**Expected:**
- Production server starts on http://localhost:3000
- Performance is optimized
- All features work as in development

### 4. Dependency Verification

```bash
# Check that key dependencies are installed
npm list recharts @tanstack/react-query

# Should show:
# ├── @tanstack/react-query@5.65.0
# └── recharts@2.12.7
```

### 5. API Connection Test

Open browser DevTools > Network tab:
- Look for request to: https://podinsight-api.vercel.app/api/topic-velocity
- Should return 200 status
- Response time should be < 100ms
- Data should contain 4 topics with weekly data

## 🎨 UI/UX Verification

### Dark Theme Check
- Background: Pure dark (#0A0A0A)
- Text: White (#FFFFFF)
- Chart background: Semi-transparent gray
- Grid lines: Subtle gray (#374151)

### Chart Functionality
- 4 colored lines (green, purple, blue, red)
- Hover tooltips show exact values
- Legend below chart is interactive
- Smooth line curves

### Loading States
- Skeleton loader with pulsing animation
- "Analyzing podcast intelligence..." text
- Smooth transition to chart

## 🚢 Deployment to Vercel

### 1. Prepare for Deployment

```bash
# Ensure all changes are committed
git add .
git commit -m "Dashboard ready for deployment"
git push origin main
```

### 2. Deploy via Vercel CLI (Option A)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Select framework: Next.js
# - Build command: npm run build (default)
# - Output directory: .next (default)
```

### 3. Deploy via Vercel Dashboard (Option B)

1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository: `podinsight-dashboard`
4. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: https://podinsight-api.vercel.app
   - `BASIC_AUTH_PASSWORD`: your-secure-password (for staging protection)
6. Click "Deploy"

### 4. Post-Deployment Configuration

#### Enable Basic Auth (Optional)
If you want password protection:

1. Set `BASIC_AUTH_PASSWORD` in Vercel environment variables
2. Redeploy to activate

#### Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 📊 Performance Monitoring

### Expected Performance Metrics
- **First Load**: < 2 seconds
- **API Response**: ~50ms from production API
- **Chart Render**: < 500ms
- **Total Bundle Size**: < 500KB

### Monitoring in Vercel
1. Go to your project dashboard
2. Click "Analytics" tab
3. Monitor:
   - Real User Metrics (RUM)
   - Web Vitals scores
   - Error rates

## 🐛 Troubleshooting

### Common Issues

#### 1. Chart Not Loading
**Symptom:** Empty chart area or perpetual loading
**Solution:**
- Check browser console for errors
- Verify API URL in .env.local
- Check network tab for failed requests
- Ensure exact topic names (e.g., "Crypto/Web3" not "Crypto / Web3")

#### 2. Build Errors
**Symptom:** TypeScript or build failures
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

#### 3. CORS Issues
**Symptom:** CORS errors in browser console
**Solution:**
- API already has CORS enabled
- Check if browser extensions are blocking
- Verify API URL doesn't have trailing slash

#### 4. Environment Variables Not Working
**Symptom:** API calls failing, undefined values
**Solution:**
- Restart dev server after changing .env.local
- Ensure variables start with NEXT_PUBLIC_
- Check Vercel dashboard for production vars

## 🔍 Verification Checklist

Before considering deployment complete:

- [ ] Development server runs without errors
- [ ] Build completes successfully
- [ ] Dark theme displays correctly
- [ ] Chart loads with real data
- [ ] Tooltips work on hover
- [ ] Loading skeleton appears during fetch
- [ ] Error states handle gracefully
- [ ] Basic auth works (if configured)
- [ ] Performance meets targets (< 2s load)
- [ ] No console errors in production

## 📱 Browser Compatibility

Tested and supported on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Note: Mobile responsiveness deferred to Sprint 2

## 🔐 Security Notes

- Basic auth protects staging environment
- API URLs are public (NEXT_PUBLIC_)
- No sensitive data stored client-side
- HTTPS enforced on Vercel

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Review Network tab for API calls
3. Verify environment variables
4. Check Vercel function logs

---

## Next Steps

After successful deployment:
1. Share staging URL with stakeholders
2. Gather feedback on Topic Velocity visualization
3. Plan Sprint 2 features:
   - Natural language search
   - User authentication
   - Mobile responsiveness
   - Additional visualizations

**Deployed URL Pattern:**
- Production: `https://podinsight-dashboard.vercel.app`
- Preview: `https://podinsight-dashboard-[branch]-[username].vercel.app`