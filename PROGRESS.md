# PROGRESS.md — NextLevel Scheduler
# Last updated: 2026-04-05

---

## Current Status
**Phase:** COMPLETE — all 6 features built. Ready for /review and /deploy.

---

## Build Order (Full MVP)

| # | Feature | Status |
|---|---------|--------|
| 1 | MA + Provider list management | ✅ Done |
| 2 | Staff admin: build/edit schedule | ✅ Done |
| 3 | Monthly schedule grid (view) | ✅ Done |
| 4 | Auto staffing status per day | ✅ Done |
| 5 | Swap request board | ✅ Done |
| 6 | Passcode login | ✅ Done |

---

## Feature 1: MA + Provider List Management — COMPLETE ✅

| File | Notes |
|------|-------|
| `types/index.ts` | MA, Provider, Passcode, ScheduleEntry, SwapRequest types |
| `lib/constants.ts` | All app routes |
| `app/api/mas/route.ts` | GET, POST |
| `app/api/mas/[id]/route.ts` | PATCH |
| `app/api/providers/route.ts` | GET, POST |
| `app/api/providers/[id]/route.ts` | PATCH |
| `components/admin/MemberList.tsx` | Shared: inline edit, add, deactivate/reactivate |
| `app/(dashboard)/admin/mas/page.tsx` | Server component |
| `app/(dashboard)/admin/providers/page.tsx` | Server component |
| `components/layout/Sidebar.tsx` | startsWith active state, design tokens |
| `app/(dashboard)/layout.tsx` | Schedule / Swap Requests / Admin nav |

---

## Feature 2: Staff Admin Schedule Builder — COMPLETE ✅

| File | Notes |
|------|-------|
| `app/api/schedule/route.ts` | GET ?month=YYYY-MM, POST bulk replace |
| `components/admin/ScheduleBuilder.tsx` | Client grid — native selects, dirty tracking, save |
| `app/(dashboard)/admin/page.tsx` | Server component — loads MAs, providers, entries |

### Key decisions made
- Save strategy: delete all entries for month, then insert non-off rows (clean replace)
- "Off" = no DB row; "Unassigned" = DB row with provider_id = null; Provider = DB row with provider_id
- Weekend rows dimmed but included (clinic may run on weekends)
- Red left border on rows with 0 MAs staffed

---

## Feature 3: Monthly Schedule Grid — COMPLETE ✅

| File | Notes |
|------|-------|
| `app/(dashboard)/schedule/page.tsx` | Server component — loads MAs, providers, entries via Promise.all |
| `components/schedule/ScheduleGrid.tsx` | Client component — read-only grid, month nav, empty state, legend |

### Key decisions made
- `lookup` map keyed `${date}_${ma_id}` → `undefined` = off (no entry), `null` = unassigned, string = provider_id
- Row left border color: green (≥50% staffed), amber (<50%), red (0 MAs)
- Provs count = distinct provider IDs scheduled that day
- Month nav: prev/next arrows + dropdown, both use `router.push`
- Empty state: full-width card with message if `entries.length === 0`
- Legend shown only when entries exist

---

## Feature 4: Auto Staffing Status — COMPLETE ✅

| File | Notes |
|------|-------|
| `lib/staffing.ts` | Pure utility: `getStaffingStatus`, `getStatusBorderClass`, `getStatusLabel`, `getStatusDotColor` |
| `components/schedule/ScheduleGrid.tsx` | Replaced inline border logic, updated legend to use utility |
| `components/admin/ScheduleBuilder.tsx` | Replaced `isUnderstaffed` red-only logic with full status colors |

### Key decisions made
- Status: `balanced` (green) / `overstaffed` (blue) / `prov_imbalance` (amber) / `none` (red)
- `prov_imbalance` = MAs working but some have no provider assigned
- `overstaffed` = more MAs than distinct providers (some providers have 2+ MAs)
- No configured threshold needed — all logic derived from existing data

---

## Feature 5: Swap Request Board — COMPLETE ✅

