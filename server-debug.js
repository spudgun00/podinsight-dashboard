const { spawn } = require('child_process');
const http = require('http');

console.log('[DEBUG] Starting Next.js dev server debugging...');

// Function to check if server is responding
function checkServer(attempt = 1) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`[DEBUG] Server responded with status: ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.log(`[DEBUG] Attempt ${attempt} - Server not responding:`, err.code);
    if (attempt < 10) {
      setTimeout(() => checkServer(attempt + 1), 2000);
    }
  });

  req.on('timeout', () => {
    console.log(`[DEBUG] Attempt ${attempt} - Request timed out`);
    req.destroy();
  });

  req.end();
}

// Start the Next.js dev server
const next = spawn('npx', ['next', 'dev', '-H', '0.0.0.0'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env }
});

console.log(`[DEBUG] Next.js process started with PID: ${next.pid}`);

// Capture stdout
next.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`[NEXT.JS OUTPUT] ${output.trim()}`);
  
  if (output.includes('Ready in')) {
    console.log('[DEBUG] Next.js reports ready, starting server checks...');
    setTimeout(() => checkServer(), 2000);
  }
});

// Capture stderr
next.stderr.on('data', (data) => {
  console.error(`[NEXT.JS ERROR] ${data.toString().trim()}`);
});

// Handle process exit
next.on('exit', (code, signal) => {
  console.log(`[DEBUG] Next.js process exited with code ${code} and signal ${signal}`);
});

// Handle process errors
next.on('error', (err) => {
  console.error('[DEBUG] Failed to start Next.js process:', err);
});

// Keep the script running
process.on('SIGINT', () => {
  console.log('\n[DEBUG] Shutting down...');
  next.kill();
  process.exit();
});

console.log('[DEBUG] Monitoring Next.js dev server...');
console.log('[DEBUG] Press Ctrl+C to stop');