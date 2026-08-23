import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'http://localhost:3001';
const WIDTH_EXPANDED = 280;
const WIDTH_COLLAPSED = 76;

const config = {
  manager: {
    path: '/manager/dashboard',
    panelLabel: 'Manager Panel',
    panelLabelAr: 'لوحة المدير',
    nav: [
      { label: 'Dashboard', path: '/manager/dashboard' },
      { label: 'Requests', path: '/manager/requests' },
      { label: 'Employees', path: '/manager/employees', tableTitle: 'Employees' },
      { label: 'Profile', path: '/manager/profile' },
    ],
    badge: true,
  },
  admin: {
    path: '/admin/dashboard',
    panelLabel: 'Admin Panel',
    panelLabelAr: 'لوحة المشرف',
    nav: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Employees', path: '/admin/employees', tableTitle: 'Employee Management' },
      { label: 'Requests', path: '/admin/requests' },
      { label: 'Profile', path: '/admin/profile' },
    ],
    badge: true,
  },
  finance: {
    path: '/finance',
    panelLabel: 'Finance Panel',
    panelLabelAr: 'لوحة المالية',
    nav: [
      { label: 'Finance Overview', path: '/finance' },
      { label: 'Transaction History', path: '/finance/transactions' },
      { label: 'Settings', path: '/finance/settings' },
      { label: 'Finance Profile', path: '/finance/profile' },
    ],
    badge: false,
  },
};

const browser = await chromium.launch();
let failed = 0;
const check = (role, name, ok) => {
  if (!ok) {
    failed++;
    console.log(`FAIL [${role}] ${name}`);
  }
};

