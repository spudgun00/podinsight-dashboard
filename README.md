# PodInsightHQ Dashboard

A real-time dashboard displaying podcast topic velocity trends across the startup/VC ecosystem.

## Features

- **Topic Velocity Chart**: Interactive line chart showing trending topics over time
- **Real-time Data**: Connected to live API with 1,171 processed podcast episodes
- **Dark Theme**: Professional dark mode interface optimized for data visualization
- **Responsive Charts**: Built with Recharts for smooth interactions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Fetching**: Native fetch with Next.js caching
- **Authentication**: Basic auth via middleware

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Environment Variables

Create a `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://podinsight-api.vercel.app

# Basic Auth (for staging)
BASIC_AUTH_PASSWORD=your_secure_password
```

## API Integration

The dashboard connects to the PodInsightHQ API:
- **Endpoint**: `https://podinsight-api.vercel.app/api/topic-velocity`
- **Response Time**: ~50ms average
- **Data Format**: Recharts-compatible JSON

### Tracked Topics

The dashboard tracks these 5 topics (exact spelling required):
- "AI Agents"
- "Capital Efficiency"
- "DePIN"
- "B2B SaaS"
- "Crypto/Web3" (no spaces around /)

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `BASIC_AUTH_PASSWORD`
4. Deploy

## Project Structure

```
podinsight-dashboard/
├── app/
│   ├── layout.tsx       # Root layout with dark theme
│   ├── page.tsx         # Main dashboard page
│   └── globals.css      # Global styles
├── components/
│   ├── TopicVelocityChart.tsx  # Main chart component
│   └── LoadingSkeleton.tsx     # Loading state
├── lib/
│   ├── api.ts           # API client functions
│   └── utils.ts         # Helper functions
├── types/
│   └── analytics.ts     # TypeScript interfaces
└── middleware.ts        # Basic auth middleware
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Performance

- Page load target: < 2 seconds
- API response time: ~50ms
- Chart rendering: Optimized with React.memo

## License

Private - PodInsightHQ