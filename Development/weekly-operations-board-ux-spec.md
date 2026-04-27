# Weekly Operations Board UI/UX Spec

## Purpose

The weekly operations board is the default schedule surface. It replaces the current summary-card schedule page with a staff-first view that makes the weekly staffing picture visible without spreadsheet scanning.

The board should answer four questions immediately:

- Who is scheduled?
- Who needs coverage?
- What is blocked?
- What needs approval?

## Audience

Primary audience for this slice: staff and managers coordinating the weekly schedule.

Secondary audience: workers reviewing where they are assigned and whether anything needs attention.

## Layout

### Top Bar

The top area should include:

- Page title: `Week`
- Week range
- View controls for week, month, and matrix views
- Compact summary metrics:
  - understaffed days
  - overstaffed days
  - pending requests
  - blocked items

### Main Board

The board is a dense table-like grid:

- Rows are workers.
- Columns are days.
- Day headers show weekday, date, provider count, worker count, and balance state.
- Cells show provider assignment, unassigned assignment, or off day.
- Cells may show a status marker such as `Pairing conflict` or `Needs coverage`.

The board should be horizontally scrollable on smaller screens rather than collapsing into cards.

### Action Queue

The action queue sits beside or below the grid depending on available space.

It should show:

- pending swap or coverage requests;
- blocked provider-to-worker pairing conflicts;
- understaffed days;
- urgent notes that need staff attention.

Each item should include a type label, short title, supporting detail, and link when there is a relevant schedule day or request detail.

## Visual Feel

The board should feel:

- dense but readable;
- calm;
- operational;
- closer to a structured staffing matrix than a SaaS marketing dashboard.

Use:

- flat tables and grids;
- thin borders;
- compact row heights;
- muted backgrounds;
- color only for status and exceptions.

Avoid:

- large cards for each day;
- heavy shadows;
- gradient panels;
- hover-lift effects;
- prototype or demo copy.

## Status Labels

Use these labels consistently:

- `Balanced`
- `Understaffed`
- `Overstaffed`
- `Needs coverage`
- `Pending approval`
- `Blocked`
- `Pairing conflict`
- `Off`
- `Unassigned`

Every color state must also have text. Color alone is not enough.

## Completion Criteria

The first implementation is successful when:

- staff can understand the week without opening each day;
- under/overstaffed days are visible in day headers;
- worker assignments appear in the grid;
- pending or blocked work appears in an action queue;
- existing month, matrix, and roster views remain reachable;
- product-facing UI avoids `demo`, `MVP`, `prototype`, and `next step` language.

