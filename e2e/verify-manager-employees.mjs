import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3001';
const WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440];
const LOCALES = [
  { code: 'en', dir: 'ltr' },
  { code: 'ar', dir: 'rtl' },
];

const USERS = [
  { Id: 'u1', Name: 'Ahmed Hassan', Email: 'ahmed@selecteg.com', Role: 'Employee', DepartmentId: 'd1', Status: 'Active' },
  { Id: 'u2', Name: 'Maya ', Email: 'maya@selecteg.com', Role: 'Employee', DepartmentId: 'd2', Status: 'Active' },
  { Id: 'u3', Name: 'Sara Ali', Email: 'sara@selecteg.com', Role: 'Employee', DepartmentId: 'd1', Status: 'Active' },
  { Id: 'u4', Name: 'Omar Khaled Ibrahim', Email: 'omar@selecteg.com', Role: 'Employee', DepartmentId: 'd2', Status: 'Inactive' },
  { Id: 'u5', Name: 'Mariam Youssef', Email: 'mariam@selecteg.com', Role: 'Manager', DepartmentId: 'd1', Status: 'Active' },
  { Id: 'u6', Name: 'Karim Mostafa', Email: 'karim@selecteg.com', Role: 'Employee', DepartmentId: 'd3', Status: 'Active' },
  { Id: 'u7', Name: 'Nour Adel', Email: 'nour@selecteg.com', Role: 'Finance', DepartmentId: 'd3', Status: 'Active' },
  { Id: 'u8', Name: 'Hana Sherif', Email: 'hana@selecteg.com', Role: 'Employee', DepartmentId: 'd1', Status: 'Active' },
];

const PENDING = [
  { RequestId: 'req-101', EmployeeName: 'Maya ', Amount: 8787, Reason: 'Client lunch meeting', Status: 'Pending', DateRequested: '2026-08-16T12:21:33' },
  { RequestId: 'req-102', EmployeeName: 'Ahmed Hassan', Amount: 1200, Reason: 'Office supplies', Status: 'Pending', DateRequested: '2026-08-15T09:30:00' },
];

const APPROVED = [
  { RequestId: 'req-103', EmployeeName: 'Sara Ali', Amount: 300, Reason: 'Taxi fare', Status: 'Approved', DateRequested: '2026-08-10T08:00:00' },
];

const REJECTED = [
  { RequestId: 'req-104', EmployeeName: 'Maya ', Amount: 5678, Reason: 'Late submission', Status: 'Rejected', DateRequested: '2026-08-14T11:00:00' },
];

const ADMIN_ONLY_ACTIONS = new Set(['Data/Departments', 'Admin/GetEmployeeProfile', 'Admin/GetProfile']);

