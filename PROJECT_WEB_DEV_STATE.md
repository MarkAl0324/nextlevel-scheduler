# Project web development state

---

## Meta

| Field | Value |
|--------|--------|
| Last updated | 2026-04-08 |
| Active phase | Implement |
| Decision log version | 1 |

---

## Product

**Goal**: Web app scheduler for the company Next Level that makes time-off possible by supporting coverage/swaps, while honoring provider staffing constraints.

**Primary users**:

- Employees (create/view schedule, offer shifts for coverage, request swaps)
- Managers/schedulers (approve/assign, resolve conflicts, manage rules)
- Providers (view their schedule; optional in MVP)

**Must-haves (MVP)**:

- Auth (at least basic role separation: employee vs manager) — can start simple but must exist before real use
- Schedule creation + viewing in **table view** and **calendar view**
- Coverage feature: **swap board** where employees can post shifts/dates for swap, receive proposals, and accept/decline (with an audit trail)
- Provider rule: for each provider/day, the correct medical assistant is assigned (or conflicts are flagged)
- Staffing balance metric: easy to see, per day, whether **#Providers vs #MAs** is balanced (under/over staffed)

**Non-goals / out of scope (v1)**:

- Payroll/timeclock integration
- Complex optimization/auto-scheduling
- Patient data / clinical documentation

**Success metrics**:

- Employees can reliably get coverage for time off without manager back-and-forth
- Conflicts (double-booking, provider missing assistant) are prevented or clearly flagged
- Schedule changes are auditable (who changed what, when)
- Managers can quickly spot days that are under-staffed or over-staffed (providers vs MAs) and correct them

---

## UX / IA

**Key user flows (Employee / MA)**:

- Sign in → land on Schedule (company-wide) → switch between Week Calendar and Daily Roster table.
- Click a shift instance (in calendar or roster) → view shift detail.
- Click my shift → “Post for swap” → post appears on Swap Board.
- Browse Swap Board → open a post → propose a swap by selecting one of my shift instances → submit.
- Open “My swaps” → review incoming proposals → accept/decline.
- If accepted: system validates conflicts → applies swap automatically (or hard-blocks with reason).

**Key user flows (Manager / Scheduler)**:

- Sign in → open Admin Schedule → create/edit shift instances (drag/drop or form edit).
- Maintain provider ↔ MA pairing rules (per day) → system hard-blocks invalid assignments.
- Review conflicts dashboard/list → fix schedule until conflicts clear.

**Navigation model (MVP)**:

- Left sidebar:
  - Schedule
  - Swap Board
  - My Swaps
  - Admin (managers only)

**Screen / module inventory (MVP)**:

| Module | Purpose | Notes |
|--------|---------|--------|
| Schedule (Week) | Week calendar view of schedules | Default view; company-wide schedule visible; shows per-day balance indicator |
| Schedule (Roster) | Daily roster table (rows=employees, cols=time or day section) | “Daily roster” table as MVP table view |
| Shift detail (modal/drawer) | View shift instance details and actions | Includes “Post for swap” on owned shifts |
| Swap Board | List of all swap posts | Visible to all MAs; filter by date/provider/location (if applicable) |
| Swap Post detail | View a swap post and propose swap | Propose by selecting one of my shift instances |
| My Swaps | Inbox-style view for my posts + proposals | Tabs: My posts, Incoming proposals, My proposals |
| Admin Schedule | Create/edit shifts; resolve conflicts | Managers only; hard-block invalid states |
| Staffing Balance (Admin) | Day-by-day view of #Providers vs #MAs | Managers only; highlights under/over; links to affected day |
| Provider↔MA Rules | Manage which MA is paired to which provider/day | Managers only; used for hard-block validation |
| Notifications | In-app notification center | Email + in-app for key events (proposal, accept/decline, applied/failed) |

**Dashboard-specific notes**:

- Default density: desktop-first, comfortable density; roster table can support compact mode later.
- Table performance: roster can grow large; plan for virtualization if it becomes slow.
- Calendar view: MVP is **week view**.

**Empty, loading, and error states (MVP)**:

