# PodInsightHQ Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying both components of PodInsightHQ to Vercel:
- **podinsight-api**: FastAPI backend service
- **podinsight-dashboard**: Next.js frontend application

## Prerequisites

Before starting the deployment process, ensure you have:

1. **GitHub Account** with access to both repositories:
   - `podinsight-api` repository
   - `podinsight-dashboard` repository

2. **Vercel Account** (free tier is sufficient)
   - Sign up at [vercel.com](https://vercel.com)
   - Link your GitHub account during signup

3. **Environment Variables** ready:
   - Supabase credentials (URL and anon key)
   - JWT secret for authentication
   - Password protection credentials (for dashboard)

4. **Local Development Environment** (optional but recommended):
   - Node.js 18+ installed
   - Python 3.9+ installed
   - Git installed

## Part 1: Deploying the FastAPI Backend (podinsight-api)

### Step 1: Prepare the Repository

1. **Ensure your repository has the required files:**
   ```
   podinsight-api/
   ├── api/
   │   └── index.py          # Main FastAPI application
   ├── requirements.txt      # Python dependencies
   ├── vercel.json          # Vercel configuration
   └── .gitignore
   ```

2. **Verify `vercel.json` configuration:**
   ```json
   {
     "builds": [
       {
         "src": "api/index.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "api/index.py"
       }
     ]
   }
   ```

3. **Ensure `requirements.txt` includes all dependencies:**
   ```
   fastapi
   uvicorn
   supabase
   pydantic
   python-jose[cryptography]
   passlib[bcrypt]
   python-multipart
   ```

### Step 2: Import Project to Vercel

1. **Log in to Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Click "Add New Project"**
   - Select "Import Git Repository"
   - Choose your GitHub account
   - Find and select `podinsight-api` repository

3. **Configure Project Settings:**
   - **Framework Preset**: Select "Other" (Vercel will auto-detect Python)
   - **Root Directory**: Leave as default (`.`)
   - **Build Command**: Leave empty (Python projects don't need build)
   - **Output Directory**: Leave empty

### Step 3: Configure Environment Variables

1. **In the Vercel project settings, add these environment variables:**

   | Variable Name | Description | Example Value |
   |--------------|-------------|---------------|
   | `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
   | `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
   | `JWT_SECRET_KEY` | Secret for JWT tokens | `your-secret-key-here` |
   | `JWT_ALGORITHM` | JWT algorithm | `HS256` |

2. **Click "Deploy"** after adding all environment variables

### Step 4: Verify API Deployment

1. **Wait for deployment to complete** (usually 2-3 minutes)

2. **Test the API endpoints:**
   ```
   # Health check
   https://your-api-name.vercel.app/health

   # API documentation
   https://your-api-name.vercel.app/docs
   ```

3. **Note your API URL** for dashboard configuration

## Part 2: Deploying the Next.js Dashboard (podinsight-dashboard)

### Step 1: Prepare the Repository

1. **Ensure your repository structure:**
   ```
   podinsight-dashboard/
   ├── app/               # Next.js app directory
   ├── components/        # React components
   ├── lib/              # Utility functions
   ├── public/           # Static assets
   ├── package.json      # Node dependencies
   ├── next.config.js    # Next.js configuration
   ├── middleware.ts     # Auth middleware
   └── .env.example      # Environment variables template
   ```

2. **Update `next.config.js` for API proxy:**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     async rewrites() {
       return [
         {
           source: '/api/backend/:path*',
           destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
         },
       ]
     },
   }
   module.exports = nextConfig
   ```

### Step 2: Import Project to Vercel

1. **Return to Vercel Dashboard**
   - Click "Add New Project" again
   - Select `podinsight-dashboard` repository

2. **Configure Project Settings:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Leave as default
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: Leave as default

### Step 3: Configure Environment Variables

1. **Add these environment variables in Vercel:**

   | Variable Name | Description | Example Value |
   |--------------|-------------|---------------|
   | `NEXT_PUBLIC_API_URL` | Your deployed API URL | `https://podinsight-api.vercel.app` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGc...` |
   | `BASIC_AUTH_USERNAME` | Dashboard username | `admin` |
   | `BASIC_AUTH_PASSWORD` | Dashboard password | `your-secure-password` |
   | `JWT_SECRET_KEY` | Same as API | `your-secret-key-here` |

2. **Click "Deploy"**

### Step 4: Verify Dashboard Deployment

1. **Wait for build and deployment** (3-5 minutes)

2. **Access your dashboard:**
   ```
   https://your-dashboard-name.vercel.app
   ```

3. **Test authentication:**
   - You should see a login prompt
   - Enter the BASIC_AUTH credentials

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

For both projects, you can add custom domains:

1. Go to Project Settings → Domains
2. Add your domain (e.g., `api.podinsight.com`)
3. Follow DNS configuration instructions

### 2. Production Environment Variables

For production deployment, update these variables:

- Use strong, unique passwords
- Generate secure JWT secret: `openssl rand -base64 32`
- Consider using Vercel's environment variable groups

### 3. Monitoring and Logs

1. **Enable Vercel Analytics** (free tier available)
   - Project Settings → Analytics → Enable

2. **Check Function Logs:**
   - Functions tab → View logs
   - Monitor for errors or performance issues

### 4. Automatic Deployments

Vercel automatically deploys on:
- Push to main branch (production)
- Pull requests (preview deployments)

To disable automatic deployments:
- Project Settings → Git → Disable deployments

## Troubleshooting Common Issues

### API Deployment Issues

1. **"Module not found" errors:**
   - Check `requirements.txt` includes all imports
   - Ensure correct Python version (3.9+)

2. **"Function timeout" errors:**
   - Optimize database queries
   - Consider upgrading Vercel plan for longer timeouts

3. **CORS errors:**
   - Add CORS middleware in FastAPI
   - Configure allowed origins

### Dashboard Deployment Issues

1. **"Build failed" errors:**
   - Check `npm run build` works locally
   - Verify all dependencies in `package.json`

2. **"Environment variable not found":**
   - Ensure all `NEXT_PUBLIC_` variables are set
   - Rebuild after adding variables

3. **Authentication not working:**
   - Verify middleware.ts is properly configured
   - Check environment variables match

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Use different values for dev/staging/production
   - Rotate secrets regularly

2. **Access Control:**
   - Keep dashboard password-protected
   - Use strong, unique passwords
   - Consider implementing proper user authentication

3. **API Security:**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS only (Vercel provides this)

## Maintenance and Updates

### Updating the API

1. Push changes to GitHub main branch
2. Vercel auto-deploys within minutes
3. Monitor logs for any issues

### Updating the Dashboard

1. Test changes locally first: `npm run dev`
2. Push to GitHub for auto-deployment
3. Check preview deployment before merging

### Database Migrations

When updating database schema:
1. Apply migrations in Supabase dashboard first
2. Update API models/queries
3. Deploy API changes
4. Update and deploy dashboard

## Support and Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **FastAPI on Vercel**: [FastAPI serverless guide](https://vercel.com/guides/using-fastapi-with-vercel)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Deployment Status**: Check Vercel dashboard for real-time status

---

**Last Updated**: Sprint 1 - Documentation Phase
**Next Review**: End of Sprint 1