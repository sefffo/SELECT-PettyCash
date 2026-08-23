import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const locale = process.argv[2] ?? 'en';
const isAr = locale === 'ar';
const arNav = JSON.parse(readFileSync(join(root, 'src', 'messages', 'ar.json'), 'utf8')).nav;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const seed = {
  'auth-token': 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1MyJ9.mocked',
  'pretty-cash-session': JSON.stringify({ state: { user: { id: 'u3', name: 'Menna', email: 'menna@company.com', avatar: '', role: 'Employee', department: 'Sales', status: 'active', userRole: 'employee', createdAt: '', updatedAt: '' }, isAuthenticated: true, role: 'employee', sessionExpiresAt: Date.now() + 3600000 }, version: 0 }),
  'vertex-locale': locale,
  'theme-mode': JSON.stringify({ state: { locale, mode: 'light' }, version: 0 }),
};

await page.addInitScript((s) => {
  for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
}, seed);

const notifications = [
  { Id: 'n1', Type: 'Approved', Title: 'Request approved', Message: 'Your request req-100 was approved', CreatedAt: '2026-08-15T10:00:00Z', IsRead: false, RequestId: 'req-100' },
  { Id: 'n2', Type: 'Pending', Title: 'Request pending', Message: 'Your request req-101 is pending review', CreatedAt: '2026-08-14T09:00:00Z', IsRead: true, RequestId: 'req-101' },
];

await page.route('**/api/execute', async (route) => {
  const body = route.request().postDataJSON();
  const action = body?.Action ?? '';
  const respond = (data) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': '*' },
    body: JSON.stringify({ StatusCode: 0, Message: 'OK', Data: data }),
  });
  if (action === 'Employee/GetNotifications') return respond(notifications);
  if (action === 'Auth/Login') return respond({ Token: 'mock', User: { Id: 'u3', Name: 'Menna', Email: 'menna@company.com', Role: 'Employee' } });
  return respond([]);
});

await page.goto('http://localhost:3001/employee/dashboard', { waitUntil: 'networkidle' });
const sidebar = page.locator('[data-testid=sidebar]');
await sidebar.waitFor({ state: 'visible', timeout: 20000 });
await page.waitForTimeout(1500);

if (page.url().includes('/login')) errors.push('redirected to login — session seed failed');
const navText = (await sidebar.allInnerTexts()).join(' ');
const expectedLabels = isAr
  ? [arNav.dashboard, arNav.requests, arNav.profile, arNav.notifications, arNav.settings]
  : ['Dashboard', 'Requests', 'Profile', 'Notifications', 'Settings'];
for (const label of expectedLabels) {
  if (!navText.includes(label)) errors.push(`missing nav item: ${label}`);
}
const bodyText = await page.locator('body').innerText();
if (bodyText.includes('Language') && bodyText.includes('Theme')) errors.push('inline settings controls still in sidebar');
const badgeCount = await page.locator('.MuiBadge-badge', { hasText: '1' }).count();
if (badgeCount === 0) errors.push('notification badge not visible');

await page.screenshot({ path: join(root, 'e2e', 'screenshots', `employee-sidebar-${locale}.png`) });

await sidebar.locator('button').first().click();
await page.waitForTimeout(500);
const badgeCollapsed = await page.locator('.MuiBadge-badge', { hasText: '1' }).count();
if (badgeCollapsed === 0) errors.push('badge missing in collapsed state');
await page.screenshot({ path: join(root, 'e2e', 'screenshots', `employee-sidebar-collapsed-${locale}.png`) });
await sidebar.locator('button').first().click();
await page.waitForTimeout(400);

await sidebar.getByRole('button', { name: new RegExp(isAr ? arNav.notifications : 'Notifications') }).click();
await page.waitForTimeout(1200);
let url = page.url();
if (!url.includes('/employee/notifications')) errors.push(`notifications nav failed: ${url}`);
const pageText = await page.locator('body').innerText();
if (!pageText.includes('Request approved')) errors.push('notifications list missing');
await page.screenshot({ path: join(root, 'e2e', 'screenshots', `employee-notifications-${locale}.png`) });

await sidebar.getByRole('button', { name: new RegExp(isAr ? arNav.settings : 'Settings') }).click();
await page.waitForTimeout(1200);
url = page.url();
if (!url.includes('/employee/settings')) errors.push(`settings nav failed: ${url}`);
const settingsText = await page.locator('body').innerText();
const appearanceLabel = isAr ? '\u0627\u0644\u0645\u0638\u0647\u0631' : 'Appearance';
if (!settingsText.includes(appearanceLabel)) errors.push('settings appearance section missing');
const changePasswordLabel = isAr ? '\u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631' : 'Change Password';
if (!settingsText.includes(changePasswordLabel)) errors.push('change password section missing');
await page.screenshot({ path: join(root, 'e2e', 'screenshots', `employee-settings-${locale}.png`) });

const submitBtn = page.getByRole('button', { name: new RegExp(changePasswordLabel) });
if ((await submitBtn.count()) === 0) {
  errors.push('change password submit button missing');
} else {
  await submitBtn.click();
  await page.waitForTimeout(500);
  const afterSubmit = await page.locator('body').innerText();
  if (!afterSubmit.includes('Current password is required')) errors.push('empty-form validation errors not shown');
}

await page.locator('label', { hasText: new RegExp(isAr ? '\u062f\u0627\u0643\u0646' : 'Dark') }).click();
await page.waitForTimeout(600);
const modeDark = await page.evaluate(() => JSON.parse(localStorage.getItem('theme-mode') ?? '{}'));
if (modeDark?.state?.mode !== 'dark') errors.push('theme radio did not apply dark mode');

await page.locator('[role="combobox"]').click();
await page.waitForTimeout(300);
await page.locator('[role="option"]', { hasText: isAr ? 'English' : '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' }).click();
await page.waitForTimeout(1200);
const bodyAfter = await page.locator('body').innerText();
const expectedAfter = isAr ? 'Employee Panel' : '\u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0648\u0638\u0641';
if (!bodyAfter.includes(expectedAfter)) errors.push('language select did not switch the UI language');

await browser.close();

console.log(errors.length ? `FAIL (${locale})\n- ${errors.join('\n- ')}` : `PASS (${locale})`);
process.exit(errors.length ? 1 : 0);