- Schedule: loading skeleton; empty state (“No shifts in this range”); error with retry.
- Swap Board: empty state (“No swap posts yet”); filters too narrow message; error with retry.
- My Swaps: empty state per tab (no posts, no proposals, no outgoing proposals).
- Posting/proposing: hard-block validation messages shown inline (conflict reason, provider pairing violation, hours/week limit).
- Notifications: if email fails, still show in-app; surface “email delivery pending/failed” only to admin logs (later) unless needed.

---

## Architecture

**Stack (MVP)**:

- Web: **Next.js** (App Router) + TypeScript
- UI: React + a component library (TBD during Scaffold; keep accessible defaults)
- Data: **Postgres**
- ORM: Prisma (or equivalent) for schema + migrations (finalize during Scaffold)

**Hosting target (MVP)**:

- App hosting: TBD (can start local-first; choose Vercel/Render later)
- Database hosting: managed Postgres (or local Postgres for development)

**Auth (MVP)**:

- Email/password or SSO later; must support roles:
  - `employee` (medical assistant)
  - `manager`
- Sessions (cookie-based) preferred for Next.js dashboard apps

**Core data model (day-level scheduling, no times in MVP)**:

- `User` (auth identity)
- `EmployeeProfile` (role=MA, name, optional location/team)
- `Provider` (doctor)
- `WorkDay` (date; optional location)
- `ProviderWorkDay` (provider scheduled on a date; used for provider count metric)
- `Assignment` (MA assigned on a date; links to ProviderWorkDay when applicable)
- `ProviderMaRule` (the “correct MA for provider on specific days” rule source)
- `SwapPost` (owner assignment offered for swap; status fields)
- `SwapProposal` (proposer + offered assignment; status fields)
- `AuditEvent` (who changed what/when for schedule and swaps)
- `Notification` (in-app notifications; email sent as side effect)

**Validation (hard-block rules)**:

- Swap applies only if:
  - Both assignments exist and are in the future
  - After swap, no MA has conflicting assignments on the same date
  - Weekly-hours limit checks pass (needs a configured weekly “hours per day” assumption, since MVP is date-only)
  - Provider↔MA constraints remain valid (rule-based hard-block)

**Staffing balance metric (MVP)**:

- For each date:
  - `providers_scheduled = count(ProviderWorkDay)`
  - `mas_scheduled = count(Assignment)`
  - `delta = mas_scheduled - providers_scheduled` (negative = under-staffed, positive = over-staffed)
- Show this delta on Week Schedule headers and in the Admin Staffing Balance view.

**Env strategy**:

- Local dev uses `.env.local`
- Minimum env vars:
  - `DATABASE_URL`
  - `AUTH_SECRET` (or equivalent)
  - Email provider creds (only if enabling email in MVP)
- Later: CI/prod secrets managed by host (no committing secrets)

---

## Repo map

_Populated during Scaffold._

| Area | Path | Notes |
|------|------|--------|
| UI | `apps/web/src/app/` | Next.js App Router |
| API / server | `apps/web/src/app/api/` | Next.js route handlers (planned) |
| DB schema | `apps/web/prisma/schema.prisma` | Prisma schema (Postgres) |
| Tests | `apps/web/` | TBD (add during Implement) |

**Important commands**:

- Install: `cd apps/web; npm install`
- Dev: `cd apps/web; npm run dev`
- Build: `cd apps/web; npm run build`
- Lint: `cd apps/web; npm run lint`
- Prisma generate: `cd apps/web; npx prisma generate`
- Migrate (dev): `cd apps/web; npx prisma migrate dev`

---

## Quality bar

_To be filled before Verify._

---

## Verification

**Automated**: _TBD_

**Browser MCP certified flows**:

| Flow | URL | Last verified |
|------|-----|--------------|
| | | |

---

## Next actions

