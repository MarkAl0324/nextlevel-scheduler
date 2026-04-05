# Page Designs — MA Scheduler
# Created: 2026-04-05

---

## User Journeys

**Staff Manager:**
`/` (passcode) → `/schedule` (overview) → `/admin` (edit schedule / assign providers) → `/admin/mas` or `/admin/providers`

**Medical Assistant:**
`/` (passcode) → `/schedule` (see the month) → `/swaps` (post or accept a swap request)

---

## Navigation (Sidebar — all logged-in pages)

```
[Logo — MA Scheduler]
────────────────
📅  Schedule
🔄  Swap Requests
────────────────
⚙️  Admin          ← visible to staff only
────────────────
🔒  Lock / Log out
```

Active item: teal left border + teal text. Inactive: slate gray.
On mobile: sidebar collapses to a bottom tab bar (Schedule, Swaps, Admin).

---

## Pages

---

### `/` — Passcode Entry

```
Layout: Centered card, no sidebar
─────────────────────────────────────
          [Logo / App Name]
          MA Scheduler

  ┌──────────────────────────────┐
  │                              │
  │   Enter this month's code    │
  │                              │
  │   [  _ _ _ _ _ _           ] │  ← Input, large text, centered
  │                              │
  │        [ Enter →  ]          │  ← Primary button, full width
  │                              │
  └──────────────────────────────┘

  "Contact your manager if you don't have the code."
─────────────────────────────────────
```

- No nav, no footer. Card only.
- Wrong code: red border on input + "Incorrect code. Try again."
- Correct code: redirect to `/schedule`

---

### `/schedule` — Monthly Schedule Grid

```
Layout: Sidebar + full-width content area
─────────────────────────────────────
SIDEBAR  │  MAIN CONTENT
         │
         │  [← April 2026]  [May 2026 ▾]  [June 2026 →]
         │
         │  ┌─────────────────────────────────────────────────┐
         │  │ Date  │ DOW  │ Provs │ MAs │Tricia│Jenne │Raffy │...│
         │  ├───────┼──────┼───────┼─────┼──────┼──────┼──────┼───┤
         │  │ 5/4   │ Mon  │   7   │  7  │[Dr.X]│      │[Lily]│   │
         │  ├───────┼──────┼───────┼─────┼──────┼──────┼──────┼───┤
         │  │ 5/5   │ Tue  │   8   │  8  │[Dr.Y]│[Dr.X]│      │   │
         │  └───────┴──────┴───────┴─────┴──────┴──────┴──────┴───┘
         │
         │  Row left border = staffing status color
         │  Cell = provider name badge (teal), or "—" if off
         │  Hover on cell: tooltip with MA name + provider
         │
         │  LEGEND  ● Balanced  ● Too few MAs  ● Overstaffed  ● Prov imbalance
─────────────────────────────────────
```

- Month navigation: prev/next arrows + month dropdown
- Empty state: "No schedule has been set for this month. Contact your manager."
- Loading state: skeleton rows

---

### `/swaps` — Swap Request Board

```
Layout: Sidebar + content (two columns on desktop, stacked on mobile)
─────────────────────────────────────
SIDEBAR  │  MAIN CONTENT
         │
         │  SWAP REQUESTS — May 2026
         │                              [ + Post a Request ]
         │
         │  ── OPEN REQUESTS ─────────────────────────────
         │
         │  ┌────────────────────────────────────────────┐
         │  │  Jenne                      [1:1 Swap] ●   │
         │  │  May 17, 2026 (Tuesday)                    │
         │  │  "Looking to swap this day"                │
         │  │                              [ Accept ]    │
         │  └────────────────────────────────────────────┘
         │
         │  ┌────────────────────────────────────────────┐
         │  │  Raffy                   [Leave Request] ● │
         │  │  May 23, 2026 (Monday)                     │
         │  │  "Need this day off — personal reason"     │
         │  │                              [ Accept ]    │
         │  └────────────────────────────────────────────┘
         │
         │  ── MY REQUESTS ────────────────────────────────
         │  [You haven't posted any requests yet.]
─────────────────────────────────────
```