for (const [role, cfg] of Object.entries(config)) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });

  const seed = {
    'auth-token': `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1${role}J9.mocked`,
    'pretty-cash-session': JSON.stringify({ state: { user: { id: `u-${role}`, name: 'Tester', email: `${role}@company.com`, avatar: '', role: 'Employee', department: 'Sales', status: 'active', userRole: role, createdAt: '', updatedAt: '' }, isAuthenticated: true, role, sessionExpiresAt: Date.now() + 3600000 }, version: 0 }),
    'vertex-locale': 'en',
    'theme-mode': JSON.stringify({ state: { locale: 'en', mode: 'light' }, version: 0 }),
  };

  await page.addInitScript((s) => {
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
  }, seed);

  await page.route('**/api/execute', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': '*' } });
    }
    const body = route.request().postDataJSON();
    const respond = (data) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ StatusCode: 0, Message: 'OK', Data: data }) });
    const action = body?.Action ?? '';
    if (/Get(?:All)?Notifications$/.test(action)) {
      return respond(cfg.badge ? [
        { Id: 'n1', Title: 'Request approved', Message: 'Your request was approved', IsRead: false },
        { Id: 'n2', Title: 'New request', Message: 'A new request arrived', IsRead: false },
      ] : []);
    }
    return respond([]);
  });

  await page.goto(`${BASE}${cfg.path}`, { waitUntil: 'networkidle' });
  const sidebar = page.locator('[data-testid="sidebar"]');
  await sidebar.waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(1500);

  // --- Expanded state ---
  check(role, 'sidebar visible', await sidebar.isVisible());
  let box = await sidebar.boundingBox();
  check(role, `expanded width ${WIDTH_EXPANDED}`, box && Math.round(box.width) === WIDTH_EXPANDED);

  const bodyText = await page.locator('body').innerText();
  check(role, `panel label "${cfg.panelLabel}"`, bodyText.includes(cfg.panelLabel));
  check(role, 'brand "Petty Cash"', bodyText.includes('Petty Cash'));
  check(role, '"MENU" section label', bodyText.includes('MENU'));
  check(role, 'user name shown', bodyText.includes('Tester'));
  for (const item of cfg.nav) {
    check(role, `nav item "${item.label}" (expanded)`, bodyText.includes(item.label));
  }
  const sidebarText = await sidebar.innerText();
  for (const row of ['Notifications', 'Language', 'Theme']) {
    check(role, `utility row "${row}" in menu`, sidebarText.includes(row));
  }
  check(role, 'no separate "SETTINGS" section', !sidebarText.includes('SETTINGS'));
  const orderPositions = ['MENU', cfg.nav[0].label, cfg.nav[cfg.nav.length - 1].label, 'Notifications', 'Language', 'Theme', 'Logout']
    .map((label) => sidebarText.indexOf(label));
  check(role, 'menu order: MENU → nav items → utilities → Logout', orderPositions.every((p) => p >= 0) && orderPositions.every((p, i, a) => i === 0 || p > a[i - 1]));

  // --- Badge (admin/manager only) ---
  if (cfg.badge) {
    const badge = sidebar.locator('.MuiBadge-badge').first();
    let badgeText = '';
    try {
      await badge.waitFor({ state: 'visible', timeout: 15000 });
      badgeText = (await badge.innerText()).trim();
    } catch {
      badgeText = '';
    }
    check(role, 'notification badge shows unread count 2', badgeText === '2');
  }

  // --- Click-through each nav item (destinations unchanged) ---
  for (const item of cfg.nav) {
    await sidebar.getByRole('button', { name: item.label, exact: true }).click();
    try {
      await page.waitForURL(`**${item.path}`, { timeout: 15000 });
    } catch {
      check(role, `"${item.label}" navigates to ${item.path}`, false);
      continue;
    }
    check(role, `"${item.label}" navigates to ${item.path}`, true);
    if (item.tableTitle) {
      let rendered = false;
      try {
        await page.getByText(item.tableTitle, { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 });
        rendered = true;
      } catch {
        rendered = false;
      }
      check(role, `"${item.label}" page renders "${item.tableTitle}"`, rendered);
    }
    await page.goto(`${BASE}${cfg.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
  }

  // --- Collapsed state ---
  await page.goto(`${BASE}${cfg.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await sidebar.getByRole('button', { name: 'Collapse sidebar' }).click();
  await page.waitForTimeout(700);
  box = await sidebar.boundingBox();
  check(role, `collapsed width ${WIDTH_COLLAPSED}`, box && Math.round(box.width) === WIDTH_COLLAPSED);

  const iconButtons = sidebar.locator('button');
  check(role, 'collapsed: all nav icon buttons remain', (await iconButtons.count()) >= cfg.nav.length + 3);

  for (let i = 0; i < cfg.nav.length; i++) {
    const item = cfg.nav[i];
    await iconButtons.nth(i + 1).hover();
    await page.waitForTimeout(500);
    let tipText = '';
    try {
      const tooltip = page.getByRole('tooltip').last();
      await tooltip.waitFor({ state: 'visible', timeout: 3000 });
      tipText = (await tooltip.innerText()).trim();
    } catch {
      tipText = '';
    }
    check(role, `collapsed: tooltip "${item.label}" shows`, tipText === item.label);
  }

  const utilities = ['Notifications', 'Language', 'Theme'];
  for (let i = 0; i < utilities.length; i++) {
    await iconButtons.nth(cfg.nav.length + 1 + i).hover();
    await page.waitForTimeout(500);
    let tipText = '';
    try {
      const tooltip = page.getByRole('tooltip').last();
      await tooltip.waitFor({ state: 'visible', timeout: 3000 });
      tipText = (await tooltip.innerText()).trim();
    } catch {
      tipText = '';
    }
    check(role, `collapsed: tooltip "${utilities[i]}" shows`, tipText === utilities[i]);
  }

  // --- Expand back ---
  await sidebar.getByRole('button', { name: 'Expand sidebar' }).click();
  await page.waitForTimeout(700);
  box = await sidebar.boundingBox();
  check(role, 'expand restores width', box && Math.round(box.width) === WIDTH_EXPANDED);

  // --- Language & Theme utility rows work (and toggle back) ---
  const langBtn = sidebar.locator('button').nth(cfg.nav.length + 2);
  const themeBtn = sidebar.locator('button').nth(cfg.nav.length + 3);
  await langBtn.click();
  await page.waitForTimeout(900);
  const bodyAr = await page.locator('body').innerText();
  check(role, 'Language row switches UI to Arabic', bodyAr.includes(cfg.panelLabelAr));
  await langBtn.click();
  await page.waitForTimeout(900);
  const bodyEn = await page.locator('body').innerText();
  check(role, 'Language row switches back to English', bodyEn.includes(cfg.panelLabel));

  await themeBtn.click();
  await page.waitForTimeout(600);
  const modeDark = await page.evaluate(() => JSON.parse(localStorage.getItem('theme-mode') ?? '{}'));
  check(role, 'Theme row applies dark mode', modeDark?.state?.mode === 'dark');
  await themeBtn.click();
  await page.waitForTimeout(600);
  const modeLight = await page.evaluate(() => JSON.parse(localStorage.getItem('theme-mode') ?? '{}'));
  check(role, 'Theme row switches back to light mode', modeLight?.state?.mode === 'light');

  await page.close();
}

await browser.close();

if (failed > 0) {
  console.log(`FAIL: ${failed} assertion(s)`);
  process.exit(1);
}
console.log('PASS (manager/admin/finance sidebars — expanded + collapsed + navigation)');