- [x] Define the coverage model: “offer shift” vs “swap”, required approvals, and the exact states + transitions.
- [x] Write down swap board states + transitions (MVP) and what can/can’t be swapped.
- [x] List MVP roles/permissions (employee, manager) and what each can do.
- [x] Design_UX_IA: draft key flows + screen/module inventory for calendar/table + swap board + manager admin.
- [x] Move to **Architecture** phase: choose stack + hosting + data model for shifts/swaps/provider rules.
- [x] Scaffold: add Postgres + Prisma, and create `.env.example` for `DATABASE_URL` and auth secret.
- [x] Scaffold → Implement gate: ensure `dev` runs and repo map/commands are accurate; then pick first vertical slice.
- [x] Implement slice 1: Schedule week view + per-day staffing balance indicator (#Providers vs #MAs) using seeded demo data.
- [x] Implement slice 2: Daily roster (table view) for a selected date, backed by the same demo dataset.
- [x] Implement slice 3: Swap Board list view (demo posts) + post detail page skeleton.
- [x] Implement slice 4: “Propose swap” UX on post detail (select my shift instance) + conflict hard-block messaging (still demo data).
- [x] Implement slice 5: “My Swaps” inbox (my posts + incoming proposals + my proposals) using demo data.
- [x] Implement slice 6: Admin staffing balance view (day-by-day providers vs MAs) and drilldown to roster.
- [x] Implement slice 7: Provider↔MA rules admin screen (demo) + show hard-block reason patterns.
- [x] Implement slice 8: Use provider↔MA rules in swap validation (demo) and surface the hard-block reason in the Propose swap UX.
- [x] Implement slice 9: Accept/decline proposal flow (demo state changes) + surface accept-time validation errors.
- [x] Implement slice 10: Persist swaps in Postgres (Prisma models + migrations) and replace demo data with DB reads for schedule + swaps.
- [ ] **CURRENT:** Polish schedule UX: add Month calendar + roster drawer, and a weekly roster matrix table view.
- [ ] After schedule UX: bring auth/roles online (employee vs manager) and gate Admin routes.

---

## Open questions / blockers

- Confirm day-level scheduling assumption: **day-level only** (no times).
- Does “coverage” require manager approval, or is it self-service within rules?
- Provider rule enforcement: do we hard-block creating assignments that violate provider→MA pairing, or just flag on manager screens?
- Are employees ever allowed to swap into a provider assignment day they aren’t paired with (hard no per current decision)?

---

## Coverage / swap board (MVP spec)

**Object**: Swap post (created by an employee for a specific dated shift).

**Swap post fields (minimum)**:

- Owner employee
- Target shift instance (date, start/end, location, role)
- Optional note (“need off for appointment”)
- Expiration (optional)

**States**:

- Draft (optional; if we want “preview before posting”)
- Posted (visible on swap board)
- Proposed (one or more proposals exist)
- Accepted (one proposal accepted; swap is pending enforcement)
- Completed (schedule updated)
- Cancelled (owner removed the post)
- Expired (auto-closed)

**Transitions (core)**:

- Owner: Create → Post (Draft → Posted)
- Other employee: Propose swap (Posted → Proposed; can accumulate multiple proposals)
- Owner: Accept proposal (Proposed → Accepted)
- System: Apply swap (Accepted → Completed) OR fail with conflict (Accepted → Proposed with reason)
- Owner: Cancel (Posted/Proposed → Cancelled)
- System: Expire (Posted/Proposed → Expired)

**Proposal (minimum)**:

- Proposer employee
- Offered shift instance they are willing to trade (date, start/end, location, role)
- Status: Pending / Withdrawn / Declined / Accepted

**Rules (MVP)**:

- Swaps are **shift instances only** (dated shifts); no “request coverage for a date” without a shift.
- No extra constraints beyond role: any **medical assistant ↔ medical assistant** swap is allowed **as long as it does not create conflicts**.
- Invalid swaps are **hard-blocked** (cannot accept/apply if either side conflicts after swap).
- Provider staffing constraint is treated as a conflict: after swap, each provider/day must still have the correct assigned medical assistant; otherwise the swap is invalid.

---

## Roles & permissions (MVP)

### Employee (Medical Assistant)

- View own schedule (calendar + table)
- Create a swap post for one of their **future** shift instances
- Browse swap board
- Propose a swap using one of their **future** shift instances
- Accept/decline proposals on their own swap posts
- Cancel their own swap post
- Cannot directly edit other employees’ shifts

### Manager / Scheduler

- Create/edit shift instances for any employee
- Maintain provider ↔ MA assignment rules (which MA is paired to which provider on which days)
- Resolve conflicts by editing the schedule (no “force override” in MVP unless added later)
- Moderate swap board (remove posts if needed)

---

## Decision log (append-only)

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-08 | MVP uses a swap board (post → propose → accept) | Matches how employees request date swaps and enables coverage |
| 2026-04-08 | Swaps are shift-instance only; MA↔MA only; hard-block conflicts | Keep rules simple and prevent unsafe scheduling outcomes |