**Post a Request modal:**
```
  Date: [Date picker]
  Type: ( ) 1:1 Swap   ( ) Leave Request
  Note: [Optional text input]
  [ Cancel ]  [ Submit Request ]
```

**Accept flow:**
- 1:1 swap: confirms immediately, updates schedule
- Leave request: checks if staffing remains balanced. If yes → auto-approved. If no → shows warning "This will leave the day understaffed. Proceed anyway?"

---

### `/admin` — Schedule Builder

```
Layout: Sidebar + full-width content
─────────────────────────────────────
SIDEBAR  │  MAIN CONTENT
         │
         │  BUILD SCHEDULE
         │  Month: [ May 2026 ▾ ]          [ Save Schedule ]
         │
         │  ┌──────┬──────┬────────┬────────┬────────┬────────┐
         │  │ Date │ DOW  │ Tricia │ Jenne  │ Raffy  │ Franz  │
         │  ├──────┼──────┼────────┼────────┼────────┼────────┤
         │  │ 5/4  │ Mon  │[Dr.X ▾]│[ Off  ]│[Dr.Y ▾]│[Dr.Z ▾]│
         │  ├──────┼──────┼────────┼────────┼────────┼────────┤
         │  │ 5/5  │ Tue  │[Dr.Y ▾]│[Dr.X ▾]│[ Off  ]│[ Off  ]│
         │  └──────┴──────┴────────┴────────┴────────┴────────┘
         │
         │  Each cell = Select dropdown: provider names + "Off"
         │  Staffing count auto-calculates per row (right side)
         │  Row turns red if MAs count < Providers count
─────────────────────────────────────
```

- Save Schedule: saves all entries as ScheduleEntry rows in DB
- Unsaved changes indicator: "You have unsaved changes" banner

---

### `/admin/mas` — Manage Medical Assistants

```
Layout: Sidebar + centered narrow content
─────────────────────────────────────
SIDEBAR  │
         │  MANAGE MEDICAL ASSISTANTS          [ + Add MA ]
         │
         │  ┌────────────────────────────────────────────┐
         │  │  Tricia                          [ Edit ]  │
         │  │  Jenne                           [ Edit ]  │
         │  │  Karylle                         [ Edit ]  │
         │  │  Raffy                           [ Edit ]  │
         │  │  Jobelle                         [ Edit ]  │
         │  │  Ramier                          [ Edit ]  │
         │  │  Trecsie                         [ Edit ]  │
         │  │  Franz                           [ Edit ]  │
         │  │  Juliana                         [ Edit ]  │
         │  │  Kathleya                        [ Edit ]  │
         │  │  Gabbi                           [ Edit ]  │
         │  │  Nicole                          [ Edit ]  │
         │  └────────────────────────────────────────────┘
─────────────────────────────────────
```

- Edit inline: name field replaces text, [ Save ] [ Cancel ] appear
- Add MA: input row appends to bottom of list
- No delete (to preserve schedule history) — deactivate instead

---

### `/admin/providers` — Manage Providers

Same layout as `/admin/mas`. Same inline edit behavior.

---

## Responsive Notes

| Page | Mobile behavior |
|------|----------------|
| `/` | Card fits naturally — no changes needed |
| `/schedule` | Grid too wide to show all MAs — show logged-in MA's own schedule as a vertical date list with their provider per day |
| `/swaps` | Single column, cards stack vertically. Post button stays fixed at bottom. |
| `/admin` | Admin is staff-only — desktop assumed, not a mobile-priority page. Show warning banner if viewed on mobile: "Schedule builder works best on desktop." |
| `/admin/mas` + `/admin/providers` | List stacks naturally — works fine on mobile |