| File | Notes |
|------|-------|
| `app/api/swaps/route.ts` | GET (all requests desc) + POST (create) |
| `app/api/swaps/[id]/route.ts` | PATCH action: "accept" or "close" |
| `app/(dashboard)/swaps/page.tsx` | Server component — loads MAs + swaps |
| `components/swaps/SwapBoard.tsx` | Client — board layout, modal, accept/close |

### Key decisions made
- "Viewing as" MA selector stored in localStorage — replaced by session in Feature 6
- Accept does NOT auto-modify schedule — manager applies change in /admin
- Open requests = all open requests excluding own; My requests = own
- SwapCard extracted as local component (used in both sections)
- Bug fixed: schedule/page.tsx was importing `createServerClient` instead of `createClient`

---

## Feature 6: Passcode Login — COMPLETE ✅

| File | Notes |
|------|-------|
| `app/page.tsx` | Login page — MA selector + passcode input, no sidebar |
| `components/auth/LoginForm.tsx` | Client form, posts to /api/auth |
| `app/api/auth/route.ts` | POST: validates passcode vs DB, sets session cookie |
| `app/api/auth/logout/route.ts` | POST: clears session cookie |
| `app/api/passcode/route.ts` | GET + POST (upsert) passcodes table |
| `app/(dashboard)/admin/passcode/page.tsx` | Manage monthly passcode |
| `components/admin/PasscodeManager.tsx` | Client form to set/update passcode |
| `middleware.ts` | Replaced Supabase auth with session cookie check |
| `components/layout/Sidebar.tsx` | Added Lock button at bottom |
| `app/(dashboard)/layout.tsx` | Added Passcode nav item |
| `app/(dashboard)/swaps/page.tsx` | Reads session MA, passes to SwapBoard |
| `components/swaps/SwapBoard.tsx` | Hides "Viewing as" when sessionMaId present |

### Template cleanup done
- Deleted `app/(auth)/login/page.tsx`
- Deleted `app/(auth)/register/page.tsx`
- Deleted `app/(dashboard)/dashboard/page.tsx`
- Replaced `app/page.tsx` (template homepage → passcode login)
- Replaced `middleware.ts` (Supabase auth → session cookie)

### Key decisions
- Session cookie: `nextlevel_session = ma_id:month` (httpOnly, sameSite: lax)
- Middleware validates cookie AND checks month = current month (auto-expires each month)
- "Viewing as" selector hidden once session is active; falls back to localStorage pre-auth
- Passcode page at /admin/passcode — upserts by valid_month (one code per month)

---

## BUILD COMPLETE ✅

### What it will do
Read-only view at `/schedule`. MAs see which provider they're paired with each day of the month. Month navigation (prev/next arrows + dropdown).

### Key design rules (from DESIGN_PAGES.md)
- Grid: rows = days, columns = Date / DOW / Provs count / MAs count / [one col per MA]
- Cell = provider name badge (teal) or "—" if off
- Row left border = staffing status color (preview of Feature 4 logic)
- Empty state: "No schedule has been set for this month."
- Loading state: skeleton rows
- Mobile: show simplified vertical list (own schedule only)

### Files to create
- `app/(dashboard)/schedule/page.tsx` — server component, loads data for selected month
- `components/schedule/ScheduleGrid.tsx` — client component (read-only grid + month nav)

### Files to modify
- Nothing structural

---

## Decisions Made

| Decision | Reason |
|----------|--------|
| No delete for MAs/Providers | Preserve schedule history — deactivate instead |
| Passcode login built last | No users yet |
| MemberList is shared | Both admin pages identical in behavior |
| Admin before view (schedule) | Can't view what hasn't been built |
| Save = full replace per month | Simpler than upsert logic, safe for bulk edits |

---

## Template Cleanup Needed (do before final deploy)

- [ ] Delete `app/(auth)/login/page.tsx`
- [ ] Delete `app/(auth)/register/page.tsx`
- [ ] Delete `app/(dashboard)/dashboard/page.tsx`
- [ ] Delete `app/(auth)/` folder entirely
- [ ] Update `middleware.ts` — replace Supabase user auth with cookie session check

---

## Environment Setup Reminder

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

After Feature 6, insert a test passcode:
```sql
INSERT INTO passcodes (code, valid_month) VALUES ('test123', '2026-04');
```
