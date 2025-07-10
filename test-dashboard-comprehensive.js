// Comprehensive test of dashboard endpoint with various approaches
const API_BASE = 'https://podinsight-api.vercel.app';

async function testDashboardEndpoint() {
  console.log('=== COMPREHENSIVE DASHBOARD ENDPOINT TEST ===\n');

  // Test 1: Basic request
  console.log('1. Basic Request:');
  try {
    const res1 = await fetch(`${API_BASE}/api/intelligence/dashboard`);
    const data1 = await res1.json();
    console.log(`   Status: ${res1.status}`);
    console.log(`   Episodes: ${data1.episodes?.length || 0}`);
    console.log(`   Response:`, JSON.stringify(data1, null, 2));
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // Test 2: With query parameters
  console.log('\n2. With Query Parameters:');
  const params = [
    'limit=6',
    'limit=8',
    'limit=20',
    'offset=0&limit=6',
    'user_id=default',
    'include_signals=true'
  ];

  for (const param of params) {
    try {
      const res = await fetch(`${API_BASE}/api/intelligence/dashboard?${param}`);
      const data = await res.json();
      console.log(`   ?${param} → ${data.episodes?.length || 0} episodes`);
    } catch (e) {
      console.log(`   ?${param} → Error: ${e.message}`);
    }
  }

  // Test 3: With different headers
  console.log('\n3. With Headers:');
  const headerTests = [
    { 'Content-Type': 'application/json' },
    { 'Accept': 'application/json' },
    { 'Authorization': 'Bearer test-token' },
    { 'X-User-ID': 'test-user' }
  ];

  for (const headers of headerTests) {
    try {
      const res = await fetch(`${API_BASE}/api/intelligence/dashboard?limit=6`, { headers });
      const data = await res.json();
      console.log(`   ${Object.keys(headers)[0]} → ${data.episodes?.length || 0} episodes`);
    } catch (e) {
      console.log(`   ${Object.keys(headers)[0]} → Error: ${e.message}`);
    }
  }

  // Test 4: POST request (in case it's not GET)
  console.log('\n4. POST Request Test:');
  try {
    const res = await fetch(`${API_BASE}/api/intelligence/dashboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 6 })
    });
    const data = await res.json();
    console.log(`   POST → Status: ${res.status}, Episodes: ${data.episodes?.length || 0}`);
  } catch (e) {
    console.log(`   POST → Error: ${e.message}`);
  }

  // Test 5: Check if there's a different endpoint pattern
  console.log('\n5. Alternative Endpoint Patterns:');
  const alternativeEndpoints = [
    '/api/intelligence/episodes/dashboard',
    '/api/intelligence/episodes?dashboard=true',
    '/api/intelligence/summary',
    '/api/intelligence/latest',
    '/api/dashboard/intelligence'
  ];

  for (const endpoint of alternativeEndpoints) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      console.log(`   ${endpoint} → Status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`      Success! Data:`, data);
      }
    } catch (e) {
      console.log(`   ${endpoint} → Error: ${e.message}`);
    }
  }

  // Test 6: Compare with working brief endpoint
  console.log('\n6. Working Brief Endpoint (for comparison):');
  try {
    const res = await fetch(`${API_BASE}/api/intelligence/brief/02fc268c-61dc-4074-b7ec-882615bc6d85`);
    const data = await res.json();
    console.log(`   Brief endpoint works: ${!!data.episode_id}`);
    console.log(`   Has signals: ${data.signals?.length || 0}`);
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }

  // Test 7: Check API health/status
  console.log('\n7. API Health Check:');
  try {
    const res = await fetch(`${API_BASE}/`);
    const text = await res.text();
    console.log(`   Root endpoint: ${res.status} - ${text.substring(0, 50)}...`);
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }
}

testDashboardEndpoint();