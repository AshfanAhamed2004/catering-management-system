const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'load', timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('DONE');
  await browser.close();
})();
