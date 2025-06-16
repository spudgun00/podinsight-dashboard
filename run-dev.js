const { exec } = require('child_process');
const http = require('http');

console.log('🚀 Starting Next.js development server...\n');

// Start the dev server
const devServer = exec('npx next dev', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});

// Stream output in real-time
devServer.stdout.on('data', (data) => {
  process.stdout.write(data);
});

devServer.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Handle exit
devServer.on('exit', (code) => {
  console.log(`\nDev server exited with code ${code}`);
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down dev server...');
  devServer.kill();
  process.exit();
});

// Health check
setTimeout(() => {
  const healthCheck = setInterval(() => {
    http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Server is healthy');
        clearInterval(healthCheck);
      }
    }).on('error', () => {
      // Server not ready yet
    });
  }, 2000);
}, 5000);

console.log('📡 Server should be available at http://localhost:3000\n');
console.log('Press Ctrl+C to stop\n');