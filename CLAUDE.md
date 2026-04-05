# CLAUDE.md — NextLevel Scheduler
# Created: 2026-04-05

## What This Project Is
An internal scheduling web app for a healthcare company's Medical Assistant (MA) team. It replaces a messy Google Sheet with a clear monthly schedule grid showing which MA is paired with which provider each day. MAs can post and accept shift swap requests through a swap board. Staff manages the schedule.

## Target Audience
- **Staff Manager** — builds the monthly schedule, assigns MAs to providers
- **Medical Assistants (~12-14)** — view their schedule, post/accept swap requests
- Low technical comfort. Simple, fast, obvious UI required.

## MVP Features (Tier 1)
- [ ] Passcode login (monthly rotating, one code for all users)
- [ ] Monthly schedule grid (MA × day, with provider assignment per cell)
- [ ] Auto staffing status per day (balanced / too few MAs / overstaffed / provider imbalance)
- [ ] Swap request board (post date, accept swap, enforces 1:1 vs leave-day rules)
- [x] Staff admin: build/edit schedule, assign providers
- [x] MA + Provider list management

## Pages
| Page | Purpose | Protected |
|------|---------|-----------|
| `/` | Passcode entry | No |
| `/schedule` | Monthly schedule grid | Yes |
| `/swaps` | Swap request board | Yes |
| `/admin` | Build/edit schedule, assign providers | Yes (staff) |
| `/admin/mas` | Manage MA list | Yes (staff) |
| `/admin/providers` | Manage provider list | Yes (staff) |

## Data Model
```
MA: id, name
Provider: id, name
Passcode: id, code, valid_month (e.g. "2026-05")
ScheduleEntry: id, date, ma_id, provider_id (nullable), notes
SwapRequest: id, requester_ma_id, date, status (open/accepted/closed), accepted_by_ma_id, swap_type (1:1 or leave)
```

## Tech Stack
- Framework: Next.js 14 (App Router)
- Styling: Tailwind + shadcn/ui
- Database + Auth: Supabase
- Deployment: Vercel

## Design Reference
- Primary color: `#066880` (teal — extracted from nextlevelurgentcare.com)
- Background: `#FFFEF9` (warm off-white)
- Full design system: see `DESIGN_SYSTEM.md`
- Page wireframes: see `DESIGN_PAGES.md`

## Environment Variables Needed
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Current Status
Phase: Feature build in progress. Next: Monthly schedule grid (/schedule).
Last updated: 2026-04-05

## Build Log
- 2026-04-05 — Project created from pipeline template
- 2026-04-05 — Design system extracted from nextlevelurgentcare.com
- 2026-04-05 — Page wireframes completed
- 2026-04-05 — Built MA + Provider list management (/admin/mas, /admin/providers)
- 2026-04-05 — Built Staff Admin schedule builder (/admin)
- 2026-04-05 — Built Monthly Schedule Grid (/schedule)
- 2026-04-05 — Built Auto Staffing Status (lib/staffing.ts, applied to /schedule + /admin)
- 2026-04-05 — Built Swap Request Board (/swaps) with post + accept + close flow
