// Test script to understand the API endpoints
const API_BASE = 'https://podinsight-api.vercel.app';

async function testAPI() {
  console.log('Testing Episode Intelligence API Endpoints...\n');

  try {
    // 1. Test dashboard endpoint
    console.log('1. Testing /api/intelligence/dashboard');
    const dashboardRes = await fetch(`${API_BASE}/api/intelligence/dashboard?limit=8`);
    const dashboardData = await dashboardRes.json();
    console.log('Dashboard Response:', JSON.stringify(dashboardData, null, 2));
    console.log(`Episodes returned: ${dashboardData.episodes?.length || 0}\n`);

    // 2. Test debug endpoint to see what episodes exist
    console.log('2. Testing /api/intelligence/find-episodes-with-intelligence');
    const debugRes = await fetch(`${API_BASE}/api/intelligence/find-episodes-with-intelligence`);
    const debugData = await debugRes.json();
    console.log(`Total episodes with intelligence: ${debugData.total_intelligence_docs}`);
    console.log(`First 3 episodes:`, debugData.matches?.slice(0, 3).map(e => ({
      id: e.episode_id_in_intelligence,
      title: e.title
    })));

    // 3. Test individual brief endpoint with first episode
    if (debugData.matches && debugData.matches.length > 0) {
      const firstEpisodeId = debugData.matches[0].episode_id_in_intelligence;
      console.log(`\n3. Testing /api/intelligence/brief/${firstEpisodeId}`);
      const briefRes = await fetch(`${API_BASE}/api/intelligence/brief/${firstEpisodeId}`);
      const briefData = await briefRes.json();
      console.log('Brief Response:', {
        episode_id: briefData.episode_id,
        title: briefData.title,
        podcast_name: briefData.podcast_name,
        signals_count: briefData.signals?.length || 0,
        signal_types: briefData.signals?.map(s => s.signal_type) || []
      });
    }

    // 4. Test if dashboard accepts different parameters
    console.log('\n4. Testing dashboard with different parameters');
    const testParams = [
      '',
      '?limit=20',
      '?offset=0',
      '?user_id=test'
    ];

    for (const params of testParams) {
      const res = await fetch(`${API_BASE}/api/intelligence/dashboard${params}`);
      const data = await res.json();
      console.log(`  ${params || '(no params)'}: ${data.episodes?.length || 0} episodes`);
    }

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();