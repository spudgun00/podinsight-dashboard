const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing Mock Data Dashboard...\n');
  
  // Navigate to the dashboard
  await page.goto('http://localhost:3001/dashboard-api-example');
  
  // Wait for cards to load
  await page.waitForSelector('section', { timeout: 5000 });
  
  // Check for intelligence cards
  const cards = await page.$$('div[class*="rounded-xl"]');
  console.log(`✓ Found ${cards.length} intelligence cards`);
  
  // Check card titles
  const titles = await page.$$eval('h3', elements => elements.map(el => el.textContent));
  console.log('\nCard Titles:');
  titles.forEach(title => console.log(`  - ${title}`));
  
  // Check for signals
  const signals = await page.$$eval('p[class*="text-sm"]', elements => 
    elements.map(el => el.textContent).filter(text => text && text.length > 20)
  );
  console.log(`\n✓ Found ${signals.length} signals`);
  console.log('\nSample Signals:');
  signals.slice(0, 3).forEach(signal => console.log(`  - ${signal.substring(0, 60)}...`));
  
  // Test clicking a signal
  const firstSignal = await page.$('div[class*="cursor-pointer"]');
  if (firstSignal) {
    await firstSignal.click();
    await page.waitForTimeout(1000);
    
    const modal = await page.$('div[role="dialog"]');
    if (modal) {
      console.log('\n✓ Modal opened successfully');
      
      // Check modal content
      const modalTitle = await page.$eval('div[role="dialog"] h2', el => el.textContent);
      console.log(`  Modal Title: ${modalTitle}`);
    }
  }
  
  // Check for loading states
  const isLoading = await page.$('div[class*="animate-pulse"]');
  console.log(`\n✓ Loading state: ${isLoading ? 'Present (still loading)' : 'Completed'}`);
  
  // Check for errors
  const errorElement = await page.$('div[class*="text-red"]');
  if (errorElement) {
    const errorText = await errorElement.textContent();
    console.log(`\n❌ Error found: ${errorText}`);
  } else {
    console.log('\n✓ No errors detected');
  }
  
  await browser.close();
})();