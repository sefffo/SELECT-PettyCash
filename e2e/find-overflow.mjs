import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 320, height: 800 } });
  await page.addInitScript(() => {
    localStorage.setItem('vertex-locale', 'en');
    localStorage.setItem('theme-mode', JSON.stringify({ state: { locale: 'en' }, version: 0 }));
  });
  await page.goto('http://localhost:3001/login');
  await page.locator('input[type="email"]').fill('manager@selecteg.com');
  await page.locator('input[type="password"]').fill('password');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/manager\/dashboard/);
  await page.waitForTimeout(900);
  await page.goto('http://localhost:3001/manager/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.goto('http://localhost:3001/manager/requests', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('main *').forEach((el) => {
      const r = el.getBoundingClientRect();
      const sw = el.scrollWidth;
      const cw = el.clientWidth;
      if (sw - cw > 0.5 || r.right > window.innerWidth + 0.5) {
        out.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 70),
          sw,
          cw,
          right: Math.round(r.right * 10) / 10,
          text: (el.innerText || '').slice(0, 30).replace(/\n/g, ' '),
          parent: (el.parentElement?.className || '').toString().slice(0, 40),
        });
      }
    });
    return out.slice(0, 30);
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}

main();
