import { NextRequest, NextResponse } from 'next/server'

// Regex to validate a GUID format (8-4-4-4-12 hex pattern)
const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export async function GET(
  request: NextRequest,
  { params }: { params: { episode_id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startTimeMs = searchParams.get('start_time_ms')
    const durationMs = searchParams.get('duration_ms') || '30000'

    if (!startTimeMs) {
      return NextResponse.json(
        { error: 'start_time_ms is required' },
        { status: 400 }
      )
    }

    // Check if it's a valid GUID or ObjectId format
    const isValidGuid = guidRegex.test(params.episode_id)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(params.episode_id)
    const isSubstack = /^substack:post:\d+$/.test(params.episode_id)
    const isFlightcast = /^flightcast:episode:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(params.episode_id)
    
    // API now accepts GUID, ObjectId, Substack, and Flightcast formats
    if (!isValidGuid && !isObjectId && !isSubstack && !isFlightcast) {
      return NextResponse.json(
        { 
          error: 'Invalid episode_id format.',
          received: params.episode_id,
          expected_formats: [
            'GUID: 8-4-4-4-12 format (e.g., 022f8502-14c3-11f0-9b7c-bf77561f0071)',
            'ObjectId: 24 hex characters (e.g., 685ba776e4f9ec2f0756267a)',
            'Substack: substack:post:NUMBER (e.g., substack:post:162914366)',
            'Flightcast: flightcast:episode:GUID (e.g., flightcast:episode:022f8502-14c3-11f0-9b7c-bf77561f0071)'
          ]
        },
        { status: 400 }
      )
    }

    // Call the external PodInsight API with timeout
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://podinsight-api.vercel.app'
    const fullUrl = `${apiUrl}/api/v1/audio_clips/${params.episode_id}?start_time_ms=${startTimeMs}&duration_ms=${durationMs}`
    
    // Add AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const response = await fetch(fullUrl, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `API responded with status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If response isn't JSON, try text
          try {
            const errorText = await response.text()
            errorMessage = errorText || errorMessage
          } catch (e2) {
            // Use default error message
          }
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return NextResponse.json(data)
      
    } catch (fetchError: any) {
      // Clear timeout on error
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        console.error('Audio clip API timeout after 10 seconds')
        return NextResponse.json(
          { error: 'Audio clip request timed out. Please try again.' },
          { status: 504 }
        )
      }
      throw fetchError
    }

  } catch (error) {
    console.error('Audio clip API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audio clip' },
      { status: 500 }
    )
  }
}