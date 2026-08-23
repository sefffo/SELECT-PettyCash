# Investigation Report: "Pending" Employee Requests Not Visible on Manager Dashboard

> Investigation only — no code was modified. All findings verified against the live API
> (`https://pcapi.selecteg.com`) using the project's test accounts
> (`menna@company.com / 555555` Employee, `youssef@company.com / 5555` Manager).

---

## 1. Working NEW request (evidence)

| Field | Value |
|---|---|
| RequestId | `0e72ddb7-f160-4ccc-9048-591a39c8667f` |
| Status | `PendingManager` (backend raw value) |
| RequestType | `Reimbursement` (from `Employee/GetExpenses`) |
| Amount / Currency | 22 / EGP |
| Submitted | 2026-08-18T15:42 |

Why it appears on the Manager Dashboard: the backend routed it to the **department manager** (status `PendingManager`). It is in that manager's queue and in his `Manager/GetPendingRequests` response. It is **NOT** in the global queue (`Data/PendingRequests`).

## 2. Problematic EXISTING requests (evidence)

| Field | Request A | Request B |
|---|---|---|
| RequestId | `089e14d5-877f-485b-8641-a432a278ac90` | `d0db010b-40fb-48f0-8bdc-99f56585563a` |
| Status | `Pending` (raw) | `Pending` (raw) |
| RequestType | `Advance` | `Advance` |
| Amount / Currency | 3000 / EGP (expense view), **SAR** (global queue) | 3000 / EGP (expense view), **SAR** (global queue) |
| Reason | "Office supplies and printer ink" | "Office supplies and printer ink" |
| Submitted | 2026-08-18T15:12 | 2026-08-18T14:25 |

Where they appear: `Employee/GetMyRequests` (employee), `Employee/GetExpenses` (employee), `Dashboard/Employee` (PendingRequestsCount = 2), and **`Data/PendingRequests` (global queue) — the exact list powering the Admin Requests page and all Finance dashboard/queues**.
Where they do NOT appear: `Manager/GetPendingRequests`, `Manager/GetApprovedRequests`, `Manager/GetRejectedRequests` — all return **empty/absent for these IDs**, with no "New Request" notification generated for any manager.

## 3. API comparison

| | Employee source | Manager source | Global queue |
|---|---|---|---|
| Action | `Employee/GetMyRequests` | `Manager/GetPendingRequests` | `Data/PendingRequests` |
| Files | `src/api/requests.api.ts:9`, hook `useMyRequests` (`src/hooks/api.ts:184`) | `src/api/manager.api.ts:5`, hook `useManagerPendingRequests` | `src/api/requests.api.ts:5` |
| Query key | `['my-requests']` | `['manager-requests','pending']` | `['pending-requests']` |
| Returns | RequestId, Amount, Description, Status, SubmittedAt | ManagerRequestItem (EmployeeName, Amount, Reason, Status, DateRequested…) | + CurrencyCode, EmployeeName, DateRequested |
| Filtering | none (all of the employee's) | **department-scoped by token** (403 for employees: "Only managers can view these requests."; `{DepartmentId: menna's}` returns empty) | global, role-gated (Admin/Manager) |

No frontend filtering hides anything — the manager dashboard renders `Manager/GetPendingRequests` as-is. The empty list comes from the backend.

## 4. OLD vs NEW comparison (field-by-field)

| Field | New working (`0e72ddb7`) | Old missing (`089e14d5`) | Old missing (`d0db010b`) |
|---|---|---|---|
| Status | `PendingManager` | `Pending` | `Pending` |
| RequestType | Reimbursement | Advance | Advance |
| In manager queue | Yes (Yassin's) | No | No |
| In global/Finance queue | No | **Yes** | **Yes** |
| Assigned manager | Department manager (Yassin) | **None** | **None** |
| Notifications | – | None for any manager | None for any manager |

## 5. Where the old Pending requests actually went

**Two separate destinations — both verifiable:**

1. **The 2 raw-`Pending` requests went to the Finance/Admin global queue** (`Data/PendingRequests`, "Pending requests retrieved successfully", exactly these 2 records). They were never assigned to any manager — there is no manager assignment, no manager notification, and no manager API returns them. They are pending in the **general queue**, not at a manager.

2. **All `PendingManager` requests are sitting at Yassin's stage — not lost.** Users data shows two managers: **Yassin = Manager of department `07f248c5`** (Menna's department — Farida's, Finance's, anas's too), **Youssef = Manager of department `30e19ad7`** (Maya's). Menna's notifications prove Yassin is her approver ("Rejected by **Yassin**", "Approved by **Yassin**"). Youssef's queue/notifications contain only Maya/Koko (his department). So `Manager/GetPendingRequests` is **department-scoped**, and Menna's requests will **never** appear on Youssef's dashboard — by design.

## 6. Root cause (classified)

- For the **`PendingManager` requests**: **B — assigned to a different manager (Yassin, Menna's department manager), not Youssef.** This is correct backend behavior; the Manager Dashboard being checked belongs to another department. (Also notable: Yassin's account rejected all login attempts with unknown password / "Password is required" — even if requests wait at his stage, they may be unprocessable in practice.)
- For the **2 raw-`Pending` requests**: **F — requests exist but are not assigned/routed to a manager.** They sit in the global Admin/Finance queue (`Data/PendingRequests`) with `Pending` status and were created via a path that bypassed manager assignment (both are `Advance`, submitted between two normally-routed requests, with `CurrencyCode: SAR` while the current frontend always sends EGP — consistent with an older/external client or a backend routing gap).

There is **no frontend bug**: no frontend filter hides them, and no frontend change can make department-scoped manager APIs return another department's requests.

## 7. Recommended fix (decision needed)

- **Confirm the intended flow first (backend question):** should *every* Advance go to the department manager? If yes, the 2 `Pending` requests are backend orphans (routing gap on submission) → **backend fix**: route them to the department manager on submit (and/or add an Admin action to assign/route unassigned pending requests; reset Yassin's password so his queue is actionable).
- If instead the flow is "Advances → manager, Reimbursements → Finance", then those 2 requests are correctly in the Finance queue and the only "problem" is that the checked Manager account (Youssef) is the wrong department's manager — **no code change needed**, just test with Yassin.
- **Frontend: nothing to fix** to surface these on a manager dashboard; if you want visibility in the UI, the data contract is what's missing (see `EmployeeRequestItem` — it has no `CurrencyCode`, `RequestType`, or manager field, but `Employee/GetExpenses` and `Data/PendingRequests` already return those).

To fully close it, verify with two accounts: **log in as Yassin** (needs his password) — his pending queue should contain all `PendingManager` requests; and **log in as Finance** (`finance@company.com`) — the global queue should contain the 2 `Pending` requests.
