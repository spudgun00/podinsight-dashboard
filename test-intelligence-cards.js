// Test script to verify Episode Intelligence cards
const http = require('http');

function testDashboard() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001/dashboard-api-example', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n=== Episode Intelligence Dashboard Test Results ===\n');
        
        // Test 1: Page loads
        const pageLoaded = data.includes('Episode Intelligence Dashboard');
        console.log(`✓ Page Loaded: ${pageLoaded ? 'YES' : 'NO'}`);
        
        // Test 2: Check for loading or data
        const hasLoading = data.includes('Loading') || data.includes('loading');
        const hasData = data.includes('Market Signals') || data.includes('Deal Intelligence') || 
                       data.includes('Portfolio Pulse') || data.includes('Executive Brief');
        
        console.log(`✓ Loading State: ${hasLoading ? 'Present' : 'Not found'}`);
        console.log(`✓ Card Data: ${hasData ? 'Present' : 'Not found'}`);
        
        // Test 3: Check for mock data indicators
        const mockIndicators = [
          'OpenAI', 'Anthropic', 'All-In', '20VC', 
          'Helium', 'DePIN', 'Stripe', 'Vercel'
        ];
        
        const foundMockData = mockIndicators.some(indicator => data.includes(indicator));
        console.log(`✓ Mock Data Active: ${foundMockData ? 'YES' : 'NO'}`);
        
        // Test 4: Check for React components
        const hasReactComponents = data.includes('__next') && data.includes('static/chunks');
        console.log(`✓ React App Loaded: ${hasReactComponents ? 'YES' : 'NO'}`);
        
        // Test 5: Extract visible text content
        console.log('\n--- Extracting Visible Content ---');
        
        // Try to find card titles
        const cardPatterns = [
          /Market Signals/g,
          /Deal Intelligence/g,
          /Portfolio Pulse/g,
          /Executive Brief/g
        ];
        
        cardPatterns.forEach(pattern => {
          if (data.match(pattern)) {
            console.log(`✓ Found card: ${pattern.source}`);
          }
        });
        
        // Check for signal content
        const signalPattern = /<p[^>]*class="[^"]*text-sm[^"]*"[^>]*>([^<]+)<\/p>/g;
        const signals = [];
        let match;
        
        while ((match = signalPattern.exec(data)) !== null) {
          const text = match[1].trim();
          if (text.length > 20 && !text.includes('Loading')) {
            signals.push(text);
          }
        }
        
        if (signals.length > 0) {
          console.log(`\n✓ Found ${signals.length} signals:`);
          signals.slice(0, 5).forEach((signal, i) => {
            console.log(`  ${i + 1}. ${signal.substring(0, 60)}...`);
          });
        } else {
          console.log('\n❌ No signals found - page might still be loading');
        }
        
        // Summary
        console.log('\n=== Test Summary ===');
        const allTestsPassed = pageLoaded && (hasLoading || hasData) && hasReactComponents;
        console.log(`Overall Status: ${allTestsPassed ? '✅ PASS' : '❌ FAIL'}`);
        
        if (!hasData && hasLoading) {
          console.log('Note: Page is in loading state. Wait a moment and test again.');
        }
        
        resolve(allTestsPassed);
      });
    }).on('error', (err) => {
      console.error('Error connecting to server:', err.message);
      reject(err);
    });
  });
}

// Run test
testDashboard()
  .then(() => {
    console.log('\nTest completed successfully');
  })
  .catch(err => {
    console.error('\nTest failed:', err);
    process.exit(1);
  });