function fakeToken() {
  const payload = {
    nameid: 'm1',
    email: 'manager@selecteg.com',
    unique_name: 'Manager',
    exp: 4102444800,
  };
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`;
}

function seed(page, locale) {
  return page.addInitScript(
    ({ code, token }) => {
      localStorage.setItem('vertex-locale', code);
      localStorage.setItem('theme-mode', JSON.stringify({ state: { locale: code }, version: 0 }));
      localStorage.setItem('auth-token', token);
      localStorage.setItem(
        'pretty-cash-session',
        JSON.stringify({
          state: {
            user: {
              id: 'm1', name: 'Manager', email: 'manager@selecteg.com', avatar: '',
              role: 'Manager', department: 'Sales', status: 'active', userRole: 'manager',
              createdAt: '', updatedAt: '',
            },
            isAuthenticated: true,
            role: 'manager',
            sessionExpiresAt: Date.now() + 3600000,
          },
          version: 0,
        }),
      );
    },
    { code: locale.code, token: fakeToken() },
  );
}

function mockApi(page, calledActions) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  };
  return page.route('**/api/execute', async (route) => {
    let data = [];
    let status = 200;
    let message = '';
    try {
      const body = route.request().postDataJSON();
      const action = body?.Action ?? '';
      calledActions.add(action);
      if (action === 'Data/Users') data = USERS;
      else if (action === 'Manager/GetPendingRequests') data = PENDING;
      else if (action === 'Manager/GetApprovedRequests') data = APPROVED;
      else if (action === 'Manager/GetRejectedRequests') data = REJECTED;
      else if (ADMIN_ONLY_ACTIONS.has(action)) {
        status = 403;
        message = 'Forbidden';
      } else data = [];
    } catch {
      data = [];
    }
    await route.fulfill({
      status,
      contentType: 'application/json',
      headers: corsHeaders,
      body: JSON.stringify({ StatusCode: status === 200 ? 0 : status, Message: message, Data: data }),
    });
  });
}

async function checkOverflow(page) {
  return page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('main *').forEach((el) => {
      const sw = el.scrollWidth;
      const cw = el.clientWidth;
      const cs = getComputedStyle(el);
      if (sw - cw > 0.5 && cs.overflowX === 'visible') {
        bad.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), sw, cw });
      }
    });
    return {
      docScroll: document.documentElement.scrollWidth,
      bodyScroll: document.body.scrollWidth,
      bad,
    };
  });
}

async function main() {
  const browser = await chromium.launch();
  const results = [];
  let failed = 0;

  for (const locale of LOCALES) {
    for (const width of WIDTHS) {
      const scenario = `${locale.code}@${width}`;
      const errors = [];
      const calledActions = new Set();
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      try {
        await seed(page, locale);
        await mockApi(page, calledActions);
        await page.goto(`${BASE}/manager/employees`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(600);

        try {
          await page.locator('[data-testid="MoreHorizOutlinedIcon"]').first().waitFor({ state: 'visible', timeout: 20000 });
        } catch {
          // rows never appeared; fall through to report
        }

        const rows = await page.locator('[data-testid="MoreHorizOutlinedIcon"]').count();
        if (rows < 3) errors.push(`expected >=3 employee rows, got ${rows}`);

        const mainText = await page.locator('main').innerText().catch(() => '');
        const deptWord = locale.code === 'ar' ? 'القسم' : 'Department';
        if (mainText.includes(deptWord)) errors.push('department column/filter still visible');

        const buttons = await page.locator('main button').allInnerTexts();
        if (buttons.some((b) => /add|إضافة/i.test(b))) errors.push('Add button found (admin-only control)');
        if (await page.locator('.MuiFab-root').count() > 0) errors.push('FAB found (admin-only control)');
        if (await page.locator('.MuiTabs-root').count() > 0) errors.push('Tabs found (admin-only control)');

        if (locale.code === 'ar') {
          const dir = await page.evaluate(() => document.documentElement.dir);
          if (dir !== 'rtl') errors.push(`expected rtl dir, got ${dir}`);
        }

        if (rows > 0) {
          await page.locator('[data-testid="MoreHorizOutlinedIcon"]').first().click();
          await page.waitForTimeout(300);
          if (await page.locator('[data-testid="employee-action-view"]').count() === 0) errors.push('View Profile action missing');
          for (const id of ['employee-action-edit', 'employee-action-department', 'employee-action-status', 'employee-action-promote', 'employee-action-delete']) {
            if (await page.locator(`[data-testid="${id}"]`).count() > 0) errors.push(`${id} visible (admin-only action)`);
          }

          await page.locator('[data-testid="employee-action-view"]').click();
          await page.waitForTimeout(500);
          const dialog = page.locator('[role="dialog"]');
          if (await dialog.count() === 0) errors.push('profile dialog did not open');
          else {
            const dialogText = await dialog.innerText().catch(() => '');
            if (!dialogText.includes('req-102')) errors.push('manager-scoped transactions missing (req-102)');
            if (dialogText.includes('req-101')) errors.push('transactions from another employee leaked in (req-101)');
            if (dialogText.includes(deptWord)) errors.push('department row visible in dialog');
            const idWord = locale.code === 'ar' ? 'معرّف الموظف' : 'Employee ID';
            if (dialogText.includes(idWord)) errors.push('employee ID row visible in dialog');
            if (dialogText.includes('u1')) errors.push('raw employee id visible in dialog');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
          }
        }

        for (const action of ADMIN_ONLY_ACTIONS) {
          if (calledActions.has(action)) errors.push(`admin-only endpoint called: ${action}`);
        }

        const overflow = await checkOverflow(page);
        if (overflow.docScroll > width + 0.5) errors.push(`doc overflow: ${overflow.docScroll} > ${width}`);
        if (overflow.bodyScroll > width + 0.5) errors.push(`body overflow: ${overflow.bodyScroll} > ${width}`);
        if (overflow.bad.length > 0) {
          errors.push(`overflow elements: ${JSON.stringify(overflow.bad.slice(0, 3))}`);
        }

        if (width === 1280) {
          await page.screenshot({ path: `e2e/screenshots/manager-employees-${locale.code}-${width}.png`, fullPage: true });
        }
      } catch (err) {
        errors.push(String(err).slice(0, 300));
      }
      await page.close();

      const ok = errors.length === 0;
      if (!ok) failed++;
      results.push({ scenario, ok, errors });
      console.log(`${ok ? 'PASS' : 'FAIL'} ${scenario}${errors.length ? ' -> ' + errors.join(' | ') : ''}`);
    }
  }

  await browser.close();
  console.log(`\n${results.length - failed}/${results.length} scenarios passed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
