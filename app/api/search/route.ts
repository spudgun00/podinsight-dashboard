import { NextRequest, NextResponse } from 'next/server'

// Increase timeout for this route (default is 10s)
export const runtime = 'nodejs'
export const maxDuration = 45 // 45 seconds (to handle Modal cold starts)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, limit = 10, offset = 0 } = body

    console.log(`[Search API] Proxying request for query: "${query}"`)

    // Call the external PodInsight API with a timeout
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://podinsight-api.vercel.app'
    
    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 40000) // 40 second timeout (Modal cold start ~20s + OpenAI ~10s)
    
    try {
      const response = await fetch(`${apiUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit, offset }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`[Search API] Successfully proxied response for: "${query}"`)
      return NextResponse.json(data)
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error('[Search API] Request timeout after 25s for:', query)
        return NextResponse.json(
          { error: 'Search took too long. The AI might be processing. Please try again.' },
          { status: 504 }
        )
      }
      throw fetchError
    }

  } catch (error) {
    console.error('[Search API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    )
  }
}