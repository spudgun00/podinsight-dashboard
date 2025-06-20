#!/usr/bin/env node
/**
 * Phase 3 Testing Script
 * Tests all aspects of the enhanced visualizations implementation
 */

const https = require('https');
const http = require('http');

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Test results tracker
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function log(message, type = 'info') {
  const prefix = {
    pass: `${colors.green}✓${colors.reset}`,
    fail: `${colors.red}✗${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`
  };
  console.log(`${prefix[type] || ''} ${message}`);
}

function makeRequest(url, isLocal = false) {
  return new Promise((resolve, reject) => {
    const client = isLocal ? http : https;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function testSignalsAPI() {
  console.log('\n=== Testing Signals API ===');
  
  try {
    const response = await makeRequest('https://podinsight-api.vercel.app/api/signals');
    
    if (response.status === 404) {
      log('Signals endpoint not deployed yet (expected)', 'warn');
      testResults.warnings++;
      return false;
    }
    
    if (response.status === 200) {
      log('Signals endpoint is live!', 'pass');
      testResults.passed++;
      
      // Check response structure
      const data = response.data;
      if (data.signals && data.signal_messages) {
        log('Response has correct structure', 'pass');
        testResults.passed++;
        
        // Check for signal messages
        if (data.signal_messages.length > 0) {
          log(`Found ${data.signal_messages.length} signal messages`, 'pass');
          data.signal_messages.slice(0, 3).forEach(msg => {
            log(`  → ${msg}`, 'info');
          });
          testResults.passed++;
        }
      }
      return true;
    }
  } catch (error) {
    log(`API test failed: ${error.message}`, 'fail');
    testResults.failed++;
    return false;
  }
}

async function testTopicVelocityAPI() {
  console.log('\n=== Testing Topic Velocity API ===');
  
  try {
    const response = await makeRequest('https://podinsight-api.vercel.app/api/topic-velocity?weeks=4');
    
    if (response.status === 200) {
      log('Topic velocity endpoint working', 'pass');
      testResults.passed++;
      
      const data = response.data;
      
      // Check metadata
      if (data.metadata && data.metadata.total_episodes === 1171) {
        log('Correct episode count (1171)', 'pass');
        testResults.passed++;
      } else {
        log('Unexpected episode count', 'fail');
        testResults.failed++;
      }
      
      // Check data structure
      if (data.data && typeof data.data === 'object') {
        const topics = Object.keys(data.data);
        log(`Found ${topics.length} topics: ${topics.join(', ')}`, 'info');
        
        // Check for exact topic names
        const expectedTopics = ["AI Agents", "Capital Efficiency", "DePIN", "B2B SaaS", "Crypto/Web3"];
        const hasAllTopics = expectedTopics.every(topic => topics.includes(topic));
        
        if (hasAllTopics) {
          log('All expected topics present with exact names', 'pass');
          testResults.passed++;
        } else {
          log('Missing or incorrect topic names', 'fail');
          testResults.failed++;
        }
      }
    }
  } catch (error) {
    log(`Topic velocity test failed: ${error.message}`, 'fail');
    testResults.failed++;
  }
}

async function testDashboardIntegration() {
  console.log('\n=== Testing Dashboard Integration ===');
  
  try {
    // Check if dashboard is running
    const response = await makeRequest('http://localhost:3001', true);
    
    if (response.status === 200) {
      log('Dashboard is running', 'pass');
      testResults.passed++;
      
      const html = response.data;
      
      // Check for key components
      const checks = [
        { pattern: /_next\/static/, name: 'Next.js build' },
        { pattern: /TopicVelocityChartFullV0/, name: 'V0 Chart Component' },
        { pattern: /MetricCard/, name: 'Metric Cards' }
      ];
      
      checks.forEach(check => {
        if (html.includes(check.pattern)) {
          log(`Found ${check.name}`, 'pass');
          testResults.passed++;
        } else {
          log(`Missing ${check.name}`, 'fail');
          testResults.failed++;
        }
      });
    } else {
      log('Dashboard not running on port 3001', 'fail');
      testResults.failed++;
    }
  } catch (error) {
    log('Dashboard not accessible - make sure npm run dev is running', 'warn');
    testResults.warnings++;
  }
}

async function testDataFlow() {
  console.log('\n=== Testing Data Flow ===');
  
  // Test the exact topic names
  const exactTopicNames = [
    "AI Agents",
    "Capital Efficiency", 
    "DePIN",
    "B2B SaaS",
    "Crypto/Web3"
  ];
  
  log('Checking exact topic names...', 'info');
  
  try {
    const response = await makeRequest('https://podinsight-api.vercel.app/api/topic-velocity?weeks=1&topics=' + exactTopicNames.join(','));
    
    if (response.status === 200) {
      const data = response.data.data;
      
      // Check Crypto/Web3 specifically (no spaces!)
      if (data["Crypto/Web3"]) {
        log('Crypto/Web3 topic working correctly (no spaces)', 'pass');
        testResults.passed++;
        
        const cryptoData = data["Crypto/Web3"];
        if (cryptoData.length > 0 && cryptoData[0].mentions > 0) {
          log(`Crypto/Web3 has ${cryptoData[0].mentions} mentions`, 'pass');
          testResults.passed++;
        }
      } else {
        log('Crypto/Web3 topic not found - check exact naming', 'fail');
        testResults.failed++;
      }
    }
  } catch (error) {
    log(`Data flow test failed: ${error.message}`, 'fail');
    testResults.failed++;
  }
}

async function checkFiles() {
  console.log('\n=== Checking Created Files ===');
  
  const fs = require('fs');
  const path = require('path');
  
  const filesToCheck = [
    {
      path: './SPRINT1_PHASE3_LOG.md',
      name: 'Sprint 1 Phase 3 Log'
    },
    {
      path: './lib/api.ts',
      contains: 'fetchTopicSignals',
      name: 'API fetchTopicSignals function'
    },
    {
      path: './components/dashboard/topic-velocity-chart-full-v0.tsx',
      contains: 'fetchTopicSignals',
      name: 'Chart signal integration'
    },
    {
      path: '../podinsight-etl/signal_service.py',
      name: 'Signal service script'
    },
    {
      path: '../podinsight-etl/004_topic_signals.up.sql',
      name: 'Database migration'
    }
  ];
  
  filesToCheck.forEach(file => {
    try {
      const exists = fs.existsSync(file.path);
      if (exists) {
        if (file.contains) {
          const content = fs.readFileSync(file.path, 'utf8');
          if (content.includes(file.contains)) {
            log(`${file.name} exists and contains ${file.contains}`, 'pass');
            testResults.passed++;
          } else {
            log(`${file.name} exists but missing ${file.contains}`, 'fail');
            testResults.failed++;
          }
        } else {
          log(`${file.name} exists`, 'pass');
          testResults.passed++;
        }
      } else {
        log(`${file.name} not found at ${file.path}`, 'fail');
        testResults.failed++;
      }
    } catch (error) {
      log(`Could not check ${file.name}: ${error.message}`, 'warn');
      testResults.warnings++;
    }
  });
}

async function runAllTests() {
  console.log(`${colors.blue}=== Phase 3 Integration Tests ===${colors.reset}`);
  console.log('Testing enhanced visualizations implementation...\n');
  
  await testTopicVelocityAPI();
  await testSignalsAPI();
  await testDashboardIntegration();
  await testDataFlow();
  await checkFiles();
  
  // Summary
  console.log(`\n${colors.blue}=== Test Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed:${colors.reset} ${testResults.passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${testResults.failed}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${testResults.warnings}`);
  
  const total = testResults.passed + testResults.failed;
  const percentage = total > 0 ? Math.round((testResults.passed / total) * 100) : 0;
  
  console.log(`\nOverall: ${percentage}% passed`);
  
  if (testResults.failed === 0) {
    console.log(`\n${colors.green}All tests passed! 🎉${colors.reset}`);
  } else {
    console.log(`\n${colors.red}Some tests failed. Check the output above.${colors.reset}`);
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});