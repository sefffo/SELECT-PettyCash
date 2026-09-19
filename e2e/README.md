# Petty Cash — End-to-End Test Suite

Playwright suite targeting the **deployed** Petty Cash app and API. No app code is modified;
all waiters/locators work against the real production UI and live endpoints.

- App: `https://pc.selecteg.com` (`E2E_BASE_URL`)
- API: `https://pcapi.selecteg.com/api/execute` (`E2E_API_BASE_URL`)
- Docs: coverage report + per-case mapping → [`coverage/coverage-mapping.md`](coverage/coverage-mapping.md)
- Source of truth test cases: `tsets/test-cases/petty_cash_test_cases (1).html`

## Requirements

- Node 18+; Playwright browsers installed once: `npx playwright install chromium`
- No `.env` needed for the defaults (documented test accounts below), but see
  [`.env.example`](../.env.example) for overrides.

## Run

```sh
# type-check the specs and helpers
npx tsc -p tsconfig.e2e.json --noEmit

# full read-only suite (mutations OFF)
npx playwright test

# a single spec
npx playwright test employee

# including the data-creating scenario specs (mutations ON — changes live data!)
$env:E2E_MUTATIONS = "1"
npx playwright test e2e-scenarios
```

HTML report: `npx playwright show-report` after a run (config also writes a `test-results/` dir).

## What the suite does

- **`login/`** — sign-in UI for all 4 roles, empty/invalid credentials (incl. the
  email-enumeration finding), masking, theme persistence, session expiry, protected routes,
  logout, wrong-role blocking.
- **`auth/`** — live API contract checks: JWT claims, negative logins, SQL injection,
  tampered/forged tokens, no-token checks, envelope casing, unknown actions, and a
  **permissions matrix** (9 forbidden actions per role).
- **`admin/`,`manager/`,`employee/`,`finance/`** — per-role screen rendering and navigation.
- **`e2e-scenarios/`** — full lifecycle flows (advance approve→pay, rejection, user/department/
  grant creation, password change, mark-as-read). These **modify live data** and only run with
  `E2E_MUTATIONS=1`.

## Expected results

88 tests. Default read-only run:

- **71 passed**
- **5 failed — intentional.** They assert the documented security contract that the live
  backend violates (real bugs, details in `coverage/coverage-mapping.md`):
  1. employee token can call `Manager/GetPendingRequests` (HTTP 200)
  2. `Employee/GetWallet` works with no token
  3. `Finance/SafeBalances` works with no token
  4. `Finance/Transactions` works with no token
  5. `TC-AUTH-010` (no-token protected-endpoint contract, fails on `Finance/SafeBalances`)
- **12 skipped** — mutation-gated scenario tests (run with `E2E_MUTATIONS=1`).

## Credentials

Defaults are the project's documented test accounts (all passwords `555555`):

| Role | Email |
|---|---|
| Admin | `farida@company.com` |
| Manager | `youssef@company.com` |
| Finance | `finance@company.com` |
| Employee | `menna@company.com` |

Overridable via `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_MANAGER_*`, `E2E_FINANCE_*`,
`E2E_EMPLOYEE_*` (see `.env.example`).

## Data mutation notes

The mutation specs intentionally create/reject/pay real records and **some side effects persist**
(no delete API exists): created departments persist, a direct grant permanently increases the
employee wallet, `change-password` restores the original password in a `finally` block, and the
admin create-user spec cleans up its own user. Run them against a non-production environment
whenever possible.